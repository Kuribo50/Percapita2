# Generated migration for adding revision fields

from django.db import migrations, models
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0011_alter_cortefonasa_aceptado_rechazado'),
    ]

    operations = [
        migrations.AddField(
            model_name='nuevousuario',
            name='revisado',
            field=models.BooleanField(default=False, db_index=True),
        ),
        migrations.AddField(
            model_name='nuevousuario',
            name='revisado_manualmente',
            field=models.BooleanField(default=False),
        ),
        migrations.AddField(
            model_name='nuevousuario',
            name='revisado_por',
            field=models.CharField(max_length=100, blank=True, default=''),
        ),
        migrations.AddField(
            model_name='nuevousuario',
            name='revisado_el',
            field=models.DateTimeField(null=True, blank=True),
        ),
        migrations.AddField(
            model_name='nuevousuario',
            name='modificado_por',
            field=models.CharField(max_length=100, blank=True, default=''),
        ),
        migrations.AddField(
            model_name='nuevousuario',
            name='observaciones_trakcare',
            field=models.TextField(blank=True, default=''),
        ),
        migrations.AddField(
            model_name='nuevousuario',
            name='checklist_trakcare',
            field=models.JSONField(default=dict, blank=True),
        ),
    ]
