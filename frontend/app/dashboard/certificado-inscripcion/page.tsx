'use client';

import { useState } from 'react';
import RutInput from '@/components/RutInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { AnimatedCard } from '@/components/magicui/animated-card';
import { FileText, Download, Eye, Info, Calendar, Building2, User } from 'lucide-react';

export default function CertificadoInscripcionPage() {
  const [rut, setRut] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <AnimatedCard delay={0}>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-green-600 via-green-700 to-emerald-800 opacity-5 dark:opacity-10" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-green-100 dark:bg-green-900/30">
                    <FileText className="h-8 w-8 text-green-600 dark:text-green-400" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold">Certificado de Inscripción</CardTitle>
                    <CardDescription className="text-base mt-1">
                      Generación de certificados de inscripción
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm">
                  <FileText className="h-3 w-3 mr-1" />
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
                Complete los datos para generar el certificado
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
                      Fecha Inscripción
                    </Label>
                    <Input
                      id="fecha"
                      type="date"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="centro" className="flex items-center gap-2">
                      <Building2 className="h-4 w-4" />
                      Centro de Salud
                    </Label>
                    <Input
                      id="centro"
                      type="text"
                      placeholder="Se completará automáticamente"
                      disabled
                    />
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button type="button" className="flex-1 gap-2">
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

        {/* Info Note */}
        <AnimatedCard delay={0.2}>
          <Card className="border-blue-200 dark:border-blue-900/50 bg-blue-50/50 dark:bg-blue-950/20">
            <CardContent className="p-4">
              <div className="flex items-start gap-3">
                <div className="p-2 rounded-lg bg-blue-100 dark:bg-blue-900/30 shrink-0">
                  <Info className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                    Información Importante
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    El certificado se generará en formato PDF y podrá ser descargado o enviado por correo electrónico. Asegúrese de que los datos ingresados sean correctos antes de generar el documento.
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
