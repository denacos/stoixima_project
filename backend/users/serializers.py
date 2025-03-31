from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Bet, UserBalance 
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from users.models import CustomUser  # Αν χρησιμοποιείς custom user model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'country', 'phone_number', 'birth_date',
            'role', 'password', 'boss', 'manager', 'cashier' ]      
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        role = validated_data.get("role")

        # Επιλογή του σωστού Parent User ανάλογα με το ρόλο
        if role == "manager" and "boss" not in validated_data:
            raise serializers.ValidationError("A manager must have a boss.")
        if role == "cashier" and "manager" not in validated_data:
            raise serializers.ValidationError("A cashier must have a manager.")
        if role == "user" and "cashier" not in validated_data:
            raise serializers.ValidationError("A user must have a cashier.")

        user = User.objects.create_user(**validated_data)
        return user

class BetSerializer(serializers.ModelSerializer):
    class Meta:
        model = Bet
        fields = ['id', 'user', 'match_id', 'choice', 'odds', 'stake', 'potential_payout', 'status', 'created_at']
        read_only_fields = ['user', 'potential_payout', 'status', 'created_at']
    
    def create(self, validated_data):
        validated_data['potential_payout'] = validated_data['stake'] * validated_data['odds']
        return super().create(validated_data)  # ✅ Σωστό! Επιστρέφει αντικείμενο `Bet`


class UserBalanceSerializer(serializers.ModelSerializer):
    class Meta:
        model = UserBalance
        fields = ['user', 'balance']

class CustomTokenObtainPairSerializer(TokenObtainPairSerializer):
    def validate(self, attrs):
        data = super().validate(attrs)
        data['user'] = {
            "id": self.user.id,
            "username": self.user.username,
            "role": self.user.role,
        }
        return data

class CustomUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role']


class TransferUnitsSerializer(serializers.Serializer):
    target_username = serializers.CharField()
    amount = serializers.FloatField()

    def validate_amount(self, value):
        if value <= 0:
            raise serializers.ValidationError("Το ποσό πρέπει να είναι θετικό.")
        return value

class FinancialReportSerializer(serializers.Serializer):
    user = serializers.CharField(source="user.username")
    revenue = serializers.FloatField()
    expense = serializers.FloatField()
    profit = serializers.FloatField()