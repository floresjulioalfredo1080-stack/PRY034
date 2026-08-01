import React from 'react';
import { MapPin, Truck, CheckCircle, Package } from 'lucide-react';

export default function HelpView() {
  return (
    <div style={{ padding: '40px 20px', maxWidth: '800px', margin: '0 auto' }}>
      <h2 style={{ textAlign: 'center', marginBottom: '10px', color: '#2C3E50' }}>¿Cómo funciona URBSEND?</h2>
      <p style={{ textAlign: 'center', color: '#666', marginBottom: '40px' }}>Guía paso a paso para realizar tus envíos.</p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        <Step number="1" title="Cotiza tu envío" icon={<MapPin color="white"/>} 
              desc="Ingresa la dirección de recojo y entrega. Nuestro sistema calculará el precio automáticamente según la distancia." />
        
        <Step number="2" title="Confirma y Paga" icon={<Package color="white"/>} 
              desc="Selecciona el tamaño del paquete y tu método de pago (Yape, Plin o Efectivo). Recibirás un ID único." />
        
        <Step number="3" title="Rastrea en tiempo real" icon={<Truck color="white"/>} 
              desc="Usa tu ID en la sección de 'Tracking' para ver a la unidad desplazarse en el mapa en vivo." />

        <Step number="4" title="Entrega Segura" icon={<CheckCircle color="white"/>} 
              desc="El conductor tomará una foto de evidencia al entregar el paquete. ¡Listo!" />

      </div>
      
      <div style={{ marginTop: '50px', background: '#F0F9FF', padding: '20px', borderRadius: '12px', border: '1px solid #BAE6FD', textAlign: 'center' }}>
        <h4 style={{ color: '#0369A1', marginTop: 0 }}>¿Necesitas más ayuda?</h4>
        <p style={{ fontSize: '0.9rem', color: '#0C4A6E' }}>Escríbenos directamente a nuestro WhatsApp de soporte.</p>
        <button className="btn-primary" style={{ background: '#25D366', marginTop: '10px', width: 'auto', padding: '10px 20px' }}>
            Chat con Soporte
        </button>
      </div>
    </div>
  );
}

function Step({ number, title, desc, icon }) {
    return (
        <div style={{ display: 'flex', gap: '20px', alignItems: 'flex-start', background: 'white', padding: '20px', borderRadius: '12px', border: '1px solid #e5e7eb' }}>
            <div style={{ background: '#D71920', minWidth: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: 'white' }}>
                {number}
            </div>
            <div>
                <h4 style={{ margin: '0 0 5px 0', fontSize: '1.1rem' }}>{title}</h4>
                <p style={{ margin: 0, color: '#666', fontSize: '0.95rem', lineHeight: '1.5' }}>{desc}</p>
            </div>
        </div>
    )
}