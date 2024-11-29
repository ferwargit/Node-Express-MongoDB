import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { connect, closeDatabase, clearDatabase } from '../../config/test-setup.js';
import usuarioModel from '../../../models/usuarios.models.js';
import mongoose from 'mongoose';

describe('Usuario Model Test Suite', () => {
    beforeAll(async () => await connect());
    afterEach(async () => await clearDatabase());
    afterAll(async () => await closeDatabase());

    const createUniqueEmail = () => {
        return `test_${Date.now()}_${Math.random().toString(36).substring(2)}@example.com`;
    };

    const sampleUsuario = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: createUniqueEmail(),
        clave: 'Test1234!',
        telefono: '+34600000000',
        rol: 'usuario',
        activo: true
    };

    describe('create', () => {
        it('should create a new usuario successfully', async () => {
            const usuario = await usuarioModel.create({
                ...sampleUsuario,
                email: createUniqueEmail()
            });
            expect(usuario._id).toBeDefined();
            expect(usuario.nombre).toBe(sampleUsuario.nombre);
            expect(usuario.nombreCompleto).toBe(sampleUsuario.nombre);
        });

        it('should fail when required field clave is missing', async () => {
            const usuarioSinClave = { ...sampleUsuario, email: createUniqueEmail() };
            delete usuarioSinClave.clave;
            await expect(usuarioModel.create(usuarioSinClave))
                .rejects
                .toThrow('La clave es requerida');
        });

        it('should fail when clave format is invalid', async () => {
            const usuarioClaveInvalida = { 
                ...sampleUsuario, 
                email: createUniqueEmail(),
                clave: 'simplesimple'  // 11 caracteres, pero sin mayúsculas, números ni caracteres especiales
            };
            await expect(usuarioModel.create(usuarioClaveInvalida))
                .rejects
                .toThrow('La clave debe contener al menos una mayúscula, una minúscula, un número y un caracter especial');
        });

        it('should fail when nombre is too short', async () => {
            const usuarioNombreCorto = { 
                ...sampleUsuario, 
                email: createUniqueEmail(),
                nombre: 'A'  // Menos de 2 caracteres
            };
            await expect(usuarioModel.create(usuarioNombreCorto))
                .rejects
                .toThrow('El nombre debe tener al menos 2 caracteres');
        });

        it('should fail when nombre is too long', async () => {
            const usuarioNombreLargo = { 
                ...sampleUsuario, 
                email: createUniqueEmail(),
                nombre: 'A'.repeat(51)  // Más de 50 caracteres
            };
            await expect(usuarioModel.create(usuarioNombreLargo))
                .rejects
                .toThrow('El nombre no puede exceder 50 caracteres');
        });

        it('should fail when required field telefono is missing', async () => {
            const usuarioSinTelefono = { ...sampleUsuario, email: createUniqueEmail() };
            delete usuarioSinTelefono.telefono;
            await expect(usuarioModel.create(usuarioSinTelefono))
                .rejects
                .toThrow('El teléfono es requerido');
        });

        it('should fail when telefono is null', async () => {
            const usuarioTelefonoNull = { 
                ...sampleUsuario, 
                email: createUniqueEmail(),
                telefono: null
            };
            await expect(usuarioModel.create(usuarioTelefonoNull))
                .rejects
                .toThrow('El teléfono es requerido');
        });

        it('should fail when email is duplicate', async () => {
            const email = createUniqueEmail();
            await usuarioModel.create({ ...sampleUsuario, email });
            await expect(usuarioModel.create({ ...sampleUsuario, email }))
                .rejects
                .toThrow('E11000 duplicate key error');
        });
    });

    describe('esAdmin', () => {
        it('should return true for admin user', async () => {
            const adminUser = await usuarioModel.create({
                ...sampleUsuario,
                email: createUniqueEmail(),
                rol: 'admin'
            });
            expect(adminUser.esAdmin()).toBe(true);
        });

        it('should return false for regular user', async () => {
            const regularUser = await usuarioModel.create({
                ...sampleUsuario,
                email: createUniqueEmail(),
                rol: 'usuario'
            });
            expect(regularUser.esAdmin()).toBe(false);
        });
    });

    describe('getAll', () => {
        it('should return all usuarios', async () => {
            await usuarioModel.create({ ...sampleUsuario, email: createUniqueEmail() });
            await usuarioModel.create({
                ...sampleUsuario,
                email: createUniqueEmail(),
                nombre: 'María'
            });

            const usuarios = await usuarioModel.getAll();
            expect(usuarios).toHaveLength(2);
        });
    });

    describe('getById', () => {
        it('should return a single usuario by id', async () => {
            const created = await usuarioModel.create({
                ...sampleUsuario,
                email: createUniqueEmail()
            });
            const found = await usuarioModel.getById(created._id);
            expect(found._id.toString()).toBe(created._id.toString());
        });

        it('should return null for non-existent ID', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const found = await usuarioModel.getById(nonExistentId);
            expect(found).toBeNull();
        });

        it('should handle invalid ID format', async () => {
            await expect(usuarioModel.getById('invalid-id'))
                .rejects
                .toThrow();
        });
    });

    describe('getByEmail', () => {
        it('should return a single usuario by email', async () => {
            const email = createUniqueEmail();
            const created = await usuarioModel.create({ ...sampleUsuario, email });
            const found = await usuarioModel.getByEmail(email);
            expect(found._id.toString()).toBe(created._id.toString());
        });

        it('should return null for non-existent email', async () => {
            const found = await usuarioModel.getByEmail('nonexistent@example.com');
            expect(found).toBeNull();
        });
    });

    describe('update', () => {
        it('should update a usuario successfully', async () => {
            const created = await usuarioModel.create({
                ...sampleUsuario,
                email: createUniqueEmail()
            });
            const updated = await usuarioModel.update(created._id, { nombre: 'Pedro' });
            expect(updated.nombre).toBe('Pedro');
        });

        it('should fail when updating to duplicate email', async () => {
            const email1 = createUniqueEmail();
            const email2 = createUniqueEmail();
            const usuario1 = await usuarioModel.create({ ...sampleUsuario, email: email1 });
            await usuarioModel.create({ ...sampleUsuario, email: email2 });

            await expect(usuarioModel.update(usuario1._id, { email: email2 }))
                .rejects
                .toThrow('E11000 duplicate key error');
        });

        it('should fail when updating with invalid ID', async () => {
            await expect(usuarioModel.update('invalid-id', { nombre: 'Pedro' }))
                .rejects
                .toThrow();
        });

        it('should fail when updating email with invalid format', async () => {
            const created = await usuarioModel.create({
                ...sampleUsuario,
                email: createUniqueEmail()
            });
            await expect(usuarioModel.update(created._id, { email: 'invalid-email' }))
                .rejects
                .toThrow('Por favor ingrese un email válido');
        });

        it('should fail when updating telefono with invalid format', async () => {
            const created = await usuarioModel.create({
                ...sampleUsuario,
                email: createUniqueEmail(),
                telefono: '+1234567890'  // Teléfono válido inicial
            });
            await expect(usuarioModel.update(created._id, { telefono: '123' }))
                .rejects
                .toThrow('Por favor ingrese un número de teléfono válido');
        });

        it('should fail when updating rol with invalid value', async () => {
            const created = await usuarioModel.create({
                ...sampleUsuario,
                email: createUniqueEmail()
            });
            await expect(usuarioModel.update(created._id, { rol: 'invalid-rol' }))
                .rejects
                .toThrow('invalid-rol no es un rol válido');
        });
    });

    describe('delete', () => {
        it('should delete a usuario successfully', async () => {
            const created = await usuarioModel.create({
                ...sampleUsuario,
                email: createUniqueEmail()
            });
            await usuarioModel.delete(created._id);
            const found = await usuarioModel.getById(created._id);
            expect(found).toBeNull();
        });

        it('should fail when deleting with invalid ID', async () => {
            await expect(usuarioModel.delete('invalid-id'))
                .rejects
                .toThrow();
        });

        it('should return null when deleting non-existent usuario', async () => {
            const nonExistentId = new mongoose.Types.ObjectId();
            const result = await usuarioModel.delete(nonExistentId);
            expect(result).toBeNull();
        });
    });
});
