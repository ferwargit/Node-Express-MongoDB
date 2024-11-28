import { describe, it, expect, beforeAll, afterEach, afterAll } from 'vitest';
import { connect, closeDatabase, clearDatabase } from '../../config/test-setup.js';
import mascotaModel from '../../../models/mascotas.models.js';

describe('Mascota Model Test Suite', () => {
    beforeAll(async () => await connect());
    afterEach(async () => await clearDatabase());
    afterAll(async () => await closeDatabase());

    const sampleMascota = {
        nombre: 'Firulais',
        tipo: 'Perro',
        raza: 'Labrador',
        edad: 5,
        descripcion: 'Un perro muy amigable',
        adoptado: false
    };

    describe('create', () => {
        it('should create a new mascota successfully', async () => {
            const mascota = await mascotaModel.create(sampleMascota);
            expect(mascota._id).toBeDefined();
            expect(mascota.nombre).toBe(sampleMascota.nombre);
        });

        it('should fail when required field nombre is missing', async () => {
            const mascotaSinNombre = { ...sampleMascota };
            delete mascotaSinNombre.nombre;
            await expect(mascotaModel.create(mascotaSinNombre))
                .rejects
                .toThrow('El nombre es requerido');
        });

        it('should fail when required field tipo is missing', async () => {
            const mascotaSinTipo = { ...sampleMascota };
            delete mascotaSinTipo.tipo;
            await expect(mascotaModel.create(mascotaSinTipo))
                .rejects
                .toThrow('El tipo de mascota es requerido');
        });
    });

    describe('getAll', () => {
        it('should return all mascotas', async () => {
            await mascotaModel.create(sampleMascota);
            await mascotaModel.create({
                ...sampleMascota,
                nombre: 'Luna',
                tipo: 'Gato'
            });

            const mascotas = await mascotaModel.getAll();
            expect(mascotas).toHaveLength(2);
        });
    });

    describe('getOne', () => {
        it('should return a single mascota by filter', async () => {
            const created = await mascotaModel.create(sampleMascota);
            const found = await mascotaModel.getOne({ _id: created._id });
            expect(found._id.toString()).toBe(created._id.toString());
        });
    });

    describe('update', () => {
        it('should update a mascota successfully', async () => {
            const created = await mascotaModel.create(sampleMascota);
            const updated = await mascotaModel.update(created._id, { nombre: 'Rex' });
            expect(updated.nombre).toBe('Rex');
        });

        it('should fail when updating tipo to invalid enum value', async () => {
            const created = await mascotaModel.create(sampleMascota);
            await expect(mascotaModel.update(created._id, { tipo: 'Pájaro' }))
                .rejects
                .toThrow('Pájaro no es un tipo de mascota válido');
        });
    });

    describe('delete', () => {
        it('should delete a mascota successfully', async () => {
            const created = await mascotaModel.create(sampleMascota);
            await mascotaModel.delete(created._id);
            const found = await mascotaModel.getOne({ _id: created._id });
            expect(found).toBeNull();
        });
    });
});
