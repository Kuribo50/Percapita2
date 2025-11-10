'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import { Loader2, ArrowLeft } from 'lucide-react';
import { useCatalogos } from '@/lib/hooks';
import UsuarioDetalleView from '@/components/nuevos-usuarios/UsuarioDetalleView';
import EditUsuarioModal from '@/components/nuevos-usuarios/EditUsuarioModal';
import { NuevoUsuario } from '@/types';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export default function UsuarioDetallePage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const [usuario, setUsuario] = useState<NuevoUsuario | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);

  const {
    etnias,
    nacionalidades,
    sectores,
    subsectores,
    establecimientos,
    loading: loadingCatalogos,
  } = useCatalogos();

  const catalogos = useMemo(() => ({
    etnias: etnias.map((etnia) => ({ id: etnia.id, nombre: etnia.nombre, codigo: etnia.codigo, activo: etnia.activo })),
    nacionalidades: nacionalidades.map((nac) => ({ id: nac.id, nombre: nac.nombre, codigo: nac.codigo, activo: nac.activo })),
    sectores: sectores.map((sector) => ({ id: sector.id, nombre: sector.nombre, codigo: sector.codigo, activo: sector.activo })),
    subsectores: subsectores.map((subsector) => ({ id: subsector.id, nombre: subsector.nombre, codigo: subsector.codigo, activo: subsector.activo })),
    establecimientos: establecimientos.map((est) => ({ id: est.id, nombre: est.nombre, codigo: est.codigo, activo: est.activo })),
  }), [etnias, nacionalidades, sectores, subsectores, establecimientos]);

  const fetchUsuario = useCallback(async () => {
    if (!id) return;
    try {
      setLoading(true);
      setError(null);
      const response = await fetch(`${API_URL}/api/nuevos-usuarios/${id}/`, {
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Usuario no encontrado');
        }
        throw new Error('No fue posible cargar el usuario');
      }

      const data = await response.json();
      setUsuario(data);
    } catch (err) {
      console.error('Error al cargar usuario:', err);
      setError(err instanceof Error ? err.message : 'Error al cargar el usuario');
      setUsuario(null);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchUsuario();
  }, [fetchUsuario]);

  const handleDelete = useCallback(async (usuarioId: number) => {
    try {
      const response = await fetch(`${API_URL}/api/nuevos-usuarios/${usuarioId}/`, {
        method: 'DELETE',
        headers: {
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
      });

      if (!response.ok) {
        throw new Error('No fue posible eliminar el usuario');
      }

      toast.success('Usuario eliminado correctamente');
      router.push('/dashboard/nuevos-usuarios/gestion');
    } catch (err) {
      console.error('Error al eliminar usuario:', err);
      toast.error(err instanceof Error ? err.message : 'Error al eliminar el usuario');
    }
  }, [router]);

  const handleEditSuccess = useCallback(() => {
    setEditModalOpen(false);
    toast.success('Usuario actualizado correctamente');
    fetchUsuario();
  }, [fetchUsuario]);

  const isLoading = loading || loadingCatalogos;

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="container mx-auto px-6 py-8 space-y-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/dashboard/nuevos-usuarios/gestion')}
              className="flex items-center gap-2 text-gray-600 dark:text-gray-300"
            >
              <ArrowLeft className="w-4 h-4" />
              Volver
            </Button>
            <h1 className="text-2xl font-semibold text-gray-900 dark:text-gray-100">Detalle de usuario</h1>
          </div>
        </div>

        {isLoading ? (
          <div className="flex flex-col items-center justify-center py-24">
            <Loader2 className="w-8 h-8 animate-spin text-green-600" />
            <p className="mt-3 text-sm text-gray-500 dark:text-gray-400">Cargando información del usuario...</p>
          </div>
        ) : error ? (
          <Alert className="bg-red-50 border-red-200 dark:bg-red-950/20 dark:border-red-800">
            <AlertDescription className="text-red-800 dark:text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        ) : usuario ? (
          <UsuarioDetalleView
            usuario={usuario}
            catalogos={catalogos}
            onDelete={handleDelete}
            onEdit={() => setEditModalOpen(true)}
          />
        ) : (
          <Alert className="bg-amber-50 border-amber-200 dark:bg-amber-950/20 dark:border-amber-800">
            <AlertDescription className="text-amber-800 dark:text-amber-300">
              No se encontró el usuario solicitado.
            </AlertDescription>
          </Alert>
        )}
      </div>

      {editModalOpen && usuario && (
        <EditUsuarioModal
          isOpen={editModalOpen}
          onClose={() => setEditModalOpen(false)}
          usuario={usuario}
          catalogos={catalogos}
          onSuccess={handleEditSuccess}
        />
      )}
    </div>
  );
}
