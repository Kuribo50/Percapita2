from django.core.management.base import BaseCommand
from api.models import Catalogo


class Command(BaseCommand):
    help = 'Poblar la base de datos con catalogos iniciales'

    def handle(self, *args, **options):
        self.stdout.write('Limpiando catalogos existentes...')
        Catalogo.objects.all().delete()

        self.stdout.write('Creando catalogos...')

        # Etnias
        etnias = [
            {'nombre': 'Mapuche', 'orden': 1},
            {'nombre': 'Aymara', 'orden': 2},
            {'nombre': 'Rapa Nui', 'orden': 3},
            {'nombre': 'Diaguita', 'orden': 4},
            {'nombre': 'Quechua', 'orden': 5},
            {'nombre': 'Atacameno', 'orden': 6},
            {'nombre': 'Colla', 'orden': 7},
            {'nombre': 'Kawesqar', 'orden': 8},
            {'nombre': 'Yagan', 'orden': 9},
            {'nombre': 'Ninguna', 'orden': 10},
            {'nombre': 'Otra', 'orden': 11},
        ]

        for etnia in etnias:
            Catalogo.objects.create(tipo='ETNIA', **etnia)
        self.stdout.write(self.style.SUCCESS(f'Etnias creadas: {len(etnias)}'))

        # Nacionalidades
        nacionalidades = [
            {'nombre': 'Chilena', 'orden': 1},
            {'nombre': 'Venezolana', 'orden': 2},
            {'nombre': 'Haitiana', 'orden': 3},
            {'nombre': 'Colombiana', 'orden': 4},
            {'nombre': 'Peruana', 'orden': 5},
            {'nombre': 'Boliviana', 'orden': 6},
            {'nombre': 'Argentina', 'orden': 7},
            {'nombre': 'Ecuatoriana', 'orden': 8},
            {'nombre': 'Dominicana', 'orden': 9},
            {'nombre': 'Cubana', 'orden': 10},
            {'nombre': 'Otra', 'orden': 11},
        ]

        for nacionalidad in nacionalidades:
            Catalogo.objects.create(tipo='NACIONALIDAD', **nacionalidad)
        self.stdout.write(self.style.SUCCESS(f'Nacionalidades creadas: {len(nacionalidades)}'))

        # Sectores (con colores)
        sectores = [
            {'nombre': 'Verde', 'codigo': 'VERDE', 'color': '#10B981', 'orden': 1},
            {'nombre': 'Rojo', 'codigo': 'ROJO', 'color': '#EF4444', 'orden': 2},
            {'nombre': 'Azul', 'codigo': 'AZUL', 'color': '#3B82F6', 'orden': 3},
            {'nombre': 'Amarillo', 'codigo': 'AMARILLO', 'color': '#F59E0B', 'orden': 4},
        ]

        for sector in sectores:
            Catalogo.objects.create(tipo='SECTOR', **sector)
        self.stdout.write(self.style.SUCCESS(f'Sectores creados: {len(sectores)}'))

        # Subsectores
        subsectores = [
            {'nombre': 'V1', 'codigo': 'V1', 'orden': 1},
            {'nombre': 'V2', 'codigo': 'V2', 'orden': 2},
            {'nombre': 'V3', 'codigo': 'V3', 'orden': 3},
            {'nombre': 'V4', 'codigo': 'V4', 'orden': 4},
            {'nombre': 'V5 - NACHUR RAFAEL', 'codigo': 'V5', 'orden': 5},
            {'nombre': 'V6', 'codigo': 'V6', 'orden': 6},
            {'nombre': 'V7', 'codigo': 'V7', 'orden': 7},
            {'nombre': 'V8 - FRUTILLAR ALTO', 'codigo': 'V8', 'orden': 8},
            {'nombre': 'R1 - LOS BLOQUES', 'codigo': 'R1', 'orden': 9},
            {'nombre': 'R2', 'codigo': 'R2', 'orden': 10},
            {'nombre': 'R3 - 18 SEPTIEMBRE', 'codigo': 'R3', 'orden': 11},
            {'nombre': 'R4', 'codigo': 'R4', 'orden': 12},
            {'nombre': 'A1', 'codigo': 'A1', 'orden': 13},
            {'nombre': 'A2', 'codigo': 'A2', 'orden': 14},
            {'nombre': 'A3', 'codigo': 'A3', 'orden': 15},
        ]

        for subsector in subsectores:
            Catalogo.objects.create(tipo='SUBSECTOR', **subsector)
        self.stdout.write(self.style.SUCCESS(f'Subsectores creados: {len(subsectores)}'))

        # Establecimientos
        establecimientos = [
            {'nombre': 'CESFAM DR. ALBERTO REYES', 'codigo': 'CAR', 'orden': 1},
            {'nombre': 'CESFAM ALBERTO REYES', 'codigo': 'CAR', 'orden': 2},
            {'nombre': 'CESFAM Norte', 'codigo': 'NORT', 'orden': 3},
            {'nombre': 'CESFAM Sur', 'codigo': 'SUR', 'orden': 4},
        ]

        for establecimiento in establecimientos:
            Catalogo.objects.create(tipo='ESTABLECIMIENTO', **establecimiento)
        self.stdout.write(self.style.SUCCESS(f'Establecimientos creados: {len(establecimientos)}'))

        total = Catalogo.objects.count()
        self.stdout.write(self.style.SUCCESS(f'\nCatalogos poblados exitosamente! Total: {total}'))
