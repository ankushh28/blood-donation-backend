import { Schema, model } from "mongoose";
import mongoose from "mongoose";

export interface IGeolocation {
  type: 'Point';
  coordinates: [number, number];
}

export interface IAddress {
  addressLine: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  isCurrent: boolean;
  location: IGeolocation;
  
}

const GeolocationSchema = new Schema<IGeolocation>({
  type: { type: String, enum: ['Point'], required: true },
  coordinates: { type: [Number], index: '2dsphere', sparse: true, required: true },
});
const addressSchema = new Schema<IAddress>({
  addressLine: { type: String, required: true },
  city: { type: String, required: true },
  state: { type: String, required: true },
  country: { type: String, required: true },
  postalCode: { type: String, required: true },
  isCurrent: { type: Boolean, default: false },
  location: { type: GeolocationSchema, required: true },
});
export interface IUser extends mongoose.Document {
  userId: string;
  fullname: string;
  dob: Date;
  email: string;
  age: string;
  avatar: string;
  bloodGroup: string;
  activeDonor: boolean;
  gender: string;
  weight: string;
  aadharVerified: boolean;
  phone: string;
  addresses: IAddress[];
  lastDonationDate: Date;
  socketId: string;
}

const userSchema = new Schema<IUser>({
  userId: { type: String, unique: true },
  fullname: { type: String, required: true },
  dob: { type: Date, required: true },
  age: { type: String, required: true },
  email: { type: String, required: true },
  avatar: { type: String, required: true },
  bloodGroup: { type: String, required: true },
  activeDonor: { type: Boolean, default: false },
  gender: { type: String, required: true },
  weight: { type: String, required: true },
  aadharVerified: { type: Boolean, default: false },
  phone: { type: String, required: true, unique: true },
  lastDonationDate: { type: Date, required: true },
  addresses: { type: [addressSchema], default: [] },
  socketId: { type: String },
});

export const User = mongoose.model<IUser>("User", userSchema);