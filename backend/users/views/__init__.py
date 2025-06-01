
from .bets_views import (
    PlaceBetView,
    CashoutBetView,
    SettleBetsView,
    UserBetHistoryView,
    UserBetReportView,
    GetBetSlipView,
)

from .users_views import (
    CreateUserView,
    FinancialReportsView,
    UpdateUserView,
    ListUsersView,
    UserBalanceView,
    
    TransferUnitsView,
    TransactionHistoryView,
    CurrentUserView,
    DeleteUserView
)

from .cashiers_views import (
    CashierBalancesView,
    CashierTransferView,
    CashierTransactionHistoryView,
    CashierUserBetsReportView,
    CashierUserListView,
    CashierFinancialReportView,
)

from .admin_views import (
    AdminDashboardView,
    AdminBetReportView,
    AdminUserListView,
    BossManagerListView,
    BossCashierListView,
    BossUserListView,
    BossFinancialReportView,    
    ManagerCashierListView,
    ManagerUserListView,
    ManagerUserBetsReportView,
    ManagerFinancialReportView,
    
)

from .auth_views import (
    CustomLoginView,
    CustomTokenObtainPairView,
    CustomTokenObtainPairSerializer,
    ProtectedView,
    ChangePasswordView,
)

from .odds_views import (
    fetch_betsapi_sports,
    get_live_matches,
    get_structured_live_matches,
    PregameMatchesView,
    PregameOddsView,
    PregameLeaguesView,
    PregameStructuredView,
    PregameMatchesSimpleView
)
