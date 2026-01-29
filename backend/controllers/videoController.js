import Video from '../models/Video.js';
import path from 'path';
import fs from 'fs';
import { processVideo } from '../services/videoProcessor.js';

const processedDir = path.join(process.cwd(), 'processed');

export async function uploadVideo(req, res, next) {
  try {
    if (!req.file) return res.status(400).json({ error: 'No file uploaded' });
    const title = req.body.title?.trim() || req.file.originalname || req.file.filename;
    const ownerId = req.user._id;
    const video = await Video.create({
      title,
      filename: req.file.filename,
      ownerId,
      status: 'uploading',
      progress: 0,
      originalPath: req.file.path,
    });
    res.status(201).json(video);
    processVideo(video._id).catch((err) => console.error('Process start failed:', err));
  } catch (e) {
    next(e);
  }
}

export async function listVideos(req, res, next) {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    let filter;
    if (role === 'admin') filter = {};
    else if (role === 'viewer') filter = { sharedWith: userId };
    else filter = { ownerId: userId };
    const videos = await Video.find(filter)
      .sort({ createdAt: -1 })
      .lean();
    res.json(videos);
  } catch (e) {
    next(e);
  }
}

export async function getStatus(req, res, next) {
  try {
    const userId = req.user._id;
    const video = await Video.findOne({
      _id: req.params.id,
      $or: [{ ownerId: userId }, { sharedWith: userId }],
    }).lean();
    if (!video) return res.status(404).json({ error: 'Video not found' });
    res.json({
      _id: video._id,
      status: video.status,
      progress: video.progress,
      sensitivity: video.sensitivity,
    });
  } catch (e) {
    next(e);
  }
}

export async function streamVideo(req, res, next) {
  try {
    const userId = req.user._id;
    const video = await Video.findOne({
      _id: req.params.id,
      $or: [{ ownerId: userId }, { sharedWith: userId }],
    });
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const filePath = video.processedPath || video.originalPath;
    if (!filePath || !fs.existsSync(filePath)) {
      return res.status(404).json({ error: 'Video file not available' });
    }
    const stat = fs.statSync(filePath);
    const fileSize = stat.size;
    const range = req.headers.range;

    if (range) {
      const parts = range.replace(/bytes=/, '').split('-');
      const start = parseInt(parts[0], 10);
      const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
      const chunkSize = end - start + 1;
      const stream = fs.createReadStream(filePath, { start, end });
      res.writeHead(206, {
        'Content-Range': `bytes ${start}-${end}/${fileSize}`,
        'Accept-Ranges': 'bytes',
        'Content-Length': chunkSize,
        'Content-Type': 'video/mp4',
      });
      stream.pipe(res);
    } else {
      res.writeHead(200, {
        'Content-Length': fileSize,
        'Content-Type': 'video/mp4',
        'Accept-Ranges': 'bytes',
      });
      fs.createReadStream(filePath).pipe(res);
    }
  } catch (e) {
    next(e);
  }
}

export async function shareVideo(req, res, next) {
  try {
    const { userId } = req.body;
    if (!userId) return res.status(400).json({ error: 'userId required' });
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });
    const sharedWith = video.sharedWith || [];
    if (sharedWith.some((id) => id.toString() === userId)) {
      return res.status(200).json(video);
    }
    await Video.findByIdAndUpdate(req.params.id, { $addToSet: { sharedWith: userId } });
    const updated = await Video.findById(req.params.id).lean();
    res.json(updated);
  } catch (e) {
    next(e);
  }
}

export async function deleteVideo(req, res, next) {
  try {
    const userId = req.user._id;
    const role = req.user.role;
    const video = await Video.findById(req.params.id);
    if (!video) return res.status(404).json({ error: 'Video not found' });

    if (role === 'admin') {
      // allow
    } else if (role === 'editor' && video.ownerId.toString() === userId.toString()) {
      // allow
    } else {
      return res.status(403).json({ error: 'Insufficient permissions' });
    }

    const originalPath = video.originalPath;
    const processedPath = video.processedPath;
    if (originalPath && fs.existsSync(originalPath)) {
      try { fs.unlinkSync(originalPath); } catch (err) { console.error('Delete original failed:', err.message); }
    }
    if (processedPath && fs.existsSync(processedPath)) {
      try { fs.unlinkSync(processedPath); } catch (err) { console.error('Delete processed failed:', err.message); }
    }
    await Video.findByIdAndDelete(req.params.id);
    res.status(204).send();
  } catch (e) {
    next(e);
  }
}
