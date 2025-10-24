import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';

dotenv.config();

/**
 * Generates a JWT for the given user ID.
 * @param {string} userId - The user's unique identifier.
 * @returns {object} Result object containing success status and token data.
 */
export function generateToken(userId) {
    try {
        // IMPROVEMENT 1: Use an object for the payload (convention and best practice)
        const payload = { id: userId };
        console.log("process.env.JWT_SECRET", process.env.JWT_SECRET);

        // IMPROVEMENT 2: Remove 'await' since jwt.sign is synchronous without a callback
        const token = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN
            }
        );
        
        return {
            success: true,
            message: 'Token generated successfully',
            data: token
        };
    } catch (error) {
        // ... (Error handling remains good)
        return {
            success: false,
            message: 'Token generation failed',
            error: error.message
        };
    }
}

/**
 * Verifies a JWT and decodes the payload.
 * @param {string} token - The JWT string to verify.
 * @returns {object} Result object containing success status and decoded payload.
 */
export function verifyToken(token) {
    try {
        // IMPROVEMENT 3: Remove 'await' since jwt.verify is synchronous without a callback
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        
        return {    
            success: true,
            message: 'Token verified successfully',
            data: decoded
        };
    } catch (error) {
        // ... (Error handling remains good)
        return {
            success: false,
            message: 'Token verification failed',
            // jwt.verify can throw specific errors like TokenExpiredError
            error: error.message 
        };
    }
}

export function decodeToken(token)
{
    try {
        const decoded =  jwt.decode(token);
        return {
            success: true,
            message: 'Token decoded successfully',
            data: decoded
        };
    } catch (error) {
        return {
            success: false,
            message: 'Token decoding failed',
            error: error.message,
            data: null
        };
    }
    
}

export default { generateToken, verifyToken, decodeToken };