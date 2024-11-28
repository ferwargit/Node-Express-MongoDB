import mongoose from 'mongoose';
import { connect, closeDatabase, clearDatabase } from '../../config/test-setup.js';
import Usuario from '../../../schemas/usuarios.schemas.js';

describe('Usuario Schema Test Suite', () => {
    beforeAll(async () => await connect());
    afterEach(async () => await clearDatabase());
    afterAll(async () => await closeDatabase());

    const validUsuarioData = {
        email: 'test@example.com',
        nombre: 'John Doe',
        telefono: '1234567890',
        clave: 'password123'
    };

    describe('Field Validations', () => {
        it('should validate a valid usuario', async () => {
            const validUsuario = new Usuario(validUsuarioData);
            const savedUsuario = await validUsuario.save();
            
            expect(savedUsuario._id).toBeDefined();
            expect(savedUsuario.email).toBe(validUsuarioData.email);
            expect(savedUsuario.nombre).toBe(validUsuarioData.nombre);
            expect(savedUsuario.createdAt).toBeDefined();
            expect(savedUsuario.updatedAt).toBeDefined();
        });

        it('should fail validation when email is missing', async () => {
            const usuarioData = { ...validUsuarioData };
            delete usuarioData.email;
            const usuarioSinEmail = new Usuario(usuarioData);

            await expect(usuarioSinEmail.validate()).rejects.toThrow('Path `email` is required');
        });

        it('should fail validation when nombre is missing', async () => {
            const usuarioData = { ...validUsuarioData };
            delete usuarioData.nombre;
            const usuarioSinNombre = new Usuario(usuarioData);

            await expect(usuarioSinNombre.validate()).rejects.toThrow('Path `nombre` is required');
        });

        it('should fail validation when telefono is missing', async () => {
            const usuarioData = { ...validUsuarioData };
            delete usuarioData.telefono;
            const usuarioSinTelefono = new Usuario(usuarioData);

            await expect(usuarioSinTelefono.validate()).rejects.toThrow('Path `telefono` is required');
        });

        it('should fail validation when clave is missing', async () => {
            const usuarioData = { ...validUsuarioData };
            delete usuarioData.clave;
            const usuarioSinClave = new Usuario(usuarioData);

            await expect(usuarioSinClave.validate()).rejects.toThrow('Path `clave` is required');
        });
    });

    describe('Email Validations', () => {
        it('should trim whitespace from email', async () => {
            const usuarioEmailConEspacios = new Usuario({
                ...validUsuarioData,
                email: '  test@example.com  '
            });

            const savedUsuario = await usuarioEmailConEspacios.save();
            expect(savedUsuario.email).toBe('test@example.com');
        });

        it('should fail when trying to create duplicate email', async () => {
            const usuario1 = new Usuario(validUsuarioData);
            await usuario1.save();

            const usuario2 = new Usuario(validUsuarioData);
            await expect(usuario2.save()).rejects.toThrow();
        });
    });

    describe('Nombre Validations', () => {
        it('should trim whitespace from nombre', async () => {
            const usuarioNombreConEspacios = new Usuario({
                ...validUsuarioData,
                nombre: '  John Doe  '
            });

            const savedUsuario = await usuarioNombreConEspacios.save();
            expect(savedUsuario.nombre).toBe('John Doe');
        });
    });

    describe('Timestamps', () => {
        it('should set createdAt and updatedAt on save', async () => {
            const usuario = new Usuario(validUsuarioData);
            const savedUsuario = await usuario.save();

            expect(savedUsuario.createdAt).toBeDefined();
            expect(savedUsuario.updatedAt).toBeDefined();
            expect(savedUsuario.createdAt instanceof Date).toBeTruthy();
            expect(savedUsuario.updatedAt instanceof Date).toBeTruthy();
        });

        it('should update updatedAt on modification', async () => {
            const usuario = new Usuario(validUsuarioData);
            const savedUsuario = await usuario.save();
            const originalUpdatedAt = savedUsuario.updatedAt;

            // Esperar un momento para asegurar que updatedAt cambie
            await new Promise(resolve => setTimeout(resolve, 100));

            savedUsuario.nombre = 'Jane Doe';
            const updatedUsuario = await savedUsuario.save();

            expect(updatedUsuario.updatedAt.getTime()).toBeGreaterThan(originalUpdatedAt.getTime());
        });
    });
});
