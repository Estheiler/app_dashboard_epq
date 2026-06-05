import React, { useState, useEffect } from 'react';
import MacromedicionFilters from './MacromedicionFilters';
import MacromedicionKpis from './MacromedicionKpis';
import HourlyConsumptionChart from './HourlyConsumptionChart';
import AccumulatedConsumptionChart from './AccumulatedConsumptionChart';
import DailyComparisonChart from './DailyComparisonChart';
import HydraulicInsights from './HydraulicInsights';
import MacromedicionTable from './MacromedicionTable';

function MacromedicionMiaPage({ token, currentUsername, currentRole, onUnauthorized }) {
  // Metadatos para filtros
  const [availableDates, setAvailableDates] = useState([]);
  const [availableYears, setAvailableYears] = useState([]);
  const [metadataLoading, setMetadataLoading] = useState(true);
  const [metadataError, setMetadataError] = useState(null);

  // Estados de datos filtrados
  const [filteredData, setFilteredData] = useState([]);
  const [dataLoading, setDataLoading] = useState(false);
  const [dataError, setDataError] = useState(null);

  // Estado de los filtros actuales
  const [filters, setFilters] = useState(null);

  const apiBaseUrl = import.meta.env.VITE_API_URL || '';

  // 1. Cargar todos los registros para extraer fechas y años disponibles
  useEffect(() => {
    async function fetchMetadata() {
      try {
        setMetadataLoading(true);
        setMetadataError(null);

        const response = await fetch(`${apiBaseUrl}/registro-macromedidor`, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          if (onUnauthorized) onUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error('No se pudo establecer conexión con el backend para cargar metadatos.');
        }

        const result = await response.json();
        const records = result.data || [];

        if (records.length === 0) {
          setAvailableDates([]);
          setAvailableYears([new Date().getFullYear()]);
          setMetadataLoading(false);
          return;
        }

        // Extraer fechas únicas y ordenarlas descendente (más recientes primero)
        const dates = [...new Set(records.map(r => r.fecha))].sort((a, b) => new Date(b) - new Date(a));
        setAvailableDates(dates);

        // Extraer años únicos
        const years = [...new Set(records.map(r => parseInt(r.fecha.substring(0, 4), 10)))].sort((a, b) => a - b);
        setAvailableYears(years);

      } catch (err) {
        setMetadataError(err.message);
      } finally {
        setMetadataLoading(false);
      }
    }

    fetchMetadata();
  }, [token]);

  // 2. Fetch de datos filtrados basado en el filtro activo
  useEffect(() => {
    if (!filters || metadataLoading || availableDates.length === 0) return;

    async function fetchFilteredData() {
      try {
        setDataLoading(true);
        setDataError(null);
        let url = '';

        if (filters.type === 'day' && filters.date) {
          url = `${apiBaseUrl}/registro-macromedidor/fecha?fecha=${filters.date}`;
        } else if (filters.type === 'range' && filters.startDate && filters.endDate) {
          url = `${apiBaseUrl}/registro-macromedidor/rango?fechaInicio=${filters.startDate}&fechaFin=${filters.endDate}`;
        } else if (filters.type === 'month' && filters.year && filters.month) {
          url = `${apiBaseUrl}/registro-macromedidor/mes?anio=${filters.year}&mes=${filters.month}`;
        } else {
          setDataLoading(false);
          return;
        }

        const response = await fetch(url, {
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
        });

        if (response.status === 401) {
          if (onUnauthorized) onUnauthorized();
          return;
        }

        if (!response.ok) {
          throw new Error('Error al consultar los registros del macromedidor para el periodo seleccionado.');
        }

        const result = await response.json();
        setFilteredData(result.data || []);
      } catch (err) {
        setDataError(err.message);
      } finally {
        setDataLoading(false);
      }
    }

    fetchFilteredData();
  }, [filters, token, metadataLoading, availableDates]);

  // Manejar el cambio de filtros desde el componente de filtros
  const handleFilterChange = (newFilters) => {
    setFilters(newFilters);
  };

  // Verificar si es perfil Operario para restringir visualmente el análisis hidráulico
  const isOperario = currentRole?.toLowerCase() === 'operario';

  return (
    <div className="macromedicion-page-wrapper">
      {/* Cabecera del Módulo */}
      <div className="module-inner-header">
        <div className="module-header-info">
          <h2 className="module-inner-title">Macromedición - Ciudadela MIA</h2>
          <p className="module-inner-description">
            Monitoreo hidráulico de caudales, patrones de consumo y diagnóstico de pérdidas
          </p>
        </div>
        <div className="module-header-actions">
          <span className="location-badge">📍 Ciudadela MIA</span>
        </div>
      </div>

      {metadataLoading ? (
        <div className="module-loading-screen">
          <div className="loading-spinner"></div>
          <div className="loading-text">Cargando fechas y configuración del macromedidor...</div>
        </div>
      ) : metadataError ? (
        <div className="module-error-screen">
          <div className="error-icon">⚠️</div>
          <div className="error-text">No se pudo inicializar el módulo: {metadataError}</div>
        </div>
      ) : availableDates.length === 0 ? (
        <div className="module-error-screen">
          <div className="error-icon">ℹ️</div>
          <div className="error-text">No existen lecturas registradas en la base de datos de macromedición.</div>
        </div>
      ) : (
        <>
          {/* Panel de Filtros */}
          <MacromedicionFilters
            availableDates={availableDates}
            availableYears={availableYears}
            onFilterChange={handleFilterChange}
          />

          {dataLoading ? (
            <div className="module-loading-screen" style={{ minHeight: '300px' }}>
              <div className="loading-spinner"></div>
              <div className="loading-text">Actualizando análisis y curvas de consumo...</div>
            </div>
          ) : dataError ? (
            <div className="module-error-screen" style={{ minHeight: '300px' }}>
              <div className="error-icon">⚠️</div>
              <div className="error-text">{dataError}</div>
            </div>
          ) : (
            <div className="macromedicion-results-container">
              {/* Tarjetas KPI */}
              <MacromedicionKpis data={filteredData} />

              {/* Gráficos de Curva Horaria y Acumulado */}
              <div className="top-charts-grid">
                <HourlyConsumptionChart
                  data={filteredData}
                  isSingleDay={filters?.type === 'day'}
                />
                <AccumulatedConsumptionChart
                  data={filteredData}
                  isSingleDay={filters?.type === 'day'}
                />
              </div>

              {/* Gráfico Comparativo de Días (Solo se renderiza si hay múltiples días) */}
              {filteredData.length > 0 && (
                <DailyComparisonChart
                  data={filteredData}
                  filterType={filters?.type}
                />
              )}

              {/* Sección de Análisis Hidráulico y Alertas (Oculto para Operarios) */}
              {!isOperario && (
                <HydraulicInsights data={filteredData} />
              )}

              {/* Tabla Detallada */}
              <MacromedicionTable data={filteredData} />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MacromedicionMiaPage;
