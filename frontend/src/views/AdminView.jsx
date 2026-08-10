import React, { useState } from 'react';
import { User, Trash, Plus, ShoppingBag, Truck, Users, Key, Mail, Phone, Car, MapPin, Award } from 'lucide-react';
import { useToast } from '../components/Toast';

export default function AdminView({ 
  recentOrders, 
  drivers, 
  selectedDrivers, 
  setSelectedDrivers, 
  updateStatus,
  adminClients,
  adminDrivers,
  fetchAdminData,
  onDeleteOrder
}) {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'clients' | 'drivers'

  // Estados para Registro de Cliente
  const [clientName, setClientName] = useState('');
  const [clientEmail, setClientEmail] = useState('');
  const [clientPhone, setClientPhone] = useState('');
  const [clientPassword, setClientPassword] = useState('');
  const [showClientForm, setShowClientForm] = useState(false);

  // Estados para Registro de Conductor
  const [driverName, setDriverName] = useState('');
  const [driverEmail, setDriverEmail] = useState('');
  const [driverPhone, setDriverPhone] = useState('');
  const [driverPassword, setDriverPassword] = useState('');
  const [driverVehicleType, setDriverVehicleType] = useState('moto');
  const [driverVehiclePlate, setDriverVehiclePlate] = useState('');
  const [driverVehicleBrand, setDriverVehicleBrand] = useState('');
  const [driverVehicleModel, setDriverVehicleModel] = useState('');
  const [driverVehicleYear, setDriverVehicleYear] = useState('');
  const [showDriverForm, setShowDriverForm] = useState(false);

  // Manejo de Registro de Cliente
  const handleRegisterClient = async (e) => {
    e.preventDefault();
    if (!clientName || !clientEmail || !clientPhone || !clientPassword) {
      toast.warning("Por favor completa todos los campos del cliente");
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/register/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientName,
          email: clientEmail,
          phone: clientPhone,
          password: clientPassword
        })
      });

      if (response.ok) {
        toast.success("¡Cliente registrado exitosamente!");
        // Limpiar formulario
        setClientName('');
        setClientEmail('');
        setClientPhone('');
        setClientPassword('');
        setShowClientForm(false);
        // Refrescar listado
        fetchAdminData();
      } else {
        const errData = await response.json();
        toast.error(errData.error || "Error al registrar cliente");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión al registrar cliente");
    }
  };

  // Manejo de Registro de Conductor
  const handleRegisterDriver = async (e) => {
    e.preventDefault();
    if (!driverName || !driverEmail || !driverPhone || !driverPassword || !driverVehiclePlate || !driverVehicleBrand || !driverVehicleModel || !driverVehicleYear) {
      toast.warning("Por favor completa todos los campos del conductor");
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/admin/register/driver', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: driverName,
          email: driverEmail,
          phone: driverPhone,
          password: driverPassword,
          vehicleType: driverVehicleType,
          vehiclePlate: driverVehiclePlate.toUpperCase(),
          vehicleBrand: driverVehicleBrand,
          vehicleModel: driverVehicleModel,
          vehicleYear: driverVehicleYear
        })
      });

      if (response.ok) {
        toast.success("¡Conductor registrado y verificado exitosamente!");
        // Limpiar formulario
        setDriverName('');
        setDriverEmail('');
        setDriverPhone('');
        setDriverPassword('');
        setDriverVehicleType('moto');
        setDriverVehiclePlate('');
        setDriverVehicleBrand('');
        setDriverVehicleModel('');
        setDriverVehicleYear('');
        setShowDriverForm(false);
        // Refrescar listado
        fetchAdminData();
      } else {
        const errData = await response.json();
        toast.error(errData.error || "Error al registrar conductor");
      }
    } catch (error) {
      console.error(error);
      toast.error("Error de conexión al registrar conductor");
    }
  };

  return (
    <div style={{ width: '100%', paddingBottom: '30px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '15px' }}>
        <h2 style={{ color: '#2C3E50', margin: 0, fontSize: 'clamp(1.2rem, 4vw, 1.8rem)' }}>Panel Admin 🛡️</h2>
      </div>

      {/* TABS DE NAVEGACIÓN */}
      <div style={{
        display: 'flex',
        borderBottom: '2px solid #e2e8f0',
        marginBottom: '20px',
        gap: '10px',
        overflowX: 'auto',
        paddingBottom: '2px'
      }}>
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'orders' ? '3px solid #D71920' : '3px solid transparent',
            color: activeTab === 'orders' ? '#D71920' : '#666',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <ShoppingBag size={18} /> Pedidos ({recentOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('clients')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'clients' ? '3px solid #D71920' : '3px solid transparent',
            color: activeTab === 'clients' ? '#D71920' : '#666',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <Users size={18} /> Clientes ({adminClients.length})
        </button>

        <button
          onClick={() => setActiveTab('drivers')}
          style={{
            padding: '10px 20px',
            background: 'none',
            border: 'none',
            borderBottom: activeTab === 'drivers' ? '3px solid #D71920' : '3px solid transparent',
            color: activeTab === 'drivers' ? '#D71920' : '#666',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: '0.95rem',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            transition: 'all 0.2s'
          }}
        >
          <Truck size={18} /> Conductores ({adminDrivers.length})
        </button>
      </div>

      {/* ================= CONTENIDO: PEDIDOS ================= */}
      {activeTab === 'orders' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>
          {recentOrders.length === 0 ? (
            <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No hay pedidos registrados en el sistema.</p>
          ) : (
            recentOrders.map(o => (
              <div key={o.id} className="info-card" style={{ marginBottom: 0, position: 'relative' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                  <span style={{ fontWeight: '800', fontSize: '1.1rem', color: '#2C3E50' }}>S/ {o.price.toFixed(2)}</span>
                  <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                    <span style={{
                      background: o.status === 'ENTREGADO' ? '#dcfce7' : o.status === 'PENDIENTE' ? '#fef3c7' : '#dbeafe',
                      color: o.status === 'ENTREGADO' ? '#166534' : o.status === 'PENDIENTE' ? '#92400e' : '#1e40af',
                      padding: '4px 8px',
                      borderRadius: '4px',
                      fontSize: '0.7rem',
                      fontWeight: 'bold'
                    }}>
                      {o.status}
                    </span>
                    <button
                      onClick={() => onDeleteOrder(o.id)}
                      style={{
                        background: '#fef2f2',
                        border: 'none',
                        color: '#dc2626',
                        padding: '6px',
                        borderRadius: '6px',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        transition: 'all 0.2s'
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.background = '#fee2e2'}
                      onMouseLeave={(e) => e.currentTarget.style.background = '#fef2f2'}
                      title="Eliminar Pedido"
                    >
                      <Trash size={15} />
                    </button>
                  </div>
                </div>

                <div style={{ fontSize: '0.85rem', color: '#555', marginBottom: '10px', wordBreak: 'break-word' }}>
                  <div style={{ marginBottom: '4px' }}>🟢 <b>De:</b> {o.originAddress}</div>
                  <div>🔴 <b>A:</b> {o.destAddress}</div>
                </div>

                {o.status === 'PENDIENTE' && (
                  <div style={{ display: 'flex', gap: '5px', marginTop: '10px' }}>
                    <select
                      style={{ marginBottom: 0, padding: '8px', fontSize: '0.85rem', flex: 1 }}
                      value={selectedDrivers[o.id] || ''}
                      onChange={e => setSelectedDrivers({ ...selectedDrivers, [o.id]: e.target.value })}
                    >
                      <option value="">Asignar Chofer...</option>
                      {drivers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                    </select>
                    <button
                      className="btn-primary"
                      style={{ width: 'auto', padding: '0 15px', fontSize: '0.8rem' }}
                      onClick={() => {
                        if (!selectedDrivers[o.id]) {
                          toast.warning("Por favor selecciona un chofer");
                          return;
                        }
                        updateStatus(o.id, 'ASIGNADO', selectedDrivers[o.id]);
                      }}
                    >
                      OK
                    </button>
                  </div>
                )}

                {o.driver && (
                  <div style={{ marginTop: '8px', fontSize: '0.8rem', color: '#16a34a', display: 'flex', alignItems: 'center', gap: '5px' }}>
                    <User size={14} /> Chofer asignado: <b>{o.driver.name}</b> ({o.driver.phone})
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {/* ================= CONTENIDO: CLIENTES ================= */}
      {activeTab === 'clients' && (
        <div>
          {/* BOTÓN FORMULARIO */}
          <button
            onClick={() => setShowClientForm(!showClientForm)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#2C3E50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#1a252f'}
            onMouseLeave={(e) => e.target.style.background = '#2C3E50'}
          >
            <Plus size={18} /> {showClientForm ? "Ocultar Formulario" : "Registrar Nuevo Cliente"}
          </button>

          {/* FORMULARIO CLIENTE */}
          {showClientForm && (
            <form onSubmit={handleRegisterClient} className="info-card" style={{ background: '#f8f9fa', marginBottom: '20px', animation: 'fadeIn 0.2s ease' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#2C3E50' }}>Datos del Cliente</h3>
              
              <label>Nombre Completo</label>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <User size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#888' }} />
                <input
                  type="text"
                  placeholder="Nombre y Apellidos"
                  value={clientName}
                  onChange={(e) => setClientName(e.target.value)}
                  style={{ paddingLeft: '32px', marginBottom: 0 }}
                  required
                />
              </div>

              <label>Correo Electrónico</label>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Mail size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#888' }} />
                <input
                  type="email"
                  placeholder="ejemplo@correo.com"
                  value={clientEmail}
                  onChange={(e) => setClientEmail(e.target.value)}
                  style={{ paddingLeft: '32px', marginBottom: 0 }}
                  required
                />
              </div>

              <label>Teléfono</label>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Phone size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#888' }} />
                <input
                  type="tel"
                  placeholder="999888777"
                  value={clientPhone}
                  onChange={(e) => setClientPhone(e.target.value)}
                  style={{ paddingLeft: '32px', marginBottom: 0 }}
                  required
                />
              </div>

              <label>Contraseña</label>
              <div style={{ position: 'relative', marginBottom: '15px' }}>
                <Key size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#888' }} />
                <input
                  type="password"
                  placeholder="Crea una contraseña"
                  value={clientPassword}
                  onChange={(e) => setClientPassword(e.target.value)}
                  style={{ paddingLeft: '32px', marginBottom: 0 }}
                  required
                />
              </div>

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Registrar Cliente
              </button>
            </form>
          )}

          {/* LISTA CLIENTES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {adminClients.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No hay clientes registrados.</p>
            ) : (
              adminClients.map(c => (
                <div key={c.id} className="info-card" style={{ marginBottom: 0, padding: '15px' }}>
                  <div style={{ fontWeight: 'bold', fontSize: '1rem', color: '#2C3E50', marginBottom: '4px' }}>
                    {c.name}
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div>✉️ <b>Email:</b> {c.email}</div>
                    <div>📞 <b>Teléfono:</b> {c.phone}</div>
                    <div style={{ fontSize: '0.75rem', color: '#999', marginTop: '4px' }}>
                      Registrado: {new Date(c.createdAt).toLocaleDateString()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {/* ================= CONTENIDO: CONDUCTORES ================= */}
      {activeTab === 'drivers' && (
        <div>
          {/* BOTÓN FORMULARIO */}
          <button
            onClick={() => setShowDriverForm(!showDriverForm)}
            style={{
              width: '100%',
              padding: '12px',
              background: '#2C3E50',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              fontWeight: 'bold',
              cursor: 'pointer',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              transition: 'background 0.2s'
            }}
            onMouseEnter={(e) => e.target.style.background = '#1a252f'}
            onMouseLeave={(e) => e.target.style.background = '#2C3E50'}
          >
            <Plus size={18} /> {showDriverForm ? "Ocultar Formulario" : "Registrar Nuevo Conductor"}
          </button>

          {/* FORMULARIO CONDUCTOR */}
          {showDriverForm && (
            <form onSubmit={handleRegisterDriver} className="info-card" style={{ background: '#f8f9fa', marginBottom: '20px', animation: 'fadeIn 0.2s ease' }}>
              <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#2C3E50' }}>Datos Personales</h3>
              
              <label>Nombre Completo</label>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <User size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#888' }} />
                <input
                  type="text"
                  placeholder="Nombre y Apellidos"
                  value={driverName}
                  onChange={(e) => setDriverName(e.target.value)}
                  style={{ paddingLeft: '32px', marginBottom: 0 }}
                  required
                />
              </div>

              <label>Correo Electrónico</label>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Mail size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#888' }} />
                <input
                  type="email"
                  placeholder="ejemplo@driver.com"
                  value={driverEmail}
                  onChange={(e) => setDriverEmail(e.target.value)}
                  style={{ paddingLeft: '32px', marginBottom: 0 }}
                  required
                />
              </div>

              <label>Teléfono</label>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Phone size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#888' }} />
                <input
                  type="tel"
                  placeholder="987654321"
                  value={driverPhone}
                  onChange={(e) => setDriverPhone(e.target.value)}
                  style={{ paddingLeft: '32px', marginBottom: 0 }}
                  required
                />
              </div>

              <label>Contraseña</label>
              <div style={{ position: 'relative', marginBottom: '20px' }}>
                <Key size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#888' }} />
                <input
                  type="password"
                  placeholder="Crea una contraseña"
                  value={driverPassword}
                  onChange={(e) => setDriverPassword(e.target.value)}
                  style={{ paddingLeft: '32px', marginBottom: 0 }}
                  required
                />
              </div>

              <h3 style={{ margin: '0 0 15px 0', fontSize: '1rem', color: '#2C3E50' }}>Detalles del Vehículo</h3>

              <label>Tipo de Vehículo</label>
              <select
                value={driverVehicleType}
                onChange={(e) => setDriverVehicleType(e.target.value)}
                style={{ marginBottom: '12px' }}
              >
                <option value="moto">Motocicleta 🏍️</option>
                <option value="auto">Automóvil 🚗</option>
                <option value="furgoneta">Furgoneta 🚚</option>
              </select>

              <label>Placa del Vehículo</label>
              <div style={{ position: 'relative', marginBottom: '12px' }}>
                <Car size={16} style={{ position: 'absolute', left: '10px', top: '12px', color: '#888' }} />
                <input
                  type="text"
                  placeholder="ABC-123"
                  value={driverVehiclePlate}
                  onChange={(e) => setDriverVehiclePlate(e.target.value)}
                  style={{ paddingLeft: '32px', marginBottom: 0 }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', marginBottom: '12px' }}>
                <div>
                  <label>Marca</label>
                  <input
                    type="text"
                    placeholder="Honda / Toyota"
                    value={driverVehicleBrand}
                    onChange={(e) => setDriverVehicleBrand(e.target.value)}
                    style={{ marginBottom: 0 }}
                    required
                  />
                </div>
                <div>
                  <label>Modelo</label>
                  <input
                    type="text"
                    placeholder="CB190 / Yaris"
                    value={driverVehicleModel}
                    onChange={(e) => setDriverVehicleModel(e.target.value)}
                    style={{ marginBottom: 0 }}
                    required
                  />
                </div>
              </div>

              <label>Año de Fabricación</label>
              <input
                type="number"
                placeholder="2022"
                min="2000"
                max="2027"
                value={driverVehicleYear}
                onChange={(e) => setDriverVehicleYear(e.target.value)}
                style={{ marginBottom: '15px' }}
                required
              />

              <button type="submit" className="btn-primary" style={{ width: '100%' }}>
                Registrar y Verificar Conductor
              </button>
            </form>
          )}

          {/* LISTA CONDUCTORES */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {adminDrivers.length === 0 ? (
              <p style={{ color: '#999', textAlign: 'center', padding: '20px' }}>No hay conductores registrados.</p>
            ) : (
              adminDrivers.map(d => (
                <div key={d.id} className="info-card" style={{ marginBottom: 0, padding: '15px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                    <span style={{ fontWeight: 'bold', fontSize: '1rem', color: '#2C3E50' }}>{d.name}</span>
                    <div style={{ display: 'flex', gap: '5px' }}>
                      <span style={{
                        background: d.isVerified ? '#dcfce7' : '#fee2e2',
                        color: d.isVerified ? '#166534' : '#991b1b',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 'bold'
                      }}>
                        {d.isVerified ? 'VERIFICADO' : 'PENDIENTE'}
                      </span>
                      <span style={{
                        background: d.isOnline ? '#dbeafe' : '#f1f5f9',
                        color: d.isOnline ? '#1e40af' : '#64748b',
                        padding: '3px 8px',
                        borderRadius: '4px',
                        fontSize: '0.65rem',
                        fontWeight: 'bold'
                      }}>
                        {d.isOnline ? 'ONLINE' : 'OFFLINE'}
                      </span>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.85rem', color: '#666', display: 'flex', flexDirection: 'column', gap: '2px' }}>
                    <div>✉️ <b>Email:</b> {d.email}</div>
                    <div>📞 <b>Teléfono:</b> {d.phone}</div>
                    <div style={{ marginTop: '5px', padding: '8px', background: '#f8f9fa', borderRadius: '6px', fontSize: '0.8rem' }}>
                      🚗 <b>Vehículo:</b> {d.vehicleBrand} {d.vehicleModel} ({d.vehicleYear}) • <b>Placa:</b> {d.vehiclePlate} • <b>Tipo:</b> {d.vehicleType.toUpperCase()}
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}