import { hashPassword, comparePassword } from './passwordUtils';

describe('Password Utils', () => {
    it('should hash and compare passwords', async () => {
        const password = 'testpassword';
        const hashedPassword = await hashPassword(password);
        expect(hashedPassword).toBeDefined();
        expect(hashedPassword).not.toBe(password);
        const isMatch = await comparePassword(password, hashedPassword);
        expect(isMatch).toBe(true);
    });
});