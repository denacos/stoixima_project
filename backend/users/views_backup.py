from django.shortcuts import render
from rest_framework import generics, permissions
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model
from .serializers import UserSerializer, BetSerializer, UserBalanceSerializer
from rest_framework.permissions import BasePermission
from rest_framework.permissions import IsAdminUser
from rest_framework.permissions import IsAuthenticated
from rest_framework.permissions import AllowAny
from rest_framework_simplejwt.authentication import JWTAuthentication
from .permissions import IsAdmin, CanManageManagers, CanManageCashiers, CanManageUsers, IsBoss, IsManager, IsCashier
from django.http import JsonResponse
from .models import Bet, UserBalance, CustomUser, Transaction
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from django.db.models import Q
from django.db.models import Sum
from django.utils.timezone import now
from users.serializers import CustomTokenObtainPairSerializer, FinancialReportSerializer
from django.views.decorators.csrf import csrf_exempt
import requests
import traceback
import os
from django.core.cache import cache
import json


User = get_user_model()

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


def get_live_matches(request):
    token = "196435-mG6nm6l8Jt1eiH"
    url = f"https://api.b365api.com/v1/bet365/inplay?token={token}"

    try:
        response = requests.get(url)
        data = response.json()

        print("📦 RAW DATA:", json.dumps(data, indent=2))

        results = data.get("results", [])

        matches = []

        for group in results:
            if not isinstance(group, list):
                continue

            for match in group:
                match_id = match.get("ID") or match.get("id")
                sport_name = match.get("NA", "Unknown")

                matches.append({
                    "id": match_id,
                    "type": match.get("type"),
                    "sport": sport_name,
                    "league": match.get("L3", ""),  # π.χ. Argentina Cup
                    "info": match.get("MR", "")[:80],
                    "header": match.get("HM", "")[:80],
                })

        print(f"✅ Final parsed matches: {len(matches)}")

        return JsonResponse({"success": True, "count": len(matches), "matches": matches})

    except Exception as e:
        print("❌ ERROR:", str(e))
        return JsonResponse({"success": False, "error": str(e)}, status=500)

@csrf_exempt
def get_structured_live_matches(request):
    token = os.getenv("BETS_API_KEY")
    url = f"https://api.b365api.com/v1/bet365/inplay?token={token}"

    try:
        response = requests.get(url)
        data = response.json()
        results = data.get("results", [])

        leagues = {}

        for group in results:
            if not isinstance(group, list):
                continue
            for match in group:
                league_name = match.get("L3", "Άγνωστη Διοργάνωση")
                home = match.get("T1", "Ομάδα Α")
                away = match.get("T2", "Ομάδα Β")
                score = match.get("SS", "-")
                time = match.get("TT", "--:--")

                match_obj = {
                    "home_team": home,
                    "away_team": away,
                    "score": score,
                    "time": time,
                    "match_id": match.get("ID"),
                    "odds": {
                        "1": 1.80,  # placeholder
                        "X": 3.40,
                        "2": 4.50
                    }
                }

                if league_name not in leagues:
                    leagues[league_name] = []
                leagues[league_name].append(match_obj)

        structured = [
            {"league": league, "matches": matches}
            for league, matches in leagues.items()
        ]

        return JsonResponse(structured, safe=False)

    except Exception as e:
        return JsonResponse({"error": str(e)}, status=500)

class PregameStructuredView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sport_id = request.GET.get("sport_id", 1)
        token = os.getenv("BETS_API_KEY")  # ✅ ή βάλτο σκληρά για δοκιμές

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

                # Προσθέτουμε μόνο αν δεν υπάρχει ήδη το πρωτάθλημα
                if league_name and not any(lg["name"] == league_name for lg in structured[country]):
                    structured[country].append({
                        "id": event.get("league_id", event.get("id")),
                        "name": league_name,
                    })

            return Response(structured, status=200)

        except Exception as e:
            return Response({"error": str(e)}, status=500)
    
class PregameMatchesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sport_id = request.GET.get("sport_id", "1")  # default: ποδόσφαιρο
        token = os.getenv("BETS_API_KEY")
        url = f"https://api.b365api.com/v1/bet365/upcoming?sport_id={sport_id}&token={token}"

        try:
            response = requests.get(url)
            data = response.json()
            matches = data.get("results", [])
            return Response(matches)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class PregameOddsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, match_id):
        token = os.getenv("BETS_API_KEY")
        url = f"https://api.b365api.com/v1/bet365/prematch?FI={match_id}&token={token}"

        try:
            response = requests.get(url)
            data = response.json()
            odds = data.get("results", [])
            return Response(odds)
        except Exception as e:
            return Response({"error": str(e)}, status=500)
        

class PregameLeaguesView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sport_id = request.query_params.get("sport_id")
        if not sport_id:
            return Response({"error": "Missing sport_id"}, status=400)

        token = os.environ.get("BETS_API_KEY")
        url = f"https://api.b365api.com/v1/bet365/leagues?sport_id={sport_id}&token={token}"
        
        try:
            r = requests.get(url)
            data = r.json()
            if data.get("success", 1) == 0:
                return Response({"error": f"BetsAPI Error: {data.get('msg', 'Unknown error')}"}, status=404)
            return Response(data.get("results", []))
        except Exception as e:
            return Response({"error": str(e)}, status=500)

class PregameMatchesSimpleView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        sport_id = request.query_params.get("sport_id", "1")
        token = os.environ.get("BETS_API_TOKEN")

        try:
            response = requests.get(
                f"https://api.b365api.com/api/v1/bet365/upcoming",
                params={"sport_id": sport_id, "token": token}
            )

            if response.status_code == 200:
                return Response(response.json().get("results", []))
            else:
                return Response({"error": f"BetsAPI Error: {response.status_code}"}, status=404)

        except Exception as e:
            return Response({"error": str(e)}, status=500)

        
    
# 🔹 2️⃣ API για δημιουργία νέων χρηστών
class CreateUserView(generics.CreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        role = serializer.validated_data.get("role")

        if role == "manager":
            if user.role != "boss":
                raise PermissionDenied("Only Boss can create a Manager.")
            serializer.save(boss=user)
        
        elif role == "cashier":
            if user.role != "manager":
                raise PermissionDenied("Only Manager can create a Cashier.")
            serializer.save(manager=user)

        elif role == "user":
            if user.role != "cashier":
                raise PermissionDenied("Only Cashier can create a User.")
            serializer.save(cashier=user)

        else:
            raise PermissionDenied("Invalid role assignment.")

# 🔹 3️⃣ API για εμφάνιση όλων των χρηστών (μόνο αν έχει δικαιώματα)
class ListUsersView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [CanManageUsers]

# 🔹 1️⃣ Ο Admin μπορεί να διαχειριστεί όλους
class AdminUserListView(generics.ListCreateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [IsAdmin]

# 🔹 2️⃣ Το Αφεντικό μπορεί να δημιουργεί και να βλέπει Μάνατζερ
class BossManagerListView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [CanManageManagers]

    def get_queryset(self):
        return User.objects.filter(role='manager')

# 🔹 3️⃣ Ο Μάνατζερ μπορεί να δημιουργεί και να βλέπει Ταμίες
class ManagerCashierListView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [CanManageCashiers]

    def get_queryset(self):
        return User.objects.filter(role='cashier')

# 🔹 4️⃣ Ο Ταμίας μπορεί να δημιουργεί και να βλέπει Χρήστες
class CashierUserListView(generics.ListCreateAPIView):
    serializer_class = UserSerializer
    permission_classes = [CanManageUsers]

    def get_queryset(self):
        return User.objects.filter(role='user')    

    def perform_create(self, serializer):
        user = get_object_or_404(CustomUser, id=self.request.user.id)  # Χρήση CustomUser
        balance = get_object_or_404(UserBalance, user=user)  # Σωστή αντιστοίχιση χρήστη στο υπόλοιπο
        stake = serializer.validated_data['stake']

        if balance.deduct_balance(stake):
            serializer.save(user=user)
        else:
            raise ValidationError({"error": "Insufficient balance to place this bet."})

         
    
    permission_classes = [IsAdminUser]  # Επιτρέπεται μόνο σε Admin χρήστες

    def get(self, request):
        API_KEY = os.getenv("ODDS_API_KEY")
        if not API_KEY:
            return Response({"error": "API Key not found"}, status=500)

        open_bets = Bet.objects.filter(status="open")  # Βρίσκουμε μόνο τα ανοιχτά στοιχήματα
        if not open_bets.exists():
            return Response({"message": "No open bets to settle."})

        url = f"https://api.the-odds-api.com/v4/sports/soccer_epl/scores/?apiKey={API_KEY}"
        response = requests.get(url)

        if response.status_code != 200:
            return Response({"error": "Failed to fetch match results"}, status=500)

        match_results = response.json()
        settled_count = 0

        for bet in open_bets:
            match_id = bet.match_id
            for match in match_results:
                if match["id"] == match_id and "completed" in match and match["completed"]:
                    winner = match.get("winner", "")

                    if winner and winner.lower() == bet.choice.lower():
                        bet.status = "won"
                        bet.user.userbalance.add_balance(bet.potential_payout)  # Προσθήκη των κερδών
                    else:
                        bet.status = "lost"

                    bet.settled_at = now()
                    bet.save()
                    settled_count += 1

        return Response({"message": f"{settled_count} bets have been settled."})

class UserBetHistoryView(generics.ListAPIView):
    serializer_class = BetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Bet.objects.filter(user=user).order_by('-created_at')

        # 🔍 Φίλτρο κατά status (open, won, lost, cashed_out)
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)

        # 🔍 Φίλτρο κατά ημερομηνία (from_date, to_date)
        from_date = self.request.query_params.get('from_date', None)
        to_date = self.request.query_params.get('to_date', None)

        if from_date:
            try:
                from_date = parse_date(from_date)
                if from_date:
                    queryset = queryset.filter(created_at__gte=from_date)
            except ValueError:
                pass  # Αν η ημερομηνία είναι λάθος, αγνοούμε το φίλτρο

        if to_date:
            try:
                to_date = parse_date(to_date)
                if to_date:
                    queryset = queryset.filter(created_at__lte=to_date)
            except ValueError:
                pass  # Αν η ημερομηνία είναι λάθος, αγνοούμε το φίλτρο

        return queryset
    

    def post(self, request, bet_id):
        print(f"🔍 Cashout request received - Bet ID: {bet_id}, User: {request.user}")

        API_KEY = os.getenv("ODDS_API_KEY")
        if not API_KEY:
            print("⚠️ ERROR: API Key is missing!")
            return Response({"error": "Internal Server Error - API Key Missing"}, status=500)

        try:
            bet = Bet.objects.get(id=bet_id, user=request.user, status="open")
        except Bet.DoesNotExist:
            return Response({"error": "No open bet matches the given query."}, status=404)

        print(f"✅ Bet found: {bet} (Match ID: {bet.match_id})")

        # Φέρνουμε τις αποδόσεις
        sport_key = "soccer_epl"
        url = f"https://api.the-odds-api.com/v4/sports/{sport_key}/odds/?apiKey={API_KEY}&regions=us&markets=h2h"
        response = requests.get(url)

        print(f"🔍 API Response Status: {response.status_code}")

        if response.status_code != 200:
            return Response({"error": "Failed to fetch current odds"}, status=500)

        match_odds = response.json()
        print(f"📢 API Data Received: {len(match_odds)} matches")

        print(f"🎯 Looking for Match ID: {bet.match_id}")

        # Διόρθωση του match_id αν δεν υπάρχει
        found_match = None
        for match in match_odds:
            teams = [match["home_team"].lower(), match["away_team"].lower()]
            if bet.choice.lower() in teams:
                found_match = match
                break

        if found_match and found_match["id"] != bet.match_id:
            print(f"🔄 Auto-fixing match_id: {found_match['id']}")
            bet.match_id = found_match["id"]
            bet.save()

        for bookmaker in match.get("bookmakers", []):
            print(f"🔹 Checking bookmaker: {bookmaker['title']}")
            for market in bookmaker.get("markets", []):  # ✅ Ασφαλής πρόσβαση
                for outcome in market.get("outcomes", []):  # ✅ Ασφαλής πρόσβαση
                    print(f"🔵 Checking outcome: {outcome['name']} - Price: {outcome['price']}")
                    if outcome["name"].lower() == bet.choice.lower():
                        new_odds = outcome["price"]
                        break
                if new_odds:
                    break
            if new_odds:
                break

        # Βρίσκουμε τις αποδόσεις για το συγκεκριμένο match_id
        new_odds = None
        for match in match_odds:
            print(f"🟢 Checking match: {match['id']} - {match['home_team']} vs {match['away_team']}")
            
            # Διόρθωση του match_id check
            if str(match["id"]) == str(bet.match_id):  
                print(f"✅ Match Found: {match['id']}")
                for bookmaker in match["bookmakers"]:
                    print(f"🔹 Checking bookmaker: {bookmaker['title']}")
                    for outcome in bookmaker["markets"][0]["outcomes"]:
                        print(f"🔵 Checking outcome: {outcome['name']} - Price: {outcome['price']}")
                        if outcome["name"].lower() == bet.choice.lower():
                            new_odds = outcome["price"]
                            break
                    if new_odds:
                        break
                if new_odds:
                    break
        
        if not new_odds:
            return Response({"error": f"Could not determine current odds for {bet.choice}"}, status=400)

        # Υπολογισμός ποσού Cashout
        cashout_value = round(bet.stake * (new_odds / bet.odds), 2)

        # Ενημερώνουμε το στοίχημα
        bet.status = "cashed_out"
        bet.cashed_out_amount = cashout_value
        bet.save()

        # Προσθέτουμε τις μονάδες στο υπόλοιπο του χρήστη
        try:
            user_balance = UserBalance.objects.get(user=request.user)
            user_balance.add_balance(cashout_value)
        except UserBalance.DoesNotExist:
            print(f"⚠️ ERROR: No balance found for user {request.user}")
            return Response({"error": "User balance not found"}, status=500)

        return Response({
            "message": "Cashout successful",
            "cashed_out_amount": cashout_value
        })

class UserBetReportView(APIView):
    """
    Επιστρέφει μια αναφορά για τα στοιχήματα του χρήστη.
    Περιλαμβάνει το συνολικό ποντάρισμα, κέρδη και απώλειες.
    """
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user

        total_bets = Bet.objects.filter(user=user).aggregate(total_stake=Sum('stake'))['total_stake'] or 0
        total_winnings = Bet.objects.filter(user=user, status="won").aggregate(total_winnings=Sum('potential_payout'))['total_winnings'] or 0
        total_losses = total_bets - total_winnings
        balance = user.userbalance.balance  # Το τρέχον υπόλοιπο του χρήστη

        return Response({
            "total_bets": total_bets,
            "total_winnings": total_winnings,
            "total_losses": total_losses,
            "current_balance": balance
        })
        
class AdminBetReportView(APIView):
    """
    Επιστρέφει συνολικές αναφορές για τους διαχειριστές.
    Δείχνει συνολικά πονταρίσματα, κέρδη των παικτών και τη συνολική απώλεια του συστήματος.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_bets = Bet.objects.aggregate(total_stake=Sum('stake'))['total_stake'] or 0
        total_winnings = Bet.objects.filter(status="won").aggregate(total_winnings=Sum('potential_payout'))['total_winnings'] or 0
        total_loss_for_system = total_winnings - total_bets  # Αν είναι αρνητικό, το σύστημα έχει κέρδος.

        return Response({
            "total_bets": total_bets,
            "total_winnings": total_winnings,
            "total_loss_for_system": total_loss_for_system
        })
    
class AdminDashboardView(APIView):
    permission_classes = [IsAdminUser]

    def get(self, request):
        total_bets = Bet.objects.count()
        total_users = UserBalance.objects.count()
        total_won_bets = Bet.objects.filter(status="won").count()
        total_lost_bets = Bet.objects.filter(status="lost").count()
        total_cashed_out = Bet.objects.filter(status="cashed_out").count()
        
        total_profit = sum(bet.stake for bet in Bet.objects.filter(status="lost"))  # Κέρδος από χαμένα στοιχήματα
        total_payouts = sum(bet.potential_payout for bet in Bet.objects.filter(status="won"))  # Πληρωμές σε χρήστες
        
        return Response({
            "total_users": total_users,
            "total_bets": total_bets,
            "total_won_bets": total_won_bets,
            "total_lost_bets": total_lost_bets,
            "total_cashed_out": total_cashed_out,
            "total_profit": total_profit,
            "total_payouts": total_payouts
        })
    
# 📌 1️⃣ Αφεντικό - Επιστρέφει όλους τους μάνατζερ που διαχειρίζεται
class BossManagerListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsBoss]

    def get_queryset(self):
        return CustomUser.objects.filter(role="manager")

# 📌 2️⃣ Αφεντικό - Λίστα ταμιών ενός μάνατζερ
class BossCashierListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsBoss]

    def get_queryset(self):
        manager_id = self.kwargs['manager_id']
        return CustomUser.objects.filter(role="cashier", manager__id=manager_id)

# 📌 3️⃣ Αφεντικό - Λίστα χρηστών ενός ταμία
class BossUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsBoss]

    def get_queryset(self):
        cashier_id = self.kwargs['cashier_id']
        return CustomUser.objects.filter(role="user", cashier__id=cashier_id)

# 📌 4️⃣ Αφεντικό - Συνολικά ταμεία όλων των μάνατζερ
class BossFinancialReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsBoss]

    def get(self, request):
        managers = CustomUser.objects.filter(role="manager")
        report = []
        
        for manager in managers:
            cashiers = CustomUser.objects.filter(manager=manager, role="cashier")
            total_balance = sum(cashier.userbalance.balance for cashier in cashiers)
            
            report.append({
                "manager": manager.username,
                "total_cashier_balance": total_balance
            })

        return Response(report)

# 📌 5️⃣ Μάνατζερ - Λίστα ταμιών
class ManagerCashierListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsManager]

    def get_queryset(self):
        return CustomUser.objects.filter(role="cashier", manager=self.request.user)

# 📌 6️⃣ Μάνατζερ - Λίστα χρηστών ενός ταμία
class ManagerUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsManager]

    def get_queryset(self):
        cashier_id = self.kwargs['cashier_id']
        return CustomUser.objects.filter(role="user", cashier__id=cashier_id)

# 📌 7️⃣ Μάνατζερ - Συνολικά ταμεία των ταμιών
class ManagerFinancialReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsManager]

    def get(self, request):
        cashiers = CustomUser.objects.filter(manager=request.user, role="cashier")
        report = []

        for cashier in cashiers:
            total_balance = cashier.userbalance.balance
            report.append({
                "cashier": cashier.username,
                "balance": total_balance
            })

        return Response(report)

# 📌 8️⃣ Ταμίας - Λίστα χρηστών
class CashierUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsCashier]

    def get_queryset(self):
        cashier = self.request.user
        queryset = Bet.objects.filter(user__cashier=cashier).order_by('-created_at')

        # 🔍 Φίλτρο κατά status στοιχήματος
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)

        # 🔍 Φίλτρο κατά ημερομηνία
        from_date = self.request.query_params.get('from_date', None)
        to_date = self.request.query_params.get('to_date', None)

        if from_date:
            try:
                from_date = parse_date(from_date)
                if from_date:
                    queryset = queryset.filter(created_at__gte=from_date)
            except ValueError:
                pass

        if to_date:
            try:
                to_date = parse_date(to_date)
                if to_date:
                    queryset = queryset.filter(created_at__lte=to_date)
            except ValueError:
                pass

        return queryset

# 📌 9️⃣ Ταμίας - Συνολικά ταμεία των χρηστών
class CashierFinancialReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCashier]

    def get(self, request):
        users = CustomUser.objects.filter(cashier=request.user, role="user")
        report = []

        for user in users:
            total_balance = user.userbalance.balance
            report.append({
                "user": user.username,
                "balance": total_balance
            })

        return Response(report)

# 📌 🔟 Χρήστης - Υπόλοιπο
class UserBalanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        balance = get_object_or_404(UserBalance, user=request.user)
        return Response({"balance": balance.balance})

# 📌 1️⃣1️⃣ Χρήστης - Ιστορικό στοιχημάτων
class UserBetHistoryView(generics.ListAPIView):
    serializer_class = BetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        return Bet.objects.filter(user=self.request.user).order_by('-created_at')


class ManagerUserBetsReportView(generics.ListAPIView):
    """
    Οι Μάνατζερ βλέπουν το ιστορικό στοιχημάτων των χρηστών που ανήκουν στους Ταμίες τους.
    Υποστηρίζει φίλτρα: status, ημερομηνία (from_date, to_date).
    """
    serializer_class = BetSerializer
    permission_classes = [IsAuthenticated, IsManager]

    def get_queryset(self):
        manager = self.request.user
        queryset = Bet.objects.filter(user__cashier__manager=manager).order_by('-created_at')

        # 🔍 Φίλτρα όπως στο Cashier API
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)

        from_date = self.request.query_params.get('from_date', None)
        to_date = self.request.query_params.get('to_date', None)

        if from_date:
            try:
                from_date = parse_date(from_date)
                if from_date:
                    queryset = queryset.filter(created_at__gte=from_date)
            except ValueError:
                pass

        if to_date:
            try:
                to_date = parse_date(to_date)
                if to_date:
                    queryset = queryset.filter(created_at__lte=to_date)
            except ValueError:
                pass

        return queryset

class CashierUserBetsReportView(generics.ListAPIView):
    """
    Οι Ταμίες βλέπουν το ιστορικό στοιχημάτων των χρηστών τους.
    Υποστηρίζει φίλτρα: status, ημερομηνία (from_date, to_date).
    """
    serializer_class = BetSerializer
    permission_classes = [IsAuthenticated, IsCashier]

    def get_queryset(self):
        cashier = self.request.user
        queryset = Bet.objects.filter(user__cashier=cashier).order_by('-created_at')

        # 🔍 Φίλτρο κατά status στοιχήματος
        status = self.request.query_params.get('status', None)
        if status:
            queryset = queryset.filter(status=status)

        # 🔍 Φίλτρο κατά ημερομηνία
        from_date = self.request.query_params.get('from_date', None)
        to_date = self.request.query_params.get('to_date', None)

        if from_date:
            try:
                from_date = parse_date(from_date)
                if from_date:
                    queryset = queryset.filter(created_at__gte=from_date)
            except ValueError:
                pass

        if to_date:
            try:
                to_date = parse_date(to_date)
                if to_date:
                    queryset = queryset.filter(created_at__lte=to_date)
            except ValueError:
                pass

        return queryset

class UpdateUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [CanManageUsers]

class CustomLoginView(ObtainAuthToken):
    """ Προσαρμοσμένη Login View που επιστρέφει token και χρήστη """
    
    def post(self, request, *args, **kwargs):
        response = super().post(request, *args, **kwargs)
        token = response.data.get("token")
        user = self.request.user
        return Response({
            "token": token,
            "user": {
                "id": user.id,
                "username": user.username,
                "role": user.role,
            }
        })

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        user = self.user
        data["user"] = {"username": user.username, "role": user.role}  # ✅ Προσθέτουμε το role
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

class ProtectedView(APIView):
    def get(self, request):
        return Response({"message": "This is a protected view"})
    
class TransferUnitsView(APIView):
    """
    Επιτρέπει μεταφορά μονάδων με έλεγχο ρόλων.
    """
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sender = request.user
        target_username = request.data.get("target_username")
        amount = request.data.get("amount")

        if not target_username or not amount:
            raise ValidationError("Απαιτούνται target_username και amount.")

        target_user = get_object_or_404(CustomUser, username=target_username)
        sender_balance = get_object_or_404(UserBalance, user=sender)
        target_balance = get_object_or_404(UserBalance, user=target_user)

        # Έλεγχος αν ο χρήστης έχει αρκετές μονάδες
        if sender_balance.balance < float(amount):
            raise ValidationError("Μη επαρκές υπόλοιπο για μεταφορά.")

        # Εκτέλεση μεταφοράς
        sender_balance.balance -= float(amount)
        target_balance.balance += float(amount)
        sender_balance.save()
        target_balance.save()

        # ✅ Αποθήκευση της συναλλαγής στο ιστορικό
        Transaction.objects.create(sender=sender, receiver=target_user, amount=amount)

        return Response({
            "message": f"Μεταφέρθηκαν {amount} μονάδες στον {target_user.username}.",
            "sender_new_balance": sender_balance.balance,
            "receiver_new_balance": target_balance.balance,
        })

class TransactionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        transactions = Transaction.objects.filter(sender=request.user) | Transaction.objects.filter(receiver=request.user)
        transactions = transactions.order_by('-timestamp')

        history = [
            {
                "sender": transaction.sender.username,
                "receiver": transaction.receiver.username,
                "amount": transaction.amount,
                "timestamp": transaction.timestamp.strftime("%Y-%m-%d %H:%M:%S")
            }
            for transaction in transactions
        ]

        return Response({"history": history})

class FinancialReportsView(APIView):
    permission_classes = [IsAuthenticated]  # Επιτρέπει την πρόσβαση μόνο σε αυθεντικοποιημένους χρήστες

    def get(self, request):
        print("FinancialReportsView hit!")  # DEBUGGING

        reports = []
        users = UserBalance.objects.all()

        for user_balance in users:
            revenue = user_balance.balance * 1.2  # Παράδειγμα υπολογισμού εσόδων
            expense = user_balance.balance * 0.5  # Παράδειγμα υπολογισμού εξόδων
            profit = revenue - expense

            reports.append({
                "user": user_balance.user.username,
                "revenue": revenue,
                "expense": expense,
                "profit": profit,
            })

       
        return Response(reports)
    
        API_KEY = os.getenv("ODDS_API_KEY")
        if not API_KEY:
            return Response({"error": "API Key not found"}, status=500)

        sports_url = f"https://api.the-odds-api.com/v4/sports/?apiKey={API_KEY}"
        response = requests.get(sports_url)

        if response.status_code != 200:
            return Response({"error": "Failed to fetch sports list"}, status=response.status_code)

        return Response(response.json())

        API_KEY = os.getenv("ODDS_API_KEY")  # ✅ Παίρνει το API Key από το .env
        if not API_KEY:
            return Response({"error": "API Key not found"}, status=500)

        # ✅ Cache τα δεδομένα για να μην κάνουμε πολλές κλήσεις στο API
        cached_sports = cache.get("sports_list")
        if cached_sports:
            return Response(cached_sports)

        # ✅ Φέρνουμε τα αθλήματα από το The Odds API
        sports_url = f"https://api.the-odds-api.com/v4/sports/?apiKey={API_KEY}"
        response = requests.get(sports_url)

        if response.status_code != 200:
            return Response({"error": "Failed to fetch sports list"}, status=response.status_code)

        sports_data = response.json()
        cache.set("sports_list", sports_data, timeout=3600)  # Cache για 1 ώρα

        return Response(sports_data)
    
class GetBetSlipView(APIView):
    """ Εμφάνιση κουπονιού πριν την υποβολή του στοιχήματος. """
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        bets = Bet.objects.filter(user=user, status="open").order_by('-created_at')
        serializer = BetSerializer(bets, many=True)
        return Response(serializer.data)

    def perform_create(self, serializer):
        user = self.request.user
        balance = get_object_or_404(UserBalance, user=user)
        stake = serializer.validated_data['stake']

        # Έλεγχος αν υπάρχει επαρκές υπόλοιπο
        if balance.balance < stake:
            raise ValidationError({"error": "Ανεπαρκές υπόλοιπο"})

        # Αφαίρεση υπολοίπου
        balance.balance -= stake
        balance.save()

        # Αποθήκευση στοιχήματος
        serializer.save(user=user)

class PlaceBetView(generics.CreateAPIView):
    """ Υποβολή στοιχήματος από τον χρήστη. """
    serializer_class = BetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        balance = get_object_or_404(UserBalance, user=user)
        stake = serializer.validated_data['stake']

        # Έλεγχος αν υπάρχει επαρκές υπόλοιπο
        if balance.balance < stake:
            raise ValidationError({"error": "Ανεπαρκές υπόλοιπο"})

        # Αφαίρεση υπολοίπου
        balance.balance -= stake
        balance.save()

        # Αποθήκευση στοιχήματος
        serializer.save(user=user)

class SettleBetsView(APIView):
    """
    Εκκαθαρίζει όλα τα ανοιχτά στοιχήματα βασισμένα σε αποτελέσματα από BetsAPI.
    Διαθέσιμο μόνο για Admin χρήστες.
    """
    permission_classes = [IsAdminUser]

    def get(self, request):
        token = os.getenv("BETS_API_KEY")
        if not token:
            return Response({"error": "Missing BetsAPI token."}, status=500)

        open_bets = Bet.objects.filter(status="open")
        if not open_bets.exists():
            return Response({"message": "No open bets to settle."})

        settled_count = 0

        for bet in open_bets:
            match_id = bet.match_id
            url = f"https://api.b365api.com/v1/bet365/result?event_id={match_id}&token={token}"

            try:
                response = requests.get(url)
                if response.status_code != 200:
                    continue

                results = response.json().get("results", [])
                if not results:
                    continue

                result = results[0]
                winner = result.get("winner", "").lower()

                if winner == bet.choice.lower():
                    bet.status = "won"
                    bet.user.userbalance.add_balance(bet.potential_payout)
                else:
                    bet.status = "lost"

                bet.settled_at = now()
                bet.save()
                settled_count += 1

            except Exception as e:
                continue  # Ignore error and move to next bet

        return Response({
            "message": f"{settled_count} bets have been settled."
        })

class CashoutBetView(APIView):
    """
    Επιτρέπει στους χρήστες να κάνουν cashout ενός ανοικτού στοιχήματος.
    Υπολογίζει νέα απόδοση από BetsAPI και επιστρέφει αναλογικό ποσό.
    """
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, bet_id):
        user = request.user
        token = os.getenv("BETS_API_KEY")
        if not token:
            return Response({"error": "Missing BetsAPI token."}, status=500)

        try:
            bet = Bet.objects.get(id=bet_id, user=user, status="open")
        except Bet.DoesNotExist:
            return Response({"error": "Bet not found or already settled."}, status=404)

        match_id = bet.match_id
        url = f"https://api.b365api.com/v1/bet365/prematch?FI={match_id}&token={token}"

        try:
            response = requests.get(url)
            data = response.json()
            results = data.get("results", [])
            if not results:
                return Response({"error": "No odds data available."}, status=400)

            odds_data = results[0].get("odds", {}).get("1x2", {})
            new_odds = None

            if bet.choice == "1":
                new_odds = float(odds_data.get("home", 0))
            elif bet.choice == "2":
                new_odds = float(odds_data.get("away", 0))
            elif bet.choice.upper() == "X":
                new_odds = float(odds_data.get("draw", 0))

            if not new_odds or new_odds == 0:
                return Response({"error": "No valid odds found."}, status=400)

            # Υπολογισμός ποσού cashout
            cashout_value = round(bet.stake * (new_odds / bet.odds), 2)

            # Ενημέρωση στοιχήματος
            bet.status = "cashed_out"
            bet.cashed_out_amount = cashout_value
            bet.settled_at = now()
            bet.save()

            # Πίστωση στον χρήστη
            user_balance = get_object_or_404(UserBalance, user=user)
            user_balance.add_balance(cashout_value)

            return Response({
                "message": "Cashout successful.",
                "cashed_out_amount": cashout_value
            })

        except Exception as e:
            return Response({"error": f"Cashout failed: {str(e)}"}, status=500)
