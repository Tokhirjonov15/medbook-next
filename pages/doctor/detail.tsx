import React, { useMemo, useState } from "react";
import { NextPage } from "next";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useApolloClient, useMutation, useQuery, useReactiveVar } from "@apollo/client";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LanguageIcon from "@mui/icons-material/Language";
import EditIcon from "@mui/icons-material/Edit";
import SendIcon from "@mui/icons-material/Send";
import ReplyIcon from "@mui/icons-material/Reply";
import withLayoutMain from "@/libs/components/layout/LayoutMember";
import {
  GET_COMMENTS,
  GET_DOCTOR,
  GET_MEMBER_FOLLOWERS,
  GET_MEMBER_FOLLOWINGS,
} from "@/apollo/user/query";
import {
  CREATE_COMMENT,
  LIKE_TARGET_COMMENT,
  LIKE_TARGET_DOCTOR,
  SUBSCRIBE_MEMBER,
  SUBSCRIBE_DOCTOR,
  UNSUBSCRIBE_MEMBER,
  UPDATE_COMMENT,
  UNSUBSCRIBE_DOCTOR,
} from "@/apollo/user/mutation";
import { Doctor } from "@/libs/types/doctors/doctor";
import { CommentsInquiry, CommentInput } from "@/libs/types/comment/comment.input";
import { Comment, Comments } from "@/libs/types/comment/comment";
import { CommentUpdate } from "@/libs/types/comment/comment.update";
import { CommentGroup } from "@/libs/enums/comment.enum";
import { FollowInquiry } from "@/libs/types/follow/follow.input";
import { Followers, Followings } from "@/libs/types/follow/follow";
import { doctorVar, userVar } from "@/apollo/store";
import {
  sweetErrorHandling,
  sweetMixinSuccessAlert,
  sweetTopSmallSuccessAlert,
} from "@/libs/sweetAlert";
import { Messages } from "@/libs/config";
import { MemberType } from "@/libs/enums/member.enum";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

interface GetDoctorResponse {
  getDoctor: Doctor;
}

interface GetDoctorVariables {
  input: string;
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

interface UpdateCommentResponse {
  updateComment: Comment;
}

interface UpdateCommentVariables {
  input: CommentUpdate;
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

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`doctor-tabpanel-${index}`}
      aria-labelledby={`doctor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

export const DoctorDetailPage: NextPage = () => {
  const router = useRouter();
  const apolloClient = useApolloClient();
  const user = useReactiveVar(userVar);
  const doctorAuth = useReactiveVar(doctorVar);
  const actorId = user._id || doctorAuth._id || "";
  const actorImage =
    toAbsoluteMediaUrl(user.memberImage || doctorAuth.memberImage) ||
    "/img/defaultUser.svg";
  const isDoctorPanelRoute = router.pathname.startsWith("/_doctor");
  const doctorId = useMemo(() => {
    const raw = router.query.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [router.query.id]);

  const [tabValue, setTabValue] = useState(isDoctorPanelRoute ? 1 : 0);
  const [reviewText, setReviewText] = useState("");
  const [followersOpen, setFollowersOpen] = useState(false);
  const [followingsOpen, setFollowingsOpen] = useState(false);
  const [editingCommentId, setEditingCommentId] = useState<string>("");
  const [editingCommentText, setEditingCommentText] = useState<string>("");
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [repliesByParentId, setRepliesByParentId] = useState<Record<string, Comment[]>>({});

  React.useEffect(() => {
    const rawTab = router.query.tab;
    const tab = Array.isArray(rawTab) ? rawTab[0] : rawTab;

    if (tab === "reviews") {
      setTabValue(1);
      return;
    }
    if (tab === "availability") {
      setTabValue(2);
      return;
    }
    if (tab === "about") {
      setTabValue(0);
      return;
    }

    if (isDoctorPanelRoute) setTabValue(1);
  }, [router.query.tab, isDoctorPanelRoute]);

  const {
    loading: getDoctorLoading,
    data: getDoctorData,
    error: getDoctorError,
    refetch: getDoctorRefetch,
  } = useQuery<GetDoctorResponse, GetDoctorVariables>(GET_DOCTOR, {
    fetchPolicy: "cache-and-network",
    variables: { input: doctorId || "" },
    notifyOnNetworkStatusChange: true,
    skip: !doctorId,
  });

  const commentsInput = useMemo<CommentsInquiry>(
    () => ({
      page: 1,
      limit: 50,
      sort: "createdAt",
      direction: "DESC",
      search: {
        commentRefId: doctorId || "",
      },
    }),
    [doctorId],
  );

  const {
    loading: getCommentsLoading,
    data: getCommentsData,
    error: getCommentsError,
    refetch: getCommentsRefetch,
  } = useQuery<GetCommentsResponse, GetCommentsVariables>(GET_COMMENTS, {
    fetchPolicy: "cache-and-network",
    variables: { input: commentsInput },
    notifyOnNetworkStatusChange: true,
    skip: !doctorId,
  });

  const followersInput = useMemo<FollowInquiry>(
    () => ({
      page: 1,
      limit: 20,
      search: { followingId: doctorId || "" },
    }),
    [doctorId],
  );

  const followingsInput = useMemo<FollowInquiry>(
    () => ({
      page: 1,
      limit: 20,
      search: { followerId: doctorId || "" },
    }),
    [doctorId],
  );

  const {
    loading: getFollowersLoading,
    data: getFollowersData,
    error: getFollowersError,
    refetch: getFollowersRefetch,
  } = useQuery<GetFollowersResponse, GetFollowVariables>(GET_MEMBER_FOLLOWERS, {
    fetchPolicy: "cache-and-network",
    variables: { input: followersInput },
    notifyOnNetworkStatusChange: true,
    skip: !doctorId,
  });

  const {
    loading: getFollowingsLoading,
    data: getFollowingsData,
    error: getFollowingsError,
    refetch: getFollowingsRefetch,
  } = useQuery<GetFollowingsResponse, GetFollowVariables>(GET_MEMBER_FOLLOWINGS, {
    fetchPolicy: "cache-and-network",
    variables: { input: followingsInput },
    notifyOnNetworkStatusChange: true,
    skip: !doctorId,
  });

  const [likeTargetDoctor] = useMutation(LIKE_TARGET_DOCTOR);
  const [subscribeDoctor] = useMutation(SUBSCRIBE_DOCTOR);
  const [unsubscribeDoctor] = useMutation(UNSUBSCRIBE_DOCTOR);
  const [subscribeMember] = useMutation(SUBSCRIBE_MEMBER);
  const [unsubscribeMember] = useMutation(UNSUBSCRIBE_MEMBER);
  const [createComment] = useMutation<CreateCommentResponse, CreateCommentVariables>(CREATE_COMMENT);
  const [updateComment] = useMutation<UpdateCommentResponse, UpdateCommentVariables>(UPDATE_COMMENT);
  const [likeTargetComment] = useMutation(LIKE_TARGET_COMMENT);

  const doctor = getDoctorData?.getDoctor;
  const allDoctorComments = getCommentsData?.getComments?.list ?? [];
  const reviews = allDoctorComments.filter(
    (comment) =>
      comment.commentGroup === CommentGroup.DOCTOR && !comment.parentCommentId,
  );
  const replyMapByParent = allDoctorComments.reduce<Record<string, Comment[]>>(
    (acc, comment) => {
      if (!comment.parentCommentId) return acc;
      const parentId = String(comment.parentCommentId);
      if (!acc[parentId]) acc[parentId] = [];
      acc[parentId].push(comment);
      return acc;
    },
    {},
  );
  const totalReviewItems = reviews.reduce((acc, comment) => {
    const fallbackReplies = replyMapByParent[comment._id] || [];
    const extraReplies = repliesByParentId[comment._id] || [];
    const repliesCount = Math.max(
      comment.replies?.length || 0,
      fallbackReplies.length,
      extraReplies.length,
    );
    return acc + 1 + repliesCount;
  }, 0);
  const followers = getFollowersData?.getMemberFollowers?.list ?? [];
  const followings = getFollowingsData?.getMemberFollowings?.list ?? [];
  const reviewIdsKey = reviews.map((review) => review._id).join("|");

  const liked = Boolean(doctor?.meLiked?.length);
  const followed = Boolean(doctor?.meFollowed?.length);
  const likeCount = doctor?.memberLikes ?? 0;
  const followerCount = doctor?.memberFollowers ?? 0;
  const followingCount = doctor?.memberFollowings ?? 0;

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const likeDoctorHandler = async () => {
    try {
      if (!doctorId) return;
      if (!actorId) throw new Error(Messages.error2);

      await likeTargetDoctor({ variables: { input: doctorId } });
      await getDoctorRefetch();
      await sweetTopSmallSuccessAlert("Success!", 800);
    } catch (err: any) {
      console.log("ERROR, likeDoctorHandler:", err.message);
      sweetErrorHandling(err).then();
    }
  };

  const followDoctorHandler = async () => {
    try {
      if (!doctorId) return;
      if (!actorId) throw new Error(Messages.error2);
      if (doctorId === actorId) {
        throw new Error("You cannot follow yourself.");
      }

      if (followed) {
        await unsubscribeDoctor({ variables: { input: doctorId } });
      } else {
        await subscribeDoctor({ variables: { input: doctorId } });
      }

      await Promise.all([
        getDoctorRefetch(),
        getFollowersRefetch({ input: followersInput }),
        getFollowingsRefetch({ input: followingsInput }),
      ]);
      await sweetTopSmallSuccessAlert("Success!", 800);
    } catch (err: any) {
      console.log("ERROR, followDoctorHandler:", err.message);
      sweetErrorHandling(err).then();
    }
  };

  const handleSubmitReview = async () => {
    try {
      if (!doctorId) return;
      if (!actorId) throw new Error(Messages.error2);
      if (!reviewText.trim()) throw new Error(Messages.error3);

      await createComment({
        variables: {
          input: {
            commentGroup: CommentGroup.DOCTOR,
            commentContent: reviewText.trim(),
            commentRefId: doctorId,
          },
        },
      });

      // Backend should increase doctor.reviewCount when commentGroup is DOCTOR.
      await Promise.all([getCommentsRefetch({ input: commentsInput }), getDoctorRefetch()]);
      await sweetMixinSuccessAlert("Review submitted successfully");

      setReviewText("");
    } catch (err: any) {
      console.log("ERROR, handleSubmitReview:", err.message);
      sweetErrorHandling(err).then();
    }
  };

  const startEditComment = (comment: Comment) => {
    setEditingCommentId(comment._id);
    setEditingCommentText(comment.commentContent || "");
  };

  const cancelEditComment = () => {
    setEditingCommentId("");
    setEditingCommentText("");
  };

  const saveEditComment = async () => {
    try {
      if (!editingCommentId) return;
      if (!actorId) throw new Error(Messages.error2);
      if (!editingCommentText.trim()) throw new Error(Messages.error4);

      await updateComment({
        variables: {
          input: {
            _id: editingCommentId,
            commentContent: editingCommentText.trim(),
          },
        },
      });

      await getCommentsRefetch({ input: commentsInput });
      await sweetTopSmallSuccessAlert("Updated!", 800);
      cancelEditComment();
    } catch (err: any) {
      console.log("ERROR, saveEditComment:", err.message);
      sweetErrorHandling(err).then();
    }
  };

  const openFollowersModal = async () => {
    setFollowersOpen(true);
    if (doctorId) await getFollowersRefetch({ input: followersInput });
  };

  const openFollowingsModal = async () => {
    setFollowingsOpen(true);
    if (doctorId) await getFollowingsRefetch({ input: followingsInput });
  };

  const likeCommentHandler = async (commentId: string) => {
    try {
      if (!commentId) return;
      if (!actorId) throw new Error(Messages.error2);

      await likeTargetComment({ variables: { input: commentId } });
      await getCommentsRefetch({ input: commentsInput });
      await sweetTopSmallSuccessAlert("Success!", 800);
    } catch (err: any) {
      console.log("ERROR, likeCommentHandler:", err.message);
      sweetErrorHandling(err).then();
    }
  };

  const isCommentLiked = (value: any): boolean => {
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value.myFavorite);
  };

  const replySubmitHandler = async (parentCommentId: string) => {
    try {
      if (!doctorId || !parentCommentId) return;
      if (!actorId) throw new Error(Messages.error2);

      const text = (replyTextMap[parentCommentId] || "").trim();
      if (!text) throw new Error(Messages.error4);

      await createComment({
        variables: {
          input: {
            commentGroup: CommentGroup.COMMENT,
            commentContent: text,
            commentRefId: parentCommentId,
            parentCommentId,
          },
        },
      });

      await Promise.all([
        getCommentsRefetch({ input: commentsInput }),
        fetchRepliesByParentId(parentCommentId),
      ]);
      await sweetTopSmallSuccessAlert("Reply added", 800);
      setReplyTextMap((prev) => ({ ...prev, [parentCommentId]: "" }));
    } catch (err: any) {
      console.log("ERROR, replySubmitHandler:", err.message);
      sweetErrorHandling(err).then();
    }
  };

  const toggleReplyBox = (commentId: string) => {
    setReplyTextMap((prev) => {
      const next = { ...prev };
      if (Object.prototype.hasOwnProperty.call(next, commentId)) {
        delete next[commentId];
      } else {
        next[commentId] = "";
      }
      return next;
    });
  };

  const toggleMemberFollow = async (
    targetId: string,
    targetType: string | undefined,
    isFollowing: boolean,
  ) => {
    try {
      if (!targetId) return;
      if (!actorId) throw new Error(Messages.error2);
      if (targetId === actorId) return;

      const isDoctorTarget = targetType === MemberType.DOCTOR;
      if (isFollowing) {
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
      ]);
      await sweetTopSmallSuccessAlert("Success!", 800);
    } catch (err: any) {
      console.log("ERROR, toggleMemberFollow:", err.message);
      sweetErrorHandling(err).then();
    }
  };

  const openPatientDetail = (memberId?: string) => {
    if (!isDoctorPanelRoute || !memberId) return;
    router.push(`/_doctor/patients/detail?id=${memberId}`);
  };

  const fetchRepliesByParentId = React.useCallback(
    async (parentId: string) => {
      if (!parentId) return [];
      const res = await apolloClient.query<GetCommentsResponse, GetCommentsVariables>({
        query: GET_COMMENTS,
        variables: {
          input: {
            page: 1,
            limit: 50,
            sort: "createdAt",
            direction: "DESC",
            search: { commentRefId: parentId },
          },
        },
        fetchPolicy: "network-only",
      });

      const list = (res.data?.getComments?.list ?? []).filter(
        (comment) => String(comment.parentCommentId || "") === parentId,
      );
      setRepliesByParentId((prev) => ({ ...prev, [parentId]: list }));
      return list;
    },
    [apolloClient],
  );

  React.useEffect(() => {
    if (!reviews.length) return;
    reviews.forEach((review) => {
      fetchRepliesByParentId(review._id).catch(() => null);
    });
  }, [reviewIdsKey, fetchRepliesByParentId]);

  if (!doctorId) {
    return (
      <Stack
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          minHeight: "70vh",
        }}
      >
        <CircularProgress size={"3rem"} />
      </Stack>
    );
  }

  if (getDoctorLoading) {
    return (
      <Stack
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          minHeight: "70vh",
        }}
      >
        <CircularProgress size={"3rem"} />
      </Stack>
    );
  }

  if (getDoctorError || !doctor) {
    return (
      <Stack sx={{ width: "100%", minHeight: "60vh", justifyContent: "center", alignItems: "center" }}>
        <Typography>Failed to load doctor details.</Typography>
      </Stack>
    );
  }

  const imagePath = toAbsoluteMediaUrl(doctor.memberImage) || "/img/defaultUser.svg";
  const doctorName = doctor.memberFullName || doctor.memberNick;
  const specialization = (doctor.specialization || "").replaceAll("_", " ");
  const languages = doctor.languages ?? [];
  const workingDays = doctor.workingDays ?? [];
  const workingHours = doctor.workingHours?.join(", ") || "Not set";

  return (
    <div id="doctor-detail-page">
      <Stack className="detail-container">
        <Stack className="detail-content">
          <Stack className="doctor-info-section">
            <Stack className="doctor-main-info">
              <Box className="doctor-avatar-box">
                <img src={imagePath} alt={doctorName} className="doctor-avatar" />
                <Box className="online-indicator" />
              </Box>

              <Stack className="doctor-details">
                <Stack className="name-section">
                  <Typography className="doctor-name">{doctorName}</Typography>
                  {doctor.memberStatus === "ACTIVE" && (
                    <CheckCircleIcon className="verified-icon" />
                  )}
                </Stack>
                <Typography className="specialization">
                  {specialization} - {doctor.experience} Years Experience
                </Typography>
                <Stack className="like-section">
                  <IconButton onClick={likeDoctorHandler} className="like-btn">
                    {liked ? <FavoriteIcon className="liked" /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <Typography className="like-count">{likeCount} Likes</Typography>
                </Stack>
              </Stack>

              <Stack className="fee-follow-section">
                <Stack className="consultation-fee">
                  <Typography className="fee-amount">${doctor.consultationFee}</Typography>
                  <Typography className="fee-label">per consultation</Typography>
                </Stack>
                {doctorId !== actorId ? (
                  <Button
                    variant={followed ? "outlined" : "contained"}
                    startIcon={followed ? <PersonRemoveIcon /> : <PersonAddIcon />}
                    onClick={followDoctorHandler}
                    className={followed ? "unfollow-btn" : "follow-btn"}
                  >
                    {followed ? "Unfollow" : "Follow"}
                  </Button>
                ) : null}
              </Stack>
            </Stack>

            <Stack className="stats-section">
              <Stack className="stat-item" sx={{ cursor: "pointer" }} onClick={openFollowersModal}>
                <Typography className="stat-number">{followerCount}</Typography>
                <Typography className="stat-label">Followers</Typography>
              </Stack>
              <Stack className="stat-divider" />
              <Stack className="stat-item" sx={{ cursor: "pointer" }} onClick={openFollowingsModal}>
                <Typography className="stat-number">{followingCount}</Typography>
                <Typography className="stat-label">Following</Typography>
              </Stack>
            </Stack>
          </Stack>

          <Box className="tabs-section">
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              className="doctor-tabs"
              TabIndicatorProps={{ className: "tab-indicator" }}
            >
              <Tab label="About" className="tab-item" />
              <Tab label="Reviews" className="tab-item" />
              <Tab label="Availability" className="tab-item" />
            </Tabs>
          </Box>

          <Stack className="tab-content">
            <TabPanel value={tabValue} index={0}>
              <Stack className="about-content">
                <Stack className="section">
                  <Typography className="section-title">Biography</Typography>
                  <Typography className="section-text">
                    {doctor.memberDesc || "No biography provided."}
                  </Typography>
                </Stack>

                <Stack className="section">
                  <Typography className="section-title">Specializations</Typography>
                  <Stack className="specializations-list">
                    <Chip label={specialization} className="spec-chip" />
                  </Stack>
                </Stack>

                <Stack className="section">
                  <Typography className="section-title">Languages</Typography>
                  <Stack className="languages-list">
                    {languages.length === 0 && <Typography>Not specified</Typography>}
                    {languages.map((lang, index) => (
                      <Stack key={`${lang}-${index}`} className="language-item">
                        <LanguageIcon className="lang-icon" />
                        <Typography>{lang}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>

                <Stack className="section">
                  <Typography className="section-title">Clinic Location</Typography>
                  <Typography className="section-text">
                    {doctor.clinicName ? `${doctor.clinicName}, ` : ""}
                    {doctor.clinicAddress || "Not specified"}
                  </Typography>
                </Stack>
              </Stack>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Stack className="reviews-content">
                <Stack className="write-review-section">
                  <Typography className="section-title">Write a Review</Typography>
                  <TextField
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Share your experience with this doctor..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="review-input"
                  />
                  <Button
                    variant="contained"
                    onClick={handleSubmitReview}
                    disabled={!reviewText.trim()}
                    className="submit-review-btn"
                  >
                    Submit Review
                  </Button>
                </Stack>

                <Stack className="reviews-list">
                  <Typography className="section-title">
                    All Reviews ({totalReviewItems})
                  </Typography>
                  {getCommentsLoading && <CircularProgress size={"1.5rem"} />}
                  {getCommentsError && <Typography>Failed to load reviews.</Typography>}
                  {!getCommentsLoading && !getCommentsError && reviews.length === 0 && (
                    <Typography>No reviews yet.</Typography>
                  )}
                  {!getCommentsLoading &&
                    !getCommentsError &&
                    reviews.map((review) => (
                      <Stack key={review._id} className="comment-item">
                        <Stack className="comment-header">
                          <Avatar
                            src={
                              toAbsoluteMediaUrl(review.memberData?.memberImage) ||
                              "/img/defaultUser.svg"
                            }
                            className="comment-avatar"
                            sx={{
                              cursor:
                                isDoctorPanelRoute && review.memberData?._id
                                  ? "pointer"
                                  : "default",
                            }}
                            onClick={() =>
                              openPatientDetail(review.memberData?._id)
                            }
                          />
                          <Stack className="comment-info">
                            <Typography
                              className="comment-author"
                              sx={{
                                cursor:
                                  isDoctorPanelRoute && review.memberData?._id
                                    ? "pointer"
                                    : "default",
                              }}
                              onClick={() =>
                                openPatientDetail(review.memberData?._id)
                              }
                            >
                              {review.memberData?.memberNick || "Unknown"}
                            </Typography>
                            <Typography className="comment-date">
                              {new Date(review.createdAt).toLocaleDateString()}
                            </Typography>
                          </Stack>
                        </Stack>
                        {editingCommentId === review._id ? (
                          <Stack spacing={1}>
                            <TextField
                              multiline
                              rows={3}
                              fullWidth
                              value={editingCommentText}
                              onChange={(e) => setEditingCommentText(e.target.value)}
                            />
                            <Stack direction="row" spacing={1}>
                              <Button size="small" variant="contained" onClick={saveEditComment}>
                                Save
                              </Button>
                              <Button size="small" variant="outlined" onClick={cancelEditComment}>
                                Cancel
                              </Button>
                            </Stack>
                          </Stack>
                        ) : (
                          <>
                            <Typography className="comment-content">{review.commentContent}</Typography>
                            <Stack className="comment-actions-bar">
                              {review.memberId === actorId ? (
                                <Button
                                  size="small"
                                  startIcon={<EditIcon />}
                                  onClick={() => startEditComment(review)}
                                  className="comment-action-btn"
                                >
                                  Edit
                                </Button>
                              ) : (
                                <Box />
                              )}
                              <Button
                                size="small"
                                startIcon={
                                  isCommentLiked(review.meLiked) ? (
                                    <FavoriteIcon sx={{ color: "#ef4444" }} />
                                  ) : (
                                    <FavoriteBorderIcon />
                                  )
                                }
                                className="comment-action-btn"
                                onClick={() => likeCommentHandler(review._id)}
                              >
                                {review.commentLikes || 0}
                              </Button>
                              <Button
                                size="small"
                                startIcon={<ReplyIcon />}
                                className="comment-action-btn"
                                onClick={() => toggleReplyBox(review._id)}
                              >
                                Reply
                              </Button>
                            </Stack>
                          </>
                        )}

                        {Object.prototype.hasOwnProperty.call(replyTextMap, review._id) && (
                          <Stack className="reply-box">
                            <Avatar src={actorImage} className="reply-avatar" />
                            <TextField
                              multiline
                              rows={2}
                              fullWidth
                              placeholder="Write a reply..."
                              value={replyTextMap[review._id] || ""}
                              onChange={(e) =>
                                setReplyTextMap((prev) => ({
                                  ...prev,
                                  [review._id]: e.target.value,
                                }))
                              }
                              className="reply-input"
                            />
                            <Button
                              variant="contained"
                              size="small"
                              endIcon={<SendIcon />}
                              onClick={() => replySubmitHandler(review._id)}
                              disabled={!replyTextMap[review._id]?.trim()}
                              className="submit-reply-btn"
                            >
                              Reply
                            </Button>
                          </Stack>
                        )}

                        {((review.replies && review.replies.length > 0) ||
                          (replyMapByParent[review._id] &&
                            replyMapByParent[review._id].length > 0) ||
                          (repliesByParentId[review._id] &&
                            repliesByParentId[review._id].length > 0)) && (
                          <Stack className="replies-list">
                            {(
                              review.replies && review.replies.length > 0
                                ? review.replies
                                : replyMapByParent[review._id] &&
                                    replyMapByParent[review._id].length > 0
                                  ? replyMapByParent[review._id]
                                  : repliesByParentId[review._id] || []
                            ).map((reply) => (
                              <Stack key={reply._id} className="reply-item">
                                <Stack className="reply-header">
                                  <Avatar
                                    src={
                                      toAbsoluteMediaUrl(reply.memberData?.memberImage) ||
                                      "/img/defaultUser.svg"
                                    }
                                    className="reply-avatar-small"
                                    sx={{
                                      cursor:
                                        isDoctorPanelRoute && reply.memberData?._id
                                          ? "pointer"
                                          : "default",
                                    }}
                                    onClick={() =>
                                      openPatientDetail(reply.memberData?._id)
                                    }
                                  />
                                  <Stack className="reply-info">
                                    <Typography
                                      className="reply-author"
                                      sx={{
                                        cursor:
                                          isDoctorPanelRoute && reply.memberData?._id
                                            ? "pointer"
                                            : "default",
                                      }}
                                      onClick={() =>
                                        openPatientDetail(reply.memberData?._id)
                                      }
                                    >
                                      {reply.memberData?.memberNick || "Unknown"}
                                    </Typography>
                                    <Typography className="reply-date">
                                      {new Date(reply.createdAt).toLocaleDateString()}
                                    </Typography>
                                  </Stack>
                                </Stack>
                                <Typography className="reply-content">
                                  {reply.commentContent}
                                </Typography>
                                <Stack className="reply-actions-bar">
                                  <Button
                                    size="small"
                                    startIcon={
                                      isCommentLiked(reply.meLiked) ? (
                                        <FavoriteIcon sx={{ color: "#ef4444" }} />
                                      ) : (
                                        <FavoriteBorderIcon />
                                      )
                                    }
                                    className="reply-action-btn"
                                    onClick={() => likeCommentHandler(reply._id)}
                                  >
                                    {reply.commentLikes || 0}
                                  </Button>
                                </Stack>
                              </Stack>
                            ))}
                          </Stack>
                        )}
                      </Stack>
                    ))}
                </Stack>
              </Stack>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Stack className="availability-content">
                <Stack className="section">
                  <Typography className="section-title">Working Days</Typography>
                  <Stack className="working-days-list">
                    {workingDays.length === 0 && <Typography>Not set</Typography>}
                    {workingDays.map((day, index) => (
                      <Chip key={`${day}-${index}`} label={day} className="day-chip" />
                    ))}
                  </Stack>
                </Stack>

                <Stack className="section">
                  <Typography className="section-title">Working Hours</Typography>
                  <Typography className="working-hours">{workingHours}</Typography>
                </Stack>
              </Stack>
            </TabPanel>
          </Stack>

          {!isDoctorPanelRoute && (
            <Stack className="book-section">
              <Button
                variant="contained"
                fullWidth
                className="book-btn"
                onClick={() => router.push(`/payment?id=${doctor._id}`)}
              >
                Book Appointment for ${doctor.consultationFee}
              </Button>
            </Stack>
          )}
        </Stack>
      </Stack>

      <Dialog
        open={followersOpen}
        onClose={() => setFollowersOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Followers</DialogTitle>
        <DialogContent>
          {getFollowersLoading && <CircularProgress size={"1.5rem"} />}
          {getFollowersError && <Typography>Failed to load followers.</Typography>}
          {!getFollowersLoading && !getFollowersError && followers.length === 0 && (
            <Typography>No followers.</Typography>
          )}
          <List>
            {followers.map((item) => (
              <ListItem key={item._id}>
                <ListItemAvatar>
                  <Avatar
                    src={
                      toAbsoluteMediaUrl(item.followerData?.memberImage) ||
                      "/img/defaultUser.svg"
                    }
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={item.followerData?.memberNick || "Unknown"}
                  secondary={item.followerData?.memberType || ""}
                />
                {item.followerData?._id && item.followerData._id !== actorId && (
                  <Button
                    size="small"
                    variant={item.meFollowed?.myFollowing ? "outlined" : "contained"}
                    onClick={() =>
                      toggleMemberFollow(
                        item.followerData?._id || "",
                        item.followerData?.memberType,
                        Boolean(item.meFollowed?.myFollowing),
                      )
                    }
                  >
                    {item.meFollowed?.myFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>

      <Dialog
        open={followingsOpen}
        onClose={() => setFollowingsOpen(false)}
        fullWidth
        maxWidth="xs"
      >
        <DialogTitle>Following</DialogTitle>
        <DialogContent>
          {getFollowingsLoading && <CircularProgress size={"1.5rem"} />}
          {getFollowingsError && <Typography>Failed to load following list.</Typography>}
          {!getFollowingsLoading && !getFollowingsError && followings.length === 0 && (
            <Typography>No followings.</Typography>
          )}
          <List>
            {followings.map((item) => (
              <ListItem key={item._id}>
                <ListItemAvatar>
                  <Avatar
                    src={
                      toAbsoluteMediaUrl(item.followingData?.memberImage) ||
                      "/img/defaultUser.svg"
                    }
                  />
                </ListItemAvatar>
                <ListItemText
                  primary={item.followingData?.memberNick || "Unknown"}
                  secondary={item.followingData?.memberType || ""}
                />
                {item.followingData?._id && item.followingData._id !== actorId && (
                  <Button
                    size="small"
                    variant={item.meFollowed?.myFollowing ? "outlined" : "contained"}
                    onClick={() =>
                      toggleMemberFollow(
                        item.followingData?._id || "",
                        item.followingData?.memberType,
                        Boolean(item.meFollowed?.myFollowing),
                      )
                    }
                  >
                    {item.meFollowed?.myFollowing ? "Following" : "Follow"}
                  </Button>
                )}
              </ListItem>
            ))}
          </List>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default withLayoutMain(DoctorDetailPage);




