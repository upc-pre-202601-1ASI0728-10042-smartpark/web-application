# SmartPark · Web Application (Panel del Operador)

Aplicación web del operador de **SmartPark (Apex Twin)**, construida con
**Angular 20** (standalone components, signals y control-flow nativo). Consume la
API de [`web-services`](https://github.com/upc-pre-202601-1ASI0728-10042-smartpark/web-services)
y muestra, en tiempo real, la ocupación del estacionamiento y las alertas de humo.

## Funcionalidades

- **Autenticación JWT** con guardas de ruta por rol (`Operator`).
- **Dashboard de ocupación**: indicador global, tarjetas de resumen y desglose por
  zonas, con manejo de *modo degradado* cuando el gemelo digital no responde (503).
- **Zonas**: listado con nivel de congestión y detalle con grilla de espacios
  filtrable por estado.
- **Alertas de humo**: panel de alertas activas que se actualiza **en tiempo real**
  vía **SignalR**, con notificaciones *toast* ante cada nueva alerta.

## Arquitectura (feature-based)

```
src/app/
├── core/                     # Transversal de la app
│   ├── auth/                 #   AuthService, interceptor JWT, guards, modelos
│   └── layout/               #   Shell (sidenav + toolbar)
├── features/                 # Bounded contexts del dominio
│   ├── auth/login/           #   Inicio de sesión
│   ├── dashboard/            #   Página principal de ocupación
│   ├── occupancy/            #   Servicio, modelos y componentes de ocupación
│   ├── zones/                #   Listado y detalle de zonas
│   └── alerts/               #   Alertas de humo (REST + SignalR)
├── shared/                   # Componentes reutilizables (toasts)
└── environments/             # Configuración por entorno (API y hub)
```

Cada *feature* encapsula sus modelos, su servicio de acceso a la API y sus
componentes. Los servicios de dominio se inyectan con `inject()` y el estado se
maneja con **signals**.

## API consumida

| Vista        | Endpoint                                  |
|--------------|-------------------------------------------|
| Login        | `POST /api/v1/auth/login`                 |
| Dashboard    | `GET /api/v1/occupancy/summary`, `/zones` |
| Zonas        | `GET /api/v1/occupancy/zones`             |
| Detalle zona | `GET /api/v1/occupancy/zones/{id}/spaces` |
| Alertas      | `GET /api/v1/alerts/smoke`                |
| Tiempo real  | SignalR hub `/hubs/alerts` (`smokeAlert`) |

La URL base de la API y del hub se configura en `src/environments/`.

## Desarrollo

```bash
npm install
npm start                 # ng serve → http://localhost:4200
npm run build             # build de producción en dist/
npm test -- --watch=false # pruebas unitarias (Karma + Jasmine, ChromeHeadless)
```

## Ramas
- `main` — releases estables.
- `develop` — rama de integración (los PRs apuntan aquí).
- `feature/*` — trabajo en curso por funcionalidad.

## CI
`.github/workflows/ci.yml`: instala dependencias, compila en modo producción y
ejecuta las pruebas unitarias en cada push/PR a `develop` y `main`.
