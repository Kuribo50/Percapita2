"""
Script de ejemplo para validar nuevos usuarios contra el corte de FONASA.

Este script puede ser ejecutado manualmente o programado para ejecutarse
automáticamente cuando se suba un nuevo corte.

Uso:
    python validar_usuarios.py --mes 10 --anio 2024 --fecha-corte 2024-10-31

"""

import argparse
import requests
from datetime import datetime


def validar_usuarios(mes: int, anio: int, fecha_corte: str, api_url: str = "http://localhost:8000/api"):
    """
    Ejecuta la validación de usuarios contra el corte de FONASA.
    
    Args:
        mes: Mes del periodo a validar (1-12)
        anio: Año del periodo a validar
        fecha_corte: Fecha del corte en formato YYYY-MM-DD
        api_url: URL base de la API
    
    Returns:
        dict: Resultado de la validación
    """
    endpoint = f"{api_url}/validaciones/validar-corte/"
    
    payload = {
        "periodoMes": mes,
        "periodoAnio": anio,
        "fechaCorte": fecha_corte,
        "procesadoPor": "script_automatico"
    }
    
    print(f"Validando usuarios de {mes}/{anio} contra corte del {fecha_corte}...")
    
    try:
        response = requests.post(endpoint, json=payload)
        response.raise_for_status()
        
        data = response.json()
        validacion = data.get("validacion", {})
        
        print("\n✅ Validación completada exitosamente!")
        print(f"\nResultados:")
        print(f"  - Total usuarios: {validacion.get('totalUsuarios', 0)}")
        print(f"  - Validados: {validacion.get('usuariosValidados', 0)}")
        print(f"  - No validados: {validacion.get('usuariosNoValidados', 0)}")
        print(f"  - Pendientes: {validacion.get('usuariosPendientes', 0)}")
        
        return data
        
    except requests.exceptions.RequestException as e:
        print(f"\n❌ Error al conectar con la API: {e}")
        return None
    except Exception as e:
        print(f"\n❌ Error inesperado: {e}")
        return None


def obtener_estadisticas(mes: int, anio: int, api_url: str = "http://localhost:8000/api"):
    """
    Obtiene las estadísticas de usuarios de un periodo específico.
    
    Args:
        mes: Mes del periodo
        anio: Año del periodo
        api_url: URL base de la API
    
    Returns:
        dict: Estadísticas del periodo
    """
    endpoint = f"{api_url}/nuevos-usuarios/"
    params = {
        "periodoMes": mes,
        "periodoAnio": anio
    }
    
    try:
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        
        data = response.json()
        estadisticas = data.get("estadisticas", {})
        
        print(f"\nEstadísticas de usuarios {mes}/{anio}:")
        print(f"  - Total: {estadisticas.get('total', 0)}")
        print(f"  - Validados: {estadisticas.get('validados', 0)}")
        print(f"  - No validados: {estadisticas.get('noValidados', 0)}")
        print(f"  - Pendientes: {estadisticas.get('pendientes', 0)}")
        
        return estadisticas
        
    except requests.exceptions.RequestException as e:
        print(f"Error al obtener estadísticas: {e}")
        return None


def listar_no_validados(mes: int, anio: int, api_url: str = "http://localhost:8000/api"):
    """
    Lista todos los usuarios NO_VALIDADO de un periodo.
    
    Args:
        mes: Mes del periodo
        anio: Año del periodo
        api_url: URL base de la API
    """
    endpoint = f"{api_url}/nuevos-usuarios/"
    params = {
        "periodoMes": mes,
        "periodoAnio": anio,
        "estado": "NO_VALIDADO"
    }
    
    try:
        response = requests.get(endpoint, params=params)
        response.raise_for_status()
        
        data = response.json()
        usuarios = data.get("usuarios", [])
        
        if not usuarios:
            print(f"\n✅ No hay usuarios NO_VALIDADO en {mes}/{anio}")
            return
        
        print(f"\n⚠️  Usuarios NO_VALIDADO en {mes}/{anio}:")
        print("-" * 80)
        for usuario in usuarios:
            print(f"  RUN: {usuario['run']}")
            print(f"  Nombre: {usuario['nombreCompleto']}")
            print(f"  Fecha Solicitud: {usuario['fechaSolicitud']}")
            print(f"  Código Percápita: {usuario.get('codigoPercapita', 'N/A')}")
            print("-" * 80)
        
    except requests.exceptions.RequestException as e:
        print(f"Error al listar usuarios: {e}")


def main():
    parser = argparse.ArgumentParser(
        description='Valida nuevos usuarios contra el corte de FONASA'
    )
    parser.add_argument(
        '--mes',
        type=int,
        required=True,
        help='Mes del periodo a validar (1-12)'
    )
    parser.add_argument(
        '--anio',
        type=int,
        required=True,
        help='Año del periodo a validar'
    )
    parser.add_argument(
        '--fecha-corte',
        required=True,
        help='Fecha del corte en formato YYYY-MM-DD'
    )
    parser.add_argument(
        '--api-url',
        default='http://localhost:8000/api',
        help='URL base de la API (default: http://localhost:8000/api)'
    )
    parser.add_argument(
        '--estadisticas',
        action='store_true',
        help='Mostrar solo estadísticas sin validar'
    )
    parser.add_argument(
        '--listar-rechazados',
        action='store_true',
        help='Listar usuarios NO_VALIDADO'
    )
    
    args = parser.parse_args()
    
    # Validar formato de fecha
    try:
        datetime.strptime(args.fecha_corte, "%Y-%m-%d")
    except ValueError:
        print("❌ Error: La fecha debe estar en formato YYYY-MM-DD")
        return
    
    # Validar mes
    if not 1 <= args.mes <= 12:
        print("❌ Error: El mes debe estar entre 1 y 12")
        return
    
    print("=" * 80)
    print(f"  VALIDACIÓN DE NUEVOS USUARIOS - {args.mes}/{args.anio}")
    print("=" * 80)
    
    if args.estadisticas:
        # Solo mostrar estadísticas
        obtener_estadisticas(args.mes, args.anio, args.api_url)
    elif args.listar_rechazados:
        # Solo listar rechazados
        listar_no_validados(args.mes, args.anio, args.api_url)
    else:
        # Ejecutar validación completa
        resultado = validar_usuarios(
            args.mes,
            args.anio,
            args.fecha_corte,
            args.api_url
        )
        
        if resultado:
            print("\n¿Desea ver los usuarios NO_VALIDADO? (s/n): ", end="")
            try:
                respuesta = input().strip().lower()
                if respuesta == 's':
                    listar_no_validados(args.mes, args.anio, args.api_url)
            except (KeyboardInterrupt, EOFError):
                print("\nOperación cancelada")
    
    print("\n" + "=" * 80)


if __name__ == "__main__":
    main()
