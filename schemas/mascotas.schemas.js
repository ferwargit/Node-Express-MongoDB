import mongoose from "mongoose";

const mascotaSchema = new mongoose.Schema(
    {
        nombre: {
            type: String,
            required: [true, 'El nombre es requerido'],
            trim: true,
            minlength: [2, 'El nombre debe tener al menos 2 caracteres'],
            maxlength: [50, 'El nombre no puede exceder 50 caracteres']
        },
        tipo: {
            type: String,
            required: [true, 'El tipo de mascota es requerido'],
            enum: {
                values: ["Perro", "Gato", "Conejo"],
                message: '{VALUE} no es un tipo de mascota válido'
            },
            trim: true
        },
        raza: {
            type: String,
            trim: true,
            maxlength: [50, 'La raza no puede exceder 50 caracteres']
        },
        edad: {
            type: Number,
            min: [0, 'La edad no puede ser negativa'],
            max: [30, 'La edad no parece correcta'],
            validate: {
                validator: function(value) {
                    return value === undefined || Number.isInteger(value);
                },
                message: 'La edad debe ser un número entero'
            }
        },
        descripcion: {
            type: String,
            trim: true,
            maxlength: [500, 'La descripción no puede exceder 500 caracteres']
        },
        adoptado: {
            type: Boolean,
            default: false
        },
        fechaAdopcion: {
            type: Date,
            validate: {
                validator: function(value) {
                    return !value || value <= new Date();
                },
                message: 'La fecha de adopción no puede ser futura'
            }
        }
    }, 
    { 
        timestamps: true,
        toJSON: { virtuals: true },
        toObject: { virtuals: true }
    }
);

// Virtual para calcular la edad en años humanos
mascotaSchema.virtual('edadHumana').get(function() {
    if (this.edad === undefined) return null;
    if (this.tipo === 'Perro') return this.edad * 7;
    if (this.tipo === 'Gato') return this.edad * 6;
    return this.edad;
});

export default mongoose.model('mascotas', mascotaSchema);