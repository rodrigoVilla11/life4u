# Life4U

Aplicación web de productividad personal y finanzas personales. Organiza tus tareas, controla tus gastos e ingresos, y alcanza tus metas de ahorro. Todo en un solo lugar.

## Stack Tecnológico

- **Framework:** Next.js 16 (App Router)
- **Lenguaje:** TypeScript
- **Estilos:** TailwindCSS + shadcn/ui
- **Estado:** Zustand
- **Formularios:** React Hook Form + Zod
- **Base de Datos:** PostgreSQL + Prisma ORM
- **Autenticación:** NextAuth.js v5 (Auth.js)
- **Gráficos:** Recharts
- **Iconos:** Lucide React
- **Tema:** next-themes (claro/oscuro/sistema)

## Funcionalidades

### Tareas
- Crear, editar, eliminar y duplicar tareas
- Listas/categorías personalizables
- Subtareas con progreso
- Prioridades: baja, media, alta, urgente
- Estados: pendiente, en progreso, completada, cancelada
- Fecha y hora de vencimiento
- Tags/etiquetas
- Favoritos
- Vista lista y vista kanban
- Filtrado y ordenamiento avanzado
- Búsqueda de tareas
- Archivar tareas
- Vincular tareas a metas de ahorro

### Finanzas
- Registrar ingresos, gastos y transferencias
- Categorías predefinidas y personalizables
- Múltiples métodos de pago
- Múltiples cuentas/bolsillos
- Tags por transacción
- Gastos fijos vs variables
- Transacciones recurrentes (diario, semanal, mensual, anual)
- Vincular movimientos a metas de ahorro
- Soporte multimoneda (USD, EUR, ARS, GBP, BRL)

### Cuentas / Bolsillos
- Efectivo, banco, billetera virtual, ahorro, inversión, cripto, tarjeta
- Saldo actual calculado automáticamente
- Colores e íconos personalizables
- Vista resumen con ingresos/gastos/balance por cuenta
- Archivar cuentas inactivas

### Metas de Ahorro
- Crear metas con monto objetivo y fecha límite
- Aportes manuales (depósitos y retiros)
- Progreso visual con porcentaje
- Cálculo automático de ahorro necesario (diario/semanal/mensual)
- Indicador "en ritmo" / "atrasado"
- Predicción de cumplimiento
- Historial de contribuciones
- Prioridades y categorías
- Auto-completar al alcanzar el objetivo

### Dashboard
- Resumen de tareas: pendientes hoy, vencidas, completadas esta semana
- Resumen financiero: ingresos, gastos, balance del mes
- Ahorro acumulado
- Metas activas con la más cercana a completarse
- Últimos movimientos
- Próximos vencimientos recurrentes
- Gráfico de ingresos vs gastos por mes

### Reportes
- Ingresos y gastos por mes (gráfico de barras)
- Balance mensual (gráfico de línea)
- Gastos por categoría (gráfico de torta)
- Ingresos por categoría
- Top categorías de gasto con porcentaje
- Resumen por cuenta
- Progreso de metas
- Promedios mensuales

### Configuración
- Moneda principal
- Formato de fecha
- Inicio de semana
- Tema claro/oscuro/sistema
- Widgets del dashboard
- Gestión de categorías personalizadas

## Estructura del Proyecto

```
src/
├── app/
│   ├── (auth)/              # Páginas de autenticación
│   │   ├── login/
│   │   └── register/
│   ├── (dashboard)/         # Páginas protegidas
│   │   ├── dashboard/
│   │   ├── tasks/
│   │   ├── finances/
│   │   ├── accounts/
│   │   ├── goals/
│   │   ├── reports/
│   │   └── settings/
│   └── api/auth/            # NextAuth API routes
├── actions/                 # Server Actions
│   ├── auth.ts
│   ├── tasks.ts
│   ├── finance.ts
│   ├── goals.ts
│   └── dashboard.ts
├── components/
│   ├── ui/                  # shadcn/ui + custom components
│   ├── layout/              # Sidebar, Topbar, Mobile Nav
│   ├── dashboard/           # Dashboard widgets
│   ├── tasks/               # Task components
│   ├── finances/            # Finance components
│   ├── accounts/            # Account components
│   ├── goals/               # Goal components
│   ├── reports/             # Report components
│   └── settings/            # Settings components
├── hooks/                   # Custom hooks
├── lib/
│   ├── auth.ts              # NextAuth config
│   ├── auth-helpers.ts      # Auth utilities
│   ├── constants.ts         # Labels, categories, currencies
│   ├── prisma.ts            # Prisma client
│   └── utils.ts             # Utility functions
├── schemas/                 # Zod validation schemas
│   ├── auth.ts
│   ├── task.ts
│   ├── finance.ts
│   └── goal.ts
├── stores/                  # Zustand stores
│   └── app-store.ts
└── types/                   # TypeScript types
    ├── index.ts
    └── next-auth.d.ts
```

## Instalación

### Prerrequisitos
- Node.js 18+
- PostgreSQL
- npm o yarn

### Pasos

1. **Clonar el repositorio**
```bash
git clone <repo-url>
cd to-do-list-spain
```

2. **Instalar dependencias**
```bash
npm install
```

3. **Configurar variables de entorno**

Crear archivo `.env` en la raíz:
```env
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/life_dashboard?schema=public"
NEXTAUTH_SECRET="tu-clave-secreta-cambiar-en-produccion"
NEXTAUTH_URL="http://localhost:3000"
```

4. **Inicializar la base de datos**
```bash
# Generar cliente Prisma
npm run db:generate

# Crear las tablas
npm run db:push

# Cargar datos de ejemplo
npm run db:seed
```

5. **Iniciar el servidor de desarrollo**
```bash
npm run dev
```

6. **Abrir en el navegador**
```
http://localhost:3000
```

### Credenciales de demo
- **Email:** demo@life4u.app
- **Password:** demo123

## Scripts Disponibles

| Script | Descripción |
|--------|-------------|
| `npm run dev` | Servidor de desarrollo |
| `npm run build` | Build de producción |
| `npm run start` | Servidor de producción |
| `npm run lint` | Linter |
| `npm run db:generate` | Generar cliente Prisma |
| `npm run db:push` | Sincronizar schema con DB |
| `npm run db:migrate` | Crear migración |
| `npm run db:seed` | Cargar datos de ejemplo |
| `npm run db:studio` | Abrir Prisma Studio |
| `npm run db:reset` | Resetear DB y cargar seed |

## Mejoras Futuras

- [ ] Exportación a CSV
- [ ] Importación de datos
- [ ] Onboarding paso a paso
- [ ] Sistema de notificaciones push
- [ ] Recordatorios por email
- [ ] Tipo de cambio automático via API
- [ ] Drag & drop en kanban
- [ ] Comprobantes/archivos adjuntos
- [ ] PWA (Progressive Web App)
- [ ] Modo offline
- [ ] API pública / REST
- [ ] Compartir listas de tareas
- [ ] Insights automáticos con IA
- [ ] Presupuestos mensuales por categoría
- [ ] Gráficos avanzados e interactivos
- [ ] Multi-idioma completo (i18n)
- [ ] 2FA (autenticación de dos factores)
- [ ] Recuperación de contraseña por email

## Licencia

MIT
