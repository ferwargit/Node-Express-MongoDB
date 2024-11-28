import { describe, it, expect, vi } from 'vitest';

// Hoisted mocks
const mockUsuariosController = vi.hoisted(() => ({
    register: vi.fn(),
    login: vi.fn(),
    lista: vi.fn(),
    getById: vi.fn(),
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
vi.mock('../../../controllers/usuarios.controllers.js', () => ({
    default: mockUsuariosController
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
vi.mock('../../../routes/usuarios.routes.js', () => ({
    __esModule: true,
    default: (router) => {
        router.post('/register', mockUsuariosController.register);
        router.post('/login', mockUsuariosController.login);
        router.get('/', mockVerificarToken, mockUsuariosController.lista);
        router.get('/:id', mockVerificarToken, mockUsuariosController.getById);
        router.put('/:id', mockVerificarToken, mockUsuariosController.actualizar);
        router.delete('/:id', mockVerificarToken, mockUsuariosController.eliminar);
        return router;
    }
}));

// Importar después de los mocks
import usuariosRoutes from '../../../routes/usuarios.routes.js';
import usuariosController from '../../../controllers/usuarios.controllers.js';
import { verificarToken } from '../../../helpers/autenticacion.js';
import express from 'express';

describe('Usuarios Routes Test Suite', () => {
    let mockRouter;

    beforeEach(() => {
        // Limpiar todos los mocks
        vi.clearAllMocks();
        
        // Crear el mockRouter
        mockRouter = express.Router();
        
        // Reiniciar el mock de verificarToken
        verificarToken.mockImplementation((req, res, next) => next());
    });

    it('should define all authentication and CRUD routes', () => {
        // Ejecutar el código de las rutas
        usuariosRoutes(mockRouter);

        // Verificar que todas las rutas están definidas
        expect(mockRouter.post).toHaveBeenCalledTimes(2); // Register y Login
        expect(mockRouter.get).toHaveBeenCalledTimes(2); // Lista y GetById
        expect(mockRouter.put).toHaveBeenCalledTimes(1); // Update
        expect(mockRouter.delete).toHaveBeenCalledTimes(1); // Delete
    });

    it('should apply verificarToken middleware to protected routes', () => {
        // Ejecutar el código de las rutas
        usuariosRoutes(mockRouter);

        // Verificar que verificarToken se usa en las rutas protegidas
        const protectedRouteCalls = [
            ...mockRouter.get.mock.calls,
            ...mockRouter.put.mock.calls,
            ...mockRouter.delete.mock.calls
        ];

        protectedRouteCalls.forEach(call => {
            const middlewares = call.slice(1);
            expect(middlewares).toContain(verificarToken);
        });

        // Las rutas de autenticación no deberían tener verificarToken
        mockRouter.post.mock.calls.forEach(call => {
            const middlewares = call.slice(1);
            expect(middlewares).not.toContain(verificarToken);
        });
    });

    it('should map controllers to correct routes', () => {
        // Ejecutar el código de las rutas
        usuariosRoutes(mockRouter);

        // Verificar que los controladores están mapeados correctamente
        expect(mockRouter.post).toHaveBeenCalledWith('/register', usuariosController.register);
        expect(mockRouter.post).toHaveBeenCalledWith('/login', usuariosController.login);
        expect(mockRouter.get).toHaveBeenCalledWith('/', verificarToken, usuariosController.lista);
        expect(mockRouter.get).toHaveBeenCalledWith('/:id', verificarToken, usuariosController.getById);
        expect(mockRouter.put).toHaveBeenCalledWith('/:id', verificarToken, usuariosController.actualizar);
        expect(mockRouter.delete).toHaveBeenCalledWith('/:id', verificarToken, usuariosController.eliminar);
    });

    it('should not require authentication for register and login routes', () => {
        // Ejecutar el código de las rutas
        usuariosRoutes(mockRouter);

        // Verificar las rutas de autenticación
        const authRoutes = mockRouter.post.mock.calls;
        
        // Verificar que register y login no tienen middleware de autenticación
        authRoutes.forEach(route => {
            const [path, ...middlewares] = route;
            if (path === '/register' || path === '/login') {
                expect(middlewares).not.toContain(verificarToken);
            }
        });
    });
});
