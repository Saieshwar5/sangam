import express from 'express';
import User from '../../models/usersOrm.js';
import { comparePassword } from '../../util/passwordUtils.js';
import { generateToken } from '../../util/jwtUtils.js';
import { setTokenCookie } from '../../config/httpCookiesConfig.js';

const signInRouter = express.Router();

signInRouter.post('/auth/sign_in', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        // Find user by email
        const user = await User.findOne({ where: { email } });
        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Compare passwords
        const isPasswordValid = await comparePassword(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }
        const token = generateToken(user.userId);
        setTokenCookie(res, token.data);
        // Success! Don't send password back
        if(token.success)
        {
            return res.status(200).json({
                success: true,
                message: 'Sign in successful',
                data: {
                    id: user.userId,
                    email: user.email,
                    verified: false,
                    createdAt: user.createdAt,
                    updatedAt: user.updatedAt
                }
            });
        }
        else
        {
            return res.status(400).json({
                success: false,
                message: 'Sign in failed',
                error: token.error
            });
        }
    } catch (error) {
        console.error('Sign in error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
});

export default signInRouter;