# Tests Structure

This directory contains all the test files for the Node-Express-MongoDB project. The tests are organized in a way that makes them easy to maintain and extend.

## Directory Structure

```
tests/
├── config/                 # Test configuration files
│   └── test-setup.js      # MongoDB memory server setup
├── integration/           # Integration tests
├── unit/                 # Unit tests
│   ├── models/          # Tests for models
│   │   ├── mascotas.model.test.js
│   │   └── usuarios.model.test.js
│   └── schemas/         # Tests for schemas
│       ├── mascotas.schemas.test.js
│       └── usuarios.schemas.test.js
└── README.md            # This file
```

## Test Categories

### Unit Tests
- **Models**: Tests for business logic and database operations
- **Schemas**: Tests for schema validations and constraints

### Integration Tests
- Future integration tests will go here

### Configuration
- **test-setup.js**: Contains the setup for MongoDB Memory Server and test database connections

## Running Tests

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Run tests in watch mode
npm run test:watch
```

## Coverage Report

The project maintains 100% code coverage across all tested files.
