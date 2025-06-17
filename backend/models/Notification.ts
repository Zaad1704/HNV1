import mongoose, { Schema, Document, model } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId; // The user who will receive the notification
  organizationId: mongoose.Types.ObjectId;
  message: string; // The text of the notification
  link: string; // The URL to navigate to on click
  isRead: boolean;
}

const NotificationSchema: Schema<INotification> = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  organizationId: { type: Schema.Types.ObjectId, ref: 'Organization', required: true },
  message: { type: String, required: true },
  link: { type: String, required: true },
  isRead: { type: Boolean, default: false, required: true },
}, { timestamps: true });

export default model<INotification>('Notification', NotificationSchema);
