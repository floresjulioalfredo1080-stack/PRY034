import React, { useState } from 'react';
import { Search, MapPin, CheckCircle, Copy, ArrowRight, Zap, Clock, MessageCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '../components/Toast';

export default function ClientView({
  origin, destination, distance, price,
  paymentMethod, setPaymentMethod,
  packageSize, setPackageSize,
  urgency, setUrgency,
  originInput, setOriginInput,
  destinationInput, setDestinationInput,
  mapSelectionMode, setMapSelectionMode,
  handleGeocode, lastCreatedOrder, setLastCreatedOrder
}) {
  const navigate = useNavigate();
  const toast = useToast();

  // FUNCIÓN MEJORADA: Crear pedido con userId
  const handleSubmit = async () => {
    if (!origin || !destination) {
      toast.warning("Por favor selecciona origen y destino en el mapa");
      return;
    }

    try {
      // Obtener datos del usuario logueado
      const userData = JSON.parse(localStorage.getItem('user_data'));

      const orderData = {
        customerName: userData?.name || "Cliente",
        origin,
        destination,
        packageSize,
        urgency: urgency === 'express',
        price,
        paymentMethod,
        userId: userData?.id || null
      };

      const response = await fetch('http://localhost:3001/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderData)
      });

      if (response.ok) {
        const newOrder = await response.json();
        setLastCreatedOrder(newOrder);
        toast.success("¡Pedido creado exitosamente!");
      } else {
        toast.error('Error al crear el pedido');
      }
    } catch (err) {
      console.error('Error:', err);
      toast.error('Error al crear el pedido');
    }
  };

  // SI HAY UN PEDIDO CREADO, MOSTRAMOS LA PANTALLA DE ÉXITO
  if (lastCreatedOrder) {
    return (
      <div style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        textAlign: 'center',
        padding: 'clamp(15px, 4vw, 20px)'
      }}>
        <CheckCircle size={60} color="#16a34a" style={{ marginBottom: '20px' }} />
        <h2 style={{
          color: '#16a34a',
          marginBottom: '10px',
          fontSize: 'clamp(1.2rem, 4vw, 1.5rem)'
        }}>
          ¡Pedido Creado!
        </h2>
        <p style={{
          color: '#666',
          marginBottom: '25px',
          fontSize: 'clamp(0.85rem, 2.5vw, 1rem)'
        }}>
          Tu solicitud ha sido enviada a nuestros conductores.
        </p>

        <div className="info-card" style={{
          width: '100%',
          maxWidth: '500px',
          background: '#f0fdf4',
          borderColor: '#bbf7d0'
        }}>
          <div style={{
            fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
            color: '#166534',
            marginBottom: '5px'
          }}>
            CÓDIGO DE SEGUIMIENTO
          </div>
          <div style={{
            fontSize: 'clamp(1.2rem, 5vw, 2rem)',
            fontWeight: '900',
            color: '#16a34a',
            letterSpacing: '1px',
            wordBreak: 'break-all'
          }}>
            {lastCreatedOrder.id}
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          width: '100%',
          maxWidth: '500px',
          marginTop: '20px',
          flexWrap: 'wrap'
        }}>
          <button
            className="btn-primary"
            style={{
              flex: 1,
              minWidth: 'min(150px, 100%)',
              background: '#2C3E50',
              fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)'
            }}
            onClick={() => {
              navigator.clipboard.writeText(lastCreatedOrder.id);
              toast.success("ID copiado al portapapeles");
            }}
          >
            <Copy size={16} style={{ marginRight: '6px' }}/> COPIAR ID
          </button>

          <button
            className="btn-primary"
            style={{
              flex: 1,
              minWidth: 'min(150px, 100%)',
              fontSize: 'clamp(0.8rem, 2.5vw, 0.9rem)'
            }}
            onClick={() => {
              navigate('/tracking');
            }}
          >
            RASTREAR <ArrowRight size={16} style={{ marginLeft: '6px' }}/>
          </button>
        </div>

        {/* Botón de WhatsApp para compartir */}
        <button
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '8px',
            width: '100%',
            maxWidth: '500px',
            marginTop: '15px',
            padding: 'clamp(12px, 3vw, 14px)',
            background: '#25D366',
            color: 'white',
            border: 'none',
            borderRadius: '10px',
            fontWeight: 'bold',
            cursor: 'pointer',
            fontSize: 'clamp(0.85rem, 2.5vw, 0.95rem)',
            transition: 'all 0.2s'
          }}
          onClick={async () => {
            try {
              const response = await fetch(`http://localhost:3001/api/orders/${lastCreatedOrder.id}/whatsapp?type=created`);
              if (response.ok) {
                const data = await response.json();
                window.open(data.url, '_blank');
              } else {
                // Si no hay teléfono registrado, crear mensaje manual
                const message = `🚀 *URBSEND - Mi Pedido*\n\n📦 ID: ${lastCreatedOrder.id.slice(0, 8)}\n📍 Origen: ${lastCreatedOrder.originAddress}\n🎯 Destino: ${lastCreatedOrder.destAddress}\n💰 Precio: S/ ${lastCreatedOrder.price.toFixed(2)}\n\n📍 Rastrear: http://localhost:5173/tracking?id=${lastCreatedOrder.id}`;
                const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
                window.open(url, '_blank');
              }
            } catch (err) {
              // Fallback: compartir con mensaje genérico
              const message = `🚀 Mi pedido URBSEND: ${lastCreatedOrder.id.slice(0, 8)}\nRastrear: http://localhost:5173/tracking?id=${lastCreatedOrder.id}`;
              const url = `https://wa.me/?text=${encodeURIComponent(message)}`;
              window.open(url, '_blank');
            }
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#128C7E';
            e.currentTarget.style.transform = 'translateY(-2px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#25D366';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          <MessageCircle size={18} /> COMPARTIR POR WHATSAPP
        </button>

        <button
          style={{
            background: 'none',
            border: 'none',
            color: '#999',
            marginTop: '20px',
            textDecoration: 'underline',
            cursor: 'pointer',
            fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
          }}
          onClick={() => setLastCreatedOrder(null)}
        >
          Crear otro envío
        </button>
      </div>
    );
  }

  // FORMULARIO NORMAL - RESPONSIVE
  return (
    <div style={{ width: '100%' }}>
      <h2 style={{ fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)' }}>
        📦 Cotizar Envío
      </h2>

      {/* Selector de Direcciones */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginBottom: '20px' }}>
        
        {/* DIRECCIÓN DE ORIGEN */}
        <div className="info-card" style={{ 
          padding: '12px', 
          borderLeft: '4px solid #16a34a',
          background: mapSelectionMode === 'origin' ? '#f0fdf4' : '',
          borderColor: mapSelectionMode === 'origin' ? '#16a34a' : ''
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <MapPin color="#16a34a" size={18} />
            <strong style={{ fontSize: '0.85rem', color: '#2C3E50' }}>DIRECCIÓN DE ORIGEN</strong>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                placeholder="Escribe la dirección de origen..."
                value={originInput}
                onChange={(e) => setOriginInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGeocode('origin')}
                style={{
                  marginBottom: 0,
                  width: '100%',
                  fontSize: '0.9rem',
                  paddingRight: '30px'
                }}
              />
            </div>
            <button 
              className="btn-icon-only" 
              onClick={() => handleGeocode('origin')} 
              title="Buscar dirección"
              style={{ padding: '8px 12px', height: '100%' }}
            >
              <Search size={16}/>
            </button>
            <button 
              onClick={() => setMapSelectionMode(mapSelectionMode === 'origin' ? null : 'origin')}
              title="Marcar en el mapa"
              style={{
                padding: '8px 12px',
                background: mapSelectionMode === 'origin' ? '#16a34a' : '#f3f4f6',
                color: mapSelectionMode === 'origin' ? 'white' : '#555',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: mapSelectionMode === 'origin' ? '0 0 8px rgba(22, 163, 74, 0.4)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (mapSelectionMode !== 'origin') {
                  e.currentTarget.style.background = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (mapSelectionMode !== 'origin') {
                  e.currentTarget.style.background = '#f3f4f6';
                }
              }}
            >
              <MapPin size={16} />
            </button>
          </div>
        </div>

        {/* DIRECCIÓN DE DESTINO */}
        <div className="info-card" style={{ 
          padding: '12px', 
          borderLeft: '4px solid #dc2626',
          background: mapSelectionMode === 'destination' ? '#fef2f2' : '',
          borderColor: mapSelectionMode === 'destination' ? '#dc2626' : ''
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
            <MapPin color="#dc2626" size={18} />
            <strong style={{ fontSize: '0.85rem', color: '#2C3E50' }}>DIRECCIÓN DE DESTINO</strong>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            <div style={{ position: 'relative', flex: 1 }}>
              <input
                placeholder="Escribe la dirección de destino..."
                value={destinationInput}
                onChange={(e) => setDestinationInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleGeocode('destination')}
                style={{
                  marginBottom: 0,
                  width: '100%',
                  fontSize: '0.9rem',
                  paddingRight: '30px'
                }}
              />
            </div>
            <button 
              className="btn-icon-only" 
              onClick={() => handleGeocode('destination')} 
              title="Buscar dirección"
              style={{ padding: '8px 12px', height: '100%' }}
            >
              <Search size={16}/>
            </button>
            <button 
              onClick={() => setMapSelectionMode(mapSelectionMode === 'destination' ? null : 'destination')}
              title="Marcar en el mapa"
              style={{
                padding: '8px 12px',
                background: mapSelectionMode === 'destination' ? '#dc2626' : '#f3f4f6',
                color: mapSelectionMode === 'destination' ? 'white' : '#555',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                transition: 'all 0.2s',
                boxShadow: mapSelectionMode === 'destination' ? '0 0 8px rgba(220, 38, 38, 0.4)' : 'none'
              }}
              onMouseEnter={(e) => {
                if (mapSelectionMode !== 'destination') {
                  e.currentTarget.style.background = '#e5e7eb';
                }
              }}
              onMouseLeave={(e) => {
                if (mapSelectionMode !== 'destination') {
                  e.currentTarget.style.background = '#f3f4f6';
                }
              }}
            >
              <MapPin size={16} />
            </button>
          </div>
        </div>

      </div>

      {/* Card de precio */}
      {distance > 0 && (
        <div className="info-card" style={{
          background: urgency === 'express' ? '#fffbeb' : '#f0fdf4',
          borderColor: urgency === 'express' ? '#fcd34d' : '#bbf7d0'
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginBottom: '5px',
            flexWrap: 'wrap',
            gap: '8px'
          }}>
            <span style={{
              fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
              color: urgency === 'express' ? '#92400e' : '#166534'
            }}>
              PRECIO ESTIMADO
            </span>
            {urgency === 'express' && (
              <span style={{
                background: '#f59e0b',
                color: 'white',
                padding: '3px 8px',
                borderRadius: '12px',
                fontSize: '0.65rem',
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: '4px'
              }}>
                <Zap size={10}/> EXPRESS
              </span>
            )}
          </div>
          <div style={{
            fontSize: 'clamp(2rem, 8vw, 3rem)',
            fontWeight: '900',
            color: urgency === 'express' ? '#f59e0b' : '#16a34a'
          }}>
            S/ {price}
          </div>
          <div style={{
            fontSize: 'clamp(0.7rem, 2vw, 0.85rem)',
            color: '#666',
            marginTop: '5px'
          }}>
            Distancia: {distance} km • Paquete: {packageSize} • {urgency === 'express' ? '15-30 min' : '30-60 min'}
          </div>
        </div>
      )}

      {/* Tamaño del paquete */}
      <label>Tamaño del Paquete</label>
      <select
        value={packageSize}
        onChange={(e) => setPackageSize(e.target.value)}
        style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)' }}
      >
        <option value="pequeño">Pequeño (documentos, sobres)</option>
        <option value="mediano">Mediano (cajas pequeñas)</option>
        <option value="grande">Grande (cajas grandes)</option>
      </select>

      {/* Selector de Urgencia */}
      <label>Tipo de Envío</label>
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(2, 1fr)',
        gap: '10px',
        marginBottom: '15px'
      }}>
        <UrgencyButton
          selected={urgency === 'normal'}
          onClick={() => setUrgency('normal')}
          icon={<Clock size={22} />}
          label="Normal"
          time="30-60 min"
          selectedColor="#16a34a"
        />
        <UrgencyButton
          selected={urgency === 'express'}
          onClick={() => setUrgency('express')}
          icon={<Zap size={22} />}
          label="Express"
          time="15-30 min (+50%)"
          selectedColor="#f59e0b"
        />
      </div>

      {/* Método de pago */}
      <label>Método de Pago</label>
      <select
        value={paymentMethod}
        onChange={(e) => setPaymentMethod(e.target.value)}
        style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)' }}
      >
        <option value="Efectivo">Efectivo</option>
        <option value="Yape">Yape</option>
        <option value="Tarjeta">Tarjeta</option>
      </select>

      {/* Botón de enviar */}
      <button
        className="btn-primary"
        onClick={handleSubmit}
        disabled={!origin || !destination || !distance}
        style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)' }}
      >
        {distance > 0 ? 'SOLICITAR AHORA' : 'Selecciona puntos en el mapa'}
      </button>
    </div>
  );
}

// Componente de botón de urgencia
function UrgencyButton({ selected, onClick, icon, label, time, selectedColor }) {
  return (
    <button
      type="button"
      onClick={onClick}
      style={{
        padding: 'clamp(12px, 3vw, 15px)',
        borderRadius: '10px',
        border: selected ? `2px solid ${selectedColor}` : '2px solid #e5e7eb',
        background: selected ? (selectedColor === '#16a34a' ? '#f0fdf4' : '#fffbeb') : 'white',
        cursor: 'pointer',
        transition: 'all 0.2s',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '6px'
      }}
    >
      <span style={{ color: selected ? selectedColor : '#999' }}>
        {icon}
      </span>
      <span style={{
        fontWeight: 'bold',
        color: selected ? selectedColor : '#666',
        fontSize: 'clamp(0.8rem, 2.5vw, 0.95rem)'
      }}>
        {label}
      </span>
      <span style={{
        fontSize: 'clamp(0.65rem, 2vw, 0.75rem)',
        color: '#999'
      }}>
        {time}
      </span>
    </button>
  );
}
