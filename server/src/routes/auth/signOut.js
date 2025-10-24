import express from 'express';
import { clearTokenCookie } from '../../config/httpCookiesConfig.js';

const signOutRouter = express.Router();

signOutRouter.post('/auth/sign_out', async (req, res) => {
    clearTokenCookie(res);

    console.log("Sign out successful");
    res.status(200).json({
        success: true,
        message: 'Sign out successful'
    });
});

export default signOutRouter;