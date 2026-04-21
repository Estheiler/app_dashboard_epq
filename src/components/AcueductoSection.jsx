import React from 'react';
import KpiCard from './KpiCard';
import { IancAcumuladoChart, ContinuidadBarChart } from './MiniCharts';
import MicromedicionChart from './MicromedicionChart';
import { calcIancAcumulado, getLastNMonths } from '../utils/dataParser';

const AcueductoSection = ({ allData, currentData, yearlyData, selectedYear, selectedMonth }) => {
  const iancAcum = calcIancAcumulado(allData, selectedYear, selectedMonth);

  return (
    <section className="acueducto-section">
      <div className="section-header">
        <div className="section-icon section-icon--blue">
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"></path>
          </svg>
        </div>
        <h2 className="section-title">Servicio de Acueducto</h2>
        <div style={{flex: 1, height: '1px', background: 'var(--border)', marginLeft: '10px'}}></div>
      </div>

      <div className="kpi-row kpi-row--5">
        <KpiCard 
          label="COBERTURA" 
          value={currentData?.coberturaAcueducto} 
          suffix="%" 
          dot={true}
        />
        <KpiCard 
          label="CONTINUIDAD" 
          value={currentData?.continuidad} 
          suffix="h" 
        />
        <KpiCard 
          label="IRCA" 
          value={currentData?.irca} 
          suffix="%" 
          highlight={true}
        />
        <KpiCard 
          label="IANC" 
          value={currentData?.ianc} 
          suffix="%" 
          ianc={true}
        />
        <KpiCard 
          label="IANC ACUMULADO" 
          value={iancAcum} 
          suffix="%" 
          ianc={true}
        />
      </div>

      <div className="acueducto-charts-row">
        <IancAcumuladoChart chartData={yearlyData} />
        <ContinuidadBarChart chartData={yearlyData} selectedMonth={selectedMonth} />
      </div>

      <MicromedicionChart chartData={yearlyData} />
    </section>
  );
};

export default AcueductoSection;
