import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import bodyParser from 'body-parser';
import dbClient from '../../config/dbClient.js';

// Mock de módulos
vi.mock('express', () => {
    const app = {
        use: vi.fn(),
        listen: vi.fn((port, cb) => {
            cb();
            return app;
        })
    };
    const express = vi.fn(() => app);
    express.json = vi.fn();
    express.urlencoded = vi.fn();
    return { default: express };
});

vi.mock('body-parser', () => ({
    default: {
        json: vi.fn(),
        urlencoded: vi.fn()
    }
}));

vi.mock('../../config/dbClient.js', () => ({
    default: {
        cerrarConexion: vi.fn()
    }
}));

vi.mock('../../routes/mascotas.routes.js', () => ({
    default: {}
}));

vi.mock('../../routes/usuarios.routes.js', () => ({
    default: {}
}));

describe('App', () => {
    let processEvents = {};
    let mockApp;
    let originalEnv;

    beforeEach(async () => {
        // Guardar variables de entorno originales
        originalEnv = process.env;
        process.env = { ...originalEnv };
        
        // Limpiar todos los mocks
        vi.clearAllMocks();
        
        // Mock process.on
        process.on = vi.fn((event, handler) => {
            processEvents[event] = handler;
        });
        
        // Mock process.exit
        process.exit = vi.fn();
        
        // Mock console.log
        console.log = vi.fn();

        // Importar express para obtener el mockApp
        const { default: express } = await import('express');
        mockApp = express();
    });

    afterEach(() => {
        // Restaurar variables de entorno
        process.env = originalEnv;
        
        vi.resetModules();
        processEvents = {};
    });

    describe('Initialization', () => {
        it('should initialize express application', async () => {
            const { default: express } = await import('express');
            expect(express).toHaveBeenCalled();
        });

        it('should setup body-parser middleware before routes', async () => {
            await import('../../app.js');
            
            // Verificar orden de inicialización
            expect(mockApp.use.mock.calls[0][0]).toBe(bodyParser.json());
            expect(mockApp.use.mock.calls[1][0]).toBe(bodyParser.urlencoded({ extended: true }));
            expect(mockApp.use.mock.calls[2][0]).toBe('/pets');
            expect(mockApp.use.mock.calls[3][0]).toBe('/users');
        });

        it('should configure body-parser with correct options', async () => {
            await import('../../app.js');
            
            expect(bodyParser.urlencoded).toHaveBeenCalledWith({
                extended: true
            });
            expect(bodyParser.json).toHaveBeenCalled();
        });
    });

    describe('Routes Setup', () => {
        it('should setup routes with correct paths', async () => {
            await import('../../app.js');
            expect(mockApp.use).toHaveBeenCalledWith('/pets', expect.any(Object));
            expect(mockApp.use).toHaveBeenCalledWith('/users', expect.any(Object));
        });

        it('should handle middleware errors', async () => {
            const mockError = new Error('Middleware error');
            mockApp.use.mockImplementationOnce(() => {
                throw mockError;
            });
            
            await import('../../app.js');
            expect(console.log).toHaveBeenCalledWith(mockError);
        });
    });

    describe('Server Configuration', () => {
        it('should use PORT from environment variable when available', async () => {
            process.env.PORT = '4000';
            await import('../../app.js');
            expect(mockApp.listen).toHaveBeenCalledWith('4000', expect.any(Function));
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('4000'));
        });

        it('should use default PORT 3000 when environment variable is not set', async () => {
            delete process.env.PORT;
            await import('../../app.js');
            expect(mockApp.listen).toHaveBeenCalledWith(3000, expect.any(Function));
            expect(console.log).toHaveBeenCalledWith(expect.stringContaining('3000'));
        });

        it('should handle server startup errors', async () => {
            const mockError = new Error('Server error');
            mockApp.listen.mockImplementationOnce(() => {
                throw mockError;
            });
            
            await import('../../app.js');
            expect(console.log).toHaveBeenCalledWith(mockError);
        });
    });

    describe('System Signals', () => {
        it('should handle SIGINT signal gracefully', async () => {
            await import('../../app.js');
            await processEvents.SIGINT();
            
            expect(dbClient.cerrarConexion).toHaveBeenCalled();
            expect(process.exit).toHaveBeenCalledWith(0);
        });

        it('should handle database disconnection errors during shutdown', async () => {
            const mockError = new Error('Disconnection error');
            dbClient.cerrarConexion.mockRejectedValueOnce(mockError);
            
            await import('../../app.js');
            await processEvents.SIGINT();
            
            expect(console.log).toHaveBeenCalledWith(mockError);
            expect(process.exit).toHaveBeenCalledWith(1);
        });
    });
});
