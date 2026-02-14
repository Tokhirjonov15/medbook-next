import { MemberStatus } from "../../enums/member.enum";

export interface MemberUpdate {
  _id?: string;
  memberStatus?: MemberStatus;
  memberPhone?: string;
  memberNick?: string;
  memberPassword?: string;
  memberImage?: string;
  memberAddress?: string;
  bloodGroup?: string;
  allergies?: string;
  chronicDiseases?: string;
  emergencyContact?: string;
  deletedAt?: Date;
}
