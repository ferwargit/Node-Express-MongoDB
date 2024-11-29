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
        telefono: '011 1234 5678',
        rol: 'usuario',
        activo: true
    };

    describe('Field Validations', () => {
        it('should validate a valid usuario', async () => {
            const usuario = new Usuario({ 
                ...validUsuarioData, 
                email: createUniqueEmail() 
            });
            await expect(usuario.validate()).resolves.toBeUndefined();
        });

        it('should fail validation when nombre is missing', async () => {
            const usuario = new Usuario({ 
                ...validUsuarioData, 
                nombre: undefined, 
                email: createUniqueEmail() 
            });
            await expect(usuario.validate())
                .rejects
                .toThrow('usuarios validation failed: nombre: El nombre es requerido');
        });

        it('should fail validation when nombre is too short', async () => {
            const usuario = new Usuario({ 
                ...validUsuarioData, 
                nombre: 'A', 
                email: createUniqueEmail() 
            });
            await expect(usuario.validate())
                .rejects
                .toThrow('usuarios validation failed: nombre: El nombre debe tener al menos 3 caracteres');
        });

        it('should fail validation when nombre is too long', async () => {
            const usuario = new Usuario({ 
                ...validUsuarioData, 
                nombre: 'A'.repeat(51), 
                email: createUniqueEmail() 
            });
            await expect(usuario.validate())
                .rejects
                .toThrow('usuarios validation failed: nombre: El nombre no puede tener más de 50 caracteres');
        });

        it('should fail validation when apellido is missing', async () => {
            const usuario = new Usuario({ 
                ...validUsuarioData, 
                apellido: undefined, 
                email: createUniqueEmail() 
            });
            await expect(usuario.validate())
                .rejects
                .toThrow('usuarios validation failed: apellido: El apellido es requerido');
        });

        it('should fail validation when email is missing', async () => {
            const usuario = new Usuario({ 
                ...validUsuarioData, 
                email: undefined 
            });
            await expect(usuario.validate())
                .rejects
                .toThrow('usuarios validation failed: email: El email es requerido');
        });

        it('should fail validation when email format is invalid', async () => {
            const usuario = new Usuario({ 
                ...validUsuarioData, 
                email: 'invalid-email' 
            });
            await expect(usuario.validate())
                .rejects
                .toThrow('usuarios validation failed: email: Por favor ingrese un email válido');
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
            await expect(usuario.validate()).rejects.toThrow('usuarios validation failed: clave: La clave debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
        });

        it('should fail validation when clave lacks uppercase', async () => {
            const usuarioData = { ...validUsuarioData, clave: 'test1234!' };
            const usuario = new Usuario(usuarioData);
            await expect(usuario.validate()).rejects.toThrow('usuarios validation failed: clave: La clave debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
        });

        it('should fail validation when clave lacks lowercase', async () => {
            const usuarioData = { ...validUsuarioData, clave: 'TEST1234!' };
            const usuario = new Usuario(usuarioData);
            await expect(usuario.validate()).rejects.toThrow('usuarios validation failed: clave: La clave debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
        });

        it('should fail validation when clave lacks number', async () => {
            const usuarioData = { ...validUsuarioData, clave: 'TestTest!' };
            const usuario = new Usuario(usuarioData);
            await expect(usuario.validate()).rejects.toThrow('usuarios validation failed: clave: La clave debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
        });

        it('should fail validation when clave lacks special character', async () => {
            const usuarioData = { ...validUsuarioData, clave: 'Test1234' };
            const usuario = new Usuario(usuarioData);
            await expect(usuario.validate()).rejects.toThrow('usuarios validation failed: clave: La clave debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
        });
    });

    describe('Phone Validations', () => {
        it('should accept valid phone numbers with different formats', async () => {
            const validPhones = [
                '011 1234 5678',    // formato estándar con espacios
                '011-1234-5678',    // formato con guiones
                '01112345678',      // formato sin separadores
                '11 1234 5678',     // formato corto con espacios
                '11-1234-5678',     // formato corto con guiones
                '1112345678'        // formato corto sin separadores
            ];

            for (const phone of validPhones) {
                console.log(`\nProbando teléfono válido: "${phone}"`);
                const usuario = new Usuario({ 
                    ...validUsuarioData, 
                    telefono: phone, 
                    email: createUniqueEmail() 
                });
                await expect(usuario.validate()).resolves.toBeUndefined();
            }
        });

        it('should handle edge cases and special values', async () => {
            const edgeCases = [
                { value: '', expectedError: 'usuarios validation failed: telefono: El teléfono es requerido' },
                { value: '   ', expectedError: 'usuarios validation failed: telefono: El teléfono es requerido' },
                { value: null, expectedError: 'usuarios validation failed: telefono: El teléfono es requerido' },
                { value: undefined, expectedError: 'usuarios validation failed: telefono: El teléfono es requerido' }
            ];

            for (const { value, expectedError } of edgeCases) {
                console.log(`\nProbando caso borde: "${value}"`);
                const usuario = new Usuario({ 
                    ...validUsuarioData, 
                    telefono: value, 
                    email: createUniqueEmail() 
                });
                
                await expect(usuario.validate())
                    .rejects
                    .toThrow(expectedError);
            }
        });

        it('should reject phone numbers with invalid formats', async () => {
            const invalidFormats = [
                { value: '1234567890', expectedError: 'usuarios validation failed: telefono: Por favor ingrese un número de teléfono válido (ej: 011 1234 5678)' },
                { value: '01112 34 56 78', expectedError: 'usuarios validation failed: telefono: Por favor ingrese un número de teléfono válido (ej: 011 1234 5678)' },
                { value: '011 123 45678', expectedError: 'usuarios validation failed: telefono: Por favor ingrese un número de teléfono válido (ej: 011 1234 5678)' },
                { value: '011.1234.5678', expectedError: 'usuarios validation failed: telefono: Por favor ingrese un número de teléfono válido (ej: 011 1234 5678)' },
                { value: '011_1234_5678', expectedError: 'usuarios validation failed: telefono: Por favor ingrese un número de teléfono válido (ej: 011 1234 5678)' },
                { value: '+54 11 1234 5678', expectedError: 'usuarios validation failed: telefono: Por favor ingrese un número de teléfono válido (ej: 011 1234 5678)' },
                { value: '(011) 1234-5678', expectedError: 'usuarios validation failed: telefono: Por favor ingrese un número de teléfono válido (ej: 011 1234 5678)' }
            ];

            for (const { value, expectedError } of invalidFormats) {
                console.log(`\nProbando formato inválido: "${value}"`);
                const usuario = new Usuario({ 
                    ...validUsuarioData, 
                    telefono: value, 
                    email: createUniqueEmail() 
                });
                
                await expect(usuario.validate())
                    .rejects
                    .toThrow(expectedError);
            }
        });

        it('should reject phone numbers with invalid lengths', async () => {
            const invalidLengths = [
                { value: '011123', expectedError: 'usuarios validation failed: telefono: Por favor ingrese un número de teléfono válido (ej: 011 1234 5678)' },
                { value: '0111234', expectedError: 'usuarios validation failed: telefono: Por favor ingrese un número de teléfono válido (ej: 011 1234 5678)' },
                { value: '011123456789', expectedError: 'usuarios validation failed: telefono: Por favor ingrese un número de teléfono válido (ej: 011 1234 5678)' },
                { value: '11123', expectedError: 'usuarios validation failed: telefono: Por favor ingrese un número de teléfono válido (ej: 011 1234 5678)' },
                { value: '111234567890', expectedError: 'usuarios validation failed: telefono: Por favor ingrese un número de teléfono válido (ej: 011 1234 5678)' }
            ];

            for (const { value, expectedError } of invalidLengths) {
                console.log(`\nProbando longitud inválida: "${value}"`);
                const usuario = new Usuario({ 
                    ...validUsuarioData, 
                    telefono: value, 
                    email: createUniqueEmail() 
                });
                
                await expect(usuario.validate())
                    .rejects
                    .toThrow(expectedError);
            }
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
            const usuario = new Usuario({ 
                ...validUsuarioData, 
                rol: 'super-admin', 
                email: createUniqueEmail() 
            });
            
            await expect(usuario.validate())
                .rejects
                .toThrow('usuarios validation failed: rol: El rol debe ser admin o usuario');
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
            const usuario = new Usuario({ 
                ...validUsuarioData, 
                clave: 'Test1234!', 
                email: createUniqueEmail() 
            });
            await expect(usuario.validate()).resolves.toBeUndefined();
        });

        it('should fail without uppercase letter', async () => {
            const usuario = new Usuario({ 
                ...validUsuarioData, 
                clave: 'test1234!', 
                email: createUniqueEmail() 
            });
            await expect(usuario.validate())
                .rejects
                .toThrow('usuarios validation failed: clave: La clave debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
        });

        it('should fail without lowercase letter', async () => {
            const usuario = new Usuario({ 
                ...validUsuarioData, 
                clave: 'TEST1234!', 
                email: createUniqueEmail() 
            });
            await expect(usuario.validate())
                .rejects
                .toThrow('usuarios validation failed: clave: La clave debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
        });

        it('should fail without number', async () => {
            const usuario = new Usuario({ 
                ...validUsuarioData, 
                clave: 'TestPass!', 
                email: createUniqueEmail() 
            });
            await expect(usuario.validate())
                .rejects
                .toThrow('usuarios validation failed: clave: La clave debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
        });

        it('should fail without special character', async () => {
            const usuario = new Usuario({ 
                ...validUsuarioData, 
                clave: 'Test1234', 
                email: createUniqueEmail() 
            });
            await expect(usuario.validate())
                .rejects
                .toThrow('usuarios validation failed: clave: La clave debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
        });

        it('should fail when password is too short', async () => {
            const usuario = new Usuario({ 
                ...validUsuarioData, 
                clave: 'Test1!', 
                email: createUniqueEmail() 
            });
            await expect(usuario.validate())
                .rejects
                .toThrow('usuarios validation failed: clave: La clave debe tener al menos 8 caracteres, una mayúscula, una minúscula, un número y un carácter especial');
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
