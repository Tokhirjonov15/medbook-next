import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Box, Button, CircularProgress, Stack, TextField, Typography } from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import axios from "axios";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import withLayoutMain from "@/libs/components/layout/LayoutMember";
import { userVar } from "@/apollo/store";
import { getJwtToken, updateStorage, updateUserInfo } from "@/libs/auth";
import {
  GET_BOARD_ARTICLES,
  GET_MEMBER,
  GET_MEMBER_APPOINTMENTS,
  GET_MEMBER_FOLLOWERS,
  GET_MEMBER_FOLLOWINGS,
  GET_VISITED_DOCTORS,
} from "@/apollo/user/query";
import {
  SUBSCRIBE_DOCTOR,
  SUBSCRIBE_MEMBER,
  UNSUBSCRIBE_DOCTOR,
  UNSUBSCRIBE_MEMBER,
  UPDATE_MEMBER,
} from "@/apollo/user/mutation";
import { Member } from "@/libs/types/members/member";
import { FollowInquiry } from "@/libs/types/follow/follow.input";
import { Followers, Followings } from "@/libs/types/follow/follow";
import { BoardArticle, BoardArticles } from "@/libs/types/board-article/board-article";
import { BoardArticlesInquiry } from "@/libs/types/board-article/board-article.input";
import { Appointments, Appointment } from "@/libs/types/appoinment/appoinment";
import { AppointmentsInquiry } from "@/libs/types/appoinment/appoinment.input";
import { Doctors } from "@/libs/types/doctors/doctor";
import { OrdinaryInquiry } from "@/libs/types/doctors/doctor.input";
import { AppointmentStatus } from "@/libs/enums/appoinment.enum";
import { ConsultationType } from "@/libs/enums/consultation.enum";
import { MemberType } from "@/libs/enums/member.enum";
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from "@/libs/sweetAlert";

type MyPageCategory =
  | "personalInformation"
  | "myAppointments"
  | "followers"
  | "followings"
  | "myArticles"
  | "recentlyVisitedDoctor";

type AppointmentMode = "Video" | "In-Person";

type PersonalInfo = {
  image: string;
  username: string;
  phone: string;
};

type FollowListItem = {
  id: string;
  name: string;
  image: string;
  memberType?: MemberType;
  followedByMe: boolean;
};

interface GetMemberResponse {
  getMember: Member;
}

interface GetMemberVariables {
  input: string;
}

interface GetFollowersResponse {
  getMemberFollowers: Followers;
}

interface GetFollowingsResponse {
  getMemberFollowings: Followings;
}

interface GetFollowVariables {
  input: FollowInquiry;
}

interface GetBoardArticlesResponse {
  getBoardArticles: BoardArticles;
}

interface GetBoardArticlesVariables {
  input: BoardArticlesInquiry;
}

interface GetAppointmentsResponse {
  getMyAppointments: Appointments;
}

interface GetAppointmentsVariables {
  input: AppointmentsInquiry;
}

interface GetVisitedDoctorsResponse {
  getVisitedDoctors: Doctors;
}

interface GetVisitedDoctorsVariables {
  input: OrdinaryInquiry;
}

interface UpdateMemberResponse {
  updateMember: Member;
}

interface UpdateMemberVariables {
  input: {
    _id: string;
    memberNick?: string;
    memberPhone?: string;
    memberImage?: string;
  };
}

const categoryFromQuery = (value: string | string[] | undefined): MyPageCategory => {
  const one = Array.isArray(value) ? value[0] : value;
  if (
    one === "myAppointments" ||
    one === "followers" ||
    one === "followings" ||
    one === "myArticles" ||
    one === "recentlyVisitedDoctor"
  ) {
    return one;
  }
  return "personalInformation";
};

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:3004";

const toAbsoluteMediaUrl = (value?: string): string => {
  const src = String(value || "").trim();
  if (!src) return "";
  if (src.startsWith("blob:")) return src;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/img/")) return src;
  if (src.startsWith("/uploads/")) return `${API_BASE_URL}${src}`;
  if (src.startsWith("uploads/")) return `${API_BASE_URL}/${src}`;
  return src;
};

const toAppointmentMode = (type?: ConsultationType): AppointmentMode => {
  if (type === ConsultationType.VIDEO) return "Video";
  return "In-Person";
};

const isFollowedByMe = (value: any): boolean => {
  if (!value) return false;
  if (Array.isArray(value)) return value.some((item) => Boolean(item?.myFollowing));
  return Boolean(value?.myFollowing);
};

const MyPage: NextPage = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const [category, setCategory] = useState<MyPageCategory>("personalInformation");
  const [appointmentTab, setAppointmentTab] = useState<"upcoming" | "past" | "cancelled">("upcoming");

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>({
    image: "/img/defaultUser.svg",
    username: "",
    phone: "",
  });
  const [initialPersonalInfo, setInitialPersonalInfo] = useState<PersonalInfo>({
    image: "/img/defaultUser.svg",
    username: "",
    phone: "",
  });

  const [selectedFileName, setSelectedFileName] = useState("");
  const [uploadedMemberImagePath, setUploadedMemberImagePath] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);

  useEffect(() => {
    const token = getJwtToken();
    if (!user?._id && token) {
      updateUserInfo(token);
      return;
    }
    if (!token) {
      router.replace("/auth/login");
    }
  }, [router, user]);

  useEffect(() => {
    if (!router.isReady) return;
    setCategory(categoryFromQuery(router.query.category));
  }, [router.isReady, router.query.category]);

  const memberId = user?._id || "";

  const {
    loading: getMemberLoading,
    data: getMemberData,
    refetch: getMemberRefetch,
  } = useQuery<GetMemberResponse, GetMemberVariables>(GET_MEMBER, {
    fetchPolicy: "cache-and-network",
    variables: { input: memberId },
    notifyOnNetworkStatusChange: true,
    skip: !memberId,
  });

  const followersInput = useMemo<FollowInquiry>(
    () => ({ page: 1, limit: 1000, search: { followingId: memberId } }),
    [memberId],
  );

  const followingsInput = useMemo<FollowInquiry>(
    () => ({ page: 1, limit: 1000, search: { followerId: memberId } }),
    [memberId],
  );

  const {
    loading: getFollowersLoading,
    data: getFollowersData,
    refetch: getFollowersRefetch,
  } = useQuery<GetFollowersResponse, GetFollowVariables>(GET_MEMBER_FOLLOWERS, {
    fetchPolicy: "cache-and-network",
    variables: { input: followersInput },
    notifyOnNetworkStatusChange: true,
    skip: !memberId,
  });

  const {
    loading: getFollowingsLoading,
    data: getFollowingsData,
    refetch: getFollowingsRefetch,
  } = useQuery<GetFollowingsResponse, GetFollowVariables>(GET_MEMBER_FOLLOWINGS, {
    fetchPolicy: "cache-and-network",
    variables: { input: followingsInput },
    notifyOnNetworkStatusChange: true,
    skip: !memberId,
  });

  const myArticlesInput = useMemo<BoardArticlesInquiry>(
    () => ({
      page: 1,
      limit: 200,
      sort: "createdAt",
      direction: "DESC" as BoardArticlesInquiry["direction"],
      search: {},
    }),
    [],
  );

  const {
    loading: getArticlesLoading,
    data: getArticlesData,
    refetch: getArticlesRefetch,
  } = useQuery<GetBoardArticlesResponse, GetBoardArticlesVariables>(GET_BOARD_ARTICLES, {
    fetchPolicy: "cache-and-network",
    variables: { input: myArticlesInput },
    notifyOnNetworkStatusChange: true,
    skip: !memberId,
  });

  const appointmentsInput = useMemo<AppointmentsInquiry>(
    () => ({
      page: 1,
      limit: 100,
      sort: "appointmentDate",
      direction: "DESC" as AppointmentsInquiry["direction"],
      search: {},
    }),
    [],
  );

  const {
    loading: getAppointmentsLoading,
    data: getAppointmentsData,
    refetch: getAppointmentsRefetch,
  } = useQuery<GetAppointmentsResponse, GetAppointmentsVariables>(GET_MEMBER_APPOINTMENTS, {
    fetchPolicy: "cache-and-network",
    variables: { input: appointmentsInput },
    notifyOnNetworkStatusChange: true,
    skip: !memberId,
  });

  const visitedDoctorsInput = useMemo<OrdinaryInquiry>(
    () => ({ page: 1, limit: 20 }),
    [],
  );

  const {
    loading: getVisitedDoctorsLoading,
    data: getVisitedDoctorsData,
    refetch: getVisitedDoctorsRefetch,
  } = useQuery<GetVisitedDoctorsResponse, GetVisitedDoctorsVariables>(GET_VISITED_DOCTORS, {
    fetchPolicy: "cache-and-network",
    variables: { input: visitedDoctorsInput },
    notifyOnNetworkStatusChange: true,
    skip: !memberId,
  });

  const [updateMember, { loading: updateMemberLoading }] = useMutation<UpdateMemberResponse, UpdateMemberVariables>(UPDATE_MEMBER);
  const [subscribeMember, { loading: subscribeMemberLoading }] = useMutation(SUBSCRIBE_MEMBER);
  const [unsubscribeMember, { loading: unsubscribeMemberLoading }] = useMutation(UNSUBSCRIBE_MEMBER);
  const [subscribeDoctor, { loading: subscribeDoctorLoading }] = useMutation(SUBSCRIBE_DOCTOR);
  const [unsubscribeDoctor, { loading: unsubscribeDoctorLoading }] = useMutation(UNSUBSCRIBE_DOCTOR);

  const member = getMemberData?.getMember;

  useEffect(() => {
    if (!member) return;
    const nextInfo: PersonalInfo = {
      image: toAbsoluteMediaUrl(member.memberImage) || "/img/defaultUser.svg",
      username: member.memberNick || "",
      phone: member.memberPhone || "",
    };
    setPersonalInfo(nextInfo);
    setInitialPersonalInfo(nextInfo);
    setUploadedMemberImagePath("");
  }, [member]);

  const followers = useMemo<FollowListItem[]>(
    () =>
      (getFollowersData?.getMemberFollowers?.list ?? []).map((row) => ({
        id: row.followerData?._id || row._id,
        name: row.followerData?.memberNick || "Unknown",
        image: toAbsoluteMediaUrl(row.followerData?.memberImage) || "/img/defaultUser.svg",
        memberType: row.followerData?.memberType as MemberType | undefined,
        followedByMe: isFollowedByMe(row.meFollowed),
      })),
    [getFollowersData],
  );

  const followings = useMemo<FollowListItem[]>(
    () =>
      (getFollowingsData?.getMemberFollowings?.list ?? []).map((row) => ({
        id: row.followingData?._id || row._id,
        name: row.followingData?.memberNick || "Unknown",
        image: toAbsoluteMediaUrl(row.followingData?.memberImage) || "/img/defaultUser.svg",
        memberType: row.followingData?.memberType as MemberType | undefined,
        followedByMe: isFollowedByMe(row.meFollowed) || true,
      })),
    [getFollowingsData],
  );

  const followersCount =
    getFollowersData?.getMemberFollowers?.metaCounter?.[0]?.total ?? followers.length;
  const followingsCount =
    getFollowingsData?.getMemberFollowings?.metaCounter?.[0]?.total ?? followings.length;

  const myArticles = useMemo(
    () =>
      (getArticlesData?.getBoardArticles?.list ?? [])
        .filter((article: BoardArticle) => article.memberId === memberId)
        .map((article) => ({ id: article._id, title: article.articleTitle })),
    [getArticlesData, memberId],
  );
  const myArticlesCount = myArticles.length;

  const visitedDoctorNameMap = useMemo(() => {
    const map: Record<string, string> = {};
    (getVisitedDoctorsData?.getVisitedDoctors?.list ?? []).forEach((doctor) => {
      if (!doctor?._id) return;
      map[doctor._id] = doctor.memberFullName || doctor.memberNick || "";
    });
    return map;
  }, [getVisitedDoctorsData]);

  const appointments = useMemo(
    () =>
      (getAppointmentsData?.getMyAppointments?.list ?? []).map((appointment: Appointment) => ({
        id: appointment._id,
        doctorName:
          appointment.doctorData?.memberFullName?.trim() ||
          appointment.doctorData?.memberNick?.trim() ||
          visitedDoctorNameMap[appointment.doctor] ||
          "Unknown Doctor",
        specialization: appointment.doctorData?.specialization || "General",
        status: appointment.status,
        mode: toAppointmentMode(appointment.consultationType),
        startsAt: appointment.appointmentDate,
        slotStart: appointment.timeSlot?.start || "",
      })),
    [getAppointmentsData, visitedDoctorNameMap],
  );

  const recentlyVisitedDoctors = useMemo(
    () =>
      (getVisitedDoctorsData?.getVisitedDoctors?.list ?? []).map((doctor) => ({
        id: doctor._id,
        name: doctor.memberFullName || doctor.memberNick,
        specialization: doctor.specialization || "General",
        image: toAbsoluteMediaUrl(doctor.memberImage) || "/img/defaultUser.svg",
      })),
    [getVisitedDoctorsData],
  );

  const hasPersonalChanges = useMemo(() => {
    return (
      personalInfo.username.trim() !== initialPersonalInfo.username ||
      personalInfo.phone.trim() !== initialPersonalInfo.phone ||
      Boolean(uploadedMemberImagePath)
    );
  }, [initialPersonalInfo.phone, initialPersonalInfo.username, personalInfo.phone, personalInfo.username, uploadedMemberImagePath]);

  const filteredAppointments = useMemo(() => {
    const now = new Date();
    return appointments.filter((appointment) => {
      if (appointmentTab === "cancelled") {
        return appointment.status === AppointmentStatus.CANCELLED;
      }
      if (appointment.status === AppointmentStatus.CANCELLED) {
        return false;
      }
      const appointmentDate = new Date(appointment.startsAt);
      if (appointmentTab === "upcoming") {
        return appointmentDate.getTime() >= now.getTime();
      }
      return appointmentDate.getTime() < now.getTime();
    });
  }, [appointmentTab, appointments]);

  const updateCategory = (next: MyPageCategory) => {
    setCategory(next);
    if (next === "personalInformation") {
      router.push("/mypage", undefined, { shallow: true });
      return;
    }
    router.push(`/mypage?category=${next}`, undefined, { shallow: true });
  };

  const uploadMemberImage = async (file: File): Promise<string> => {
    const token = getJwtToken();
    const graphqlUrl =
      process.env.NEXT_PUBLIC_API_GRAPHQL_URL ||
      process.env.REACT_APP_API_GRAPHQL_URL ||
      "http://localhost:3004/graphql";

    const formData = new FormData();
    formData.append(
      "operations",
      JSON.stringify({
        query: `mutation ImageUploader($file: Upload!, $target: String!) {
          imageUploader(file: $file, target: $target)
        }`,
        variables: {
          file: null,
          target: "member",
        },
      }),
    );
    formData.append("map", JSON.stringify({ "0": ["variables.file"] }));
    formData.append("0", file, file.name);

    const response = await axios.post(graphqlUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "apollo-require-preflight": "true",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    const uploaded = response?.data?.data?.imageUploader;
    if (!uploaded) throw new Error("Image upload failed");
    return String(uploaded);
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const localUrl = URL.createObjectURL(file);
    setPersonalInfo((prev) => ({ ...prev, image: localUrl }));

    try {
      setUploadingImage(true);
      const uploadedPath = await uploadMemberImage(file);
      setUploadedMemberImagePath(uploadedPath);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    } finally {
      setUploadingImage(false);
    }
  };

  const handleSaveChanges = async () => {
    try {
      if (!memberId) return;
      const result = await updateMember({
        variables: {
          input: {
            _id: memberId,
            memberNick: personalInfo.username.trim(),
            memberPhone: personalInfo.phone.trim(),
            memberImage: uploadedMemberImagePath || undefined,
          },
        },
      });

      const accessToken = result?.data?.updateMember?.accessToken;
      if (accessToken) {
        updateStorage({ jwtToken: accessToken });
        updateUserInfo(accessToken);
      }

      await Promise.all([
        getMemberRefetch({ input: memberId }),
        getFollowersRefetch({ input: followersInput }),
        getFollowingsRefetch({ input: followingsInput }),
        getArticlesRefetch({ input: myArticlesInput }),
        getAppointmentsRefetch({ input: appointmentsInput }),
        getVisitedDoctorsRefetch({ input: visitedDoctorsInput }),
      ]);
      await sweetTopSmallSuccessAlert("Profile updated", 900);
      setSelectedFileName("");
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const handleFollowToggle = async (
    targetId: string,
    targetType: MemberType | undefined,
    currentlyFollowing: boolean,
  ) => {
    try {
      if (!targetId) return;
      if (!memberId) return;

      if (currentlyFollowing) {
        if (targetType === MemberType.DOCTOR) {
          await unsubscribeDoctor({ variables: { input: targetId } });
        } else {
          await unsubscribeMember({ variables: { input: targetId } });
        }
      } else {
        if (targetType === MemberType.DOCTOR) {
          await subscribeDoctor({ variables: { input: targetId } });
        } else {
          await subscribeMember({ variables: { input: targetId } });
        }
      }

      await Promise.all([
        getFollowersRefetch({ input: followersInput }),
        getFollowingsRefetch({ input: followingsInput }),
        getMemberRefetch({ input: memberId }),
      ]);
      await sweetTopSmallSuccessAlert("Success!", 800);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const followMutationLoading =
    subscribeMemberLoading ||
    unsubscribeMemberLoading ||
    subscribeDoctorLoading ||
    unsubscribeDoctorLoading;

  if (!memberId || getMemberLoading) {
    return (
      <Stack sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", minHeight: "70vh" }}>
        <CircularProgress size={"3rem"} />
      </Stack>
    );
  }

  return (
    <div id="mypage-page">
      <Stack className="mypage-container" sx={{ position: "relative" }}>
        {(updateMemberLoading || uploadingImage || followMutationLoading) && (
          <Stack
            sx={{
              position: "absolute",
              inset: 0,
              zIndex: 20,
              background: "rgba(255,255,255,0.55)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
            }}
          >
            <CircularProgress size={"3rem"} />
          </Stack>
        )}

        <Box className="mypage-header">
          <Typography className="mypage-title">My Page</Typography>
          <Typography className="mypage-subtitle">
            Manage your personal profile and activity.
          </Typography>
        </Box>

        <Stack direction="row" className="mypage-tabs">
          <button
            className={`mypage-tab ${category === "personalInformation" ? "active" : ""}`}
            onClick={() => updateCategory("personalInformation")}
          >
            Personal Information
          </button>
          <button
            className={`mypage-tab ${category === "followers" ? "active" : ""}`}
            onClick={() => updateCategory("followers")}
          >
            Followers ({followersCount})
          </button>
          <button
            className={`mypage-tab ${category === "followings" ? "active" : ""}`}
            onClick={() => updateCategory("followings")}
          >
            Followings ({followingsCount})
          </button>
          <button
            className={`mypage-tab ${category === "myArticles" ? "active" : ""}`}
            onClick={() => updateCategory("myArticles")}
          >
            My Articles ({myArticlesCount})
          </button>
          <button
            className={`mypage-tab ${category === "myAppointments" ? "active" : ""}`}
            onClick={() => updateCategory("myAppointments")}
          >
            My Appointments
          </button>
          <button
            className={`mypage-tab ${category === "recentlyVisitedDoctor" ? "active" : ""}`}
            onClick={() => updateCategory("recentlyVisitedDoctor")}
          >
            Recently Visited Doctor
          </button>
        </Stack>

        <Box className="mypage-panel">
          {category === "personalInformation" && (
            <Box className="mypage-section">
              <Typography className="mypage-section-title">Personal Information</Typography>

              <Stack direction="row" spacing={2.5} className="mypage-avatar-row">
                <Avatar src={personalInfo.image} className="mypage-avatar" />
                <Box className="mypage-upload-box">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="mypage-file-input"
                    onChange={handleImageUpload}
                  />
                  <Button
                    variant="outlined"
                    className="mypage-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Image
                  </Button>
                  <Typography className="mypage-upload-hint">
                    {selectedFileName || "No file selected"}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={2} className="mypage-form">
                <TextField
                  fullWidth
                  label="Username"
                  value={personalInfo.username}
                  onChange={(event) =>
                    setPersonalInfo((prev) => ({ ...prev, username: event.target.value }))
                  }
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={personalInfo.phone}
                  onChange={(event) =>
                    setPersonalInfo((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </Stack>

              <Box className="mypage-actions">
                <Button
                  variant="contained"
                  className={`mypage-save-btn ${hasPersonalChanges ? "active" : ""}`}
                  disabled={!hasPersonalChanges || updateMemberLoading}
                  onClick={handleSaveChanges}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          )}

          {category === "followers" && (
            <Box className="mypage-section">
              <Typography className="mypage-section-title">
                Followers ({followersCount})
              </Typography>
              {getFollowersLoading ? (
                <Stack sx={{ py: 2, alignItems: "center" }}>
                  <CircularProgress size={"2rem"} />
                </Stack>
              ) : (
                <Stack spacing={1.2}>
                  {followers.length === 0 ? (
                    <Typography className="mypage-list-subtitle">No followers yet.</Typography>
                  ) : (
                    followers.map((item) => (
                      <Box key={item.id} className="mypage-list-item">
                        <Avatar src={item.image} />
                        <Typography>{item.name}</Typography>
                        <Button
                          variant={item.followedByMe ? "outlined" : "contained"}
                          size="small"
                          onClick={() =>
                            handleFollowToggle(item.id, item.memberType, item.followedByMe)
                          }
                          sx={{ marginLeft: "auto", minWidth: "92px" }}
                        >
                          {item.followedByMe ? "Following" : "Follow"}
                        </Button>
                      </Box>
                    ))
                  )}
                </Stack>
              )}
            </Box>
          )}

          {category === "followings" && (
            <Box className="mypage-section">
              <Typography className="mypage-section-title">
                Followings ({followingsCount})
              </Typography>
              {getFollowingsLoading ? (
                <Stack sx={{ py: 2, alignItems: "center" }}>
                  <CircularProgress size={"2rem"} />
                </Stack>
              ) : (
                <Stack spacing={1.2}>
                  {followings.length === 0 ? (
                    <Typography className="mypage-list-subtitle">No followings yet.</Typography>
                  ) : (
                    followings.map((item) => (
                      <Box key={item.id} className="mypage-list-item">
                        <Avatar src={item.image} />
                        <Typography>{item.name}</Typography>
                        <Button
                          variant="outlined"
                          color="error"
                          size="small"
                          onClick={() =>
                            handleFollowToggle(item.id, item.memberType, true)
                          }
                          sx={{ marginLeft: "auto", minWidth: "92px" }}
                        >
                          Unfollow
                        </Button>
                      </Box>
                    ))
                  )}
                </Stack>
              )}
            </Box>
          )}

          {category === "myArticles" && (
            <Box className="mypage-section">
              <Typography className="mypage-section-title">My Articles</Typography>
              {getArticlesLoading ? (
                <Stack sx={{ py: 2, alignItems: "center" }}>
                  <CircularProgress size={"2rem"} />
                </Stack>
              ) : (
                <Stack spacing={1.2}>
                  {myArticles.length === 0 ? (
                    <Typography className="mypage-list-subtitle">No articles yet.</Typography>
                  ) : (
                    myArticles.map((article) => (
                      <Box
                        key={article.id}
                        className="mypage-list-item clickable"
                        onClick={() => router.push(`/community/detail?id=${article.id}`)}
                      >
                        <Typography>{article.title}</Typography>
                      </Box>
                    ))
                  )}
                </Stack>
              )}
            </Box>
          )}

          {category === "myAppointments" && (
            <Box className="mypage-section">
              <Typography className="mypage-section-title">My Appointments</Typography>
              <Typography className="mypage-list-subtitle">
                Manage your upcoming visits and history.
              </Typography>

              <Stack direction="row" className="mypage-appointments-tabs">
                <button
                  className={`mypage-appointments-tab ${appointmentTab === "upcoming" ? "active" : ""}`}
                  onClick={() => setAppointmentTab("upcoming")}
                >
                  Upcoming
                </button>
                <button
                  className={`mypage-appointments-tab ${appointmentTab === "past" ? "active" : ""}`}
                  onClick={() => setAppointmentTab("past")}
                >
                  Past
                </button>
                <button
                  className={`mypage-appointments-tab ${appointmentTab === "cancelled" ? "active" : ""}`}
                  onClick={() => setAppointmentTab("cancelled")}
                >
                  Cancelled
                </button>
              </Stack>

              {getAppointmentsLoading ? (
                <Stack sx={{ py: 2, alignItems: "center" }}>
                  <CircularProgress size={"2rem"} />
                </Stack>
              ) : filteredAppointments.length === 0 ? (
                <Box className="mypage-empty-appointments">
                  <Typography className="mypage-empty-title">
                    No appointments found
                  </Typography>
                  <Typography className="mypage-empty-subtitle">
                    You don't have any appointments in this category yet.
                  </Typography>
                </Box>
              ) : (
                <Stack spacing={1.2} className="mypage-appointments-list">
                  {filteredAppointments.map((appointment) => (
                    <Box
                      key={appointment.id}
                      className="mypage-appointment-card"
                    >
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                        <Box>
                          <Typography className="mypage-appointment-doctor">
                            {appointment.doctorName}
                          </Typography>
                          <Typography className="mypage-list-subtitle">
                            {appointment.specialization}
                          </Typography>
                        </Box>
                        <span
                          className={`mypage-appointment-mode ${appointment.mode === "Video" ? "video" : "inperson"}`}
                        >
                          {appointment.mode}
                        </span>
                      </Stack>

                      <Typography className="mypage-appointment-date">
                        {new Date(appointment.startsAt).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "short",
                          day: "numeric",
                        })} {appointment.slotStart || ""}
                      </Typography>

                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <span
                          className={`mypage-appointment-status ${
                            appointment.status === AppointmentStatus.CONFIRMED
                              ? "confirmed"
                              : appointment.status === AppointmentStatus.SCHEDULED || appointment.status === AppointmentStatus.IN_PROGRESS
                                ? "pending"
                                : "cancelled"
                          }`}
                        >
                          {appointment.status}
                        </span>
                        <Button
                          variant="outlined"
                          className="mypage-view-details-btn"
                          onClick={() =>
                            router.push(`/mypage/appointments/detail?id=${appointment.id}`)
                          }
                        >
                          View Details
                        </Button>
                      </Stack>
                    </Box>
                  ))}
                </Stack>
              )}
            </Box>
          )}

          {category === "recentlyVisitedDoctor" && (
            <Box className="mypage-section">
              <Typography className="mypage-section-title">Recently Visited Doctor</Typography>
              {getVisitedDoctorsLoading ? (
                <Stack sx={{ py: 2, alignItems: "center" }}>
                  <CircularProgress size={"2rem"} />
                </Stack>
              ) : (
                <Stack spacing={1.2}>
                  {recentlyVisitedDoctors.length === 0 ? (
                    <Typography className="mypage-list-subtitle">No recent doctor visits yet.</Typography>
                  ) : (
                    recentlyVisitedDoctors.map((doctor) => (
                      <Box
                        key={doctor.id}
                        className="mypage-list-item clickable"
                        onClick={() => router.push(`/doctor/detail?id=${doctor.id}`)}
                      >
                        <Avatar src={doctor.image} />
                        <Box>
                          <Typography>{doctor.name}</Typography>
                          <Typography className="mypage-list-subtitle">
                            {doctor.specialization}
                          </Typography>
                        </Box>
                      </Box>
                    ))
                  )}
                </Stack>
              )}
            </Box>
          )}
        </Box>
      </Stack>
    </div>
  );
};

export default withLayoutMain(MyPage);
