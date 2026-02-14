import { Gender } from "@/libs/enums/gender.enum";

export interface DoctorSignupInput {
  memberNick: string;
  memberFullName: string;
  memberPassword: string;
  memberPhone: string;
  licenseNumber: string;
  specialization: string;
  experience: number;
  consultationFee: number;
  memberGender?: Gender;
  languages?: string[];
  consultationType?: string;
  memberImage?: string;
  memberDesc?: string;
  workingDays?: string[];
  workingHours?: string[];
  breakTime?: string[];
}

export interface OrdinaryInquiry {
  page: number;
  limit: number;
}
