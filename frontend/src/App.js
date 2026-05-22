import React, { useState, useEffect } from 'react';

function App() {
  const [telemetry, setTelemetry] = useState([]);
  const [loading, setLoading] = useState(true);
  const [chartRefresh, setChartRefresh] = useState(0);

  useEffect(() => {
    fetch('http://localhost:8000/api/fire-telemetry')
      .then(res => res.json())
      .then(resData => {
        setTelemetry(resData.metrics || []);
        setLoading(false);
      })
      .catch(err => console.error("Backend telemetry gateway dropped connection:", err));
  }, []);

  // Elite Status Vector Mapping - Colors matching specialized monitoring metrics
  const getRiskStatusClass = (score) => {
    if (score >= 85) return { text: "CRITICAL ALERT", color: "#ff4757", bg: "rgba(255, 71, 87, 0.12)", border: "#ff4757", glow: "0 0 12px rgba(255, 71, 87, 0.4)" };
    if (score >= 60) return { text: "HIGH DANGER", color: "#ffa502", bg: "rgba(255, 165, 2, 0.12)", border: "#ffa502", glow: "0 0 12px rgba(255, 165, 2, 0.3)" };
    if (score >= 31) return { text: "MODERATE", color: "#eccc68", bg: "rgba(236, 204, 104, 0.12)", border: "#eccc68", glow: "none" };
    return { text: "OPERATIONAL / SAFE", color: "#2ed573", bg: "rgba(46, 213, 115, 0.12)", border: "#2ed573", glow: "none" };
  };

  return (
    <div style={{ padding: '40px', fontFamily: '"Inter", "Segoe UI", sans-serif', backgroundColor: '#060913', color: '#f1f5f9', minHeight: '100vh', letterSpacing: '-0.01em' }}>
      
      {/* GLOWING SYSTEM HEADER COMMAND COMPONENT */}
      <header style={{ marginBottom: '40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: '24px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '6px' }}>
            <span style={{ fontSize: '24px' }}>🌲</span>
            <h1 style={{ fontSize: '28px', fontWeight: '800', background: 'linear-gradient(90deg, #ff7f50, #ff4757)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', margin: 0, letterSpacing: '-0.03em' }}>
              ForestFireAI
            </h1>
            <span style={{ fontSize: '10px', textTransform: 'uppercase', color: '#00d2d3', background: 'rgba(0,210,211,0.1)', border: '1px solid #00d2d3', padding: '2px 8px', borderRadius: '20px', fontWeight: '700', letterSpacing: '0.05em' }}>
              Live Core Node
            </span>
          </div>
          <p style={{ color: '#64748b', margin: 0, fontSize: '14px', fontWeight: '500' }}>
            Analytical Microservice Matrix Engine • Linux Architecture Sandbox Pipeline
          </p>
        </div>
        
        <div style={{ textAlign: 'right', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <span style={{ fontSize: '11px', color: '#64748b', fontWeight: '600', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Telemetry Link State</span>
          <span style={{ color: loading ? '#ffa502' : '#2ed573', fontSize: '13px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '6px', justifyContent: 'flex-end' }}>
            <span style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: loading ? '#ffa502' : '#2ed573', display: 'inline-block', boxShadow: loading ? '0 0 8px #ffa502' : '0 0 8px #2ed573' }}></span>
            {loading ? 'PULLING DATA MATRICES...' : 'GATEWAY ESTABLISHED'}
          </span>
        </div>
      </header>

      {/* TWO-COLUMN COMMAND CENTER LAYOUT GRID */}
      <div style={{ display: 'grid', gridTemplateColumns: '1.1fr 0.9fr', gap: '35px' }}>
        
        {/* PANEL CONTAINER ALPHA: DATA LOG MATRIX */}
        <div style={{ backgroundColor: '#0b111e', padding: '28px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.02em' }}>
              Real-Time Atmospheric Telemetry Logs
            </h2>
            <span style={{ fontSize: '12px', color: '#64748b', backgroundColor: 'rgba(255,255,255,0.03)', padding: '4px 10px', borderRadius: '6px', border: '1px solid rgba(255,255,255,0.05)' }}>
              24h Horizon Slice
            </span>
          </div>

          {loading ? (
            <div style={{ padding: '60px 0', textAlign: 'center', color: '#64748b', fontSize: '14px', fontWeight: '500' }}>
              Slicing temporal Pandas matrices from database pipeline...
            </div>
          ) : (
            <div style={{ overflowY: 'auto', maxHeight: '540px', borderRadius: '10px', border: '1px solid rgba(255,255,255,0.04)' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '13px' }}>
                <thead>
                  <tr style={{ background: '#131b2e', color: '#94a3b8', position: 'sticky', top: 0, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
                    <th style={{ padding: '14px 16px', fontWeight: '600' }}>Timestamp</th>
                    <th style={{ padding: '14px 16px', fontWeight: '600' }}>Core Temp</th>
                    <th style={{ padding: '14px 16px', fontWeight: '600' }}>Humidity</th>
                    <th style={{ padding: '14px 16px', fontWeight: '600' }}>Wind Velocity</th>
                    <th style={{ padding: '14px 16px', fontWeight: '600', textAlign: 'right' }}>Calculated Risk</th>
                  </tr>
                </thead>
                <tbody>
                  {telemetry.slice().reverse().map((row, idx) => {
                    const status = getRiskStatusClass(row.fire_risk_index);
                    return (
                      <tr key={idx} style={{ borderBottom: '1px solid rgba(255,255,255,0.03)', backgroundColor: idx % 2 === 0 ? 'transparent' : 'rgba(255,255,255,0.01)', transition: 'background-color 0.2s' }}>
                        <td style={{ padding: '14px 16px', color: '#64748b', fontFamily: 'monospace', fontWeight: '500' }}>{row.timestamp.split(' ')[1]}</td>
                        <td style={{ padding: '14px 16px', fontWeight: '600', color: '#e2e8f0' }}>{parseFloat(row.temperature_c).toFixed(1)} <span style={{ color: '#64748b', fontSize: '11px' }}>°C</span></td>
                        <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>{parseFloat(row.relative_humidity).toFixed(0)}<span style={{ color: '#64748b', fontSize: '11px' }}>%</span></td>
                        <td style={{ padding: '14px 16px', color: '#cbd5e1' }}>{parseFloat(row.wind_speed_kmh).toFixed(1)} <span style={{ color: '#64748b', fontSize: '11px' }}>km/h</span></td>
                        <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                          <span style={{ display: 'inline-block', padding: '5px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: '800', fontFamily: 'monospace', color: status.color, backgroundColor: status.bg, border: `1px solid ${status.border}`, boxShadow: status.glow, textTransform: 'uppercase', letterSpacing: '0.02em' }}>
                            Index {row.fire_risk_index} • {status.text}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* PANEL CONTAINER BETA: SEABORN GRAPH PRE-RENDER RUNTIME TARGET */}
        <div style={{ backgroundColor: '#0b111e', padding: '28px', borderRadius: '16px', border: '1px solid rgba(255,255,255,0.05)', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.5)', display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '22px' }}>
              <h2 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#f8fafc', letterSpacing: '-0.02em' }}>
                Pre-Rendered Visualization Array
              </h2>
              <button 
                onClick={() => setChartRefresh(prev => prev + 1)}
                style={{ backgroundColor: '#131b2e', color: '#38bdf8', border: '1px solid #1d273f', padding: '8px 16px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.target.style.backgroundColor = '#1e293b'; e.target.style.borderColor = '#38bdf8'; }}
                onMouseOut={(e) => { e.target.style.backgroundColor = '#131b2e'; e.target.style.borderColor = '#1d273f'; }}
              >
                🔄 Refresh Target Vectors
              </button>
            </div>
            
            <div style={{ textAlign: 'center', backgroundColor: '#060913', padding: '12px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.03)', boxShadow: 'inset 0 4px 12px rgba(0,0,0,0.6)' }}>
              <img 
                src={`http://localhost:8000/api/risk-chart?t=${chartRefresh}`} 
                alt="Matplotlib/Seaborn Computational Dual-Axis Chart" 
                style={{ width: '100%', height: 'auto', borderRadius: '6px', filter: 'hue-rotate(345deg) saturate(110%) brightness(95%)' }} 
              />
            </div>
          </div>
          
          <div style={{ marginTop: '20px', borderTop: '1px solid rgba(255,255,255,0.03)', paddingTop: '16px', display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '16px' }}>⚙️</span>
            <p style={{ fontSize: '12px', color: '#475569', margin: 0, lineHeight: '1.4', fontStyle: 'italic' }}>
              Pipeline engine processes raw data collections directly inside the memory buffer before piping it straight to the browser DOM over web ports.
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}

export default App;
