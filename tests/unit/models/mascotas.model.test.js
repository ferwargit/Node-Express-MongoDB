import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import mongoose from 'mongoose';
import { connect, closeDatabase, clearDatabase } from '../../config/test-setup.js';
import mascotaModel from '../../../models/mascotas.models.js';

describe('Mascota Model Test Suite', () => {
    beforeAll(async () => await connect());
    afterEach(async () => await clearDatabase());
    afterAll(async () => await closeDatabase());

    const sampleMascota = {
        nombre: 'Firulais',
        tipo: 'Perro',  // Campo requerido y debe ser uno de los valores enum
        raza: 'Labrador',
        edad: 5
    };

    describe('create', () => {
        it('should create a new mascota successfully', async () => {
            const result = await mascotaModel.create(sampleMascota);
            expect(result.nombre).toBe(sampleMascota.nombre);
            expect(result.tipo).toBe(sampleMascota.tipo);
            expect(result.edad).toBe(sampleMascota.edad);
            expect(result._id).toBeDefined();
        });

        it('should fail when required field tipo is missing', async () => {
            const invalidMascota = { ...sampleMascota };
            delete invalidMascota.tipo;
            
            await expect(mascotaModel.create(invalidMascota))
                .rejects
                .toThrow('mascotas validation failed');
        });

        it('should fail when tipo has invalid enum value', async () => {
            const invalidMascota = { ...sampleMascota, tipo: 'Pájaro' };
            
            await expect(mascotaModel.create(invalidMascota))
                .rejects
                .toThrow('validation failed');
        });
    });

    describe('getAll', () => {
        it('should return all mascotas', async () => {
            await mascotaModel.create(sampleMascota);
            await mascotaModel.create({...sampleMascota, nombre: 'Max'});
            
            const mascotas = await mascotaModel.getAll();
            expect(mascotas).toHaveLength(2);
            expect(mascotas[0].nombre).toBeDefined();
        });
    });

    describe('getOne', () => {
        it('should return a single mascota by id', async () => {
            const created = await mascotaModel.create(sampleMascota);
            const found = await mascotaModel.getOne(created._id);
            expect(found.nombre).toBe(sampleMascota.nombre);
        });
    });

    describe('update', () => {
        it('should update a mascota successfully', async () => {
            const created = await mascotaModel.create(sampleMascota);
            const updated = await mascotaModel.update(created._id, { nombre: 'Max' });
            expect(updated.nombre).toBe('Max');
        });

        it('should fail when updating tipo to invalid enum value', async () => {
            const created = await mascotaModel.create(sampleMascota);
            await expect(mascotaModel.update(created._id, { tipo: 'Pájaro' }))
                .rejects
                .toThrow('`Pájaro` is not a valid enum value for path `tipo`');
        });
    });

    describe('delete', () => {
        it('should delete a mascota successfully', async () => {
            const created = await mascotaModel.create(sampleMascota);
            await mascotaModel.delete(created._id);
            const found = await mascotaModel.getOne(created._id);
            expect(found).toBeNull();
        });
    });
});
