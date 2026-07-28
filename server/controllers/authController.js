import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { createUser, findUserByEmail, findUserById } from '../data/repository.js';

function makeToken(user) {
  return jwt.sign(
    { sub: user._id, email: user.email, role: user.role, name: user.name },
    process.env.JWT_SECRET || 'dev-secret',
    { expiresIn: '7d' },
  );
}

export async function register(req, res) {
  const { name, email, password } = req.body;

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }

  const existing = await findUserByEmail(email);
  if (existing) {
    return res.status(409).json({ message: 'Email is already registered' });
  }

  const user = await createUser({
    name,
    email,
    passwordHash: bcrypt.hashSync(password, 10),
    role: 'user',
  });
  const token = makeToken(user);

  return res.status(201).json({
    token,
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    message: 'Account created',
  });
}

export async function login(req, res) {
  const { email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: 'Email and password are required' });
  }

  const user = await findUserByEmail(email);
  if (!user || !bcrypt.compareSync(password, user.passwordHash)) {
    return res.status(401).json({ message: 'Invalid credentials' });
  }

  return res.json({
    token: makeToken(user),
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
    message: 'Logged in successfully',
  });
}

export async function profile(req, res) {
  const user = await findUserById(req.user.sub);
  if (!user) {
    return res.status(404).json({ message: 'User not found' });
  }

  return res.json({
    user: { _id: user._id, name: user.name, email: user.email, role: user.role },
  });
}
