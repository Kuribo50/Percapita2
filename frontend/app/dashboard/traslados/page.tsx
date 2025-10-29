export default function TrasladosPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Traslados</h1>
        <p className="text-gray-600">Historial y seguimiento de traslados</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
          <p className="text-sm text-gray-600">Pendientes</p>
          <p className="text-2xl font-bold text-gray-800">0</p>
        </div>
        <div className="bg-green-50 rounded-lg p-4 border-l-4 border-green-500">
          <p className="text-sm text-gray-600">Aprobados</p>
          <p className="text-2xl font-bold text-gray-800">0</p>
        </div>
        <div className="bg-red-50 rounded-lg p-4 border-l-4 border-red-500">
          <p className="text-sm text-gray-600">Rechazados</p>
          <p className="text-2xl font-bold text-gray-800">0</p>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-lg font-semibold mb-4">Últimos Traslados</h2>
        <div className="space-y-3">
          <p className="text-sm text-gray-500">Sin traslados registrados todavía.</p>
        </div>
      </div>
    </div>
  );
}
