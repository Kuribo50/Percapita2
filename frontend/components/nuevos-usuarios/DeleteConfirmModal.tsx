'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { AlertTriangle, Trash2 } from 'lucide-react';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  usuarioRun: string;
  usuarioNombre: string;
  isDeleting: boolean;
}

export default function DeleteConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  usuarioRun,
  usuarioNombre,
  isDeleting,
}: DeleteConfirmModalProps) {
  const [inputRun, setInputRun] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const normalizeRun = (run: string) => {
    return run.replace(/[.\s-]/g, '').toUpperCase();
  };

  const handleConfirm = () => {
    setError(null);

    if (!inputRun.trim()) {
      setError('Debe ingresar el RUN para confirmar');
      return;
    }

    if (normalizeRun(inputRun) !== normalizeRun(usuarioRun)) {
      setError('El RUN ingresado no coincide');
      return;
    }

    onConfirm();
  };

  const handleClose = () => {
    if (!isDeleting) {
      setInputRun('');
      setError(null);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[60] p-4">
      <div className="bg-white dark:bg-gray-900 rounded-2xl shadow-2xl max-w-md w-full">
        <div className="p-6 border-b border-gray-200 dark:border-gray-800">
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 dark:bg-red-950/30">
              <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Confirmar Eliminación
              </h2>
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Esta acción no se puede deshacer
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Está a punto de eliminar permanentemente el usuario:
              <div className="mt-2 font-semibold">
                {usuarioNombre}
                <br />
                RUN: {usuarioRun}
              </div>
            </AlertDescription>
          </Alert>

          <div className="space-y-2">
            <Label htmlFor="confirmRun" className="text-gray-700 dark:text-gray-300 font-medium">
              Para confirmar, escriba el RUN del usuario:
            </Label>
            <Input
              id="confirmRun"
              type="text"
              value={inputRun}
              onChange={(e) => {
                setInputRun(e.target.value);
                setError(null);
              }}
              placeholder={usuarioRun}
              className="bg-white dark:bg-gray-900/50 font-mono"
              disabled={isDeleting}
              autoFocus
            />
            {error && (
              <p className="text-sm text-red-600 dark:text-red-400">
                {error}
              </p>
            )}
          </div>
        </div>

        <div className="p-6 pt-0 flex justify-end gap-3">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={isDeleting}
          >
            Cancelar
          </Button>
          <Button
            type="button"
            variant="destructive"
            onClick={handleConfirm}
            disabled={isDeleting}
          >
            {isDeleting ? (
              <>
                <div className="h-4 w-4 rounded-full border-b-2 border-white animate-spin mr-2" />
                Eliminando...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Eliminar Usuario
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
