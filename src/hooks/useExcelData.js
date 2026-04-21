import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  parseRow,
  getAvailableYears,
  getAvailableMonths,
} from '../utils/dataParser';

export function useExcelData(filePath = '/indicadores_epq.xlsx') {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);

  useEffect(() => {
    async function loadExcel() {
      try {
        setLoading(true);
        const response = await fetch(filePath);
        if (!response.ok) throw new Error(`No se pudo cargar ${filePath}`);
        const arrayBuffer = await response.arrayBuffer();
        const wb = XLSX.read(arrayBuffer, { type: 'array' });
        const sheetName = wb.SheetNames[0];
        const ws = wb.Sheets[sheetName];
        const rawRows = XLSX.utils.sheet_to_json(ws);

        const parsed = rawRows
          .map(parseRow)
          .filter(r => r !== null && r.year && r.month);

        setData(parsed);

        const years = getAvailableYears(parsed);
        setAvailableYears(years);

        // Default: último año disponible
        const defaultYear = years[years.length - 1];
        setSelectedYear(defaultYear);

        const months = getAvailableMonths(parsed, defaultYear);
        setAvailableMonths(months);

        // Default: último mes disponible del último año
        setSelectedMonth(months[months.length - 1]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadExcel();
  }, [filePath]);

  // Cuando cambia el año, recalcular meses disponibles
  const changeYear = (year) => {
    setSelectedYear(year);
    const months = getAvailableMonths(data, year);
    setAvailableMonths(months);
    // Resetear al primer mes disponible
    setSelectedMonth(months[0] || null);
  };

  const changeMonth = (month) => {
    setSelectedMonth(month);
  };

  return {
    data,
    loading,
    error,
    availableYears,
    availableMonths,
    selectedYear,
    selectedMonth,
    changeYear,
    changeMonth,
  };
}
