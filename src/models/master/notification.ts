// src/models/Notification.ts
import mongoose, { Document, Schema, Types } from 'mongoose';

interface INotification extends Document {
  userId: Types.ObjectId;
  requestId: Types.ObjectId;
  message: string;
  read: boolean;
  createdAt: Date;
}

const NotificationSchema: Schema = new Schema(
  {
    userId: { 
      type: Schema.Types.ObjectId, 
      ref: 'User', 
      required: true 
    },
    requestId: { 
      type: Schema.Types.ObjectId, 
      ref: 'Request', 
      required: true 
    },
    message: { type: String, required: true },
    read: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
export default Notification;
