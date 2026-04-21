/**
 * Normaliza un valor a número porcentual (0-100).
 * Maneja strings como "52.17%", decimales como 0.72, y números directos como 52.17.
 */
export function parsePercent(val) {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'string') {
    const cleaned = val.replace('%', '').trim();
    const num = parseFloat(cleaned);
    if (isNaN(num)) return null;
    return num; // ya viene como porcentaje "52.17" de "52.17%"
  }
  if (typeof val === 'number') {
    if (isNaN(val)) return null;
    // Si es menor que 2 (ej: 0.72, 0.90) → es decimal fraccionario
    if (val <= 1.5) return val * 100;
    return val;
  }
  return null;
}

/**
 * Normaliza un valor numérico genérico (horas, toneladas, usuarios, etc.)
 */
export function parseNum(val) {
  if (val === null || val === undefined || val === '') return null;
  if (typeof val === 'string') {
    const cleaned = val.replace('%', '').trim();
    const num = parseFloat(cleaned);
    return isNaN(num) ? null : num;
  }
  if (typeof val === 'number') return isNaN(val) ? null : val;
  return null;
}

/**
 * Convierte serial de fecha Excel a { year, month }
 */
export function parseExcelDate(serial) {
  if (!serial || typeof serial !== 'number') return null;
  // Excel epoch: Jan 1 1900 = day 1 (with leap year bug)
  const utcDays = serial - 25569; // diff entre epoch Excel y Unix
  const utcMs = utcDays * 86400 * 1000;
  const date = new Date(utcMs);
  return {
    year: date.getUTCFullYear(),
    month: date.getUTCMonth() + 1, // 1-12
  };
}

/**
 * Parsea una fila raw del Excel a un objeto normalizado.
 */
export function parseRow(raw) {
  const dateInfo = parseExcelDate(raw['Fecha']);
  if (!dateInfo) return null;

  const produccion = parseNum(raw['produccion acueducto']);
  const consumo = parseNum(raw['consumo acueducto']);
  
  // IANC Mensual calculado = (producción - consumo) / producción * 100
  let iancMensual = null;
  if (produccion !== null && consumo !== null && produccion > 0) {
    iancMensual = ((produccion - consumo) / produccion) * 100;
  }

  // IANC Acumulado (Promedio de 12 meses) viene directamente del Excel
  const iancAcumuladoExcel = parsePercent(raw['ianc promedio']);

  return {
    year: dateInfo.year,
    month: dateInfo.month,
    // Acueducto
    coberturaAcueducto: parsePercent(raw['Cobertura acueducto']),
    usuariosAcueducto: parseNum(raw['Usuarios acueducto']),
    micromedicionNominal: parsePercent(raw['Micromedicion nominal']),
    micromedicionReal: parsePercent(raw['Micromedicion real']),
    irca: parsePercent(raw['IRCA']),
    iancMensual: iancMensual,
    iancAcumuladoExcel: iancAcumuladoExcel,
    produccion: produccion,
    consumo: consumo,
    continuidad: parseNum(raw['Continuidad acueducto']),
    // Alcantarillado
    coberturaAlcantarillado: parsePercent(raw['Cobertura alcantarillado']),
    usuariosAlcantarillado: parseNum(raw['usuarios alcantarillado']),
    // Aseo
    coberturaAseo: parsePercent(raw['Cobertura aseo']),
    usuariosAseo: parseNum(raw['Usuarios aseo']),
    barrido: parseNum(raw['Barrido']),
    continuidadAseo: parsePercent(raw['Continuidad aseo']),
    produccionResiduos: parseNum(raw['Produccion de residuos']),
  };
}

/**
 * Procesa el workbook completo de xlsx y retorna array de filas normalizadas.
 */
export function processWorkbook(wb) {
  const sheetName = wb.SheetNames[0];
  const ws = wb.Sheets[sheetName];
  const raw = wb.utils
    ? wb.utils.sheet_to_json(ws)
    : null;
  return raw;
}

/**
 * Obtiene años disponibles (únicos, ordenados)
 */
export function getAvailableYears(data) {
  const years = [...new Set(data.map(r => r.year))].sort((a, b) => a - b);
  return years;
}

/**
 * Obtiene meses disponibles para un año dado (únicos, ordenados)
 */
export function getAvailableMonths(data, year) {
  const months = [...new Set(
    data.filter(r => r.year === year).map(r => r.month)
  )].sort((a, b) => a - b);
  return months;
}

/**
 * Filtra datos por año y mes
 */
export function filterData(data, year, month) {
  return data.find(r => r.year === year && r.month === month) || null;
}

/**
 * Filtra datos por año (todos los meses de Enero a Diciembre)
 */
export function filterByYear(data, year) {
  const yearlyRaw = data.filter(r => r.year === year);
  const fullYear = [];
  for (let m = 1; m <= 12; m++) {
    const found = yearlyRaw.find(r => r.month === m);
    fullYear.push(found || { year, month: m });
  }
  return fullYear;
}

/**
 * Calcula el IANC acumulado: promedio de los últimos 12 meses hasta el mes seleccionado
 */
export function calcIancAcumulado(data, year, month) {
  // Construimos todos los meses hasta la fecha seleccionada
  const allSorted = [...data].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
  const idx = allSorted.findIndex(r => r.year === year && r.month === month);
  if (idx === -1) return null;
  const slice = allSorted.slice(Math.max(0, idx - 11), idx + 1);
  const valid = slice.filter(r => r.ianc !== null).map(r => r.ianc);
  if (valid.length === 0) return null;
  return valid.reduce((a, b) => a + b, 0) / valid.length;
}

/**
 * Obtiene los últimos N meses de datos antes del mes seleccionado (inclusive)
 */
export function getLastNMonths(data, year, month, n = 7) {
  const allSorted = [...data].sort((a, b) => {
    if (a.year !== b.year) return a.year - b.year;
    return a.month - b.month;
  });
  const idx = allSorted.findIndex(r => r.year === year && r.month === month);
  if (idx === -1) return [];
  return allSorted.slice(Math.max(0, idx - n + 1), idx + 1);
}

export const MONTH_NAMES = {
  1: 'ENE', 2: 'FEB', 3: 'MAR', 4: 'ABR', 5: 'MAY', 6: 'JUN',
  7: 'JUL', 8: 'AGO', 9: 'SEP', 10: 'OCT', 11: 'NOV', 12: 'DIC'
};

export const MONTH_NAMES_FULL = {
  1: 'Enero', 2: 'Febrero', 3: 'Marzo', 4: 'Abril', 5: 'Mayo', 6: 'Junio',
  7: 'Julio', 8: 'Agosto', 9: 'Septiembre', 10: 'Octubre', 11: 'Noviembre', 12: 'Diciembre'
};
