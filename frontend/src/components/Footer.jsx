import React from 'react';
import { Link } from 'react-router-dom';
import { Facebook, Instagram, Twitter, Phone, Mail, MapPin } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: '#2C3E50',
      color: 'white',
      padding: 'clamp(20px, 4vw, 30px) clamp(15px, 3vw, 20px) clamp(15px, 3vw, 20px)',
      marginTop: 'auto',
      borderTop: '3px solid #D71920'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 180px), 1fr))',
        gap: 'clamp(20px, 4vw, 30px)'
      }}>

        {/* Columna 1: Marca */}
        <div>
          <h3 style={{
            fontSize: 'clamp(1.1rem, 3vw, 1.3rem)',
            fontWeight: '800',
            marginBottom: '10px',
            color: 'white'
          }}>
            URBSEND<span style={{ color: '#D71920' }}>.</span>
          </h3>
          <p style={{
            color: '#94a3b8',
            fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
            lineHeight: '1.4',
            marginBottom: '15px'
          }}>
            Envíos rápidos y seguros en Arequipa.
          </p>
          <div style={{ display: 'flex', gap: '12px' }}>
            <SocialLink icon={<Facebook size={18}/>} />
            <SocialLink icon={<Instagram size={18}/>} />
            <SocialLink icon={<Twitter size={18}/>} />
          </div>
        </div>

        {/* Columna 2: Enlaces */}
        <div>
          <h4 style={{
            fontWeight: 'bold',
            marginBottom: '12px',
            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
            color: 'white'
          }}>
            Empresa
          </h4>
          <ul style={{
            listStyle: 'none',
            padding: 0,
            color: '#cbd5e1',
            fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            margin: 0
          }}>
            <FooterLink to="/about" label="Sobre Nosotros" />
            <FooterLink to="/help" label="Ayuda" />
            <FooterLink to="/tracking" label="Rastrear Pedido" />
          </ul>
        </div>

        {/* Columna 3: Contacto */}
        <div>
          <h4 style={{
            fontWeight: 'bold',
            marginBottom: '12px',
            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
            color: 'white'
          }}>
            Contacto
          </h4>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
            color: '#cbd5e1'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Phone size={14}/> (054) 20-3040
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Mail size={14}/> soporte@urbsend.com
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <MapPin size={14}/> Arequipa, Perú
            </div>
          </div>
        </div>
      </div>

      <div style={{
        textAlign: 'center',
        marginTop: 'clamp(20px, 4vw, 25px)',
        paddingTop: '15px',
        fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
        color: '#64748b',
        borderTop: '1px solid #3f4f5f'
      }}>
        © 2026 URBSEND Logistics. Todos los derechos reservados.
      </div>
    </footer>
  );
}

// Componente para links sociales
function SocialLink({ icon }) {
  return (
    <a
      href="#"
      style={{
        color: '#94a3b8',
        transition: 'color 0.2s',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onMouseEnter={(e) => e.target.style.color = '#D71920'}
      onMouseLeave={(e) => e.target.style.color = '#94a3b8'}
    >
      {icon}
    </a>
  );
}

// Componente para links del footer
function FooterLink({ to, label }) {
  return (
    <li>
      <Link
        to={to}
        style={{
          color: 'inherit',
          textDecoration: 'none',
          transition: 'color 0.2s'
        }}
        onMouseEnter={(e) => e.target.style.color = '#D71920'}
        onMouseLeave={(e) => e.target.style.color = '#cbd5e1'}
      >
        {label}
      </Link>
    </li>
  );
}
