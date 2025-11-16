"""
Utilidades para Generación de Reportes PDF.

Este módulo proporciona funciones para generar reportes profesionales
en formato PDF utilizando ReportLab.

Tipos de reportes disponibles:
    - Estadísticas de usuarios por centro
    - Listado de nuevos usuarios
    - Historial de validaciones
    - Resumen de cortes FONASA
    - Logs de auditoría
"""

from io import BytesIO
from datetime import datetime
from typing import List, Dict, Any, Optional

try:
    from reportlab.lib import colors
    from reportlab.lib.pagesizes import letter, A4
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    from reportlab.lib.units import inch
    from reportlab.platypus import (
        SimpleDocTemplate,
        Table,
        TableStyle,
        Paragraph,
        Spacer,
        PageBreak,
        Image,
    )
    from reportlab.lib.enums import TA_CENTER, TA_LEFT, TA_RIGHT
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False


class PDFGenerator:
    """
    Generador de reportes PDF profesionales.

    Utiliza ReportLab para crear documentos PDF con tablas,
    gráficos y estilos corporativos.
    """

    def __init__(self):
        if not REPORTLAB_AVAILABLE:
            raise ImportError(
                "ReportLab no está instalado. "
                "Instala con: pip install reportlab"
            )

        self.styles = getSampleStyleSheet()
        self._setup_custom_styles()

    def _setup_custom_styles(self):
        """Configura estilos personalizados para el PDF."""
        # Título principal
        self.styles.add(ParagraphStyle(
            name='CustomTitle',
            parent=self.styles['Heading1'],
            fontSize=24,
            textColor=colors.HexColor('#1e40af'),
            spaceAfter=30,
            alignment=TA_CENTER,
            fontName='Helvetica-Bold'
        ))

        # Subtítulo
        self.styles.add(ParagraphStyle(
            name='CustomSubtitle',
            parent=self.styles['Heading2'],
            fontSize=16,
            textColor=colors.HexColor('#3b82f6'),
            spaceAfter=12,
            fontName='Helvetica-Bold'
        ))

        # Información de header
        self.styles.add(ParagraphStyle(
            name='HeaderInfo',
            parent=self.styles['Normal'],
            fontSize=10,
            textColor=colors.HexColor('#6b7280'),
            alignment=TA_RIGHT,
        ))

    def _add_header(self, elements: List, title: str, subtitle: Optional[str] = None):
        """
        Agrega el header del reporte.

        Args:
            elements: Lista de elementos del PDF
            title: Título del reporte
            subtitle: Subtítulo opcional
        """
        # Título
        elements.append(Paragraph(title, self.styles['CustomTitle']))

        if subtitle:
            elements.append(Paragraph(subtitle, self.styles['CustomSubtitle']))

        # Información de generación
        fecha_generacion = datetime.now().strftime("%d/%m/%Y %H:%M")
        info = f"Generado el: {fecha_generacion}"
        elements.append(Paragraph(info, self.styles['HeaderInfo']))
        elements.append(Spacer(1, 0.3 * inch))

    def _add_footer(self, canvas, doc):
        """
        Agrega el footer con número de página.

        Args:
            canvas: Canvas de ReportLab
            doc: Documento
        """
        canvas.saveState()
        canvas.setFont('Helvetica', 9)
        canvas.setFillColor(colors.HexColor('#6b7280'))

        # Número de página
        page_num = f"Página {doc.page}"
        canvas.drawRightString(
            doc.width + doc.leftMargin,
            0.5 * inch,
            page_num
        )

        # Texto del footer
        footer_text = "Sistema Per Cápita FONASA"
        canvas.drawString(doc.leftMargin, 0.5 * inch, footer_text)

        canvas.restoreState()

    def generate_estadisticas_report(
        self,
        data: Dict[str, Any],
        filename: Optional[str] = None
    ) -> BytesIO:
        """
        Genera reporte de estadísticas generales.

        Args:
            data: Diccionario con datos estadísticos
            filename: Nombre del archivo (opcional)

        Returns:
            BytesIO con el contenido del PDF
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=1*inch,
            bottomMargin=1*inch,
        )

        elements = []

        # Header
        self._add_header(
            elements,
            "Reporte de Estadísticas",
            "Sistema Per Cápita FONASA"
        )

        # Resumen general
        resumen_data = [
            ['Métrica', 'Valor'],
            ['Total de Usuarios', str(data.get('total_usuarios', 0))],
            ['Usuarios Validados', str(data.get('usuarios_validados', 0))],
            ['Usuarios No Validados', str(data.get('usuarios_no_validados', 0))],
            ['Nuevos Este Mes', str(data.get('nuevos_mes', 0))],
        ]

        tabla_resumen = Table(resumen_data, colWidths=[3*inch, 2*inch])
        tabla_resumen.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 12),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.HexColor('#f3f4f6')),
            ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 10),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
        ]))

        elements.append(tabla_resumen)
        elements.append(Spacer(1, 0.5 * inch))

        # Distribución por centro
        if 'por_centro' in data and data['por_centro']:
            elements.append(Paragraph("Distribución por Centro", self.styles['CustomSubtitle']))
            elements.append(Spacer(1, 0.2 * inch))

            centro_data = [['Centro', 'Total', 'Validados', 'No Validados']]
            for centro in data['por_centro']:
                centro_data.append([
                    centro.get('nombre', ''),
                    str(centro.get('total', 0)),
                    str(centro.get('validados', 0)),
                    str(centro.get('no_validados', 0)),
                ])

            tabla_centros = Table(centro_data, colWidths=[2.5*inch, 1.5*inch, 1.5*inch, 1.5*inch])
            tabla_centros.setStyle(TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('FONTSIZE', (0, 0), (-1, 0), 11),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.white),
                ('GRID', (0, 0), (-1, -1), 1, colors.HexColor('#e5e7eb')),
                ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
                ('FONTSIZE', (0, 1), (-1, -1), 10),
                ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
            ]))

            elements.append(tabla_centros)

        # Construir PDF
        doc.build(elements, onFirstPage=self._add_footer, onLaterPages=self._add_footer)
        buffer.seek(0)
        return buffer

    def generate_usuarios_list_report(
        self,
        usuarios: List[Dict[str, Any]],
        filters: Optional[Dict[str, Any]] = None
    ) -> BytesIO:
        """
        Genera reporte con listado de usuarios.

        Args:
            usuarios: Lista de usuarios
            filters: Filtros aplicados (opcional)

        Returns:
            BytesIO con el contenido del PDF
        """
        buffer = BytesIO()
        doc = SimpleDocTemplate(
            buffer,
            pagesize=A4,
            rightMargin=0.75*inch,
            leftMargin=0.75*inch,
            topMargin=1*inch,
            bottomMargin=1*inch,
        )

        elements = []

        # Header
        subtitle = "Listado de Usuarios"
        if filters:
            filter_text = ", ".join([f"{k}: {v}" for k, v in filters.items()])
            subtitle += f" ({filter_text})"

        self._add_header(
            elements,
            "Reporte de Usuarios",
            subtitle
        )

        # Tabla de usuarios
        table_data = [['RUN', 'Nombre Completo', 'Centro', 'Estado']]

        for usuario in usuarios[:100]:  # Limitar a 100 para no saturar
            table_data.append([
                usuario.get('run', ''),
                usuario.get('nombre_completo', ''),
                usuario.get('centro', ''),
                usuario.get('estado', ''),
            ])

        tabla = Table(table_data, colWidths=[1.5*inch, 2.5*inch, 2*inch, 1.5*inch])
        tabla.setStyle(TableStyle([
            ('BACKGROUND', (0, 0), (-1, 0), colors.HexColor('#3b82f6')),
            ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
            ('ALIGN', (0, 0), (-1, -1), 'LEFT'),
            ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
            ('FONTSIZE', (0, 0), (-1, 0), 10),
            ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
            ('BACKGROUND', (0, 1), (-1, -1), colors.white),
            ('GRID', (0, 0), (-1, -1), 0.5, colors.HexColor('#e5e7eb')),
            ('FONTNAME', (0, 1), (-1, -1), 'Helvetica'),
            ('FONTSIZE', (0, 1), (-1, -1), 8),
            ('ROWBACKGROUNDS', (0, 1), (-1, -1), [colors.white, colors.HexColor('#f9fafb')]),
        ]))

        elements.append(tabla)

        if len(usuarios) > 100:
            elements.append(Spacer(1, 0.2 * inch))
            nota = f"Nota: Se muestran los primeros 100 de {len(usuarios)} registros totales."
            elements.append(Paragraph(nota, self.styles['Normal']))

        # Construir PDF
        doc.build(elements, onFirstPage=self._add_footer, onLaterPages=self._add_footer)
        buffer.seek(0)
        return buffer


# Instancia global del generador
pdf_generator = PDFGenerator() if REPORTLAB_AVAILABLE else None
