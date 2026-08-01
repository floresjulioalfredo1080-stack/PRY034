import React, { useState, useEffect } from 'react';
import { DollarSign, TrendingUp, Package, Star, Calendar, MapPin } from 'lucide-react';

export default function DriverEarningsView() {
  const [earnings, setEarnings] = useState({
    total: 0,
    today: 0,
    thisWeek: 0,
    thisMonth: 0,
    completedOrders: 0,
    rating: 5.0
  });
  const [recentOrders, setRecentOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchEarnings();
  }, []);

  const fetchEarnings = async () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user_data'));
      const driverEmail = userData?.email;

      if (!driverEmail) {
        setLoading(false);
        return;
      }

      const driversRes = await fetch('http://localhost:3001/api/drivers');
      if (!driversRes.ok) {
        setLoading(false);
        return;
      }

      const drivers = await driversRes.json();
      const currentDriver = drivers.find(d => d.email === driverEmail);

      if (!currentDriver) {
        setLoading(false);
        return;
      }

      const ordersRes = await fetch('http://localhost:3001/api/orders');
      if (!ordersRes.ok) {
        setLoading(false);
        return;
      }

      const allOrders = await ordersRes.json();

      const myOrders = allOrders.filter(o => {
        const normalizedStatus = o.status ? o.status.toUpperCase().replace(/\s+/g, '_') : '';
        return o.driverId === currentDriver.id && normalizedStatus === 'ENTREGADO';
      });

      const total = myOrders.reduce((sum, order) => sum + parseFloat(order.price), 0);

      const today = new Date().toDateString();
      const todayOrders = myOrders.filter(o => new Date(o.createdAt).toDateString() === today);
      const todayTotal = todayOrders.reduce((sum, order) => sum + parseFloat(order.price), 0);

      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekOrders = myOrders.filter(o => new Date(o.createdAt) >= weekAgo);
      const weekTotal = weekOrders.reduce((sum, order) => sum + parseFloat(order.price), 0);

      const monthAgo = new Date();
      monthAgo.setDate(monthAgo.getDate() - 30);
      const monthOrders = myOrders.filter(o => new Date(o.createdAt) >= monthAgo);
      const monthTotal = monthOrders.reduce((sum, order) => sum + parseFloat(order.price), 0);

      setEarnings({
        total: total.toFixed(2),
        today: todayTotal.toFixed(2),
        thisWeek: weekTotal.toFixed(2),
        thisMonth: monthTotal.toFixed(2),
        completedOrders: myOrders.length,
        rating: currentDriver.rating || 5.0
      });

      setRecentOrders(myOrders.slice(0, 10));
    } catch (err) {
      console.error('Error fetching earnings:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div style={{
        textAlign: 'center',
        padding: 'clamp(40px, 10vw, 60px)',
        color: '#999'
      }}>
        <div className="spinner" style={{ margin: '0 auto 20px' }}></div>
        <span style={{ fontSize: 'clamp(0.85rem, 2.5vw, 1rem)' }}>
          Cargando ganancias...
        </span>
      </div>
    );
  }

  return (
    <div style={{
      width: '100%',
      padding: 'clamp(12px, 3vw, 20px)',
      maxWidth: '1200px',
      margin: '0 auto'
    }}>
      {/* Header - RESPONSIVE */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px',
        marginBottom: '10px'
      }}>
        <DollarSign size={28} color="#16a34a"/>
        <h2 style={{
          color: '#2C3E50',
          margin: 0,
          fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)'
        }}>
          Mis Ganancias
        </h2>
      </div>
      <p style={{
        color: '#666',
        marginBottom: 'clamp(20px, 4vw, 30px)',
        fontSize: 'clamp(0.8rem, 2vw, 0.9rem)'
      }}>
        Resumen de tus ingresos y pedidos completados
      </p>

      {/* Cards de Resumen - RESPONSIVE GRID */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 150px), 1fr))',
        gap: 'clamp(10px, 2vw, 20px)',
        marginBottom: 'clamp(20px, 4vw, 30px)'
      }}>
        <EarningsCard
          icon={<DollarSign size={24}/>}
          label="Total Ganado"
          value={`S/ ${earnings.total}`}
          color="#16a34a"
          bgColor="#F0FDF4"
        />

        <EarningsCard
          icon={<Calendar size={24}/>}
          label="Hoy"
          value={`S/ ${earnings.today}`}
          color="#3b82f6"
          bgColor="#EFF6FF"
        />

        <EarningsCard
          icon={<TrendingUp size={24}/>}
          label="Esta Semana"
          value={`S/ ${earnings.thisWeek}`}
          color="#8b5cf6"
          bgColor="#FAF5FF"
        />

        <EarningsCard
          icon={<Package size={24}/>}
          label="Pedidos"
          value={earnings.completedOrders}
          color="#f59e0b"
          bgColor="#FFFBEB"
        />

        <EarningsCard
          icon={<Star size={24}/>}
          label="Rating"
          value={earnings.rating.toFixed(1)}
          color="#FFD700"
          bgColor="#FFFEF0"
        />
      </div>

      {/* Gráfico de progreso mensual */}
      <div className="info-card" style={{ marginBottom: 'clamp(15px, 3vw, 30px)' }}>
        <h3 style={{
          color: '#2C3E50',
          marginTop: 0,
          fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)'
        }}>
          Progreso del Mes
        </h3>
        <div style={{ marginBottom: '10px' }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            marginBottom: '8px',
            flexWrap: 'wrap',
            gap: '5px'
          }}>
            <span style={{
              fontSize: 'clamp(0.8rem, 2vw, 0.9rem)',
              color: '#666'
            }}>
              Ganancia mensual
            </span>
            <span style={{
              fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)',
              fontWeight: 'bold',
              color: '#16a34a'
            }}>
              S/ {earnings.thisMonth}
            </span>
          </div>
          <div style={{
            width: '100%',
            height: '12px',
            background: '#e5e7eb',
            borderRadius: '6px',
            overflow: 'hidden'
          }}>
            <div style={{
              width: `${Math.min((parseFloat(earnings.thisMonth) / 1000) * 100, 100)}%`,
              height: '100%',
              background: 'linear-gradient(90deg, #16a34a, #22c55e)',
              transition: 'width 0.5s ease'
            }}/>
          </div>
          <div style={{
            fontSize: 'clamp(0.65rem, 1.8vw, 0.75rem)',
            color: '#999',
            marginTop: '5px'
          }}>
            Meta mensual: S/ 1,000
          </div>
        </div>
      </div>

      {/* Lista de pedidos recientes */}
      <div className="info-card">
        <h3 style={{
          color: '#2C3E50',
          marginTop: 0,
          fontSize: 'clamp(0.95rem, 2.5vw, 1.1rem)'
        }}>
          Últimos Pedidos Entregados
        </h3>
        {recentOrders.length === 0 ? (
          <div style={{
            textAlign: 'center',
            padding: 'clamp(30px, 6vw, 40px)',
            color: '#999'
          }}>
            <Package size={40} style={{ marginBottom: '15px' }}/>
            <p style={{ fontSize: 'clamp(0.85rem, 2vw, 1rem)' }}>
              No has completado pedidos aún
            </p>
          </div>
        ) : (
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: 'clamp(8px, 2vw, 12px)'
          }}>
            {recentOrders.map(order => (
              <OrderRow key={order.id} order={order} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function EarningsCard({ icon, label, value, color, bgColor }) {
  return (
    <div style={{
      background: 'white',
      padding: 'clamp(12px, 3vw, 20px)',
      borderRadius: '12px',
      border: '1px solid #e5e7eb',
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      transition: 'all 0.3s'
    }}
    onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-3px)'}
    onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}>
      <div style={{
        background: bgColor,
        padding: 'clamp(8px, 2vw, 12px)',
        borderRadius: '10px',
        color: color,
        width: 'fit-content',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        {icon}
      </div>
      <div>
        <div style={{
          fontSize: 'clamp(0.6rem, 1.6vw, 0.75rem)',
          color: '#999',
          marginBottom: '3px',
          textTransform: 'uppercase',
          fontWeight: 'bold'
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

function OrderRow({ order }) {
  return (
    <div style={{
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: 'clamp(10px, 2.5vw, 15px)',
      background: '#f8f9fa',
      borderRadius: '8px',
      border: '1px solid #e5e7eb',
      flexWrap: 'wrap',
      gap: '10px'
    }}>
      <div style={{ flex: 1, minWidth: '150px' }}>
        <div style={{
          fontSize: 'clamp(0.6rem, 1.5vw, 0.7rem)',
          color: '#999',
          marginBottom: '3px'
        }}>
          {new Date(order.createdAt).toLocaleDateString('es-ES')}
        </div>
        <div style={{
          fontSize: 'clamp(0.75rem, 2vw, 0.85rem)',
          color: '#555',
          display: 'flex',
          alignItems: 'center',
          gap: '5px'
        }}>
          <MapPin size={14} color="#dc2626" style={{ flexShrink: 0 }}/>
          <span style={{
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap',
            maxWidth: '200px'
          }}>
            {order.destAddress}
          </span>
        </div>
      </div>

      <div style={{
        fontSize: 'clamp(1rem, 3vw, 1.2rem)',
        fontWeight: 'bold',
        color: '#16a34a'
      }}>
        S/ {order.price}
      </div>
    </div>
  );
}
