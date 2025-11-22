export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  role: UserRole;
  createdAt: Date;
  updatedAt: Date;
}

export enum UserRole {
  ADMIN = 'ADMIN',
  RECRUITER = 'RECRUITER',
  CANDIDATE = 'CANDIDATE'
}

export interface Quiz {
  id: number;
  title: string;
  description: string;
  duration: number; // in minutes
  questions: Question[];
  createdAt: Date;
  updatedAt: Date;
}

export interface Question {
  id: number;
  text: string;
  type: QuestionType;
  options: Answer[];
  correctAnswers: number[];
  points: number;
}

export enum QuestionType {
  MULTIPLE_CHOICE = 'MULTIPLE_CHOICE',
  SINGLE_CHOICE = 'SINGLE_CHOICE',
  TRUE_FALSE = 'TRUE_FALSE',
  TEXT = 'TEXT'
}

export interface Answer {
  id: number;
  text: string;
}

export interface LoginCredentials {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    userRole: string;
    adminMode?: boolean;
  };
}
