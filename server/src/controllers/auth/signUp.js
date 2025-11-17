import { v4 as uuidv4 } from 'uuid';
import User from '../../models/usersOrm.js';
import { hashPassword } from '../../util/passwordUtils.js';
import { generateToken } from '../../util/jwtUtils.js';
import { setTokenCookie } from '../../config/httpCookiesConfig.js';

export async function signUpController(req, res) {
  try {
    const { email, password } = req.body;

    // 1) Basic validation
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Password must be at least 6 characters long',
      });
    }

    // 2) Prevent duplicates
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'User with this email already exists',
      });
    }

    // 3) Hash + persist
    const hashedPassword = await hashPassword(password);
    const userId = uuidv4();

    const newUser = await User.create({
      userId,
      email,
      password: hashedPassword,
    });

    if (!newUser) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create user',
      });
    }

    // 4) Generate auth token + cookie
    const token = generateToken(newUser.userId);
    if (!token.success) {
      return res.status(400).json({
        success: false,
        message: 'Failed to create user',
        error: token.error,
      });
    }

    setTokenCookie(res, token.data);

    return res.status(201).json({
      success: true,
      message: 'Sign up successful',
      data: {
        id: newUser.userId,
        email: newUser.email,
        verified: false,
        createdAt: newUser.createdAt,
        updatedAt: newUser.updatedAt,
      },
    });
  } catch (error) {
    console.error('Sign up error:', error);
    return res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  }
}