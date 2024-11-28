import { describe, it, expect, vi, beforeEach } from 'vitest';
import request from 'supertest';
import express from 'express';
import mascotasRoutes from '../../../routes/mascotas.routes.js';

// Hoisted mocks
const mockMascotasController = vi.hoisted(() => ({
    create: vi.fn(),
    getOne: vi.fn(),
    getAll: vi.fn(),
    update: vi.fn(),
    delete: vi.fn()
}));

const mockVerificarToken = vi.hoisted(() => vi.fn());

// Mock de los módulos
vi.mock('../../../controllers/mascotas.controllers.js', () => ({
    default: mockMascotasController
}));

vi.mock('../../../helpers/autenticacion.js', () => ({
    verificarToken: mockVerificarToken
}));

describe('Mascotas Routes Test Suite', () => {
    let app;

    beforeEach(() => {
        vi.clearAllMocks();
        app = express();
        app.use(express.json());
        app.use('/api/mascotas', mascotasRoutes);
        
        // Reset default mock implementations
        mockVerificarToken.mockImplementation((req, res, next) => next());
    });

    describe('GET /api/mascotas', () => {
        it('should return all mascotas', async () => {
            const mockMascotas = [
                { id: 1, nombre: 'Firulais', tipo: 'Perro' },
                { id: 2, nombre: 'Michi', tipo: 'Gato' }
            ];
            mockMascotasController.getAll.mockImplementation((req, res) => {
                res.json(mockMascotas);
            });

            const response = await request(app)
                .get('/api/mascotas')
                .expect(200);

            expect(response.body).toEqual(mockMascotas);
            expect(mockMascotasController.getAll).toHaveBeenCalled();
        });

        it('should handle errors in getAll', async () => {
            mockMascotasController.getAll.mockImplementation((req, res) => {
                res.status(500).json({ error: 'Error interno del servidor' });
            });

            const response = await request(app)
                .get('/api/mascotas')
                .expect(500);

            expect(response.body).toEqual({ error: 'Error interno del servidor' });
        });
    });

    describe('GET /api/mascotas/:id', () => {
        it('should return one mascota by id', async () => {
            const mockMascota = { id: 1, nombre: 'Firulais', tipo: 'Perro' };
            mockMascotasController.getOne.mockImplementation((req, res) => {
                res.json(mockMascota);
            });

            const response = await request(app)
                .get('/api/mascotas/1')
                .expect(200);

            expect(response.body).toEqual(mockMascota);
            expect(mockMascotasController.getOne).toHaveBeenCalled();
        });

        it('should handle mascota not found', async () => {
            mockMascotasController.getOne.mockImplementation((req, res) => {
                res.status(404).json({ error: 'Mascota no encontrada' });
            });

            const response = await request(app)
                .get('/api/mascotas/999')
                .expect(404);

            expect(response.body).toEqual({ error: 'Mascota no encontrada' });
        });
    });

    describe('POST /api/mascotas', () => {
        it('should create a new mascota', async () => {
            const newMascota = { nombre: 'Firulais', tipo: 'Perro' };
            const createdMascota = { id: 1, ...newMascota };
            
            mockMascotasController.create.mockImplementation((req, res) => {
                res.status(201).json(createdMascota);
            });

            const response = await request(app)
                .post('/api/mascotas')
                .send(newMascota)
                .expect(201);

            expect(response.body).toEqual(createdMascota);
            expect(mockMascotasController.create).toHaveBeenCalled();
        });

        it('should handle validation errors in create', async () => {
            mockMascotasController.create.mockImplementation((req, res) => {
                res.status(400).json({ error: 'Datos de mascota inválidos' });
            });

            const response = await request(app)
                .post('/api/mascotas')
                .send({})
                .expect(400);

            expect(response.body).toEqual({ error: 'Datos de mascota inválidos' });
        });
    });

    describe('PUT /api/mascotas/:id', () => {
        it('should update mascota with valid token', async () => {
            const updatedMascota = { id: 1, nombre: 'Firulais Updated', tipo: 'Perro' };
            mockMascotasController.update.mockImplementation((req, res) => {
                res.json(updatedMascota);
            });

            const response = await request(app)
                .put('/api/mascotas/1')
                .set('Authorization', 'Bearer valid-token')
                .send({ nombre: 'Firulais Updated' })
                .expect(200);

            expect(response.body).toEqual(updatedMascota);
            expect(mockMascotasController.update).toHaveBeenCalled();
        });

        it('should reject update without token', async () => {
            mockVerificarToken.mockImplementation((req, res, next) => {
                res.status(401).json({ error: 'Token no proporcionado' });
            });

            const response = await request(app)
                .put('/api/mascotas/1')
                .send({ nombre: 'Firulais Updated' })
                .expect(401);

            expect(response.body).toEqual({ error: 'Token no proporcionado' });
            expect(mockMascotasController.update).not.toHaveBeenCalled();
        });
    });

    describe('DELETE /api/mascotas/:id', () => {
        it('should delete mascota with valid token', async () => {
            mockMascotasController.delete.mockImplementation((req, res) => {
                res.json({ message: 'Mascota eliminada correctamente' });
            });

            const response = await request(app)
                .delete('/api/mascotas/1')
                .set('Authorization', 'Bearer valid-token')
                .expect(200);

            expect(response.body).toEqual({ message: 'Mascota eliminada correctamente' });
            expect(mockMascotasController.delete).toHaveBeenCalled();
        });

        it('should reject deletion without token', async () => {
            mockVerificarToken.mockImplementation((req, res, next) => {
                res.status(401).json({ error: 'Token no proporcionado' });
            });

            const response = await request(app)
                .delete('/api/mascotas/1')
                .expect(401);

            expect(response.body).toEqual({ error: 'Token no proporcionado' });
            expect(mockMascotasController.delete).not.toHaveBeenCalled();
        });

        it('should handle not found in deletion', async () => {
            mockVerificarToken.mockImplementation((req, res, next) => next());
            mockMascotasController.delete.mockImplementation((req, res) => {
                res.status(404).json({ error: 'Mascota no encontrada' });
            });

            const response = await request(app)
                .delete('/api/mascotas/999')
                .set('Authorization', 'Bearer valid-token')
                .expect(404);

            expect(response.body).toEqual({ error: 'Mascota no encontrada' });
        });
    });
});
