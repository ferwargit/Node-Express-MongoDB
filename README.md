# API REST Node.js + Express + MongoDB

## Descripción
API REST completa para gestión de usuarios y mascotas, construida con Node.js, Express y MongoDB. Incluye autenticación JWT, validación de datos, y una suite completa de pruebas unitarias.

## Características Principales
- 🔐 Autenticación JWT
- 📝 CRUD completo para usuarios y mascotas
- ✅ Validación de datos con schemas
- 🧪 Pruebas unitarias completas
- 📚 Documentación detallada
- 🔒 Middleware de autorización
- 🗃️ Integración con MongoDB

## Estructura del Proyecto
```
node-express-mongodb/
├── config/             # Configuración (DB, etc.)
├── controllers/        # Controladores de la aplicación
├── helpers/           # Funciones auxiliares
├── models/            # Modelos de MongoDB
├── routes/            # Rutas de la API
├── schemas/           # Schemas de validación
└── tests/             # Suite completa de pruebas
    ├── unit/          # Pruebas unitarias
    └── integration/   # Pruebas de integración
```

## Tecnologías Utilizadas
- Node.js
- Express
- MongoDB + Mongoose
- JWT (jsonwebtoken)
- Bcrypt
- Vitest (Testing)
- Dotenv
- CORS
- Morgan (Logging)

## Requisitos Previos
- Node.js >= 14.x
- MongoDB >= 4.x
- npm >= 6.x

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/ferwargit/Node-Express-MongoDB.git
cd Node-Express-MongoDB
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
Crear archivo `.env` con las siguientes variables:
```env
PORT=3000
MONGODB_URI=tu_uri_de_mongodb
JWT_TOKEN_SECRET=tu_secret_key
USER_DB=tu_usuario_db
PASS_DB=tu_password_db
SERVER_DB=tu_servidor_db
```

## Uso

### Iniciar el Servidor
```bash
node app.js
```

### Ejecutar Pruebas
```bash
# Ejecutar todas las pruebas
npm test

# Ejecutar pruebas en modo watch
npm run test:watch

# Ver cobertura de pruebas
npm run test:coverage
```

## Endpoints API

### Usuarios
- POST /api/usuarios/registro - Registrar nuevo usuario
- POST /api/usuarios/login - Iniciar sesión
- GET /api/usuarios/perfil - Obtener perfil (requiere autenticación)
- PUT /api/usuarios/perfil - Actualizar perfil (requiere autenticación)

### Mascotas
- GET /api/mascotas - Listar todas las mascotas
- POST /api/mascotas - Crear nueva mascota (requiere autenticación)
- GET /api/mascotas/:id - Obtener mascota por ID
- PUT /api/mascotas/:id - Actualizar mascota (requiere autenticación)
- DELETE /api/mascotas/:id - Eliminar mascota (requiere autenticación)

## Seguridad
- Autenticación mediante JWT
- Contraseñas hasheadas con bcrypt
- Validación de datos en requests
- Protección contra inyección NoSQL
- Headers de seguridad con CORS configurado

## Testing
- Suite completa de pruebas unitarias
- Pruebas de integración
- Mocking de servicios externos
- Cobertura de código > 80%
- Pruebas automatizadas de endpoints

## Contribución
1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## Licencia
Este proyecto está bajo la Licencia ISC - ver el archivo [LICENSE](LICENSE) para más detalles.

## Autor
Fernando Warno

## Estado del Proyecto
🟢 Activo - En desarrollo y mantenimiento activo