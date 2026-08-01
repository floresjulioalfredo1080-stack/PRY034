import React, { useState } from 'react';
import { User, Shield, Truck, LogIn, UserPlus } from 'lucide-react';
import { useNavigate, Link } from 'react-router-dom';
import { useToast } from '../components/Toast';

export default function LoginView({ onLogin }) {
  const [role, setRole] = useState('client');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogin = async () => {
    // PARA ADMIN: Mantener login hardcoded
    if (role === 'admin') {
      if (password !== 'admin123') {
        toast.error("Contraseña incorrecta para Admin");
        return;
      }
      onLogin('admin');
      toast.success("¡Bienvenido Administrador!");
      return navigate('/admin');
    }

    // PARA CLIENTE Y CONDUCTOR: Autenticación real con API
    if (!email || !password) {
      toast.warning("Ingresa tu email y contraseña");
      return;
    }

    try {
      const response = await fetch(`http://localhost:3001/api/login/${role}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (response.ok) {
        const data = await response.json();

        // Guardar información del usuario
        localStorage.setItem('user_data', JSON.stringify(data.user));

        onLogin(role);
        toast.success(`¡Bienvenido ${data.user.name}!`);

        if (role === 'driver') navigate('/driver');
        else navigate('/client');
      } else {
        const error = await response.json();
        toast.error(error.error || 'Credenciales incorrectas');
      }
    } catch (err) {
      toast.error('Error de conexión con el servidor');
    }
  };

  return (
    <div style={{
      height: '100%',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%)',
      padding: 'clamp(15px, 4vw, 20px)'
    }}>
      <div style={{
        background: 'white',
        padding: 'clamp(25px, 5vw, 40px)',
        borderRadius: '20px',
        boxShadow: '0 20px 60px rgba(0,0,0,0.1)',
        width: '100%',
        maxWidth: '450px',
        textAlign: 'center'
      }}>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '20px' }}>
            <div style={{ background: '#FFF0F0', padding: '15px', borderRadius: '50%' }}>
                <LogIn color="#D71920" size={32} />
            </div>
        </div>

        <h2 style={{
          marginBottom: '10px',
          color: '#2C3E50',
          fontSize: 'clamp(1.2rem, 4vw, 1.5rem)'
        }}>
          Iniciar Sesión
        </h2>
        <p style={{
          color: '#999',
          marginBottom: '30px',
          fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)'
        }}>
          Accede a tu cuenta URBSEND
        </p>

        {/* Selector de Rol */}
        <div style={{
          display: 'flex',
          gap: 'clamp(8px, 2vw, 10px)',
          marginBottom: '25px',
          justifyContent: 'center'
        }}>
            <RoleButton icon={<User size={20}/>} label="Cliente" active={role==='client'} onClick={()=>setRole('client')}/>
            <RoleButton icon={<Shield size={20}/>} label="Admin" active={role==='admin'} onClick={()=>setRole('admin')}/>
            <RoleButton icon={<Truck size={20}/>} label="Chofer" active={role==='driver'} onClick={()=>setRole('driver')}/>
        </div>

        {/* Campos de Login */}
        {role === 'admin' ? (
          // Admin solo necesita contraseña
          <input
              type="password"
              placeholder="Contraseña Admin..."
              value={password}
              onChange={e => setPassword(e.target.value)}
              style={{
                width: '100%',
                padding: 'clamp(10px, 3vw, 12px)',
                marginBottom: '15px',
                borderRadius: '8px',
                border: '1px solid #ddd',
                fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
              }}
          />
        ) : (
          // Cliente y Conductor necesitan email y password
          <>
            <input
                type="email"
                placeholder="Correo electrónico..."
                value={email}
                onChange={e => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'clamp(10px, 3vw, 12px)',
                  marginBottom: '12px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
                }}
            />
            <input
                type="password"
                placeholder="Contraseña..."
                value={password}
                onChange={e => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: 'clamp(10px, 3vw, 12px)',
                  marginBottom: '15px',
                  borderRadius: '8px',
                  border: '1px solid #ddd',
                  fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)'
                }}
            />
          </>
        )}

        <button
          className="btn-primary"
          onClick={handleLogin}
          style={{ marginBottom: '15px' }}
        >
            INGRESAR
        </button>

        {/* Botón de Registro (Solo para Cliente y Conductor) */}
        {role !== 'admin' && (
          <div style={{ marginTop: '20px', paddingTop: '20px', borderTop: '1px solid #eee' }}>
            <p style={{
              color: '#666',
              fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)',
              marginBottom: '12px'
            }}>
              ¿No tienes cuenta?
            </p>
            <Link to="/register">
              <button
                style={{
                  width: '100%',
                  padding: 'clamp(10px, 3vw, 12px)',
                  background: 'white',
                  border: '2px solid #D71920',
                  color: '#D71920',
                  borderRadius: '10px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.target.style.background = '#D71920';
                  e.target.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.target.style.background = 'white';
                  e.target.style.color = '#D71920';
                }}
              >
                <UserPlus size={18}/> CREAR CUENTA
              </button>
            </Link>
          </div>
        )}

        <p style={{
          marginTop: '25px',
          fontSize: 'clamp(0.65rem, 2vw, 0.75rem)',
          color: '#aaa'
        }}>
            URBSEND v2.0 - Acceso Seguro
        </p>
      </div>
    </div>
  );
}

function RoleButton({ icon, label, active, onClick }) {
    return (
        <button
            onClick={onClick}
            style={{
                flex: 1,
                padding: 'clamp(8px, 2vw, 10px)',
                border: active ? '2px solid #D71920' : '1px solid #eee',
                background: active ? '#FFF0F0' : 'white',
                color: active ? '#D71920' : '#666',
                borderRadius: '10px',
                cursor: 'pointer',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                gap: '5px',
                fontSize: 'clamp(0.7rem, 2vw, 0.8rem)',
                fontWeight: 'bold',
                transition: 'all 0.2s'
            }}
        >
            {icon} {label}
        </button>
    )
}
