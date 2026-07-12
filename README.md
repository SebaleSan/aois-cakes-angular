# AoisCakesAngular

Aplicación web desarrollada con Angular para la gestión y visualización de un catálogo de productos de una pastelería.

## Características

- Catálogo de productos.
- Búsqueda de productos.
- Filtrado por categorías.
- Visualización del detalle de productos.
- Panel de administración (CRUD de productos).
- Inicio de sesión simulado.
- Recuperación de contraseña simulada utilizando LocalStorage.
- Diseño responsive con Bootstrap.

## Tecnologías utilizadas

- Angular 22
- TypeScript
- Bootstrap 5
- HTML5
- CSS3
- LocalStorage
- Vitest (pruebas unitarias)
- Json Server (base de datos json)
- Docker / Docker Compose (despliegue en contenedores)

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 22.0.1.

## Requisitos previos

- Node.js (versión compatible con Angular 22)
- npm
- Docker y Docker Compose (opcional, solo si se desea correr la app en contenedores)

## Instalación

Clona el repositorio e instala las dependencias:

```bash
npm install
```

## Uso de Json Server (base de datos simulada)

Este proyecto **no tiene backend propio**: toda la persistencia de datos (productos, usuarios) se maneja con [json-server](https://github.com/typicode/json-server), que expone el archivo `db.json` como una API REST.

### Instalar y ejecutar json-server

Antes de levantar la aplicación Angular, json-server debe estar corriendo. En una terminal aparte:

```bash
npx json-server@0.17.4 --watch db.json --port 3000
```

Esto expone la API en `http://localhost:3000`. Mientras esta terminal esté abierta, cualquier cambio hecho desde la app (crear, editar, eliminar productos) se guarda directamente en `db.json`.

> **Importante:** json-server debe estar corriendo *antes* de iniciar `ng serve`, o las peticiones desde la app fallarán al no encontrar el servidor.

### Endpoints disponibles

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/productos` | Lista todos los productos |
| GET | `/productos/:id` | Obtiene un producto por ID |
| POST | `/productos` | Crea un nuevo producto |
| PATCH | `/productos/:id` | Actualiza un producto existente |
| DELETE | `/productos/:id` | Elimina un producto |
| GET | `/usuarios` | Lista todos los usuarios |
| GET | `/usuarios?usuario=x&password=y` | Consulta usada para el login |
| POST | `/usuarios` | Registra un nuevo usuario |

### Estructura de `db.json`

```json
{
  "productos": [
    {
      "id": 1,
      "nombre": "Brownie",
      "categoria": "Tradicional",
      "precio": 2500,
      "imagen": "assets/img/tradicional/brownie.jpg",
      "descripcion": "Brownie con centro fudge, cobertura de nueces tostadas.",
      "disponible": true,
      "destacado": false
    }
  ],
  "usuarios": [
    {
      "id": 1,
      "nombre": "Administrador Aois Cakes",
      "usuario": "admin",
      "correo": "admin@aoiscakes.cl",
      "password": "Admin123",
      "direccion": "",
      "fechaNacimiento": "1985-07-20",
      "rol": "admin"
    }
  ]
}
```

### Cuentas de prueba

Para probar el inicio de sesión sin necesidad de registrar un usuario nuevo:

| Rol | Usuario | Contraseña |
|-----|---------|------------|
| Administrador | `admin` | `Admin123` |
| Cliente | `cliente1` | `Cliente123` |

El rol `admin` habilita el acceso al panel de administración (`/admin`), donde se gestionan los productos del catálogo.

## Development server

Con json-server ya corriendo, en otra terminal inicia el servidor de desarrollo de Angular:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## Ejecutar con Docker

El proyecto también puede levantarse completo (Angular + json-server) usando Docker Compose, sin necesidad de instalar Node.js localmente:

```bash
docker compose up --build
```

Esto construye y levanta dos contenedores:

- **angular-app**: compila la aplicación Angular y la sirve mediante Nginx.
- **json-server-api**: expone la API REST a partir de `db.json`.

> **Nota:** para que los datos persistan entre reinicios de los contenedores, `db.json` debe estar montado como volumen en el `docker-compose.yml`; de lo contrario los cambios se pierden cada vez que se reconstruye el contenedor.

## Code scaffolding

Angular CLI includes powerful code scaffolding tools. To generate a new component, run:

```bash
ng generate component component-name
```

For a complete list of available schematics (such as `components`, `directives`, or `pipes`), run:

```bash
ng generate --help
```

## Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

## Running unit tests

To execute unit tests with the [Vitest](https://vitest.dev/) test runner, use the following command:

```bash
ng test
```

## Running end-to-end tests

For end-to-end (e2e) testing, run:

```bash
ng e2e
```

Angular CLI does not come with an end-to-end testing framework by default. You can choose one that suits your needs.

## Limitaciones conocidas (contexto académico)

Este proyecto es una simulación desarrollada con fines educativos, por lo que se tomaron algunas decisiones simplificadas que no serían apropiadas en un entorno de producción real:

- No existe autenticación real basada en tokens (JWT); la sesión se guarda en `localStorage` del navegador.
- json-server no valida reglas de negocio ni permisos a nivel de servidor: cualquier cliente con acceso a la URL puede consultar o modificar los datos directamente.
- No hay control de concurrencia: si dos usuarios editan el mismo producto al mismo tiempo, gana la última escritura.

En un entorno real, estas limitaciones se resolverían con un backend propio, hash de contraseñas (bcrypt), autenticación JWT y validación de permisos en el servidor.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.