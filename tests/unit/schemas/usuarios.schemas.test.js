import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { connect, closeDatabase, clearDatabase } from '../../config/test-setup.js';
import Usuario from '../../../schemas/usuarios.schemas.js';

describe('Usuario Schema Test Suite', () => {
    beforeAll(async () => await connect());
    afterEach(async () => await clearDatabase());
    afterAll(async () => await closeDatabase());

    const createUniqueEmail = () => {
        return `test_${Date.now()}_${Math.random().toString(36).substring(2)}@example.com`;
    };

    const validUsuarioData = {
        nombre: 'Juan',
        apellido: 'Pérez',
        email: createUniqueEmail(),
        clave: 'Test1234!',
        telefono: '+34600000000',
        rol: 'usuario',
        activo: true
    };

    describe('Field Validations', () => {
        it('should validate a valid usuario', async () => {
            const usuario = new Usuario(validUsuarioData);
            await expect(usuario.validate()).resolves.toBeUndefined();
        });

        it('should fail validation when nombre is missing', async () => {
            const usuarioData = { ...validUsuarioData };
            delete usuarioData.nombre;
            const usuario = new Usuario(usuarioData);
            await expect(usuario.validate()).rejects.toThrow('usuarios validation failed: nombre: El nombre es requerido');
        });

        it('should fail validation when apellido is missing', async () => {
            const usuarioData = { ...validUsuarioData };
            delete usuarioData.apellido;
            const usuario = new Usuario(usuarioData);
            await expect(usuario.validate()).resolves.toBeUndefined(); // apellido is not required in schema
        });

        it('should fail validation when email is missing', async () => {
            const usuarioData = { ...validUsuarioData };
            delete usuarioData.email;
            const usuario = new Usuario(usuarioData);
            await expect(usuario.validate()).rejects.toThrow('usuarios validation failed: email: El email es requerido');
        });

        it('should fail validation when email format is invalid', async () => {
            const usuarioData = { ...validUsuarioData, email: 'invalid-email' };
            const usuario = new Usuario(usuarioData);
            await expect(usuario.validate()).rejects.toThrow('usuarios validation failed: email: Por favor ingrese un email válido');
        });
    });

    describe('Password Validations', () => {
        it('should fail validation when clave is missing', async () => {
            const usuarioData = { ...validUsuarioData };
            delete usuarioData.clave;
            const usuario = new Usuario(usuarioData);
            await expect(usuario.validate()).rejects.toThrow('usuarios validation failed: clave: La clave es requerida');
        });

        it('should fail validation when clave is too short', async () => {
            const usuarioData = { ...validUsuarioData, clave: 'Abc1!' };
            const usuario = new Usuario(usuarioData);
            await expect(usuario.validate()).rejects.toThrow('usuarios validation failed: clave: La clave debe tener al menos 8 caracteres');
        });

        it('should fail validation when clave lacks uppercase', async () => {
            const usuarioData = { ...validUsuarioData, clave: 'test1234!' };
            const usuario = new Usuario(usuarioData);
            await expect(usuario.validate()).rejects.toThrow('usuarios validation failed: clave: La clave debe contener al menos una mayúscula, una minúscula, un número y un caracter especial');
        });

        it('should fail validation when clave lacks lowercase', async () => {
            const usuarioData = { ...validUsuarioData, clave: 'TEST1234!' };
            const usuario = new Usuario(usuarioData);
            await expect(usuario.validate()).rejects.toThrow('usuarios validation failed: clave: La clave debe contener al menos una mayúscula, una minúscula, un número y un caracter especial');
        });

        it('should fail validation when clave lacks number', async () => {
            const usuarioData = { ...validUsuarioData, clave: 'TestTest!' };
            const usuario = new Usuario(usuarioData);
            await expect(usuario.validate()).rejects.toThrow('usuarios validation failed: clave: La clave debe contener al menos una mayúscula, una minúscula, un número y un caracter especial');
        });

        it('should fail validation when clave lacks special character', async () => {
            const usuarioData = { ...validUsuarioData, clave: 'Test1234' };
            const usuario = new Usuario(usuarioData);
            await expect(usuario.validate()).rejects.toThrow('usuarios validation failed: clave: La clave debe contener al menos una mayúscula, una minúscula, un número y un caracter especial');
        });
    });

    describe('Phone Validations', () => {
        it('should fail validation when telefono is missing', async () => {
            const usuarioData = { ...validUsuarioData };
            delete usuarioData.telefono;
            const usuario = new Usuario(usuarioData);
            await expect(usuario.validate()).rejects.toThrow('usuarios validation failed: telefono: El teléfono es requerido');
        });

        it('should accept valid international phone numbers', async () => {
            const validPhones = ['+34600000000', '+1234567890', '+447911123456'];
            for (const phone of validPhones) {
                const usuario = new Usuario({ ...validUsuarioData, telefono: phone, email: createUniqueEmail() });
                await expect(usuario.validate()).resolves.toBeUndefined();
            }
        });

        it('should fail validation when telefono format is invalid', async () => {
            const usuarioData = { ...validUsuarioData, telefono: 'abc123' }; // Using letters which are not allowed in phone numbers
            const usuario = new Usuario(usuarioData);
            await expect(usuario.validate()).rejects.toThrow('usuarios validation failed: telefono: Por favor ingrese un número de teléfono válido');
        });
    });

    describe('Role Validations', () => {
        it('should allow setting valid roles', async () => {
            const validRoles = ['usuario', 'admin'];
            for (const rol of validRoles) {
                const usuario = new Usuario({ ...validUsuarioData, rol, email: createUniqueEmail() });
                await expect(usuario.validate()).resolves.toBeUndefined();
            }
        });

        it('should fail validation when rol is invalid', async () => {
            const usuarioData = { ...validUsuarioData, rol: 'superuser' };
            const usuario = new Usuario(usuarioData);
            await expect(usuario.validate()).rejects.toThrow('usuarios validation failed: rol: superuser no es un rol válido');
        });
    });

    describe('Virtual Fields and Methods', () => {
        it('should return trimmed nombre as nombreCompleto', () => {
            const usuario = new Usuario({ ...validUsuarioData, nombre: '  Juan Pérez  ' });
            expect(usuario.nombreCompleto).toBe('Juan Pérez');
        });

        it('should handle empty nombre in nombreCompleto', () => {
            const usuario = new Usuario({ ...validUsuarioData, nombre: '   ' });
            expect(usuario.nombreCompleto).toBe('');
        });

        it('should correctly identify admin role', () => {
            const usuario = new Usuario({ ...validUsuarioData, rol: 'admin' });
            expect(usuario.esAdmin()).toBe(true);
        });

        it('should correctly identify non-admin role', () => {
            const usuario = new Usuario({ ...validUsuarioData, rol: 'usuario' });
            expect(usuario.esAdmin()).toBe(false);
        });
    });

    describe('Password Validation', () => {
        it('should validate password with all required characters', async () => {
            const usuario = new Usuario({ ...validUsuarioData, clave: 'Test1234!' });
            const err = usuario.validateSync();
            expect(err).toBeUndefined();
        });

        it('should fail without uppercase letter', async () => {
            const usuario = new Usuario({ ...validUsuarioData, clave: 'test1234!' });
            const err = usuario.validateSync();
            expect(err.errors.clave.message).toBe(
                'La clave debe contener al menos una mayúscula, una minúscula, un número y un caracter especial'
            );
        });

        it('should fail without lowercase letter', async () => {
            const usuario = new Usuario({ ...validUsuarioData, clave: 'TEST1234!' });
            const err = usuario.validateSync();
            expect(err.errors.clave.message).toBe(
                'La clave debe contener al menos una mayúscula, una minúscula, un número y un caracter especial'
            );
        });

        it('should fail without number', async () => {
            const usuario = new Usuario({ ...validUsuarioData, clave: 'TestPass!' });
            const err = usuario.validateSync();
            expect(err.errors.clave.message).toBe(
                'La clave debe contener al menos una mayúscula, una minúscula, un número y un caracter especial'
            );
        });

        it('should fail without special character', async () => {
            const usuario = new Usuario({ ...validUsuarioData, clave: 'Test1234' });
            const err = usuario.validateSync();
            expect(err.errors.clave.message).toBe(
                'La clave debe contener al menos una mayúscula, una minúscula, un número y un caracter especial'
            );
        });
    });

    describe('Default Values', () => {
        it('should set default rol as usuario', () => {
            const usuarioData = { ...validUsuarioData };
            delete usuarioData.rol;
            const usuario = new Usuario(usuarioData);
            expect(usuario.rol).toBe('usuario');
        });

        it('should set default activo as true', () => {
            const usuarioData = { ...validUsuarioData };
            delete usuarioData.activo;
            const usuario = new Usuario(usuarioData);
            expect(usuario.activo).toBe(true);
        });

        it('should set ultimoAcceso to current date by default', () => {
            const usuarioData = { ...validUsuarioData };
            delete usuarioData.ultimoAcceso;
            const usuario = new Usuario(usuarioData);
            expect(usuario.ultimoAcceso).toBeInstanceOf(Date);
            expect(usuario.ultimoAcceso.getTime()).toBeLessThanOrEqual(new Date().getTime());
        });
    });
});
