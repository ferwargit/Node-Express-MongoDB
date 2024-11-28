# Documentación Suite de Pruebas

## Descripción General
Esta suite de pruebas proporciona una cobertura completa para nuestra aplicación Node.js Express MongoDB. Incluye tanto pruebas unitarias como de integración, asegurando la fiabilidad y corrección de nuestros endpoints API, operaciones de base de datos y mecanismos de autenticación.

## Estructura de las Pruebas
```
tests/
├── config/               # Archivos de configuración de pruebas
├── integration/         # Pruebas de integración
└── unit/               # Pruebas unitarias
    ├── config/         # Pruebas de configuración
    │   └── dbClient.test.js
    ├── controllers/    # Pruebas de controladores
    │   ├── mascotas.controller.test.js
    │   └── usuarios.controller.test.js
    ├── helpers/        # Pruebas de funciones auxiliares
    │   └── autenticacion.test.js
    ├── models/         # Pruebas de modelos
    │   ├── mascotas.model.test.js
    │   └── usuarios.model.test.js
    ├── routes/         # Pruebas de rutas
    │   ├── mascotas.routes.test.js
    │   └── usuarios.routes.test.js
    └── schemas/        # Pruebas de validación de esquemas
        ├── mascotas.schemas.test.js
        └── usuarios.schemas.test.js
```

## Cobertura de Pruebas

### Pruebas Unitarias

#### Pruebas de Configuración
- **dbClient.test.js**: Pruebas de funcionalidad de conexión y desconexión de base de datos
  - Establecimiento de conexión
  - Manejo de errores durante la conexión
  - Desconexión apropiada
  - Formación de cadena de conexión

#### Pruebas de Controladores
- **mascotas.controller.test.js**: Pruebas del controlador de gestión de mascotas
  - Operaciones CRUD para mascotas
  - Manejo de errores
  - Validación de datos
  
- **usuarios.controller.test.js**: Pruebas del controlador de gestión de usuarios
  - Registro y autenticación de usuarios
  - Gestión de perfiles
  - Escenarios de error

#### Pruebas de Helpers
- **autenticacion.test.js**: Pruebas de autenticación
  - Generación de tokens JWT
  - Verificación de tokens
  - Middleware de autorización
  - Manejo de tokens inválidos

#### Pruebas de Modelos
- **mascotas.model.test.js**: Pruebas del modelo de mascotas
  - Validación de esquema
  - Campos requeridos
  - Relaciones de datos
  
- **usuarios.model.test.js**: Pruebas del modelo de usuarios
  - Hash de contraseñas
  - Validación de datos de usuario
  - Gestión de información de perfil

#### Pruebas de Rutas
- **mascotas.routes.test.js**: Pruebas de rutas de mascotas
  - Configuraciones de rutas
  - Cadena de middleware
  - Integración con controladores
  
- **usuarios.routes.test.js**: Pruebas de rutas de usuarios
  - Rutas de autenticación
  - Rutas protegidas
  - Validación de solicitudes

#### Pruebas de Esquemas
- **mascotas.schemas.test.js**: Pruebas de validación del esquema de mascotas
  - Validación de entrada
  - Campos requeridos
  - Verificación de tipos de datos
  
- **usuarios.schemas.test.js**: Pruebas de validación del esquema de usuarios
  - Validación de entrada de usuario
  - Requisitos de contraseña
  - Validación de formato de email

## Ejecución de Pruebas

### Todas las Pruebas
```bash
npm test
```

### Archivo Específico
```bash
npm test tests/unit/[ruta-al-archivo-de-prueba]
```

### Modo Watch
```bash
npm run test:watch
```

## Entorno de Pruebas
- Framework de Testing: Vitest
- Librería de Mocking: vi (incluido en Vitest)
- Herramienta de Cobertura: c8 (incluido en Vitest)

## Mejores Prácticas
1. Cada archivo de prueba se centra en un único módulo
2. Uso de `beforeEach` y `afterEach` para configuración y limpieza
3. Mocking completo de dependencias externas
4. Descripciones claras usando bloques describe/it
5. Cobertura de casos de error para pruebas robustas
6. Aislamiento de pruebas unitarias de servicios externos

## Requisitos de Cobertura
- Umbral mínimo de cobertura: 80%
- Rutas críticas requieren 100% de cobertura:
  - Autenticación
  - Validación de datos
  - Manejo de errores

## Mantenimiento
Para mantener la calidad de las pruebas:
1. Ejecutar pruebas antes de cada commit
2. Mantener la cobertura de código alta
3. Actualizar pruebas cuando se modifica la funcionalidad
4. Revisar y refactorizar pruebas regularmente

## Contribución
Al agregar nuevas pruebas:
1. Seguir la estructura de directorios existente
2. Usar nombres descriptivos para las pruebas
3. Incluir escenarios de éxito y error
4. Hacer mock de dependencias externas
5. Actualizar este README cuando se agreguen nuevas categorías de pruebas
