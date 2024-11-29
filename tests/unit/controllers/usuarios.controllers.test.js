import { describe, it, expect, vi, beforeEach } from 'vitest';
import usuariosController from '../../../controllers/usuarios.controllers.js';
import usuariosModel from '../../../models/usuarios.models.js';
import bcrypt from 'bcrypt';
import { generarToken } from '../../../helpers/autenticacion.js';

// Mock de los módulos
vi.mock('../../../models/usuarios.models.js');
vi.mock('bcrypt');
vi.mock('../../../helpers/autenticacion.js');

describe('Usuarios Controller Test Suite', () => {
    let mockRequest;
    let mockResponse;
    const userData = {
        email: 'test@example.com',
        nombre: 'Test User',
        telefono: '+1234567890',
        clave: 'Test1234!'
    };

    beforeEach(() => {
        mockRequest = {
            body: {},
            emailConectado: null
        };
        mockResponse = {
            status: vi.fn().mockReturnThis(),
            json: vi.fn()
        };
        vi.clearAllMocks();
    });

    describe('registrar', () => {
        it('should register a new user successfully', async () => {
            // Arrange
            mockRequest.body = userData;
            usuariosModel.getByEmail.mockResolvedValueOnce(null);
            bcrypt.hash.mockResolvedValueOnce('hashedPassword');
            const userWithHashedPassword = { ...userData, clave: 'hashedPassword', _id: '123' };
            usuariosModel.create.mockResolvedValueOnce(userWithHashedPassword);

            // Act
            await usuariosController.registrar(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Usuario registrado exitosamente',
                user: {
                    id: '123',
                    email: userData.email,
                    nombre: userData.nombre,
                    rol: undefined
                }
            });
        });

        it('should return error if user already exists', async () => {
            // Arrange
            mockRequest.body = userData;
            usuariosModel.getByEmail.mockResolvedValueOnce(userData);

            // Act
            await usuariosController.registrar(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'El usuario ya existe'
            });
        });

        it('should handle errors during registration', async () => {
            // Arrange
            const error = new Error('Registration error');
            mockRequest.body = userData;
            usuariosModel.getByEmail.mockRejectedValueOnce(error);

            // Act
            await usuariosController.registrar(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Registration error'
            });
        });
    });

    describe('iniciarSesion', () => {
        const loginData = {
            email: 'test@example.com',
            clave: 'Test1234!'
        };

        it('should login user successfully', async () => {
            // Arrange
            mockRequest.body = loginData;
            usuariosModel.getByEmail.mockResolvedValueOnce(userData);
            bcrypt.compare.mockResolvedValueOnce(true);
            generarToken.mockReturnValueOnce('mockToken');

            // Act
            await usuariosController.iniciarSesion(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.json).toHaveBeenCalledWith({
                message: 'Login exitoso',
                user: {
                    id: undefined,
                    email: userData.email,
                    nombre: userData.nombre,
                    rol: undefined
                },
                token: 'mockToken'
            });
        });

        it('should return error if user does not exist', async () => {
            // Arrange
            mockRequest.body = loginData;
            usuariosModel.getByEmail.mockResolvedValueOnce(null);

            // Act
            await usuariosController.iniciarSesion(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Credenciales inválidas'
            });
        });

        it('should return error if password is invalid', async () => {
            // Arrange
            mockRequest.body = loginData;
            usuariosModel.getByEmail.mockResolvedValueOnce(userData);
            bcrypt.compare.mockResolvedValueOnce(false);

            // Act
            await usuariosController.iniciarSesion(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(401);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Credenciales inválidas'
            });
        });

        it('should handle errors during login', async () => {
            // Arrange
            const error = new Error('Login error');
            mockRequest.body = loginData;
            usuariosModel.getByEmail.mockRejectedValueOnce(error);

            // Act
            await usuariosController.iniciarSesion(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Login error'
            });
        });
    });

    describe('perfil', () => {
        const userEmail = 'test@example.com';

        it('should get user profile successfully', async () => {
            // Arrange
            mockRequest.emailConectado = userEmail;
            usuariosModel.getByEmail.mockResolvedValueOnce(userData);

            // Act
            await usuariosController.perfil(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.json).toHaveBeenCalledWith({
                user: {
                    id: undefined,
                    email: userData.email,
                    nombre: userData.nombre,
                    rol: undefined
                }
            });
        });

        it('should handle errors when getting profile', async () => {
            // Arrange
            const error = new Error('Profile error');
            mockRequest.emailConectado = userEmail;
            usuariosModel.getByEmail.mockRejectedValueOnce(error);

            // Act
            await usuariosController.perfil(mockRequest, mockResponse);

            // Assert
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.json).toHaveBeenCalledWith({
                error: 'Profile error'
            });
        });
    });
});
