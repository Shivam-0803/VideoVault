import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET;
const JWT_EXPIRES = process.env.JWT_EXPIRES ?? '7d';

function signToken(userId) {
  return jwt.sign({ userId }, JWT_SECRET, { expiresIn: JWT_EXPIRES });
}

export async function register(req, res, next) {
  try {
    const { email, password, role } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const existing = await User.findOne({ email: email.toLowerCase().trim() });
    if (existing) return res.status(409).json({ error: 'Email already registered' });
    const user = await User.create({
      email: email.toLowerCase().trim(),
      password,
      role: role ?? 'viewer',
    });
    const token = signToken(user._id);
    res.status(201).json({ user: { id: user._id, email: user.email, role: user.role }, token });
  } catch (e) {
    next(e);
  }
}

export async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    if (!email?.trim() || !password) {
      return res.status(400).json({ error: 'Email and password required' });
    }
    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) return res.status(401).json({ error: 'Invalid credentials' });
    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: 'Invalid credentials' });
    const token = signToken(user._id);
    res.json({ user: { id: user._id, email: user.email, role: user.role }, token });
  } catch (e) {
    next(e);
  }
}

export async function me(req, res, next) {
  try {
    const user = req.user;
    res.json({ id: user._id, email: user.email, role: user.role });
  } catch (e) {
    next(e);
  }
}
