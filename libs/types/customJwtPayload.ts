import { JwtPayload } from "jwt-decode";

export interface CustomJwtPayloadMember extends JwtPayload {
  _id: string;
  memberType: string;
  memberStatus: string;
  memberPhone: string;
  memberNick: string;
  memberFullName?: string;
  memberImage?: string;
  memberAddress?: string;
  memberDesc?: string;
  memberGender?: string;
  memberArticles: number;
  memberLikes: number;
  memberViews: number;
  memberWarnings: number;
  memberBlocks: number;
  isActive: boolean;
  lastLogin: Date | null;
  bloodGroup: string;
  allergies: string[];
  chronicDiseases: string[];
  emergencyContact: string;
}

export interface CustomJwtPayloadDoctor extends JwtPayload {
  _id: string;
  memberType: string;
  memberStatus: string;
  totalPatients: number;
  memberPhone: string;
  memberNick: string;
  memberFullName?: string;
  memberImage?: string;
  memberAddress?: string;
  memberDesc?: string;
  memberGender: string;
  memberArticles: number;
  memberLikes: number;
  memberViews: number;
  memberWarnings: number;
  memberBlocks: number;
  licenseNumber: string;
  specialization: string | string[];
  experience: number;
  languages: string[];
  clinicName: string;
  clinicAddress: string;
  consultationFee: number;
  consultationType: string;
  workingDays: string[];
  workingHours: string[];
  breakTime: string[];
  reviewCount: number;
  awards: string[];
}

