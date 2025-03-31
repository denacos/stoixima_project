from django.urls import path
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from rest_framework.authtoken.views import obtain_auth_token  # Για login με token
from .views import ChangePasswordView
from .views import (
    CustomLoginView, CreateUserView, ListUsersView, AdminUserListView, BossManagerListView,
    ManagerCashierListView, CashierUserListView, PlaceBetView,
      SettleBetsView, UserBetHistoryView, CashoutBetView, UserBetReportView, AdminBetReportView,
      AdminDashboardView, BossCashierListView, BossUserListView, BossFinancialReportView,
     ManagerUserListView, ManagerFinancialReportView, CashierFinancialReportView,  UserBalanceView,
    CashierUserBetsReportView, ManagerUserBetsReportView, UpdateUserView, TransferUnitsView,
     TransactionHistoryView, FinancialReportsView, GetBetSlipView, CurrentUserView,
)

urlpatterns = [
    path('create/', CreateUserView.as_view(), name='create-user'),
    path('list/', ListUsersView.as_view(), name='list-users'),
    path('admin/', AdminUserListView.as_view(), name='admin-users'),
    path('boss/managers/', BossManagerListView.as_view(), name='boss-managers'),
    path('boss/managers/<int:manager_id>/cashiers/', BossCashierListView.as_view(), name='boss-cashiers'),
    path('boss/managers/<int:manager_id>/cashiers/<int:cashier_id>/users/', BossUserListView.as_view(), name='boss-users'),
    path('boss/financial-report/', BossFinancialReportView.as_view(), name='boss-financial-report'),
    path('manager/cashiers/', ManagerCashierListView.as_view(), name='manager-cashiers'),
    path('manager/cashiers/<int:cashier_id>/users/', ManagerUserListView.as_view(), name='manager-users'),
    path('manager/financial-report/', ManagerFinancialReportView.as_view(), name='manager-financial-report'),
    path('manager/user-bets/', ManagerUserBetsReportView.as_view(), name='manager-user-bets'),
    path('cashier/users/', CashierUserListView.as_view(), name='cashier-users'),
    path('cashier/user-bets/', CashierUserBetsReportView.as_view(), name='cashier-user-bets'),    
    path('cashier/financial-report/', CashierFinancialReportView.as_view(), name='cashier-financial-report'),
    path('bets/settle/', SettleBetsView.as_view(), name='settle-bets'),
    path('bets/history/', UserBetHistoryView.as_view(), name='bet-history'),
    path('bets/cashout/<int:bet_id>/', CashoutBetView.as_view(), name='cashout-bet'),
    path("bets/user-report/", UserBetReportView.as_view(), name="user_bet_report"),
    path("bets/admin-report/", AdminBetReportView.as_view(), name="admin_bet_report"),
    path('admin-dashboard/', AdminDashboardView.as_view(), name='admin-dashboard'),
    path('user/balance/', UserBalanceView.as_view(), name='user-balance'),
    path('user/bets/', UserBetHistoryView.as_view(), name='user-bets'),
    path('update/<int:pk>/', UpdateUserView.as_view(), name='update-user'),
    path("api/login/", obtain_auth_token, name="api_login"),  # ✅ Προσθήκη login με token
    path("users/", ListUsersView.as_view(), name="list-users"),  # Παράδειγμα
    path("token/", TokenObtainPairView.as_view(), name="token_obtain_pair"),  # ✅ Login με JWT
    path("token/refresh/", TokenRefreshView.as_view(), name="token_refresh"),  # ✅ Refresh Token
    path('transfer/', TransferUnitsView.as_view(), name='transfer_units'),
    path('transactions/history/', TransactionHistoryView.as_view(), name='transaction-history'),
    path('financial-reports/', FinancialReportsView.as_view(), name='financial-reports'),
    path('bets/slip/', GetBetSlipView.as_view(), name='get-bet-slip'),
    path('bets/place/', PlaceBetView.as_view(), name='place-bet'),  # ✅ Εξασφάλισε ότι υπάρχει
    path('me/', CurrentUserView.as_view(), name='current-user'),
    path("change-password/", ChangePasswordView.as_view(), name="change-password"),
]
