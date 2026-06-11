import React, { useState, useEffect, useRef } from 'react';
import './CalendarSelect.css';

const MONTH_NAMES_SPANISH = [
  'Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio',
  'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'
];

function CalendarSelect({ value, onChange, availableDates = [], placeholder = 'Seleccionar fecha' }) {
  const [isOpen, setIsOpen] = useState(false);
  const [currentYear, setCurrentYear] = useState(2026);
  const [currentMonth, setCurrentMonth] = useState(6); // 1-indexed (1-12)
  const containerRef = useRef(null);

  // Parse current value to set calendar view month/year
  useEffect(() => {
    if (value) {
      const parts = value.split('-');
      if (parts.length === 3) {
        setCurrentYear(parseInt(parts[0], 10));
        setCurrentMonth(parseInt(parts[1], 10));
      }
    } else if (availableDates && availableDates.length > 0) {
      // Si no hay valor, ver el mes de la fecha más reciente con datos
      const parts = availableDates[0].split('-');
      if (parts.length === 3) {
        setCurrentYear(parseInt(parts[0], 10));
        setCurrentMonth(parseInt(parts[1], 10));
      }
    }
  }, [value, availableDates]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (containerRef.current && !containerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navegar meses
  const handlePrevMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 1) {
      setCurrentMonth(12);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = (e) => {
    e.stopPropagation();
    if (currentMonth === 12) {
      setCurrentMonth(1);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Generar días para el mes actual
  const getDaysInMonth = (year, month) => {
    return new Date(year, month, 0).getDate();
  };

  const getFirstDayOffset = (year, month) => {
    // 0 = Sunday, 1 = Monday, ..., 6 = Saturday
    const day = new Date(year, month - 1, 1).getDay();
    // Monday first offset: Monday = 0, ..., Sunday = 6
    return (day + 6) % 7;
  };

  const daysCount = getDaysInMonth(currentYear, currentMonth);
  const offset = getFirstDayOffset(currentYear, currentMonth);

  const daysGrid = [];
  // Celdas vacías de relleno para el inicio de mes
  for (let i = 0; i < offset; i++) {
    daysGrid.push({ dayNumber: null, dateString: null, isAvailable: false });
  }

  // Días reales del mes
  for (let day = 1; day <= daysCount; day++) {
    const dateStr = `${currentYear}-${currentMonth.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')}`;
    const isAvailable = availableDates.includes(dateStr);
    daysGrid.push({
      dayNumber: day,
      dateString: dateStr,
      isAvailable
    });
  }

  const handleDateClick = (dateString, isAvailable) => {
    if (isAvailable && onChange) {
      onChange(dateString);
      setIsOpen(false);
    }
  };

  const weekdays = ['L', 'M', 'M', 'J', 'V', 'S', 'D'];

  // Formato legible para mostrar en el botón
  const formatSelectedDate = (val) => {
    if (!val) return placeholder;
    const parts = val.split('-');
    if (parts.length === 3) {
      const day = parseInt(parts[2], 10);
      const monthIndex = parseInt(parts[1], 10) - 1;
      const year = parts[0];
      return `${day} de ${MONTH_NAMES_SPANISH[monthIndex]}, ${year}`;
    }
    return val;
  };

  return (
    <div className="calendar-select-container" ref={containerRef}>
      <button
        type="button"
        className={`calendar-trigger-btn ${isOpen ? 'active' : ''}`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="calendar-btn-icon">
          <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
          <line x1="16" y1="2" x2="16" y2="6"></line>
          <line x1="8" y1="2" x2="8" y2="6"></line>
          <line x1="3" y1="10" x2="21" y2="10"></line>
        </svg>
        <span className="selected-date-text">{formatSelectedDate(value)}</span>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="chevron-icon">
          <polyline points="6 9 12 15 18 9"></polyline>
        </svg>
      </button>

      {isOpen && (
        <div className="calendar-popover">
          <div className="calendar-popover-header">
            <button type="button" className="cal-nav-btn" onClick={handlePrevMonth}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6"></polyline>
              </svg>
            </button>
            <div className="cal-month-year-label">
              {MONTH_NAMES_SPANISH[currentMonth - 1]} {currentYear}
            </div>
            <button type="button" className="cal-nav-btn" onClick={handleNextMonth}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="9 18 15 12 9 6"></polyline>
              </svg>
            </button>
          </div>

          <div className="calendar-weekdays-grid">
            {weekdays.map((wd, index) => (
              <div key={index} className="calendar-weekday-cell">{wd}</div>
            ))}
          </div>

          <div className="calendar-days-grid">
            {daysGrid.map((cell, index) => {
              if (cell.dayNumber === null) {
                return <div key={`empty-${index}`} className="calendar-day-cell empty"></div>;
              }
              const isSelected = value === cell.dateString;
              const cellClasses = [
                'calendar-day-cell',
                cell.isAvailable ? 'available' : 'disabled',
                isSelected ? 'selected' : ''
              ].filter(Boolean).join(' ');

              return (
                <button
                  key={`day-${cell.dateString}`}
                  type="button"
                  className={cellClasses}
                  disabled={!cell.isAvailable}
                  onClick={() => handleDateClick(cell.dateString, cell.isAvailable)}
                >
                  {cell.dayNumber}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

export default CalendarSelect;
