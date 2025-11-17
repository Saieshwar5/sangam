/**
 * Cookie configuration for JWT
 */
export const getCookieOptions = () => {
    const isProduction = process.env.NODE_ENV === 'production';
    
    return {
        httpOnly: true,           // ✅ Cannot be accessed by JavaScript
        secure: isProduction,     // ✅ Only sent over HTTPS in production
        sameSite: isProduction ? 'strict' : 'lax',  // ✅ CSRF protection
        maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days in milliseconds
        path: '/',                // ✅ Available on all routes
    };
};

/**
 * Set JWT token in httpOnly cookie
 * @param {Object} res - Express response object
 * @param {string} token - JWT token to set
 */
export function setTokenCookie(res, token) {
    res.cookie('auth_token', token, getCookieOptions());
}

/**
 * Clear JWT token cookie (for logout)
 * @param {Object} res - Express response object
 */
export function clearTokenCookie(res) {
    try{
    res.clearCookie('auth_token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: process.env.NODE_ENV === 'production' ? 'strict' : 'lax',
        path: '/',
    });
    }
    catch(error){
        console.error(error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error',
            error: error.message
        });
    }
}