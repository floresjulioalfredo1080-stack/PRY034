import React from 'react';

export default function AboutView() {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto', textAlign: 'center' }}>
      <h1 style={{ color: '#2C3E50', fontWeight: '800' }}>Sobre Nosotros</h1>
      <p style={{ fontSize: '1.2rem', color: '#666', marginTop: '20px', lineHeight: '1.6' }}>
        Somos <span style={{ color: '#D71920', fontWeight: 'bold' }}>URBSEND</span>, una startup arequipeña nacida con la misión de revolucionar la logística urbana.
      </p>
      <div style={{ marginTop: '40px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
        <div className="info-card">
            <h3>🚀 Misión</h3>
            <p>Conectar personas y negocios a través de entregas rápidas, seguras y tecnológicas.</p>
        </div>
        <div className="info-card">
            <h3>👁️ Visión</h3>
            <p>Ser la plataforma logística número 1 del sur del país, reconocida por nuestra innovación.</p>
        </div>
      </div>
    </div>
  );
}