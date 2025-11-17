import express from 'express';
import { signUpController } from '../../controllers/auth/signUp.js';
import { signInController } from '../../controllers/auth/signIn.js';
import { clearTokenCookie } from '../../config/httpCookiesConfig.js';

const authRouter = express.Router();

authRouter.post('/sign_up', signUpController);
authRouter.post('/sign_in', signInController);
authRouter.get('/sign_out', async (req, res) => {
    clearTokenCookie(res);

    console.log("Sign out successful");
    res.status(200).json({
        success: true,
        message: 'Sign out successful'
    });
});



export default authRouter;