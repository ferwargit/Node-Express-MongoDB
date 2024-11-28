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

    beforeEach(async () => {
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
        vi.resetModules();
        processEvents = {};
    });

    it('should initialize express application', async () => {
        const { default: express } = await import('express');
        expect(express).toHaveBeenCalled();
    });

    it('should setup body-parser middleware', async () => {
        await import('../../app.js');
        expect(mockApp.use).toHaveBeenCalled();
    });

    it('should setup routes', async () => {
        await import('../../app.js');
        expect(mockApp.use).toHaveBeenCalledWith('/pets', expect.any(Object));
        expect(mockApp.use).toHaveBeenCalledWith('/users', expect.any(Object));
    });

    it('should start server on specified port', async () => {
        const PORT = process.env.PORT || 3000;
        await import('../../app.js');
        expect(console.log).toHaveBeenCalledWith(expect.stringContaining(PORT.toString()));
    });

    it('should handle SIGINT signal', async () => {
        await import('../../app.js');
        // Simular señal SIGINT
        await processEvents.SIGINT();
        
        expect(dbClient.cerrarConexion).toHaveBeenCalled();
        expect(process.exit).toHaveBeenCalledWith(0);
    });

    it('should handle server errors', async () => {
        const mockError = new Error('Server error');
        const { default: express } = await import('express');
        const mockApp = express();
        
        // Simular error en el servidor
        mockApp.listen.mockImplementationOnce(() => {
            throw mockError;
        });
        
        await import('../../app.js');
        expect(console.log).toHaveBeenCalledWith(mockError);
    });
});
