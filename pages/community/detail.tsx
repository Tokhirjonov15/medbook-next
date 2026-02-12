import React, { useState } from "react";
import { NextPage } from "next";
import {
  Avatar,
  Box,
  Button,
  Chip,
  IconButton,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import SendIcon from "@mui/icons-material/Send";
import ReplyIcon from "@mui/icons-material/Reply";
import withLayoutMain from "@/libs/components/layout/LayoutMember";

interface Comment {
  id: number;
  author: {
    name: string;
    image: string;
  };
  content: string;
  createdAt: string;
  likes: number;
  replies: Reply[];
}

interface Reply {
  id: number;
  author: {
    name: string;
    image: string;
  };
  content: string;
  createdAt: string;
  likes: number;
}

const CommunityDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [isLiked, setIsLiked] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [replyText, setReplyText] = useState<{ [key: number]: string }>({});
  const [showReplyBox, setShowReplyBox] = useState<{ [key: number]: boolean }>(
    {},
  );

  // Mock data - replace with API call
  const article = {
    id: 1,
    title: "Top 10 Heart Health Tips for 2024",
    category: "Free",
    author: {
      name: "Dr. Sarah Jenkins",
      image: "/img/defaultUser.svg",
    },
    content: `
      <h2>Introduction</h2>
      <p>Maintaining heart health is crucial for overall well-being. In this comprehensive guide, we'll explore the top 10 tips to keep your heart healthy in 2024.</p>
      
      <h2>1. Regular Exercise</h2>
      <p>Engage in at least 150 minutes of moderate-intensity aerobic activity or 75 minutes of vigorous-intensity activity per week. Regular exercise strengthens your heart muscle and improves circulation.</p>
      
      <h2>2. Balanced Diet</h2>
      <p>Focus on consuming plenty of fruits, vegetables, whole grains, and lean proteins. Limit saturated fats, trans fats, and sodium intake.</p>
      
      <h2>3. Manage Stress</h2>
      <p>Chronic stress can negatively impact your heart health. Practice relaxation techniques such as meditation, yoga, or deep breathing exercises.</p>
      
      <h2>4. Quality Sleep</h2>
      <p>Aim for 7-9 hours of quality sleep each night. Poor sleep is associated with high blood pressure and increased risk of heart disease.</p>
      
      <h2>5. Regular Check-ups</h2>
      <p>Schedule regular health screenings and check your blood pressure, cholesterol levels, and blood sugar regularly.</p>
    `,
    image: "/img/banner/header1.svg",
    views: 1234,
    likes: 89,
    createdAt: "2024-02-08",
  };

  const [comments, setComments] = useState<Comment[]>([
    {
      id: 1,
      author: {
        name: "John Doe",
        image: "/img/defaultUser.svg",
      },
      content: "Great article! Very informative and helpful.",
      createdAt: "2024-02-08",
      likes: 12,
      replies: [
        {
          id: 1,
          author: {
            name: "Dr. Sarah Jenkins",
            image: "/img/defaultUser.svg",
          },
          content: "Thank you! I'm glad you found it helpful.",
          createdAt: "2024-02-08",
          likes: 5,
        },
      ],
    },
    {
      id: 2,
      author: {
        name: "Jane Smith",
        image: "/img/defaultUser.svg",
      },
      content: "I've been following these tips and already feel better!",
      createdAt: "2024-02-07",
      likes: 8,
      replies: [],
    },
  ]);

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "Free":
        return "#22c55e";
      case "Recommend":
        return "#3b82f6";
      case "News":
        return "#f59e0b";
      case "Question":
        return "#8b5cf6";
      default:
        return "#64748b";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: API call to like/unlike article
  };

  const handleCommentSubmit = () => {
    if (commentText.trim()) {
      const newComment: Comment = {
        id: comments.length + 1,
        author: {
          name: "Current User",
          image: "/img/defaultUser.svg",
        },
        content: commentText,
        createdAt: new Date().toISOString(),
        likes: 0,
        replies: [],
      };
      setComments([newComment, ...comments]);
      setCommentText("");
      // TODO: API call to submit comment
    }
  };

  const handleReplySubmit = (commentId: number) => {
    const replyContent = replyText[commentId];
    if (replyContent?.trim()) {
      const newReply: Reply = {
        id: Date.now(),
        author: {
          name: "Current User",
          image: "/img/defaultUser.svg",
        },
        content: replyContent,
        createdAt: new Date().toISOString(),
        likes: 0,
      };

      setComments(
        comments.map((comment) =>
          comment.id === commentId
            ? { ...comment, replies: [...comment.replies, newReply] }
            : comment,
        ),
      );

      setReplyText({ ...replyText, [commentId]: "" });
      setShowReplyBox({ ...showReplyBox, [commentId]: false });
      // TODO: API call to submit reply
    }
  };

  const toggleReplyBox = (commentId: number) => {
    setShowReplyBox({
      ...showReplyBox,
      [commentId]: !showReplyBox[commentId],
    });
  };

  return (
    <div id="community-detail-page">
      <Stack className="detail-container">
        <Stack className="detail-content">
          {/* Article Header */}
          <Stack className="article-header">
            <Chip
              label={article.category}
              className="category-badge"
              sx={{ backgroundColor: getCategoryColor(article.category) }}
            />
            <Typography className="article-title">{article.title}</Typography>

            {/* Author Info */}
            <Stack className="author-meta">
              <Stack className="author-section">
                <Avatar
                  src={article.author.image}
                  alt={article.author.name}
                  className="author-avatar"
                />
                <Stack className="author-info">
                  <Typography className="author-name">
                    {article.author.name}
                  </Typography>
                  <Typography className="publish-date">
                    {formatDate(article.createdAt)}
                  </Typography>
                </Stack>
              </Stack>

              <Stack className="article-stats">
                <Stack className="stat-item">
                  <RemoveRedEyeIcon className="stat-icon" />
                  <Typography className="stat-count">
                    {article.views}
                  </Typography>
                </Stack>
                <Stack className="stat-item">
                  <IconButton onClick={handleLike} className="like-btn">
                    {isLiked ? (
                      <FavoriteIcon className="liked" />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                  <Typography className="stat-count">
                    {article.likes + (isLiked ? 1 : 0)}
                  </Typography>
                </Stack>
                <Stack className="stat-item">
                  <ChatBubbleOutlineIcon className="stat-icon" />
                  <Typography className="stat-count">
                    {comments.length}
                  </Typography>
                </Stack>
              </Stack>
            </Stack>
          </Stack>

          {/* Article Image */}
          {article.image && (
            <Box className="article-image">
              <img src={article.image} alt={article.title} />
            </Box>
          )}

          {/* Article Content */}
          <Stack className="article-content">
            <div dangerouslySetInnerHTML={{ __html: article.content }} />
          </Stack>

          {/* Comments Section */}
          <Stack className="comments-section">
            <Typography className="section-title">
              Comments ({comments.length})
            </Typography>

            {/* Write Comment */}
            <Stack className="write-comment">
              <Avatar src="/img/defaultUser.svg" className="comment-avatar" />
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

            {/* Comments List */}
            <Stack className="comments-list">
              {comments.map((comment) => (
                <Stack key={comment.id} className="comment-item">
                  <Stack className="comment-header">
                    <Avatar
                      src={comment.author.image}
                      className="comment-avatar"
                    />
                    <Stack className="comment-info">
                      <Typography className="comment-author">
                        {comment.author.name}
                      </Typography>
                      <Typography className="comment-date">
                        {formatDate(comment.createdAt)}
                      </Typography>
                    </Stack>
                  </Stack>

                  <Typography className="comment-content">
                    {comment.content}
                  </Typography>

                  <Stack className="comment-actions-bar">
                    <Button
                      size="small"
                      startIcon={<FavoriteBorderIcon />}
                      className="comment-action-btn"
                    >
                      {comment.likes}
                    </Button>
                    <Button
                      size="small"
                      startIcon={<ReplyIcon />}
                      className="comment-action-btn"
                      onClick={() => toggleReplyBox(comment.id)}
                    >
                      Reply
                    </Button>
                  </Stack>

                  {/* Reply Box */}
                  {showReplyBox[comment.id] && (
                    <Stack className="reply-box">
                      <Avatar
                        src="/img/defaultUser.svg"
                        className="reply-avatar"
                      />
                      <TextField
                        multiline
                        rows={2}
                        fullWidth
                        placeholder="Write a reply..."
                        value={replyText[comment.id] || ""}
                        onChange={(e) =>
                          setReplyText({
                            ...replyText,
                            [comment.id]: e.target.value,
                          })
                        }
                        className="reply-input"
                      />
                      <Button
                        variant="contained"
                        size="small"
                        endIcon={<SendIcon />}
                        onClick={() => handleReplySubmit(comment.id)}
                        disabled={!replyText[comment.id]?.trim()}
                        className="submit-reply-btn"
                      >
                        Reply
                      </Button>
                    </Stack>
                  )}

                  {/* Replies List */}
                  {comment.replies.length > 0 && (
                    <Stack className="replies-list">
                      {comment.replies.map((reply) => (
                        <Stack key={reply.id} className="reply-item">
                          <Stack className="reply-header">
                            <Avatar
                              src={reply.author.image}
                              className="reply-avatar-small"
                            />
                            <Stack className="reply-info">
                              <Typography className="reply-author">
                                {reply.author.name}
                              </Typography>
                              <Typography className="reply-date">
                                {formatDate(reply.createdAt)}
                              </Typography>
                            </Stack>
                          </Stack>

                          <Typography className="reply-content">
                            {reply.content}
                          </Typography>

                          <Stack className="reply-actions-bar">
                            <Button
                              size="small"
                              startIcon={<FavoriteBorderIcon />}
                              className="reply-action-btn"
                            >
                              {reply.likes}
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
        </Stack>
      </Stack>
    </div>
  );
};

export default withLayoutMain(CommunityDetail);
