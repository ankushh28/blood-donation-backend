import mongoose, { Schema, model, Document } from "mongoose";

export interface IBloodRequest extends Document {
    userId: string;
    patientName: string;
    patientPhone: string;
    bloodGroup: string;
    requiredDate: Date;
    units: number;
    location: {
        addressLine: string;
        city: string;
        state: string;
        country: string;
        postalCode: string;
        location: {
            type: 'Point';
            coordinates: [number, number];
        };
    };
    isCritical: boolean;
    additionalNote?: string;
    status: "pending" | "fulfilled" | "cancelled";
    donors: string[];
    createdAt: Date;
}

const locationSchema = new Schema({
    addressLine: { type: String, required: true },
    city: { type: String, required: true },
    state: { type: String, required: true },
    country: { type: String, required: true },
    postalCode: { type: String, required: true },
    location: {
        type: { type: String, enum: ['Point'], required: true },
        coordinates: { type: [Number], required: true },
    },
});

const bloodRequestSchema = new Schema<IBloodRequest>({
    userId: { type: String, required: true },
    patientName: { type: String, required: true },
    patientPhone: { type: String, required: true },
    bloodGroup: { type: String, required: true },
    requiredDate: { type: Date, required: true },
    units: { type: Number, required: true, min: 1, max: 10 },
    location: { type: locationSchema, required: true },
    isCritical: { type: Boolean, required: true },
    additionalNote: { type: String },
    status: { type: String, enum: ["pending", "fulfilled", "cancelled"], default: "pending" },
    donors: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
    createdAt: { type: Date, default: Date.now },
});
bloodRequestSchema.index({ "location.location": "2dsphere" });
export default model<IBloodRequest>("BloodRequest", bloodRequestSchema);