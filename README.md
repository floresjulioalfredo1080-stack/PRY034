# 📦 URBSEND: Logistics & Last-Mile Delivery Ecosystem

![Versión](https://img.shields.io/badge/version-1.0.0-red)
![Status](https://img.shields.io/badge/Status-MVP_Completed-success)
![Location](https://img.shields.io/badge/Focus-Arequipa_Peru-blue)
![Tech](https://img.shields.io/badge/Stack-Fullstack-orange)

URBSEND es una solución integral de logística urbana diseñada para resolver la fragmentación en los servicios de mensajería de última milla. Conecta de manera eficiente a clientes finales, conductores y centros de control mediante una arquitectura robusta distribuida en Web, Mobile y Cloud.

**Autor:** Carlos Alberto Llano Flores

---

## 🏗️ Arquitectura del Sistema

```
┌─────────────────────────────────────────────────────────────────┐
│                        URBSEND ECOSYSTEM                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│   ┌──────────────┐    ┌──────────────┐    ┌──────────────┐     │
│   │  Cliente Web │    │    Admin     │    │ Repartidor   │     │
│   │   (React)    │    │  Dashboard   │    │  (Flutter)   │     │
│   │  Port: 5173  │    │   (React)    │    │   Android    │     │
│   └──────┬───────┘    └──────┬───────┘    └──────┬───────┘     │
│          │                   │                   │              │
│          └───────────────────┼───────────────────┘              │
│                              │                                  │
│                              ▼                                  │
│                    ┌─────────────────┐                         │
│                    │   REST API      │                         │
│                    │   Express.js    │                         │
│                    │   Port: 3001    │                         │
│                    └────────┬────────┘                         │
│                             │                                  │
│                             ▼                                  │
│                    ┌─────────────────┐                         │
│                    │   PostgreSQL    │                         │
│                    │   Port: 5432    │                         │
│                    └─────────────────┘                         │
│                                                                 │
└─────────────────────────────────────────────────────────────────┘
```

---

## 🛠️ Stack Tecnológico

| Capa | Tecnologías |
| :--- | :--- |
| **Frontend Web** | React 19, Vite, MapLibre GL JS, Lucide Icons, CSS3 |
| **Mobile App** | Flutter 3.x, Dart, Image Picker, URL Launcher |
| **Backend** | Node.js 18+, Express.js 5.x |
| **ORM** | Prisma ORM |
| **Base de Datos** | PostgreSQL 15 |
| **Servicios** | PDFKit (Invoicing), Nodemailer (Email), WhatsApp Web API |
| **Contenedores** | Docker (PostgreSQL) |

---

## 🚀 GUÍA DE DESPLIEGUE (DevOps)

### Requisitos del Servidor

| Requisito | Especificación Mínima |
|-----------|----------------------|
| **Sistema Operativo** | Ubuntu 20.04+ / Debian 11+ / Windows Server 2019+ |
| **Node.js** | v18.x o superior |
| **PostgreSQL** | v15.x |
| **RAM** | 2 GB mínimo |
| **Almacenamiento** | 10 GB (incluye uploads de evidencias) |
| **Puertos** | 3001 (API), 5432 (DB), 80/443 (Frontend) |

---

### 📋 Variables de Entorno

Crear archivo `.env` en la carpeta `backend/`:

```env
# Base de Datos (REQUERIDO)
DATABASE_URL="postgresql://usuario:contraseña@localhost:5432/urbsend_db"

# Puerto del servidor (OPCIONAL - default: 3001)
PORT=3001

# Notificaciones por Email (OPCIONAL)
EMAIL_USER="notificaciones@urbsend.com"
EMAIL_PASS="app-password-de-gmail"
```

> ⚠️ **IMPORTANTE:** Si `EMAIL_USER` y `EMAIL_PASS` no están configurados, las notificaciones se simularán en consola.

---

### 🐳 Opción A: Despliegue con Docker (Recomendado)

**1. Base de datos PostgreSQL:**
```bash
docker run -d \
  --name urbsend_postgres \
  -e POSTGRES_USER=urbsend \
  -e POSTGRES_PASSWORD=urbsend123 \
  -e POSTGRES_DB=urbsend_db \
  -p 5432:5432 \
  -v urbsend_data:/var/lib/postgresql/data \
  postgres:15
```

**2. Verificar conexión:**
```bash
docker exec -it urbsend_postgres psql -U urbsend -d urbsend_db -c "SELECT 1"
```

---

### 🖥️ Opción B: Despliegue Manual

#### Paso 1: Clonar repositorio
```bash
git clone https://github.com/tu-usuario/urbsend-project.git
cd urbsend-project
```

#### Paso 2: Configurar Base de Datos
```bash
# Crear base de datos en PostgreSQL
psql -U postgres -c "CREATE DATABASE urbsend_db;"
psql -U postgres -c "CREATE USER urbsend WITH PASSWORD 'urbsend123';"
psql -U postgres -c "GRANT ALL PRIVILEGES ON DATABASE urbsend_db TO urbsend;"
```

#### Paso 3: Backend
```bash
cd backend

# Instalar dependencias
npm install

# Configurar .env (ver sección Variables de Entorno)
cp .env.example .env
nano .env

# Ejecutar migraciones de Prisma
npx prisma migrate deploy

# Generar cliente Prisma
npx prisma generate

# Iniciar servidor
npm start
# O para producción con PM2:
pm2 start index.js --name "urbsend-api"
```

#### Paso 4: Frontend (Build para producción)
```bash
cd frontend

# Instalar dependencias
npm install

# Generar build de producción
npm run build

# Los archivos estáticos estarán en: frontend/dist/
# Servir con Nginx, Apache o cualquier servidor estático
```

#### Paso 5: Datos de prueba (Opcional)
```bash
# Crear conductores de prueba
curl http://localhost:3001/api/seed-drivers
```

---

### 🌐 Configuración de Nginx (Producción)

```nginx
# /etc/nginx/sites-available/urbsend

# Frontend
server {
    listen 80;
    server_name urbsend.com www.urbsend.com;

    root /var/www/urbsend/frontend/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # Proxy para API
    location /api {
        proxy_pass http://localhost:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Archivos subidos (evidencias)
    location /uploads {
        proxy_pass http://localhost:3001/uploads;
    }
}
```

---

### 📱 App Móvil (Flutter)

La app móvil está en la carpeta `mobile-app/` (o repositorio separado).

**Configurar URL del backend:**
Editar `lib/api_service.dart`:
```dart
// Para producción, cambiar la URL:
static const String baseUrl = 'https://api.urbsend.com/api';

// Para desarrollo local:
// Emulador Android: http://10.0.2.2:3001/api
// Dispositivo físico: http://192.168.x.x:3001/api
```

**Compilar APK:**
```bash
cd mobile-app
flutter pub get
flutter build apk --release
# APK en: build/app/outputs/flutter-apk/app-release.apk
```

---

## 🔌 API Endpoints

### Autenticación
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/register/client` | Registro de cliente |
| POST | `/api/register/driver` | Registro de conductor (multipart) |
| POST | `/api/login/client` | Login cliente |
| POST | `/api/login/driver` | Login conductor |

### Pedidos
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/orders` | Listar pedidos |
| GET | `/api/orders/:id` | Obtener pedido |
| POST | `/api/orders` | Crear pedido |
| PATCH | `/api/orders/:id/status` | Actualizar estado |

### Usuarios
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/users/:userId/orders` | Historial cliente |
| GET | `/api/drivers/:driverId/orders` | Entregas conductor |
| GET | `/api/drivers` | Conductores activos |

### Administración
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/admin/drivers/pending` | Conductores por aprobar |
| PATCH | `/api/admin/drivers/:id/verify` | Aprobar/rechazar |

### Facturación y Notificaciones
| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/orders/:id/invoice?type=boleta` | Descargar PDF |
| GET | `/api/orders/:id/whatsapp?type=created` | URL WhatsApp |
| POST | `/api/orders/:id/notify` | Enviar notificación |

---

## 🔐 Credenciales de Prueba

### Administrador
```
Email: admin
Password: admin123
```

### Conductores (después de ejecutar seed)
```
Email: juan@urbsend.com
Password: moto123

Email: maria@urbsend.com
Password: moto123

Email: pedro@urbsend.com
Password: moto123
```

---

## 📁 Estructura del Proyecto

```
urbsend-project/
├── backend/
│   ├── index.js              # Servidor Express + API
│   ├── priceCalculator.js    # Lógica de precios
│   ├── prisma/
│   │   └── schema.prisma     # Esquema de BD
│   ├── uploads/              # Evidencias de entrega
│   ├── package.json
│   └── .env                  # Variables de entorno
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx           # Componente principal
│   │   ├── components/       # Navbar, Footer, Toast
│   │   ├── views/            # Vistas (13 archivos)
│   │   └── index.css         # Estilos globales
│   ├── package.json
│   └── vite.config.js
│
├── mobile-app/               # App Flutter
│   ├── lib/
│   │   ├── main.dart
│   │   ├── login_screen.dart
│   │   ├── driver_home.dart
│   │   ├── client_home.dart
│   │   └── api_service.dart
│   └── pubspec.yaml
│
├── URBSEND_PROJECT_SUMMARY.json  # Documentación técnica completa
└── README.md
```

---

## 🌟 Funcionalidades Principales

### 📊 Admin Dashboard
- Analytics con gráficos de distribución
- Gestión de conductores (aprobar/rechazar)
- Control total del ciclo de pedidos

### 👤 Cliente Web
- Cotización dinámica en mapa
- Modo Normal vs Express (+50%)
- Tracking en tiempo real
- Historial + Comprobantes PDF
- Compartir por WhatsApp

### 🛵 App Repartidor
- Lista de pedidos disponibles
- Aceptar → Iniciar Ruta → Entregar
- Navegación con Google Maps
- Cámara para foto de evidencia

---

## 📈 Flujo de Estados

```
PENDIENTE → ASIGNADO → EN_CAMINO → ENTREGADO
    │           │           │           │
    ▼           ▼           ▼           ▼
  Email      Notif.     Tracking     PDF
 Cliente    Conductor   Activo     Generado
```

---

## 🎨 Paleta de Colores

| Color | Hex | Uso |
|-------|-----|-----|
| Rojo URBSEND | `#D71920` | Primario |
| Azul Oscuro | `#2C3E50` | Secundario |
| Verde Éxito | `#16a34a` | Estados positivos |
| Naranja | `#f59e0b` | Alertas/Express |
| WhatsApp | `#25D366` | Botones compartir |


---

## 💳 Pasarela de Pago (IZIPAY)

El método de pago **Tarjeta** pasa por un checkout de IZIPAY, pero **hoy está simulado**: no contamos todavía con credenciales de sandbox, así que `backend/izipay.js` imita el flujo real (token → procesar → confirmar) sin llamar a los servidores de IZIPAY. Efectivo y Yape no pasan por esta pasarela — se siguen cobrando fuera del sistema, como hasta ahora.

**Qué es real y qué es simulado:**
- ✅ Real: el modelo de datos (`Order.paymentStatus`), los endpoints, el evento de socket que avisa en vivo cuando cambia el estado del pago, y la estructura completa del flujo.
- 🧪 Simulado: el propio pago — `backend/izipay.js` genera un token falso y deja que el usuario elija manualmente si el pago "sale bien" o "sale mal", en vez de que la respuesta venga de IZIPAY.

### Pasos para activar la integración real

1. **Obtener credenciales de sandbox** en el panel de comercio de IZIPAY: `IZIPAY_MERCHANT_CODE`, `IZIPAY_PUBLIC_KEY` (usada en el frontend para inicializar el checkout embebido) y `IZIPAY_PRIVATE_KEY` (solo backend, nunca debe llegar al navegador).
2. Copiar `backend/.env.example` a `backend/.env` y completar esas tres variables, más `IZIPAY_MODE=sandbox`.
3. Poner `IZIPAY_SIMULATE=false` en `.env` — esto hace que `backend/izipay.js` lance un error explícito en vez de simular, como recordatorio de que falta reemplazar el cuerpo de las funciones.
4. En `backend/izipay.js`, reemplazar `createPaymentToken()` para llamar de verdad a la API REST de IZIPAY (`POST /api-payment/V4/Charge/CreatePayment`), firmando la petición con `IZIPAY_PRIVATE_KEY` en el header `Authorization` (Basic Auth). La forma de la respuesta que devuelve la función (`{ formToken, merchantCode }`) debería mantenerse igual para no tener que tocar el resto del backend.
5. En el frontend, instalar el SDK oficial de IZIPAY (`krypton-client` / `lyra-collect`) y usar el `formToken` real para inicializar el checkout embebido dentro de `IzipayCheckoutModal.jsx`, en vez de los botones de "Simular Pago Exitoso/Rechazado".
6. Implementar de verdad `POST /api/payments/izipay/webhook` en `backend/index.js`: verificar la firma del payload (IZIPAY firma sus notificaciones con la clave privada) antes de confiar en el resultado, y actualizar `paymentStatus` desde ahí — en producción, la confirmación del pago debe venir de este webhook asíncrono, no de lo que el navegador del cliente le diga al backend.
7. Probar con las tarjetas de prueba que provee IZIPAY para sandbox (aprobación y rechazo), verificando que `paymentStatus` y el estado que se ve en el tracking del cliente queden en sincronía.
8. **Pasar a producción**: cambiar `IZIPAY_MODE=production`, reemplazar las tres credenciales por las de producción, y actualizar el endpoint de la API si IZIPAY usa una URL distinta para producción vs. sandbox. La lógica del backend no debería requerir más cambios.

---

## 📄 Licencia

Este proyecto es propietario de URBSEND. Todos los derechos reservados.
