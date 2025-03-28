
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from rest_framework.authtoken.views import ObtainAuthToken
from rest_framework_simplejwt.views import TokenObtainPairView
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from django.contrib.auth import get_user_model

User = get_user_model()

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
        data["user"] = {
            "username": user.username,
            "role": user.role
        }
        return data

class CustomTokenObtainPairView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer
    permission_classes = [AllowAny]

class ProtectedView(APIView):
    def get(self, request):
        return Response({"message": "This is a protected view"})

from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework import status, permissions
from django.contrib.auth.password_validation import validate_password
from django.core.exceptions import ValidationError

class ChangePasswordView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request):
        user = request.user
        data = request.data

        current_password = data.get("current_password")
        new_password = data.get("new_password")
        confirm_password = data.get("confirm_password")

        if not user.check_password(current_password):
            return Response({"error": "Ο τρέχων κωδικός δεν είναι σωστός."}, status=400)

        if new_password != confirm_password:
            return Response({"error": "Οι νέοι κωδικοί δεν ταιριάζουν."}, status=400)

        try:
            validate_password(new_password, user=user)
        except ValidationError as e:
            return Response({"error": e.messages}, status=400)

        user.set_password(new_password)
        user.save()

        return Response({"message": "Ο κωδικός αλλάχθηκε με επιτυχία."}, status=200)