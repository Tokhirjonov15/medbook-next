import React from "react";
import { NextPage } from "next";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { BoardArticleStatus } from "@/libs/enums/board-article.enum";
import withLayoutAdmin from "@/libs/components/layout/LayoutAdmin";

type ArticleRow = {
  id: number;
  title: string;
  status: BoardArticleStatus;
};

const AdminArticlesPage: NextPage = () => {
  const [articles, setArticles] = React.useState<ArticleRow[]>([
    { id: 1, title: "How to Keep Heart Healthy", status: BoardArticleStatus.ACTIVE },
    { id: 2, title: "Top 10 Skincare Habits", status: BoardArticleStatus.DELETE },
    { id: 3, title: "5 Morning Routine Tips", status: BoardArticleStatus.ACTIVE },
  ]);

  const onChangeStatus = (articleId: number, next: BoardArticleStatus) => {
    setArticles((prev) =>
      prev.map((item) =>
        item.id === articleId ? { ...item, status: next } : item,
      ),
    );
  };

  return (
    <Box className="admin-section">
      <Typography variant="h4" className="admin-section__title" gutterBottom>
        Articles
      </Typography>
      <Typography variant="body2" className="admin-section__subtitle">
        Manage article publication status.
      </Typography>

      <Stack className="admin-list" spacing={1.5}>
        {articles.map((article) => (
          <Box className="admin-list__row" key={article.id}>
            <Box className="admin-list__col admin-list__col--main">
              <Typography className="admin-list__name">{article.title}</Typography>
            </Box>

            <FormControl size="small" className="admin-list__status">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={article.status}
                onChange={(event) =>
                  onChangeStatus(
                    article.id,
                    event.target.value as BoardArticleStatus,
                  )
                }
              >
                <MenuItem value={BoardArticleStatus.ACTIVE}>ACTIVE</MenuItem>
                <MenuItem value={BoardArticleStatus.DELETE}>DELETE</MenuItem>
              </Select>
            </FormControl>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default withLayoutAdmin(AdminArticlesPage);
