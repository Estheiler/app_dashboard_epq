import React from 'react';
import { useExcelData } from '../hooks/useExcelData';
import { filterByYear, filterData, MONTH_NAMES_FULL } from '../utils/dataParser';
import CoberturaChart from './CoberturaChart';
import UsuariosChart from './UsuariosChart';
import AcueductoSection from './AcueductoSection';
import AlcantarilladoSection from './AlcantarilladoSection';
import AseoSection from './AseoSection';
import CustomSelect from './CustomSelect';
import './IndicatorsGrid.css';

function IndicatorsDashboard({ token, onUnauthorized }) {
  const {
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
  } = useExcelData(token, onUnauthorized);

  if (loading) {
    return (
      <div className="module-loading-screen">
        <div className="loading-spinner"></div>
        <div className="loading-text">Cargando indicadores técnicos...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="module-error-screen">
        <div className="error-icon">⚠️</div>
        <div className="error-text">Error al cargar indicadores: {error}</div>
        <button className="error-retry-btn" onClick={refreshData}>Reintentar</button>
      </div>
    );
  }

  const yearlyData = filterByYear(data, selectedYear);
  const currentData = filterData(data, selectedYear, selectedMonth);

  // Obtener data del mes anterior para calcular variaciones
  const previousMonthIdx = data.findIndex(r => r.year === selectedYear && r.month === selectedMonth) - 1;
  const previousData = previousMonthIdx >= 0 ? data[previousMonthIdx] : null;

  const yearOptions = availableYears.map(year => ({ value: year, label: `Año ${year}` }));
  const monthOptions = availableMonths.map(month => ({
    value: month,
    label: MONTH_NAMES_FULL[month]
  }));

  return (
    <div className="indicators-dashboard-view">
      {/* Cabecera Interna del Módulo */}
      <div className="module-inner-header">
        <div className="module-header-info">
          <h2 className="module-inner-title">Módulo de Indicadores Técnicos</h2>
          <p className="module-inner-description">Informes consolidados de Acueducto, Alcantarillado y Aseo</p>
        </div>
        <div className="module-header-filters">
          {/* Botón de Sincronización */}
          <button className="sync-button" onClick={refreshData} title="Sincronizar Últimos Datos">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6"></path>
              <path d="M1 20v-6h6"></path>
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>

          {/* Filtro Año */}
          <CustomSelect
            options={yearOptions}
            value={selectedYear}
            onChange={changeYear}
            placeholder="Seleccionar Año"
          />

          {/* Filtro Mes */}
          <CustomSelect
            options={monthOptions}
            value={selectedMonth}
            onChange={changeMonth}
            placeholder="Seleccionar Mes"
          />
        </div>
      </div>

      {/* Gráficos de Cobertura y Usuarios */}
      <div className="top-charts-grid">
        <CoberturaChart yearlyData={yearlyData} />
        <UsuariosChart yearlyData={yearlyData} />
      </div>

      {/* Secciones de Acueducto, Alcantarillado y Aseo */}
      <div className="main-grid">
        <div className="left-column">
          <AcueductoSection 
            allData={data} 
            currentData={currentData} 
            yearlyData={yearlyData}
            selectedYear={selectedYear} 
            selectedMonth={selectedMonth} 
          />
        </div>
        <div className="right-column">
          <AlcantarilladoSection currentData={currentData} />
          <AseoSection currentData={currentData} previousData={previousData} />
        </div>
      </div>
    </div>
  );
}

export default IndicatorsDashboard;
