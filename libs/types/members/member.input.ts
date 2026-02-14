import { MemberType } from "../../enums/member.enum";
import { Direction } from "../../enums/common.enum";
import { Specialization } from "../../enums/specialization.enum";
import { ConsultationType } from "../../enums/consultation.enum";
import { Gender } from "@/libs/enums/gender.enum";

export interface SignupInput {
  memberNick: string;
  memberPassword: string;
  memberType?: MemberType;
  memberPhone: string;
  memberGender?: Gender;
}

export interface LoginInput {
  memberNick: string;
  memberPassword: string;
}

export interface PricesRange {
  start: number;
  end: number;
}

interface DISearch {
  memberId?: string;
  specializationList?: Specialization;
  consultationTypeList?: ConsultationType;
  pricesRange?: PricesRange;
  text?: string;
}

export interface DoctorsInquiry {
  page: number;
  limit: number;
  sort?: number;
  direction?: Direction;
  search: DISearch;
}

interface MISearch {
  memberType?: MemberType;
  text?: string;
}

export interface MembersInquiry {
  page: number;
  limit: number;
  sort?: number;
  direction?: Direction;
  search: MISearch;
}
