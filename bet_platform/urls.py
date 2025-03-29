from django.contrib import admin
from django.urls import path, include
from users.views import CustomTokenObtainPairView, fetch_betsapi_sports, get_live_matches, PregameMatchesView, PregameOddsView, PregameStructuredView, PregameLeaguesView, PregameMatchesSimpleView 
from rest_framework_simplejwt.views import TokenRefreshView
from django.shortcuts import redirect
from users.views import get_structured_live_matches

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),  # Βεβαιώσου ότι υπάρχει αρχείο users/urls.py
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("api/financial-reports/", lambda request: redirect("/api/users/financial-reports/", permanent=True)),
    path('api/betsapi/sports/', fetch_betsapi_sports),
    path("api/live-matches/", get_live_matches, name="live-matches"),
    path("api/pregame-matches/<int:sport_id>/", PregameMatchesView.as_view(), name="pregame-matches"),  # ✅ αυτό εδώ
    path("api/pregame-odds/<int:match_id>/", PregameOddsView.as_view(), name="pregame-odds"),
    path('api/pregame-structured/', PregameStructuredView.as_view(), name='pregame-structured'),
    path('api/pregame-leagues/', PregameLeaguesView.as_view(), name='pregame-leagues'),
    path("api/pregame-matches-simple/", PregameMatchesSimpleView.as_view(), name="pregame-matches-simple"),
    path("api/live-matches-structured/", get_structured_live_matches, name="live-matches-structured"),
    ]
 