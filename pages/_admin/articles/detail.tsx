import React from "react";
import dynamic from "next/dynamic";
import { NextPage } from "next";
import { useRouter } from "next/router";
import {
  Avatar,
  Box,
  Button,
  Chip,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import SendIcon from "@mui/icons-material/Send";
import ReplyIcon from "@mui/icons-material/Reply";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import withLayoutAdmin from "@/libs/components/layout/LayoutAdmin";
import { BoardArticleCategory, BoardArticleStatus } from "@/libs/enums/board-article.enum";
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from "@/apollo/admin/query";
import { GET_COMMENTS } from "@/apollo/user/query";
import {
  CREATE_COMMENT,
  LIKE_TARGET_BOARD_ARTICLE,
  LIKE_TARGET_COMMENT,
} from "@/apollo/user/mutation";
import { BoardArticles } from "@/libs/types/board-article/board-article";
import { AllBoardArticlesInquiry } from "@/libs/types/board-article/board-article.input";
import { BoardArticleUpdate } from "@/libs/types/board-article/board-article.update";
import { CommentGroup } from "@/libs/enums/comment.enum";
import { Comment, Comments } from "@/libs/types/comment/comment";
import { CommentInput, CommentsInquiry } from "@/libs/types/comment/comment.input";
import { userVar } from "@/apollo/store";
import {
  sweetErrorHandling,
  sweetMixinErrorAlert,
  sweetTopSmallSuccessAlert,
} from "@/libs/sweetAlert";
import {
  REMOVE_BOARD_ARTICLES_BY_ADMIN,
  UPDATE_BOARD_ARTICLES_BY_ADMIN,
} from "@/apollo/admin/mutation";

const ToastViewerComponent = dynamic(() => import("@/libs/components/community/TViewer"), {
  ssr: false,
});

interface GetAllBoardArticlesByAdminResponse {
  getAllBoardArticlesByAdmin: BoardArticles;
}
interface GetAllBoardArticlesByAdminVariables {
  input: AllBoardArticlesInquiry;
}
interface UpdateBoardArticleByAdminResponse {
  updateBoardArticleByAdmin: {
    _id: string;
    articleStatus: BoardArticleStatus;
  };
}
interface UpdateBoardArticleByAdminVariables {
  input: BoardArticleUpdate;
}
interface GetCommentsResponse {
  getComments: Comments;
}
interface GetCommentsVariables {
  input: CommentsInquiry;
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

const getCategoryColor = (category: BoardArticleCategory) => {
  if (category === BoardArticleCategory.FREE) return "#22c55e";
  if (category === BoardArticleCategory.RECOMMEND) return "#3b82f6";
  if (category === BoardArticleCategory.NEWS) return "#f59e0b";
  if (category === BoardArticleCategory.QUESTION) return "#8b5cf6";
  return "#64748b";
};

const getCategoryLabel = (category: BoardArticleCategory) => {
  if (category === BoardArticleCategory.FREE) return "Free";
  if (category === BoardArticleCategory.RECOMMEND) return "Recommend";
  if (category === BoardArticleCategory.NEWS) return "News";
  if (category === BoardArticleCategory.QUESTION) return "Question";
  return "Free";
};

const getFallbackImage = (category: BoardArticleCategory) => {
  if (category === BoardArticleCategory.NEWS) return "/img/nws.png";
  if (category === BoardArticleCategory.FREE) return "/img/free.jpg";
  if (category === BoardArticleCategory.RECOMMEND) return "/img/recommend.png";
  return "/img/question.jpg";
};

const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const normalizeMarkdownForView = (value: string): string =>
  String(value || "")
    .replace(/\r\n/g, "\n")
    .replace(/write your article content here\.{0,3}/gi, "\n")
    .replace(/(^|\n)\s*write\s*(?=\n|$)/gi, "\n")
    .replace(/(^|\n)\s*preview\s*(?=\n|$)/gi, "\n")
    .replace(/(^|\n)\s*markdown\s*(?=\n|$)/gi, "\n")
    .replace(/(^|\n)\s*wysiwyg\.?\s*(?=\n|$)/gi, "\n")
    .replace(/([^\n])(!\[[^\]]*\]\([^)]+\))/g, "$1\n\n$2")
    .replace(/\n{3,}/g, "\n\n")
    .trim();

const AdminArticleDetailPage: NextPage = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const articleId = React.useMemo(() => {
    const raw = router.query.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [router.query.id]);
  const [commentText, setCommentText] = React.useState("");
  const [replyTextMap, setReplyTextMap] = React.useState<Record<string, string>>({});
  const [showReplyBox, setShowReplyBox] = React.useState<Record<string, boolean>>({});
  const [likedOverride, setLikedOverride] = React.useState<boolean | null>(null);

  const {
    loading: getArticlesLoading,
    data: getArticlesData,
    error: getArticlesError,
    refetch: getArticlesRefetch,
  } = useQuery<GetAllBoardArticlesByAdminResponse, GetAllBoardArticlesByAdminVariables>(
    GET_ALL_BOARD_ARTICLES_BY_ADMIN,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        input: {
          page: 1,
          limit: 500,
          sort: "createdAt",
          direction: "DESC",
          search: {},
        },
      },
      notifyOnNetworkStatusChange: true,
    },
  );
  const [updateBoardArticleByAdmin, { loading: updateArticleLoading }] = useMutation<
    UpdateBoardArticleByAdminResponse,
    UpdateBoardArticleByAdminVariables
  >(UPDATE_BOARD_ARTICLES_BY_ADMIN);
  const [removeBoardArticleByAdmin, { loading: removeArticleLoading }] = useMutation(
    REMOVE_BOARD_ARTICLES_BY_ADMIN,
  );
  const [likeTargetBoardArticle, { loading: likeArticleLoading }] = useMutation(
    LIKE_TARGET_BOARD_ARTICLE,
  );
  const [createComment, { loading: createCommentLoading }] = useMutation<
    CreateCommentResponse,
    CreateCommentVariables
  >(CREATE_COMMENT);
  const [likeTargetComment, { loading: likeCommentLoading }] = useMutation(
    LIKE_TARGET_COMMENT,
  );

  const commentsInput = React.useMemo<CommentsInquiry>(
    () => ({
      page: 1,
      limit: 100,
      sort: "createdAt",
      direction: "DESC",
      search: { commentRefId: articleId || "" },
    }),
    [articleId],
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
    skip: !articleId,
  });

  const article = React.useMemo(
    () => (getArticlesData?.getAllBoardArticlesByAdmin?.list ?? []).find((it) => it._id === articleId),
    [articleId, getArticlesData],
  );
  const comments = (getCommentsData?.getComments?.list ?? []).filter(
    (comment) => comment.commentGroup === CommentGroup.ARTICLE && !comment.parentCommentId,
  );

  const onChangeStatus = async (next: BoardArticleStatus) => {
    try {
      if (!article?._id) return;
      if (next === BoardArticleStatus.DELETE) {
        await removeBoardArticleByAdmin({ variables: { input: article._id } });
        await sweetTopSmallSuccessAlert("Article deleted", 800);
        await router.push("/_admin/articles");
        return;
      }
      await updateBoardArticleByAdmin({
        variables: {
          input: {
            _id: article._id,
            articleStatus: next,
          },
        },
      });
      await getArticlesRefetch();
      await sweetTopSmallSuccessAlert("Status updated", 800);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const handleLikeArticle = async () => {
    try {
      if (!articleId) return;
      if (!user?._id) {
        await sweetMixinErrorAlert("Please login first");
        return;
      }
      setLikedOverride((prev) => !(prev ?? isLikedByMe(article?.meLiked)));
      await likeTargetBoardArticle({ variables: { input: articleId } });
      await getArticlesRefetch();
      await sweetTopSmallSuccessAlert("Success!", 800);
    } catch (err: any) {
      setLikedOverride((prev) => !(prev ?? isLikedByMe(article?.meLiked)));
      sweetErrorHandling(err).then();
    }
  };

  const handleCommentSubmit = async () => {
    try {
      if (!articleId) return;
      if (!user?._id) {
        await sweetMixinErrorAlert("Please login first");
        return;
      }
      if (!commentText.trim()) return;

      await createComment({
        variables: {
          input: {
            commentGroup: CommentGroup.ARTICLE,
            commentContent: commentText.trim(),
            commentRefId: articleId,
          },
        },
      });
      setCommentText("");
      await Promise.all([
        getCommentsRefetch({ input: commentsInput }),
        getArticlesRefetch(),
      ]);
      await sweetTopSmallSuccessAlert("Comment posted", 800);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const handleLikeComment = async (commentId: string) => {
    try {
      if (!commentId) return;
      if (!user?._id) {
        await sweetMixinErrorAlert("Please login first");
        return;
      }
      await likeTargetComment({ variables: { input: commentId } });
      await getCommentsRefetch({ input: commentsInput });
      await sweetTopSmallSuccessAlert("Success!", 800);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const toggleReplyBox = (commentId: string) => {
    setShowReplyBox((prev) => ({ ...prev, [commentId]: !prev[commentId] }));
  };

  const handleReplySubmit = async (commentId: string) => {
    try {
      if (!articleId || !commentId) return;
      if (!user?._id) {
        await sweetMixinErrorAlert("Please login first");
        return;
      }
      const reply = (replyTextMap[commentId] || "").trim();
      if (!reply) return;

      await createComment({
        variables: {
          input: {
            commentGroup: CommentGroup.COMMENT,
            commentContent: reply,
            commentRefId: articleId,
            parentCommentId: commentId,
          },
        },
      });
      setReplyTextMap((prev) => ({ ...prev, [commentId]: "" }));
      setShowReplyBox((prev) => ({ ...prev, [commentId]: false }));
      await Promise.all([
        getCommentsRefetch({ input: commentsInput }),
        getArticlesRefetch(),
      ]);
      await sweetTopSmallSuccessAlert("Reply posted", 800);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const isLikedByMe = (value: any): boolean => {
    if (!value) return false;
    if (Array.isArray(value)) return value.length > 0;
    return Boolean(value?.myFavorite);
  };
  React.useEffect(() => {
    if (!article?._id) return;
    setLikedOverride(isLikedByMe(article?.meLiked));
  }, [article?._id]);
  const liked = likedOverride ?? isLikedByMe(article?.meLiked);

  if (!articleId || getArticlesLoading) {
    return (
      <Stack sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", minHeight: "70vh" }}>
        <CircularProgress size={"3rem"} />
      </Stack>
    );
  }

  if (getArticlesError || !article) {
    return (
      <Stack sx={{ width: "100%", minHeight: "60vh", justifyContent: "center", alignItems: "center" }}>
        <Typography>Failed to load article details.</Typography>
      </Stack>
    );
  }

  const busy =
    updateArticleLoading ||
    removeArticleLoading ||
    likeArticleLoading ||
    createCommentLoading ||
    likeCommentLoading;
  const contentHasImage = /!\[[^\]]*\]\([^)]+\)/.test(article.articleContent || "");
  const articleImage = toAbsoluteMediaUrl(article.articleImage);
  const coverImage = articleImage || (!contentHasImage ? getFallbackImage(article.articleCategory) : "");
  const authorName = article.memberData?.memberNick || "Unknown";
  const authorImage = toAbsoluteMediaUrl(article.memberData?.memberImage) || "/img/defaultUser.svg";

  return (
    <div id="community-detail-page">
      <Stack className="detail-container">
        <Stack className="detail-content" sx={{ position: "relative" }}>
          {busy && (
            <Stack
              sx={{
                position: "absolute",
                inset: 0,
                zIndex: 10,
                background: "rgba(255,255,255,0.55)",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
            >
              <CircularProgress size={"3rem"} />
            </Stack>
          )}

          <Stack
            direction={{ xs: "column", sm: "row" }}
            spacing={1.5}
            alignItems="center"
            justifyContent="center"
            sx={{
              mt: 1.5,
              pb: 2,
              mb: 2,
              px: { xs: 1, sm: 2 },
              borderBottom: "1px solid #e2e8f0",
            }}
          >
            <FormControl size="small" sx={{ minWidth: 180 }}>
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={article.articleStatus}
                onChange={(event) => onChangeStatus(event.target.value as BoardArticleStatus)}
              >
                <MenuItem value={BoardArticleStatus.ACTIVE}>ACTIVE</MenuItem>
                <MenuItem value={BoardArticleStatus.DELETE}>DELETE</MenuItem>
              </Select>
            </FormControl>
            <Button variant="outlined" onClick={() => router.push("/_admin/articles")}>
              Back
            </Button>
          </Stack>

          <Stack className="article-header">
            <Chip
              label={getCategoryLabel(article.articleCategory)}
              className="category-badge"
              sx={{ backgroundColor: getCategoryColor(article.articleCategory) }}
            />
            <Typography className="article-title">{article.articleTitle}</Typography>

            <Stack className="article-meta">
              <Stack className="author-info">
                <Avatar src={authorImage} className="author-avatar" />
                <Stack>
                  <Typography className="author-name">{authorName}</Typography>
                  <Typography className="article-date">{formatDate(article.createdAt)}</Typography>
                </Stack>
              </Stack>

              <Stack direction="row" spacing={1.5} className="article-stats">
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <RemoveRedEyeIcon fontSize="small" />
                  <Typography>{article.articleViews}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <IconButton onClick={handleLikeArticle} sx={{ p: 0.2 }}>
                    {liked ? <FavoriteIcon sx={{ color: "#ef4444", fontSize: "1rem" }} /> : <FavoriteBorderIcon fontSize="small" />}
                  </IconButton>
                  <Typography>{article.articleLikes}</Typography>
                </Stack>
                <Stack direction="row" spacing={0.5} alignItems="center">
                  <ChatBubbleOutlineIcon fontSize="small" />
                  <Typography>{article.articleComments}</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>

          {coverImage && (
            <Box className="article-image">
              <img src={coverImage} alt={article.articleTitle} />
            </Box>
          )}

          <Box className="article-content">
            <ToastViewerComponent markdown={normalizeMarkdownForView(article.articleContent || "")} />
          </Box>

          <Stack className="comments-section">
            <Typography className="section-title">
              Comments ({article.articleComments || comments.length})
            </Typography>

            <Stack className="comments-list">
              {getCommentsLoading && <CircularProgress size={"1.5rem"} />}
              {getCommentsError && <Typography>Failed to load comments.</Typography>}
              {!getCommentsLoading && !getCommentsError && comments.length === 0 && (
                <Typography>No comments yet.</Typography>
              )}

              {!getCommentsLoading &&
                !getCommentsError &&
                comments.map((comment) => (
                  <Stack key={comment._id} className="comment-item">
                    <Stack className="comment-header">
                      <Avatar
                        src={toAbsoluteMediaUrl(comment.memberData?.memberImage) || "/img/defaultUser.svg"}
                        className="comment-avatar"
                      />
                      <Stack className="comment-info">
                        <Typography className="comment-author">{comment.memberData?.memberNick || "Unknown"}</Typography>
                        <Typography className="comment-date">{formatDate(comment.createdAt)}</Typography>
                      </Stack>
                    </Stack>

                    <Typography className="comment-content">{comment.commentContent}</Typography>

                    <Stack className="comment-actions-bar">
                      <Button
                        size="small"
                        startIcon={
                          isLikedByMe(comment.meLiked) ? (
                            <FavoriteIcon sx={{ color: "#ef4444" }} />
                          ) : (
                            <FavoriteBorderIcon />
                          )
                        }
                        className="comment-action-btn"
                        onClick={() => handleLikeComment(comment._id)}
                      >
                        {comment.commentLikes || 0}
                      </Button>
                      <Button
                        size="small"
                        startIcon={<ReplyIcon />}
                        className="comment-action-btn"
                        onClick={() => toggleReplyBox(comment._id)}
                      >
                        Reply
                      </Button>
                    </Stack>

                    {showReplyBox[comment._id] && (
                      <Stack className="reply-box">
                        <Avatar src={toAbsoluteMediaUrl(user?.memberImage) || "/img/defaultUser.svg"} className="reply-avatar" />
                        <TextField
                          multiline
                          rows={2}
                          fullWidth
                          placeholder="Write a reply..."
                          value={replyTextMap[comment._id] || ""}
                          onChange={(e) =>
                            setReplyTextMap((prev) => ({
                              ...prev,
                              [comment._id]: e.target.value,
                            }))
                          }
                          className="reply-input"
                        />
                        <Button
                          variant="contained"
                          size="small"
                          endIcon={<SendIcon />}
                          onClick={() => handleReplySubmit(comment._id)}
                          disabled={!replyTextMap[comment._id]?.trim()}
                          className="submit-reply-btn"
                        >
                          Reply
                        </Button>
                      </Stack>
                    )}

                    {comment.replies && comment.replies.length > 0 && (
                      <Stack className="replies-list">
                        {comment.replies.map((reply) => (
                          <Stack key={reply._id} className="reply-item">
                            <Stack className="reply-header">
                              <Avatar
                                src={toAbsoluteMediaUrl(reply.memberData?.memberImage) || "/img/defaultUser.svg"}
                                className="reply-avatar-small"
                              />
                              <Stack className="reply-info">
                                <Typography className="reply-author">{reply.memberData?.memberNick || "Unknown"}</Typography>
                                <Typography className="reply-date">{formatDate(reply.createdAt)}</Typography>
                              </Stack>
                            </Stack>

                            <Typography className="reply-content">{reply.commentContent}</Typography>

                            <Stack className="reply-actions-bar">
                              <Button
                                size="small"
                                startIcon={
                                  isLikedByMe(reply.meLiked) ? (
                                    <FavoriteIcon sx={{ color: "#ef4444" }} />
                                  ) : (
                                    <FavoriteBorderIcon />
                                  )
                                }
                                className="reply-action-btn"
                                onClick={() => handleLikeComment(reply._id)}
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

            <Stack className="write-comment">
              <Avatar src={toAbsoluteMediaUrl(user?.memberImage) || "/img/defaultUser.svg"} className="comment-avatar" />
              <TextField
                multiline
                rows={3}
                fullWidth
                placeholder="Write a comment..."
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
                className="comment-input"
              />
            </Stack>
            <Stack className="comment-actions">
              <Button
                variant="contained"
                endIcon={<SendIcon />}
                onClick={handleCommentSubmit}
                disabled={!commentText.trim()}
                className="submit-comment-btn"
              >
                Post Comment
              </Button>
            </Stack>
          </Stack>

        </Stack>
      </Stack>
    </div>
  );
};

export default withLayoutAdmin(AdminArticleDetailPage);
