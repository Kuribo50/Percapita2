import { Button } from '@/components/ui/button';
import { AlertCircle, Loader2, LucideIcon } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface FormContainerProps {
  onSubmit: (e: React.FormEvent) => void;
  children: React.ReactNode;
  loading?: boolean;
  error?: string | null;
  success?: string | null;
  submitText?: string;
  submitIcon?: LucideIcon;
  resetText?: string;
  onReset?: () => void;
  className?: string;
}

export function FormContainer({
  onSubmit,
  children,
  loading = false,
  error,
  success,
  submitText = 'Guardar',
  submitIcon: SubmitIcon,
  resetText = 'Limpiar',
  onReset,
  className = '',
}: FormContainerProps) {
  return (
    <form onSubmit={onSubmit} className={`space-y-6 ${className}`}>
      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {success && (
        <Alert className="mb-6 bg-green-50 text-green-900 border-green-200 dark:bg-green-950/20 dark:text-green-300 dark:border-green-800">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{success}</AlertDescription>
        </Alert>
      )}

      {children}

      <div className="flex justify-end gap-3 pt-4">
        {onReset && (
          <Button
            type="button"
            variant="outline"
            onClick={onReset}
            className="px-6"
          >
            {resetText}
          </Button>
        )}
        <Button
          type="submit"
          disabled={loading}
          className="bg-green-600 hover:bg-green-700 text-white px-8"
        >
          {loading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              {SubmitIcon && <SubmitIcon className="w-4 h-4 mr-2" />}
              {submitText}
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
