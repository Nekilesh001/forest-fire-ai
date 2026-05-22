import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

// Fix standard Leaflet default marker icons pointing incorrectly inside a build environment
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

function ChangeMapView({ center }) {
  const map = useMap();
  map.setView(center, map.getZoom());
  return null;
}

function App() {
  const [predictions, setPredictions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('map'); // 'map', 'minuteTrends', 'warnings', 'matrix'
  const [mapCenter, setMapCenter] = useState([11.4000, 76.6000]);
  const [tick, setTick] = useState(0);
  const [alerts, setAlerts] = useState([
    { time: new Date().toLocaleTimeString(), text: "Geospatial telemetry pipeline activated. Systems monitoring core ranges." }
  ]);

  useEffect(() => {
    fetchInstantData();
    const intervalClock = setInterval(() => {
      fetchInstantData();
      setTick(prev => prev + 1);
    }, 3000);
    return () => clearInterval(intervalClock);
  }, []);

  const fetchInstantData = () => {
    fetch('http://localhost:8000/api/current-predictions')
      .then(res => res.json())
      .then(data => {
        const freshData = data.predictions || [];
        setPredictions(freshData);
        
        freshData.forEach(node => {
          if (node.fire_risk_index > 50) {
            const timeStr = node.timestamp.split(' ')[1];
            setAlerts(prev => {
              if (prev.some(a => a.time === timeStr && a.text.includes(node.region))) return prev;
              return [{
                time: timeStr,
                text: `🚨 CRITICAL ANOMALY: Micro-climate thermal surge caught over ${node.region}. Evaluated Threat: Index ${node.fire_risk_index}. Action center flagged operational logs.`
              }, ...prev.slice(0, 4)];
            });
          }
        });
        setLoading(false);
      })
      .catch(err => console.error("Network synchronization drop:", err));
  };

  const getThreatBadge = (score) => {
    if (score >= 75) return { label: "CRITICAL HAZARD", color: "#b71c1c", bg: "#ffdde0", side: "#ff9800" };
    if (score >= 45) return { label: "MODERATE RISK", color: "#e65100", bg: "#fff3e0", side: "#ffa726" };
    return { label: "SAFE ENVIRONMENT", color: "#1b5e20", bg: "#e8f5e9", side: "#81c784" };
  };

  const styles = {
    canvas: { padding: '30px 40px', fontFamily: '"Inter", sans-serif', backgroundColor: '#fdfbf7', color: '#3e2723', minHeight: '100vh' },
    nav: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '2px solid #eecbc4', paddingBottom: '16px', marginBottom: '25px' },
    tabGroup: { display: 'flex', gap: '8px' },
    // Mild Orange matching logic mixed with elegant corporate brown
    tab: (active) => ({
      backgroundColor: active ? '#f57c00' : '#efebe9', 
      color: active ? '#ffffff' : '#5d4037', 
      border: active ? 'none' : '1px solid #d7ccc8',
      padding: '10px 18px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', fontSize: '12px',
      boxShadow: active ? '0 4px 10px rgba(245,124,0,0.25)' : 'none',
      transition: 'all 0.2s'
    }),
    card: { backgroundColor: '#ffffff', padding: '24px', borderRadius: '14px', border: '1px solid #eecbc4', boxShadow: '0 4px 18px rgba(62,39,35,0.03)' },
    fullGrid: { display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '25px' },
    ticker: { backgroundColor: '#26140e', color: '#faf8f5', padding: '16px', borderRadius: '8px', marginTop: '30px', fontFamily: 'monospace', fontSize: '12px', borderLeft: '5px solid #f57c00' }
  };

  return (
    <div style={styles.canvas}>
      
      {/* BRANDING NAVBAR */}
      <nav style={styles.nav}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <h1 style={{ fontSize: '24px', fontWeight: '800', margin: 0, color: '#3e2723' }}>🌲 ForestFireAI Geospatial Deck</h1>
            <span style={{ fontSize: '10px', fontWeight: '800', backgroundColor: '#ffe0b2', color: '#f57c00', padding: '2px 8px', borderRadius: '4px' }}>ORANGE REMIX V3</span>
          </div>
          <p style={{ margin: '4px 0 0 0', fontSize: '13px', color: '#8d6e63', fontWeight: '500' }}>AI System Engineering Engine • Real-Earth Analytics Deployment Console</p>
        </div>
        <div style={styles.tabGroup}>
          <button style={styles.tab(activeTab === 'map')} onClick={() => setActiveTab('map')}>🌍 Live GIS Map</button>
          <button style={styles.tab(activeTab === 'minuteTrends')} onClick={() => setActiveTab('minuteTrends')}>📈 60s Spaced Trends</button>
          <button style={styles.tab(activeTab === 'warnings')} onClick={() => setActiveTab('warnings')}>🔮 Plain-English Warnings</button>
          <button style={styles.tab(activeTab === 'matrix')} onClick={() => setActiveTab('matrix')}>📊 Deep-Dive Matrix</button>
        </div>
      </nav>

      {loading ? (
        <div style={{ textAlign: 'center', padding: '80px', color: '#8d6e63', fontWeight: '600' }}>Connecting distributed South India network arrays...</div>
      ) : (
        <main>
          
          {/* TAB 1: IMMERSIVE FULL PANEL SATELLITE MAP */}
          {activeTab === 'map' && (
            <div style={styles.card}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h2 style={{ margin: 0, fontSize: '16px', fontWeight: '700' }}>South India Regional Tracking Center</h2>
                <span style={{ fontSize: '11px', fontWeight: '700', color: '#f57c00', backgroundColor: '#fff3e0', padding: '3px 8px', borderRadius: '4px' }}>● SATELLITE FEED LINK LIVE</span>
              </div>
              <div style={{ height: '520px', borderRadius: '10px', overflow: 'hidden', border: '1px solid #d7ccc8' }}>
                <MapContainer center={mapCenter} zoom={9} style={{ height: '100%', width: '100%' }}>
                  <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution="&copy; OpenStreetMap" />
                  <ChangeMapView center={mapCenter} />
                  {predictions.map((loc, i) => {
                    const badge = getThreatBadge(loc.fire_risk_index);
                    return (
                      <Marker key={i} position={[loc.latitude, loc.longitude]}>
                        <Popup>
                          <div style={{ padding: '4px', textAlign: 'center' }}>
                            <strong style={{ fontSize: '13px' }}>{loc.region}</strong>
                            <div style={{ marginTop: '6px', padding: '4px 8px', borderRadius: '4px', backgroundColor: badge.bg, color: badge.color, fontWeight: '800', fontSize: '11px' }}>
                              {badge.label} ({loc.fire_risk_index})
                            </div>
                          </div>
                        </Popup>
                      </Marker>
                    );
                  })}
                </MapContainer>
              </div>
            </div>
          )}

          {/* TAB 2: DE-CONGESTED MATPLOTLIB GENERATED 1-MINUTE ANALYSIS */}
          {activeTab === 'minuteTrends' && (
            <div style={styles.card}>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '16px', fontWeight: '700' }}>Chronological 1-Minute Aggregated Reporting Center</h2>
              <p style={{ margin: '0 0 20px 0', fontSize: '13px', color: '#8d6e63' }}>Bypasses 3-second congestion noise by grouping environmental streams into clean mathematical hourly averages.</p>
              <div style={{ textAlign: 'center', backgroundColor: '#fdfbf7', padding: '10px', borderRadius: '8px', border: '1px solid #efebe9' }}>
                <img 
                  src={`http://localhost:8000/api/charts/minute-trends?t=${tick}`} 
                  alt="De-congested 1-minute trend metrics graph" 
                  style={{ maxWidth: '100%', height: 'auto', borderRadius: '6px', boxShadow: '0 4px 12px rgba(0,0,0,0.02)' }} 
                />
              </div>
            </div>
          )}

          {/* TAB 3: PLAIN ENGLISH CONVERSATIONAL WARNING BLOCKS */}
          {activeTab === 'warnings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
              {predictions.map((node, i) => {
                const threat = getThreatBadge(node.fire_risk_index);
                return (
                  <div key={i} style={{ ...styles.card, display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderLeft: `6px solid ${threat.side}`, cursor: 'pointer' }} onClick={() => { setMapCenter([node.latitude, node.longitude]); setActiveTab('map'); }}>
                    <div>
                      <h3 style={{ margin: '0 0 4px 0', fontSize: '17px', fontWeight: '700' }}>{node.region}</h3>
                      <p style={{ margin: '0 0 10px 0', fontSize: '12px', color: '#8d6e63', fontFamily: 'monospace' }}>🧭 Latitude {node.latitude}° N | Longitude {node.longitude}° E</p>
                      <p style={{ margin: 0, fontSize: '13px', color: '#5d4037', fontWeight: '500' }}><strong>System Diagnostic Message:</strong> Real-time variables indicate a {threat.label.toLowerCase()} here. Environmental matrix conditions are currently stable.</p>
                    </div>
                    <div style={{ textAlign: 'right', minWidth: '200px' }}>
                      <span style={{ padding: '6px 12px', borderRadius: '4px', backgroundColor: threat.bg, color: threat.color, fontWeight: '800', fontSize: '11px', display: 'inline-block' }}>
                        {threat.label} ({node.fire_risk_index})
                      </span>
                      <div style={{ fontSize: '11px', color: '#8d6e63', marginTop: '6px', fontFamily: 'monospace' }}>T: {node.temperature_c}°C | H: {node.relative_humidity}% | W: {node.wind_speed_kmh}kmh</div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* TAB 4: ADVANCED HIGH-RESOLUTION SEABORN STATISTICAL MATRIX */}
          {activeTab === 'matrix' && (
            <div style={styles.card}>
              <h2 style={{ margin: '0 0 5px 0', fontSize: '16px', fontweight: '700' }}>Advanced AI Feature Matrix Grid</h2>
              <p style={{ margin: '0 0 25px 0', fontSize: '13px', color: '#8d6e63' }}>Calculates structural Pearson product-moment correlation parameters across our active telemetry layers.</p>
              <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', background: '#ffffff', padding: '15px', borderRadius: '8px' }}>
                <img 
                  src={`http://localhost:8000/api/charts/correlation-matrix?t=${tick}`} 
                  alt="High resolution seaborn feature cross correlation matrix" 
                  style={{ maxWidth: '80%', height: 'auto', borderRadius: '6px' }} 
                />
              </div>
            </div>
          )}

        </main>
      )}

      {/* MILD ORANGE ACCENTED RUNTIME FEED TICKER */}
      <footer style={styles.ticker}>
        <div style={{ fontWeight: '800', color: '#ffb74d', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
          ⚠️ CORE NETWORK INCIDENT REPOSITORY • LIVE TRIGGER TELEMETRY
        </div>
        {alerts.map((a, i) => (
          <div key={i} style={{ marginBottom: '4px' }}>
            <span style={{ color: '#bcaaa4' }}>[{a.time}]</span> {a.text}
          </div>
        ))}
      </footer>

    </div>
  );
}

export default App;
