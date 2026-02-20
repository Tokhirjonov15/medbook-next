import React, { useMemo, useState } from "react";
import {
  Button,
  CircularProgress,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import CreateIcon from "@mui/icons-material/Create";
import CommunityFilter from "@/libs/components/community/Filter";
import CommunityCard from "@/libs/components/community/Communitycard";
import withLayoutDoctor from "@/libs/components/layout/LayoutDoctor";
import { GET_BOARD_ARTICLES } from "@/apollo/user/query";
import { LIKE_TARGET_BOARD_ARTICLE } from "@/apollo/user/mutation";
import { BoardArticlesInquiry } from "@/libs/types/board-article/board-article.input";
import { BoardArticle, BoardArticles } from "@/libs/types/board-article/board-article";
import { BoardArticleCategory } from "@/libs/enums/board-article.enum";
import { userVar } from "@/apollo/store";
import {
  sweetErrorHandling,
  sweetMixinErrorAlert,
  sweetTopSmallSuccessAlert,
} from "@/libs/sweetAlert";
import { Messages } from "@/libs/config";
import { Direction } from "@/libs/enums/common.enum";

interface DoctorCommunityListProps {
  initialInput: BoardArticlesInquiry;
}

interface GetBoardArticlesResponse {
  getBoardArticles: BoardArticles;
}

interface GetBoardArticlesVariables {
  input: BoardArticlesInquiry;
}

type CategoryUi = "All" | "Free" | "Recommend" | "News" | "Question";

const CATEGORY_TO_ENUM: Partial<Record<CategoryUi, BoardArticleCategory>> = {
  Free: BoardArticleCategory.FREE,
  Recommend: BoardArticleCategory.RECOMMEND,
  News: BoardArticleCategory.NEWS,
  Question: BoardArticleCategory.QUESTION,
};

const getCategoryLabel = (value: BoardArticleCategory): string => {
  if (value === BoardArticleCategory.FREE) return "Free";
  if (value === BoardArticleCategory.RECOMMEND) return "Recommend";
  if (value === BoardArticleCategory.NEWS) return "News";
  if (value === BoardArticleCategory.QUESTION) return "Question";
  return "Free";
};

const getCategoryFallbackImage = (category: BoardArticleCategory): string => {
  if (category === BoardArticleCategory.NEWS) return "/img/nws.png";
  if (category === BoardArticleCategory.FREE) return "/img/free.jpg";
  if (category === BoardArticleCategory.RECOMMEND) return "/img/recommend.png";
  return "/img/question.jpg";
};

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

const toPlainText = (value: string): string =>
  String(value || "")
    .replace(/!\[[^\]]*\]\(([^)]+)\)/g, " ")
    .replace(/\[([^\]]+)\]\(([^)]+)\)/g, "$1")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();

const DoctorCommunityList: NextPage<DoctorCommunityListProps> = (
  props: DoctorCommunityListProps,
) => {
  const { initialInput } = props;
  const router = useRouter();
  const user = useReactiveVar(userVar);

  const [selectedCategory, setSelectedCategory] = useState<CategoryUi>("All");
  const [currentPage, setCurrentPage] = useState<number>(initialInput.page);

  const queryInput = useMemo<BoardArticlesInquiry>(() => {
    const articleCategory = CATEGORY_TO_ENUM[selectedCategory];
    return {
      ...initialInput,
      page: currentPage,
      search: articleCategory ? { articleCategory } : {},
    };
  }, [currentPage, initialInput, selectedCategory]);

  const {
    loading: getBoardArticlesLoading,
    data: getBoardArticlesData,
    error: getBoardArticlesError,
    refetch: getBoardArticlesRefetch,
  } = useQuery<GetBoardArticlesResponse, GetBoardArticlesVariables>(
    GET_BOARD_ARTICLES,
    {
      fetchPolicy: "cache-and-network",
      variables: { input: queryInput },
      notifyOnNetworkStatusChange: true,
    },
  );
  const [likeTargetBoardArticle, { loading: likeArticleLoading }] = useMutation(
    LIKE_TARGET_BOARD_ARTICLE,
  );

  const rawArticles = getBoardArticlesData?.getBoardArticles?.list ?? [];
  const totalArticles =
    getBoardArticlesData?.getBoardArticles?.metaCounter?.[0]?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalArticles / queryInput.limit));

  const articles = useMemo(
    () =>
      rawArticles.map((article: BoardArticle) => ({
        id: article._id,
        title: article.articleTitle,
        category: getCategoryLabel(article.articleCategory),
        author: {
          name: article.memberData?.memberNick || "Unknown",
          image:
            toAbsoluteMediaUrl(article.memberData?.memberImage) ||
            "/img/defaultUser.svg",
        },
        content: toPlainText(article.articleContent),
        image:
          toAbsoluteMediaUrl(article.articleImage) ||
          getCategoryFallbackImage(article.articleCategory),
        views: article.articleViews || 0,
        likes: article.articleLikes || 0,
        comments: article.articleComments || 0,
        createdAt: article.createdAt,
        liked: Boolean(article.meLiked?.length),
      })),
    [rawArticles],
  );

  const handlePageChange = (_event: React.ChangeEvent<unknown>, value: number) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category as CategoryUi);
    setCurrentPage(1);
  };

  const handleCreateArticle = async () => {
    if (!user?._id) {
      await sweetMixinErrorAlert("Please login first");
      return;
    }
    await router.push("/_doctor/community/create");
  };

  const likeArticleHandler = async (articleId: string) => {
    try {
      if (!articleId) return;
      if (likeArticleLoading) return;
      if (!user?._id) throw new Error(Messages.error2);

      await likeTargetBoardArticle({
        variables: {
          input: articleId,
        },
      });
      await sweetTopSmallSuccessAlert("Success!", 800);
      await getBoardArticlesRefetch({ input: queryInput });
    } catch (err: any) {
      if (!user?._id) {
        await sweetMixinErrorAlert("Please login first");
        return;
      }
      sweetErrorHandling(err).then();
    }
  };

  return (
    <div
      id="community-list-page"
      style={{
        position: "relative",
        minHeight: "calc(100vh - 72px)",
        background: "#f6f6f6",
      }}
    >
      <Stack className="container">
        <Stack className="result-count">
          <Typography>{totalArticles} articles found</Typography>
          <Typography className="subtitle">
            Share your knowledge and connect with the community
          </Typography>
        </Stack>

        <Stack className="community-page">
          <Stack className="filter-config">
            <CommunityFilter
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryFilter}
            />
          </Stack>
          <Stack className="main-config" mb={"76px"}>
            <Stack className="write-section">
              <Button
                variant="contained"
                startIcon={<CreateIcon />}
                onClick={handleCreateArticle}
                className="write-btn"
              >
                Write Article
              </Button>
            </Stack>

            <Stack className="list-config" sx={{ position: "relative" }}>
              {likeArticleLoading && (
                <Stack
                  sx={{
                    position: "absolute",
                    inset: 0,
                    zIndex: 8,
                    background: "rgba(255, 255, 255, 0.55)",
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                  }}
                >
                  <CircularProgress size={"3rem"} />
                </Stack>
              )}
              {getBoardArticlesLoading && (
                <Stack
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    minHeight: "420px",
                  }}
                >
                  <CircularProgress size={"3rem"} />
                </Stack>
              )}
              {getBoardArticlesError && (
                <Typography>Failed to load community articles.</Typography>
              )}
              {!getBoardArticlesLoading &&
                !getBoardArticlesError &&
                articles.length === 0 && <Typography>No articles found.</Typography>}
              {!getBoardArticlesLoading &&
                !getBoardArticlesError &&
                articles.map((article) => (
                  <CommunityCard
                    key={article.id}
                    article={article}
                    onLike={likeArticleHandler}
                  />
                ))}
            </Stack>

            <Stack className="pagination-config">
              <Stack className="pagination-box">
                <Pagination
                  page={currentPage}
                  count={totalPages}
                  shape="circular"
                  color="secondary"
                  onChange={handlePageChange}
                />
              </Stack>
              <Stack className="total-result">
                <Typography>Total {totalArticles} articles available</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
};

DoctorCommunityList.defaultProps = {
  initialInput: {
    page: 1,
    limit: 6,
    sort: "createdAt",
    direction: Direction.DESC,
    search: {},
  },
};

export default withLayoutDoctor(DoctorCommunityList);
