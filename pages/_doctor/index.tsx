import React, { useMemo } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import withLayoutDoctor from "@/libs/components/layout/LayoutDoctor";
import { NextPage } from "next";
import { useQuery, useReactiveVar } from "@apollo/client";
import { doctorVar } from "@/apollo/store";
import {
  GET_COMMENTS,
  GET_DOCTOR,
  GET_DOCTOR_APPOINTMENTS,
} from "@/apollo/doctor/query";
import { Doctor } from "@/libs/types/doctors/doctor";
import { Appointments, Appointment } from "@/libs/types/appoinment/appoinment";
import { AppointmentsInquiry } from "@/libs/types/appoinment/appoinment.input";
import { Comments, Comment } from "@/libs/types/comment/comment";
import { CommentsInquiry } from "@/libs/types/comment/comment.input";
import { AppointmentStatus } from "@/libs/enums/appoinment.enum";
import { CommentGroup } from "@/libs/enums/comment.enum";
import { Direction } from "@/libs/enums/common.enum";

interface GetDoctorResponse {
  getDoctor: Doctor;
}

interface GetDoctorVariables {
  input: string;
}

interface GetDoctorAppointmentsResponse {
  getDoctorAppointments: Appointments;
}

interface GetDoctorAppointmentsVariables {
  input: AppointmentsInquiry;
}

interface GetCommentsResponse {
  getComments: Comments;
}

interface GetCommentsVariables {
  input: CommentsInquiry;
}

const API_ENDPOINT =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.NEXT_PUBLIC_API_GRAPHQL_URL ||
  "http://localhost:3004/graphql";

const API_ROOT = API_ENDPOINT.replace(/\/graphql\/?$/, "");

const resolveMediaUrl = (value?: string) => {
  if (!value) return "/img/defaultUser.svg";
  if (value.startsWith("http://") || value.startsWith("https://")) return value;
  if (value.startsWith("/uploads")) return `${API_ROOT}${value}`;
  if (value.startsWith("uploads/")) return `${API_ROOT}/${value}`;
  return value;
};

const toReadableStatus = (status?: string) =>
  (status || "").replaceAll("_", " ");

const resolveAppointmentStatus = (
  appointment: Appointment,
): AppointmentStatus => {
  const status = appointment.status;
  if (
    status === AppointmentStatus.COMPLETED ||
    status === AppointmentStatus.CANCELLED ||
    status === AppointmentStatus.NO_SHOW
  ) {
    return status;
  }

  const endAt = new Date(appointment.appointmentDate);
  const end = appointment.timeSlot?.end || appointment.timeSlot?.start;

  if (end && /^\d{2}:\d{2}$/.test(end)) {
    const [hours, minutes] = end.split(":").map(Number);
    endAt.setHours(hours, minutes, 0, 0);
  } else {
    endAt.setHours(23, 59, 59, 999);
  }

  if (endAt.getTime() < Date.now()) return AppointmentStatus.COMPLETED;
  return status;
};

const DoctorDashboard: NextPage = () => {
  const router = useRouter();
  const doctor = useReactiveVar(doctorVar);
  const doctorId = doctor?._id || "";
  const doctorName = doctor?.memberFullName || doctor?.memberNick || "Doctor";

  const recentAppointmentsInput = useMemo<AppointmentsInquiry>(
    () => ({
      page: 1,
      limit: 5,
      sort: "appointmentDate",
      direction: Direction.DESC,
      search: { doctorId },
    }),
    [doctorId],
  );

  const statsAppointmentsInput = useMemo<AppointmentsInquiry>(
    () => ({
      page: 1,
      limit: 200,
      sort: "createdAt",
      direction: Direction.DESC,
      search: { doctorId },
    }),
    [doctorId],
  );

  const commentsInput = useMemo<CommentsInquiry>(
    () => ({
      page: 1,
      limit: 3,
      sort: "createdAt",
      direction: Direction.DESC,
      search: { commentRefId: doctorId },
    }),
    [doctorId],
  );

  const {
    loading: getDoctorLoading,
    data: getDoctorData,
    error: getDoctorError,
  } = useQuery<GetDoctorResponse, GetDoctorVariables>(GET_DOCTOR, {
    fetchPolicy: "cache-and-network",
    variables: { input: doctorId },
    notifyOnNetworkStatusChange: true,
    skip: !doctorId,
  });

  const {
    loading: getRecentAppointmentsLoading,
    data: getRecentAppointmentsData,
  } = useQuery<GetDoctorAppointmentsResponse, GetDoctorAppointmentsVariables>(
    GET_DOCTOR_APPOINTMENTS,
    {
      fetchPolicy: "cache-and-network",
      variables: { input: recentAppointmentsInput },
      notifyOnNetworkStatusChange: true,
      skip: !doctorId,
    },
  );

  const {
    loading: getStatsAppointmentsLoading,
    data: getStatsAppointmentsData,
  } = useQuery<GetDoctorAppointmentsResponse, GetDoctorAppointmentsVariables>(
    GET_DOCTOR_APPOINTMENTS,
    {
      fetchPolicy: "cache-and-network",
      variables: { input: statsAppointmentsInput },
      notifyOnNetworkStatusChange: true,
      skip: !doctorId,
    },
  );

  const {
    loading: getReviewsLoading,
    data: getReviewsData,
    error: getReviewsError,
  } = useQuery<GetCommentsResponse, GetCommentsVariables>(GET_COMMENTS, {
    fetchPolicy: "cache-and-network",
    variables: { input: commentsInput },
    notifyOnNetworkStatusChange: true,
    skip: !doctorId,
  });

  const doctorData = getDoctorData?.getDoctor;
  const recentAppointments =
    getRecentAppointmentsData?.getDoctorAppointments?.list ?? [];
  const statAppointments =
    getStatsAppointmentsData?.getDoctorAppointments?.list ?? [];
  const patientReviews = (getReviewsData?.getComments?.list ?? []).filter(
    (review: Comment) =>
      review.commentGroup === CommentGroup.DOCTOR && !review.parentCommentId,
  );

  const todaysAppointments = useMemo(() => {
    const today = new Date();
    return statAppointments.filter((appointment: Appointment) => {
      const date = new Date(appointment.appointmentDate);
      return (
        date.getFullYear() === today.getFullYear() &&
        date.getMonth() === today.getMonth() &&
        date.getDate() === today.getDate()
      );
    }).length;
  }, [statAppointments]);

  const pendingAppointments = useMemo(
    () =>
      statAppointments.filter((appointment: Appointment) =>
        [AppointmentStatus.SCHEDULED, AppointmentStatus.CONFIRMED].includes(
          resolveAppointmentStatus(appointment),
        ),
      ).length,
    [statAppointments],
  );

  const totalPatients = useMemo(() => {
    const ids = new Set(
      statAppointments
        .map(
          (appointment: Appointment) =>
            appointment.patientData?._id || appointment.patient,
        )
        .filter(Boolean),
    );
    return ids.size;
  }, [statAppointments]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case AppointmentStatus.COMPLETED:
        return "success";
      case AppointmentStatus.SCHEDULED:
      case AppointmentStatus.CONFIRMED:
        return "warning";
      case AppointmentStatus.IN_PROGRESS:
        return "info";
      case AppointmentStatus.CANCELLED:
      case AppointmentStatus.NO_SHOW:
        return "error";
      default:
        return "default";
    }
  };

  if (!doctorId) {
    return (
      <Stack
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          minHeight: "70vh",
        }}
      >
        <CircularProgress size={"3rem"} />
      </Stack>
    );
  }

  if (
    getDoctorLoading ||
    getRecentAppointmentsLoading ||
    getStatsAppointmentsLoading
  ) {
    return (
      <Stack
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          minHeight: "70vh",
        }}
      >
        <CircularProgress size={"3rem"} />
      </Stack>
    );
  }

  if (getDoctorError || !doctorData) {
    return (
      <Stack
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          minHeight: "70vh",
        }}
      >
        <Typography>Failed to load dashboard data.</Typography>
      </Stack>
    );
  }

  return (
    <Box className="doctor-dashboard">
      {/* Header */}
      <Stack
        direction="row"
        justifyContent="space-between"
        alignItems="center"
        mb={3}
      >
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            Doctor Dashboard
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Welcome back, {doctorName}. Here is your daily overview.
          </Typography>
        </Box>
      </Stack>

      {/* Stats Cards */}
      <Stack direction="row" spacing={2} mb={3}>
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                >
                  Total Patients
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {totalPatients.toLocaleString()}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
                  <PeopleIcon sx={{ fontSize: 16, color: "#64748b" }} />
                  <Typography variant="caption" color="text.secondary">
                    from appointments data
                  </Typography>
                </Stack>
              </Box>
              <Box
                sx={{
                  backgroundColor: "#dbeafe",
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <PeopleIcon sx={{ color: "#3b82f6" }} />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                >
                  Today's Appointments
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {todaysAppointments}
                </Typography>
                <Typography variant="caption" color="text.secondary" mt={1}>
                  {pendingAppointments} pending
                </Typography>
              </Box>
              <Box
                sx={{
                  backgroundColor: "#dbeafe",
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <CalendarMonthIcon />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                >
                  My Followers
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {doctorData.memberFollowers || 0}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
                  <Typography variant="caption" color="text.secondary">
                    doctor profile stats
                  </Typography>
                </Stack>
              </Box>
              <Box
                sx={{
                  backgroundColor: "#fef3e7",
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <PersonAddIcon sx={{ color: "#f59e0b" }} />
              </Box>
            </Stack>
          </CardContent>
        </Card>

        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="flex-start"
            >
              <Box>
                <Typography
                  variant="caption"
                  color="text.secondary"
                  gutterBottom
                >
                  My Followings
                </Typography>
                <Typography variant="h4" fontWeight={700}>
                  {doctorData.memberFollowings || 0}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
                  <Typography variant="caption" color="text.secondary">
                    doctor profile stats
                  </Typography>
                </Stack>
              </Box>
              <Box
                sx={{
                  backgroundColor: "#f3e8ff",
                  borderRadius: 2,
                  p: 1.5,
                }}
              >
                <PersonAddIcon sx={{ color: "#a855f7" }} />
              </Box>
            </Stack>
          </CardContent>
        </Card>
      </Stack>

      {/* Recent Appointments & Reviews */}
      <Stack direction="row" spacing={2}>
        {/* Recent Appointments */}
        <Card sx={{ flex: 2 }}>
          <CardContent>
            <Stack
              direction="row"
              justifyContent="space-between"
              alignItems="center"
              mb={2}
            >
              <Typography variant="h6" fontWeight={700}>
                Recent Appointments
              </Typography>
              <Button
                size="small"
                sx={{ textTransform: "none", color: "#4361ee" }}
                onClick={() => router.push("/_doctor/appointments")}
              >
                View All
              </Button>
            </Stack>

            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>PATIENT</TableCell>
                    <TableCell>DATE & TIME</TableCell>
                    <TableCell>TYPE</TableCell>
                    <TableCell>STATUS</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {recentAppointments.map((appointment: Appointment) => {
                    const effectiveStatus =
                      resolveAppointmentStatus(appointment);
                    const patientId =
                      appointment.patientData?._id || appointment.patient || "";
                    return (
                      <TableRow key={appointment._id} hover>
                        <TableCell>
                          <Stack
                            direction="row"
                            alignItems="center"
                            spacing={1.5}
                            sx={{ cursor: patientId ? "pointer" : "default" }}
                            onClick={() =>
                              patientId
                                ? router.push(
                                    `/_doctor/patients/detail?id=${patientId}`,
                                  )
                                : null
                            }
                          >
                            <Avatar
                              src={resolveMediaUrl(
                                appointment.patientData?.memberImage,
                              )}
                            />
                            <Box>
                              <Typography variant="body2" fontWeight={600}>
                                {appointment.patientData?.memberNick ||
                                  "Unknown Patient"}
                              </Typography>
                              <Typography
                                variant="caption"
                                color="text.secondary"
                              >
                                #
                                {appointment.patientData?._id?.slice(-6) ||
                                  "N/A"}
                              </Typography>
                            </Box>
                          </Stack>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {new Date(
                              appointment.appointmentDate,
                            ).toLocaleDateString()}
                          </Typography>
                          <Typography variant="caption" color="text.secondary">
                            {appointment.timeSlot?.start || "-"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2">
                            {toReadableStatus(appointment.consultationType)}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Chip
                            label={toReadableStatus(effectiveStatus)}
                            color={getStatusColor(effectiveStatus)}
                            size="small"
                          />
                        </TableCell>
                      </TableRow>
                    );
                  })}
                  {recentAppointments.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={4}>
                        <Typography variant="body2" color="text.secondary">
                          No appointments yet.
                        </Typography>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Patient Reviews */}
        <Card
          sx={{ flex: 1, cursor: "pointer" }}
          onClick={() =>
            router.push(`/_doctor/detail?id=${doctorId}&tab=reviews`)
          }
        >
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Patient Reviews
            </Typography>

            <Stack spacing={2}>
              {getReviewsLoading && (
                <Stack alignItems="center">
                  <CircularProgress size={"1.5rem"} />
                </Stack>
              )}
              {getReviewsError && (
                <Typography variant="body2" color="text.secondary">
                  Failed to load reviews.
                </Typography>
              )}
              {!getReviewsLoading &&
                !getReviewsError &&
                patientReviews.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    No reviews yet.
                  </Typography>
                )}
              {!getReviewsLoading &&
                !getReviewsError &&
                patientReviews.map((review: Comment) => (
                  <Box
                    key={review._id}
                    sx={{
                      p: 2,
                      backgroundColor: "#f8fafc",
                      borderRadius: 2,
                    }}
                  >
                    <Stack direction="row" spacing={1.5} mb={1}>
                      <Avatar
                        src={resolveMediaUrl(review.memberData?.memberImage)}
                        sx={{ width: 36, height: 36 }}
                      />
                      <Box flex={1}>
                        <Typography variant="body2" fontWeight={600}>
                          {review.memberData?.memberNick || "Unknown User"}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {new Date(review.createdAt).toLocaleDateString()}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      sx={{ fontStyle: "italic" }}
                    >
                      {review.commentContent}
                    </Typography>
                    <Typography
                      variant="caption"
                      color="text.secondary"
                      display="block"
                      mt={1}
                    >
                      Likes: {review.commentLikes || 0}
                    </Typography>
                  </Box>
                ))}
            </Stack>
          </CardContent>
        </Card>
      </Stack>
    </Box>
  );
};

export default withLayoutDoctor(DoctorDashboard);
