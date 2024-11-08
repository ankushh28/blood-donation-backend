import mongoose, { Schema, Document } from 'mongoose';

interface IOtpDocument extends Document {
    email: string;
    otp: string;
    expiry: Date;
    createdAt: Date;
}

const OtpSchema: Schema = new Schema({
    email: { type: String, required: true },
    otp: { type: String, required: true },
    expiry: { type: Date, required: true },
    createdAt: { type: Date, default: Date.now, expires: '30m' }
});

const Otp = mongoose.model<IOtpDocument>('Otp', OtpSchema);

export default Otp;
