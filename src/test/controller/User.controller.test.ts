import { Request, Response } from 'express';
import { userController } from '@/controller/User.controller';
import { User } from '@/model/User.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { envconfig } from '@/config/env.config';

jest.mock('@/model/User.model');
jest.mock('bcrypt');
jest.mock('jsonwebtoken');
jest.mock('@/config/env.config', () => ({
  envconfig: {
    auth: {
      'jwt-secret': 'test-secret',
      'jwt-expiration': '1h'
    }
  }
}));

describe('User Controller Tests', () => {
  let mockRequest: Partial<Request>;
  let mockResponse: Partial<Response>;
  
  beforeEach(() => {
    mockRequest = {
      body: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('login', () => {
    it('should return a token when login is successful', async () => {
      // Setup
      const userData = {
        email: 'test@example.com',
        password: 'password123'
      };
      
      mockRequest.body = userData;
      
      const mockUser = {
        _id: 'user123',
        email: userData.email,
        password: 'hashedPassword'
      };
      
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(true);
      (jwt.sign as jest.Mock).mockReturnValue('test-token');
      
      // Execute
      await userController.login(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(User.findOne).toHaveBeenCalledWith({ email: userData.email });
      expect(bcrypt.compare).toHaveBeenCalledWith(userData.password, mockUser.password);
      expect(jwt.sign).toHaveBeenCalledWith(
        { userId: mockUser._id },
        envconfig.auth['jwt-secret'],
        { expiresIn: envconfig.auth['jwt-expiration'] }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith({ token: 'test-token' });
    });

    it('should return 401 when user is not found', async () => {
      // Setup
      mockRequest.body = {
        email: 'nonexistent@example.com',
        password: 'password123'
      };
      
      (User.findOne as jest.Mock).mockResolvedValue(null);
      
      // Execute
      await userController.login(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Authentication failed",
          message: expect.any(String)
        })
      );
    });

    it('should return 401 when password does not match', async () => {
      // Setup
      const userData = {
        email: 'test@example.com',
        password: 'wrongpassword'
      };
      
      mockRequest.body = userData;
      
      const mockUser = {
        _id: 'user123',
        email: userData.email,
        password: 'hashedPassword'
      };
      
      (User.findOne as jest.Mock).mockResolvedValue(mockUser);
      (bcrypt.compare as jest.Mock).mockResolvedValue(false);
      
      // Execute
      await userController.login(mockRequest as Request, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(401);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          error: "Authentication failed"
        })
      );
    });
  });
});