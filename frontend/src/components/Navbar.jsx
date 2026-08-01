import React, { useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  Navigation, ShoppingCart, User, Menu, X, LogOut,
  MapPin, Package, FileText, Users, TrendingUp, Settings,
  Truck, Shield, Clock, Bell
} from 'lucide-react';

export default function Navbar({ userRole, onLogout }) {
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [notifications, setNotifications] = useState(15);

  const getLinkClass = (path) => location.pathname === path ? 'nav-link-active' : 'nav-link';

  return (
    <>
      {/* TOP NAVBAR - Responsive */}
      <nav style={{
        background: '#D71920',
        color: 'white',
        padding: '12px 15px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        flexWrap: 'wrap',
        gap: '10px'
      }}>
        {/* Logo + Menu Hamburger */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            style={{
              background: 'rgba(255,255,255,0.2)',
              border: 'none',
              color: 'white',
              padding: '8px 10px',
              borderRadius: '8px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Menu size={20}/>
            <span className="hide-mobile" style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>MENÚ</span>
          </button>

          <Link to="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Navigation size={28} color="white" strokeWidth={2.5}/>
            <span style={{
              fontSize: 'clamp(1.2rem, 4vw, 1.8rem)',
              fontWeight: '900',
              color: 'white',
              letterSpacing: '1px'
            }}>
              URBSEND
            </span>
          </Link>
        </div>

        {/* Links Centrales - Solo en Desktop */}
        <div className="hide-mobile" style={{
          display: 'flex',
          gap: '20px',
          alignItems: 'center'
        }}>
          <NavLink to="/" icon={<Package size={18}/>} label="Inicio"/>
          <NavLink to="/tracking" icon={<MapPin size={18}/>} label="Rastreo"/>

          {userRole === 'client' && (
            <NavLink to="/client" icon={<FileText size={18}/>} label="Enviar"/>
          )}

          {userRole === 'admin' && (
            <NavLink to="/admin" icon={<Shield size={18}/>} label="Panel"/>
          )}

          {userRole === 'driver' && (
            <NavLink to="/driver" icon={<Truck size={18}/>} label="Rutas"/>
          )}

          <NavLink to="/help" icon={<Users size={18}/>} label="Ayuda"/>
        </div>

        {/* Iconos Derecha */}
        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
          {/* Notificaciones */}
          <button style={{
            background: 'rgba(255,255,255,0.2)',
            border: 'none',
            color: 'white',
            padding: '8px',
            borderRadius: '50%',
            cursor: 'pointer',
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            <Bell size={18}/>
            {notifications > 0 && (
              <span style={{
                position: 'absolute',
                top: '-4px',
                right: '-4px',
                background: '#FFD700',
                color: '#D71920',
                borderRadius: '50%',
                width: '16px',
                height: '16px',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}>
                {notifications > 9 ? '9+' : notifications}
              </span>
            )}
          </button>

          {/* Usuario / Login */}
          {userRole ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {/* Badge de rol - solo en desktop */}
              <div className="hide-mobile" style={{
                background: 'rgba(255,255,255,0.2)',
                padding: '6px 12px',
                borderRadius: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <User size={16}/>
                <span style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>
                  {userRole === 'admin' ? 'Admin' : userRole === 'driver' ? 'Conductor' : 'Cliente'}
                </span>
              </div>
              <button
                onClick={onLogout}
                style={{
                  background: 'rgba(255,255,255,0.2)',
                  border: 'none',
                  color: 'white',
                  padding: '8px 12px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '5px',
                  fontWeight: 'bold',
                  fontSize: '0.8rem'
                }}
              >
                <LogOut size={16}/>
                <span className="hide-mobile">Salir</span>
              </button>
            </div>
          ) : (
            <Link to="/login">
              <button style={{
                background: 'white',
                color: '#D71920',
                border: 'none',
                padding: '8px 16px',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: 'bold',
                fontSize: '0.85rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                <User size={16}/>
                <span className="hide-mobile">INGRESAR</span>
              </button>
            </Link>
          )}
        </div>
      </nav>

      {/* SIDEBAR - Responsive */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: isSidebarOpen ? 0 : '-100%',
        width: 'min(280px, 85vw)',
        height: '100vh',
        background: '#1a1a1a',
        color: 'white',
        transition: 'left 0.3s ease',
        zIndex: 2000,
        overflowY: 'auto',
        boxShadow: '2px 0 10px rgba(0,0,0,0.3)'
      }}>
        {/* Header Sidebar */}
        <div style={{
          padding: '15px 20px',
          borderBottom: '1px solid #333',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h3 style={{ margin: 0, color: '#D71920', fontSize: '1.1rem' }}>MENÚ</h3>
          <button
            onClick={() => setIsSidebarOpen(false)}
            style={{
              background: 'none',
              border: 'none',
              color: 'white',
              cursor: 'pointer',
              padding: '5px'
            }}
          >
            <X size={24}/>
          </button>
        </div>

        {/* Links Sidebar */}
        <div style={{ padding: '15px 0' }}>
          <SidebarSection title="Principal">
            <SidebarLink to="/" icon={<Package size={18}/>} label="Inicio" onClick={() => setIsSidebarOpen(false)}/>
            <SidebarLink to="/tracking" icon={<MapPin size={18}/>} label="Rastrear Pedido" onClick={() => setIsSidebarOpen(false)}/>
            <SidebarLink to="/about" icon={<Users size={18}/>} label="Nosotros" onClick={() => setIsSidebarOpen(false)}/>
            <SidebarLink to="/help" icon={<FileText size={18}/>} label="Centro de Ayuda" onClick={() => setIsSidebarOpen(false)}/>
          </SidebarSection>

          {userRole === 'client' && (
            <SidebarSection title="Cliente">
              <SidebarLink to="/client" icon={<Package size={18}/>} label="Crear Envío" onClick={() => setIsSidebarOpen(false)}/>
              <SidebarLink to="/client/history" icon={<Clock size={18}/>} label="Historial" onClick={() => setIsSidebarOpen(false)}/>
            </SidebarSection>
          )}

          {userRole === 'admin' && (
            <SidebarSection title="Administración">
              <SidebarLink to="/admin" icon={<Shield size={18}/>} label="Panel Admin" onClick={() => setIsSidebarOpen(false)}/>
              <SidebarLink to="/admin/drivers" icon={<Truck size={18}/>} label="Conductores" onClick={() => setIsSidebarOpen(false)}/>
              <SidebarLink to="/admin/analytics" icon={<TrendingUp size={18}/>} label="Métricas" onClick={() => setIsSidebarOpen(false)}/>
              <SidebarLink to="/admin/settings" icon={<Settings size={18}/>} label="Configuración" onClick={() => setIsSidebarOpen(false)}/>
            </SidebarSection>
          )}

          {userRole === 'driver' && (
            <SidebarSection title="Conductor">
              <SidebarLink to="/driver" icon={<Truck size={18}/>} label="Mis Rutas" onClick={() => setIsSidebarOpen(false)}/>
              <SidebarLink to="/driver/earnings" icon={<TrendingUp size={18}/>} label="Ganancias" onClick={() => setIsSidebarOpen(false)}/>
            </SidebarSection>
          )}

          {!userRole && (
            <SidebarSection title="Cuenta">
              <SidebarLink to="/login" icon={<User size={18}/>} label="Iniciar Sesión" onClick={() => setIsSidebarOpen(false)}/>
              <SidebarLink to="/register" icon={<User size={18}/>} label="Registrarse" onClick={() => setIsSidebarOpen(false)}/>
            </SidebarSection>
          )}
        </div>

        {/* Footer Sidebar */}
        <div style={{
          position: 'absolute',
          bottom: 0,
          width: '100%',
          padding: '15px 20px',
          borderTop: '1px solid #333',
          background: '#0f0f0f'
        }}>
          <p style={{ margin: 0, fontSize: '0.7rem', color: '#666' }}>
            © 2026 URBSEND
          </p>
        </div>
      </div>

      {/* Overlay cuando sidebar está abierto */}
      {isSidebarOpen && (
        <div
          onClick={() => setIsSidebarOpen(false)}
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: 'rgba(0,0,0,0.5)',
            zIndex: 1999
          }}
        />
      )}

      {/* Estilos CSS inline para hide-mobile */}
      <style>{`
        @media (max-width: 768px) {
          .hide-mobile {
            display: none !important;
          }
        }
      `}</style>
    </>
  );
}

// ========== COMPONENTES AUXILIARES ==========

function NavLink({ to, icon, label }) {
  return (
    <Link to={to} style={{
      textDecoration: 'none',
      color: 'white',
      display: 'flex',
      alignItems: 'center',
      gap: '6px',
      fontSize: '0.85rem',
      fontWeight: '600',
      padding: '8px 12px',
      borderRadius: '8px',
      transition: 'background 0.2s',
      whiteSpace: 'nowrap'
    }}
    onMouseEnter={(e) => e.currentTarget.style.background = 'rgba(255,255,255,0.1)'}
    onMouseLeave={(e) => e.currentTarget.style.background = 'transparent'}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}

function SidebarSection({ title, children }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        padding: '0 20px',
        fontSize: '0.7rem',
        color: '#666',
        fontWeight: 'bold',
        textTransform: 'uppercase',
        letterSpacing: '1px',
        marginBottom: '8px'
      }}>
        {title}
      </div>
      {children}
    </div>
  );
}

function SidebarLink({ to, icon, label, onClick }) {
  return (
    <Link to={to} onClick={onClick} style={{
      textDecoration: 'none',
      color: '#ccc',
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px 20px',
      fontSize: '0.9rem',
      transition: 'all 0.2s'
    }}
    onMouseEnter={(e) => {
      e.currentTarget.style.background = '#D71920';
      e.currentTarget.style.color = 'white';
    }}
    onMouseLeave={(e) => {
      e.currentTarget.style.background = 'transparent';
      e.currentTarget.style.color = '#ccc';
    }}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}
