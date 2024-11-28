import { describe, it, expect, beforeEach, vi } from 'vitest';
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
    let responseObject;

    beforeEach(() => {
        // Reset de los mocks antes de cada test
        vi.clearAllMocks();

        // Mock del objeto response
        responseObject = {
            json: vi.fn().mockReturnThis(),
            status: vi.fn().mockReturnThis(),
            send: vi.fn().mockReturnThis(),
        };
        mockResponse = responseObject;

        // Mock del objeto request
        mockRequest = {
            body: {},
            params: {},
            emailConectado: 'test@example.com'
        };
    });

    describe('register', () => {
        const userData = {
            email: 'test@example.com',
            nombre: 'Test User',
            telefono: '1234567890',
            clave: 'password123'
        };

        it('should register a new user successfully', async () => {
            // Arrange
            mockRequest.body = userData;
            usuariosModel.getOne.mockResolvedValueOnce(null);
            bcrypt.hash.mockResolvedValueOnce('hashedPassword');
            const userWithHashedPassword = { ...userData, clave: 'hashedPassword' };
            usuariosModel.create.mockResolvedValueOnce(userWithHashedPassword);

            // Act
            await usuariosController.register(mockRequest, mockResponse);

            // Assert
            expect(usuariosModel.getOne).toHaveBeenCalledWith({ email: userData.email });
            expect(bcrypt.hash).toHaveBeenCalledWith(userData.clave, 10);
            expect(usuariosModel.create).toHaveBeenCalledWith(userWithHashedPassword);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(userWithHashedPassword);
        });

        it('should return error if user already exists', async () => {
            // Arrange
            mockRequest.body = userData;
            usuariosModel.getOne.mockResolvedValueOnce(userData);

            // Act
            await usuariosController.register(mockRequest, mockResponse);

            // Assert
            expect(usuariosModel.getOne).toHaveBeenCalledWith({ email: userData.email });
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: "El usuario ya existe." });
            expect(usuariosModel.create).not.toHaveBeenCalled();
        });

        it('should handle errors during registration', async () => {
            // Arrange
            const error = new Error('Registration error');
            mockRequest.body = userData;
            usuariosModel.getOne.mockRejectedValueOnce(error);

            // Act
            await usuariosController.register(mockRequest, mockResponse);

            // Assert
            expect(usuariosModel.getOne).toHaveBeenCalledWith({ email: userData.email });
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith(error);
        });
    });

    describe('login', () => {
        const loginData = {
            email: 'test@example.com',
            clave: 'password123'
        };

        const userData = {
            ...loginData,
            clave: 'hashedPassword'
        };

        it('should login user successfully', async () => {
            // Arrange
            mockRequest.body = loginData;
            usuariosModel.getOne.mockResolvedValueOnce(userData);
            bcrypt.compare.mockResolvedValueOnce(true);
            generarToken.mockReturnValueOnce('mockToken');

            // Act
            await usuariosController.login(mockRequest, mockResponse);

            // Assert
            expect(usuariosModel.getOne).toHaveBeenCalledWith({ email: loginData.email });
            expect(bcrypt.compare).toHaveBeenCalledWith(loginData.clave, userData.clave);
            expect(generarToken).toHaveBeenCalledWith(loginData.email);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith({
                msg: 'Usuario autenticado',
                token: 'mockToken'
            });
        });

        it('should return error if user does not exist', async () => {
            // Arrange
            mockRequest.body = loginData;
            usuariosModel.getOne.mockResolvedValueOnce(null);

            // Act
            await usuariosController.login(mockRequest, mockResponse);

            // Assert
            expect(usuariosModel.getOne).toHaveBeenCalledWith({ email: loginData.email });
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: "El usuario NO existe." });
            expect(bcrypt.compare).not.toHaveBeenCalled();
        });

        it('should return error if password is invalid', async () => {
            // Arrange
            mockRequest.body = loginData;
            usuariosModel.getOne.mockResolvedValueOnce(userData);
            bcrypt.compare.mockResolvedValueOnce(false);

            // Act
            await usuariosController.login(mockRequest, mockResponse);

            // Assert
            expect(usuariosModel.getOne).toHaveBeenCalledWith({ email: loginData.email });
            expect(bcrypt.compare).toHaveBeenCalledWith(loginData.clave, userData.clave);
            expect(mockResponse.status).toHaveBeenCalledWith(400);
            expect(mockResponse.json).toHaveBeenCalledWith({ error: "Clave NO válida." });
            expect(generarToken).not.toHaveBeenCalled();
        });

        it('should handle errors during login', async () => {
            // Arrange
            const error = new Error('Login error');
            mockRequest.body = loginData;
            usuariosModel.getOne.mockRejectedValueOnce(error);

            // Act
            await usuariosController.login(mockRequest, mockResponse);

            // Assert
            expect(usuariosModel.getOne).toHaveBeenCalledWith({ email: loginData.email });
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith(error);
        });
    });

    describe('profile', () => {
        const userEmail = 'test@example.com';
        const userData = {
            email: userEmail,
            nombre: 'Test User',
            telefono: '1234567890'
        };

        it('should get user profile successfully', async () => {
            // Arrange
            mockRequest.emailConectado = userEmail;
            usuariosModel.getOne.mockResolvedValueOnce(userData);

            // Act
            await usuariosController.profile(mockRequest, mockResponse);

            // Assert
            expect(usuariosModel.getOne).toHaveBeenCalledWith({ email: userEmail });
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(userData);
        });

        it('should handle errors when getting profile', async () => {
            // Arrange
            const error = new Error('Profile error');
            mockRequest.emailConectado = userEmail;
            usuariosModel.getOne.mockRejectedValueOnce(error);

            // Act
            await usuariosController.profile(mockRequest, mockResponse);

            // Assert
            expect(usuariosModel.getOne).toHaveBeenCalledWith({ email: userEmail });
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith(error);
        });
    });
});
