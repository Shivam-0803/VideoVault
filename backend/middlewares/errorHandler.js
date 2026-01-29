export function errorHandler(err, req, res, next) {
  console.error(err);
  if (err.code === 'LIMIT_FILE_SIZE') {
    return res.status(400).json({ error: 'File too large' });
  }
  if (err.code === 'LIMIT_FILE_COUNT' || err.code === 'LIMIT_UNEXPECTED_FILE') {
    return res.status(400).json({ error: 'Invalid file upload' });
  }
  if (err.message?.includes('Invalid file type')) {
    return res.status(400).json({ error: err.message });
  }
  const status = err.status ?? 500;
  res.status(status).json({ error: err.message ?? 'Internal server error' });
}
