export default function RevisionDiariaPage() {
  const fechaHoy = new Date().toLocaleDateString('es-CL');
  
  const actividadPorHora: Array<{ hora: string; cantidad: number; porcentaje: number }> = [];

  const resumenOperaciones = [
    { etiqueta: 'Inscripción', valor: 0 },
    { etiqueta: 'Renuncia', valor: 0 },
    { etiqueta: 'Residencia', valor: 0 },
  ];

  const traslados = [
    { etiqueta: 'Aprobados', valor: 0 },
    { etiqueta: 'Rechazados', valor: 0 },
    { etiqueta: 'Pendientes', valor: 0 },
  ];

  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Revisión Diaria</h1>
        <p className="text-gray-600">Resumen de actividades del día - {fechaHoy}</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
          <p className="text-gray-600 text-sm mb-1">Ingresos del día</p>
          <p className="text-3xl font-bold text-gray-800">0</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
          <p className="text-gray-600 text-sm mb-1">Aprobaciones</p>
          <p className="text-3xl font-bold text-gray-800">0</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
          <p className="text-gray-600 text-sm mb-1">Pendientes</p>
          <p className="text-3xl font-bold text-gray-800">0</p>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
          <p className="text-gray-600 text-sm mb-1">Rechazos</p>
          <p className="text-3xl font-bold text-gray-800">0</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Actividad por Hora</h2>
        <div className="space-y-2">
          {actividadPorHora.length === 0 ? (
            <p className="text-sm text-gray-500">Aún no hay registros para mostrar.</p>
          ) : (
            actividadPorHora.map((item) => (
              <div key={item.hora} className="flex items-center">
                <span className="w-20 text-sm text-gray-600">{item.hora}</span>
                <div className="flex-1 bg-gray-200 rounded-full h-6">
                  <div
                    className="bg-blue-500 h-6 rounded-full flex items-center justify-end pr-2"
                    style={{ width: `${item.porcentaje}%` }}
                  >
                    <span className="text-xs text-white font-semibold">
                      {item.cantidad}
                    </span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Resumen de Operaciones</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Certificados Generados</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {resumenOperaciones.map((item) => (
                <li key={item.etiqueta}>• {item.etiqueta}: {item.valor}</li>
              ))}
            </ul>
          </div>
          <div className="border border-gray-200 rounded-lg p-4">
            <h3 className="font-semibold text-gray-800 mb-2">Traslados Procesados</h3>
            <ul className="space-y-1 text-sm text-gray-600">
              {traslados.map((item) => (
                <li key={item.etiqueta}>• {item.etiqueta}: {item.valor}</li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
