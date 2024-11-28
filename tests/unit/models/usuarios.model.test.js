import mongoose from 'mongoose';
import { connect, closeDatabase, clearDatabase } from '../../config/test-setup.js';
import usuariosModel from '../../../models/usuarios.models.js';

describe('Usuario Model Test Suite', () => {
    beforeAll(async () => await connect());
    afterEach(async () => await clearDatabase());
    afterAll(async () => await closeDatabase());

    const sampleUsuario = {
        email: 'john@example.com',
        nombre: 'John Doe',
        telefono: '1234567890',
        clave: 'password123'
    };

    describe('create', () => {
        it('should create a new usuario successfully', async () => {
            const result = await usuariosModel.create(sampleUsuario);
            expect(result.nombre).toBe(sampleUsuario.nombre);
            expect(result.email).toBe(sampleUsuario.email);
            expect(result.telefono).toBe(sampleUsuario.telefono);
            expect(result._id).toBeDefined();
        });

        it('should fail when required field clave is missing', async () => {
            const invalidUsuario = { ...sampleUsuario };
            delete invalidUsuario.clave;
            
            await expect(usuariosModel.create(invalidUsuario))
                .rejects
                .toThrow('usuarios validation failed');
        });

        it('should fail when required field telefono is missing', async () => {
            const invalidUsuario = { ...sampleUsuario };
            delete invalidUsuario.telefono;
            
            await expect(usuariosModel.create(invalidUsuario))
                .rejects
                .toThrow('usuarios validation failed');
        });

        it('should fail when email is duplicate', async () => {
            await usuariosModel.create(sampleUsuario);
            
            await expect(usuariosModel.create(sampleUsuario))
                .rejects
                .toThrow();
        });
    });

    describe('getAll', () => {
        it('should return all usuarios', async () => {
            await usuariosModel.create(sampleUsuario);
            await usuariosModel.create({...sampleUsuario, email: 'jane@example.com'});
            
            const usuarios = await usuariosModel.getAll();
            expect(usuarios).toHaveLength(2);
            expect(usuarios[0].nombre).toBeDefined();
        });
    });

    describe('getOneById', () => {
        it('should return a single usuario by id', async () => {
            const created = await usuariosModel.create(sampleUsuario);
            const found = await usuariosModel.getOneById(created._id);
            expect(found.email).toBe(sampleUsuario.email);
        });
    });

    describe('getOne', () => {
        it('should return a single usuario by filter', async () => {
            await usuariosModel.create(sampleUsuario);
            const found = await usuariosModel.getOne({ email: sampleUsuario.email });
            expect(found.nombre).toBe(sampleUsuario.nombre);
        });
    });

    describe('update', () => {
        it('should update a usuario successfully', async () => {
            const created = await usuariosModel.create(sampleUsuario);
            const updated = await usuariosModel.update(created._id, { nombre: 'Jane Doe' });
            expect(updated.nombre).toBe('Jane Doe');
        });

        it('should fail when updating to duplicate email', async () => {
            const user1 = await usuariosModel.create(sampleUsuario);
            const user2 = await usuariosModel.create({...sampleUsuario, email: 'jane@example.com'});
            
            await expect(usuariosModel.update(user2._id, { email: sampleUsuario.email }))
                .rejects
                .toThrow();
        });
    });

    describe('delete', () => {
        it('should delete a usuario successfully', async () => {
            const created = await usuariosModel.create(sampleUsuario);
            await usuariosModel.delete(created._id);
            const found = await usuariosModel.getOneById(created._id);
            expect(found).toBeNull();
        });
    });
});
