export default function RechazosPage() {
  return (
    <div className="space-y-6">
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Rechazos</h1>
        <p className="text-gray-600">Gestión de solicitudes rechazadas</p>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="space-y-4">
          <div className="border border-red-200 bg-red-50 rounded-lg p-4 text-sm text-red-700">
            No existen rechazos pendientes por mostrar.
          </div>
        </div>
      </div>
    </div>
  );
}
