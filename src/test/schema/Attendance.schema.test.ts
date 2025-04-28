import { attendanceCreateSchema } from '../../schema/Attendance.schema';
import mongoose from 'mongoose';

describe('Attendance Schema Tests', () => {
  it('should reject invalid course_id format', () => {
    const invalidData = {
      course_id: 'not-a-valid-id',
      date: new Date().toISOString(),
      status: 'not_uploaded'
    };
    
    const result = attendanceCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });

  it('should reject invalid status', () => {
    const invalidData = {
      course_id: new mongoose.Types.ObjectId().toString(),
      date: new Date().toISOString(),
      status: 'invalid_status'
    };
    
    const result = attendanceCreateSchema.safeParse(invalidData);
    expect(result.success).toBe(false);
  });
});