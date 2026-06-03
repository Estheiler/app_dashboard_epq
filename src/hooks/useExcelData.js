import { useState, useEffect } from 'react';
import {
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
    async function loadApiData() {
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);

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

        // Mapear los datos de la API usando parseApiRow
        const parsed = rawRows
          .map(parseApiRow)
          .filter(r => r !== null && r.year && r.month);

        // Ordenamos cronológicamente (ascendente) para que coincida con el orden esperado por los gráficos
        const sorted = parsed.sort((a, b) => {
          if (a.year !== b.year) return a.year - b.year;
          return a.month - b.month;
        });

        setData(sorted);

        const years = getAvailableYears(sorted);
        setAvailableYears(years);

        if (years.length > 0) {
          // Si ya hay un año seleccionado, intentar preservarlo, sino usar el último
          const defaultYear = selectedYear || years[years.length - 1];
          if (!selectedYear) setSelectedYear(defaultYear);

          const months = getAvailableMonths(sorted, defaultYear);
          setAvailableMonths(months);

          // Si ya hay un mes seleccionado, intentar preservarlo, sino usar el último
          if (!selectedMonth) setSelectedMonth(months[months.length - 1]);
        }

        setLastUpdated(new Date());
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    loadApiData();
  }, [token, version]);

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
    refreshData: goToLatest,
  };
}
