# Generated manually on 2025-11-07

from django.db import migrations


def actualizar_subsectores(apps, schema_editor):
    """Limpia y actualiza la tabla de subsectores con los nuevos códigos"""
    Subsector = apps.get_model('api', 'Subsector')
    
    # Limpiar todos los subsectores existentes
    Subsector.objects.all().delete()
    
    # Lista de nuevos subsectores
    subsectores = [
        ('A1', 'OTROS C. MANHS'),
        ('A3', 'CENTRO'),
        ('A4', 'CENTENARIO'),
        ('A5', 'NAVIDAD'),
        ('A6', 'SAN JUAN'),
        ('A7', 'FRUTILLARES'),
        ('R1', 'LOS BLOQUES'),
        ('R2', 'MILADE ASFURAS'),
        ('R3', 'POBL. 18 SEPTIEMBRE'),
        ('R4', 'VILLA ALEMANIA'),
        ('R5', 'LOS LAGOS'),
        ('R6', 'COCHOLGUE'),
        ('R7', 'OTROS ROJOS'),
        ('V1', 'EL SANTO'),
        ('V2', 'CERRO ESTANQUE'),
        ('V3', 'OTROS VERDES'),
        ('V4', 'CALIFORNIA'),
        ('V5', 'NACHUR - RAFAEL'),
        ('V6', 'CECOSF EL SANTO'),
        ('V7', 'CECOSF CERRO ESTANQUE'),
        ('V8', 'FRUTILLAR ALTO'),
        ('R8', 'POBL. EL MIRADOR'),
        ('R9', 'DICHATO CAR'),
        ('R10', 'COLIUMO CAR'),
        ('V9', 'HOGAR NAZARETH'),
        ('V10', 'EXTRACOMUNA'),
        ('A2', 'OTROS AZULES'),
        ('A8', 'CERRO ALEGRE CAR'),
        ('A9', 'POBLACION EL COLO'),
        ('A10', 'ALBERGUE BAQUEDANO'),
        ('A11', 'VILLA LAS ARAUCARIAS'),
        ('A12', 'LOS BOLDOS'),
        ('A13', 'HOGAR SAN JOSE'),
    ]
    
    # Crear los nuevos subsectores
    for codigo, nombre in subsectores:
        Subsector.objects.create(
            codigo=codigo,
            nombre=nombre
        )


def revertir_subsectores(apps, schema_editor):
    """Función de reversión - elimina los subsectores actualizados"""
    Subsector = apps.get_model('api', 'Subsector')
    # En caso de revertir, simplemente eliminamos todos
    Subsector.objects.all().delete()


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0012_add_revision_fields'),
    ]

    operations = [
        migrations.RunPython(actualizar_subsectores, revertir_subsectores),
    ]
