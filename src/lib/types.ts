// src/lib/types.ts
export interface User {
  username: string;
  type?: string;
  company_id?: string | null;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  message: string;
  user?: User;
}

export interface ApiResponse {
  message: string;
  user?: User;
}

export interface CourseAssignment {
  _id?: string;
  university: string;
  course: string;
  specialization: string;
  assignedAt: string;
  studentId?: string; // Make optional for backward compatibility
  externalApiStatus?: boolean; // Make optional for backward compatibility
  externalApiExists?: number; // Make optional for backward compatibility
  externalApiMessage?: string; // Make optional for backward compatibility
}

export interface Internship {
  _id: string;
  designation: string;
  duration: string;
  isActive: boolean;
  stipend: number;
  location: string;
  details: string;
  createdAt: string;
  updatedAt: string;
}

export interface Company {
  _id: string;
  name: string;
  internships: Internship[];
  createdAt: string;
  updatedAt: string;
}

export interface InternshipAssignment {
  _id?: string;
  companyId: string;
  companyName: string;
  internshipId: string;
  designation: string;
  duration: string;
  stipend: number;
  location: string;
  details: string;
  assignedAt: string;
  status: "assigned" | "started" | "completed" | "cancelled";
}

export interface DatabaseUser {
  _id: string;
  company_id?: string | null;
  name?: string;
  email?: string;
  companyEmail?: string;
  phoneNumber: string;
  officeEmail?: string;
  cinPanGst?: string;
  dateOfBirth?: string; // Add dateOfBirth field
  agreeToTerms: boolean;
  isRecruiter: boolean;
  isVerified: boolean;
  remarks?: string;
  // New course assignments field (multiple courses support)
  assignedCourses?: CourseAssignment[];
  // New internship assignments field
  assignedInternships?: InternshipAssignment[];
  tags?: (Tag | string)[];
  createdAt: string;
  updatedAt: string;
}

export interface ExternalApiResponse {
  status: boolean;
  student_id: string;
  message: string;
  exists: number;
}

export interface ExternalApiRequest {
  full_name: string;
  email: string;
  mobile: string;
  dob: string;
  interested_university: string;
  course: string;
  specialization: string;
  source: string;
  sub_source: string;
  lead_owner: string;
}

export interface Tag {
  _id: string;
  name: string;
  definition: string;
  createdAt: string;
  updatedAt: string;
}
