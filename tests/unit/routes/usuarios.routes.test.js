import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import usuariosRoutes from '../../../routes/usuarios.routes.js';

// Hoisted mocks
const mockUsuariosController = vi.hoisted(() => ({
    register: vi.fn(),
    login: vi.fn(),
    profile: vi.fn()
}));

const mockVerificarToken = vi.hoisted(() => vi.fn());

// Mock de los módulos
vi.mock('../../../controllers/usuarios.controllers.js', () => ({
    default: mockUsuariosController
}));

vi.mock('../../../helpers/autenticacion.js', () => ({
    verificarToken: mockVerificarToken
}));

describe('Usuarios Routes Test Suite', () => {
    let app;

    beforeEach(() => {
        vi.clearAllMocks();
        app = express();
        app.use(express.json());
        app.use('/api/usuarios', usuariosRoutes);
        
        // Reset default mock implementations
        mockVerificarToken.mockImplementation((req, res, next) => next());
    });

    describe('POST /api/usuarios/register', () => {
        it('should register a new user successfully', async () => {
            const newUser = {
                nombre: 'Juan',
                apellido: 'Pérez',
                email: 'juan@test.com',
                clave: 'Test1234!',
                telefono: '+34600000000'
            };
            const createdUser = { id: 1, ...newUser };
            
            mockUsuariosController.register.mockImplementation((req, res) => {
                res.status(201).json(createdUser);
            });

            const response = await request(app)
                .post('/api/usuarios/register')
                .send(newUser)
                .expect(201);

            expect(response.body).toEqual(createdUser);
            expect(mockUsuariosController.register).toHaveBeenCalled();
        });

        it('should handle validation errors in registration', async () => {
            mockUsuariosController.register.mockImplementation((req, res) => {
                res.status(400).json({ error: 'Datos de usuario inválidos' });
            });

            const response = await request(app)
                .post('/api/usuarios/register')
                .send({})
                .expect(400);

            expect(response.body).toEqual({ error: 'Datos de usuario inválidos' });
        });

        it('should handle duplicate email registration', async () => {
            mockUsuariosController.register.mockImplementation((req, res) => {
                res.status(409).json({ error: 'El email ya está registrado' });
            });

            const response = await request(app)
                .post('/api/usuarios/register')
                .send({
                    email: 'existente@test.com',
                    clave: 'Test1234!'
                })
                .expect(409);

            expect(response.body).toEqual({ error: 'El email ya está registrado' });
        });
    });

    describe('POST /api/usuarios/login', () => {
        it('should login user successfully', async () => {
            const credentials = {
                email: 'juan@test.com',
                clave: 'Test1234!'
            };
            
            mockUsuariosController.login.mockImplementation((req, res) => {
                res.json({
                    token: 'valid-token',
                    user: { id: 1, email: credentials.email }
                });
            });

            const response = await request(app)
                .post('/api/usuarios/login')
                .send(credentials)
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(mockUsuariosController.login).toHaveBeenCalled();
        });

        it('should handle invalid credentials', async () => {
            mockUsuariosController.login.mockImplementation((req, res) => {
                res.status(401).json({ error: 'Credenciales inválidas' });
            });

            const response = await request(app)
                .post('/api/usuarios/login')
                .send({
                    email: 'noexiste@test.com',
                    clave: 'WrongPass123!'
                })
                .expect(401);

            expect(response.body).toEqual({ error: 'Credenciales inválidas' });
        });

        it('should handle missing credentials', async () => {
            mockUsuariosController.login.mockImplementation((req, res) => {
                res.status(400).json({ error: 'Email y clave son requeridos' });
            });

            const response = await request(app)
                .post('/api/usuarios/login')
                .send({})
                .expect(400);

            expect(response.body).toEqual({ error: 'Email y clave son requeridos' });
        });
    });

    describe('GET /api/usuarios/profile', () => {
        it('should return user profile with valid token', async () => {
            const userProfile = {
                id: 1,
                nombre: 'Juan',
                email: 'juan@test.com'
            };
            
            mockUsuariosController.profile.mockImplementation((req, res) => {
                res.json(userProfile);
            });

            const response = await request(app)
                .get('/api/usuarios/profile')
                .set('Authorization', 'Bearer valid-token')
                .expect(200);

            expect(response.body).toEqual(userProfile);
            expect(mockUsuariosController.profile).toHaveBeenCalled();
        });

        it('should reject profile access without token', async () => {
            mockVerificarToken.mockImplementation((req, res, next) => {
                res.status(401).json({ error: 'Token no proporcionado' });
            });

            const response = await request(app)
                .get('/api/usuarios/profile')
                .expect(401);

            expect(response.body).toEqual({ error: 'Token no proporcionado' });
            expect(mockUsuariosController.profile).not.toHaveBeenCalled();
        });

        it('should handle invalid token', async () => {
            mockVerificarToken.mockImplementation((req, res, next) => {
                res.status(401).json({ error: 'Token inválido' });
            });

            const response = await request(app)
                .get('/api/usuarios/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect(401);

            expect(response.body).toEqual({ error: 'Token inválido' });
            expect(mockUsuariosController.profile).not.toHaveBeenCalled();
        });

        it('should handle user not found', async () => {
            mockVerificarToken.mockImplementation((req, res, next) => next());
            mockUsuariosController.profile.mockImplementation((req, res) => {
                res.status(404).json({ error: 'Usuario no encontrado' });
            });

            const response = await request(app)
                .get('/api/usuarios/profile')
                .set('Authorization', 'Bearer valid-token')
                .expect(404);

            expect(response.body).toEqual({ error: 'Usuario no encontrado' });
        });
    });
});
