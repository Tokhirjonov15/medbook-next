import { MemberStatus, MemberType } from "../../enums/member.enum";
import { MeLiked } from "../like/like";
import { MetaCounter } from "../doctors/doctor";
import { MeFollowed } from "../follow/follow";
import { Gender } from "@/libs/enums/gender.enum";

export interface Coordinates {
  lat: number;
  lng: number;
}

export interface Address {
  street?: string;
  city?: string;
  state?: string;
  country?: string;
  zipCode?: string;
  coordinates?: Coordinates;
}

export interface EmergencyContact {
  name: string;
  relationship: string;
  phone: string;
}

export interface Member {
  _id: string;
  memberNick: string;
  memberType: MemberType;
  memberStatus: MemberStatus;
  memberPhone: string;
  memberPassword?: string;
  memberImage: string;
  memberGender?: Gender;
  memberArticles: number;
  memberFollowers: number;
  memberLikes: number;
  memberFollowings: number;
  memberComments: number;
  memberWarnings: number;
  memberBlocks: number;
  memberAddress?: Address;
  isActive: boolean;
  lastLogin?: Date;
  bloodGroup?: string;
  allergies?: string[];
  chronicDiseases?: string[];
  emergencyContact?: EmergencyContact;
  doctorProfile?: string;
  createdAt: Date;
  updatedAt: Date;
  accessToken?: string;

  /** from aggregation  */
  meLiked?: MeLiked;
  meFollowed?: MeFollowed[];
}

export interface Members {
  list: Member[];
  metaCounter: MetaCounter[];
}
