import React from "react";
import { NextPage } from "next";
import { Box, Button, MenuItem, Stack, TextField, Typography } from "@mui/material";
import withLayoutAdmin from "@/libs/components/layout/LayoutAdmin";
import {
  CsPost,
  CsPostType,
  getStoredCsPosts,
  setStoredCsPosts,
} from "@/libs/configs/csContent";

const AdminCsPage: NextPage = () => {
  const [posts, setPosts] = React.useState<CsPost[]>([]);
  const [type, setType] = React.useState<CsPostType>("NOTICE");
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");

  React.useEffect(() => {
    setPosts(getStoredCsPosts());
  }, []);

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) return;

    const nextPost: CsPost = {
      id: `post-${Date.now()}`,
      type,
      title: trimmedTitle,
      content: trimmedContent,
      createdAt: new Date().toISOString(),
    };
    const nextPosts = [nextPost, ...posts];
    setPosts(nextPosts);
    setStoredCsPosts(nextPosts);
    setTitle("");
    setContent("");
  };

  return (
    <Box className="admin-section">
      <Typography variant="h4" className="admin-section__title" gutterBottom>
        CS
      </Typography>
      <Typography variant="body2" className="admin-section__subtitle">
        Add FAQ or Notice. These will be visible in user and doctor CS pages.
      </Typography>

      <Box component="form" className="admin-cs__form" onSubmit={onSubmit}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            select
            label="Type"
            value={type}
            onChange={(event) => setType(event.target.value as CsPostType)}
            className="admin-cs__type"
          >
            <MenuItem value="NOTICE">NOTICE</MenuItem>
            <MenuItem value="FAQ">FAQ</MenuItem>
          </TextField>
          <TextField
            label="Title"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            fullWidth
          />
        </Stack>
        <TextField
          label="Content"
          value={content}
          onChange={(event) => setContent(event.target.value)}
          fullWidth
          multiline
          minRows={4}
        />
        <Button type="submit" variant="contained" className="admin-cs__submit">
          Publish
        </Button>
      </Box>

      <Stack className="admin-list" spacing={1.5}>
        {posts.map((item) => (
          <Box className="admin-list__row admin-list__row--block" key={item.id}>
            <Box className="admin-list__col admin-list__col--main">
              <Typography className="admin-list__name">
                [{item.type}] {item.title}
              </Typography>
              <Typography className="admin-list__meta">{item.content}</Typography>
            </Box>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default withLayoutAdmin(AdminCsPage);
