# Generated by Django 5.1.6 on 2025-03-03 23:28

from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('users', '0003_userbalance'),
    ]

    operations = [
        migrations.AddField(
            model_name='bet',
            name='cashed_out_amount',
            field=models.FloatField(blank=True, null=True),
        ),
        migrations.AlterField(
            model_name='bet',
            name='status',
            field=models.CharField(choices=[('open', 'Ανοιχτό'), ('won', 'Κερδισμένο'), ('lost', 'Χαμένο'), ('cashed_out', 'Cashout')], default='open', max_length=15),
        ),
    ]
