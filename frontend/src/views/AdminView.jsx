import React from 'react';
import { User, MapPin } from 'lucide-react';

export default function AdminView({ recentOrders, drivers, selectedDrivers, setSelectedDrivers, updateStatus }) {
  return (
    <div style={{ width: '100%' }}>
      <h2>Panel Admin 🛡️</h2>
      
      {/* LISTA DE PEDIDOS */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
        {recentOrders.map(o => (
          <div key={o.id} className="info-card" style={{ marginBottom: 0 }}>
            <div style={{display:'flex', justifyContent:'space-between', alignItems: 'center', marginBottom: '8px'}}>
              <span style={{fontWeight: '800', fontSize: '1.1rem', color: '#2C3E50'}}>S/ {o.price}</span>
              <span style={{background: '#e2e8f0', padding: '4px 8px', borderRadius: '4px', fontSize: '0.7rem', fontWeight: 'bold'}}>{o.status}</span>
            </div>
            
            {/* Direcciones con ajuste de texto para que no se salgan */}
            <div style={{fontSize:'0.85rem', color:'#555', marginBottom: '10px', wordBreak: 'break-word'}}>
              <div style={{marginBottom: '4px'}}>📍 <b>De:</b> {o.originAddress}</div>
              <div>🏁 <b>A:</b> {o.destAddress}</div>
            </div>

            {o.status === 'PENDIENTE' && (
              <div style={{display:'flex', gap:'5px', marginTop: '10px'}}>
                <select 
                    style={{marginBottom: 0, padding: '8px', fontSize: '0.85rem'}}
                    onChange={e => setSelectedDrivers({...selectedDrivers, [o.id]: e.target.value})}
                >
                  <option value="">Asignar Chofer...</option>
                  {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
                <button 
                    className="btn-primary" 
                    style={{width: 'auto', padding: '0 15px', fontSize: '0.8rem'}}
                    onClick={() => updateStatus(o.id, 'ASIGNADO', selectedDrivers[o.id])}
                >
                  OK
                </button>
              </div>
            )}
            
            {o.driverId && (
                <div style={{marginTop:'8px', fontSize:'0.8rem', color:'#16a34a', display: 'flex', alignItems: 'center', gap: '5px'}}>
                    <User size={14}/> Chofer asignado
                </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}