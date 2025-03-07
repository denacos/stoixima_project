# Generated by Django 5.1.6 on 2025-03-03 22:16

import django.db.models.deletion
from django.conf import settings
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0001_initial'),
    ]

    operations = [
        migrations.CreateModel(
            name='Bet',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('match_id', models.CharField(max_length=100)),
                ('choice', models.CharField(max_length=100)),
                ('odds', models.FloatField()),
                ('stake', models.FloatField()),
                ('potential_payout', models.FloatField()),
                ('status', models.CharField(choices=[('open', 'Ανοιχτό'), ('won', 'Κερδισμένο'), ('lost', 'Χαμένο')], default='open', max_length=10)),
                ('created_at', models.DateTimeField(auto_now_add=True)),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to=settings.AUTH_USER_MODEL)),
            ],
        ),
    ]
