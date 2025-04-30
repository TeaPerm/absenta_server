import { Response } from 'express';
import { courseController } from '@/controller/Course.controller';
import { Course } from '@/model/Course.model';
import { User } from '@/model/User.model';
import Attendance from '@/model/Attendance.model';
import { TokenRequest } from '@/interface/Request.types';
import mongoose from 'mongoose';

jest.mock('@/model/Course.model');
jest.mock('@/model/User.model');
jest.mock('@/model/Attendance.model');

describe('Course Controller Tests', () => {
  let mockRequest: Partial<TokenRequest>;
  let mockResponse: Partial<Response>;
  const mockUserId = new mongoose.Types.ObjectId();
  
  beforeEach(() => {
    mockRequest = {
      userId: mockUserId,
      params: {},
      body: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };
  });

  describe('getCourse', () => {
    it('should return a course when found', async () => {
      // Setup
      const courseId = new mongoose.Types.ObjectId();
      mockRequest.params = { id: courseId.toString() };
      
      const mockCourse = {
        _id: courseId,
        name: 'Test Course',
        university: 'BME',
        user_id: mockUserId,
        students: [
          { name: 'Student B', neptun_code: 'B12345' },
          { name: 'Student A', neptun_code: 'A54321' }
        ],
        toObject: jest.fn().mockReturnValue({
          _id: courseId,
          name: 'Test Course',
          university: 'BME',
          user_id: mockUserId,
          students: [
            { name: 'Student B', neptun_code: 'B12345' },
            { name: 'Student A', neptun_code: 'A54321' }
          ]
        }),
        equals: jest.fn().mockReturnValue(true)
      };
      
      const selectMock = jest.fn().mockReturnValue(mockCourse);
      (Course.findById as jest.Mock).mockReturnValue({ select: selectMock });
      
      // Execute
      await courseController.getCourse(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(Course.findById).toHaveBeenCalledWith(courseId.toString());
      expect(selectMock).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          name: 'Test Course',
          students: expect.arrayContaining([
            expect.objectContaining({ name: 'Student A' }),
            expect.objectContaining({ name: 'Student B' })
          ])
        })
      );
    });

    it('should return 404 when course is not found', async () => {
      // Setup
      mockRequest.params = { id: 'nonexistent-id' };
      
      const selectMock = jest.fn().mockReturnValue(null);
      (Course.findById as jest.Mock).mockReturnValue({ select: selectMock });
      
      // Execute
      await courseController.getCourse(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: expect.stringContaining('Course not found') })
      );
    });

    it('should return 403 when user does not have access to the course', async () => {
      // Setup
      mockRequest.params = { id: 'course-id' };
      
      const mockCourse = {
        user_id: new mongoose.Types.ObjectId(), // Different from mockUserId
        equals: jest.fn().mockReturnValue(false)
      };
      
      const selectMock = jest.fn().mockReturnValue(mockCourse);
      (Course.findById as jest.Mock).mockReturnValue({ select: selectMock });
      
      // Execute
      await courseController.getCourse(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'You do not have acces to this course.' })
      );
    });
  });

  describe('createCourse', () => {
    it('should create a course successfully', async () => {
      // Setup
      const courseData = {
        name: 'New Course',
        university: 'BME',
        students: [{ name: 'Student 1', neptun_code: 'ABC123' }]
      };
      mockRequest.body = courseData;
      
      const mockUser = {
        university: ['BME', 'ELTE']
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      
      const saveMock = jest.fn().mockResolvedValue({});
      (Course as unknown as jest.Mock).mockImplementation(() => ({
        save: saveMock
      }));
      
      // Execute
      await courseController.createCourse(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(User.findById).toHaveBeenCalledWith(mockUserId);
      expect(Course).toHaveBeenCalledWith(expect.objectContaining({
        name: courseData.name,
        university: courseData.university,
        user_id: mockUserId
      }));
      expect(saveMock).toHaveBeenCalled();
      expect(mockResponse.status).toHaveBeenCalledWith(201);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Course created successfully' })
      );
    });

    it('should return 403 when user does not belong to the specified university', async () => {
      // Setup
      mockRequest.body = {
        name: 'New Course',
        university: 'SZTE', // Not in user.university
        students: [{ name: 'Student 1', neptun_code: 'ABC123' }]
      };
      
      const mockUser = {
        university: ['BME', 'ELTE']
      };
      (User.findById as jest.Mock).mockResolvedValue(mockUser);
      
      // Execute
      await courseController.createCourse(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'User does not belong to the specified university' })
      );
    });
  });

  describe('updateCourse', () => {
    it('should update a course successfully', async () => {
      // Setup
      const courseId = new mongoose.Types.ObjectId();
      mockRequest.params = { id: courseId.toString() };
      mockRequest.body = {
        name: 'Updated Course Name'
      };
      
      const mockCourse = {
        _id: courseId,
        user_id: mockUserId,
        equals: jest.fn().mockReturnValue(true)
      };
      (Course.findById as jest.Mock).mockResolvedValue(mockCourse);
      
      const updatedCourse = {
        _id: courseId,
        name: 'Updated Course Name'
      };
      (Course.findByIdAndUpdate as jest.Mock).mockResolvedValue(updatedCourse);
      
      // Execute
      await courseController.updateCourse(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(Course.findById).toHaveBeenCalledWith(courseId.toString());
      expect(Course.findByIdAndUpdate).toHaveBeenCalledWith(
        courseId.toString(),
        mockRequest.body,
        { new: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Course updated successfully',
          course: updatedCourse
        })
      );
    });

    it('should return 404 when course is not found', async () => {
      // Setup
      mockRequest.params = { id: 'nonexistent-id' };
      (Course.findById as jest.Mock).mockResolvedValue(null);
      
      // Execute
      await courseController.updateCourse(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Course not found' })
      );
    });

    it('should return 403 when user does not have access to the course', async () => {
      // Setup
      const courseId = new mongoose.Types.ObjectId();
      mockRequest.params = { id: courseId.toString() };
      
      const mockCourse = {
        _id: courseId,
        user_id: new mongoose.Types.ObjectId(), // Different from mockUserId
        equals: jest.fn().mockReturnValue(false)
      };
      (Course.findById as jest.Mock).mockResolvedValue(mockCourse);
      
      // Execute
      await courseController.updateCourse(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(403);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'You do not have access to this course' })
      );
    });
  });

  describe('deleteCourse', () => {
    it('should delete a course and its attendances', async () => {
      // Setup
      const courseId = new mongoose.Types.ObjectId();
      mockRequest.params = { id: courseId.toString() };
      
      const mockCourse = {
        _id: courseId,
        user_id: mockUserId,
        equals: jest.fn().mockReturnValue(true)
      };
      (Course.findById as jest.Mock).mockResolvedValue(mockCourse);
      (Attendance.deleteMany as jest.Mock).mockResolvedValue({});
      (Course.findByIdAndDelete as jest.Mock).mockResolvedValue({});
      
      // Execute
      await courseController.deleteCourse(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(Course.findById).toHaveBeenCalledWith(courseId.toString());
      expect(Attendance.deleteMany).toHaveBeenCalledWith({ course_id: courseId.toString() });
      expect(Course.findByIdAndDelete).toHaveBeenCalledWith(courseId.toString());
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Course and associated attendance records deleted successfully'
        })
      );
    });
  });

  describe('getCourseStats', () => {
    it('should return course statistics', async () => {
      // Setup
      const courseId = new mongoose.Types.ObjectId();
      mockRequest.params = { id: courseId.toString() };
      
      const mockCourse = {
        _id: courseId,
        name: 'Test Course',
        user_id: mockUserId,
        students: [
          { name: 'Student A', neptun_code: 'A12345' },
          { name: 'Student B', neptun_code: 'B54321' }
        ],
        equals: jest.fn().mockReturnValue(true)
      };
      (Course.findById as jest.Mock).mockResolvedValue(mockCourse);
      
      const mockAttendances = [
        {
          _id: new mongoose.Types.ObjectId(),
          date: new Date(),
          students: [
            { student_name: 'Student A', status: 'Megjelent' },
            { student_name: 'Student B', status: 'Késett' }
          ]
        },
        {
          _id: new mongoose.Types.ObjectId(),
          date: new Date(),
          students: [
            { student_name: 'Student A', status: 'Megjelent' },
            { student_name: 'Student B', status: 'Nem jelent meg' }
          ]
        }
      ];
      (Attendance.find as jest.Mock).mockResolvedValue(mockAttendances);
      
      // Execute
      await courseController.getCourseStats(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(Course.findById).toHaveBeenCalledWith(courseId.toString());
      expect(Attendance.find).toHaveBeenCalledWith({ course_id: courseId.toString() });
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          courseName: 'Test Course',
          totalSessions: 2,
          students: expect.arrayContaining([
            expect.objectContaining({
              student_name: 'Student A',
              attended: 2,
              missed: 0
            }),
            expect.objectContaining({
              student_name: 'Student B',
              late: 1,
              missed: 1
            })
          ])
        })
      );
    });
  });
}); 