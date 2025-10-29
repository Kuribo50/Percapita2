'use client';

import { useState } from 'react';
import RutInput from '@/components/RutInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AnimatedCard } from '@/components/magicui/animated-card';
import { FileX, Download, Eye, Info, Calendar, MessageSquare, User, AlertTriangle } from 'lucide-react';

export default function CertificadoRenunciaPage() {
  const [rut, setRut] = useState('');
  const [motivo, setMotivo] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <AnimatedCard delay={0}>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-red-600 via-red-700 to-rose-800 opacity-5 dark:opacity-10" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-red-100 dark:bg-red-900/30">
                    <FileX className="h-8 w-8 text-red-600 dark:text-red-400" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold">Certificado de Renuncia</CardTitle>
                    <CardDescription className="text-base mt-1">
                      Generación de certificados de renuncia al sistema
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm">
                  <FileX className="h-3 w-3 mr-1" />
                  PDF
                </Badge>
              </div>
            </CardHeader>
          </Card>
        </AnimatedCard>

        {/* Form */}
        <AnimatedCard delay={0.1}>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Datos del Paciente
              </CardTitle>
              <CardDescription>
                Complete los datos para generar el certificado de renuncia
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <RutInput
                      value={rut}
                      onChange={setRut}
                      label="RUT Usuario"
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="nombre">Nombre Completo</Label>
                    <Input
                      id="nombre"
                      type="text"
                      placeholder="Se completará automáticamente"
                      disabled
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="fecha" className="flex items-center gap-2">
                      <Calendar className="h-4 w-4" />
                      Fecha Renuncia
                    </Label>
                    <Input
                      id="fecha"
                      type="date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="motivo">Motivo de Renuncia</Label>
                    <Select value={motivo} onValueChange={setMotivo}>
                      <SelectTrigger id="motivo">
                        <SelectValue placeholder="Seleccione un motivo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cambio-sistema">Cambio de sistema</SelectItem>
                        <SelectItem value="traslado">Traslado</SelectItem>
                        <SelectItem value="cambio-comuna">Cambio de comuna</SelectItem>
                        <SelectItem value="otro">Otro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="observaciones" className="flex items-center gap-2">
                    <MessageSquare className="h-4 w-4" />
                    Observaciones
                  </Label>
                  <Textarea
                    id="observaciones"
                    rows={3}
                    placeholder="Observaciones adicionales sobre la renuncia..."
                  />
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button type="button" variant="destructive" className="flex-1 gap-2">
                    <Download className="h-4 w-4" />
                    Generar Certificado PDF
                  </Button>
                  <Button type="button" variant="outline" className="gap-2">
                    <Eye className="h-4 w-4" />
                    Vista Previa
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>
        </AnimatedCard>

        {/* Warning Note */}
        <AnimatedCard delay={0.2}>
          <Card className="border-amber-200 dark:border-amber-900/50 bg-amber-50/50 dark:bg-amber-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-amber-100 dark:bg-amber-900/30 shrink-0">
                  <AlertTriangle className="h-5 w-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-amber-900 dark:text-amber-200 mb-1">
                    Advertencia Importante
                  </p>
                  <p className="text-sm text-amber-800 dark:text-amber-300">
                    La renuncia al sistema de salud es un proceso irreversible. Asegúrese de que el paciente comprende las implicaciones antes de generar el certificado.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </AnimatedCard>
      </div>
    </div>
  );
}
