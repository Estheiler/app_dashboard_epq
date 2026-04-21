import React from 'react';
import { useExcelData } from './hooks/useExcelData';
import { filterByYear, filterData, getLastNMonths } from './utils/dataParser';
import Header from './components/Header';
import CoberturaChart from './components/CoberturaChart';
import UsuariosChart from './components/UsuariosChart';
import AcueductoSection from './components/AcueductoSection';
import AlcantarilladoSection from './components/AlcantarilladoSection';
import AseoSection from './components/AseoSection';

function App() {
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
  } = useExcelData();

  if (loading) {
    return (
      <div className="loading-screen">
        <div className="loading-spinner"></div>
        <div className="loading-text">Cargando indicadores...</div>
      </div>
    );
  }

  if (error) {
    return <div className="error-screen">Error: {error}</div>;
  }

  const yearlyData = filterByYear(data, selectedYear);
  const currentData = filterData(data, selectedYear, selectedMonth);

  // Obtener data del mes anterior para calcular variaciones
  const previousMonthIdx = data.findIndex(r => r.year === selectedYear && r.month === selectedMonth) - 1;
  const previousData = previousMonthIdx >= 0 ? data[previousMonthIdx] : null;

  return (
    <div className="dashboard-wrapper">
      <Header 
        availableYears={availableYears}
        availableMonths={availableMonths}
        selectedYear={selectedYear}
        selectedMonth={selectedMonth}
        onYearChange={changeYear}
        onMonthChange={changeMonth}
        onRefresh={refreshData}
      />

      <div className="top-charts-grid">
        <CoberturaChart yearlyData={yearlyData} />
        <UsuariosChart yearlyData={yearlyData} />
      </div>

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
          
          <div className="logo-card">
            <img 
              src="/logo_epq.png" 
              alt="Logo EPQ" 
              style={{ width: '100%', maxWidth: '240px', height: 'auto', display: 'block', margin: '0 auto' }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}

export default App;
