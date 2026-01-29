import mongoose from 'mongoose';

const videoSchema = new mongoose.Schema({
  title: { type: String, required: true },
  filename: { type: String, required: true },
  ownerId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  status: { type: String, enum: ['uploading', 'processing', 'ready', 'failed'], default: 'uploading' },
  progress: { type: Number, default: 0, min: 0, max: 100 },
  sensitivity: { type: String, enum: ['safe', 'flagged'], default: null },
  originalPath: { type: String },
  processedPath: { type: String },
  thumbnailPath: { type: String },
  sharedWith: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }],
}, { timestamps: true });

videoSchema.index({ ownerId: 1 });
videoSchema.index({ sharedWith: 1 });
videoSchema.index({ ownerId: 1, createdAt: -1 });

export default mongoose.model('Video', videoSchema);
