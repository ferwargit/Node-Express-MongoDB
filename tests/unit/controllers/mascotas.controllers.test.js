import { describe, it, expect, beforeEach, vi } from 'vitest';
import mascotasController from '../../../controllers/mascotas.controllers.js';
import mascotaModel from '../../../models/mascotas.models.js';

// Mock del modelo
vi.mock('../../../models/mascotas.models.js');

describe('Mascotas Controller Test Suite', () => {
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
        };
    });

    describe('create', () => {
        const mascotaData = {
            nombre: 'Firulais',
            tipo: 'perro',
            edad: 5
        };

        it('should create a new mascota successfully', async () => {
            // Arrange
            mockRequest.body = mascotaData;
            mascotaModel.create.mockResolvedValueOnce(mascotaData);

            // Act
            await mascotasController.create(mockRequest, mockResponse);

            // Assert
            expect(mascotaModel.create).toHaveBeenCalledWith(mascotaData);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mascotaData);
        });

        it('should handle errors when creating mascota', async () => {
            // Arrange
            const error = new Error('Error creating mascota');
            mockRequest.body = mascotaData;
            mascotaModel.create.mockRejectedValueOnce(error);

            // Act
            await mascotasController.create(mockRequest, mockResponse);

            // Assert
            expect(mascotaModel.create).toHaveBeenCalledWith(mascotaData);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith(error);
        });
    });

    describe('update', () => {
        const mascotaId = '123';
        const updateData = {
            nombre: 'Firulais Updated',
            edad: 6
        };

        it('should update a mascota successfully', async () => {
            // Arrange
            mockRequest.params = { id: mascotaId };
            mockRequest.body = updateData;
            mascotaModel.update.mockResolvedValueOnce(updateData);

            // Act
            await mascotasController.update(mockRequest, mockResponse);

            // Assert
            expect(mascotaModel.update).toHaveBeenCalledWith(mascotaId, updateData);
            expect(mockResponse.status).toHaveBeenCalledWith(200);
            expect(mockResponse.json).toHaveBeenCalledWith(updateData);
        });

        it('should handle errors when updating mascota', async () => {
            // Arrange
            const error = new Error('Error updating mascota');
            mockRequest.params = { id: mascotaId };
            mockRequest.body = updateData;
            mascotaModel.update.mockRejectedValueOnce(error);

            // Act
            await mascotasController.update(mockRequest, mockResponse);

            // Assert
            expect(mascotaModel.update).toHaveBeenCalledWith(mascotaId, updateData);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith(error);
        });
    });

    describe('delete', () => {
        const mascotaId = '123';

        it('should delete a mascota successfully', async () => {
            // Arrange
            mockRequest.params = { id: mascotaId };
            mascotaModel.delete.mockResolvedValueOnce({ deleted: true });

            // Act
            await mascotasController.delete(mockRequest, mockResponse);

            // Assert
            expect(mascotaModel.delete).toHaveBeenCalledWith(mascotaId);
            expect(mockResponse.status).toHaveBeenCalledWith(206);
            expect(mockResponse.json).toHaveBeenCalledWith({ deleted: true });
        });

        it('should handle errors when deleting mascota', async () => {
            // Arrange
            const error = new Error('Error deleting mascota');
            mockRequest.params = { id: mascotaId };
            mascotaModel.delete.mockRejectedValueOnce(error);

            // Act
            await mascotasController.delete(mockRequest, mockResponse);

            // Assert
            expect(mascotaModel.delete).toHaveBeenCalledWith(mascotaId);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith(error);
        });
    });

    describe('getAll', () => {
        it('should get all mascotas successfully', async () => {
            // Arrange
            const mascotas = [
                { id: '1', nombre: 'Firulais', tipo: 'perro' },
                { id: '2', nombre: 'Michi', tipo: 'gato' }
            ];
            mascotaModel.getAll.mockResolvedValueOnce(mascotas);

            // Act
            await mascotasController.getAll(mockRequest, mockResponse);

            // Assert
            expect(mascotaModel.getAll).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mascotas);
        });

        it('should handle errors when getting all mascotas', async () => {
            // Arrange
            const error = new Error('Error getting mascotas');
            mascotaModel.getAll.mockRejectedValueOnce(error);

            // Act
            await mascotasController.getAll(mockRequest, mockResponse);

            // Assert
            expect(mascotaModel.getAll).toHaveBeenCalled();
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith(error);
        });
    });

    describe('getOne', () => {
        const mascotaId = '123';

        it('should get one mascota successfully', async () => {
            // Arrange
            const mascota = { id: mascotaId, nombre: 'Firulais', tipo: 'perro' };
            mockRequest.params = { id: mascotaId };
            mascotaModel.getOne.mockResolvedValueOnce(mascota);

            // Act
            await mascotasController.getOne(mockRequest, mockResponse);

            // Assert
            expect(mascotaModel.getOne).toHaveBeenCalledWith(mascotaId);
            expect(mockResponse.status).toHaveBeenCalledWith(201);
            expect(mockResponse.json).toHaveBeenCalledWith(mascota);
        });

        it('should handle errors when getting one mascota', async () => {
            // Arrange
            const error = new Error('Error getting mascota');
            mockRequest.params = { id: mascotaId };
            mascotaModel.getOne.mockRejectedValueOnce(error);

            // Act
            await mascotasController.getOne(mockRequest, mockResponse);

            // Assert
            expect(mascotaModel.getOne).toHaveBeenCalledWith(mascotaId);
            expect(mockResponse.status).toHaveBeenCalledWith(500);
            expect(mockResponse.send).toHaveBeenCalledWith(error);
        });
    });
});
