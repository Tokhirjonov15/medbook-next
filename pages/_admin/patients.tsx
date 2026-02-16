import React from "react";
import { NextPage } from "next";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  FormControl,
  IconButton,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useApolloClient, useMutation, useQuery, useReactiveVar } from "@apollo/client";
import withLayoutAdmin from "@/libs/components/layout/LayoutAdmin";
import { GET_ALL_MEMBERS_BY_ADMIN } from "@/apollo/admin/query";
import { UPDATE_MEMBERS_BY_ADMIN } from "@/apollo/admin/mutation";
import { GET_MEMBER_FOLLOWERS, GET_MEMBER_FOLLOWINGS } from "@/apollo/user/query";
import {
  LIKE_TARGET_MEMBER,
  SUBSCRIBE_MEMBER,
  UNSUBSCRIBE_MEMBER,
} from "@/apollo/user/mutation";
import { Members } from "@/libs/types/members/member";
import { MemberUpdate } from "@/libs/types/members/member.update";
import { MembersInquiry } from "@/libs/types/members/member.input";
import { FollowInquiry } from "@/libs/types/follow/follow.input";
import { Followers, Followings } from "@/libs/types/follow/follow";
import { MemberStatus, MemberType } from "@/libs/enums/member.enum";
import { userVar } from "@/apollo/store";
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from "@/libs/sweetAlert";

interface GetAllMembersByAdminResponse {
  getAllMembersByAdmin: Members;
}
interface GetAllMembersByAdminVariables {
  input: MembersInquiry;
}
interface GetMemberFollowingsResponse {
  getMemberFollowings: Followings;
}
interface GetMemberFollowingsVariables {
  input: FollowInquiry;
}
interface GetMemberFollowersResponse {
  getMemberFollowers: Followers;
}
interface GetMemberFollowersVariables {
  input: FollowInquiry;
}
interface UpdateMemberByAdminResponse {
  updateMemberByAdmin: {
    _id: string;
    memberStatus: MemberStatus;
  };
}
interface UpdateMemberByAdminVariables {
  input: MemberUpdate;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:3004";
const ADMIN_LIKED_PATIENTS_KEY = "admin-liked-patients";

const toAbsoluteMediaUrl = (value?: string): string => {
  const src = String(value || "").trim();
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/img/")) return src;
  if (src.startsWith("/uploads/")) return `${API_BASE_URL}${src}`;
  if (src.startsWith("uploads/")) return `${API_BASE_URL}/${src}`;
  return src;
};

const AdminPatientsPage: NextPage = () => {
  const apolloClient = useApolloClient();
  const user = useReactiveVar(userVar);
  const [likedPatientIds, setLikedPatientIds] = React.useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(ADMIN_LIKED_PATIENTS_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });
  const [realFollowStats, setRealFollowStats] = React.useState<
    Record<string, { followers: number; followings: number }>
  >({});
  const {
    loading: getPatientsLoading,
    data: getPatientsData,
    error: getPatientsError,
    refetch: getPatientsRefetch,
  } = useQuery<GetAllMembersByAdminResponse, GetAllMembersByAdminVariables>(
    GET_ALL_MEMBERS_BY_ADMIN,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        input: {
          page: 1,
          limit: 100,
          sort: "createdAt",
          direction: "DESC",
          search: { memberType: MemberType.PATIENT },
        },
      },
      notifyOnNetworkStatusChange: true,
    },
  );
  const followingsInput = React.useMemo<FollowInquiry>(
    () => ({
      page: 1,
      limit: 1000,
      search: { followerId: user?._id || "" },
    }),
    [user?._id],
  );
  const {
    data: getFollowingsData,
    refetch: getFollowingsRefetch,
  } = useQuery<GetMemberFollowingsResponse, GetMemberFollowingsVariables>(
    GET_MEMBER_FOLLOWINGS,
    {
      fetchPolicy: "cache-and-network",
      variables: { input: followingsInput },
      notifyOnNetworkStatusChange: true,
      skip: !user?._id,
    },
  );
  const [updateMemberByAdmin, { loading: updateMemberByAdminLoading }] = useMutation<
    UpdateMemberByAdminResponse,
    UpdateMemberByAdminVariables
  >(UPDATE_MEMBERS_BY_ADMIN);
  const [likeTargetMember, { loading: likeTargetMemberLoading }] =
    useMutation(LIKE_TARGET_MEMBER);
  const [subscribeMember, { loading: subscribeMemberLoading }] =
    useMutation(SUBSCRIBE_MEMBER);
  const [unsubscribeMember, { loading: unsubscribeMemberLoading }] =
    useMutation(UNSUBSCRIBE_MEMBER);

  const patients = getPatientsData?.getAllMembersByAdmin?.list ?? [];
  const followedPatientIds = React.useMemo(() => {
    const set = new Set<string>();
    (getFollowingsData?.getMemberFollowings?.list ?? []).forEach((item) => {
      if (item.followingId) set.add(item.followingId);
    });
    return set;
  }, [getFollowingsData]);
  const mutationLoading =
    updateMemberByAdminLoading ||
    likeTargetMemberLoading ||
    subscribeMemberLoading ||
    unsubscribeMemberLoading;

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(ADMIN_LIKED_PATIENTS_KEY, JSON.stringify(likedPatientIds));
    } catch {
      // ignore
    }
  }, [likedPatientIds]);

  React.useEffect(() => {
    let cancelled = false;
    const loadRealFollowStats = async () => {
      if (!patients.length) {
        if (!cancelled) setRealFollowStats({});
        return;
      }

      const entries = await Promise.all(
        patients.map(async (patient) => {
          try {
            const [followersRes, followingsRes] = await Promise.all([
              apolloClient.query<GetMemberFollowersResponse, GetMemberFollowersVariables>({
                query: GET_MEMBER_FOLLOWERS,
                variables: {
                  input: {
                    page: 1,
                    limit: 1,
                    search: { followingId: patient._id },
                  },
                },
                fetchPolicy: "network-only",
              }),
              apolloClient.query<GetMemberFollowingsResponse, GetMemberFollowingsVariables>({
                query: GET_MEMBER_FOLLOWINGS,
                variables: {
                  input: {
                    page: 1,
                    limit: 1,
                    search: { followerId: patient._id },
                  },
                },
                fetchPolicy: "network-only",
              }),
            ]);

            const followers =
              followersRes.data?.getMemberFollowers?.metaCounter?.[0]?.total ?? 0;
            const followings =
              followingsRes.data?.getMemberFollowings?.metaCounter?.[0]?.total ?? 0;

            return [patient._id, { followers, followings }] as const;
          } catch {
            return [
              patient._id,
              {
                followers: patient.memberFollowers ?? 0,
                followings: patient.memberFollowings ?? 0,
              },
            ] as const;
          }
        }),
      );

      if (cancelled) return;
      setRealFollowStats(Object.fromEntries(entries));
    };

    loadRealFollowStats();
    return () => {
      cancelled = true;
    };
  }, [apolloClient, patients]);

  const onChangeStatus = async (patientId: string, next: MemberStatus) => {
    try {
      await updateMemberByAdmin({
        variables: {
          input: {
            _id: patientId,
            memberStatus: next,
          },
        },
      });
      await getPatientsRefetch();
      await sweetTopSmallSuccessAlert("Status updated", 800);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const likePatientHandler = async (patientId: string) => {
    try {
      if (!user?._id) throw new Error("Please login first");
      const patientBefore = patients.find((item) => item._id === patientId);
      const prevLikes = patientBefore?.memberLikes ?? 0;
      await likeTargetMember({ variables: { input: patientId } });
      const refetchResult = await getPatientsRefetch();
      const patientAfter = refetchResult?.data?.getAllMembersByAdmin?.list?.find(
        (item: any) => item._id === patientId,
      );
      const nextLikes = patientAfter?.memberLikes ?? prevLikes;
      setLikedPatientIds((prev) => ({ ...prev, [patientId]: nextLikes >= prevLikes }));
      await sweetTopSmallSuccessAlert("Success", 800);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const followPatientHandler = async (patientId: string) => {
    try {
      if (!user?._id) throw new Error("Please login first");
      if (followedPatientIds.has(patientId)) {
        await unsubscribeMember({ variables: { input: patientId } });
      } else {
        await subscribeMember({ variables: { input: patientId } });
      }
      await Promise.all([
        getPatientsRefetch(),
        getFollowingsRefetch({ input: followingsInput }),
      ]);
      await sweetTopSmallSuccessAlert("Success", 800);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  return (
    <Box className="admin-section">
      <Typography variant="h4" className="admin-section__title" gutterBottom>
        Patients
      </Typography>
      <Typography variant="body2" className="admin-section__subtitle">
        Manage patient account statuses.
      </Typography>

      {getPatientsLoading && (
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

      {!getPatientsLoading && getPatientsError && (
        <Typography>Failed to load patients.</Typography>
      )}

      {mutationLoading && !getPatientsLoading && (
        <Stack
          sx={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            py: 2,
          }}
        >
          <CircularProgress size={"1.8rem"} />
        </Stack>
      )}

      {!getPatientsLoading && !getPatientsError && (
        <Stack className="admin-list" spacing={1.5}>
          {patients.map((patient) => (
            <Box className="admin-list__row" key={patient._id}>
              <Box className="admin-list__col admin-list__col--main">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    src={toAbsoluteMediaUrl(patient.memberImage) || "/img/defaultUser.svg"}
                    sx={{ width: 44, height: 44 }}
                  />
                  <Stack spacing={0.3}>
                    <Typography className="admin-list__name">{patient.memberNick}</Typography>
                    <Typography className="admin-list__meta">{patient.memberPhone}</Typography>
                    <Typography className="admin-list__meta">
                      Followers: {realFollowStats[patient._id]?.followers ?? patient.memberFollowers ?? 0} | Followings:{" "}
                      {realFollowStats[patient._id]?.followings ?? patient.memberFollowings ?? 0} | Likes:{" "}
                      {patient.memberLikes ?? 0}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              <FormControl size="small" className="admin-list__status">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={patient.memberStatus || MemberStatus.ACTIVE}
                  onChange={(event) =>
                    onChangeStatus(patient._id, event.target.value as MemberStatus)
                  }
                >
                  <MenuItem value={MemberStatus.ACTIVE}>ACTIVE</MenuItem>
                  <MenuItem value={MemberStatus.BLOCK}>BLOCK</MenuItem>
                  <MenuItem value={MemberStatus.DELETE}>DELETE</MenuItem>
                </Select>
              </FormControl>

              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={() => likePatientHandler(patient._id)}
                  sx={{ color: likedPatientIds[patient._id] ? "#ef4444" : "#94a3b8" }}
                >
                  {likedPatientIds[patient._id] ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <Button
                  size="small"
                  variant={followedPatientIds.has(patient._id) ? "outlined" : "contained"}
                  color={followedPatientIds.has(patient._id) ? "error" : "primary"}
                  onClick={() => followPatientHandler(patient._id)}
                >
                  {followedPatientIds.has(patient._id) ? "Unfollow" : "Follow"}
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default withLayoutAdmin(AdminPatientsPage);
