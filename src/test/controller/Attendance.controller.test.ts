import { Response } from 'express';
import { attendanceController } from '@/controller/Attendance.controller';
import { Course } from '@/model/Course.model';
import Attendance from '@/model/Attendance.model';
import { Image } from '@/model/Image.model';
import { TokenRequest } from '@/interface/Request.types';
import mongoose from 'mongoose';

jest.mock('@/model/Course.model');
jest.mock('@/model/Attendance.model');
jest.mock('@/model/Image.model');
jest.mock('@/lib/utils', () => ({
  authenticateUser: jest.fn().mockImplementation((req, res) => {
    if (req.userId) {
      return Promise.resolve({ _id: req.userId });
    }
    res.status(401).json({ error: 'Authentication failed' });
    return Promise.resolve(null);
  })
}));

describe('Attendance Controller Tests', () => {
  let mockRequest: Partial<TokenRequest>;
  let mockResponse: Partial<Response>;
  const mockUserId = new mongoose.Types.ObjectId();
  const mockCourseId = new mongoose.Types.ObjectId();
  const mockAttendanceId = new mongoose.Types.ObjectId();
  const mockImageId = new mongoose.Types.ObjectId();
  
  beforeEach(() => {
    mockRequest = {
      userId: mockUserId,
      params: {},
      body: {}
    };
    
    mockResponse = {
      status: jest.fn().mockReturnThis(),
      json: jest.fn(),
      set: jest.fn().mockReturnThis(),
      send: jest.fn()
    };
  });

  describe('createAttendance', () => {

    it('should return 400 when attendanceImage is missing', async () => {
      // Setup
      mockRequest.body = {
        course_id: mockCourseId.toString(),
        date: '2023-05-01',
        students: JSON.stringify([])
      };
      
      // No file attached
      mockRequest.file = undefined;
      
      // Execute
      await attendanceController.createAttendance(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'attendanceImage is required' })
      );
    });

    it('should return 400 when students data is missing', async () => {
      // Setup
      mockRequest.body = {
        course_id: mockCourseId.toString(),
        date: '2023-05-01'
      };
      
      mockRequest.file = {
        buffer: Buffer.from('test-image'),
        mimetype: 'image/jpeg',
        originalname: 'test.jpg',
        size: 1000,
        fieldname: 'attendanceImage',
        filename: 'test.jpg',
        path: '/tmp/test.jpg',
        destination: '/tmp',
        encoding: '7bit',
        stream: {} as any
      };
      
      // Execute
      await attendanceController.createAttendance(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(400);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'students data is required' })
      );
    });
  });

  describe('getImage', () => {
    it('should return an image', async () => {
      // Setup
      mockRequest.params = { imageId: mockImageId.toString() };
      
      const mockImage = {
        img: {
          data: Buffer.from('test-image'),
          contentType: 'image/jpeg'
        }
      };
      (Image.findById as jest.Mock).mockResolvedValue(mockImage);
      
      // Execute
      await attendanceController.getImage(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(Image.findById).toHaveBeenCalledWith(mockImageId.toString());
      expect(mockResponse.set).toHaveBeenCalledWith('Content-Type', 'image/jpeg');
      expect(mockResponse.send).toHaveBeenCalledWith(mockImage.img.data);
    });

    it('should return 404 when image is not found', async () => {
      // Setup
      mockRequest.params = { imageId: 'nonexistent-id' };
      (Image.findById as jest.Mock).mockResolvedValue(null);
      
      // Execute
      await attendanceController.getImage(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Image not found' })
      );
    });
  });

  describe('getAttendancesByCourse', () => {
    it('should return attendances for a course', async () => {
      // Setup
      mockRequest.params = { courseId: mockCourseId.toString() };
      
      const mockCourse = {
        _id: mockCourseId,
        user_id: mockUserId,
        equals: jest.fn().mockReturnValue(true)
      };
      (Course.findById as jest.Mock).mockResolvedValue(mockCourse);
      
      const mockAttendances = [
        { _id: new mongoose.Types.ObjectId(), date: new Date(), students: [] },
        { _id: new mongoose.Types.ObjectId(), date: new Date(), students: [] }
      ];
      
      const populateMock = jest.fn().mockReturnValue({
        sort: jest.fn().mockResolvedValue(mockAttendances)
      });
      (Attendance.find as jest.Mock).mockReturnValue({
        populate: populateMock
      });
      
      // Execute
      await attendanceController.getAttendancesByCourse(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(Course.findById).toHaveBeenCalledWith(mockCourseId.toString());
      expect(Attendance.find).toHaveBeenCalledWith({ course_id: mockCourseId.toString() });
      expect(populateMock).toHaveBeenCalledWith('attendanceImage', 'name desc');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAttendances);
    });

    it('should return 404 when course is not found', async () => {
      // Setup
      mockRequest.params = { courseId: 'nonexistent-id' };
      (Course.findById as jest.Mock).mockResolvedValue(null);
      
      // Execute
      await attendanceController.getAttendancesByCourse(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Course not found' })
      );
    });
  });

  describe('getAttendanceById', () => {
    it('should return an attendance record', async () => {
      // Setup
      mockRequest.params = { id: mockAttendanceId.toString() };
      
      const mockAttendance = {
        _id: mockAttendanceId,
        date: new Date(),
        students: []
      };
      
      const populateCourseMock = jest.fn().mockResolvedValue(mockAttendance);
      const populateImageMock = jest.fn().mockReturnValue({
        populate: populateCourseMock
      });
      (Attendance.findById as jest.Mock).mockReturnValue({
        populate: populateImageMock
      });
      
      // Execute
      await attendanceController.getAttendanceById(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(Attendance.findById).toHaveBeenCalledWith(mockAttendanceId.toString());
      expect(populateImageMock).toHaveBeenCalledWith('attendanceImage', 'name desc');
      expect(populateCourseMock).toHaveBeenCalledWith('course_id', 'name');
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(mockAttendance);
    });

    it('should return 404 when attendance is not found', async () => {
      // Setup
      mockRequest.params = { id: 'nonexistent-id' };
      
      const populateCourseMock = jest.fn().mockResolvedValue(null);
      const populateImageMock = jest.fn().mockReturnValue({
        populate: populateCourseMock
      });
      (Attendance.findById as jest.Mock).mockReturnValue({
        populate: populateImageMock
      });
      
      // Execute
      await attendanceController.getAttendanceById(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Attendance not found' })
      );
    });
  });

  describe('updateAttendance', () => {
    it('should update an attendance record', async () => {
      // Setup
      mockRequest.params = { id: mockAttendanceId.toString() };
      mockRequest.body = {
        status: 'verified',
        students: [
          { student_name: 'Student A', neptun_code: 'A12345', status: 'Megjelent' }
        ]
      };
      
      const mockAttendance = {
        _id: mockAttendanceId,
        course_id: { _id: mockCourseId }
      };
      
      const populateMock = jest.fn().mockResolvedValue(mockAttendance);
      (Attendance.findById as jest.Mock).mockReturnValue({
        populate: populateMock
      });
      
      const populateUpdateMock = jest.fn().mockResolvedValue({
        _id: mockAttendanceId,
        status: 'verified'
      });
      (Attendance.findByIdAndUpdate as jest.Mock).mockReturnValue({
        populate: populateUpdateMock
      });
      
      // Execute
      await attendanceController.updateAttendance(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(Attendance.findById).toHaveBeenCalledWith(mockAttendanceId.toString());
      expect(Attendance.findByIdAndUpdate).toHaveBeenCalledWith(
        mockAttendanceId.toString(),
        {
          status: 'verified',
          students: mockRequest.body.students
        },
        { new: true }
      );
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({
          message: 'Attendance updated successfully',
          attendance: expect.objectContaining({
            _id: mockAttendanceId,
            status: 'verified'
          })
        })
      );
    });

    it('should return 404 when attendance is not found', async () => {
      // Setup
      mockRequest.params = { id: 'nonexistent-id' };
      
      const populateMock = jest.fn().mockResolvedValue(null);
      (Attendance.findById as jest.Mock).mockReturnValue({
        populate: populateMock
      });
      
      // Execute
      await attendanceController.updateAttendance(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Attendance not found' })
      );
    });
  });

  describe('deleteAttendance', () => {
    it('should delete an attendance record and its image', async () => {
      // Setup
      mockRequest.params = { id: mockAttendanceId.toString() };
      
      const mockAttendance = {
        _id: mockAttendanceId,
        attendanceImage: { _id: mockImageId },
        course_id: { _id: mockCourseId }
      };
      
      const populateCourseMock = jest.fn().mockResolvedValue(mockAttendance);
      const populateImageMock = jest.fn().mockReturnValue({
        populate: populateCourseMock
      });
      (Attendance.findById as jest.Mock).mockReturnValue({
        populate: populateImageMock
      });
      
      (Image.findByIdAndDelete as jest.Mock).mockResolvedValue({});
      (Attendance.findByIdAndDelete as jest.Mock).mockResolvedValue({});
      
      // Execute
      await attendanceController.deleteAttendance(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(Attendance.findById).toHaveBeenCalledWith(mockAttendanceId.toString());
      expect(Image.findByIdAndDelete).toHaveBeenCalledWith(mockImageId);
      expect(Attendance.findByIdAndDelete).toHaveBeenCalledWith(mockAttendanceId.toString());
      expect(mockResponse.status).toHaveBeenCalledWith(200);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ message: 'Attendance deleted successfully' })
      );
    });

    it('should return 404 when attendance is not found', async () => {
      // Setup
      mockRequest.params = { id: 'nonexistent-id' };
      
      const populateCourseMock = jest.fn().mockResolvedValue(null);
      const populateImageMock = jest.fn().mockReturnValue({
        populate: populateCourseMock
      });
      (Attendance.findById as jest.Mock).mockReturnValue({
        populate: populateImageMock
      });
      
      // Execute
      await attendanceController.deleteAttendance(mockRequest as TokenRequest, mockResponse as Response);
      
      // Assert
      expect(mockResponse.status).toHaveBeenCalledWith(404);
      expect(mockResponse.json).toHaveBeenCalledWith(
        expect.objectContaining({ error: 'Attendance not found' })
      );
    });
  });
}); 