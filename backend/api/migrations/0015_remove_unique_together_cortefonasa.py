# Generated migration to allow duplicate RUNs in same month

from django.db import migrations


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_usuario_remove_centrosalud_establecimiento_and_more'),
    ]

    operations = [
        migrations.AlterUniqueTogether(
            name='cortefonasa',
            unique_together=set(),
        ),
        migrations.AlterIndexTogether(
            name='cortefonasa',
            index_together=set(),
        ),
    ]
