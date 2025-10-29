'use client';

import { useAuth } from '@/contexts/AuthContext';

export default function DashboardPage() {
  const { user } = useAuth();

  const stats = [
    { title: 'Nuevos Usuarios', value: '0', color: 'blue', icon: '👥' },
    { title: 'Traslados Pendientes', value: '0', color: 'yellow', icon: '📋' },
    { title: 'Certificados Generados', value: '0', color: 'green', icon: '📄' },
    { title: 'Revisiones Diarias', value: '0', color: 'purple', icon: '✓' },
  ];

  const actividadReciente: Array<{ action: string; user: string; time: string }> = [];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">
          Bienvenido, {user?.nombre} {user?.apellido}
        </h1>
        <p className="text-gray-600">
          Sistema de Gestión de Usuarios - Panel de Control
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div
            key={stat.title}
            className={`bg-white rounded-lg shadow-md p-6 border-l-4 border-${stat.color}-500 hover:shadow-lg transition-shadow`}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-500 text-sm font-medium mb-1">
                  {stat.title}
                </p>
                <p className="text-3xl font-bold text-gray-800">
                  {stat.value}
                </p>
              </div>
              <div className="text-4xl">{stat.icon}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Acciones Rápidas
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <button className="p-4 bg-blue-50 hover:bg-blue-100 rounded-lg text-left transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center text-white text-xl">
                ➕
              </div>
              <div>
                <p className="font-semibold text-gray-800">Nuevo Usuario</p>
                <p className="text-sm text-gray-600">Registrar usuario nuevo</p>
              </div>
            </div>
          </button>

          <button className="p-4 bg-green-50 hover:bg-green-100 rounded-lg text-left transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white text-xl">
                📄
              </div>
              <div>
                <p className="font-semibold text-gray-800">Generar Certificado</p>
                <p className="text-sm text-gray-600">Crear nuevo certificado</p>
              </div>
            </div>
          </button>

          <button className="p-4 bg-purple-50 hover:bg-purple-100 rounded-lg text-left transition-colors">
            <div className="flex items-center space-x-3">
              <div className="w-12 h-12 bg-purple-500 rounded-full flex items-center justify-center text-white text-xl">
                📊
              </div>
              <div>
                <p className="font-semibold text-gray-800">Revisión Diaria</p>
                <p className="text-sm text-gray-600">Ver revisiones del día</p>
              </div>
            </div>
          </button>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold text-gray-800 mb-4">
          Actividad Reciente
        </h2>
        <div className="space-y-3">
          {actividadReciente.length === 0 ? (
            <p className="text-sm text-gray-500">Aún no hay actividad registrada.</p>
          ) : (
            actividadReciente.map((activity, index) => (
              <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center space-x-3">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <div>
                    <p className="font-medium text-gray-800">{activity.action}</p>
                    <p className="text-sm text-gray-600">{activity.user}</p>
                  </div>
                </div>
                <span className="text-sm text-gray-500">{activity.time}</span>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
