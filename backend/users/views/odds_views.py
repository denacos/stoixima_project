
from django.views.decorators.csrf import csrf_exempt
from django.http import JsonResponse
from django.core.cache import cache
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
import requests
import os
import json

# Mapping sport_id -> sport name (based on provided sportsid.txt)
SPORT_ID_MAP = {
    "1": "Soccer",	
    "18": "Basketball",
    "13": "Tennis",	
    "91": "Volleyball",
    "78": "Handball",	
    "16": "Baseball",
    "2": "Horse Racing",	
    "4": "Greyhounds",
    "17": "Ice Hockey",	
    "14": "Snooker",
    "12": "American Football",	
    "3": "Cricket",
    "83": "Futsal",	
    "15": "Darts",
    "92": "Table Tennis",	
    "94": "Badminton",
    "8": "Rugby Union",	
    "19": "Rugby League",
    "36": "Australian Rules",	
    "66": "Bowls",
    "9": "Boxing",	
    "75": "Gaelic Sports",
    "90": "Floorball",	
    "95": "Beach Volleyball",
    "110": "Water Polo",		
    "107": "Squash",
    "151": "E-sports",	
    "162": "MMA",
    "148": "Surfing" 
}


@csrf_exempt
def fetch_betsapi_sports(request):
    api_key = os.environ.get("BETS_API_KEY")
    url = f"https://api.b365api.com/v1/bet365/sports?token={api_key}"
    try:
        response = requests.get(url)
        data = response.json()
        return JsonResponse(data, safe=False)
    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

@csrf_exempt
def get_live_matches(request):
    token = os.getenv("BETS_API_KEY")
    url = f"https://api.b365api.com/v1/bet365/inplay?token={token}"
    try:
        response = requests.get(url)
        data = response.json()
        results = data.get("results", [])
        matches = []
        for group in results:
            if not isinstance(group, list):
                continue
            for match in group:
                matches.append({
                    "id": match.get("ID") or match.get("id"),
                    "type": match.get("type"),
                    "sport": match.get("NA", "Unknown"),
                    "league": match.get("L3", ""),
                    "info": match.get("MR", "")[:80],
                    "header": match.get("HM", "")[:80],
                })
        return JsonResponse({"success": True, "count": len(matches), "matches": matches})
    except Exception as e:
        return JsonResponse({"success": False, "error": str(e)}, status=500)


@csrf_exempt
def get_structured_live_matches(request):
    token = os.getenv("BETS_API_KEY")
    base_url = "https://api.b365api.com/v1/bet365"

    try:
        structured = []

        for sport_id, sport_name in SPORT_ID_MAP.items():
            filter_url = f"{base_url}/inplay_filter"
            filter_res = requests.get(filter_url, params={"token": token, "sport_id": sport_id})
            sport_data = filter_res.json().get("results", [])

            for league in sport_data:
                print("LEAGUE: ", league)
                league_name = league.get("league").get("name")
                # print("NAME OF LEAGUE: ", league_name)
                matches = []

                try:
                    home = league.get("home", {}).get("name", "-")
                except:
                    home = "-"
                    pass
                try:
                    away = league.get("away", {}).get("name", "-")
                except:
                    away = "-"
                    pass
                try:
                    score = league.get("ss", "-")
                except:
                    score = "-"
                    pass
                
                event_id = league.get("id")
                print("event: ", event_id)
                if not event_id:
                    continue

                # Cache /event για κάθε FI
                cache_key = f"event_{event_id}"
                event_data = cache.get(cache_key)
                if not event_data:
                    try:
                        ev_url = f"{base_url}/event"
                        ev_res = requests.get(ev_url, params={"token": token, "FI": event_id})
                        ev_json = ev_res.json()
                        results = ev_json.get("results", [])
                        print("RESULTS: ", results)
                    except:
                        print("PASSED EVENT REQUEST")
                        pass
                    if not results:
                        continue
                    event_data = results[0]
                    cache.set(cache_key, event_data, timeout=60)

                try:
                    ts = event_data[0].get("TM")
                    sec = event_data[0].get("TS")
                    time_str = f"{ts}:{int(sec):02}" if ts is not None and sec is not None else "-"
                except:
                    print("PASSED TIME FIELDS GET")
                    pass
                odds = {"1": "-", "X": "-", "2": "-"}
                try:
                    odds_data = event_data[0].get("odds", {}).get("1x2", {}).get("odds", {})
                    odds = {
                        "1": odds_data.get("home", "-"),
                        "X": odds_data.get("draw", "-"),
                        "2": odds_data.get("away", "-")
                    }
                except:
                    pass

                match_data = {
                    "match_id": event_id,
                    "home_team": home,
                    "away_team": away,
                    "score": score,
                    "time": time_str,
                    "odds": odds
                }
                matches.append(match_data)

                if matches:
                    structured.append({
                        "sport": sport_name,
                        "league": league_name,
                        "matches": matches
                    })

        # ταξινόμηση sport -> league
        structured.sort(key=lambda g: (g["sport"], g["league"]))
        return JsonResponse(structured, safe=False)

    except Exception as e:
        print("❌ Σφάλμα backend:", e)
        return JsonResponse({"error": str(e)}, status=500)
# def get_structured_live_matches(request):
#     token = os.getenv("BETS_API_KEY")
#     base_url = "https://api.b365api.com/v1/bet365"

#     try:
#         # 1. Fetch inplay matches
#         inplay_res = requests.get(f"{base_url}/inplay", params={"token": token})
#         inplay_data = inplay_res.json().get("results", [])
#         if isinstance(inplay_data, list) and len(inplay_data) > 0:
#             inplay_data = inplay_data[0]

#         class_map, competition_map, events, markets, odds = {}, {}, {}, {}, {}

#         for entry in inplay_data:
#             t = entry.get("type")
#             if t == "CL":
#                 class_map[entry.get("ID")] = entry.get("NA", "Άγνωστο Άθλημα")
#             elif t == "CT":
#                 competition_map[entry.get("ID")] = entry.get("NA", "Άγνωστη Διοργάνωση")
#             elif t == "EV":
#                 events[entry["ID"]] = entry
#             elif t == "MA" and entry.get("NA") == "Fulltime Result":
#                 markets[entry.get("FI")] = entry
#             elif t == "PA":
#                 fi = entry.get("FI")
#                 if fi not in odds:
#                     odds[fi] = []
#                 odds[fi].append(entry)

#         structured = {}

#         for event_id, event in events.items():
#             # ⚠️ Try to load cached event details
#             cache_key = f"event_details_{event_id}"
#             event_data = cache.get(cache_key)

#             if not event_data:
#                 detail_url = f"{base_url}/event"
#                 resp = requests.get(detail_url, params={"token": token, "event_id": event_id})
#                 results = resp.json().get("results", [])
#                 if results:
#                     event_data = results[0]
#                     cache.set(cache_key, event_data, timeout=30)  # ⏱️ Cache for 30 seconds

#             score = event_data.get("SS", "-") if event_data else event.get("SS", "-")
#             ts = event_data.get("TS") if event_data else event.get("TS")
#             time = f"{int(ts) // 60}′" if ts and str(ts).isdigit() else "-"

#             name = event.get("NA", "-")
#             home_team, away_team = name.split(" v ", 1) if " v " in name else (name, "-")
#             cl_id = event.get("CL")
#             c3_id = event.get("C3")

#             sport = class_map.get(cl_id, "Άγνωστο Άθλημα")
#             league = competition_map.get(c3_id, "Άγνωστη Διοργάνωση")

#             odds_map = {"1": "-", "X": "-", "2": "-"}
#             match_market = markets.get(event_id)
#             if match_market:
#                 match_fi = match_market.get("FI")
#                 for o in odds.get(match_fi, []):
#                     if o.get("OR") == "0":
#                         odds_map["1"] = o.get("OD", "-")
#                     elif o.get("OR") == "1":
#                         odds_map["X"] = o.get("OD", "-")
#                     elif o.get("OR") == "2":
#                         odds_map["2"] = o.get("OD", "-")

#             match_info = {
#                 "match_id": event_id,
#                 "home_team": home_team,
#                 "away_team": away_team,
#                 "score": score,
#                 "time": time,
#                 "odds": odds_map
#             }

#             key = f"{sport}__{league}"
#             structured.setdefault(key, []).append(match_info)

#         # ✅ Μετατροπή σε λίστα με grouping
#         response = []
#         for key, matches in structured.items():
#             sport, league = key.split("__", 1)
#             response.append({
#                 "sport": sport,
#                 "league": league,
#                 "matches": matches
#             })

#         # 🔤 Sort by sport, then league
#         response.sort(key=lambda g: (g["sport"], g["league"]))

#         return JsonResponse(response, safe=False)

#     except Exception as e:
#         print("❌ Σφάλμα backend:", e)
#         return JsonResponse({"error": str(e)}, status=500)


    
    
class PregameMatchesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, sport_id):
        token = os.getenv("BETS_API_KEY")
        url = f"https://api.b365api.com/v1/bet365/upcoming?sport_id={sport_id}&token={token}"
        try:
            response = requests.get(url)
            data = response.json()

            if data["success"] == 1:
                # Επιστρέφουμε τις διοργανώσεις στην ίδια μορφή
                return Response(data["results"], status=200)
            else:
                return Response({"detail": "No data found"}, status=404)
        except requests.exceptions.RequestException as e:
            return Response({"detail": str(e)}, status=500)

class PregameOddsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, match_id):
        token = os.getenv("BETS_API_KEY")
        url = f"https://api.b365api.com/v1/bet365/prematch?FI={match_id}&token={token}"
        try:
            response = requests.get(url)
            data = response.json()
            return Response(data.get("results", []))
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class PregameLeaguesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sport_id = request.query_params.get("sport_id")
        if not sport_id:
            return Response({"error": "Missing sport_id"}, status=400)
        token = os.getenv("BETS_API_KEY")
        url = f"https://api.b365api.com/v1/bet365/leagues?sport_id={sport_id}&token={token}"
        try:
            response = requests.get(url)
            data = response.json()
            if data.get("success", 1) == 0:
                return Response({"error": data.get("msg", "Unknown error")}, status=404)
            return Response(data.get("results", []))
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class PregameStructuredView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sport_id = request.GET.get("sport_id", 1)
        token = os.getenv("BETS_API_KEY")
        url = f"https://api.b365api.com/v1/bet365/upcoming?sport_id={sport_id}&token={token}"
        try:
            response = requests.get(url)
            if response.status_code != 200:
                return Response({"error": f"BetsAPI returned status {response.status_code}"}, status=404)
            events = response.json().get("results", [])
            structured = {}
            for event in events:
                league_name = event.get("league", "")
                country = event.get("cc", "Άγνωστη Χώρα")
                if country not in structured:
                    structured[country] = []
                if league_name and not any(lg["name"] == league_name for lg in structured[country]):
                    structured[country].append({
                        "id": event.get("league_id", event.get("id")),
                        "name": league_name,
                    })
            return Response(structured, status=200)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class PregameMatchesSimpleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sport_id = request.query_params.get("sport_id", "1")
        token = os.getenv("BETS_API_KEY")
        try:
            response = requests.get(
                "https://api.b365api.com/v1/bet365/upcoming",
                params={"sport_id": sport_id, "token": token}
            )
            if response.status_code == 200:
                return Response(response.json().get("results", []))
            else:
                return Response({"error": f"BetsAPI Error: {response.status_code}"}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

