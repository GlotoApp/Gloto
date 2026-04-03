# 🔐 Gloto - Sistema de 4 Puntos de Acceso

## Resumen General

El sistema cuenta con 4 portales completamente separados y seguros, cada uno con su propia página de login y dashboard:

---

## 1. 👥 **CLIENTE** (Ya Existe ✅)

**Ruta de Acceso:** `http://localhost:5173/auth`

### Descripción
Portal para clientes normales que desean realizar pedidos en los negocios disponibles.

### Funcionalidades
- Registro de nuevos clientes
- Login con email/contraseña
- Ver marketplace de negocios
- Ver detalles del negocio
- Agregar productos al carrito
- Realizar pedido (Checkout)
- Ver historial de pedidos
- Rastrear estado de pedidos

### Roles Permitidos
- `customer` (cliente)

### Flujo
```
/auth (Login/Registro)
  ↓
/  (Marketplace)
  ↓
/business/:slug (Detalle del negocio)
  ↓
/checkout (Finalizar pedido)
  ↓
/orders (Ver historial)
```

**Color Temático:** Cyan/Sky (Sky-500)

---

## 2. 👨‍💼 **ADMIN** (Refactorizado ✅)

**Ruta de Acceso:** `http://localhost:5173/portal`

### Descripción
Portal exclusivo para dueños/administradores de negocios. Aquí gestionan su inventario, productos y pedidos.

### Funcionalidades
- Login con email/contraseña de admin
- Dashboard de administración
- Gestión de productos (crear, editar, eliminar)
- Gestión de inventario
- Ver pedidos del negocio
- Estadísticas de ventas

### Roles Permitidos
- `admin` (dueño del negocio)

### Flujo
```
/portal (AdminLogin)
  ↓
/admin (Dashboard de Admin)
  ↓
Gestión de productos e inventario
```

**Color Temático:** Sky/Cyan (Sky-500)

**Validación de Acceso:**
- Solo usuarios con rol `admin` pueden acceder
- Si un empleado intenta entrar, será rechazado
- Deberá usar `/employee-login` en su lugar

---

## 3. 👨‍🍳 **EMPLEADOS** (NUEVO ✨)

**Ruta de Acceso:** `http://localhost:5173/employee-login`

### Descripción
Portal para todo el personal del negocio (cocineros, cajeros, meseros, repartidores). Cada rol tiene una interfaz y funcionalidades específicas.

### Roles Permitidos
- `cocinero` → Cocina (Kitchen View)
- `cajero` → Dashboard de pagos
- `mesero` → Dashboard de órdenes
- `repartidor` → Dashboard de entregas

### Funcionalidades por Rol

#### 🍳 Cocinero
- Login con email/contraseña
- Acceso a pantalla de cocina (Kitchen)
- Ver órdenes nuevas (en tiempo real)
- Marcar órdenes como listas
- Sonidos/notificaciones de nuevas órdenes

#### 💰 Cajero
- Login con email/contraseña
- Dashboard de pagos
- Ver órdenes pendientes de pago
- Procesar pagos
- Ver histórico de transacciones

#### 👨‍🍳 Mesero
- Login con email/contraseña
- Dashboard de órdenes
- Ver mesas asignadas
- Tomar nuevas órdenes
- Agilizar entrega de pedidos

#### 🚗 Repartidor
- Login con email/contraseña
- Dashboard de entregas
- Ver pedidos para entregar
- Actualizaciones en tiempo real
- Confirmación de entrega

### Flujo
```
/employee-login (EmployeeLogin)
  ↓
Si rol = cocinero → /kitchen/:businessId
Si otros roles → /employee-dashboard
  ↓
Interfaz específica según rol
```

**Color Temático:** Orange (Orange-500)

**Validación de Acceso:**
- Solo usuarios con roles autorizados pueden entrar
- Los admins serán rechazados (deben usar `/portal`)
- Los clientes serán rechazados (deben usar `/auth`)

---

## 4. 👑 **SUPER ADMIN** (Refactorizado ✅)

**Ruta de Acceso:** `http://localhost:5173/SuperAdminLogin`

### Descripción
Panel de control global para el propietario/administrador supremo del sistema Gloto. Acceso completo a todas las empresas, usuarios y datos.

### Funcionalidades
- Login con email/contraseña exclusiva
- Dashboard global del sistema
- Gestión de todos los negocios
- Gestión de usuarios y roles
- Estadísticas globales
- Control total del sistema

### Roles Permitidos
- `superadmin` (solo propietario del sistema)

### Flujo
```
/SuperAdminLogin (SuperAdminLogin)
  ↓
/super-admin/dashboard (SuperAdmin Dashboard)
  ↓
Control global del sistema
```

**Color Temático:** Sky/Cyan premium (Sky-500)

**Validación de Acceso:**
- SOLO usuarios con rol `superadmin` pueden acceder
- Verificación estricta en base de datos
- Esta es tu zona personal

---

## 📊 Tabla Comparativa

| Feature | Cliente | Admin | Empleados | SuperAdmin |
|---------|---------|-------|-----------|------------|
| **Login** | `/auth` | `/portal` | `/employee-login` | `/SuperAdminLogin` |
| **Dashboard** | Marketplace + Pedidos | Panel Admin | Dashboard Empleado | Panel Global |
| **Roles** | customer | admin | cocinero, cajero, mesero, repartidor | superadmin |
| **Color** | Sky-500 | Sky-500 | Orange-500 | Sky-500 |
| **Acceso** | Público | Dueños negocio | Personal del negocio | Propietario sistema |
| **Funciones** | Comprar | Gestionar | Trabajar | Controlar todo |

---

## 🔗 Enlaces Rápidos de Acceso

### Cliente
```
Inicio: http://localhost:5173/
Login: http://localhost:5173/auth
Marketplace: http://localhost:5173/
```

### Administrador (Admin)
```
Login: http://localhost:5173/portal
Dashboard: http://localhost:5173/admin
Cocina: http://localhost:5173/kitchen/:businessId
```

### Empleados
```
Login: http://localhost:5173/employee-login
Dashboard: http://localhost:5173/employee-dashboard
Cocina: http://localhost:5173/kitchen/:businessId
```

### SuperAdmin
```
Login: http://localhost:5173/SuperAdminLogin
Dashboard: http://localhost:5173/super-admin/dashboard
```

---

## ⚙️ Configuración en Base de Datos

### Tabla: `profiles`

Cada usuario debe tener uno de estos roles:

```sql
CREATE TABLE profiles (
  ...
  role VARCHAR(20) CHECK (role IN ('customer', 'admin', 'cocinero', 'cajero', 'mesero', 'repartidor', 'superadmin')),
  ...
);
```

### Asignación de Roles

#### Cliente
```sql
INSERT INTO profiles (id, role) VALUES ('user-id', 'customer');
```

#### Admin (Dueño de negocio)
```sql
INSERT INTO profiles (id, role) VALUES ('admin-id', 'admin');
-- También debe tener un negocio asociado:
INSERT INTO businesses (owner_id, name) VALUES ('admin-id', 'Mi Negocio');
```

#### Empleado (Cocinero)
```sql
INSERT INTO profiles (id, role, business_id) VALUES ('chef-id', 'cocinero', 'business-id');
```

#### Empleado (Cajero, Mesero, Repartidor)
```sql
INSERT INTO profiles (id, role, business_id) VALUES ('employee-id', 'cajero|mesero|repartidor', 'business-id');
```

#### SuperAdmin
```sql
INSERT INTO profiles (id, role) VALUES ('superadmin-id', 'superadmin');
```

---

## 🔒 Reglas de Seguridad

1. **Cada portal es independiente:** Un usuario no puede acceder a múltiples portales con la misma sesión
2. **Validación estricta de roles:** Cada portal verifica el rol en la base de datos
3. **Rechazo automático:** Si intentas acceder sin permiso, serás desconectado
4. **SessionStorage separado:** Cada login guarda su contexto independientemente

---

## ✅ Sistema Completo

- ✅ Cliente: Funcional
- ✅ Admin: Refactorizado y separado
- ✅ Empleados: NUEVO - Completamente funcional
- ✅ SuperAdmin: Funcional y exclusivo

**Todas las rutas están protegidas por ProtectedRoute component con validación de roles.**

---

Fecha de implementación: 3 Abril 2026
Sistema: Gloto - Gestión de Negocios
