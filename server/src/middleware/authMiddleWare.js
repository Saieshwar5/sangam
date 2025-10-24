import { verifyToken } from '../util/jwtUtils.js';


export async function authMiddleWare(req, res, next)
{

    try {
    const token = req.cookies.auth_token;
    if(!token)
    {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
            error: 'No token provided'
        });
    }
    const decoded = verifyToken(token);
    if(!decoded.success)
    {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
            error: decoded.error
        });
    }
        req.user = decoded.data;
        next();
    } catch (error) {
        return res.status(401).json({
            success: false,
            message: 'Unauthorized',
            error: error.message
        });
    }
}