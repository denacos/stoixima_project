
from rest_framework import generics, permissions, status
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.exceptions import ValidationError, PermissionDenied
from django.shortcuts import get_object_or_404
from django.contrib.auth import get_user_model
from users.models import UserBalance, CustomUser, Transaction
from users.serializers import UserSerializer, CustomUserSerializer
from rest_framework.permissions import IsAuthenticated
from rest_framework_simplejwt.views import TokenObtainPairView
from users.serializers import CustomTokenObtainPairSerializer
from users.models import UserBalance

User = get_user_model()

class CreateUserView(generics.GenericAPIView):
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

    def post(self, request, *args, **kwargs):
        serializer = self.get_serializer(data=request.data)

        if not serializer.is_valid():
            print("❌ Serializer Errors:", serializer.errors)
            print("📥 Incoming Data:", request.data)
            return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

        role = serializer.validated_data.get("role")
        creator = request.user
        
        if role == "manager":
            if creator.role != "boss":
                raise PermissionDenied("Only Boss can create a Manager.")
            instance = serializer.save(boss=creator)

        elif role == "cashier":
            if creator.role != "manager":
                raise PermissionDenied("Only Manager can create a Cashier.")
            instance = serializer.save(manager=creator)

        elif role == "user":
            if creator.role != "cashier":
                raise PermissionDenied("Only Cashier can create a User.")

            initial_balance = float(request.data.get("balance", 0))

            # Εύρεση balance ταμία
            cashier_balance = get_object_or_404(UserBalance, user=creator)

            if initial_balance > 0:
                if cashier_balance.balance < initial_balance:
                    return Response({"error": "Ανεπαρκές υπόλοιπο ταμία."}, status=400)

                # Αφαίρεση από ταμία
                cashier_balance.balance -= initial_balance
                cashier_balance.save()

                # Προσθήκη στον νέο χρήστη
                UserBalance.objects.update_or_create(
                    user=instance,
                    defaults={"balance": initial_balance}
                )

                # Καταγραφή μεταφοράς
                Transaction.objects.create(
                    sender=creator,
                    receiver=instance,
                    amount=initial_balance
                )
            else:
                UserBalance.objects.update_or_create(user=instance, defaults={"balance": 0})

            instance = serializer.save(cashier=creator)
        else:
            raise PermissionDenied("Invalid role assignment.")

        return Response({"message": "Ο χρήστης δημιουργήθηκε επιτυχώς."}, status=status.HTTP_201_CREATED)        

class UpdateUserView(generics.UpdateAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class DeleteUserView(generics.DestroyAPIView):
    queryset = CustomUser.objects.all()
    permission_classes = [permissions.IsAuthenticated]

    def perform_destroy(self, instance):
        try:
            user_balance = UserBalance.objects.get(user=instance)
            remaining_balance = user_balance.balance

            # Αν ο χρήστης έχει ταμία και υπάρχει υπόλοιπο
            if instance.cashier and remaining_balance > 0:
                cashier_balance = get_object_or_404(UserBalance, user=instance.cashier)
                cashier_balance.balance += remaining_balance
                cashier_balance.save()

                # Καταγραφή μεταφοράς
                Transaction.objects.create(
                    sender=instance,
                    receiver=instance.cashier,
                    amount=remaining_balance
                )

            # Διαγραφή balance χρήστη
            user_balance.delete()
        except UserBalance.DoesNotExist:
            pass

        # Τώρα διαγραφή χρήστη
        instance.delete()

class ListUsersView(generics.ListAPIView):
    queryset = User.objects.all()
    serializer_class = UserSerializer
    permission_classes = [permissions.IsAuthenticated]

class UserBalanceView(APIView):
    permission_classes = [permissions.IsAuthenticated]

    def get(self, request):
        balance = get_object_or_404(UserBalance, user=request.user)
        return Response({"balance": balance.balance})

class TransferUnitsView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request):
        sender = request.user
        target_username = request.data.get("target_username")
        amount = request.data.get("amount")
        if not target_username or not amount:
            raise ValidationError("Απαιτούνται target_username και amount.")
        target_user = get_object_or_404(CustomUser, username=target_username)
        sender_balance = get_object_or_404(UserBalance, user=sender)
        target_balance = get_object_or_404(UserBalance, user=target_user)
        if sender_balance.balance < float(amount):
            raise ValidationError("Μη επαρκές υπόλοιπο για μεταφορά.")
        sender_balance.balance -= float(amount)
        target_balance.balance += float(amount)
        sender_balance.save()
        target_balance.save()
        Transaction.objects.create(sender=sender, receiver=target_user, amount=amount)
        return Response({
            "message": f"Μεταφέρθηκαν {amount} μονάδες στον {target_user.username}.",
            "sender_new_balance": sender_balance.balance,
            "receiver_new_balance": target_balance.balance,
        })

class TransactionHistoryView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        user = request.user
        transfer_type = request.query_params.get("type")

        if transfer_type == "deposit":
            transactions = Transaction.objects.filter(receiver=user)
        elif transfer_type == "withdraw":
            transactions = Transaction.objects.filter(sender=user)
        else:
            transactions = Transaction.objects.filter(sender=user) | Transaction.objects.filter(receiver=user)

        # Φίλτρα ημερομηνιών
        from_date = request.query_params.get("from")
        to_date = request.query_params.get("to")
        if from_date:
            transactions = transactions.filter(timestamp__date__gte=from_date)
        if to_date:
            transactions = transactions.filter(timestamp__date__lte=to_date)

        transactions = transactions.order_by('-timestamp')

        history = [
            {
                "id": t.id,
                "type": "deposit" if t.sender == user else "withdraw",
                "sender": t.sender.username,
                "receiver": t.receiver.username,
                "sender_id": t.sender.id,
                "receiver_id": t.receiver.id,
                "amount": t.amount,
                "timestamp": t.timestamp.strftime("%Y-%m-%d %H:%M:%S"),
            }
            for t in transactions
        ]
        return Response({"history": history})

class FinancialReportsView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        users = UserBalance.objects.all()
        reports = []
        for user_balance in users:
            revenue = user_balance.balance * 1.2
            expense = user_balance.balance * 0.5
            profit = revenue - expense
            reports.append({
                "user": user_balance.user.username,
                "revenue": revenue,
                "expense": expense,
                "profit": profit,
            })
        return Response(reports)

class CurrentUserView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request):
        serializer = CustomUserSerializer(request.user)
        return Response(serializer.data)

class CustomLoginView(TokenObtainPairView):
    serializer_class = CustomTokenObtainPairSerializer