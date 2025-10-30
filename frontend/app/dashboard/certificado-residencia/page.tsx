'use client';

import { useState } from 'react';
import RutInput from '@/components/RutInput';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { AnimatedCard } from '@/components/magicui/animated-card';
import { MapPin, Download, Eye, Info, Home, Building, Globe2, User, Clock } from 'lucide-react';

export default function CertificadoResidenciaPage() {
  const [rut, setRut] = useState('');
  const [region, setRegion] = useState('');
  const [proposito, setProposito] = useState('');

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
      <div className="max-w-4xl mx-auto px-6 py-8 space-y-6">
        {/* Header */}
        <AnimatedCard delay={0}>
          <Card className="relative overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-br from-indigo-600 via-indigo-700 to-purple-800 opacity-5 dark:opacity-10" />
            <CardHeader className="relative">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 rounded-xl bg-indigo-100 dark:bg-indigo-900/30">
                    <MapPin className="h-8 w-8 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-3xl font-bold">Certificado de Residencia</CardTitle>
                    <CardDescription className="text-base mt-1">
                      Generación de certificados de residencia
                    </CardDescription>
                  </div>
                </div>
                <Badge variant="outline" className="text-sm">
                  <MapPin className="h-3 w-3 mr-1" />
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
                Complete los datos para generar el certificado de residencia
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
                    <Label htmlFor="direccion" className="flex items-center gap-2">
                      <Home className="h-4 w-4" />
                      Dirección
                    </Label>
                    <Input
                      id="direccion"
                      type="text"
                      placeholder="Dirección completa"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="comuna" className="flex items-center gap-2">
                      <Building className="h-4 w-4" />
                      Comuna
                    </Label>
                    <Input
                      id="comuna"
                      type="text"
                      placeholder="Comuna de residencia"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="region" className="flex items-center gap-2">
                      <Globe2 className="h-4 w-4" />
                      Región
                    </Label>
                    <Select value={region} onValueChange={setRegion}>
                      <SelectTrigger id="region">
                        <SelectValue placeholder="Seleccione una región" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="metropolitana">Metropolitana de Santiago</SelectItem>
                        <SelectItem value="valparaiso">Valparaíso</SelectItem>
                        <SelectItem value="biobio">Biobío</SelectItem>
                        <SelectItem value="araucania">Araucanía</SelectItem>
                        <SelectItem value="los-lagos">Los Lagos</SelectItem>
                        <SelectItem value="otra">Otra región</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="tiempo" className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      Tiempo de Residencia
                    </Label>
                    <Input
                      id="tiempo"
                      type="text"
                      placeholder="Ej: 2 años, 6 meses"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="proposito">Propósito del Certificado</Label>
                  <Select value={proposito} onValueChange={setProposito}>
                    <SelectTrigger id="proposito">
                      <SelectValue placeholder="Seleccione el propósito" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="bancarios">Trámites bancarios</SelectItem>
                      <SelectItem value="escolar">Matrícula escolar</SelectItem>
                      <SelectItem value="legales">Trámites legales</SelectItem>
                      <SelectItem value="laboral">Trámites laborales</SelectItem>
                      <SelectItem value="otro">Otro propósito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button type="button" className="flex-1 gap-2 bg-indigo-600 hover:bg-indigo-700">
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
                    Información del Certificado
                  </p>
                  <p className="text-sm text-blue-800 dark:text-blue-300">
                    Este certificado será generado con la fecha actual y contendrá la información de residencia proporcionada. Asegúrese de que todos los datos sean correctos antes de generarlo.
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
