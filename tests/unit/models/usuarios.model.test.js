import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { connect, closeDatabase, clearDatabase } from '../../config/test-setup.js';
import usuarioModel from '../../../models/usuarios.models.js';

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
        });

        it('should fail when required field clave is missing', async () => {
            const usuarioSinClave = { ...sampleUsuario, email: createUniqueEmail() };
            delete usuarioSinClave.clave;
            await expect(usuarioModel.create(usuarioSinClave))
                .rejects
                .toThrow('La clave es requerida');
        });

        it('should fail when required field telefono is missing', async () => {
            const usuarioSinTelefono = { ...sampleUsuario, email: createUniqueEmail() };
            delete usuarioSinTelefono.telefono;
            await expect(usuarioModel.create(usuarioSinTelefono))
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

    describe('getOneById', () => {
        it('should return a single usuario by id', async () => {
            const created = await usuarioModel.create({
                ...sampleUsuario,
                email: createUniqueEmail()
            });
            const found = await usuarioModel.getOneById(created._id);
            expect(found._id.toString()).toBe(created._id.toString());
        });
    });

    describe('getOne', () => {
        it('should return a single usuario by filter', async () => {
            const email = createUniqueEmail();
            const created = await usuarioModel.create({ ...sampleUsuario, email });
            const found = await usuarioModel.getOne({ email });
            expect(found._id.toString()).toBe(created._id.toString());
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
    });

    describe('delete', () => {
        it('should delete a usuario successfully', async () => {
            const created = await usuarioModel.create({
                ...sampleUsuario,
                email: createUniqueEmail()
            });
            await usuarioModel.delete(created._id);
            const found = await usuarioModel.getOne({ _id: created._id });
            expect(found).toBeNull();
        });
    });
});
