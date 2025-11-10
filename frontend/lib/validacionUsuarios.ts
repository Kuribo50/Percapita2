import type { NuevoUsuario } from "@/types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://127.0.0.1:8000";

export interface ResultadoValidacion {
  estado: "VALIDADO" | "NO_VALIDADO" | "PENDIENTE" | "FALLECIDO";
  ultimoCorte?: { mes: number; anio: number };
  existeEnCorte: boolean;
  debeActualizar: boolean;
  infoValidacion?: {
    aceptadoRechazado?: string;
    motivo?: string;
    motivoNormalizado?: string;
  };
}

const normalizeRun = (run: string) => {
  return run.replace(/[.\s-]/g, "").toUpperCase();
};

/**
 * Valida si un usuario existe en los cortes FONASA y determina su estado
 *
 * Lógica de validación:
 * 1. FALLECIDO: Si el motivo incluye "FALLECIDO"
 * 2. NO_VALIDADO:
 *    - Si aceptado_rechazado incluye "RECHAZADO"
 *    - Si el motivo incluye "TRASLADO NEGATIVO" o "RECHAZADO PREVISIONAL"
 *    - Si NO aparece en ningún corte y su fecha de inscripción es anterior o igual al último corte
 * 3. VALIDADO: Si aceptado_rechazado incluye "ACEPTADO" o "MANTIENE"
 * 4. PENDIENTE: Si la fecha de inscripción es posterior al último corte disponible
 */
const NON_VALIDATED_MOTIVOS = ["TRASLADO NEGATIVO", "RECHAZADO PREVISIONAL"];

export async function validarUsuarioEnCorte(
  run: string,
  fechaInscripcion: string,
  estadoActual?: "VALIDADO" | "NO_VALIDADO" | "PENDIENTE" | "FALLECIDO"
): Promise<ResultadoValidacion> {
  try {
    console.log("=== VALIDANDO USUARIO ===");
    console.log("RUN:", run);
    console.log("Fecha Inscripción:", fechaInscripcion);
    console.log("Estado Actual:", estadoActual);

    // 1. Obtener información del último corte FONASA
    const corteSummaryResponse = await fetch(
      `${API_BASE_URL}/api/corte-fonasa/?summary_only=true`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!corteSummaryResponse.ok) {
      console.warn(
        `Error al obtener summary del corte: ${corteSummaryResponse.status}`
      );
      return {
        estado: "PENDIENTE",
        existeEnCorte: false,
        debeActualizar: estadoActual !== "PENDIENTE",
      };
    }

    const corteSummaryData = await corteSummaryResponse.json();
    const summary = corteSummaryData.summary || [];

    console.log("Cortes disponibles:", summary);

    if (summary.length === 0) {
      console.log("No hay cortes disponibles");
      return {
        estado: "PENDIENTE",
        existeEnCorte: false,
        debeActualizar: estadoActual !== "PENDIENTE",
      };
    }

    // El primer elemento del summary es el corte más reciente
    const ultimoCorte = summary[0];
    const [anioStr, mesStr] = ultimoCorte.month.split("-");
    const ultimoCorteAnio = parseInt(anioStr);
    const ultimoCorteMs = parseInt(mesStr);

    const ultimoCorteInfo = { mes: ultimoCorteMs, anio: ultimoCorteAnio };

    console.log("Último corte disponible:", ultimoCorteInfo);

    // 2. Extraer mes y año de la fecha de inscripción
    // Importante: parsear la fecha correctamente sin problemas de zona horaria
    if (!fechaInscripcion) {
      console.error("❌ ERROR: fechaInscripcion está vacía o undefined");
      return {
        estado: "PENDIENTE",
        existeEnCorte: false,
        debeActualizar: false,
      };
    }

    const partes = fechaInscripcion.split("-");
    if (partes.length !== 3) {
      console.error("❌ ERROR: Formato de fecha inválido:", fechaInscripcion);
      return {
        estado: "PENDIENTE",
        existeEnCorte: false,
        debeActualizar: false,
      };
    }

    const [anioInsc, mesInsc] = partes.map(Number);
    const mesInscripcion = mesInsc;
    const anioInscripcion = anioInsc;

    console.log("Fecha inscripción procesada:", {
      mes: mesInscripcion,
      anio: anioInscripcion,
      original: fechaInscripcion,
    });

    // 3. Comparar directamente año y mes (más confiable que fechas)
    const inscripcionAnioMes = anioInscripcion * 100 + mesInscripcion; // ej: 202501
    const ultimoCorteAnioMes = ultimoCorteAnio * 100 + ultimoCorteMs; // ej: 202509

    console.log("Comparando periodos:");
    console.log(
      "  Inscripción:",
      inscripcionAnioMes,
      `(${mesInscripcion}/${anioInscripcion})`
    );
    console.log(
      "  Último corte:",
      ultimoCorteAnioMes,
      `(${ultimoCorteMs}/${ultimoCorteAnio})`
    );
    console.log(
      "  ¿Inscripción > Último corte?",
      inscripcionAnioMes > ultimoCorteAnioMes
    );

    // 4. Si el mes de inscripción es posterior al último corte disponible
    if (inscripcionAnioMes > ultimoCorteAnioMes) {
      const nuevoEstado = "PENDIENTE";
      console.log("Usuario inscrito después del último corte → PENDIENTE");
      return {
        estado: nuevoEstado,
        ultimoCorte: ultimoCorteInfo,
        existeEnCorte: false,
        debeActualizar: estadoActual !== nuevoEstado,
      };
    }

    // 5. El mes de inscripción ya debería estar en los cortes disponibles
    // Buscar si el RUN existe en CUALQUIER corte
    const corteSearchResponse = await fetch(
      `${API_BASE_URL}/api/corte-fonasa/?search=${encodeURIComponent(
        run
      )}&all=true`,
      {
        headers: {
          Accept: "application/json",
        },
      }
    );

    if (!corteSearchResponse.ok) {
      console.warn(
        `Error al buscar RUN en corte: ${corteSearchResponse.status}`
      );
      return {
        estado: "PENDIENTE",
        ultimoCorte: ultimoCorteInfo,
        existeEnCorte: false,
        debeActualizar: estadoActual !== "PENDIENTE",
      };
    }

    const corteSearchData = await corteSearchResponse.json();
    const corteRows = corteSearchData.rows || [];
    console.log(`Encontrados ${corteRows.length} registros en cortes`);

    const normalize = (value: string | undefined) =>
      (value ?? "").toString().trim().toUpperCase();

    const matchedRow = corteRows.find(
      (row: { run: string }) => normalizeRun(row.run) === normalizeRun(run)
    ) as
      | {
          run: string;
          motivo?: string;
          motivo_normalizado?: string;
          aceptadoRechazado?: string;
        }
      | undefined;

    const existeEnCorte = Boolean(matchedRow);
    console.log("¿Existe en corte?", existeEnCorte);

    if (matchedRow) {
      console.log("Datos del corte:", {
        aceptadoRechazado: matchedRow.aceptadoRechazado,
        motivo: matchedRow.motivo,
        motivo_normalizado: matchedRow.motivo_normalizado,
      });
    }

    let nuevoEstado: "VALIDADO" | "NO_VALIDADO" | "PENDIENTE" | "FALLECIDO";

    if (matchedRow) {
      const motivo =
        normalize(matchedRow.motivo) ||
        normalize(matchedRow.motivo_normalizado);
      const aceptadoRechazado = normalize(matchedRow.aceptadoRechazado);

      console.log("Evaluando estado...");
      console.log("  Motivo normalizado:", motivo);
      console.log("  Aceptado/Rechazado:", aceptadoRechazado);

      // Primero verificar si está fallecido
      if (motivo.includes("FALLECIDO")) {
        nuevoEstado = "FALLECIDO";
        console.log("→ FALLECIDO (motivo contiene FALLECIDO)");
      }
      // Verificar si está rechazado
      else if (aceptadoRechazado.includes("RECHAZADO")) {
        nuevoEstado = "NO_VALIDADO";
        console.log("→ NO_VALIDADO (aceptado_rechazado contiene RECHAZADO)");
      }
      // Verificar motivos específicos de no validación
      else if (
        motivo &&
        NON_VALIDATED_MOTIVOS.some((valor) => motivo.includes(valor))
      ) {
        nuevoEstado = "NO_VALIDADO";
        console.log("→ NO_VALIDADO (motivo en lista de no validados)");
      }
      // Si está aceptado o mantiene inscripción, está validado
      else if (
        aceptadoRechazado.includes("ACEPTADO") ||
        aceptadoRechazado.includes("MANTIENE")
      ) {
        nuevoEstado = "VALIDADO";
        console.log("→ VALIDADO (aceptado o mantiene inscripción)");
      }
      // Si existe en el corte pero no tiene estado claro, considerarlo validado
      else {
        nuevoEstado = "VALIDADO";
        console.log("→ VALIDADO (existe en corte, estado por defecto)");
      }
    } else {
      // El usuario NO existe en ningún corte
      // Si la fecha de inscripción es anterior o igual al último corte disponible,
      // significa que YA DEBERÍA aparecer en los cortes, por lo tanto está NO_VALIDADO
      if (inscripcionAnioMes <= ultimoCorteAnioMes) {
        nuevoEstado = "NO_VALIDADO";
        console.log("→ NO_VALIDADO (no aparece en corte pero debería estar)");
      } else {
        // Si la fecha de inscripción es posterior al último corte, está PENDIENTE
        nuevoEstado = "PENDIENTE";
        console.log("→ PENDIENTE (inscripción posterior al último corte)");
      }
    }

    console.log("Estado final:", nuevoEstado);
    console.log("¿Debe actualizar?", estadoActual !== nuevoEstado);
    console.log("======================");

    return {
      estado: nuevoEstado,
      ultimoCorte: ultimoCorteInfo,
      existeEnCorte,
      debeActualizar: estadoActual !== nuevoEstado,
      infoValidacion: matchedRow
        ? {
            aceptadoRechazado: matchedRow.aceptadoRechazado || "",
            motivo: matchedRow.motivo || "",
            motivoNormalizado: matchedRow.motivo_normalizado || "",
          }
        : !matchedRow && inscripcionAnioMes <= ultimoCorteAnioMes
        ? {
            aceptadoRechazado: "NO APARECE EN CORTE",
            motivo:
              "Usuario inscrito pero no aparece en ningún corte FONASA disponible",
            motivoNormalizado: "NO APARECE EN CORTE",
          }
        : undefined,
    };
  } catch (error) {
    console.error("Error al validar usuario en corte:", error);
    console.error("API_BASE_URL:", API_BASE_URL);
    console.error("RUN:", run);
    return {
      estado: "PENDIENTE",
      existeEnCorte: false,
      debeActualizar: false,
    };
  }
}

/**
 * Actualiza el estado de un usuario en el backend
 */
export async function actualizarEstadoUsuario(
  usuarioId: number,
  nuevoEstado: "VALIDADO" | "NO_VALIDADO" | "PENDIENTE" | "FALLECIDO"
): Promise<boolean> {
  try {
    const response = await fetch(
      `${API_BASE_URL}/api/nuevos-usuarios/${usuarioId}/`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ estado: nuevoEstado }),
      }
    );

    return response.ok;
  } catch (error) {
    console.error("Error al actualizar estado del usuario:", error);
    return false;
  }
}

/**
 * Valida y actualiza el estado de un usuario
 */
export async function validarYActualizarUsuario(
  usuarioId: number,
  run: string,
  fechaInscripcion: string,
  estadoActual: "VALIDADO" | "NO_VALIDADO" | "PENDIENTE" | "FALLECIDO"
): Promise<{
  nuevoEstado: "VALIDADO" | "NO_VALIDADO" | "PENDIENTE" | "FALLECIDO";
  actualizado: boolean;
}> {
  const resultado = await validarUsuarioEnCorte(
    run,
    fechaInscripcion,
    estadoActual
  );

  if (resultado.debeActualizar) {
    const actualizado = await actualizarEstadoUsuario(
      usuarioId,
      resultado.estado
    );
    return {
      nuevoEstado: resultado.estado,
      actualizado,
    };
  }

  return {
    nuevoEstado: resultado.estado,
    actualizado: false,
  };
}

/**
 * Valida múltiples usuarios en paralelo (VERSIÓN OPTIMIZADA)
 * Usa el endpoint de validación por lotes del backend
 */
export async function validarUsuariosEnMasa(usuarios: NuevoUsuario[]): Promise<{
  totalValidados: number;
  totalActualizados: number;
  resultados: Array<{
    id: number;
    estadoAnterior: "VALIDADO" | "NO_VALIDADO" | "PENDIENTE" | "FALLECIDO";
    estadoNuevo: "VALIDADO" | "NO_VALIDADO" | "PENDIENTE" | "FALLECIDO";
    actualizado: boolean;
  }>;
}> {
  const usuariosConId = usuarios.filter(
    (usuario): usuario is NuevoUsuario & { id: number } =>
      typeof usuario.id === "number"
  );

  if (usuariosConId.length === 0) {
    return {
      totalValidados: 0,
      totalActualizados: 0,
      resultados: [],
    };
  }

  // Preparar datos para el endpoint optimizado
  const usuariosParaValidar = usuariosConId.map((usuario) => ({
    id: usuario.id,
    run: usuario.run,
    fechaInscripcion: usuario.fechaInscripcion ?? usuario.fechaSolicitud ?? "",
  }));

  try {
    // Llamar al endpoint de validación por lotes
    const response = await fetch(
      `${API_BASE_URL}/api/nuevos-usuarios/validar-lote/`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ usuarios: usuariosParaValidar }),
      }
    );

    if (!response.ok) {
      throw new Error(`Error en validación por lotes: ${response.status}`);
    }

    const data = await response.json();

    // Mapear resultados al formato esperado
    const resultados = data.resultados.map(
      (resultado: { id: number; estado: string; actualizado: boolean }) => {
        const usuario = usuariosConId.find((u) => u.id === resultado.id);
        return {
          id: resultado.id,
          estadoAnterior: usuario?.estado ?? "PENDIENTE",
          estadoNuevo: resultado.estado as
            | "VALIDADO"
            | "NO_VALIDADO"
            | "PENDIENTE"
            | "FALLECIDO",
          actualizado: resultado.actualizado,
        };
      }
    );

    return {
      totalValidados: data.totalProcesados,
      totalActualizados: data.totalActualizados,
      resultados,
    };
  } catch (error) {
    console.error("Error en validación por lotes:", error);

    // Fallback: validar uno por uno si falla el lote
    console.warn("Fallando a validación individual...");
    return validarUsuariosIndividualmente(usuariosConId);
  }
}

/**
 * Función de respaldo: valida usuarios uno por uno
 * Solo se usa si falla la validación por lotes
 */
async function validarUsuariosIndividualmente(
  usuarios: Array<NuevoUsuario & { id: number }>
): Promise<{
  totalValidados: number;
  totalActualizados: number;
  resultados: Array<{
    id: number;
    estadoAnterior: "VALIDADO" | "NO_VALIDADO" | "PENDIENTE" | "FALLECIDO";
    estadoNuevo: "VALIDADO" | "NO_VALIDADO" | "PENDIENTE" | "FALLECIDO";
    actualizado: boolean;
  }>;
}> {
  const resultados = await Promise.all(
    usuarios.map(async (usuario) => {
      const fechaReferencia =
        usuario.fechaInscripcion ?? usuario.fechaSolicitud;
      if (!fechaReferencia) {
        return {
          id: usuario.id,
          estadoAnterior: usuario.estado,
          estadoNuevo: usuario.estado,
          actualizado: false,
        };
      }

      const resultado = await validarYActualizarUsuario(
        usuario.id,
        usuario.run,
        fechaReferencia,
        usuario.estado
      );

      return {
        id: usuario.id,
        estadoAnterior: usuario.estado,
        estadoNuevo: resultado.nuevoEstado,
        actualizado: resultado.actualizado,
      };
    })
  );

  const totalActualizados = resultados.filter((r) => r.actualizado).length;
  const totalValidados = usuarios.length;

  return {
    totalValidados,
    totalActualizados,
    resultados,
  };
}
