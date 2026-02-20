import React, { useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import withLayoutDoctor from "@/libs/components/layout/LayoutDoctor";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import { doctorVar } from "@/apollo/store";
import {
  GET_BOARD_ARTICLES,
  GET_COMMENTS,
  GET_MEMBER,
  GET_MEMBER_FOLLOWERS,
  GET_MEMBER_FOLLOWINGS,
} from "@/apollo/doctor/query";
import {
  CREATE_COMMENT,
  LIKE_TARGET_MEMBER,
  SUBSCRIBE_DOCTOR,
  SUBSCRIBE_MEMBER,
  UNSUBSCRIBE_DOCTOR,
  UNSUBSCRIBE_MEMBER,
} from "@/apollo/doctor/mutation";
import { Member } from "@/libs/types/members/member";
import { BoardArticle, BoardArticles } from "@/libs/types/board-article/board-article";
import { BoardArticlesInquiry } from "@/libs/types/board-article/board-article.input";
import { Comments, Comment } from "@/libs/types/comment/comment";
import { CommentsInquiry, CommentInput } from "@/libs/types/comment/comment.input";
import { FollowInquiry } from "@/libs/types/follow/follow.input";
import { Followers, Followings } from "@/libs/types/follow/follow";
import { CommentGroup } from "@/libs/enums/comment.enum";
import { MemberType } from "@/libs/enums/member.enum";
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from "@/libs/sweetAlert";
import { Messages } from "@/libs/config";
import { Direction } from "@/libs/enums/common.enum";

interface GetMemberResponse {
  getMember: Member;
}

interface GetMemberVariables {
  input: string;
}

interface GetBoardArticlesResponse {
  getBoardArticles: BoardArticles;
}

interface GetBoardArticlesVariables {
  input: BoardArticlesInquiry;
}

interface GetCommentsResponse {
  getComments: Comments;
}

interface GetCommentsVariables {
  input: CommentsInquiry;
}

interface GetFollowersResponse {
  getMemberFollowers: Followers;
}

interface GetFollowingsResponse {
  getMemberFollowings: Followings;
}

interface GetFollowVariables {
  input: FollowInquiry;
}

interface CreateCommentResponse {
  createComment: Comment;
}

interface CreateCommentVariables {
  input: CommentInput;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:3004";

const toAbsoluteMediaUrl = (value?: string): string => {
  const src = String(value || "").trim();
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/img/")) return src;
  if (src.startsWith("/uploads/")) return `${API_BASE_URL}${src}`;
  if (src.startsWith("uploads/")) return `${API_BASE_URL}/${src}`;
  return src;
};

const isFollowedByMe = (value: any): boolean => {
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value?.myFollowing);
};

const isLikedByMe = (value: any): boolean => {
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value?.myFavorite);
};

const DoctorPatientDetail: NextPage = () => {
  const router = useRouter();
  const doctor = useReactiveVar(doctorVar);
  const actorId = doctor?._id || "";
  const [tab, setTab] = useState(0);
  const [reviewText, setReviewText] = useState("");

  const rawId = router.query.id;
  const patientId = Array.isArray(rawId) ? rawId[0] : rawId || "";

  const {
    loading: getMemberLoading,
    data: getMemberData,
    error: getMemberError,
    refetch: getMemberRefetch,
  } = useQuery<GetMemberResponse, GetMemberVariables>(GET_MEMBER, {
    fetchPolicy: "cache-and-network",
    variables: { input: patientId },
    notifyOnNetworkStatusChange: true,
    skip: !patientId,
  });

  const articlesInput = useMemo<BoardArticlesInquiry>(
    () => ({
      page: 1,
      limit: 200,
      sort: "createdAt",
      direction: Direction.DESC,
      search: {},
    }),
    [],
  );

  const {
    loading: getArticlesLoading,
    data: getArticlesData,
    refetch: getArticlesRefetch,
  } = useQuery<GetBoardArticlesResponse, GetBoardArticlesVariables>(GET_BOARD_ARTICLES, {
    fetchPolicy: "cache-and-network",
    variables: { input: articlesInput },
    notifyOnNetworkStatusChange: true,
    skip: !patientId,
  });

  const commentsInput = useMemo<CommentsInquiry>(
    () => ({
      page: 1,
      limit: 50,
      sort: "createdAt",
      direction: Direction.DESC,
      search: { commentRefId: patientId },
    }),
    [patientId],
  );

  const {
    loading: getCommentsLoading,
    data: getCommentsData,
    refetch: getCommentsRefetch,
  } = useQuery<GetCommentsResponse, GetCommentsVariables>(GET_COMMENTS, {
    fetchPolicy: "cache-and-network",
    variables: { input: commentsInput },
    notifyOnNetworkStatusChange: true,
    skip: !patientId,
  });

  const followersInput = useMemo<FollowInquiry>(
    () => ({
      page: 1,
      limit: 100,
      search: { followingId: patientId },
    }),
    [patientId],
  );

  const followingsInput = useMemo<FollowInquiry>(
    () => ({
      page: 1,
      limit: 100,
      search: { followerId: patientId },
    }),
    [patientId],
  );

  const { loading: getFollowersLoading, data: getFollowersData, refetch: getFollowersRefetch } =
    useQuery<GetFollowersResponse, GetFollowVariables>(GET_MEMBER_FOLLOWERS, {
      fetchPolicy: "cache-and-network",
      variables: { input: followersInput },
      notifyOnNetworkStatusChange: true,
      skip: !patientId,
    });

  const { loading: getFollowingsLoading, data: getFollowingsData, refetch: getFollowingsRefetch } =
    useQuery<GetFollowingsResponse, GetFollowVariables>(GET_MEMBER_FOLLOWINGS, {
      fetchPolicy: "cache-and-network",
      variables: { input: followingsInput },
      notifyOnNetworkStatusChange: true,
      skip: !patientId,
    });

  const [likeTargetMember] = useMutation(LIKE_TARGET_MEMBER);
  const [subscribeDoctor] = useMutation(SUBSCRIBE_DOCTOR);
  const [unsubscribeDoctor] = useMutation(UNSUBSCRIBE_DOCTOR);
  const [subscribeMember] = useMutation(SUBSCRIBE_MEMBER);
  const [unsubscribeMember] = useMutation(UNSUBSCRIBE_MEMBER);
  const [createComment] = useMutation<CreateCommentResponse, CreateCommentVariables>(CREATE_COMMENT);

  const patient = getMemberData?.getMember;
  const liked = isLikedByMe(patient?.meLiked);
  const followed = isFollowedByMe(patient?.meFollowed);
  const likeCount = patient?.memberLikes || 0;
  const followerCount =
    getFollowersData?.getMemberFollowers?.metaCounter?.[0]?.total ??
    patient?.memberFollowers ??
    0;
  const followingsCount =
    getFollowingsData?.getMemberFollowings?.metaCounter?.[0]?.total ??
    patient?.memberFollowings ??
    0;

  const patientArticles = useMemo(
    () =>
      (getArticlesData?.getBoardArticles?.list ?? []).filter(
        (article: BoardArticle) => article.memberId === patientId,
      ),
    [getArticlesData, patientId],
  );

  const patientReviews = useMemo(
    () =>
      (getCommentsData?.getComments?.list ?? []).filter(
        (comment) =>
          comment.commentGroup === CommentGroup.MEMBER && !comment.parentCommentId,
      ),
    [getCommentsData],
  );

  const followerUsers = useMemo(
    () => getFollowersData?.getMemberFollowers?.list ?? [],
    [getFollowersData],
  );
  const followingUsers = useMemo(
    () => getFollowingsData?.getMemberFollowings?.list ?? [],
    [getFollowingsData],
  );

  const toggleTargetFollow = async (
    targetId: string,
    targetType: MemberType | undefined,
    currentlyFollowing: boolean,
  ) => {
    try {
      if (!targetId) return;
      if (!actorId) throw new Error(Messages.error2);
      if (targetId === actorId) return;

      const isDoctorTarget = targetType === MemberType.DOCTOR;
      if (currentlyFollowing) {
        if (isDoctorTarget) {
          await unsubscribeDoctor({ variables: { input: targetId } });
        } else {
          await unsubscribeMember({ variables: { input: targetId } });
        }
      } else {
        if (isDoctorTarget) {
          await subscribeDoctor({ variables: { input: targetId } });
        } else {
          await subscribeMember({ variables: { input: targetId } });
        }
      }

      await Promise.all([
        getFollowersRefetch({ input: followersInput }),
        getFollowingsRefetch({ input: followingsInput }),
        getMemberRefetch({ input: patientId }),
      ]);
      await sweetTopSmallSuccessAlert("Success!", 800);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const likeMemberHandler = async () => {
    try {
      if (!patientId) return;
      if (!actorId) throw new Error(Messages.error2);
      if (actorId === patientId) return;

      await likeTargetMember({ variables: { input: patientId } });
      await getMemberRefetch({ input: patientId });
      await sweetTopSmallSuccessAlert("Success!", 800);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const followMemberHandler = async () => {
    try {
      if (!patientId) return;
      if (!actorId) throw new Error(Messages.error2);
      if (actorId === patientId) return;

      if (followed) {
        await unsubscribeMember({ variables: { input: patientId } });
      } else {
        await subscribeMember({ variables: { input: patientId } });
      }

      await Promise.all([
        getMemberRefetch({ input: patientId }),
        getFollowersRefetch({ input: followersInput }),
        getFollowingsRefetch({ input: followingsInput }),
      ]);
      await sweetTopSmallSuccessAlert("Success!", 800);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const handleAddReview = async () => {
    try {
      const text = reviewText.trim();
      if (!text) throw new Error(Messages.error4);
      if (!patientId) return;
      if (!actorId) throw new Error(Messages.error2);

      await createComment({
        variables: {
          input: {
            commentGroup: CommentGroup.MEMBER,
            commentContent: text,
            commentRefId: patientId,
          },
        },
      });

      setReviewText("");
      await Promise.all([
        getCommentsRefetch({ input: commentsInput }),
        getMemberRefetch({ input: patientId }),
      ]);
      await sweetTopSmallSuccessAlert("Review posted", 800);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  if (!patientId || getMemberLoading) {
    return (
      <Stack sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", minHeight: "70vh" }}>
        <CircularProgress size={"3rem"} />
      </Stack>
    );
  }

  if (getMemberError || !patient) {
    return (
      <Box className="doctor-patient-detail">
        <Box className="doctor-patient-detail__container">
          <Typography>Patient not found.</Typography>
        </Box>
      </Box>
    );
  }

  const patientImage = toAbsoluteMediaUrl(patient.memberImage) || "/img/defaultUser.svg";
  const patientName = patient.memberNick || "Unknown";

  return (
    <Box className="doctor-patient-detail">
      <Box className="doctor-patient-detail__container">
        <Box className="doctor-patient-detail__top">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={patientImage} className="doctor-patient-detail__avatar" />
            <Box>
              <Typography className="doctor-patient-detail__name">{patientName}</Typography>
              <Typography className="doctor-patient-detail__role">PATIENT</Typography>
              <Stack direction="row" spacing={1} alignItems="center" className="doctor-patient-detail__like-row">
                <button
                  type="button"
                  className="doctor-patient-detail__icon-btn"
                  onClick={likeMemberHandler}
                >
                  {liked ? <FavoriteIcon className="liked" /> : <FavoriteBorderIcon />}
                </button>
                <Typography className="doctor-patient-detail__like-text">
                  {likeCount} Likes
                </Typography>
              </Stack>
            </Box>
          </Stack>

          {actorId !== patientId ? (
            <Button
              variant={followed ? "outlined" : "contained"}
              startIcon={followed ? <PersonRemoveIcon /> : <PersonAddIcon />}
              onClick={followMemberHandler}
              className={followed ? "doctor-patient-detail__unfollow-btn" : "doctor-patient-detail__follow-btn"}
            >
              {followed ? "Unfollow" : "Follow"}
            </Button>
          ) : null}
        </Box>

        <Box className="doctor-patient-detail__stats">
          <Box className="doctor-patient-detail__stat">
            <Typography className="doctor-patient-detail__stat-num">{followerCount}</Typography>
            <Typography className="doctor-patient-detail__stat-label">Followers</Typography>
          </Box>
          <Box className="doctor-patient-detail__divider" />
          <Box className="doctor-patient-detail__stat">
            <Typography className="doctor-patient-detail__stat-num">{followingsCount}</Typography>
            <Typography className="doctor-patient-detail__stat-label">Followings</Typography>
          </Box>
        </Box>

        <Box className="doctor-patient-detail__tabs-wrap">
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            className="doctor-patient-detail__tabs"
            TabIndicatorProps={{ className: "doctor-patient-detail__tab-indicator" }}
          >
            <Tab label="Articles" className="doctor-patient-detail__tab" />
            <Tab label="Reviews" className="doctor-patient-detail__tab" />
            <Tab label="Followers" className="doctor-patient-detail__tab" />
            <Tab label="Followings" className="doctor-patient-detail__tab" />
          </Tabs>
        </Box>

        <Box className="doctor-patient-detail__content">
          {tab === 0 && (
            <Stack spacing={1.5}>
              {getArticlesLoading ? (
                <Stack sx={{ py: 2, alignItems: "center" }}>
                  <CircularProgress size={"2rem"} />
                </Stack>
              ) : patientArticles.length === 0 ? (
                <Typography>No articles yet.</Typography>
              ) : (
                patientArticles.map((article) => (
                  <Box
                    key={article._id}
                    className="doctor-patient-detail__item-card"
                    sx={{ cursor: "pointer" }}
                    onClick={() => router.push(`/_doctor/community/detail?id=${article._id}`)}
                  >
                    <Typography className="doctor-patient-detail__item-title">
                      {article.articleTitle}
                    </Typography>
                    <Typography className="doctor-patient-detail__item-sub">
                      {new Date(article.createdAt).toLocaleDateString("en-US")}
                    </Typography>
                  </Box>
                ))
              )}
            </Stack>
          )}

          {tab === 1 && (
            <Stack spacing={1.5}>
              {getCommentsLoading ? (
                <Stack sx={{ py: 2, alignItems: "center" }}>
                  <CircularProgress size={"2rem"} />
                </Stack>
              ) : patientReviews.length === 0 ? (
                <Typography>No reviews yet.</Typography>
              ) : (
                patientReviews.map((review) => (
                  <Box key={review._id} className="doctor-patient-detail__item-card">
                    <Typography className="doctor-patient-detail__item-title">
                      {review.memberData?.memberNick || "Unknown"}
                    </Typography>
                    <Typography className="doctor-patient-detail__item-sub">
                      {review.commentContent}
                    </Typography>
                    <Typography className="doctor-patient-detail__item-date">
                      {new Date(review.createdAt).toLocaleDateString("en-US")}
                    </Typography>
                  </Box>
                ))
              )}

              <Box className="doctor-patient-detail__review-form">
                <Typography className="doctor-patient-detail__item-title">
                  Write a Review
                </Typography>
                <TextField
                  multiline
                  minRows={3}
                  placeholder="Write your review..."
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  className="doctor-patient-detail__review-input"
                />
                <Button
                  variant="contained"
                  onClick={handleAddReview}
                  disabled={!reviewText.trim()}
                  className="doctor-patient-detail__review-submit"
                >
                  Submit Review
                </Button>
              </Box>
            </Stack>
          )}

          {tab === 2 && (
            <Stack spacing={1.5}>
              {getFollowersLoading ? (
                <Stack sx={{ py: 2, alignItems: "center" }}>
                  <CircularProgress size={"2rem"} />
                </Stack>
              ) : followerUsers.length === 0 ? (
                <Typography>No followers.</Typography>
              ) : (
                followerUsers.map((row) => (
                  <Box key={row._id} className="doctor-patient-detail__item-card">
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography className="doctor-patient-detail__item-title">
                        {row.followerData?.memberNick || (row.followerData as any)?.memberFullName || "Unknown"}
                      </Typography>
                      {row.followerData?._id && row.followerData._id !== actorId ? (
                        <Button
                          size="small"
                          variant={isFollowedByMe(row.meFollowed) ? "outlined" : "contained"}
                          onClick={() =>
                            toggleTargetFollow(
                              row.followerData?._id || "",
                              row.followerData?.memberType as MemberType | undefined,
                              isFollowedByMe(row.meFollowed),
                            )
                          }
                        >
                          {isFollowedByMe(row.meFollowed) ? "Following" : "Follow"}
                        </Button>
                      ) : null}
                    </Stack>
                  </Box>
                ))
              )}
            </Stack>
          )}

          {tab === 3 && (
            <Stack spacing={1.5}>
              {getFollowingsLoading ? (
                <Stack sx={{ py: 2, alignItems: "center" }}>
                  <CircularProgress size={"2rem"} />
                </Stack>
              ) : followingUsers.length === 0 ? (
                <Typography>No followings.</Typography>
              ) : (
                followingUsers.map((row) => (
                  <Box key={row._id} className="doctor-patient-detail__item-card">
                    <Stack direction="row" justifyContent="space-between" alignItems="center">
                      <Typography className="doctor-patient-detail__item-title">
                        {row.followingData?.memberNick || (row.followingData as any)?.memberFullName || "Unknown"}
                      </Typography>
                      {row.followingData?._id && row.followingData._id !== actorId ? (
                        <Button
                          size="small"
                          variant={isFollowedByMe(row.meFollowed) ? "outlined" : "contained"}
                          onClick={() =>
                            toggleTargetFollow(
                              row.followingData?._id || "",
                              row.followingData?.memberType as MemberType | undefined,
                              isFollowedByMe(row.meFollowed),
                            )
                          }
                        >
                          {isFollowedByMe(row.meFollowed) ? "Following" : "Follow"}
                        </Button>
                      ) : null}
                    </Stack>
                  </Box>
                ))
              )}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default withLayoutDoctor(DoctorPatientDetail);
