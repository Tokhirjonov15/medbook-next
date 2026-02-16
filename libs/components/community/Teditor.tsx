import React, { useEffect, useMemo, useRef, useState } from "react";
import {
  Box,
  Button,
  CircularProgress,
  FormControl,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import { Editor } from "@toast-ui/react-editor";
import axios from "axios";
import { useMutation, useReactiveVar } from "@apollo/client";
import { useRouter } from "next/router";
import { BoardArticleCategory } from "@/libs/enums/board-article.enum";
import { CREATE_BOARD_ARTICLE } from "@/apollo/user/mutation";
import { getJwtToken } from "@/libs/auth";
import { userVar } from "@/apollo/store";
import {
  sweetErrorHandling,
  sweetMixinErrorAlert,
  sweetTopSmallSuccessAlert,
} from "@/libs/sweetAlert";
import "@toast-ui/editor/dist/toastui-editor.css";

const TEditor = () => {
  const editorRef = useRef<Editor>(null);
  const token = getJwtToken();
  const router = useRouter();
  const user = useReactiveVar(userVar);

  const [articleCategory, setArticleCategory] = useState<BoardArticleCategory>(
    BoardArticleCategory.FREE,
  );
  const [articleTitle, setArticleTitle] = useState("");
  const [articleContent, setArticleContent] = useState("");
  const [articleImage, setArticleImage] = useState("");

  const [createBoardArticle, { loading: createLoading }] =
    useMutation(CREATE_BOARD_ARTICLE);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        const instance = editorRef.current?.getInstance();
        if (!instance) return;
        const current = String(instance.getMarkdown() || "").trim();
        if (current === "Write\nPreview" || current === "Write Preview") {
          instance.setMarkdown("");
          setArticleContent("");
        }
      } catch (_) {
        // no-op
      }
    }, 0);

    return () => clearTimeout(timer);
  }, []);

  const noisePatterns = [
    /write your article content here\.{0,3}/gi,
    /(^|\n)\s*(?:[#>*-]\s*)*write\s*(?=\n|$)/gi,
    /(^|\n)\s*(?:[#>*-]\s*)*preview\s*(?=\n|$)/gi,
    /(^|\n)\s*(?:[#>*-]\s*)*markdown\s*(?=\n|$)/gi,
    /(^|\n)\s*(?:[#>*-]\s*)*wysiwyg\.?\s*(?=\n|$)/gi,
  ];

  const sanitizeEditorText = (value: string): string => {
    let removed = String(value || "").replace(/\r\n/g, "\n");
    noisePatterns.forEach((pattern) => {
      removed = removed.replace(pattern, "\n");
    });

    return removed.replace(/\n{3,}/g, "\n\n").trim();
  };

  const normalizeMarkdown = (value: string): string =>
    sanitizeEditorText(
      String(value || "")
        .replace(/\r\n/g, "\n")
        .replace(/([^\n])(!\[[^\]]*\]\([^)]+\))/g, "$1\n\n$2"),
    );

  const previewText = useMemo(() => {
    return sanitizeEditorText(articleContent)
      .replace(/^\s*(?:write|preview)(?:\s+(?:write|preview))*\s*/gi, "")
      .replace(/!\[[^\]]*\]\([^)]+\)/g, " ")
      .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
      .replace(/\b(?:write|preview)\b\s*:?/gi, " ")
      .replace(/[`*_>#~\-]/g, " ")
      .replace(/\s+/g, " ")
      .trim();
  }, [articleContent]);

  const stripMarkdownImages = (value: string): string =>
    String(value || "")
      .replace(/!\[[^\]]*\]\([^)]+\)/g, "")
      .replace(/\n{3,}/g, "\n\n")
      .trim();

  const canSubmit = useMemo(
    () =>
      articleTitle.trim().length > 0 &&
      articleContent.trim().length > 0 &&
      !createLoading,
    [articleTitle, articleContent, createLoading],
  );

  const uploadImage = async (image: File | Blob) => {
    const graphqlUrl =
      process.env.NEXT_PUBLIC_API_GRAPHQL_URL ||
      process.env.REACT_APP_API_GRAPHQL_URL ||
      "http://localhost:3004/graphql";
    const apiBase =
      process.env.NEXT_PUBLIC_API_URL ||
      process.env.REACT_APP_API_URL ||
      "http://localhost:3004";

    const formData = new FormData();
    formData.append(
      "operations",
      JSON.stringify({
        query: `mutation ImageUploader($file: Upload!, $target: String!) {
          imageUploader(file: $file, target: $target)
        }`,
        variables: {
          file: null,
          target: "article",
        },
      }),
    );
    formData.append(
      "map",
      JSON.stringify({
        "0": ["variables.file"],
      }),
    );
    formData.append("0", image, image instanceof File ? image.name : "article-image.png");

    const response = await axios.post(graphqlUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "apollo-require-preflight": "true",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    const uploaded = response?.data?.data?.imageUploader;
    if (!uploaded) throw new Error("Image upload failed");
    setArticleImage(uploaded);
    return `${apiBase}/${uploaded}`;
  };

  const handleRegister = async () => {
    try {
      if (!user?._id) throw new Error("Please login first");
      const markdown = normalizeMarkdown(
        editorRef.current?.getInstance().getMarkdown() || "",
      );
      const cleanContent = stripMarkdownImages(markdown);
      if (!articleTitle.trim() || !cleanContent.trim())
        throw new Error("Please fulfill all inputs!");

      await createBoardArticle({
        variables: {
          input: {
            articleCategory,
            articleTitle: articleTitle.trim(),
            articleContent: cleanContent,
            articleImage: articleImage || undefined,
          },
        },
      });

      await sweetTopSmallSuccessAlert("Article created successfully", 900);
      const isDoctorRoute = router.pathname.startsWith("/_doctor/");
      await router.push(isDoctorRoute ? "/_doctor/community" : "/community");
    } catch (err: any) {
      if (String(err?.message || "").includes("login")) {
        await sweetMixinErrorAlert("Please login first");
        return;
      }
      sweetErrorHandling(err).then();
    }
  };

  return (
    <Stack className="create-form" spacing={2}>
      {createLoading && (
        <Stack
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            width: "100%",
            minHeight: "120px",
          }}
        >
          <CircularProgress size={"2rem"} />
        </Stack>
      )}

      <Stack direction={"row"} spacing={2} flexWrap={"wrap"}>
        <Box sx={{ width: "300px" }}>
          <Typography className="section-label">
            Category <span className="required">*</span>
          </Typography>
          <FormControl sx={{ width: "100%", background: "#fff" }}>
            <Select
              value={articleCategory}
              onChange={(e) =>
                setArticleCategory(e.target.value as BoardArticleCategory)
              }
              displayEmpty
            >
              <MenuItem value={BoardArticleCategory.FREE}>Free</MenuItem>
              <MenuItem value={BoardArticleCategory.RECOMMEND}>
                Recommend
              </MenuItem>
              <MenuItem value={BoardArticleCategory.NEWS}>News</MenuItem>
              <MenuItem value={BoardArticleCategory.QUESTION}>
                Question
              </MenuItem>
            </Select>
          </FormControl>
        </Box>

        <Box sx={{ width: "300px" }}>
          <Typography className="section-label">
            Title <span className="required">*</span>
          </Typography>
          <TextField
            fullWidth
            value={articleTitle}
            onChange={(e) => setArticleTitle(e.target.value)}
            placeholder=""
            sx={{ background: "#fff" }}
          />
        </Box>
      </Stack>

      <Box sx={{ position: "relative" }}>
        {!articleContent.trim() && (
          <Typography
            sx={{
              position: "absolute",
              top: "64px",
              left: "26px",
              color: "#94a3b8",
              fontSize: "14px",
              pointerEvents: "none",
              zIndex: 2,
            }}
          >
            write your article content here...
          </Typography>
        )}

        <Editor
          initialValue={""}
          placeholder={""}
          previewStyle={"tab"}
          height={"640px"}
          initialEditType={"wysiwyg"}
          hideModeSwitch={true}
          toolbarItems={[
            ["heading", "bold", "italic", "strike"],
            ["image", "table", "link"],
            ["ul", "ol", "task"],
          ]}
          ref={editorRef}
          onChange={() => {
            const markdown = normalizeMarkdown(
              editorRef.current?.getInstance().getMarkdown() || "",
            );
            setArticleContent(markdown);
          }}
          hooks={{
            addImageBlobHook: (
              blob: File | Blob,
              callback: (url: string) => void,
            ): void => {
              void (async () => {
                try {
                  const uploadedImageURL = await uploadImage(blob);
                  callback(uploadedImageURL);
                } catch (err: any) {
                  sweetErrorHandling(err).then();
                }
              })();
            },
          }}
        />
      </Box>

      <Stack className="form-section">
        <Typography className="section-label">Preview</Typography>
        <Box className="content-preview">
          <Typography className="preview-title">
            {articleTitle.trim() || "Untitled Article"}
          </Typography>
          <Typography className="preview-content">
            {previewText || "Preview will appear here..."}
          </Typography>
        </Box>
      </Stack>

      <Stack direction={"row"} justifyContent={"center"}>
        <Button
          variant="contained"
          onClick={handleRegister}
          disabled={!canSubmit}
          className="submit-btn"
          sx={{ width: "260px", height: "45px", mb: 1 }}
        >
          {createLoading ? "Publishing..." : "Publish Article"}
        </Button>
      </Stack>
    </Stack>
  );
};

export default TEditor;

