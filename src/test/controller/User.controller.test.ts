import { Request, Response } from 'express';
import { userController } from '@/controller/User.controller';
import { User } from '@/model/User.model';
import { Course } from '@/model/Course.model';
import Attendance from '@/model/Attendance.model';
import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { envconfig } from '@/config/env.config';
import { TokenRequest } from '@/interface/Request.types';
import mongoose from 'mongoose';
import * as utils from '@/lib/utils';

jest.mock('@/model/User.model');
jest.mock('@/model/Course.model');
jest.mock('@/model/Attendance.model');
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

jest.mock('@/lib/utils', () => ({
  authenticateUser: jest.fn(),
  excludedFields: '-password'
}));

describe('User Controller Tests', () => {
  let mockRequest: Partial<Request & TokenRequest>;
  let mockResponse: Partial<Response>;
  const mockUserId = new mongoose.Types.ObjectId();
  
  beforeEach(() => {
    mockRequest = {
      body: {},
      userId: mockUserId,
      params: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    jest.clearAllMocks();
  });

  describe('login', () => {

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
        _id: mockUserId,
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

  describe('getUser', () => {
    it('should return user data when authenticated', async () => {
      // Setup
      const mockUser = {
        _id: mockUserId,
        name: 'Test User',
        email: 'test@example.com',
        university: ['BME']
      };
      
      (utils.authenticateUser as jest.Mock).mockResolvedValue(mockUser);
      
      const selectMock = jest.fn().mockResolvedValue(mockUser);
      (User.findById as jest.Mock).mockReturnValue({ select: selectMock });
      
      // Execute
      await userController.getUser(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(utils.authenticateUser).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(selectMock).toHaveBeenCalledWith('-password');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockUser);
    });

    it('should not proceed when authentication fails', async () => {
      // Setup
      (utils.authenticateUser as jest.Mock).mockResolvedValue(null);
      
      // Execute
      await userController.getUser(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(utils.authenticateUser).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(User.findById).not.toHaveBeenCalled();
      expect(mockResponse.json).not.toHaveBeenCalled();
    });
  });

  describe('addUniversity', () => {
    it('should add a university to user successfully', async () => {
      // Setup
      mockRequest.body = { university: 'ELTE' };
      
      const mockUser = {
        _id: mockUserId,
        university: ['BME'],
        save: jest.fn().mockResolvedValue({})
      };
      
      (utils.authenticateUser as jest.Mock).mockResolvedValue(mockUser);
      
      // Execute
      await userController.addUniversity(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(utils.authenticateUser).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(mockUser.university).toContain('ELTE');
      expect(mockUser.save).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'University added successfully' })
      );
    });

    it('should return 400 when university is already added', async () => {
      // Setup
      mockRequest.body = { university: 'BME' };
      
      const mockUser = {
        _id: mockUserId,
        university: ['BME'],
        save: jest.fn()
      };
      
      (utils.authenticateUser as jest.Mock).mockResolvedValue(mockUser);
      
      // Execute
      await userController.addUniversity(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'University is already added' })
      );
      expect(mockUser.save).not.toHaveBeenCalled();
    });

    it('should return 400 when university is invalid', async () => {
      // Setup
      mockRequest.body = { university: 'INVALID' };
      
      const mockUser = {
        _id: mockUserId,
        university: ['BME'],
        save: jest.fn()
      };
      
      (utils.authenticateUser as jest.Mock).mockResolvedValue(mockUser);
      
      // Execute
      await userController.addUniversity(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Invalid university abbreviation' })
      );
      expect(mockUser.save).not.toHaveBeenCalled();
    });
  });

  describe('getCourses', () => {
    it('should return all courses for the user', async () => {
      // Setup
      const mockUser = {
        _id: mockUserId
      };
      
      (utils.authenticateUser as jest.Mock).mockResolvedValue(mockUser);
      
      const mockCourses = [
        { _id: new mongoose.Types.ObjectId(), name: 'Course 1' },
        { _id: new mongoose.Types.ObjectId(), name: 'Course 2' }
      ];
      
      const selectMock = jest.fn().mockResolvedValue(mockCourses);
      (Course.find as jest.Mock).mockReturnValue({ select: selectMock });
      
      // Execute
      await userController.getCourses(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(utils.authenticateUser).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(Course.find).toHaveBeenCalledWith({ user_id: mockUserId });
      expect(selectMock).toHaveBeenCalledWith('-password');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCourses);
    });
  });

  describe('getCoursesByUniversity', () => {
    it('should return courses for a specific university', async () => {
      // Setup
      mockRequest.params = { university: 'BME' };
      
      const mockUser = {
        _id: mockUserId,
        university: ['BME', 'ELTE']
      };
      
      (utils.authenticateUser as jest.Mock).mockResolvedValue(mockUser);
      
      const mockCourses = [
        { _id: new mongoose.Types.ObjectId(), name: 'BME Course 1' },
        { _id: new mongoose.Types.ObjectId(), name: 'BME Course 2' }
      ];
      
      const selectMock = jest.fn().mockResolvedValue(mockCourses);
      (Course.find as jest.Mock).mockReturnValue({ select: selectMock });
      
      // Execute
      await userController.getCoursesByUniversity(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(utils.authenticateUser).toHaveBeenCalledWith(mockRequest, mockResponse);
      expect(Course.find).toHaveBeenCalledWith({ user_id: mockUserId, university: 'BME' });
      expect(selectMock).toHaveBeenCalledWith('-password');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockCourses);
    });

    it('should return 403 when user does not belong to the university', async () => {
      // Setup
      mockRequest.params = { university: 'SZTE' };
      
      const mockUser = {
        _id: mockUserId,
        university: ['BME', 'ELTE']
      };
      
      (utils.authenticateUser as jest.Mock).mockResolvedValue(mockUser);
      
      // Execute
      await userController.getCoursesByUniversity(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'User does not belong to the specified university' })
      );
      expect(Course.find).not.toHaveBeenCalled();
    });
  });
});