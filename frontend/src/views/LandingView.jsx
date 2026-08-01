import React from 'react';
import { Link } from 'react-router-dom';
import { Truck, Clock, Shield, ChevronRight } from 'lucide-react';

export default function LandingView() {
  return (
    <div style={{ width: '100%', height: '100%', overflowY: 'auto', background: '#fff' }}>

      {/* HERO SECTION (Portada) - RESPONSIVE */}
      <div style={{
        background: 'linear-gradient(135deg, #2C3E50 0%, #1a252f 100%)',
        color: 'white',
        padding: 'clamp(40px, 8vw, 60px) clamp(15px, 5vw, 30px)',
        textAlign: 'center',
        borderBottomRightRadius: '50% 20px',
        borderBottomLeftRadius: '50% 20px'
      }}>
        <h1 style={{
          fontSize: 'clamp(1.5rem, 5vw, 2.5rem)',
          margin: '0 0 15px 0',
          fontWeight: '800',
          lineHeight: '1.2'
        }}>
          Envíos rápidos en <span style={{ color: '#D71920' }}>Arequipa</span>
        </h1>
        <p style={{
          fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
          opacity: 0.9,
          maxWidth: '500px',
          margin: '0 auto 30px auto',
          lineHeight: '1.5',
          padding: '0 10px'
        }}>
          La plataforma logística más confiable para tus paquetes. Desde documentos hasta mudanzas.
        </p>

        <div style={{
          display: 'flex',
          gap: '15px',
          justifyContent: 'center',
          flexWrap: 'wrap',
          padding: '0 10px'
        }}>
          <Link to="/client" style={{ textDecoration: 'none' }}>
            <button className="btn-primary" style={{
              padding: 'clamp(12px, 3vw, 15px) clamp(20px, 5vw, 30px)',
              fontSize: 'clamp(0.9rem, 2.5vw, 1.1rem)',
              boxShadow: '0 10px 20px rgba(0,0,0,0.3)',
              whiteSpace: 'nowrap'
            }}>
              HACER UN ENVÍO
            </button>
          </Link>
        </div>
      </div>

      {/* CARACTERÍSTICAS - RESPONSIVE */}
      <div style={{
        padding: 'clamp(25px, 5vw, 40px) clamp(15px, 4vw, 20px)',
        maxWidth: '800px',
        margin: '0 auto'
      }}>
        <h3 style={{
          textAlign: 'center',
          color: '#2C3E50',
          marginBottom: 'clamp(20px, 4vw, 30px)',
          fontSize: 'clamp(1rem, 3vw, 1.25rem)'
        }}>
          ¿Por qué elegir URBSEND?
        </h3>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 200px), 1fr))',
          gap: 'clamp(12px, 3vw, 20px)'
        }}>
          <FeatureCard
            icon={<Clock size={36} color="#D71920"/>}
            title="Al Instante"
            description="Conductores disponibles en minutos cerca de ti."
          />
          <FeatureCard
            icon={<Shield size={36} color="#D71920"/>}
            title="Seguro"
            description="Monitoreo en tiempo real y código de seguridad."
          />
          <FeatureCard
            icon={<Truck size={36} color="#D71920"/>}
            title="Todo Tamaño"
            description="Motos, autos y furgonetas a tu disposición."
          />
        </div>
      </div>

      {/* ACCESOS RÁPIDOS - RESPONSIVE */}
      <div style={{
        background: '#F8F9FA',
        padding: 'clamp(25px, 5vw, 40px) clamp(15px, 4vw, 20px)'
      }}>
        <div style={{
          maxWidth: '600px',
          margin: '0 auto',
          display: 'flex',
          flexDirection: 'column',
          gap: 'clamp(10px, 2vw, 15px)'
        }}>
          <QuickAccessCard
            to="/tracking"
            icon={<Truck color="#1e40af" size={24}/>}
            bgColor="#E0E7FF"
            textColor="#1e40af"
            label="Rastrear un Pedido"
          />

          <QuickAccessCard
            to="/driver"
            icon={<Truck color="#166534" size={24}/>}
            bgColor="#DCFCE7"
            textColor="#166534"
            label="Soy Conductor"
          />
        </div>
      </div>
    </div>
  );
}

// Componente reutilizable para features
function FeatureCard({ icon, title, description }) {
  return (
    <div className="info-card" style={{
      textAlign: 'center',
      border: 'none',
      boxShadow: '0 5px 15px rgba(0,0,0,0.05)',
      padding: 'clamp(15px, 4vw, 20px)',
      margin: 0
    }}>
      <div style={{ marginBottom: 'clamp(10px, 2vw, 15px)' }}>
        {icon}
      </div>
      <h4 style={{
        margin: '0 0 10px 0',
        fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)'
      }}>
        {title}
      </h4>
      <p style={{
        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
        color: '#666',
        margin: 0,
        lineHeight: '1.4'
      }}>
        {description}
      </p>
    </div>
  );
}

// Componente reutilizable para accesos rápidos
function QuickAccessCard({ to, icon, bgColor, textColor, label }) {
  return (
    <Link to={to} style={{ textDecoration: 'none' }}>
      <div className="info-card" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        cursor: 'pointer',
        padding: 'clamp(12px, 3vw, 16px)',
        margin: 0,
        transition: 'transform 0.2s, box-shadow 0.2s'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 5px 15px rgba(0,0,0,0.1)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'clamp(10px, 3vw, 15px)'
        }}>
          <div style={{
            background: bgColor,
            padding: 'clamp(8px, 2vw, 10px)',
            borderRadius: '50%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}>
            {icon}
          </div>
          <div style={{
            fontWeight: 'bold',
            color: textColor,
            fontSize: 'clamp(0.85rem, 2.5vw, 1rem)'
          }}>
            {label}
          </div>
        </div>
        <ChevronRight color="#999" size={20}/>
      </div>
    </Link>
  );
}
