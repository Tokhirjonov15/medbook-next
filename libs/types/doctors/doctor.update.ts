import { Gender } from "@/libs/enums/gender.enum";
import { MemberStatus } from "@/libs/enums/member.enum";
import { Specialization } from "../../enums/specialization.enum";

export interface DoctorUpdate {
  _id?: string;
  memberNick?: string;
  memberStatus?: MemberStatus;
  memberPassword?: string;
  memberFullName?: string;
  memberPhone?: string;
  memberImage?: string;
  memberDesc?: string;
  memberGender?: Gender;
  licenseNumber?: string;
  specialization?: Specialization | Specialization[];
  experience?: number;
  consultationFee?: number;
  languages?: string[];
  consultationType?: string;
  workingDays?: string[];
  workingHours?: string[];
  breakTime?: string[];
  clinicAddress?: string;
  clinicName?: string;
  awards?: string[];
}
