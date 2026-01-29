import User from '../models/User.js';

export async function listUsers(req, res, next) {
  try {
    const role = req.query.role;
    const filter = role ? { role } : {};
    const users = await User.find(filter).select('_id email role').lean();
    res.json(users);
  } catch (e) {
    next(e);
  }
}
