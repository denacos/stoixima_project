
from rest_framework import generics, permissions
from rest_framework.views import APIView
from rest_framework.response import Response
from django.db.models import Sum
from django.utils.dateparse import parse_date
from users.models import CustomUser, Bet, UserBalance
from users.serializers import UserSerializer, BetSerializer
from users.permissions import IsAdmin, IsBoss, IsManager, IsCashier

# --- ADMIN ---
class AdminUserListView(generics.ListCreateAPIView):
    queryset = CustomUser.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAdminUser]

class AdminDashboardView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def get(self, request):
        total_bets = Bet.objects.count()
        total_users = UserBalance.objects.count()
        total_won_bets = Bet.objects.filter(status="won").count()
        total_lost_bets = Bet.objects.filter(status="lost").count()
        total_cashed_out = Bet.objects.filter(status="cashed_out").count()
        total_profit = sum(b.stake for b in Bet.objects.filter(status="lost"))
        total_payouts = sum(b.potential_payout for b in Bet.objects.filter(status="won"))
        return Response({
            "total_users": total_users,
            "total_bets": total_bets,
            "total_won_bets": total_won_bets,
            "total_lost_bets": total_lost_bets,
            "total_cashed_out": total_cashed_out,
            "total_profit": total_profit,
            "total_payouts": total_payouts
        })

class AdminBetReportView(APIView):
    permission_classes = [permissions.IsAdminUser]
    def get(self, request):
        total_bets = Bet.objects.aggregate(total_stake=Sum('stake'))['total_stake'] or 0
        total_winnings = Bet.objects.filter(status="won").aggregate(total_winnings=Sum('potential_payout'))['total_winnings'] or 0
        total_loss_for_system = total_winnings - total_bets
        return Response({
            "total_bets": total_bets,
            "total_winnings": total_winnings,
            "total_loss_for_system": total_loss_for_system
        })

# --- BOSS ---
class BossManagerListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsBoss]
    def get_queryset(self):
        return CustomUser.objects.filter(role="manager")

class BossCashierListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsBoss]
    def get_queryset(self):
        manager_id = self.kwargs['manager_id']
        return CustomUser.objects.filter(role="cashier", manager__id=manager_id)

class BossUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsBoss]
    def get_queryset(self):
        cashier_id = self.kwargs['cashier_id']
        return CustomUser.objects.filter(role="user", cashier__id=cashier_id)

class BossFinancialReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsBoss]
    def get(self, request):
        managers = CustomUser.objects.filter(role="manager")
        report = []
        for manager in managers:
            cashiers = CustomUser.objects.filter(manager=manager, role="cashier")
            total_balance = sum(c.userbalance.balance for c in cashiers)
            report.append({
                "manager": manager.username,
                "total_cashier_balance": total_balance
            })
        return Response(report)

# --- MANAGER ---
class ManagerCashierListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsManager]
    def get_queryset(self):
        return CustomUser.objects.filter(role="cashier", manager=self.request.user)

class ManagerUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsManager]
    def get_queryset(self):
        cashier_id = self.kwargs['cashier_id']
        return CustomUser.objects.filter(role="user", cashier__id=cashier_id)

class ManagerFinancialReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsManager]
    def get(self, request):
        cashiers = CustomUser.objects.filter(manager=request.user, role="cashier")
        report = []
        for cashier in cashiers:
            report.append({
                "cashier": cashier.username,
                "balance": cashier.userbalance.balance
            })
        return Response(report)

class ManagerUserBetsReportView(generics.ListAPIView):
    serializer_class = BetSerializer
    permission_classes = [permissions.IsAuthenticated, IsManager]
    def get_queryset(self):
        manager = self.request.user
        queryset = Bet.objects.filter(user__cashier__manager=manager).order_by('-created_at')
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

# --- CASHIER ---
class CashierUserListView(generics.ListAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated, IsCashier]
    def get_queryset(self):
        return CustomUser.objects.filter(role="user", cashier=self.request.user)

class CashierFinancialReportView(APIView):
    permission_classes = [permissions.IsAuthenticated, IsCashier]
    def get(self, request):
        users = CustomUser.objects.filter(cashier=request.user, role="user")
        report = []
        for user in users:
            report.append({
                "user": user.username,
                "balance": user.userbalance.balance
            })
        return Response(report)

class CashierUserBetsReportView(generics.ListAPIView):
    serializer_class = BetSerializer
    permission_classes = [permissions.IsAuthenticated, IsCashier]
    def get_queryset(self):
        cashier = self.request.user
        queryset = Bet.objects.filter(user__cashier=cashier).order_by('-created_at')
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
