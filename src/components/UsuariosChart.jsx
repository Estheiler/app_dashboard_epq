import React from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { MONTH_NAMES } from '../utils/dataParser';

const UsuariosChart = ({ yearlyData }) => {
  const data = yearlyData.map(d => ({
    name: MONTH_NAMES[d.month],
    acueducto: d.usuariosAcueducto || null,
    alcantarillado: d.usuariosAlcantarillado || null,
    aseo: d.usuariosAseo || null,
  }));

  return (
    <div className="card">
      <div className="card-tag">A.A.A</div>
      <div className="card-title">Usuarios Activos</div>
      
      <div className="chart-legend">
        <div className="legend-item"><div className="legend-dot" style={{background: '#009DD0'}}></div> ACUEDUCTO</div>
        <div className="legend-item"><div className="legend-dot" style={{background: '#155274'}}></div> ALCANTARILLADO</div>
        <div className="legend-item"><div className="legend-dot" style={{background: '#7FD349'}}></div> ASEO</div>
      </div>

      <div style={{ width: '100%', height: 180 }}>
        <ResponsiveContainer>
          <AreaChart data={data} margin={{ top: 10, right: 10, left: 0, bottom: 20 }}>
            <defs>
              <linearGradient id="colorAcueU" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#009DD0" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#009DD0" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAlcanU" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#155274" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#155274" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorAseoU" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7FD349" stopOpacity={0.15}/>
                <stop offset="95%" stopColor="#7FD349" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2EAF0" />
            <XAxis 
              dataKey="name" 
              axisLine={false} 
              tickLine={false} 
              tick={{fill: '#8A9BB0', fontSize: 9, fontWeight: 600}} 
              dy={10}
              interval={0}
              padding={{ left: 10, right: 10 }}
            />
            <YAxis hide />
            <Tooltip 
              contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)', fontSize: '12px' }}
              formatter={(value) => [value?.toLocaleString(), '']}
            />
            <Area 
                type="monotone" 
                dataKey="acueducto" 
                stroke="#009DD0" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorAcueU)" 
                connectNulls
            />
            <Area 
                type="monotone" 
                dataKey="alcantarillado" 
                stroke="#155274" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorAlcanU)" 
                connectNulls
            />
            <Area 
                type="monotone" 
                dataKey="aseo" 
                stroke="#7FD349" 
                strokeWidth={2} 
                fillOpacity={1} 
                fill="url(#colorAseoU)" 
                connectNulls
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};

export default UsuariosChart;
