import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import mongoose from 'mongoose';
import 'dotenv/config';

// Mock mongoose
vi.mock('mongoose', () => ({
    default: {
        connect: vi.fn(),
        disconnect: vi.fn()
    }
}));

// Mock console
const mockConsole = {
    log: vi.fn(),
    error: vi.fn()
};
global.console = mockConsole;

// Import dbClient after mocks
import dbClient from '../../../config/dbClient.js';

describe('dbClient', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    afterEach(() => {
        vi.resetModules();
    });

    describe('conectarBaseDatos', () => {
        it('should connect to database successfully', async () => {
            mongoose.connect.mockResolvedValueOnce();
            
            await dbClient.conectarBaseDatos();

            const expectedUri = `mongodb+srv://${process.env.USER_DB}:${process.env.PASS_DB}@${process.env.SERVER_DB}/adopcion?retryWrites=true&w=majority`;
            expect(mongoose.connect).toHaveBeenCalledWith(expectedUri);
            expect(console.log).toHaveBeenCalledWith('Base de datos conectada con éxito');
        });

        it('should handle connection errors', async () => {
            const error = new Error('Connection failed');
            mongoose.connect.mockRejectedValueOnce(error);

            await expect(dbClient.conectarBaseDatos()).rejects.toThrow('Connection failed');
        });
    });

    describe('cerrarConexion', () => {
        it('should disconnect from database successfully', async () => {
            mongoose.disconnect.mockResolvedValueOnce();

            await dbClient.cerrarConexion();

            expect(mongoose.disconnect).toHaveBeenCalled();
            expect(console.log).toHaveBeenCalledWith('Conexión a la base de datos cerrada');
        });

        it('should handle disconnection errors', async () => {
            const error = new Error('Disconnection failed');
            mongoose.disconnect.mockRejectedValueOnce(error);

            await dbClient.cerrarConexion();

            expect(console.error).toHaveBeenCalledWith('Error al cerrar la base de datos:', error);
        });
    });
});
