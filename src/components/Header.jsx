import CustomSelect from './CustomSelect';
import { MONTH_NAMES_FULL } from '../utils/dataParser';

const Header = ({ 
  availableYears, 
  availableMonths, 
  selectedYear, 
  selectedMonth, 
  onYearChange, 
  onMonthChange 
}) => {
  const yearOptions = availableYears.map(year => ({ value: year, label: `Año ${year}` }));
  const monthOptions = availableMonths.map(month => ({ 
    value: month, 
    label: MONTH_NAMES_FULL[month] 
  }));

  return (
    <header className="header">
      <div className="header-left">
        <h1 className="header-title">Indicadores Técnicos de Servicios Públicos</h1>
        <p className="header-subtitle">Monitoreo para la gestión operativa</p>
      </div>

      <div className="header-right">
        {/* Filtro Año */}
        <CustomSelect 
          options={yearOptions}
          value={selectedYear}
          onChange={onYearChange}
          placeholder="Seleccionar Año"
        />

        {/* Filtro Mes */}
        <CustomSelect 
          options={monthOptions}
          value={selectedMonth}
          onChange={onMonthChange}
          placeholder="Seleccionar Mes"
        />

        {/* Icono/Filtro Adicional */}

        {/* Icono/Filtro Adicional */}
        <div className="avatar">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"></polygon>
          </svg>
        </div>
      </div>
    </header>
  );
};

export default Header;
