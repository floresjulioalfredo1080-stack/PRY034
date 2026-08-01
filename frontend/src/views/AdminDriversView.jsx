import React, { useState, useEffect } from 'react';
import { CheckCircle, XCircle, Eye, Download, Calendar, Car, Phone, Mail, FileText, Truck } from 'lucide-react';

export default function AdminDriversView() {
  const [pendingDrivers, setPendingDrivers] = useState([]);
  const [selectedDriver, setSelectedDriver] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPendingDrivers();
  }, []);

  const fetchPendingDrivers = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/admin/drivers/pending');
      if (response.ok) {
        const data = await response.json();
        setPendingDrivers(data);
      }
    } catch (err) {
      console.error('Error fetching drivers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (driverId, isVerified) => {
    const confirmMsg = isVerified 
      ? '¿Aprobar este conductor? Podrá comenzar a trabajar inmediatamente.'
      : '¿Rechazar este conductor? Su solicitud será eliminada.';
    
    if (!confirm(confirmMsg)) return;

    try {
      const response = await fetch(`http://localhost:3001/api/admin/drivers/${driverId}/verify`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isVerified })
      });

      if (response.ok) {
        alert(isVerified ? '✅ Conductor aprobado' : '❌ Conductor rechazado');
        fetchPendingDrivers();
        setSelectedDriver(null);
      }
    } catch (err) {
      alert('Error al procesar');
    }
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px', color: '#999' }}>
        <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
        Cargando conductores...
      </div>
    );
  }

  return (
    <div style={{ width: '100%', padding: '20px', maxWidth: '1400px', margin: '0 auto' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
        <Truck size={32} color="#D71920"/>
        <h2 style={{ color: '#2C3E50', margin: 0 }}>
          Aprobación de Conductores
        </h2>
      </div>
      <p style={{ color: '#666', marginBottom: '30px' }}>
        Revisa la documentación de los conductores antes de aprobarlos.
      </p>

      {pendingDrivers.length === 0 ? (
        <div style={{
          textAlign: 'center',
          padding: '60px',
          background: '#f8f9fa',
          borderRadius: '12px',
          border: '2px dashed #ddd'
        }}>
          <CheckCircle size={48} color="#16a34a" style={{ marginBottom: '15px' }}/>
          <h3 style={{ color: '#16a34a' }}>¡Todo al día!</h3>
          <p style={{ color: '#666' }}>No hay conductores pendientes de aprobación.</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
          {pendingDrivers.map(driver => (
            <DriverCard 
              key={driver.id}
              driver={driver}
              onView={() => setSelectedDriver(driver)}
              onApprove={() => handleVerify(driver.id, true)}
              onReject={() => handleVerify(driver.id, false)}
            />
          ))}
        </div>
      )}

      {/* Modal de Detalles */}
      {selectedDriver && (
        <DriverDetailsModal 
          driver={selectedDriver}
          onClose={() => setSelectedDriver(null)}
          onApprove={() => handleVerify(selectedDriver.id, true)}
          onReject={() => handleVerify(selectedDriver.id, false)}
        />
      )}
    </div>
  );
}

function DriverCard({ driver, onView, onApprove, onReject }) {
  return (
    <div className="info-card" style={{ 
      borderLeft: '4px solid #FFD700',
      position: 'relative'
    }}>
      <div style={{
        position: 'absolute',
        top: '10px',
        right: '10px',
        background: '#FFD700',
        color: '#1a1a1a',
        padding: '4px 8px',
        borderRadius: '4px',
        fontSize: '0.7rem',
        fontWeight: 'bold'
      }}>
        PENDIENTE
      </div>

      <div style={{ marginTop: '10px' }}>
        <h3 style={{ margin: '0 0 5px 0', color: '#2C3E50' }}>{driver.name}</h3>
        <div style={{ fontSize: '0.85rem', color: '#666', marginBottom: '15px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
            <Mail size={14}/> {driver.email}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
            <Phone size={14}/> {driver.phone}
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px', marginBottom: '3px' }}>
            <Car size={14}/> {driver.vehicleBrand} {driver.vehicleModel} ({driver.vehicleYear})
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
            <FileText size={14}/> Placa: <b>{driver.vehiclePlate}</b>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button 
            onClick={onView}
            className="btn-primary"
            style={{ background: '#2C3E50', flex: 1, padding: '10px', fontSize: '0.85rem' }}
          >
            <Eye size={16} style={{ marginRight: '5px' }}/> Ver Docs
          </button>
          <button 
            onClick={onApprove}
            style={{
              flex: 1,
              background: '#16a34a',
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '5px'
            }}
          >
            <CheckCircle size={16}/> Aprobar
          </button>
          <button 
            onClick={onReject}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <XCircle size={16}/>
          </button>
        </div>
      </div>
    </div>
  );
}

function DriverDetailsModal({ driver, onClose, onApprove, onReject }) {
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.7)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '20px'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '12px',
        maxWidth: '700px',
        width: '100%',
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: '30px'
      }}>
        <h2 style={{ marginTop: 0, color: '#2C3E50' }}>
          Revisión de Conductor
        </h2>

        <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
          <h3 style={{ color: '#D71920', marginBottom: '10px' }}>Información Personal</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
            <div><b>Nombre:</b> {driver.name}</div>
            <div><b>Teléfono:</b> {driver.phone}</div>
            <div style={{ gridColumn: '1 / -1' }}><b>Email:</b> {driver.email}</div>
          </div>
        </div>

        <div style={{ marginBottom: '20px', paddingBottom: '20px', borderBottom: '1px solid #eee' }}>
          <h3 style={{ color: '#D71920', marginBottom: '10px' }}>Vehículo</h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.9rem' }}>
            <div><b>Tipo:</b> {driver.vehicleType}</div>
            <div><b>Placa:</b> {driver.vehiclePlate}</div>
            <div><b>Marca:</b> {driver.vehicleBrand}</div>
            <div><b>Modelo:</b> {driver.vehicleModel}</div>
            <div style={{ gridColumn: '1 / -1' }}><b>Año:</b> {driver.vehicleYear}</div>
          </div>
        </div>

        <div style={{ marginBottom: '25px' }}>
          <h3 style={{ color: '#D71920', marginBottom: '15px' }}>Documentos</h3>
          
          {driver.driverLicense && (
            <DocumentLink 
              label="Licencia de Conducir"
              url={`http://localhost:3001${driver.driverLicense}`}
            />
          )}
          
          {driver.vehicleSOAT && (
            <DocumentLink 
              label="SOAT del Vehículo"
              url={`http://localhost:3001${driver.vehicleSOAT}`}
            />
          )}
          
          {driver.criminalRecord && (
            <DocumentLink 
              label="Antecedentes Penales"
              url={`http://localhost:3001${driver.criminalRecord}`}
            />
          )}
        </div>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button 
            onClick={onClose}
            style={{
              flex: 1,
              background: '#e5e7eb',
              color: '#333',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            Cerrar
          </button>
          <button 
            onClick={onApprove}
            style={{
              flex: 1,
              background: '#16a34a',
              color: 'white',
              border: 'none',
              padding: '12px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px'
            }}
          >
            <CheckCircle size={18}/> APROBAR CONDUCTOR
          </button>
          <button 
            onClick={onReject}
            style={{
              background: '#dc2626',
              color: 'white',
              border: 'none',
              padding: '12px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold'
            }}
          >
            <XCircle size={18}/>
          </button>
        </div>
      </div>
    </div>
  );
}

function DocumentLink({ label, url }) {
  return (
    <a 
      href={url} 
      target="_blank" 
      rel="noopener noreferrer"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '12px 15px',
        background: '#f8f9fa',
        borderRadius: '8px',
        marginBottom: '10px',
        textDecoration: 'none',
        color: '#2C3E50',
        border: '1px solid #e5e7eb',
        transition: 'all 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = '#e5e7eb';
        e.currentTarget.style.borderColor = '#D71920';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = '#f8f9fa';
        e.currentTarget.style.borderColor = '#e5e7eb';
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <FileText size={18} color="#D71920"/>
        <span style={{ fontWeight: '500' }}>{label}</span>
      </div>
      <Download size={18} color="#666"/>
    </a>
  );
}