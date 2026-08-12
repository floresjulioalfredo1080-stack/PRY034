import React, { useEffect, useRef, useState } from 'react';
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
import maplibregl from 'maplibre-gl';
import * as turf from '@turf/turf';
import 'maplibre-gl/dist/maplibre-gl.css';

// Componentes
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import { ToastProvider, useToast } from './components/Toast';
import LandingView from './views/LandingView';
import ClientView from './views/ClientView';
import AdminView from './views/AdminView';
import DriverView from './views/DriverView';
import TrackingView from './views/TrackingView';
import LoginView from './views/LoginView';
import RegisterView from './views/RegisterView';
import AboutView from './views/AboutView';
import HelpView from './views/HelpView';
import AdminDriversView from './views/AdminDriversView';
import AdminAnalyticsView from './views/AdminAnalyticsView';
import ClientHistoryView from './views/ClientHistoryView';  // ← NUEVO
import DriverEarningsView from './views/DriverEarningsView'; // ← NUEVO

// Componente de Protección de Rutas
function ProtectedRoute({ children, allowedRoles, userRole }) {
  if (!userRole) {
    return <Navigate to="/login" replace />;
  }
  
  if (allowedRoles && !allowedRoles.includes(userRole)) {
    return (
      <div style={{ padding: '40px', textAlign: 'center' }}>
        <h2 style={{ color: '#D71920' }}>⛔ Acceso Denegado</h2>
        <p style={{ color: '#666', marginTop: '20px' }}>
          No tienes permisos para acceder a esta sección.
        </p>
        <button 
          className="btn-primary" 
          style={{ marginTop: '20px' }}
          onClick={() => window.location.href = '/'}
        >
          Volver al Inicio
        </button>
      </div>
    );
  }
  
  return children;
}

function AppContent() {
  const location = useLocation();
  const toast = useToast();
  const mapContainer = useRef(null);
  const map = useRef(null);
  const markers = useRef([]);
  const driverMarker = useRef(null);
  const routeLayerId = 'route'; 

  // ============ ESTADOS DE AUTENTICACIÓN ============
  const [userRole, setUserRole] = useState(() => {
    return localStorage.getItem('urbsend_user_role') || null;
  });

  const handleLogin = (role) => {
    setUserRole(role);
    localStorage.setItem('urbsend_user_role', role);
  };

  const handleLogout = () => {
    setUserRole(null);
    localStorage.removeItem('urbsend_user_role');
    window.location.href = '/';
  };

  // ============ ESTADOS DE LA APLICACIÓN ============
  const [drivers, setDrivers] = useState([]);
  const [recentOrders, setRecentOrders] = useState([]);
  const [origin, setOrigin] = useState(null); 
  const [destination, setDestination] = useState(null); 
  const [distance, setDistance] = useState(0);
  const [price, setPrice] = useState(0);
  const [packageSize, setPackageSize] = useState('mediano');
  const [urgency, setUrgency] = useState('normal'); // 'normal' o 'express'
  const [paymentMethod, setPaymentMethod] = useState('Yape');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedDrivers, setSelectedDrivers] = useState({});
  const [currentDriverId, setCurrentDriverId] = useState('');
  const fileInputRef = useRef(null);
  const [orderToUpload, setOrderToUpload] = useState(null);
  const [trackId, setTrackId] = useState('');
  const [trackedOrder, setTrackedOrder] = useState(null);
  const [routeGeoJSON, setRouteGeoJSON] = useState(null);
  const [lastCreatedOrder, setLastCreatedOrder] = useState(null);

  // ============ ESTADOS DE ADMIN ============
  const [adminClients, setAdminClients] = useState([]);
  const [adminDrivers, setAdminDrivers] = useState([]);

  // ============ ESTADOS DE SELECCIÓN Y BÚSQUEDA ============
  const [mapSelectionMode, setMapSelectionMode] = useState(null); // 'origin' | 'destination' | null
  const mapSelectionModeRef = useRef(null);
  useEffect(() => {
    mapSelectionModeRef.current = mapSelectionMode;
  }, [mapSelectionMode]);

  const locationPathnameRef = useRef(location.pathname);
  useEffect(() => {
    locationPathnameRef.current = location.pathname;
  }, [location.pathname]);

  const [originInput, setOriginInput] = useState('');
  const [destinationInput, setDestinationInput] = useState('');

  const originMarker = useRef(null);
  const destinationMarker = useRef(null);

  useEffect(() => {
    setOriginInput(origin ? origin.address : '');
  }, [origin]);

  useEffect(() => {
    setDestinationInput(destination ? destination.address : '');
  }, [destination]);

  // ACTUALIZADO: Rutas sin mapa (agregamos las de admin, historial y ganancias)
  const routesWithoutMap = [
    '/', 
    '/login', 
    '/register', 
    '/about', 
    '/help',
    '/admin/drivers',      // Admin
    '/admin/analytics',    // Admin
    '/admin/settings',     // Admin
    '/client/history',     // Cliente - ← NUEVO
    '/driver/earnings'     // Conductor - ← NUEVO
  ];
  const shouldShowMap = !routesWithoutMap.includes(location.pathname);

  // --- API ---
  const fetchData = async () => {
    try {
      const resOrders = await fetch('http://localhost:3001/api/orders');
      if (resOrders.ok) setRecentOrders(await resOrders.json());
      const resDrivers = await fetch('http://localhost:3001/api/drivers');
      if (resDrivers.ok) setDrivers(await resDrivers.json());
    } catch (e) { console.error("Error data"); }
  };

  const fetchAdminData = async () => {
    try {
      const resClients = await fetch('http://localhost:3001/api/admin/clients');
      if (resClients.ok) setAdminClients(await resClients.json());
      const resDriversAll = await fetch('http://localhost:3001/api/admin/drivers/all');
      if (resDriversAll.ok) setAdminDrivers(await resDriversAll.json());
    } catch (e) { console.error("Error fetching admin data", e); }
  };

  const handleAdminDeleteOrder = async (orderId) => {
    if (!confirm("¿Estás seguro de que deseas eliminar este pedido?")) return;
    try {
      const res = await fetch(`http://localhost:3001/api/orders/${orderId}`, {
        method: 'DELETE'
      });
      if (res.ok) {
        toast.success("Pedido eliminado correctamente");
        fetchData(); // Recargar pedidos
      } else {
        toast.error("Error al eliminar el pedido");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error al eliminar el pedido");
    }
  };

  const [activeDriverOffer, setActiveDriverOffer] = useState(null);

  const handleRejectOffer = async (orderId) => {
    try {
      const res = await fetch(`http://localhost:3001/api/orders/${orderId}/reject`, {
        method: 'POST'
      });
      if (res.ok) {
        toast.success("Pedido rechazado. Pasando al siguiente conductor.");
        setActiveDriverOffer(null);
        fetchData();
      } else {
        toast.error("Error al rechazar el pedido");
      }
    } catch (e) {
      console.error(e);
      toast.error("Error al rechazar el pedido");
    }
  };

  useEffect(() => { 
    fetchData(); 
    fetchAdminData();
  }, []);

  useEffect(() => {
    if (userRole !== 'driver') {
      setActiveDriverOffer(null);
      return;
    }

    const checkDriverOffer = async () => {
      try {
        const userData = JSON.parse(localStorage.getItem('user_data'));
        const driverId = userData?.id;
        if (!driverId) return;

        const res = await fetch(`http://localhost:3001/api/drivers/${driverId}/orders`);
        if (res.ok) {
          const orders = await res.json();
          const pendingOffer = orders.find(o => {
            const normalizedStatus = o.status ? o.status.toUpperCase().replace(/\s+/g, '_') : '';
            return normalizedStatus === 'PENDIENTE';
          });
          setActiveDriverOffer(pendingOffer || null);
        }
      } catch (err) {
        console.error("Error polling driver offer:", err);
      }
    };

    checkDriverOffer();
    const interval = setInterval(checkDriverOffer, 3000);
    return () => clearInterval(interval);
  }, [userRole]);

  // --- FUNCIONES DEL MAPA ---
  const setOriginMarker = (coords) => {
    if (originMarker.current) originMarker.current.remove();
    if (map.current) {
      originMarker.current = new maplibregl.Marker({ color: '#16a34a' }).setLngLat(coords).addTo(map.current);
    }
  };

  const setDestinationMarker = (coords) => {
    if (destinationMarker.current) destinationMarker.current.remove();
    if (map.current) {
      destinationMarker.current = new maplibregl.Marker({ color: '#dc2626' }).setLngLat(coords).addTo(map.current);
    }
  };

  const clearMap = () => {
    if (!map.current) return;
    if (originMarker.current) { originMarker.current.remove(); originMarker.current = null; }
    if (destinationMarker.current) { destinationMarker.current.remove(); destinationMarker.current = null; }
    markers.current.forEach(m => m.remove()); 
    markers.current = [];
    if (driverMarker.current) driverMarker.current.remove();
    if (map.current.getLayer(routeLayerId)) map.current.removeLayer(routeLayerId);
    if (map.current.getSource(routeLayerId)) map.current.removeSource(routeLayerId);
  };

  const drawRoute = (geojson) => {
    if (!map.current) return;
    if (map.current.getSource(routeLayerId)) map.current.removeSource(routeLayerId);
    if (map.current.getLayer(routeLayerId)) map.current.removeLayer(routeLayerId);
    
    map.current.addSource(routeLayerId, { type: 'geojson', data: { type: 'Feature', geometry: geojson } });
    map.current.addLayer({ 
        id: routeLayerId, 
        type: 'line', 
        source: routeLayerId, 
        layout: { 'line-join': 'round', 'line-cap': 'round' }, 
        paint: { 'line-color': '#3b82f6', 'line-width': 5, 'line-opacity': 0.7 } 
    });
  };

  useEffect(() => {
    setLastCreatedOrder(null);
    setOrigin(null); setDestination(null); setDistance(0); setPrice(0); setSearchQuery('');
    setUrgency('normal'); // Resetear urgencia al cambiar de página
    if (map.current) clearMap();
  }, [location.pathname]);

  const fetchAddressName = async (lng, lat) => {
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      const addr = data.address;
      let street = addr.road || addr.pedestrian || addr.street || addr.suburb || data.name || "Ubicación";
      let number = addr.house_number || "";
      let city = addr.city || addr.town || addr.district || "";
      let cleanAddress = `${street} ${number}, ${city}`;
      return cleanAddress.replace(/, ,/g, ',').replace(/^ ,/, '').trim(); 
    } catch (error) { return "Ubicación seleccionada"; }
  };

  const fetchRoute = async (start, end) => {
    try {
      const url = `https://router.project-osrm.org/route/v1/driving/${start.lng},${start.lat};${end.lng},${end.lat}?overview=full&geometries=geojson`;
      const res = await fetch(url);
      const data = await res.json();
      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];
        setDistance((route.distance / 1000).toFixed(2));
        return route.geometry;
      }
    } catch (error) { console.error("Error ruta", error); }
    return null;
  };

  const calculateStraightDistance = (start, end) => {
    const from = turf.point([start.lng, start.lat]);
    const to = turf.point([end.lng, end.lat]);
    const dist = turf.distance(from, to, { units: 'kilometers' });
    setDistance(dist.toFixed(2)); 
  };
  
  useEffect(() => {
    if (distance > 0) {
        const sizeMultipliers = { pequeño: 1.0, mediano: 1.2, grande: 1.5 };
        const urgencyMultipliers = { normal: 1.0, express: 1.5 }; // Express +50%
        const basePrice = 5 + (parseFloat(distance) * 1.5);
        const finalPrice = basePrice * sizeMultipliers[packageSize] * urgencyMultipliers[urgency];
        setPrice(finalPrice.toFixed(2));
    } else { setPrice(0); }
  }, [packageSize, urgency, distance]);

  useEffect(() => {
    if (!mapContainer.current) return;
    if (!map.current) {
      map.current = new maplibregl.Map({
        container: mapContainer.current,
        style: 'https://tiles.openfreemap.org/styles/liberty',
        center: [-71.5374, -16.4090], zoom: 14,
      });
      map.current.addControl(new maplibregl.NavigationControl(), 'top-right');

      map.current.on('click', async (e) => {
        if (locationPathnameRef.current !== '/client') return;
        
        const mode = mapSelectionModeRef.current;
        if (!mode) return;

        const { lng, lat } = e.lngLat;
        const addressName = await fetchAddressName(lng, lat);
        const pointData = { lat, lng, address: addressName };

        if (mode === 'origin') {
          setOrigin(pointData);
          setOriginMarker([lng, lat]);
          setMapSelectionMode(null);
        } else if (mode === 'destination') {
          setDestination(pointData);
          setDestinationMarker([lng, lat]);
          setMapSelectionMode(null);
        }
      });
    }
  }, [location.pathname]);

  // Efecto reactivo para actualizar ruta
  useEffect(() => {
    const updateRoute = async () => {
      if (origin && destination) {
        const startPoint = { lng: origin.lng, lat: origin.lat };
        const endPoint = { lng: destination.lng, lat: destination.lat };
        calculateStraightDistance(startPoint, endPoint);
        const geometry = await fetchRoute(startPoint, endPoint);
        if (geometry) drawRoute(geometry);
      } else {
        if (map.current) {
          if (map.current.getLayer(routeLayerId)) map.current.removeLayer(routeLayerId);
          if (map.current.getSource(routeLayerId)) map.current.removeSource(routeLayerId);
        }
      }
    };
    updateRoute();
  }, [origin, destination]);

  const runSimulationWithGeometry = (geometry) => {
    if (!geometry || !geometry.coordinates) return;
    if (!map.current) return;

    if (driverMarker.current) driverMarker.current.remove();

    const el = document.createElement('div');
    el.innerHTML = '🛵';
    el.style.fontSize = '40px';
    el.style.width = '50px';
    el.style.height = '50px';
    el.style.display = 'flex';
    el.style.justifyContent = 'center';
    el.style.alignItems = 'center';
    el.style.zIndex = '1000';
    el.style.textShadow = '0 0 10px white';
    el.style.cursor = 'pointer';

    driverMarker.current = new maplibregl.Marker({ element: el, anchor: 'center' })
        .setLngLat(geometry.coordinates[0])
        .addTo(map.current);

    const line = turf.lineString(geometry.coordinates);
    const totalDistance = turf.length(line, { units: 'kilometers' });
    const duration = 5000;
    const start = performance.now();

    const animate = (time) => {
        const elapsed = time - start;
        const progress = elapsed / duration;

        if (progress >= 1) {
            const endCoords = geometry.coordinates[geometry.coordinates.length - 1];
            if (driverMarker.current) driverMarker.current.setLngLat(endCoords);
            return; 
        }

        const currentDist = totalDistance * progress;
        
        try {
            const segment = turf.along(line, currentDist, { units: 'kilometers' });
            if (segment && segment.geometry && driverMarker.current) {
                driverMarker.current.setLngLat(segment.geometry.coordinates);
            }
        } catch (error) {
            console.error("Error moviendo moto:", error);
        }
        
        requestAnimationFrame(animate);
    };

    requestAnimationFrame(animate);
  };

  const visualizeOrderOnMap = async (order) => {
    clearMap();
    const startPoint = { lng: order.originLng, lat: order.originLat };
    const endPoint = { lng: order.destLng, lat: order.destLat };
    addMarker([startPoint.lng, startPoint.lat], '#16a34a');
    addMarker([endPoint.lng, endPoint.lat], '#dc2626');
    
    if (map.current) {
        const bounds = new maplibregl.LngLatBounds([startPoint.lng, startPoint.lat], [endPoint.lng, endPoint.lat]);
        map.current.fitBounds(bounds, { padding: 50 });
    }

    const geometry = await fetchRoute(startPoint, endPoint);
    if (geometry) { 
        drawRoute(geometry); 
        setRouteGeoJSON(geometry); 

        const normalizedStatus = order.status ? order.status.toUpperCase().replace(/\s+/g, '_') : 'PENDIENTE';
        if (normalizedStatus === 'EN_CAMINO') {
          // Iniciar simulación de recorrido en vivo de inmediato
          runSimulationWithGeometry(geometry);
        } else if (normalizedStatus === 'ASIGNADO') {
          // Colocar moto estática en el punto de origen
          if (driverMarker.current) driverMarker.current.remove();
          const el = document.createElement('div');
          el.innerHTML = '🛵';
          el.style.fontSize = '40px';
          el.style.width = '50px';
          el.style.height = '50px';
          el.style.display = 'flex';
          el.style.justifyContent = 'center';
          el.style.alignItems = 'center';
          el.style.zIndex = '1000';
          el.style.textShadow = '0 0 10px white';

          driverMarker.current = new maplibregl.Marker({ element: el, anchor: 'center' })
              .setLngLat([startPoint.lng, startPoint.lat])
              .addTo(map.current);
        }
    }
  };

  const startSimulation = () => {
    if (!routeGeoJSON || !routeGeoJSON.coordinates) {
        toast.warning("Primero debes ver una ruta en el mapa");
        return;
    }
    runSimulationWithGeometry(routeGeoJSON);
  };
  
  const updateStatus = async (id, status, driverId=null) => {
    const payload = { status }; if(driverId) payload.driverId = driverId;
    await fetch(`http://localhost:3001/api/orders/${id}/status`, { method: 'PATCH', headers: {'Content-Type':'application/json'}, body: JSON.stringify(payload) });
    fetchData();
  };
  
  const handleDriverStartRoute = async (order) => {
    // Obtener el ID del conductor logueado
    const userData = JSON.parse(localStorage.getItem('user_data'));
    const driverId = userData?.id || null;

    if (order.status === 'PENDIENTE') {
      // Primer clic: Aceptar pedido → ASIGNADO
      await updateStatus(order.id, 'ASIGNADO', driverId);
    } else if (order.status === 'ASIGNADO') {
      // Segundo clic: Iniciar ruta → EN_CAMINO
      await updateStatus(order.id, 'EN_CAMINO', driverId);
      visualizeOrderOnMap(order);
    }
  };
  
  const handleFileUpload = async (e) => {
    const file = e.target.files[0]; if (!file || !orderToUpload) return;
    const formData = new FormData(); formData.append('evidence', file); formData.append('status', 'ENTREGADO');
    await fetch(`http://localhost:3001/api/orders/${orderToUpload}/status`, { method: 'PATCH', body: formData });
    toast.success("Pedido entregado con éxito"); fetchData();
  };
  
  const handleTrackOrder = async () => { 
    if (!trackId) return;
    const res = await fetch(`http://localhost:3001/api/orders/${trackId}`);
    if (res.ok) { const order = await res.json(); setTrackedOrder(order); visualizeOrderOnMap(order); }
  };
  
  const handleGeocode = async (type) => { 
    const query = type === 'origin' ? originInput : destinationInput;
    if (!query) return;
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}, Arequipa`);
      const data = await res.json();
      if (data.length > 0 && map.current) {
        const first = data[0];
        const lat = parseFloat(first.lat);
        const lng = parseFloat(first.lon);
        
        const display = first.display_name;
        const parts = display.split(',');
        const addressName = parts.slice(0, 3).join(',').trim();

        const pointData = { lat, lng, address: addressName };

        if (type === 'origin') {
          setOrigin(pointData);
          setOriginMarker([lng, lat]);
        } else {
          setDestination(pointData);
          setDestinationMarker([lng, lat]);
        }

        map.current.flyTo({ center: [lng, lat], zoom: 16 });
      } else {
        toast.warning("No se encontró la dirección.");
      }
    } catch (error) {
      console.error("Error geocode", error);
      toast.error("Error al buscar la ubicación.");
    }
  };

  return (
    <div className="app-container">
      <Navbar userRole={userRole} onLogout={handleLogout} />
      
      <div className="main-content-area">
        <div className={`sidebar-container ${!shouldShowMap ? 'full-width-content' : ''}`}>
            <div className="sidebar-panel">
                <Routes>
                    {/* Rutas públicas */}
                    <Route path="/" element={<LandingView />} />
                    <Route path="/login" element={<LoginView onLogin={handleLogin} />} />
                    <Route path="/register" element={<RegisterView />} />
                    <Route path="/about" element={<AboutView />} />
                    <Route path="/help" element={<HelpView />} />
                    <Route path="/tracking" element={<TrackingView trackId={trackId} setTrackId={setTrackId} handleTrackOrder={handleTrackOrder} trackedOrder={trackedOrder} startSimulation={startSimulation} />} />
                    
                    {/* Cliente */}
                    <Route 
                      path="/client" 
                      element={
                        <ProtectedRoute allowedRoles={['client']} userRole={userRole}>
                          <ClientView
                            origin={origin}
                            destination={destination}
                            distance={distance}
                            price={price}
                            paymentMethod={paymentMethod}
                            setPaymentMethod={setPaymentMethod}
                            packageSize={packageSize}
                            setPackageSize={setPackageSize}
                            urgency={urgency}
                            setUrgency={setUrgency}
                            originInput={originInput}
                            setOriginInput={setOriginInput}
                            destinationInput={destinationInput}
                            setDestinationInput={setDestinationInput}
                            mapSelectionMode={mapSelectionMode}
                            setMapSelectionMode={setMapSelectionMode}
                            handleGeocode={handleGeocode}
                            lastCreatedOrder={lastCreatedOrder}
                            setLastCreatedOrder={setLastCreatedOrder}
                          />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Cliente - Historial */}
                    <Route 
                      path="/client/history" 
                      element={
                        <ProtectedRoute allowedRoles={['client']} userRole={userRole}>
                          <ClientHistoryView />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Admin - Panel Principal */}
                    <Route 
                      path="/admin" 
                      element={
                        <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                          <AdminView 
                            recentOrders={recentOrders} 
                            drivers={drivers} 
                            selectedDrivers={selectedDrivers} 
                            setSelectedDrivers={setSelectedDrivers} 
                            updateStatus={updateStatus} 
                            adminClients={adminClients}
                            adminDrivers={adminDrivers}
                            fetchAdminData={fetchAdminData}
                            onDeleteOrder={handleAdminDeleteOrder}
                          />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Admin - Conductores */}
                    <Route 
                      path="/admin/drivers" 
                      element={
                        <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                          <AdminDriversView />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Admin - Métricas */}
                    <Route 
                      path="/admin/analytics" 
                      element={
                        <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                          <AdminAnalyticsView />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Admin - Configuración */}
                    <Route 
                      path="/admin/settings" 
                      element={
                        <ProtectedRoute allowedRoles={['admin']} userRole={userRole}>
                          <div style={{ padding: '40px', textAlign: 'center' }}>
                            <h2 style={{ color: '#2C3E50', marginBottom: '10px' }}>⚙️ Configuración</h2>
                            <p style={{ color: '#666' }}>Panel de configuración del sistema</p>
                            <div style={{ marginTop: '30px', padding: '20px', background: '#f8f9fa', borderRadius: '12px' }}>
                              <p style={{ color: '#999', fontSize: '0.9rem' }}>Próximamente: Gestión de tarifas, zonas de cobertura, y más.</p>
                            </div>
                          </div>
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Conductor */}
                    <Route 
                      path="/driver" 
                      element={
                        <ProtectedRoute allowedRoles={['driver']} userRole={userRole}>
                          <DriverView 
                            drivers={drivers} 
                            recentOrders={recentOrders} 
                            currentDriverId={currentDriverId} 
                            setCurrentDriverId={setCurrentDriverId} 
                            handleDriverStartRoute={handleDriverStartRoute} 
                            visualizeOrderOnMap={visualizeOrderOnMap} 
                            setOrderToUpload={setOrderToUpload} 
                            fileInputRef={fileInputRef} 
                            handleFileUpload={handleFileUpload} 
                          />
                        </ProtectedRoute>
                      } 
                    />
                    
                    {/* Conductor - Ganancias */}
                    <Route 
                      path="/driver/earnings" 
                      element={
                        <ProtectedRoute allowedRoles={['driver']} userRole={userRole}>
                          <DriverEarningsView />
                        </ProtectedRoute>
                      } 
                    />
                </Routes>
            </div>
        </div>
        
        <div className="map-wrapper" style={!shouldShowMap ? { display: 'none' } : { position: 'relative' }}>
            {mapSelectionMode && (
              <div style={{
                position: 'absolute',
                top: '20px',
                left: '50%',
                transform: 'translateX(-50%)',
                zIndex: 1000,
                background: 'rgba(255, 255, 255, 0.85)',
                backdropFilter: 'blur(8px)',
                padding: '12px 24px',
                borderRadius: '12px',
                boxShadow: '0 4px 20px rgba(0, 0, 0, 0.15)',
                border: '1px solid rgba(255, 255, 255, 0.3)',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
                fontWeight: 'bold',
                color: '#2C3E50',
                pointerEvents: 'auto'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                  {mapSelectionMode === 'origin' ? '🟢 Selecciona el origen en el mapa' : '🔴 Selecciona el destino en el mapa'}
                </span>
                <button 
                  onClick={() => setMapSelectionMode(null)}
                  style={{
                    background: '#f3f4f6',
                    border: 'none',
                    borderRadius: '6px',
                    padding: '4px 8px',
                    cursor: 'pointer',
                    fontSize: '0.8rem',
                    color: '#ef4444',
                    fontWeight: 'bold',
                    transition: 'background 0.2s'
                  }}
                  onMouseEnter={(e) => e.target.style.background = '#fee2e2'}
                  onMouseLeave={(e) => e.target.style.background = '#f3f4f6'}
                >
                  Cancelar
                </button>
              </div>
            )}
            <div ref={mapContainer} style={{ width: '100%', height: '100%' }} />
        </div>
      </div>
      
      {/* MODAL ALERTA DE NUEVO PEDIDO PARA EL CONDUCTOR */}
      {activeDriverOffer && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(4px)',
          zIndex: 9999,
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          padding: '20px'
        }}>
          <style>{`
            @keyframes fadeIn {
              from { opacity: 0; transform: scale(0.9); }
              to { opacity: 1; transform: scale(1); }
            }
            @keyframes pulse {
              0% { transform: scale(1); }
              50% { transform: scale(1.1); }
              100% { transform: scale(1); }
            }
          `}</style>
          <div style={{
            background: 'white',
            borderRadius: '16px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.3)',
            width: '100%',
            maxWidth: '500px',
            padding: '25px',
            border: '2px solid #D71920',
            animation: 'fadeIn 0.3s ease'
          }}>
            <div style={{ textAlign: 'center', marginBottom: '20px' }}>
              <div style={{
                fontSize: '3.5rem',
                animation: 'pulse 1.5s infinite',
                display: 'inline-block',
                marginBottom: '10px'
              }}>
                🔔
              </div>
              <h3 style={{ margin: 0, color: '#D71920', fontSize: '1.4rem', fontWeight: 'bold' }}>
                ¡Nuevo Pedido Disponible!
              </h3>
              <p style={{ color: '#666', fontSize: '0.9rem', marginTop: '5px' }}>
                Tienes un pedido asignado por cercanía esperando tu respuesta.
              </p>
            </div>

            <div style={{
              background: '#f8f9fa',
              borderRadius: '10px',
              padding: '15px',
              marginBottom: '20px',
              fontSize: '0.9rem',
              color: '#333',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px'
            }}>
              <div>🟢 <b>Origen:</b> {activeDriverOffer.originAddress}</div>
              <div>🔴 <b>Destino:</b> {activeDriverOffer.destAddress}</div>
              <div style={{
                borderTop: '1px solid #eee',
                paddingTop: '10px',
                marginTop: '5px',
                display: 'flex',
                justifyContent: 'space-between',
                fontWeight: 'bold',
                fontSize: '1.1rem',
                color: '#16a34a'
              }}>
                <span>Tarifa Estimada:</span>
                <span>S/ {activeDriverOffer.price?.toFixed(2)}</span>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '12px' }}>
              <button
                onClick={() => {
                  const userData = JSON.parse(localStorage.getItem('user_data'));
                  updateStatus(activeDriverOffer.id, 'ASIGNADO', userData?.id);
                  toast.success("¡Pedido aceptado exitosamente!");
                  setActiveDriverOffer(null);
                }}
                style={{
                  flex: 1,
                  background: '#16a34a',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#15803d'}
                onMouseLeave={(e) => e.target.style.background = '#16a34a'}
              >
                Aceptar Viaje ✅
              </button>

              <button
                onClick={() => handleRejectOffer(activeDriverOffer.id)}
                style={{
                  flex: 1,
                  background: '#ef4444',
                  color: 'white',
                  border: 'none',
                  borderRadius: '10px',
                  padding: '12px',
                  fontWeight: 'bold',
                  cursor: 'pointer',
                  fontSize: '1rem',
                  transition: 'background 0.2s'
                }}
                onMouseEnter={(e) => e.target.style.background = '#b91c1c'}
                onMouseLeave={(e) => e.target.style.background = '#ef4444'}
              >
                Rechazar ❌
              </button>
            </div>
          </div>
        </div>
      )}
      
      <Footer />
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <ToastProvider>
        <AppContent />
      </ToastProvider>
    </BrowserRouter>
  );
}