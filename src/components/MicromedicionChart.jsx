import React from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { MONTH_NAMES } from '../utils/dataParser';

const MicromedicionChart = ({ chartData }) => {
  const displayData = chartData.map(d => ({
    name: MONTH_NAMES[d.month],
    nominal: d.micromedicionNominal || 0,
    real: d.micromedicionReal || 0,
  }));

  return (
    <div className="micromedicion-card">
      <div className="chart-inner-title">MICROMEDICIÓN NOMINAL VS REAL</div>
      
      <div className="micro-legend">
        <div className="micro-legend-item">
            <div className="legend-dot" style={{background: '#155274'}}></div> NOMINAL
        </div>
        <div className="micro-legend-item">
            <div className="legend-dot" style={{background: '#2B5E11'}}></div> REAL
        </div>
      </div>

      <div style={{ width: '100%', height: 120 }}>
        <ResponsiveContainer>
          <BarChart data={displayData} margin={{ top: 0, right: 10, left: 0, bottom: 20 }} barGap={6}>
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#8A9BB0', fontSize: 8, fontWeight: 600}}
              interval={0}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis hide domain={[0, 100]} />
            <Tooltip 
              cursor={{fill: 'transparent'}}
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '10px' }}
            />
            <Bar dataKey="nominal" fill="#155274" radius={[2, 2, 0, 0]} barSize={12} />
            <Bar dataKey="real" fill="#2B5E11" radius={[2, 2, 0, 0]} barSize={12} />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default MicromedicionChart;
