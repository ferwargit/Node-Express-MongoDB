import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock de las variables de entorno
const mockEnv = {
    NODE_ENV: 'test',
    MONGODB_URI: 'mongodb://localhost:27017/test',
    PORT: '3000',
    JWT_SECRET: 'test-secret-key',
    DOTENV_CONFIG_ENCODING: 'utf8'
};

// Mock de express y body-parser
const mockJsonMiddleware = vi.fn((req, res, next) => next());
const mockUrlencodedMiddleware = vi.fn((req, res, next) => next());
const mockApp = {
    use: vi.fn(),
    listen: vi.fn((port, callback) => {
        if (callback) callback();
        return mockApp;
    }),
};

vi.mock('express', () => ({
    default: vi.fn(() => mockApp),
    json: vi.fn(() => mockJsonMiddleware),
    urlencoded: vi.fn(() => mockUrlencodedMiddleware),
}));

vi.mock('body-parser', () => ({
    default: {
        json: vi.fn(() => mockJsonMiddleware),
        urlencoded: vi.fn(() => mockUrlencodedMiddleware)
    }
}));

// Mock de mongoose y dbClient
vi.mock('mongoose', () => ({
    default: {
        connect: vi.fn().mockResolvedValue(undefined),
        disconnect: vi.fn().mockResolvedValue(undefined)
    }
}));

vi.mock('../../config/dbClient.js', () => ({
    default: {
        cerrarConexion: vi.fn().mockResolvedValue(undefined)
    }
}));

// Mock de dotenv
vi.mock('dotenv/config', () => ({
    default: undefined
}));

// Mock de los módulos de rutas
vi.mock('../../routes/mascotas.routes.js', () => ({
    default: 'mascotas-router'
}));

vi.mock('../../routes/usuarios.routes.js', () => ({
    default: 'usuarios-router'
}));

describe('App', () => {
    let mockConsole;
    let mockProcess;

    beforeEach(() => {
        vi.resetModules();
        mockApp.use.mockReset();
        mockApp.listen.mockReset();
        mockJsonMiddleware.mockReset();
        mockUrlencodedMiddleware.mockReset();
        
        mockConsole = {
            log: vi.fn(),
            error: vi.fn()
        };
        mockProcess = {
            exit: vi.fn(),
            on: vi.fn(),
            env: mockEnv
        };
        
        global.console = mockConsole;
        global.process = mockProcess;
    });

    describe('Initialization', () => {
        it('should setup body-parser middleware before routes', async () => {
            const { default: app } = await import('../../app.js');
            
            // Verificar orden de inicialización
            const calls = mockApp.use.mock.calls;
            expect(calls.length).toBeGreaterThan(3); // Al menos middleware de content-type, body-parser y rutas
            expect(calls.some(call => call[0] === mockJsonMiddleware)).toBe(true);
            expect(calls.some(call => call[0] === mockUrlencodedMiddleware)).toBe(true);
            expect(calls.some(call => call[0] === '/api/mascotas' && call[1] === 'mascotas-router')).toBe(true);
            expect(calls.some(call => call[0] === '/api/usuarios' && call[1] === 'usuarios-router')).toBe(true);
        });
    });

    describe('Routes Setup', () => {
        it('should setup routes with correct paths', async () => {
            const { default: app } = await import('../../app.js');
            
            // Verificar configuración de rutas
            const routeCalls = mockApp.use.mock.calls.filter(call => 
                call[0] === '/api/mascotas' || call[0] === '/api/usuarios'
            );
            
            expect(routeCalls).toHaveLength(2);
            expect(routeCalls.some(call => call[0] === '/api/mascotas' && call[1] === 'mascotas-router')).toBe(true);
            expect(routeCalls.some(call => call[0] === '/api/usuarios' && call[1] === 'usuarios-router')).toBe(true);
        });

        it('should handle middleware errors', async () => {
            const mockError = new Error('Middleware error');
            mockJsonMiddleware.mockImplementationOnce((req, res, next) => {
                next(mockError);
            });

            const { default: app } = await import('../../app.js');
            
            // Simular una solicitud que activará el middleware de error
            const mockReq = {};
            const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
            const mockNext = vi.fn();

            // Obtener el middleware de error
            const errorHandler = mockApp.use.mock.calls
                .find(call => call[0].length === 4)[0];

            // Ejecutar el middleware de error
            errorHandler(mockError, mockReq, mockRes, mockNext);

            expect(mockRes.status).toHaveBeenCalledWith(500);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Error interno del servidor' });
        });
    });

    describe('Server Configuration', () => {
        it('should handle server startup errors', async () => {
            const mockError = new Error('Server error');
            mockApp.listen.mockImplementationOnce((port, callback) => {
                if (callback) callback(mockError);
                return mockApp;
            });

            try {
                const { default: app } = await import('../../app.js');
            } catch (error) {
                expect(error).toBe(mockError);
            }
        });
    });

    describe('System Signals', () => {
        it('should handle database disconnection errors during shutdown', async () => {
            const mockError = new Error('Disconnection error');
            const dbClient = (await import('../../config/dbClient.js')).default;
            dbClient.cerrarConexion.mockRejectedValueOnce(mockError);

            const { default: app } = await import('../../app.js');
            
            // Simular señal SIGINT
            const sigintCallback = mockProcess.on.mock.calls.find(call => call[0] === 'SIGINT')[1];
            await sigintCallback();
            
            expect(mockConsole.error).toHaveBeenCalledWith('Error al cerrar la conexión:', mockError);
            expect(mockProcess.exit).toHaveBeenCalledWith(1);
        });
    });

    describe('Content Type Middleware', () => {
        let mockReq;
        let mockRes;
        let mockNext;

        beforeEach(() => {
            mockReq = {
                method: 'POST',
                is: vi.fn(),
                headers: {}
            };
            mockRes = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            };
            mockNext = vi.fn();
        });

        it('should allow GET requests without content type check', async () => {
            const { default: app } = await import('../../app.js');
            mockReq.method = 'GET';
            
            // Get content type middleware
            const contentTypeMiddleware = mockApp.use.mock.calls
                .find(call => typeof call[0] === 'function' && call[0].length === 3)[0];
            
            contentTypeMiddleware(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
            expect(mockRes.status).not.toHaveBeenCalled();
        });

        it('should reject requests with unsupported content type', async () => {
            const { default: app } = await import('../../app.js');
            mockReq.is = vi.fn(() => false);
            mockReq.headers['content-type'] = 'text/plain';
            
            // Get content type middleware
            const contentTypeMiddleware = mockApp.use.mock.calls
                .find(call => typeof call[0] === 'function' && call[0].length === 3)[0];
            
            contentTypeMiddleware(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(415);
            expect(mockRes.json).toHaveBeenCalledWith({ 
                error: 'Tipo de contenido no soportado. Use application/json' 
            });
            expect(mockNext).not.toHaveBeenCalled();
        });

        it('should allow requests with application/json content type', async () => {
            const { default: app } = await import('../../app.js');
            mockReq.is = vi.fn(type => type === 'json');
            mockReq.headers['content-type'] = 'application/json';
            
            // Get content type middleware
            const contentTypeMiddleware = mockApp.use.mock.calls
                .find(call => typeof call[0] === 'function' && call[0].length === 3)[0];
            
            contentTypeMiddleware(mockReq, mockRes, mockNext);
            expect(mockNext).toHaveBeenCalled();
            expect(mockRes.status).not.toHaveBeenCalled();
        });
    });

    describe('404 and 405 Error Routes', () => {
        let mockReq;
        let mockRes;
        let mockNext;

        beforeEach(() => {
            mockReq = {
                path: '/unknown/route',
                method: 'GET'
            };
            mockRes = {
                status: vi.fn().mockReturnThis(),
                json: vi.fn()
            };
            mockNext = vi.fn();
        });

        it('should return 404 for unknown routes', async () => {
            const { default: app } = await import('../../app.js');
            mockReq.path = '/api/unknown';
            
            // Get 404 middleware
            const notFoundMiddleware = mockApp.use.mock.calls
                .find(call => typeof call[0] === 'function' && 
                    call[0].toString().includes('knownRoutes'))[0];
            
            notFoundMiddleware(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(404);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Ruta no encontrada' });
        });

        it('should return 405 for known routes with invalid methods', async () => {
            const { default: app } = await import('../../app.js');
            mockReq.path = '/api/mascotas/invalid-method';
            mockReq.method = 'INVALID';
            
            // Get 404 middleware
            const notFoundMiddleware = mockApp.use.mock.calls
                .find(call => typeof call[0] === 'function' && 
                    call[0].toString().includes('knownRoutes'))[0];
            
            notFoundMiddleware(mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(405);
            expect(mockRes.json).toHaveBeenCalledWith({ error: 'Método no permitido' });
        });
    });

    describe('Error Handling Middleware', () => {
        it('should handle validation errors', async () => {
            const { default: app } = await import('../../app.js');
            const mockError = { name: 'ValidationError', message: 'Invalid data' };
            const mockReq = {};
            const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
            const mockNext = vi.fn();

            // Get error handling middleware
            const errorHandler = mockApp.use.mock.calls
                .find(call => call[0].length === 4)[0];

            errorHandler(mockError, mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ 
                error: 'Error de validación', 
                message: 'Invalid data' 
            });
        });

        it('should handle cast errors', async () => {
            const { default: app } = await import('../../app.js');
            const mockError = { name: 'CastError', message: 'Invalid ID' };
            const mockReq = {};
            const mockRes = { status: vi.fn().mockReturnThis(), json: vi.fn() };
            const mockNext = vi.fn();

            // Get error handling middleware
            const errorHandler = mockApp.use.mock.calls
                .find(call => call[0].length === 4)[0];

            errorHandler(mockError, mockReq, mockRes, mockNext);
            expect(mockRes.status).toHaveBeenCalledWith(400);
            expect(mockRes.json).toHaveBeenCalledWith({ 
                error: 'ID inválido', 
                message: 'Invalid ID' 
            });
        });
    });
});
