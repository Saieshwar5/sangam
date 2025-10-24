import { generateToken, verifyToken, decodeToken } from './jwtUtils.js';
import jwt from 'jsonwebtoken';

describe('JWT Utils', () => {
  const testUserId = 'test-user-123';
  
  describe('generateToken', () => {
    it('should generate a valid JWT token', () => {
      // Act
      const result = generateToken(testUserId);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Token generated successfully');
      expect(result.data).toBeDefined();
      expect(typeof result.data).toBe('string');
    });

    it('should generate a token with correct payload', () => {
      // Act
      const result = generateToken(testUserId);
      
      // Manually decode to check payload
      const decoded = jwt.decode(result.data);
      
      // Assert
      expect(decoded).toHaveProperty('id');
      expect(decoded.id).toBe(testUserId);
      expect(decoded).toHaveProperty('iat'); // issued at
      expect(decoded).toHaveProperty('exp'); // expiration
    });

    it('should generate different tokens for different users', () => {
      // Act
      const result1 = generateToken('user-1');
      const result2 = generateToken('user-2');
      
      // Assert
      expect(result1.data).not.toBe(result2.data);
    });
  });

  describe('verifyToken', () => {
    it('should verify a valid token', () => {
      // Arrange
      const tokenResult = generateToken(testUserId);
      const token = tokenResult.data;
      
      // Act
      const result = verifyToken(token);
      console.log(result);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Token verified successfully');
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe(testUserId);
    });

    it('should reject an invalid token', () => {
      // Arrange
      const invalidToken = 'invalid.token.string';
      
      // Act
      const result = verifyToken(invalidToken);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Token verification failed');
      expect(result.error).toBeDefined();
    });

    it('should reject an expired token', () => {
      // Arrange - Create a token that expires in 1 millisecond
      const expiredToken = jwt.sign(
        { id: testUserId },
        process.env.JWT_SECRET,
        { expiresIn: '1ms' }
      );
      
      // Wait for token to expire
      return new Promise(resolve => {
        setTimeout(() => {
          // Act
          const result = verifyToken(expiredToken);
          
          // Assert
          expect(result.success).toBe(false);
          expect(result.error).toContain('expired');
          resolve();
        }, 10);
      });
    });

    it('should reject a token with wrong secret', () => {
      // Arrange - Create token with different secret
      const wrongToken = jwt.sign(
        { id: testUserId },
        'wrong_secret',
        { expiresIn: '1h' }
      );
      
      // Act
      const result = verifyToken(wrongToken);
      
      // Assert
      expect(result.success).toBe(false);
      expect(result.message).toBe('Token verification failed');
    });
  });

  describe('decodeToken', () => {
    it('should decode a valid token without verification', () => {
      // Arrange
      const tokenResult = generateToken(testUserId);
      const token = tokenResult.data;
      
      // Act
      const result = decodeToken(token);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.message).toBe('Token decoded successfully');
      expect(result.data).toBeDefined();
      expect(result.data.id).toBe(testUserId);
    });

    it('should decode an expired token (without verification)', () => {
      // Arrange - Expired token can still be decoded
      const expiredToken = jwt.sign(
        { id: testUserId },
        process.env.JWT_SECRET,
        { expiresIn: '-1h' } // Already expired
      );
      
      // Act
      const result = decodeToken(expiredToken);
      
      // Assert
      expect(result.success).toBe(true);
      expect(result.data.id).toBe(testUserId);
    });

    it('should handle malformed token', () => {
      // Arrange
      const malformedToken = 'not.a.jwt';
      
      // Act
      const result = decodeToken(malformedToken);
      
      // Assert - jwt.decode returns null for invalid tokens, not throwing error
      expect(result.success).toBe(true);
      expect(result.data).toBeNull();
    });
  });

  describe('Integration: Generate and Verify', () => {
    it('should successfully generate and verify token', () => {
      // Generate
      const generateResult = generateToken(testUserId);
      expect(generateResult.success).toBe(true);
      
      const token = generateResult.data;
      
      // Verify
      const verifyResult = verifyToken(token);
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.data.id).toBe(testUserId);
    });

    it('should generate token, decode it, and verify it', () => {
      // Generate
      const generateResult = generateToken(testUserId);
      const token = generateResult.data;
      
      // Decode
      const decodeResult = decodeToken(token);
      expect(decodeResult.success).toBe(true);
      expect(decodeResult.data.id).toBe(testUserId);
      
      // Verify
      const verifyResult = verifyToken(token);
      expect(verifyResult.success).toBe(true);
      expect(verifyResult.data.id).toBe(testUserId);
    });
  });
});