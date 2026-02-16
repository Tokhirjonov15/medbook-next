import { MemberStatus, MemberType } from "../../enums/member.enum";
import { MeLiked } from "../like/like";
import { MeFollowed } from "../follow/follow";
import { Gender } from "@/libs/enums/gender.enum";

export interface Doctor {
  _id: string;
  memberNick: string;
  memberStatus: MemberStatus;
  memberFullName: string;
  memberPhone: string;
  memberDesc: string;
  memberPassword?: string;
  memberArticles: number;
  memberFollowers: number;
  memberFollowings: number;
  memberComments: number;
  memberWarnings: number;
  memberBlocks: number;
  memberLikes: number;
  licenseNumber: string;
  specialization: string | string[];
  experience: number;
  consultationFee: number;
  memberType: MemberType;
  memberGender?: Gender;
  languages?: string[];
  memberImage?: string;
  accessToken?: string;
  clinicAddress?: string;
  clinicName?: string;
  workingDays?: string[];
  workingHours?: string[];
  breakTime?: string[];
  doctorViews: number;
  reviewCount: number;
  createdAt: Date;
  updatedAt: Date;

  /** from aggregation  */
  meLiked?: MeLiked[];
  meFollowed?: MeFollowed[];
}

export interface Doctors {
  list: Doctor[];
  metaCounter: MetaCounter[];
}

export interface MetaCounter {
  total: number;
}
