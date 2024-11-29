import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import usuariosRoutes from '../../../routes/usuarios.routes.js';

// Hoisted mocks
const mockUsuariosController = vi.hoisted(() => ({
    registrar: vi.fn(),
    iniciarSesion: vi.fn(),
    perfil: vi.fn()
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
        
        // Middleware para verificar Content-Type
        app.use((req, res, next) => {
            if (req.method === 'GET' || req.method === 'DELETE') {
                return next();
            }
            if (!req.is('json') && req.headers['content-type'] !== 'application/x-www-form-urlencoded') {
                return res.status(415).json({ error: 'Tipo de contenido no soportado' });
            }
            next();
        });

        // Configurar rutas de usuarios
        app.use('/api/usuarios', usuariosRoutes);
        
        // Manejo de rutas no encontradas
        app.use((req, res) => {
            res.status(404).json({ error: 'Ruta no encontrada' });
        });
        
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
            
            mockUsuariosController.registrar.mockImplementation((req, res) => {
                res.status(201).json(createdUser);
            });

            const response = await request(app)
                .post('/api/usuarios/register')
                .send(newUser)
                .expect('Content-Type', /json/)
                .expect(201);

            expect(response.body).toEqual(createdUser);
            expect(mockUsuariosController.registrar).toHaveBeenCalled();
        });

        it('should handle validation errors in registration', async () => {
            mockUsuariosController.registrar.mockImplementation((req, res) => {
                res.status(400).json({ error: 'Datos de usuario inválidos' });
            });

            const response = await request(app)
                .post('/api/usuarios/register')
                .send({})
                .expect('Content-Type', /json/)
                .expect(400);

            expect(response.body).toEqual({ error: 'Datos de usuario inválidos' });
        });

        it('should handle duplicate email registration', async () => {
            mockUsuariosController.registrar.mockImplementation((req, res) => {
                res.status(409).json({ error: 'El email ya está registrado' });
            });

            const response = await request(app)
                .post('/api/usuarios/register')
                .send({
                    email: 'existente@test.com',
                    clave: 'Test1234!'
                })
                .expect('Content-Type', /json/)
                .expect(409);

            expect(response.body).toEqual({ error: 'El email ya está registrado' });
        });

        it('should handle server errors in registration', async () => {
            mockUsuariosController.registrar.mockImplementation((req, res) => {
                res.status(500).json({ error: 'Error interno del servidor' });
            });

            const response = await request(app)
                .post('/api/usuarios/register')
                .send({
                    email: 'test@test.com',
                    clave: 'Test1234!'
                })
                .expect('Content-Type', /json/)
                .expect(500);

            expect(response.body).toEqual({ error: 'Error interno del servidor' });
        });

        it('should reject non-JSON content type', async () => {
            const response = await request(app)
                .post('/api/usuarios/register')
                .set('Content-Type', 'text/plain')
                .send('nombre=Juan&email=juan@test.com')
                .expect('Content-Type', /json/)
                .expect(415);

            expect(response.body).toEqual({ error: 'Tipo de contenido no soportado' });
        });
    });

    describe('POST /api/usuarios/login', () => {
        it('should login user successfully', async () => {
            const credentials = {
                email: 'juan@test.com',
                clave: 'Test1234!'
            };
            
            mockUsuariosController.iniciarSesion.mockImplementation((req, res) => {
                res.json({
                    token: 'valid-token',
                    user: { id: 1, email: credentials.email }
                });
            });

            const response = await request(app)
                .post('/api/usuarios/login')
                .send(credentials)
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toHaveProperty('token');
            expect(response.body).toHaveProperty('user');
            expect(mockUsuariosController.iniciarSesion).toHaveBeenCalled();
        });

        it('should handle invalid credentials', async () => {
            mockUsuariosController.iniciarSesion.mockImplementation((req, res) => {
                res.status(401).json({ error: 'Credenciales inválidas' });
            });

            const response = await request(app)
                .post('/api/usuarios/login')
                .send({
                    email: 'noexiste@test.com',
                    clave: 'WrongPass123!'
                })
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body).toEqual({ error: 'Credenciales inválidas' });
        });

        it('should handle missing credentials', async () => {
            mockUsuariosController.iniciarSesion.mockImplementation((req, res) => {
                res.status(400).json({ error: 'Email y clave son requeridos' });
            });

            const response = await request(app)
                .post('/api/usuarios/login')
                .send({})
                .expect('Content-Type', /json/)
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
            
            mockUsuariosController.perfil.mockImplementation((req, res) => {
                res.json(userProfile);
            });

            const response = await request(app)
                .get('/api/usuarios/profile')
                .set('Authorization', 'Bearer valid-token')
                .expect('Content-Type', /json/)
                .expect(200);

            expect(response.body).toEqual(userProfile);
            expect(mockUsuariosController.perfil).toHaveBeenCalled();
        });

        it('should reject profile access without token', async () => {
            mockVerificarToken.mockImplementation((req, res) => {
                res.status(401).json({ error: 'Token no proporcionado' });
            });

            const response = await request(app)
                .get('/api/usuarios/profile')
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body).toEqual({ error: 'Token no proporcionado' });
            expect(mockUsuariosController.perfil).not.toHaveBeenCalled();
        });

        it('should handle invalid token', async () => {
            mockVerificarToken.mockImplementation((req, res) => {
                res.status(401).json({ error: 'Token inválido' });
            });

            const response = await request(app)
                .get('/api/usuarios/profile')
                .set('Authorization', 'Bearer invalid-token')
                .expect('Content-Type', /json/)
                .expect(401);

            expect(response.body).toEqual({ error: 'Token inválido' });
            expect(mockUsuariosController.perfil).not.toHaveBeenCalled();
        });

        it('should handle user not found', async () => {
            mockVerificarToken.mockImplementation((req, res, next) => next());
            mockUsuariosController.perfil.mockImplementation((req, res) => {
                res.status(404).json({ error: 'Usuario no encontrado' });
            });

            const response = await request(app)
                .get('/api/usuarios/profile')
                .set('Authorization', 'Bearer valid-token')
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body).toEqual({ error: 'Usuario no encontrado' });
        });
    });

    describe('HTTP Method Handling', () => {
        it('should reject PUT request to register endpoint', async () => {
            const response = await request(app)
                .put('/api/usuarios/register')
                .send({})
                .expect('Content-Type', /json/)
                .expect(405);

            expect(response.body).toEqual({ error: 'Método no permitido' });
        });

        it('should reject DELETE request to login endpoint', async () => {
            const response = await request(app)
                .delete('/api/usuarios/login')
                .expect('Content-Type', /json/)
                .expect(405);

            expect(response.body).toEqual({ error: 'Método no permitido' });
        });
    });

    describe('Non-existent Routes', () => {
        it('should handle non-existent route', async () => {
            const response = await request(app)
                .get('/api/usuarios/nonexistent')
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body).toEqual({ error: 'Ruta no encontrada' });
        });

        it('should handle completely unknown route', async () => {
            const response = await request(app)
                .get('/unknown/route')
                .expect('Content-Type', /json/)
                .expect(404);

            expect(response.body).toEqual({ error: 'Ruta no encontrada' });
        });
    });
});
