import React from 'react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

function ModelComparison({ metrics }) {
  if (!metrics || !metrics.models) {
    return <div style={{textAlign: 'center', color: '#94a3b8'}}>Loading metrics...</div>
  }

  const comparisonData = metrics.models.map(m => ({
    name: m.name,
    MAE: m.mae,
    RMSE: m.rmse,
    R2: m.r2
  }))

  const bestModel = metrics.best_model

  return (
    <div>
      <div className="model-comparison-grid">
        {metrics.models.map(model => (
          <div key={model.name} className={`metric-box ${model.name.toLowerCase().replace('-', '')}`}>
            <div className="metric-label">{model.name}</div>
            <div className="metric-value" style={{color: model.name === bestModel ? '#3b82f6' : 'inherit'}}>
              {model.r2.toFixed(4)}
            </div>
            <div style={{fontSize: '0.7rem', color: '#94a3b8', marginTop: '4px'}}>
              R² Score {model.name === bestModel && '★ Best'}
            </div>
          </div>
        ))}
      </div>

      <div style={{height: '200px', marginTop: '20px'}}>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={comparisonData} margin={{ top: 5, right: 30, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#2d3748" />
            <XAxis dataKey="name" stroke="#94a3b8" />
            <YAxis stroke="#94a3b8" />
            <Tooltip 
              contentStyle={{ 
                backgroundColor: '#1a2234', 
                border: '1px solid #2d3748',
                borderRadius: '8px'
              }}
            />
            <Legend />
            <Bar dataKey="MAE" fill="#f97316" name="MAE" />
            <Bar dataKey="RMSE" fill="#ef4444" name="RMSE" />
            <Bar dataKey="R2" fill="#10b981" name="R2" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      <div style={{textAlign: 'center', marginTop: '16px', fontSize: '0.85rem', color: '#94a3b8'}}>
        Best Model: <span style={{color: '#3b82f6', fontWeight: '600'}}>{bestModel}</span>
      </div>
    </div>
  )
}

export default ModelComparison