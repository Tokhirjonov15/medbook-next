import React, { useMemo, useState } from "react";
import { NextPage } from "next";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  Chip,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import SendIcon from "@mui/icons-material/Send";
import ReplyIcon from "@mui/icons-material/Reply";
import withLayoutMain from "@/libs/components/layout/LayoutMember";
import { GET_BOARD_ARTICLE, GET_COMMENTS } from "@/apollo/user/query";
import {
  CREATE_COMMENT,
  LIKE_TARGET_BOARD_ARTICLE,
  LIKE_TARGET_COMMENT,
} from "@/apollo/user/mutation";
import { BoardArticle } from "@/libs/types/board-article/board-article";
import { Comments, Comment } from "@/libs/types/comment/comment";
import { CommentsInquiry, CommentInput } from "@/libs/types/comment/comment.input";
import { CommentGroup } from "@/libs/enums/comment.enum";
import { BoardArticleCategory } from "@/libs/enums/board-article.enum";
import { userVar } from "@/apollo/store";
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSmallSuccessAlert } from "@/libs/sweetAlert";

interface GetBoardArticleResponse {
  getBoardArticle: BoardArticle;
}

interface GetBoardArticleVariables {
  input: string;
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

const isLikedByMe = (value: any): boolean => {
  if (!value) return false;
  if (Array.isArray(value)) return value.length > 0;
  return Boolean(value?.myFavorite);
};

const formatDate = (dateString: string | Date) => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

const CommunityDetail: NextPage = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const articleId = useMemo(() => {
    const raw = router.query.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [router.query.id]);

  const [commentText, setCommentText] = useState("");
  const [replyTextMap, setReplyTextMap] = useState<Record<string, string>>({});
  const [showReplyBox, setShowReplyBox] = useState<Record<string, boolean>>({});

  const {
    loading: getArticleLoading,
    data: getArticleData,
    error: getArticleError,
    refetch: getArticleRefetch,
  } = useQuery<GetBoardArticleResponse, GetBoardArticleVariables>(GET_BOARD_ARTICLE, {
    fetchPolicy: "network-only",
    variables: { input: articleId || "" },
    notifyOnNetworkStatusChange: true,
    skip: !articleId,
  });

  const commentsInput = useMemo<CommentsInquiry>(
    () => ({
      page: 1,
      limit: 100,
      sort: "createdAt",
      direction: "DESC",
      search: {
        commentRefId: articleId || "",
      },
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

  const [likeTargetBoardArticle, { loading: likeArticleLoading }] = useMutation(LIKE_TARGET_BOARD_ARTICLE);
  const [createComment, { loading: createCommentLoading }] = useMutation<CreateCommentResponse, CreateCommentVariables>(CREATE_COMMENT);
  const [likeTargetComment, { loading: likeCommentLoading }] = useMutation(LIKE_TARGET_COMMENT);

  const article = getArticleData?.getBoardArticle;
  const comments = (getCommentsData?.getComments?.list ?? []).filter(
    (comment) => comment.commentGroup === CommentGroup.ARTICLE && !comment.parentCommentId,
  );

  const handleLikeArticle = async () => {
    try {
      if (!articleId) return;
      if (!user?._id) {
        await sweetMixinErrorAlert("Please login first");
        return;
      }

      await likeTargetBoardArticle({
        variables: { input: articleId },
      });
      await getArticleRefetch();
      await sweetTopSmallSuccessAlert("Success!", 800);
    } catch (err: any) {
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
        getArticleRefetch(),
      ]);
      await sweetTopSmallSuccessAlert("Comment posted", 800);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const toggleReplyBox = (commentId: string) => {
    setShowReplyBox((prev) => ({
      ...prev,
      [commentId]: !prev[commentId],
    }));
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
        getArticleRefetch(),
      ]);
      await sweetTopSmallSuccessAlert("Reply posted", 800);
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

  if (!articleId || getArticleLoading) {
    return (
      <Stack sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", minHeight: "70vh" }}>
        <CircularProgress size={"3rem"} />
      </Stack>
    );
  }

  if (getArticleError || !article) {
    return (
      <Stack sx={{ width: "100%", minHeight: "60vh", justifyContent: "center", alignItems: "center" }}>
        <Typography>Failed to load article details.</Typography>
      </Stack>
    );
  }

  const articleImage = article.articleImage || getFallbackImage(article.articleCategory);
  const authorName = article.memberData?.memberNick || "Unknown";
  const authorImage = article.memberData?.memberImage || "/img/defaultUser.svg";
  const liked = isLikedByMe(article.meLiked);

  return (
    <div id="community-detail-page">
      <Stack className="detail-container">
        <Stack className="detail-content">
          {(likeArticleLoading || createCommentLoading || likeCommentLoading) && (
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

          <Stack className="article-header">
            <Chip
              label={getCategoryLabel(article.articleCategory)}
              className="category-badge"
              sx={{ backgroundColor: getCategoryColor(article.articleCategory) }}
            />
            <Typography className="article-title">{article.articleTitle}</Typography>

            <Stack className="author-meta">
              <Stack className="author-section">
                <Avatar src={authorImage} alt={authorName} className="author-avatar" />
                <Stack className="author-info">
                  <Typography className="author-name">{authorName}</Typography>
                  <Typography className="publish-date">{formatDate(article.createdAt)}</Typography>
                </Stack>
              </Stack>

              <Stack className="article-stats">
                <Stack className="stat-item">
                  <RemoveRedEyeIcon className="stat-icon" />
                  <Typography className="stat-count">{article.articleViews || 0}</Typography>
                </Stack>
                <Stack className="stat-item">
                  <IconButton onClick={handleLikeArticle} className="like-btn">
                    {liked ? <FavoriteIcon className="liked" /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <Typography className="stat-count">{article.articleLikes || 0}</Typography>
                </Stack>
                <Stack className="stat-item">
                  <ChatBubbleOutlineIcon className="stat-icon" />
                  <Typography className="stat-count">{article.articleComments || comments.length}</Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>

          {articleImage && (
            <Box className="article-image">
              <img src={articleImage} alt={article.articleTitle} />
            </Box>
          )}

          <Stack className="article-content">
            <div dangerouslySetInnerHTML={{ __html: article.articleContent || "" }} />
          </Stack>

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

              {!getCommentsLoading && !getCommentsError && comments.map((comment) => (
                <Stack key={comment._id} className="comment-item">
                  <Stack className="comment-header">
                    <Avatar src={comment.memberData?.memberImage || "/img/defaultUser.svg"} className="comment-avatar" />
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
                      <Avatar src={user.memberImage || "/img/defaultUser.svg"} className="reply-avatar" />
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
                            <Avatar src={reply.memberData?.memberImage || "/img/defaultUser.svg"} className="reply-avatar-small" />
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
              <Avatar src={user.memberImage || "/img/defaultUser.svg"} className="comment-avatar" />
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

export default withLayoutMain(CommunityDetail);
