import React, { useState, useEffect } from 'react';
import {
  TrendingUp, Package, Users, Truck, DollarSign, Clock,
  Download, Calendar, MapPin, Star
} from 'lucide-react';

export default function AdminAnalyticsView() {
  const [metrics, setMetrics] = useState({
    totalOrders: 0,
    totalRevenue: 0,
    activeDrivers: 0,
    avgDeliveryTime: 0,
    pendingOrders: 0,
    completedToday: 0
  });
  const [orders, setOrders] = useState([]);
  const [timeRange, setTimeRange] = useState('today');

  useEffect(() => {
    fetchMetrics();
    fetchOrders();
  }, [timeRange]);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/orders');
      if (response.ok) {
        const data = await response.json();

        const totalRevenue = data.reduce((sum, order) => sum + order.price, 0);
        const pending = data.filter(o => o.status === 'PENDIENTE').length;
        const completed = data.filter(o => o.status === 'ENTREGADO').length;

        const today = new Date().toDateString();
        const todayOrders = data.filter(o =>
          new Date(o.createdAt).toDateString() === today
        );

        setMetrics({
          totalOrders: data.length,
          totalRevenue: totalRevenue.toFixed(2),
          activeDrivers: 3,
          avgDeliveryTime: 28,
          pendingOrders: pending,
          completedToday: todayOrders.filter(o => o.status === 'ENTREGADO').length
        });
      }
    } catch (err) {
      console.error('Error fetching metrics:', err);
    }
  };

  const fetchOrders = async () => {
    try {
      const response = await fetch('http://localhost:3001/api/orders');
      if (response.ok) {
        const data = await response.json();
        setOrders(data);
      }
    } catch (err) {
      console.error('Error fetching orders:', err);
    }
  };

  const exportToExcel = () => {
    const headers = ['ID', 'Cliente', 'Origen', 'Destino', 'Precio', 'Estado', 'Fecha', 'Método Pago'];
    const csvData = orders.map(order => [
      order.id,
      order.customerName,
      order.originAddress,
      order.destAddress,
      order.price,
      order.status,
      new Date(order.createdAt).toLocaleDateString(),
      order.paymentMethod || 'Efectivo'
    ]);

    const csvContent = [
      headers.join(','),
      ...csvData.map(row => row.join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `pedidos_urbsend_${new Date().toISOString().split('T')[0]}.csv`;
    link.click();
  };

  return (
    <div style={{
      width: '100%',
      padding: 'clamp(12px, 3vw, 20px)',
      maxWidth: '1400px',
      margin: '0 auto'
    }}>
      {/* Header - RESPONSIVE */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: 'clamp(20px, 4vw, 30px)',
        flexWrap: 'wrap',
        gap: '15px'
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <TrendingUp size={28} color="#D71920"/>
          <div>
            <h2 style={{
              color: '#2C3E50',
              margin: '0 0 5px 0',
              fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)'
            }}>
              Dashboard de Métricas
            </h2>
            <p style={{
              color: '#666',
              margin: 0,
              fontSize: 'clamp(0.75rem, 2vw, 0.9rem)'
            }}>
              Análisis en tiempo real de tu negocio
            </p>
          </div>
        </div>

        <div style={{
          display: 'flex',
          gap: '10px',
          alignItems: 'center',
          flexWrap: 'wrap',
          width: '100%',
          maxWidth: '400px'
        }}>
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            style={{
              flex: 1,
              minWidth: '120px',
              padding: '10px 12px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              marginBottom: 0
            }}
          >
            <option value="today">Hoy</option>
            <option value="week">Esta Semana</option>
            <option value="month">Este Mes</option>
          </select>

          <button
            onClick={exportToExcel}
            style={{
              background: '#16a34a',
              color: 'white',
              border: 'none',
              padding: '10px 16px',
              borderRadius: '8px',
              cursor: 'pointer',
              fontWeight: 'bold',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
              whiteSpace: 'nowrap'
            }}
          >
            <Download size={16}/> Exportar
          </button>
        </div>
      </div>

      {/* Cards de Métricas - RESPONSIVE GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 160px), 1fr))',
        gap: 'clamp(10px, 2vw, 20px)',
        marginBottom: 'clamp(20px, 4vw, 30px)'
      }}>
        <MetricCard
          icon={<Package size={24}/>}
          label="Total Pedidos"
          value={metrics.totalOrders}
          color="#3b82f6"
          bgColor="#EFF6FF"
        />

        <MetricCard
          icon={<DollarSign size={24}/>}
          label="Ingresos"
          value={`S/ ${metrics.totalRevenue}`}
          color="#16a34a"
          bgColor="#F0FDF4"
        />

        <MetricCard
          icon={<Truck size={24}/>}
          label="Conductores"
          value={metrics.activeDrivers}
          color="#8b5cf6"
          bgColor="#FAF5FF"
        />

        <MetricCard
          icon={<Clock size={24}/>}
          label="Tiempo Prom."
          value={`${metrics.avgDeliveryTime} min`}
          color="#f59e0b"
          bgColor="#FFFBEB"
        />

        <MetricCard
          icon={<TrendingUp size={24}/>}
          label="Hoy"
          value={metrics.completedToday}
          color="#10b981"
          bgColor="#ECFDF5"
        />

        <MetricCard
          icon={<MapPin size={24}/>}
          label="Pendientes"
          value={metrics.pendingOrders}
          color="#ef4444"
          bgColor="#FEF2F2"
        />
      </div>

      {/* Gráfico de Distribución */}
      <div className="info-card" style={{ marginBottom: 'clamp(15px, 3vw, 30px)' }}>
        <h3 style={{
          color: '#2C3E50',
          marginTop: 0,
          fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)'
        }}>
          Distribución por Estado
        </h3>
        <OrdersDistribution orders={orders}/>
      </div>

      {/* Tabla de Pedidos - RESPONSIVE */}
      <div className="info-card">
        <h3 style={{
          color: '#2C3E50',
          marginTop: 0,
          fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)'
        }}>
          Últimos Pedidos
        </h3>
        <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
          <OrdersTable orders={orders.slice(0, 10)}/>
        </div>
      </div>
    </div>
  );
}

function MetricCard({ icon, label, value, color, bgColor }) {
  return (
    <div style={{
      background: 'white',
      padding: 'clamp(12px, 3vw, 20px)',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      display: 'flex',
      alignItems: 'center',
      gap: 'clamp(10px, 2vw, 15px)',
      transition: 'all 0.3s',
      cursor: 'pointer'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{
        background: bgColor,
        padding: 'clamp(10px, 2vw, 15px)',
        borderRadius: '10px',
        color: color,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexShrink: 0
      }}>
        {icon}
      </div>
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 'clamp(0.65rem, 1.8vw, 0.85rem)',
          color: '#666',
          marginBottom: '3px',
          whiteSpace: 'nowrap',
          overflow: 'hidden',
          textOverflow: 'ellipsis'
        }}>
          {label}
        </div>
        <div style={{
          fontSize: 'clamp(1rem, 3vw, 1.6rem)',
          fontWeight: '900',
          color: '#2C3E50'
        }}>
          {value}
        </div>
      </div>
    </div>
  );
}

function OrdersDistribution({ orders }) {
  const normalizeStatus = (status) => {
    if (!status) return 'PENDIENTE';
    return status.toUpperCase().replace(/\s+/g, '_');
  };

  const statusCounts = orders.reduce((acc, order) => {
    const normalizedStatus = normalizeStatus(order.status);
    acc[normalizedStatus] = (acc[normalizedStatus] || 0) + 1;
    return acc;
  }, {});

  const statuses = [
    { key: 'PENDIENTE', label: 'Pendiente', color: '#f59e0b' },
    { key: 'ASIGNADO', label: 'Asignado', color: '#3b82f6' },
    { key: 'EN_CAMINO', label: 'En Camino', color: '#8b5cf6' },
    { key: 'ENTREGADO', label: 'Entregado', color: '#16a34a' }
  ];

  const total = orders.length || 1;

  return (
    <div>
      {statuses.map(status => {
        const count = statusCounts[status.key] || 0;
        const percentage = (count / total * 100).toFixed(1);

        return (
          <div key={status.key} style={{ marginBottom: '12px' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              marginBottom: '5px',
              fontSize: 'clamp(0.75rem, 2vw, 0.9rem)',
              color: '#666'
            }}>
              <span>{status.label}</span>
              <span><b>{count}</b> ({percentage}%)</span>
            </div>
            <div style={{
              width: '100%',
              height: '10px',
              background: '#e5e7eb',
              borderRadius: '5px',
              overflow: 'hidden'
            }}>
              <div style={{
                width: `${percentage}%`,
                height: '100%',
                background: status.color,
                transition: 'width 0.5s ease'
              }}/>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function OrdersTable({ orders }) {
  if (orders.length === 0) {
    return (
      <div style={{ textAlign: 'center', padding: '30px', color: '#999' }}>
        No hay pedidos aún
      </div>
    );
  }

  return (
    <table style={{
      width: '100%',
      borderCollapse: 'collapse',
      fontSize: 'clamp(0.7rem, 2vw, 0.9rem)',
      minWidth: '500px'
    }}>
      <thead>
        <tr style={{ borderBottom: '2px solid #e5e7eb' }}>
          <th style={{ padding: '10px 8px', textAlign: 'left', color: '#666', fontWeight: 'bold' }}>ID</th>
          <th style={{ padding: '10px 8px', textAlign: 'left', color: '#666', fontWeight: 'bold' }}>Cliente</th>
          <th style={{ padding: '10px 8px', textAlign: 'left', color: '#666', fontWeight: 'bold' }}>Precio</th>
          <th style={{ padding: '10px 8px', textAlign: 'left', color: '#666', fontWeight: 'bold' }}>Estado</th>
          <th style={{ padding: '10px 8px', textAlign: 'left', color: '#666', fontWeight: 'bold' }}>Pago</th>
          <th style={{ padding: '10px 8px', textAlign: 'left', color: '#666', fontWeight: 'bold' }}>Fecha</th>
        </tr>
      </thead>
      <tbody>
        {orders.map(order => (
          <tr key={order.id} style={{ borderBottom: '1px solid #f0f0f0' }}>
            <td style={{ padding: '10px 8px' }}>
              <code style={{
                background: '#f0f0f0',
                padding: '2px 5px',
                borderRadius: '4px',
                fontSize: 'clamp(0.6rem, 1.8vw, 0.75rem)'
              }}>
                {order.id.slice(0, 8)}
              </code>
            </td>
            <td style={{ padding: '10px 8px', maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {order.customerName}
            </td>
            <td style={{ padding: '10px 8px', fontWeight: 'bold', color: '#16a34a', whiteSpace: 'nowrap' }}>
              S/ {order.price}
            </td>
            <td style={{ padding: '10px 8px' }}>
              <StatusBadge status={order.status}/>
            </td>
            <td style={{ padding: '10px 8px' }}>{order.paymentMethod || 'Efectivo'}</td>
            <td style={{ padding: '10px 8px', color: '#666', whiteSpace: 'nowrap' }}>
              {new Date(order.createdAt).toLocaleDateString()}
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

function StatusBadge({ status }) {
  const normalizedStatus = status ? status.toUpperCase().replace(/\s+/g, '_') : 'PENDIENTE';

  const colors = {
    'PENDIENTE': { bg: '#FEF3C7', text: '#92400E' },
    'ASIGNADO': { bg: '#DBEAFE', text: '#1E40AF' },
    'EN_CAMINO': { bg: '#E9D5FF', text: '#6B21A8' },
    'ENTREGADO': { bg: '#D1FAE5', text: '#065F46' }
  };

  const displayNames = {
    'PENDIENTE': 'PENDIENTE',
    'ASIGNADO': 'ASIGNADO',
    'EN_CAMINO': 'EN CAMINO',
    'ENTREGADO': 'ENTREGADO'
  };

  const color = colors[normalizedStatus] || { bg: '#E5E7EB', text: '#374151' };

  return (
    <span style={{
      background: color.bg,
      color: color.text,
      padding: '3px 6px',
      borderRadius: '4px',
      fontSize: 'clamp(0.55rem, 1.5vw, 0.75rem)',
      fontWeight: 'bold',
      whiteSpace: 'nowrap'
    }}>
      {displayNames[normalizedStatus] || status}
    </span>
  );
}
