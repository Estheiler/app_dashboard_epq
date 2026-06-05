import React, { useState, useEffect } from 'react';
import CustomSelect from './CustomSelect';
import { MONTH_NAMES_FULL } from '../utils/dataParser';

function MacromedicionFilters({
  availableDates, // Array de strings 'YYYY-MM-DD' ordenados desc
  availableYears, // Array de números
  onFilterChange, // Callback para enviar filtros { type, date, startDate, endDate, year, month }
}) {
  const [filterType, setFilterType] = useState('day'); // 'day', 'range', 'month'
  
  // Estados de filtros individuales
  const [selectedDate, setSelectedDate] = useState('');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [selectedYear, setSelectedYear] = useState('');
  const [selectedMonth, setSelectedMonth] = useState('');

  // Efecto inicial para definir los valores por defecto cuando se cargan los metadatos
  useEffect(() => {
    if (availableDates && availableDates.length > 0) {
      // Por defecto, seleccionar el día más reciente con datos
      const latestDate = availableDates[0];
      setSelectedDate(latestDate);
      
      // Por defecto para rango, los últimos 7 días con datos o el mismo día
      setStartDate(availableDates[Math.min(availableDates.length - 1, 6)]);
      setEndDate(latestDate);
    }
  }, [availableDates]);

  useEffect(() => {
    if (availableYears && availableYears.length > 0) {
      const latestYear = availableYears[availableYears.length - 1];
      setSelectedYear(latestYear);
      // Por defecto mes Junio o el último mes con datos (ej. 6)
      setSelectedMonth(6);
    }
  }, [availableYears]);

  // Ejecutar callback cuando cambian los valores seleccionados o el tipo de filtro
  useEffect(() => {
    const filters = {
      type: filterType,
      date: selectedDate,
      startDate: startDate,
      endDate: endDate,
      year: selectedYear,
      month: selectedMonth
    };
    onFilterChange(filters);
  }, [filterType, selectedDate, startDate, endDate, selectedYear, selectedMonth]);

  // Obtener meses del año seleccionado. Para simplificar mostramos 1 a 12
  const monthOptions = Array.from({ length: 12 }, (_, i) => ({
    value: i + 1,
    label: MONTH_NAMES_FULL[i + 1]
  }));

  const yearOptions = availableYears.map(y => ({ value: y, label: `Año ${y}` }));
  const dateOptions = availableDates.map(d => ({ value: d, label: d }));

  return (
    <div className="macromedicion-filters-card">
      <div className="filters-tab-container">
        <button
          className={`filter-tab-btn ${filterType === 'day' ? 'active' : ''}`}
          onClick={() => setFilterType('day')}
        >
          Día Específico
        </button>
        <button
          className={`filter-tab-btn ${filterType === 'range' ? 'active' : ''}`}
          onClick={() => setFilterType('range')}
        >
          Rango de Fechas
        </button>
        <button
          className={`filter-tab-btn ${filterType === 'month' ? 'active' : ''}`}
          onClick={() => setFilterType('month')}
        >
          Por Mes
        </button>
      </div>

      <div className="filters-inputs-container">
        {filterType === 'day' && (
          <div className="filter-input-group">
            <label>Seleccionar Fecha con Datos</label>
            <CustomSelect
              options={dateOptions}
              value={selectedDate}
              onChange={setSelectedDate}
              placeholder="Seleccionar Fecha"
            />
          </div>
        )}

        {filterType === 'range' && (
          <>
            <div className="filter-input-group">
              <label>Desde Fecha</label>
              <CustomSelect
                options={dateOptions}
                value={startDate}
                onChange={setStartDate}
                placeholder="Fecha Inicial"
              />
            </div>
            <div className="filter-input-group">
              <label>Hasta Fecha</label>
              <CustomSelect
                options={dateOptions}
                value={endDate}
                onChange={setEndDate}
                placeholder="Fecha Final"
              />
            </div>
          </>
        )}

        {filterType === 'month' && (
          <>
            <div className="filter-input-group">
              <label>Seleccionar Año</label>
              <CustomSelect
                options={yearOptions}
                value={selectedYear}
                onChange={setSelectedYear}
                placeholder="Seleccionar Año"
              />
            </div>
            <div className="filter-input-group">
              <label>Seleccionar Mes</label>
              <CustomSelect
                options={monthOptions}
                value={selectedMonth}
                onChange={setSelectedMonth}
                placeholder="Seleccionar Mes"
              />
            </div>
          </>
        )}
      </div>
    </div>
  );
}

export default MacromedicionFilters;
