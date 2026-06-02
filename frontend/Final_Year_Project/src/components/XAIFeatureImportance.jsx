import React, { useMemo } from 'react';
import { 
  BarChart, Bar, XAxis, YAxis, CartesianGrid, 
  Tooltip, ResponsiveContainer, Cell, ReferenceLine 
} from 'recharts';

/**
 * XAI Feature Importance Component
 * This component visualizes SHAP values to explain "WHY" the AI flagged a user.
 */
const XAIFeatureImportance = ({ data }) => {
  
  // 1. Data Processing Logic (useMemo for performance)
  const chartData = useMemo(() => {
    if (!data || data.length === 0) return [];

    // Latest record (Sab se naya user log) uthayein
    const latestRecord = data[data.length - 1];

    // CSV mein se sirf '_importance' wale columns extract karein
    return Object.keys(latestRecord)
      .filter(key => key.endsWith('_importance'))
      .map(key => ({
        // Feature ka naam saaf karein (e.g. 'is_night_login_importance' -> 'Night Login')
        name: key.replace('_importance', '').replace('is_', '').replace(/_/g, ' ').toUpperCase(),
        value: parseFloat(latestRecord[key] || 0)
      }))
      // Jin features ka impact 0 hai unhe hata dein aur sorting karein
      .filter(item => item.value !== 0)
      .sort((a, b) => Math.abs(b.value) - Math.abs(a.value));
  }, [data]);

  // Agar data load nahi hua
  if (chartData.length === 0) {
    return (
      <div className="flex items-center justify-center h-full text-slate-400 font-medium italic">
        No significant feature impact detected for this session.
      </div>
    );
  }

  return (
    <div className="w-full h-full p-2">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData} 
          layout="vertical" 
          margin={{ left: 30, right: 30, top: 10, bottom: 10 }}
        >
          {/* Grid lines sirf vertical rakhein taake comparison asaan ho */}
          <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke="#e2e8f0" />
          
          <XAxis type="number" hide />
          
          <YAxis 
            dataKey="name" 
            type="category" 
            width={140} 
            style={{ fontSize: '10px', fontWeight: '800', fill: '#64748b' }} 
            tickLine={false}
            axisLine={false}
          />

          {/* Tooltip for detailed value on hover */}
          <Tooltip 
            cursor={{ fill: '#f1f5f9' }}
            contentStyle={{ 
              borderRadius: '12px', 
              border: 'none', 
              boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)',
              fontSize: '12px',
              fontWeight: 'bold'
            }}
            formatter={(value) => [`${value.toFixed(4)}`, 'SHAP Impact']}
          />

          {/* Zero line to separate Positive (Risk) and Negative (Safe) impacts */}
          <ReferenceLine x={0} stroke="#cbd5e1" />

          <Bar 
            dataKey="value" 
            barSize={20} 
            animationDuration={1500}
            radius={[0, 5, 5, 0]}
          >
            {chartData.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                // Logic: Positive value = Red (Risk factor), Negative = Green (Safe factor)
                fill={entry.value > 0 ? '#ef4444' : '#22c55e'} 
                fillOpacity={0.8}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
      
      {/* Legend for Examiners */}
      <div className="flex justify-center gap-6 mt-4 text-[10px] font-black tracking-widest uppercase">
        <div className="flex items-center gap-2 text-rose-600">
          <div className="w-3 h-3 bg-rose-500 rounded-sm"></div> Risk Increaser
        </div>
        <div className="flex items-center gap-2 text-emerald-600">
          <div className="w-3 h-3 bg-emerald-500 rounded-sm"></div> Safety Indicator
        </div>
      </div>
    </div>
  );
};

export default XAIFeatureImportance;
