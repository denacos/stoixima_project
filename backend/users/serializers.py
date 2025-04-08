from rest_framework import serializers
from django.contrib.auth import get_user_model
from .models import Bet, UserBalance 
from rest_framework_simplejwt.serializers import TokenObtainPairSerializer
from users.models import CustomUser  # Αν χρησιμοποιείς custom user model

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    balance = serializers.FloatField(write_only=True, required=False)

    class Meta:
        model = User
        fields = [
            'id', 'username', 'email', 'first_name', 'last_name',
            'country', 'phone_number', 'birth_date',
            'role', 'password', 'boss', 'manager', 'cashier', 'balance' ]      
        extra_kwargs = {'password': {'write_only': True}}

    def create(self, validated_data):
        balance = validated_data.pop("balance", None)
        # Επιλογή του σωστού Parent User ανάλογα με το ρόλο
        role = validated_data.get("role")
        if role == "manager" and "boss" not in validated_data:
            raise serializers.ValidationError("A manager must have a boss.")
        if role == "cashier" and "manager" not in validated_data:
            raise serializers.ValidationError("A cashier must have a manager.")
        if role == "user" and "cashier" not in validated_data:
            raise serializers.ValidationError("A user must have a cashier.")

        user = User.objects.create_user(**validated_data)

        if balance is not None:
            UserBalance.objects.update_or_create(
                user=user,
                defaults={"balance": float(balance)}
            )

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
    balance = serializers.SerializerMethodField()
    date_joined = serializers.DateTimeField(format="%Y-%m-%d %H:%M:%S", read_only=True)

    class Meta:
        model = CustomUser
        fields = ['id', 'username', 'email', 'role', 'balance', 'date_joined']

    def get_balance(self, obj):
        try:
            balance = UserBalance.objects.get(user=obj)
            return round(balance.balance, 2)
        except UserBalance.DoesNotExist:
            return 0.00


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