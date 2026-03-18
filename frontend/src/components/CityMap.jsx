import React from 'react'

function CityMap({ sensors }) {
  const sensorPositions = {
    'S1': { row: 1, col: 2 },
    'S2': { row: 1, col: 4 },
    'S3': { row: 2, col: 1 },
    'S4': { row: 2, col: 3 },
    'S5': { row: 3, col: 2 },
    'S6': { row: 3, col: 4 },
  }

  const getStatus = (sensor) => {
    if (sensor.congestion < 0.3) return 'low'
    if (sensor.congestion < 0.5) return 'medium'
    if (sensor.congestion < 0.7) return 'high'
    return 'critical'
  }

  return (
    <div className="city-map">
      <div className="map-grid">
        {[...Array(12)].map((_, i) => (
          <div key={i} className="map-cell"></div>
        ))}
      </div>
      
      {sensors.map(sensor => {
        const pos = sensorPositions[sensor.sensor_id]
        if (!pos) return null
        
        const status = getStatus(sensor)
        
        const style = {
          gridRow: pos.row,
          gridColumn: pos.col,
        }
        
        return (
          <div key={sensor.sensor_id} style={{position: 'absolute', ...style}}>
            <div className={`map-sensor ${status}`}>
              {sensor.sensor_id}
              <div className="map-sensor-tooltip">
                <div><strong>{sensor.name}</strong></div>
                <div>Congestion: {(sensor.congestion * 100).toFixed(0)}%</div>
                <div>Status: {status}</div>
              </div>
            </div>
          </div>
        )
      })}

      <div className="legend">
        <div className="legend-item">
          <div className="legend-color" style={{background: '#10b981'}}></div>
          Low (&lt;30%)
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{background: '#f59e0b'}}></div>
          Medium (30-50%)
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{background: '#f97316'}}></div>
          High (50-70%)
        </div>
        <div className="legend-item">
          <div className="legend-color" style={{background: '#ef4444'}}></div>
          Critical (&gt;70%)
        </div>
      </div>
    </div>
  )
}

export default CityMap