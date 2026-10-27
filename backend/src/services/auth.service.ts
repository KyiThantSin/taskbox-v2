import { userRepository } from '../repositories/user.repository';
import { comparePassword, generateToken, hashPassword } from '../utils/auth';
import { HttpError } from '../utils/errors';

export const authService = {
  async register(email: string, name: string, passwordPlain: string) {
    const existing = await userRepository.findByEmail(email);
    if (existing) {
      throw new HttpError(409, 'An account with that email already exists');
    }

    if (passwordPlain.length < 6) {
      throw new HttpError(400, 'Password must be at least 6 characters long');
    }

    const hashedPassword = await hashPassword(passwordPlain);
    const user = await userRepository.create({
      email,
      name,
      password: hashedPassword,
    });

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return { user, token };
  },

  async login(email: string, passwordPlain: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const valid = await comparePassword(passwordPlain, user.password);
    if (!valid) {
      throw new HttpError(401, 'Invalid email or password');
    }

    const token = generateToken({
      id: user.id,
      email: user.email,
      name: user.name,
    });

    return {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        createdAt: user.createdAt,
      },
      token,
    };
  },

  async getProfile(userId: number) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new HttpError(404, 'User not found');
    }
    return user;
  },
};
