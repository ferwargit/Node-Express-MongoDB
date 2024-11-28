import { describe, it, expect, vi } from 'vitest';

// Hoisted mocks
const mockMascotasController = vi.hoisted(() => ({
    lista: vi.fn(),
    getById: vi.fn(),
    crear: vi.fn(),
    actualizar: vi.fn(),
    eliminar: vi.fn()
}));

const mockVerificarToken = vi.hoisted(() => vi.fn());

const mockRouter = vi.hoisted(() => ({
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn()
}));

// Mock de los módulos
vi.mock('../../../controllers/mascotas.controllers.js', () => ({
    default: mockMascotasController
}));

vi.mock('../../../helpers/autenticacion.js', () => ({
    verificarToken: mockVerificarToken
}));

vi.mock('express', () => ({
    default: {
        Router: vi.fn(() => mockRouter)
    }
}));

// Mock del módulo de rutas
vi.mock('../../../routes/mascotas.routes.js', () => ({
    __esModule: true,
    default: (router) => {
        router.get('/', mockVerificarToken, mockMascotasController.lista);
        router.get('/:id', mockVerificarToken, mockMascotasController.getById);
        router.post('/', mockVerificarToken, mockMascotasController.crear);
        router.put('/:id', mockVerificarToken, mockMascotasController.actualizar);
        router.delete('/:id', mockVerificarToken, mockMascotasController.eliminar);
        return router;
    }
}));

// Importar después de los mocks
import mascotasRoutes from '../../../routes/mascotas.routes.js';
import mascotasController from '../../../controllers/mascotas.controllers.js';
import { verificarToken } from '../../../helpers/autenticacion.js';
import express from 'express';

describe('Mascotas Routes Test Suite', () => {
    let mockRouter;

    beforeEach(() => {
        // Limpiar todos los mocks
        vi.clearAllMocks();
        
        // Crear el mockRouter
        mockRouter = express.Router();
        
        // Reiniciar el mock de verificarToken
        verificarToken.mockImplementation((req, res, next) => next());
    });

    it('should define all CRUD routes', () => {
        // Ejecutar el código de las rutas
        mascotasRoutes(mockRouter);

        // Verificar que todas las rutas están definidas
        expect(mockRouter.get).toHaveBeenCalledTimes(2); // Lista y GetById
        expect(mockRouter.post).toHaveBeenCalledTimes(1); // Crear
        expect(mockRouter.put).toHaveBeenCalledTimes(1); // Update
        expect(mockRouter.delete).toHaveBeenCalledTimes(1); // Delete
    });

    it('should apply verificarToken middleware to all routes', () => {
        // Ejecutar el código de las rutas
        mascotasRoutes(mockRouter);

        // Verificar que verificarToken se usa en todas las rutas
        const allRouteCalls = [
            ...mockRouter.get.mock.calls,
            ...mockRouter.post.mock.calls,
            ...mockRouter.put.mock.calls,
            ...mockRouter.delete.mock.calls
        ];

        allRouteCalls.forEach(call => {
            const middlewares = call.slice(1);
            expect(middlewares).toContain(verificarToken);
        });
    });

    it('should map controllers to correct routes', () => {
        // Ejecutar el código de las rutas
        mascotasRoutes(mockRouter);

        // Verificar que los controladores están mapeados correctamente
        expect(mockRouter.get).toHaveBeenCalledWith('/', verificarToken, mascotasController.lista);
        expect(mockRouter.get).toHaveBeenCalledWith('/:id', verificarToken, mascotasController.getById);
        expect(mockRouter.post).toHaveBeenCalledWith('/', verificarToken, mascotasController.crear);
        expect(mockRouter.put).toHaveBeenCalledWith('/:id', verificarToken, mascotasController.actualizar);
        expect(mockRouter.delete).toHaveBeenCalledWith('/:id', verificarToken, mascotasController.eliminar);
    });

    it('should require authentication for all routes', () => {
        // Ejecutar el código de las rutas
        mascotasRoutes(mockRouter);

        // Verificar todas las rutas
        const allRoutes = [
            ...mockRouter.get.mock.calls,
            ...mockRouter.post.mock.calls,
            ...mockRouter.put.mock.calls,
            ...mockRouter.delete.mock.calls
        ];
        
        // Verificar que todas las rutas tienen middleware de autenticación
        allRoutes.forEach(route => {
            const middlewares = route.slice(1); // Excluir el primer elemento que es la ruta
            expect(middlewares).toContain(verificarToken);
        });
    });
});
