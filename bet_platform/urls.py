from django.contrib import admin
from django.urls import path, include
from users.views import CustomTokenObtainPairView
from rest_framework_simplejwt.views import TokenRefreshView
from django.shortcuts import redirect

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/users/', include('users.urls')),  # Βεβαιώσου ότι υπάρχει αρχείο users/urls.py
    path('api/token/', CustomTokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    path("api/financial-reports/", lambda request: redirect("/api/users/financial-reports/", permanent=True)),
]
