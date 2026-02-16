import React from "react";
import Link from "next/link";
import { NextPage } from "next";
import {
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import { BoardArticleStatus } from "@/libs/enums/board-article.enum";
import withLayoutAdmin from "@/libs/components/layout/LayoutAdmin";
import { GET_ALL_BOARD_ARTICLES_BY_ADMIN } from "@/apollo/admin/query";
import {
  REMOVE_BOARD_ARTICLES_BY_ADMIN,
  UPDATE_BOARD_ARTICLES_BY_ADMIN,
} from "@/apollo/admin/mutation";
import { BoardArticles } from "@/libs/types/board-article/board-article";
import { AllBoardArticlesInquiry } from "@/libs/types/board-article/board-article.input";
import { BoardArticleUpdate } from "@/libs/types/board-article/board-article.update";
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from "@/libs/sweetAlert";

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

const formatDate = (value?: Date | string) => {
  if (!value) return "-";
  return new Date(value).toLocaleDateString();
};

const AdminArticlesPage: NextPage = () => {
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
          limit: 200,
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

  const articles = getArticlesData?.getAllBoardArticlesByAdmin?.list ?? [];
  const mutationLoading = updateArticleLoading || removeArticleLoading;

  const onChangeStatus = async (articleId: string, next: BoardArticleStatus) => {
    try {
      if (next === BoardArticleStatus.DELETE) {
        await removeBoardArticleByAdmin({ variables: { input: articleId } });
        await getArticlesRefetch();
        await sweetTopSmallSuccessAlert("Article deleted", 800);
        return;
      }

      await updateBoardArticleByAdmin({
        variables: {
          input: {
            _id: articleId,
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

  return (
    <Box className="admin-section">
      <Typography variant="h4" className="admin-section__title" gutterBottom>
        Articles
      </Typography>
      <Typography variant="body2" className="admin-section__subtitle">
        Manage article publication status.
      </Typography>

      {getArticlesLoading && (
        <Stack
          sx={{
            width: "100%",
            minHeight: "280px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={"2.6rem"} />
        </Stack>
      )}

      {!getArticlesLoading && getArticlesError && (
        <Typography>Failed to load articles.</Typography>
      )}

      {mutationLoading && !getArticlesLoading && (
        <Stack sx={{ width: "100%", alignItems: "center", justifyContent: "center", py: 2 }}>
          <CircularProgress size={"1.8rem"} />
        </Stack>
      )}

      {!getArticlesLoading && !getArticlesError && (
        <Stack className="admin-list" spacing={1.5}>
          {articles.map((article) => (
            <Box className="admin-list__row" key={article._id}>
              <Box className="admin-list__col admin-list__col--main">
                <Link
                  href={`/_admin/articles/detail?id=${article._id}`}
                  style={{ textDecoration: "none", color: "inherit" }}
                >
                  <Typography className="admin-list__name">{article.articleTitle}</Typography>
                </Link>
                <Typography className="admin-list__meta">
                  By: {article.memberData?.memberNick || article.memberId} |{" "}
                  {formatDate(article.createdAt)}
                </Typography>
              </Box>

              <FormControl size="small" className="admin-list__status">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={article.articleStatus}
                  onChange={(event) =>
                    onChangeStatus(article._id, event.target.value as BoardArticleStatus)
                  }
                >
                  <MenuItem value={BoardArticleStatus.ACTIVE}>ACTIVE</MenuItem>
                  <MenuItem value={BoardArticleStatus.DELETE}>DELETE</MenuItem>
                </Select>
              </FormControl>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default withLayoutAdmin(AdminArticlesPage);
