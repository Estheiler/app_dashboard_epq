import { useState, useEffect } from 'react';
import * as XLSX from 'xlsx';
import {
  parseRow,
  parseApiRow,
  getAvailableYears,
  getAvailableMonths,
} from '../utils/dataParser';

export function useExcelData(token, onUnauthorized) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [availableYears, setAvailableYears] = useState([]);
  const [selectedYear, setSelectedYear] = useState(null);
  const [selectedMonth, setSelectedMonth] = useState(null);
  const [availableMonths, setAvailableMonths] = useState([]);
  const [version, setVersion] = useState(0);
  const [lastUpdated, setLastUpdated] = useState(null);

  const refreshData = () => {
    setVersion(v => v + 1);
  };

  useEffect(() => {
    async function loadData() {
      try {
        setLoading(true);
        setError(null);

        if (token) {
          // Cargar desde la API de NestJS
          const apiBaseUrl = import.meta.env.VITE_API_URL || '';
          const response = await fetch(`${apiBaseUrl}/indicadores-tecnicos`, {
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json',
            },
          });

          if (response.status === 401) {
            if (onUnauthorized) {
              onUnauthorized();
            }
            return;
          }

          if (!response.ok) {
            throw new Error('No se pudieron cargar los indicadores del servidor.');
          }

          const result = await response.json();
          const rawRows = result.data || [];

          const parsed = rawRows
            .map(parseApiRow)
            .filter(r => r !== null && r.year && r.month);

          const sorted = parsed.sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
          });

          setData(sorted);
          processLoadedData(sorted);
        } else {
          // Cargar desde el archivo Excel local en la carpeta public
          const filePath = '/indicadores_epq.xlsx';
          const fetchUrl = `${filePath}?t=${Date.now()}`;
          const response = await fetch(fetchUrl);
          if (!response.ok) {
            throw new Error(`No se pudo cargar el archivo Excel de indicadores.`);
          }

          const arrayBuffer = await response.arrayBuffer();
          const wb = XLSX.read(arrayBuffer, { type: 'array' });
          const sheetName = wb.SheetNames[0];
          const ws = wb.Sheets[sheetName];
          const rawRows = XLSX.utils.sheet_to_json(ws);

          const parsed = rawRows
            .map(parseRow)
            .filter(r => r !== null && r.year && r.month);

          const sorted = parsed.sort((a, b) => {
            if (a.year !== b.year) return a.year - b.year;
            return a.month - b.month;
          });

          setData(sorted);
          processLoadedData(sorted);
        }
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    function processLoadedData(sorted) {
      const years = getAvailableYears(sorted);
      setAvailableYears(years);

      if (years.length > 0) {
        const defaultYear = selectedYear && years.includes(selectedYear) ? selectedYear : years[years.length - 1];
        setSelectedYear(defaultYear);

        const months = getAvailableMonths(sorted, defaultYear);
        setAvailableMonths(months);

        const defaultMonth = selectedMonth && months.includes(selectedMonth) ? selectedMonth : months[months.length - 1];
        setSelectedMonth(defaultMonth);
      }
      setLastUpdated(new Date());
    }

    loadData();
  }, [token, version]);

  const changeYear = (year) => {
    setSelectedYear(year);
    const months = getAvailableMonths(data, year);
    setAvailableMonths(months);
    setSelectedMonth(months[0] || null);
  };

  const changeMonth = (month) => {
    setSelectedMonth(month);
  };

  const goToLatest = () => {
    if (!data || data.length === 0) return;

    const years = getAvailableYears(data);
    const lastYear = years[years.length - 1];

    const months = getAvailableMonths(data, lastYear);
    const lastMonth = months[months.length - 1];

    setSelectedYear(lastYear);
    setAvailableMonths(months);
    setSelectedMonth(lastMonth);
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
    refreshData,
  };
}
