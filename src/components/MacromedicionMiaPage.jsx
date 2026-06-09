import React, { useState, useEffect } from 'react';
import MacromedicionFilters from './MacromedicionFilters';
import MacromedicionKpis from './MacromedicionKpis';
import HourlyConsumptionChart from './HourlyConsumptionChart';
import AccumulatedConsumptionChart from './AccumulatedConsumptionChart';
import DailyComparisonChart from './DailyComparisonChart';
import HydraulicInsights from './HydraulicInsights';
import MacromedicionTable from './MacromedicionTable';
import RegistroLecturaPage from './RegistroLecturaPage';

function MacromedicionMiaPage({ token, currentUsername, currentRole, currentUserId, onUnauthorized }) {
  const [subView, setSubView] = useState('menu'); // 'menu', 'registro', 'analisis'

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
  const isOperario = currentRole?.toLowerCase() === 'operario';

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
        let records = result.data || [];

        // Filtro de seguridad adicional para OPERARIO
        if (isOperario) {
          records = records.filter(r => 
            String(r.operario_id) === String(currentUserId) || 
            String(r.createdBy) === String(currentUserId)
          );
        }

        if (records.length === 0) {
          setAvailableDates([]);
          setAvailableYears([new Date().getFullYear()]);
          setMetadataLoading(false);
          return;
        }

        // Extraer fechas únicas y ordenarlas descendente
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

    if (token) {
      fetchMetadata();
    }
  }, [token, subView]); // Recargar metadatos si cambia de vista para actualizar fechas registradas

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

  // Filtrar data para el operario (salvaguarda de seguridad en frontend)
  const displayData = isOperario
    ? filteredData.filter(r => 
        String(r.operario_id) === String(currentUserId) || 
        String(r.createdBy) === String(currentUserId)
      )
    : filteredData;

  // Renderizar la vista correspondiente
  if (subView === 'registro') {
    return (
      <RegistroLecturaPage
        token={token}
        currentUsername={currentUsername}
        currentRole={currentRole}
        currentUserId={currentUserId}
        onBack={() => setSubView('menu')}
      />
    );
  }

  if (subView === 'analisis') {
    return (
      <div className="macromedicion-page-wrapper">
        {/* Cabecera del Módulo */}
        <div className="module-inner-header">
          <div className="module-header-info">
            <div className="back-nav-container" style={{ marginBottom: '10px' }}>
              <button className="back-link-btn" onClick={() => setSubView('menu')}>
                &larr; Volver al menú de Macromedición
              </button>
            </div>
            <h2 className="module-inner-title">Análisis de Macromedición</h2>
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
                <MacromedicionKpis data={displayData} />

                {/* Gráficos de Curva Horaria y Acumulado */}
                <div className="top-charts-grid">
                  <HourlyConsumptionChart
                    data={displayData}
                    isSingleDay={filters?.type === 'day'}
                  />
                  <AccumulatedConsumptionChart
                    data={displayData}
                    isSingleDay={filters?.type === 'day'}
                  />
                </div>

                {/* Gráfico Comparativo de Días */}
                {displayData.length > 0 && (
                  <DailyComparisonChart
                    data={displayData}
                    filterType={filters?.type}
                  />
                )}

                {/* Sección de Análisis Hidráulico y Alertas (Oculto para Operarios) */}
                {!isOperario && (
                  <HydraulicInsights data={displayData} />
                )}

                {/* Tabla Detallada */}
                <MacromedicionTable data={displayData} />
              </div>
            )}
          </>
        )}
      </div>
    );
  }

  // subView === 'menu' (Vista intermedia)
  return (
    <div className="macromedicion-page-wrapper">
      <div className="module-inner-header">
        <div className="module-header-info">
          <h2 className="module-inner-title">Módulo de Macromedición</h2>
          <p className="module-inner-description">
            Control de macromedición, registro de lecturas por hora y análisis hidráulico en Ciudadela MIA.
          </p>
        </div>
        <div className="module-header-actions">
          <span className="location-badge">📍 Ciudadela MIA</span>
        </div>
      </div>

      <div className="macromedicion-subview-menu">
        <div className="subview-menu-card" onClick={() => setSubView('registro')}>
          <div className="subview-card-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
              <path d="M18.5 2.5a2.121 2.121 0 1 1 3 3L12 15l-4 1 1-4z"></path>
            </svg>
          </div>
          <div className="subview-card-body">
            <h3 className="subview-card-title">Registro de lectura</h3>
            <p className="subview-card-desc">
              Ingresa lecturas hora a hora del macromedidor de la ciudadela. Registro de valores en m³, observaciones y control de horarios para el operario de planta.
            </p>
            <div className="subview-card-action">
              <span>Ingresar al Registro &rarr;</span>
            </div>
          </div>
        </div>

        <div className="subview-menu-card" onClick={() => setSubView('analisis')}>
          <div className="subview-card-icon">
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="18" y1="20" x2="18" y2="10"></line>
              <line x1="12" y1="20" x2="12" y2="4"></line>
              <line x1="6" y1="20" x2="6" y2="14"></line>
            </svg>
          </div>
          <div className="subview-card-body">
            <h3 className="subview-card-title">Análisis de lectura</h3>
            <p className="subview-card-desc">
              Visualiza curvas de consumo horarias, consumos acumulados diarios, diagnósticos de fugas y flujo mínimo nocturno.
            </p>
            <div className="subview-card-action">
              <span>Ver Análisis &rarr;</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default MacromedicionMiaPage;
