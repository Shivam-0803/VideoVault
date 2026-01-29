import ffmpeg from 'fluent-ffmpeg';
import path from 'path';
import fs from 'fs';
import Video from '../models/Video.js';
import { getIo } from '../sockets/index.js';

const processedDir = path.join(process.cwd(), 'processed');
const thumbnailsDir = path.join(process.cwd(), 'thumbnails');

function simulateSensitivity() {
  return Math.random() > 0.15 ? 'safe' : 'flagged';
}

export async function processVideo(videoId) {
  const video = await Video.findById(videoId);
  if (!video || video.status !== 'uploading') return;
  const originalPath = video.originalPath;
  if (!originalPath || !fs.existsSync(originalPath)) {
    await Video.findByIdAndUpdate(videoId, { status: 'failed', progress: 0 });
    getIo()?.to(`video-${videoId}`).emit(`video-progress-${videoId}`, { progress: 0, status: 'failed' });
    return;
  }

  const sensitivity = simulateSensitivity();
  const ext = path.extname(video.filename);
  const outFilename = `${path.basename(video.filename, ext)}-processed${ext}`;
  const outPath = path.join(processedDir, outFilename);

  if (!fs.existsSync(processedDir)) fs.mkdirSync(processedDir, { recursive: true });

  await Video.findByIdAndUpdate(videoId, {
    status: 'processing',
    sensitivity,
    progress: 5,
  });
  getIo()?.to(`video-${videoId}`).emit(`video-progress-${videoId}`, { progress: 5, status: 'processing', sensitivity });

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      resolve();
    };

    try {
      ffmpeg(originalPath)
        .output(outPath)
        .videoCodec('libx264')
        .audioCodec('aac')
        .on('progress', (p) => {
          const percent = Math.min(95, Math.round((p.percent ?? 0) * 0.9 + 5));
          Video.findByIdAndUpdate(videoId, { progress: percent }).catch(() => {});
          getIo()?.to(`video-${videoId}`).emit(`video-progress-${videoId}`, { progress: percent, status: 'processing', sensitivity });
        })
        .on('end', async () => {
          if (settled) return;
          let thumbnailPath = null;
          try {
            if (!fs.existsSync(thumbnailsDir)) fs.mkdirSync(thumbnailsDir, { recursive: true });
            const thumbFilename = `${videoId}.jpg`;
            const thumbPath = path.join(thumbnailsDir, thumbFilename);
            await new Promise((res, rej) => {
              ffmpeg(outPath)
                .inputOptions(['-ss', '2'])
                .outputOptions(['-vframes', '1', '-q:v', '2'])
                .output(thumbPath)
                .on('end', () => res())
                .on('error', rej)
                .run();
            });
            if (fs.existsSync(thumbPath)) thumbnailPath = `/thumbnails/${thumbFilename}`;
          } catch (err) {
            console.error('Thumbnail failed:', err.message || err);
          }
          await Video.findByIdAndUpdate(videoId, {
            status: 'ready',
            progress: 100,
            processedPath: outPath,
            ...(thumbnailPath && { thumbnailPath }),
          });
          getIo()?.to(`video-${videoId}`).emit(`video-progress-${videoId}`, { progress: 100, status: 'ready', sensitivity });
          finish();
        })
        .on('error', async (err) => {
          console.error('FFmpeg failed:', err.message || err);
          if (settled) return;
          await Video.findByIdAndUpdate(videoId, { status: 'failed', progress: 0 });
          getIo()?.to(`video-${videoId}`).emit(`video-progress-${videoId}`, { progress: 0, status: 'failed' });
          finish();
        })
        .run();
    } catch (err) {
      console.error('FFmpeg failed:', err.message || err);
      Video.findByIdAndUpdate(videoId, { status: 'failed', progress: 0 }).catch(() => {});
      getIo()?.to(`video-${videoId}`).emit(`video-progress-${videoId}`, { progress: 0, status: 'failed' });
      finish();
    }
  });
}
