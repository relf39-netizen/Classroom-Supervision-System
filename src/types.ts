export interface User {
  userId: string;
  username: string;
  fullname: string;
  role: UserRole;
  createdAt: string;
}

export interface Teacher {
  teacherId: string;
  name: string;
  position: string;
  subjectGroup: string;
  phone: string;
  userId?: string;
}

export interface AcademicYear {
  id?: string;
  year: string;
  semester: string;
}

export enum UserRole {
  ADMIN = "admin",
  DIRECTOR = "director",
  TEACHER = "teacher",
}

export interface EvaluationItem {
  itemId: string;
  category: string;
  itemName: string;
  maxScore: number;
}

export interface Observation {
  id?: string;
  teacherId: string;
  teacherName: string;
  teacherUserId?: string;
  observerId: string;
  observerName: string;
  date: string;
  subject: string;
  gradeLevel: string;
  classRoom: string;
  studentCount: number;
  academicYear: string;
  semester: string;
  strengths: string;
  suggestions: string;
  developmentPlan: string;
  totalScore: number;
  averageScore: number;
  evaluationLevel: string;
  photos: string[];
  createdAt: string;
}

export interface ObservationScore {
  scoreId?: string;
  observationId: string;
  itemId: string;
  score: number;
  remark: string;
}

export type QualityLevel = "ดีเยี่ยม" | "ดีมาก" | "ดี" | "พอใช้" | "ปรับปรุง";

export const mapScoreToLevel = (average: number): QualityLevel => {
  if (average >= 4.51) return "ดีเยี่ยม";
  if (average >= 3.51) return "ดีมาก";
  if (average >= 2.51) return "ดี";
  if (average >= 1.51) return "พอใช้";
  return "ปรับปรุง";
};

export const EVALUATION_CATEGORIES = [
  "หมวดที่ 1 สภาพห้องเรียน",
  "หมวดที่ 2 การบริหารจัดการห้องเรียน",
  "หมวดที่ 3 ครูผู้สอน",
  "หมวดที่ 4 การปฏิบัติตนของครู",
  "หมวดที่ 5 นักเรียน"
];
