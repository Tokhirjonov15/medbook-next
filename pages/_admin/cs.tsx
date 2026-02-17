import React from "react";
import { NextPage } from "next";
import {
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  TextField,
  Typography,
} from "@mui/material";
import withLayoutAdmin from "@/libs/components/layout/LayoutAdmin";
import { useMutation, useQuery } from "@apollo/client";
import { GET_NOTICES } from "@/apollo/user/query";
import {
  CREATE_NOTICE,
  REMOVE_NOTICE_BY_ADMIN,
  UPDATE_NOTICE_BY_ADMIN,
} from "@/apollo/admin/mutation";
import {
  sweetConfirmAlert,
  sweetErrorHandlingForAdmin,
  sweetMixinSuccessAlert,
} from "@/libs/sweetAlert";

type NoticeTarget = "ALL" | "PATIENT" | "DOCTOR";
type NoticeStatus = "ACTIVE" | "INACTIVE" | "DELETED";

interface NoticeItem {
  _id: string;
  title: string;
  content: string;
  target: NoticeTarget;
  status: NoticeStatus;
  createdAt: string;
}

const AdminCsPage: NextPage = () => {
  const queryInput = React.useMemo(
    () => ({
      page: 1,
      limit: 100,
      sort: "createdAt",
      direction: "DESC",
      search: {},
    }),
    [],
  );

  const { data, loading, refetch } = useQuery(GET_NOTICES, {
    fetchPolicy: "cache-and-network",
    variables: { input: queryInput },
    notifyOnNetworkStatusChange: true,
  });

  const [createNotice] = useMutation(CREATE_NOTICE);
  const [updateNoticeByAdmin] = useMutation(UPDATE_NOTICE_BY_ADMIN);
  const [removeNoticeByAdmin] = useMutation(REMOVE_NOTICE_BY_ADMIN);

  const [editId, setEditId] = React.useState<string | null>(null);
  const [target, setTarget] = React.useState<NoticeTarget>("ALL");
  const [status, setStatus] = React.useState<NoticeStatus>("ACTIVE");
  const [title, setTitle] = React.useState("");
  const [content, setContent] = React.useState("");

  const notices: NoticeItem[] = data?.getNotices?.list ?? [];

  const resetForm = () => {
    setEditId(null);
    setTitle("");
    setContent("");
    setTarget("ALL");
    setStatus("ACTIVE");
  };

  const onSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    const trimmedTitle = title.trim();
    const trimmedContent = content.trim();
    if (!trimmedTitle || !trimmedContent) return;

    try {
      if (editId) {
        await updateNoticeByAdmin({
          variables: {
            input: {
              _id: editId,
              title: trimmedTitle,
              content: trimmedContent,
              target,
              status,
            },
          },
        });
        await sweetMixinSuccessAlert("Notice updated");
      } else {
        await createNotice({
          variables: {
            input: {
              title: trimmedTitle,
              content: trimmedContent,
              target,
            },
          },
        });
        await sweetMixinSuccessAlert("Notice published");
      }

      resetForm();
      await refetch({ input: queryInput });
    } catch (err: any) {
      await sweetErrorHandlingForAdmin(err);
    }
  };

  const handleEdit = (item: NoticeItem) => {
    setEditId(item._id);
    setTitle(item.title);
    setContent(item.content);
    setTarget(item.target);
    setStatus(item.status);
  };

  const handleRemove = async (id: string) => {
    const confirmed = await sweetConfirmAlert("Remove this notice?");
    if (!confirmed) return;

    try {
      await removeNoticeByAdmin({ variables: { input: id } });
      await sweetMixinSuccessAlert("Notice removed");
      if (editId === id) resetForm();
      await refetch({ input: queryInput });
    } catch (err: any) {
      await sweetErrorHandlingForAdmin(err);
    }
  };

  return (
    <Box className="admin-section">
      <Typography variant="h4" className="admin-section__title" gutterBottom>
        CS
      </Typography>
      <Typography variant="body2" className="admin-section__subtitle">
        Manage platform notices. These are visible in patient and doctor CS pages.
      </Typography>

      <Box component="form" className="admin-cs__form" onSubmit={onSubmit}>
        <Stack direction={{ xs: "column", md: "row" }} spacing={1.5}>
          <TextField
            select
            label="Target"
            value={target}
            onChange={(event) => setTarget(event.target.value as NoticeTarget)}
            className="admin-cs__type"
          >
            <MenuItem value="ALL">ALL</MenuItem>
            <MenuItem value="PATIENT">PATIENT</MenuItem>
            <MenuItem value="DOCTOR">DOCTOR</MenuItem>
          </TextField>

          <TextField
            select
            label="Status"
            value={status}
            onChange={(event) => setStatus(event.target.value as NoticeStatus)}
            className="admin-cs__type"
            disabled={!editId}
          >
            <MenuItem value="ACTIVE">ACTIVE</MenuItem>
            <MenuItem value="INACTIVE">INACTIVE</MenuItem>
            <MenuItem value="DELETED">DELETED</MenuItem>
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
        <Stack direction="row" spacing={1} justifyContent="flex-end">
          {editId && (
            <Button variant="outlined" onClick={resetForm}>
              Cancel Edit
            </Button>
          )}
          <Button type="submit" variant="contained" className="admin-cs__submit">
            {editId ? "Update Notice" : "Publish Notice"}
          </Button>
        </Stack>
      </Box>

      <Stack className="admin-list" spacing={1.5}>
        {loading ? (
          <Stack sx={{ alignItems: "center", py: 4 }}>
            <CircularProgress />
          </Stack>
        ) : (
          notices.map((item) => (
            <Box className="admin-list__row admin-list__row--block" key={item._id}>
              <Box className="admin-list__col admin-list__col--main">
                <Typography className="admin-list__name">
                  [{item.target}] {item.title}
                </Typography>
                <Typography className="admin-list__meta">{item.content}</Typography>
                <Typography className="admin-list__meta">
                  Status: {item.status} | {new Date(item.createdAt).toLocaleString()}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1}>
                <Button size="small" variant="outlined" onClick={() => handleEdit(item)}>
                  Edit
                </Button>
                <Button
                  size="small"
                  color="error"
                  variant="outlined"
                  onClick={() => handleRemove(item._id)}
                >
                  Remove
                </Button>
              </Stack>
            </Box>
          ))
        )}
      </Stack>
    </Box>
  );
};

export default withLayoutAdmin(AdminCsPage);
