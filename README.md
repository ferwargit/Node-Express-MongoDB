# Node-Express-MongoDB API

API RESTful construida con Node.js, Express y MongoDB, implementando un sistema de gestión de usuarios y mascotas con autenticación JWT.

## Características

- Arquitectura REST
- Autenticación con JWT
- Validación de datos con Mongoose
- Tests unitarios completos
- ES Modules
- Manejo de errores centralizado
- Documentación detallada

## Requisitos Previos

- Node.js (versión 14 o superior)
- MongoDB
- npm o yarn

## Tecnologías Principales

- **Runtime**: Node.js
- **Framework**: Express.js
- **Base de Datos**: MongoDB
- **ODM**: Mongoose
- **Testing**: Vitest
- **Autenticación**: JWT
- **Validación**: bcrypt
- **Logs**: Morgan

## Estructura del Proyecto

```
.
├── controllers/          # Controladores de la aplicación
├── models/              # Modelos de Mongoose
├── schemas/             # Esquemas de Mongoose
├── routes/              # Rutas de la API
├── helpers/             # Funciones auxiliares
├── middleware/          # Middleware personalizado
├── tests/              # Tests unitarios
│   ├── unit/
│   └── config/
└── config/             # Configuración de la aplicación
```

## Instalación

1. Clonar el repositorio:
```bash
git clone https://github.com/yourusername/Node-Express-MongoDB.git
cd Node-Express-MongoDB
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno:
```bash
cp .env.example .env
# Editar .env con tus configuraciones
```

## Configuración

Crear un archivo `.env` en la raíz del proyecto:

```env
PORT=3000
MONGODB_URI=mongodb://localhost:27017/tu_base_de_datos
JWT_SECRET=tu_secreto_jwt
```

## Endpoints API

### Usuarios
- `POST /api/usuarios/register` - Registro de usuario
- `POST /api/usuarios/login` - Login de usuario
- `GET /api/usuarios` - Listar usuarios (requiere autenticación)
- `GET /api/usuarios/:id` - Obtener usuario por ID
- `PUT /api/usuarios/:id` - Actualizar usuario
- `DELETE /api/usuarios/:id` - Eliminar usuario

### Mascotas
- `POST /api/mascotas` - Crear mascota
- `GET /api/mascotas` - Listar mascotas
- `GET /api/mascotas/:id` - Obtener mascota por ID
- `PUT /api/mascotas/:id` - Actualizar mascota
- `DELETE /api/mascotas/:id` - Eliminar mascota

## Ejecutar el Proyecto

```bash
# Modo desarrollo
npm run dev

# Modo producción
npm start
```

## Tests

El proyecto incluye tests unitarios exhaustivos:

```bash
# Ejecutar tests
npm test

# Modo watch
npm run test:watch

# Cobertura
npm run test:coverage
```

### Cobertura de Tests
- 55 tests en total
- 6 suites de test
- 100% de cobertura en modelos y schemas
- Tests para controladores, modelos y schemas

## Seguridad

- Autenticación JWT
- Contraseñas hasheadas con bcrypt
- Validación de datos en múltiples capas
- Manejo seguro de tokens
- Protección de rutas sensibles

## Validaciones

- Validación de esquemas con Mongoose
- Validación de requests
- Manejo de errores personalizado
- Sanitización de datos

## Contribuir

1. Fork el proyecto
2. Crear una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está bajo la Licencia ISC - ver el archivo [LICENSE](LICENSE) para más detalles.

## Próximas Mejoras

- [ ] Implementación de roles de usuario
- [ ] Integración con servicios de correo
- [ ] Documentación con Swagger
- [ ] Caché con Redis
- [ ] Logging avanzado
- [ ] CI/CD pipeline

## Autores

* **Tu Nombre** - *Trabajo Inicial* - [TuUsuario](https://github.com/TuUsuario)

## Agradecimientos

* Hat tip a cualquiera cuyo código fue usado
* Inspiración
* etc