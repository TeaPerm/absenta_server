import mongoose from 'mongoose';
import { Course } from '../../model/Course.model';
import { MongoMemoryServer } from 'mongodb-memory-server';

let mongoServer: MongoMemoryServer;

beforeAll(async () => {
  mongoServer = await MongoMemoryServer.create();
  await mongoose.connect(mongoServer.getUri());
});

afterAll(async () => {
  await mongoose.disconnect();
  await mongoServer.stop();
});

describe('Course Model Tests', () => {
  it('should create a course successfully', async () => {
    const courseData = {
      name: 'Test Course',
      university: 'BME',
      user_id: new mongoose.Types.ObjectId(),
      students: [
        { neptun_code: 'ABC123', name: 'Test Student' }
      ]
    };
    
    const course = new Course(courseData);
    const savedCourse = await course.save();
    
    expect(savedCourse._id).toBeDefined();
    expect(savedCourse.name).toBe(courseData.name);
    expect(savedCourse.university).toBe(courseData.university);
    expect(savedCourse.students.length).toBe(1);
    expect(savedCourse.students[0].neptun_code).toBe('ABC123');
  });

  it('should fail validation with invalid university', async () => {
    const courseData = {
      name: 'Test Course',
      university: 'INVALID',
      user_id: new mongoose.Types.ObjectId(),
      students: []
    };
    
    const course = new Course(courseData);
    
    await expect(course.save()).rejects.toThrow();
  });

  it('should fail validation with invalid neptun code', async () => {
    const courseData = {
      name: 'Test Course',
      university: 'BME',
      user_id: new mongoose.Types.ObjectId(),
      students: [
        { neptun_code: '12345', name: 'Short Neptun Code' } // should be 6 characters
      ]
    };
    
    const course = new Course(courseData);
    
    await expect(course.save()).rejects.toThrow();
  });
});