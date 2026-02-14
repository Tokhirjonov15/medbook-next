import { CommentGroup, CommentStatus } from "../../enums/comment.enum";
import { Member } from "../members/member";
import { MetaCounter } from "../doctors/doctor";
import { MeLiked } from "../like/like";

export interface Comment {
  _id: string;
  commentStatus: CommentStatus;
  commentGroup: CommentGroup;
  commentContent: string;
  commentRefId: string;
  parentCommentId?: string;
  commentReplies: number;
  commentLikes: number;
  replies?: Comment[];
  memberId: string;
  createdAt: Date;
  updatedAt: Date;

  /** from aggregation **/
  meLiked?: MeLiked;
  memberData?: Member;
}

export interface Comments {
  list: Comment[];
  metaCounter: MetaCounter[];
}
