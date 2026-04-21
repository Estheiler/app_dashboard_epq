import CustomSelect from './CustomSelect';
import { MONTH_NAMES_FULL } from '../utils/dataParser';

const Header = ({ 
  availableYears, 
  availableMonths, 
  selectedYear, 
  selectedMonth, 
  onYearChange, 
  onMonthChange,
  onRefresh
}) => {
  const yearOptions = availableYears.map(year => ({ value: year, label: `Año ${year}` }));
  const monthOptions = availableMonths.map(month => ({ 
    value: month, 
    label: MONTH_NAMES_FULL[month] 
  }));

  return (
    <header className="header">
      <div className="header-left">
        <img 
          src="/logo_epq_horizontal.png" 
          alt="Logo EPQ" 
          className="header-logo"
        />
        <div className="header-text-block">
          <h1 className="header-title">Indicadores Técnicos de Servicios Públicos</h1>
          <p className="header-subtitle">Monitoreo para la gestión operativa</p>
        </div>
      </div>

      <div className="header-right">
        {/* Botón de Sincronización */}
        <button className="sync-button" onClick={onRefresh} title="Sincronizar datos">
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
