import React from "react";
import { Box, Chip, Stack, Typography } from "@mui/material";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import FavoriteIcon from "@mui/icons-material/Favorite";
import ChatBubbleOutlineIcon from "@mui/icons-material/ChatBubbleOutline";
import { useRouter } from "next/router";

interface CommunityCardProps {
  article: {
    id: number;
    title: string;
    category: string;
    author: {
      name: string;
      image: string;
    };
    content: string;
    image: string | null;
    views: number;
    likes: number;
    comments: number;
    createdAt: string;
  };
}

const CommunityCard = ({ article }: CommunityCardProps) => {
  const router = useRouter();

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
      month: "short",
      day: "numeric",
    });
  };

  const handleCardClick = () => {
    const detailPath = router.pathname.startsWith("/_doctor/community")
      ? "/_doctor/community/detail"
      : "/community/detail";
    router.push(`${detailPath}?id=${article.id}`);
  };

  return (
    <Stack className="community-card-config" onClick={handleCardClick}>
      <Stack className="card-main">
        {article.image && (
          <Box className="card-image">
            <img src={article.image} alt={article.title} />
            <Chip
              label={article.category}
              className="category-badge"
              sx={{ backgroundColor: getCategoryColor(article.category) }}
            />
          </Box>
        )}

        <Stack className="card-content">
          {!article.image && (
            <Chip
              label={article.category}
              className="category-badge-inline"
              sx={{ backgroundColor: getCategoryColor(article.category) }}
            />
          )}

          <Typography className="article-title">{article.title}</Typography>

          <Typography className="article-excerpt">{article.content}</Typography>

          <Stack className="card-footer">
            <Stack className="author-section">
              <Box className="author-avatar">
                <img src={article.author.image} alt={article.author.name} />
              </Box>
              <Stack className="author-info">
                <Typography className="author-name">
                  {article.author.name}
                </Typography>
                <Typography className="publish-date">
                  {formatDate(article.createdAt)}
                </Typography>
              </Stack>
            </Stack>

            <Stack className="stats-section">
              <Stack className="stat-item">
                <RemoveRedEyeIcon className="stat-icon" />
                <Typography className="stat-count">{article.views}</Typography>
              </Stack>
              <Stack className="stat-item">
                <FavoriteIcon className="stat-icon" />
                <Typography className="stat-count">{article.likes}</Typography>
              </Stack>
              <Stack className="stat-item">
                <ChatBubbleOutlineIcon className="stat-icon" />
                <Typography className="stat-count">
                  {article.comments}
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default CommunityCard;
