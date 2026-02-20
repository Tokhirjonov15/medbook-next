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
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import withLayoutAdmin from "@/libs/components/layout/LayoutAdmin";
import { GET_ALL_DOCTORS_BY_ADMIN } from "@/apollo/admin/query";
import { UPDATE_DOCTORS_BY_ADMIN } from "@/apollo/admin/mutation";
import { GET_MEMBER_FOLLOWINGS } from "@/apollo/user/query";
import {
  LIKE_TARGET_DOCTOR,
  SUBSCRIBE_DOCTOR,
  UNSUBSCRIBE_DOCTOR,
} from "@/apollo/user/mutation";
import { Doctors } from "@/libs/types/doctors/doctor";
import { DoctorUpdate } from "@/libs/types/doctors/doctor.update";
import { DoctorsInquiry } from "@/libs/types/members/member.input";
import { FollowInquiry } from "@/libs/types/follow/follow.input";
import { Followings } from "@/libs/types/follow/follow";
import { MemberStatus } from "@/libs/enums/member.enum";
import { userVar } from "@/apollo/store";
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from "@/libs/sweetAlert";
import { Direction } from "@/libs/enums/common.enum";

interface GetAllDoctorsByAdminResponse {
  getAllDoctorsByAdmin: Doctors;
}

interface GetAllDoctorsByAdminVariables {
  input: DoctorsInquiry;
}
interface GetMemberFollowingsResponse {
  getMemberFollowings: Followings;
}
interface GetMemberFollowingsVariables {
  input: FollowInquiry;
}
interface UpdateDoctorByAdminResponse {
  updateDoctorByAdmin: {
    _id: string;
    memberStatus: MemberStatus;
  };
}
interface UpdateDoctorByAdminVariables {
  input: DoctorUpdate;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:3004";
const ADMIN_LIKED_DOCTORS_KEY = "admin-liked-doctors";

const toAbsoluteMediaUrl = (value?: string): string => {
  const src = String(value || "").trim();
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/img/")) return src;
  if (src.startsWith("/uploads/")) return `${API_BASE_URL}${src}`;
  if (src.startsWith("uploads/")) return `${API_BASE_URL}/${src}`;
  return src;
};

const formatSpecialization = (value?: string | string[]) => {
  const list = Array.isArray(value) ? value : value ? [value] : [];
  if (!list.length) return "Not specified";
  return list.map((item) => String(item).replaceAll("_", " ")).join(", ");
};

const AdminHome: NextPage = () => {
  const user = useReactiveVar(userVar);
  const [likedDoctorIds, setLikedDoctorIds] = React.useState<Record<string, boolean>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = window.localStorage.getItem(ADMIN_LIKED_DOCTORS_KEY);
      if (!raw) return {};
      const parsed = JSON.parse(raw);
      return parsed && typeof parsed === "object" ? (parsed as Record<string, boolean>) : {};
    } catch {
      return {};
    }
  });
  const {
    loading: getDoctorsLoading,
    data: getDoctorsData,
    error: getDoctorsError,
    refetch: getDoctorsRefetch,
  } = useQuery<GetAllDoctorsByAdminResponse, GetAllDoctorsByAdminVariables>(
    GET_ALL_DOCTORS_BY_ADMIN,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        input: {
          page: 1,
          limit: 100,
          sort: "createdAt",
          direction: Direction.DESC,
          search: {},
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
  const [updateDoctorByAdmin, { loading: updateDoctorByAdminLoading }] =
    useMutation<UpdateDoctorByAdminResponse, UpdateDoctorByAdminVariables>(
      UPDATE_DOCTORS_BY_ADMIN,
    );
  const [likeTargetDoctor, { loading: likeTargetDoctorLoading }] =
    useMutation(LIKE_TARGET_DOCTOR);
  const [subscribeDoctor, { loading: subscribeDoctorLoading }] =
    useMutation(SUBSCRIBE_DOCTOR);
  const [unsubscribeDoctor, { loading: unsubscribeDoctorLoading }] =
    useMutation(UNSUBSCRIBE_DOCTOR);

  const doctors = getDoctorsData?.getAllDoctorsByAdmin?.list ?? [];
  const followedDoctorIds = React.useMemo(() => {
    const set = new Set<string>();
    (getFollowingsData?.getMemberFollowings?.list ?? []).forEach((item) => {
      if (item.followingId) set.add(item.followingId);
    });
    return set;
  }, [getFollowingsData]);
  const mutationLoading =
    updateDoctorByAdminLoading ||
    likeTargetDoctorLoading ||
    subscribeDoctorLoading ||
    unsubscribeDoctorLoading;

  React.useEffect(() => {
    if (typeof window === "undefined") return;
    try {
      window.localStorage.setItem(ADMIN_LIKED_DOCTORS_KEY, JSON.stringify(likedDoctorIds));
    } catch {
      // ignore localStorage write errors
    }
  }, [likedDoctorIds]);

  const onChangeStatus = async (doctorId: string, next: MemberStatus) => {
    try {
      await updateDoctorByAdmin({
        variables: {
          input: {
            _id: doctorId,
            memberStatus: next,
          },
        },
      });
      await getDoctorsRefetch();
      await sweetTopSmallSuccessAlert("Status updated", 800);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const likeDoctorHandler = async (doctorId: string) => {
    try {
      if (!user?._id) throw new Error("Please login first");
      const doctorBefore = doctors.find((item) => item._id === doctorId);
      const prevLikes = doctorBefore?.memberLikes ?? 0;
      await likeTargetDoctor({ variables: { input: doctorId } });
      const refetchResult = await getDoctorsRefetch();
      const doctorAfter = refetchResult?.data?.getAllDoctorsByAdmin?.list?.find(
        (item: any) => item._id === doctorId,
      );
      const nextLikes = doctorAfter?.memberLikes ?? prevLikes;
      // Toggle-like mutation increases on like, decreases on unlike.
      setLikedDoctorIds((prev) => ({ ...prev, [doctorId]: nextLikes >= prevLikes }));
      await sweetTopSmallSuccessAlert("Success", 800);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const followDoctorHandler = async (doctorId: string) => {
    try {
      if (!user?._id) throw new Error("Please login first");
      if (followedDoctorIds.has(doctorId)) {
        await unsubscribeDoctor({ variables: { input: doctorId } });
      } else {
        await subscribeDoctor({ variables: { input: doctorId } });
      }
      await Promise.all([
        getDoctorsRefetch(),
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
        Doctors
      </Typography>
      <Typography variant="body2" className="admin-section__subtitle">
        Manage doctor status and visibility.
      </Typography>

      {getDoctorsLoading && (
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

      {!getDoctorsLoading && getDoctorsError && (
        <Typography>Failed to load doctors.</Typography>
      )}

      {mutationLoading && !getDoctorsLoading && (
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

      {!getDoctorsLoading && !getDoctorsError && (
        <Stack className="admin-list" spacing={1.5}>
          {doctors.map((doctor) => (
            <Box className="admin-list__row" key={doctor._id}>
              <Box className="admin-list__col admin-list__col--main">
                <Stack direction="row" spacing={1.5} alignItems="center">
                  <Avatar
                    src={toAbsoluteMediaUrl(doctor.memberImage) || "/img/defaultUser.svg"}
                    sx={{ width: 44, height: 44 }}
                  />
                  <Stack spacing={0.3}>
                    <Typography className="admin-list__name">
                      {doctor.memberFullName || doctor.memberNick}
                    </Typography>
                    <Typography className="admin-list__meta">
                      {formatSpecialization(doctor.specialization)}
                    </Typography>
                    <Typography className="admin-list__meta">
                      Followers: {doctor.memberFollowers ?? 0} | Followings: {doctor.memberFollowings ?? 0} | Likes:{" "}
                      {doctor.memberLikes ?? 0}
                    </Typography>
                  </Stack>
                </Stack>
              </Box>

              <FormControl size="small" className="admin-list__status">
                <InputLabel>Status</InputLabel>
                <Select
                  label="Status"
                  value={doctor.memberStatus || MemberStatus.ACTIVE}
                  onChange={(event) =>
                    onChangeStatus(doctor._id, event.target.value as MemberStatus)
                  }
                >
                  <MenuItem value={MemberStatus.ACTIVE}>ACTIVE</MenuItem>
                  <MenuItem value={MemberStatus.BLOCK}>BLOCK</MenuItem>
                  <MenuItem value={MemberStatus.DELETE}>DELETE</MenuItem>
                </Select>
              </FormControl>
              <Stack direction="row" spacing={1}>
                <IconButton
                  onClick={() => likeDoctorHandler(doctor._id)}
                  sx={{ color: likedDoctorIds[doctor._id] ? "#ef4444" : "#94a3b8" }}
                >
                  {likedDoctorIds[doctor._id] ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <Button
                  size="small"
                  variant={followedDoctorIds.has(doctor._id) ? "outlined" : "contained"}
                  color={followedDoctorIds.has(doctor._id) ? "error" : "primary"}
                  onClick={() => followDoctorHandler(doctor._id)}
                >
                  {followedDoctorIds.has(doctor._id) ? "Unfollow" : "Follow"}
                </Button>
              </Stack>
            </Box>
          ))}
        </Stack>
      )}
    </Box>
  );
};

export default withLayoutAdmin(AdminHome);
