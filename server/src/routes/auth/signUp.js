import express from 'express';
import { v4 as uuidv4 } from 'uuid';
import User from '../../models/usersOrm.js';
import { hashPassword } from '../../util/passwordUtils.js';
import { generateToken } from '../../util/jwtUtils.js';
import { setTokenCookie } from '../../config/httpCookiesConfig.js';

const signUpRouter = express.Router();

signUpRouter.post('/auth/sign_up', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validation
        if (!email || !password) {
            return res.status(400).json({
                success: false,
                message: 'Email and password are required'
            });
        }

        if (password.length < 6) {
            return res.status(400).json({
                success: false,
                message: 'Password must be at least 6 characters long'
            });
        }

        // Check if user already exists
        const existingUser = await User.findOne({ where: { email } });
        if (existingUser) {
            return res.status(409).json({
                success: false,
                message: 'User with this email already exists'
            });
        }

        // Hash the password before saving
        const hashedPassword = await hashPassword(password);
        const userId = uuidv4();

        // Create user in database
        const newUser = await User.create({
            userId,
            email,
            password: hashedPassword, // ✅ Save hashed password
        });


        if(!newUser)
        {
            return res.status(400).json({
                success: false,
                message: 'Failed to create user'
            });
        }

        const token = generateToken(newUser.userId);
        console.log("token", token);
        setTokenCookie(res, token.data);


        // Don't send password back to client!
        if(token.success)
        {

            console.log("generated token ", token.data);
            return res.status(201).json({
                success: true,
                message: 'Sign up successful',
                data: { 
                    id: newUser.userId,
                    email: newUser.email, 
                    verified: false,
                    createdAt: newUser.createdAt,
                    updatedAt: newUser.updatedAt
                }
            });
        }
        else
        {
            return res.status(400).json({
                success: false,
                message: 'Failed to create user',
                error: token.error
            });
        }
    } catch (error) {
        console.error('Sign up error:', error);
        res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});

export default signUpRouter;