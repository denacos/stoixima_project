
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.utils.timezone import now
from rest_framework.exceptions import ValidationError
from django.shortcuts import get_object_or_404
from django.utils.dateparse import parse_date
from django.db.models import Sum
import requests
import os

from users.serializers import BetSerializer
from users.models import Bet, UserBalance
from rest_framework.permissions import IsAuthenticated, IsAdminUser

class PlaceBetView(generics.CreateAPIView):
    serializer_class = BetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def perform_create(self, serializer):
        user = self.request.user
        balance = get_object_or_404(UserBalance, user=user)
        stake = serializer.validated_data['stake']
        if balance.balance < stake:
            raise ValidationError({"error": "Ανεπαρκές υπόλοιπο"})
        balance.balance -= stake
        balance.save()
        serializer.save(user=user)

class GetBetSlipView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        bets = Bet.objects.filter(user=user, status="open").order_by('-created_at')
        serializer = BetSerializer(bets, many=True)
        return Response(serializer.data)

class CashoutBetView(APIView):
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
            cashout_value = round(bet.stake * (new_odds / bet.odds), 2)
            bet.status = "cashed_out"
            bet.cashed_out_amount = cashout_value
            bet.settled_at = now()
            bet.save()
            user_balance = get_object_or_404(UserBalance, user=user)
            user_balance.add_balance(cashout_value)
            return Response({
                "message": "Cashout successful.",
                "cashed_out_amount": cashout_value
            })
        except Exception as e:
            return Response({"error": f"Cashout failed: {str(e)}"}, status=500)

class SettleBetsView(APIView):
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
            except Exception:
                continue
        return Response({
            "message": f"{settled_count} bets have been settled."
        })

class UserBetHistoryView(generics.ListAPIView):
    serializer_class = BetSerializer
    permission_classes = [permissions.IsAuthenticated]

    def get_queryset(self):
        user = self.request.user
        queryset = Bet.objects.filter(user=user).order_by('-created_at')
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

class UserBetReportView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        user = request.user
        total_bets = Bet.objects.filter(user=user).aggregate(total_stake=Sum('stake'))['total_stake'] or 0
        total_winnings = Bet.objects.filter(user=user, status="won").aggregate(total_winnings=Sum('potential_payout'))['total_winnings'] or 0
        total_losses = total_bets - total_winnings
        balance = user.userbalance.balance
        return Response({
            "total_bets": total_bets,
            "total_winnings": total_winnings,
            "total_losses": total_losses,
            "current_balance": balance
        })
