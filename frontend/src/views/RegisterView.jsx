import React, { useState } from 'react';
import { User, Truck, ArrowLeft, Upload, Mail, Lock, Phone, UserCircle, Car, Calendar, FileText } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

export default function RegisterView() {
  const navigate = useNavigate();
  const toast = useToast();
  const [accountType, setAccountType] = useState('client'); // 'client' o 'driver'
  
  // Estados para Cliente
  const [clientData, setClientData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  // Estados para Conductor
  const [driverData, setDriverData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    vehicleType: 'moto',
    vehiclePlate: '',
    vehicleBrand: '',
    vehicleModel: '',
    vehicleYear: new Date().getFullYear(),
    driverLicense: null,
    vehicleSOAT: null,
    criminalRecord: null
  });

  const handleClientChange = (field, value) => {
    setClientData(prev => ({ ...prev, [field]: value }));
  };

  const handleDriverChange = (field, value) => {
    setDriverData(prev => ({ ...prev, [field]: value }));
  };

  const handleFileChange = (field, file) => {
    setDriverData(prev => ({ ...prev, [field]: file }));
  };

  const handleClientSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (clientData.password !== clientData.confirmPassword) {
      toast.warning('Las contraseñas no coinciden');
      return;
    }
    if (clientData.password.length < 6) {
      toast.warning('La contraseña debe tener al menos 6 caracteres');
      return;
    }

    try {
      const response = await fetch('http://localhost:3001/api/register/client', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: clientData.name,
          email: clientData.email,
          phone: clientData.phone,
          password: clientData.password
        })
      });

      if (response.ok) {
        toast.success('¡Cuenta creada exitosamente! Ahora puedes iniciar sesión.');
        navigate('/login');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al crear cuenta');
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor');
    }
  };

  const handleDriverSubmit = async (e) => {
    e.preventDefault();

    // Validaciones
    if (driverData.password !== driverData.confirmPassword) {
      toast.warning('Las contraseñas no coinciden');
      return;
    }
    if (!driverData.driverLicense || !driverData.vehicleSOAT) {
      toast.warning('Debes subir al menos tu licencia y SOAT');
      return;
    }

    // Crear FormData para archivos
    const formData = new FormData();
    formData.append('name', driverData.name);
    formData.append('email', driverData.email);
    formData.append('phone', driverData.phone);
    formData.append('password', driverData.password);
    formData.append('vehicleType', driverData.vehicleType);
    formData.append('vehiclePlate', driverData.vehiclePlate);
    formData.append('vehicleBrand', driverData.vehicleBrand);
    formData.append('vehicleModel', driverData.vehicleModel);
    formData.append('vehicleYear', driverData.vehicleYear);

    if (driverData.driverLicense) formData.append('driverLicense', driverData.driverLicense);
    if (driverData.vehicleSOAT) formData.append('vehicleSOAT', driverData.vehicleSOAT);
    if (driverData.criminalRecord) formData.append('criminalRecord', driverData.criminalRecord);

    try {
      const response = await fetch('http://localhost:3001/api/register/driver', {
        method: 'POST',
        body: formData
      });

      if (response.ok) {
        toast.success('¡Solicitud enviada! Tu cuenta será revisada por nuestro equipo.');
        navigate('/login');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Error al enviar solicitud');
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor');
    }
  };

  return (
    <div style={{ 
      minHeight: '100vh', 
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: '40px 20px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center'
    }}>
      <div style={{ 
        background: 'white', 
        borderRadius: '20px', 
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        maxWidth: '900px',
        width: '100%',
        overflow: 'hidden'
      }}>
        
        {/* Header */}
        <div style={{ 
          background: 'linear-gradient(135deg, #2C3E50 0%, #1a252f 100%)',
          padding: '30px',
          color: 'white',
          position: 'relative'
        }}>
          <button 
            onClick={() => navigate('/login')}
            style={{
              position: 'absolute',
              top: '20px',
              left: '20px',
              background: 'rgba(255,255,255,0.1)',
              border: 'none',
              color: 'white',
              padding: '8px 12px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}
          >
            <ArrowLeft size={18}/> Volver
          </button>
          
          <h1 style={{ 
            textAlign: 'center', 
            margin: '20px 0 10px 0',
            fontSize: '2rem'
          }}>
            Crear Cuenta
          </h1>
          <p style={{ textAlign: 'center', opacity: 0.9, fontSize: '0.9rem' }}>
            Únete a la comunidad URBSEND
          </p>
        </div>

        {/* Selector de tipo de cuenta */}
        <div style={{ 
          display: 'flex', 
          gap: '15px', 
          padding: '30px 30px 0 30px',
          justifyContent: 'center'
        }}>
          <TypeButton 
            icon={<User size={24}/>}
            label="Soy Cliente"
            subtitle="Quiero enviar paquetes"
            active={accountType === 'client'}
            onClick={() => setAccountType('client')}
          />
          <TypeButton 
            icon={<Truck size={24}/>}
            label="Soy Conductor"
            subtitle="Quiero repartir"
            active={accountType === 'driver'}
            onClick={() => setAccountType('driver')}
          />
        </div>

        {/* Formularios */}
        <div style={{ padding: '30px' }}>
          {accountType === 'client' ? (
            <ClientForm 
              data={clientData}
              onChange={handleClientChange}
              onSubmit={handleClientSubmit}
            />
          ) : (
            <DriverForm 
              data={driverData}
              onChange={handleDriverChange}
              onFileChange={handleFileChange}
              onSubmit={handleDriverSubmit}
            />
          )}
        </div>
      </div>
    </div>
  );
}

// ============ COMPONENTES AUXILIARES ============

function TypeButton({ icon, label, subtitle, active, onClick }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: 1,
        maxWidth: '250px',
        padding: '20px',
        border: active ? '2px solid #D71920' : '2px solid #e5e7eb',
        background: active ? '#FFF5F5' : 'white',
        borderRadius: '12px',
        cursor: 'pointer',
        transition: 'all 0.3s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <div style={{ 
        color: active ? '#D71920' : '#666',
        marginBottom: '5px'
      }}>
        {icon}
      </div>
      <div style={{ 
        fontWeight: 'bold', 
        fontSize: '1.1rem',
        color: active ? '#D71920' : '#2C3E50'
      }}>
        {label}
      </div>
      <div style={{ 
        fontSize: '0.8rem', 
        color: '#999'
      }}>
        {subtitle}
      </div>
    </button>
  );
}

function ClientForm({ data, onChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <FormField
        icon={<UserCircle size={18}/>}
        label="Nombre Completo"
        type="text"
        placeholder="Ej: Juan Pérez"
        value={data.name}
        onChange={(e) => onChange('name', e.target.value)}
        required
      />
      
      <FormField
        icon={<Mail size={18}/>}
        label="Correo Electrónico"
        type="email"
        placeholder="tu@email.com"
        value={data.email}
        onChange={(e) => onChange('email', e.target.value)}
        required
      />
      
      <FormField
        icon={<Phone size={18}/>}
        label="Teléfono"
        type="tel"
        placeholder="900 100 100"
        value={data.phone}
        onChange={(e) => onChange('phone', e.target.value)}
        required
      />
      
      <FormField
        icon={<Lock size={18}/>}
        label="Contraseña"
        type="password"
        placeholder="Mínimo 6 caracteres"
        value={data.password}
        onChange={(e) => onChange('password', e.target.value)}
        required
      />
      
      <FormField
        icon={<Lock size={18}/>}
        label="Confirmar Contraseña"
        type="password"
        placeholder="Repite tu contraseña"
        value={data.confirmPassword}
        onChange={(e) => onChange('confirmPassword', e.target.value)}
        required
      />

      <button 
        type="submit"
        className="btn-primary"
        style={{ marginTop: '10px', fontSize: '1rem', padding: '14px' }}
      >
        CREAR CUENTA DE CLIENTE
      </button>
    </form>
  );
}

function DriverForm({ data, onChange, onFileChange, onSubmit }) {
  return (
    <form onSubmit={onSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
      
      {/* Información Personal */}
      <h3 style={{ color: '#2C3E50', marginBottom: '10px', fontSize: '1.1rem' }}>📋 Información Personal</h3>
      
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <FormField
          icon={<UserCircle size={18}/>}
          label="Nombre Completo"
          type="text"
          value={data.name}
          onChange={(e) => onChange('name', e.target.value)}
          required
        />
        
        <FormField
          icon={<Phone size={18}/>}
          label="Teléfono"
          type="tel"
          value={data.phone}
          onChange={(e) => onChange('phone', e.target.value)}
          required
        />
      </div>

      <FormField
        icon={<Mail size={18}/>}
        label="Correo Electrónico"
        type="email"
        value={data.email}
        onChange={(e) => onChange('email', e.target.value)}
        required
      />

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <FormField
          icon={<Lock size={18}/>}
          label="Contraseña"
          type="password"
          value={data.password}
          onChange={(e) => onChange('password', e.target.value)}
          required
        />
        
        <FormField
          icon={<Lock size={18}/>}
          label="Confirmar"
          type="password"
          value={data.confirmPassword}
          onChange={(e) => onChange('confirmPassword', e.target.value)}
          required
        />
      </div>

      {/* Información del Vehículo */}
      <h3 style={{ color: '#2C3E50', marginBottom: '10px', marginTop: '20px', fontSize: '1.1rem' }}>🚗 Información del Vehículo</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
        <div>
          <label style={{ fontSize: '0.85rem', fontWeight: 'bold', color: '#555', marginBottom: '5px', display: 'block' }}>
            Tipo de Vehículo
          </label>
          <select 
            value={data.vehicleType}
            onChange={(e) => onChange('vehicleType', e.target.value)}
            style={{ 
              width: '100%', 
              padding: '10px', 
              borderRadius: '8px', 
              border: '1px solid #ddd',
              fontSize: '0.9rem'
            }}
          >
            <option value="moto">🏍️ Moto</option>
            <option value="auto">🚗 Auto</option>
            <option value="furgoneta">🚐 Furgoneta</option>
          </select>
        </div>

        <FormField
          icon={<Car size={18}/>}
          label="Placa"
          type="text"
          placeholder="ABC-123"
          value={data.vehiclePlate}
          onChange={(e) => onChange('vehiclePlate', e.target.value.toUpperCase())}
          required
        />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '15px' }}>
        <FormField
          icon={<Car size={18}/>}
          label="Marca"
          type="text"
          placeholder="Honda"
          value={data.vehicleBrand}
          onChange={(e) => onChange('vehicleBrand', e.target.value)}
          required
        />
        
        <FormField
          icon={<Car size={18}/>}
          label="Modelo"
          type="text"
          placeholder="CB 150"
          value={data.vehicleModel}
          onChange={(e) => onChange('vehicleModel', e.target.value)}
          required
        />

        <FormField
          icon={<Calendar size={18}/>}
          label="Año"
          type="number"
          value={data.vehicleYear}
          onChange={(e) => onChange('vehicleYear', parseInt(e.target.value))}
          min="2000"
          max={new Date().getFullYear()}
          required
        />
      </div>

      {/* Documentos */}
      <h3 style={{ color: '#2C3E50', marginBottom: '10px', marginTop: '20px', fontSize: '1.1rem' }}>📄 Documentos Requeridos</h3>
      
      <FileUpload 
        label="Licencia de Conducir *"
        accept="image/*,.pdf"
        onChange={(e) => onFileChange('driverLicense', e.target.files[0])}
        fileName={data.driverLicense?.name}
      />

      <FileUpload 
        label="SOAT del Vehículo *"
        accept="image/*,.pdf"
        onChange={(e) => onFileChange('vehicleSOAT', e.target.files[0])}
        fileName={data.vehicleSOAT?.name}
      />

      <FileUpload 
        label="Antecedentes Penales (Opcional)"
        accept="image/*,.pdf"
        onChange={(e) => onFileChange('criminalRecord', e.target.files[0])}
        fileName={data.criminalRecord?.name}
      />

      <div style={{ 
        background: '#FFF9E6', 
        border: '1px solid #FFE082',
        borderRadius: '8px',
        padding: '15px',
        marginTop: '10px'
      }}>
        <p style={{ fontSize: '0.85rem', color: '#666', margin: 0 }}>
          ⚠️ <b>Importante:</b> Tu solicitud será revisada por nuestro equipo. 
          Te notificaremos cuando tu cuenta sea aprobada (máximo 48 horas).
        </p>
      </div>

      <button 
        type="submit"
        className="btn-primary"
        style={{ marginTop: '10px', fontSize: '1rem', padding: '14px' }}
      >
        ENVIAR SOLICITUD DE CONDUCTOR
      </button>
    </form>
  );
}

function FormField({ icon, label, ...inputProps }) {
  return (
    <div>
      <label style={{ 
        fontSize: '0.85rem', 
        fontWeight: 'bold', 
        color: '#555', 
        marginBottom: '5px',
        display: 'flex',
        alignItems: 'center',
        gap: '5px'
      }}>
        {icon} {label}
      </label>
      <input 
        {...inputProps}
        style={{ 
          width: '100%', 
          padding: '10px 12px', 
          borderRadius: '8px', 
          border: '1px solid #ddd',
          fontSize: '0.9rem',
          transition: 'border 0.2s'
        }}
        onFocus={(e) => e.target.style.borderColor = '#D71920'}
        onBlur={(e) => e.target.style.borderColor = '#ddd'}
      />
    </div>
  );
}

function FileUpload({ label, accept, onChange, fileName }) {
  return (
    <div>
      <label style={{ 
        fontSize: '0.85rem', 
        fontWeight: 'bold', 
        color: '#555', 
        marginBottom: '8px',
        display: 'block'
      }}>
        {label}
      </label>
      <div style={{ position: 'relative' }}>
        <input 
          type="file"
          accept={accept}
          onChange={onChange}
          style={{ display: 'none' }}
          id={label.replace(/\s/g, '')}
        />
        <label 
          htmlFor={label.replace(/\s/g, '')}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            padding: '12px',
            border: '2px dashed #ddd',
            borderRadius: '8px',
            cursor: 'pointer',
            background: fileName ? '#f0fdf4' : 'white',
            transition: 'all 0.2s'
          }}
          onMouseEnter={(e) => e.currentTarget.style.borderColor = '#D71920'}
          onMouseLeave={(e) => e.currentTarget.style.borderColor = '#ddd'}
        >
          <Upload size={18} color={fileName ? '#16a34a' : '#999'}/>
          <span style={{ 
            fontSize: '0.9rem', 
            color: fileName ? '#16a34a' : '#666'
          }}>
            {fileName || 'Seleccionar archivo...'}
          </span>
        </label>
      </div>
    </div>
  );
}