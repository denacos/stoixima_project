from django.contrib import admin
from django.urls import path, include
from users.views import CustomTokenObtainPairView, GetAllOddsView, GetSportsView, GetAllSportsView, fetch_betsapi_sports, get_live_matches, get_structured_live_matches, PregameMatchesView, PregameOddsView, PregameStructuredView, PregameLeaguesView, PregameMatchesSimpleView 
from rest_framework_simplejwt.views import TokenRefreshView
from django.shortcuts import redirect

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),  # Βεβαιώσου ότι υπάρχει αρχείο users/urls.py
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("api/financial-reports/", lambda request: redirect("/api/users/financial-reports/", permanent=True)),
    path("api/odds/all/", GetAllOddsView.as_view(), name="get_all_odds"),
    path('api/sports/', GetAllSportsView.as_view(), name='get_all_sports'),
    path('api/sports/details/', GetSportsView.as_view(), name='get_sports'),
    path('api/betsapi/sports/', fetch_betsapi_sports),
    path("api/live-matches/", get_live_matches, name="live-matches"),
    path("api/live-matches-structured/", get_structured_live_matches, name="live-matches-structured"),
    path("api/pregame-matches/", PregameMatchesView.as_view(), name="pregame-matches"),  # ✅ αυτό εδώ
    path("api/pregame-odds/<int:match_id>/", PregameOddsView.as_view(), name="pregame-odds"),
    path('api/pregame-structured/', PregameStructuredView.as_view(), name='pregame-structured'),
    path('api/pregame-leagues/', PregameLeaguesView.as_view(), name='pregame-leagues'),
    path("api/pregame-matches-simple/", PregameMatchesSimpleView.as_view(), name="pregame-matches-simple"),
    
    ]
 