# Tests Unitarios para Node-Express-MongoDB

Este directorio contiene los tests unitarios para la aplicación Node-Express-MongoDB. Los tests están organizados por categorías y utilizan Vitest como framework de testing.

## Estructura de Directorios

```
tests/
├── config/                 # Configuración para los tests
├── unit/                  # Tests unitarios
│   ├── controllers/       # Tests para los controladores
│   ├── models/           # Tests para los modelos
│   └── schemas/          # Tests para los schemas
└── README.md             # Esta documentación
```

## Tecnologías Utilizadas

- **Vitest**: Framework principal de testing
- **MongoDB Memory Server**: Base de datos en memoria para tests
- **Node.js**: Runtime de JavaScript
- **ES Modules**: Sistema de módulos nativo de JavaScript

## Ejecución de Tests

Para ejecutar los tests, puedes usar los siguientes comandos:

```bash
# Ejecutar todos los tests una vez
npm test

# Ejecutar tests en modo watch (útil durante desarrollo)
npm run test:watch

# Ejecutar tests con cobertura
npm run test:coverage
```

## Cobertura de Tests

Los tests cubren las siguientes áreas:

- **Controllers**: Lógica de negocio y manejo de requests/responses
- **Models**: Operaciones de base de datos y lógica de modelos
- **Schemas**: Validación de datos y estructura de documentos

Actualmente tenemos:
- 55 tests en total
- 6 suites de test
- 100% de cobertura en modelos y schemas
- Pruebas exhaustivas de validación y manejo de errores

## Convenciones de Testing

1. **Nombrado de archivos**: Los archivos de test deben terminar en `.test.js`
2. **Estructura de tests**:
   ```javascript
   describe('Módulo', () => {
     beforeEach(() => {
       // Setup
     });

     it('should do something', () => {
       // Test
     });
   });
   ```
3. **Mocking**: Utilizamos las funciones de mock de Vitest para aislar componentes
4. **Aserciones**: Usamos las aserciones incluidas en Vitest

## Mejores Prácticas

1. **Aislamiento**: Cada test debe ser independiente
2. **Limpieza**: Usar `beforeEach` y `afterEach` para setup y cleanup
3. **Descriptivo**: Nombres claros que describan el comportamiento esperado
4. **Organización**: Tests agrupados por funcionalidad relacionada
5. **Manejo de Errores**: Incluir tests para casos de éxito y error

## Mantenimiento

Para mantener la calidad de los tests:

1. Ejecutar tests antes de cada commit
2. Mantener la cobertura de código alta
3. Actualizar tests cuando se modifica la funcionalidad
4. Revisar y refactorizar tests regularmente

## Contribución

Al agregar nuevos tests:

1. Seguir la estructura de directorios existente
2. Mantener el estilo de código consistente
3. Documentar casos de prueba complejos
4. Asegurar que todos los tests pasen antes de hacer commit
