import React, { useEffect, useMemo } from "react";
import { Box, Button, CircularProgress, Stack, Typography } from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import withLayoutMain from "@/libs/components/layout/LayoutMember";
import { useQuery, useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { getJwtToken, updateUserInfo } from "@/libs/auth";
import { GET_DOCTOR, GET_MEMBER_APPOINTMENTS } from "@/apollo/user/query";
import { Appointments, Appointment } from "@/libs/types/appoinment/appoinment";
import { AppointmentsInquiry } from "@/libs/types/appoinment/appoinment.input";
import { Doctor } from "@/libs/types/doctors/doctor";

interface GetAppointmentsResponse {
  getMyAppointments: Appointments;
}

interface GetAppointmentsVariables {
  input: AppointmentsInquiry;
}

interface GetDoctorResponse {
  getDoctor: Doctor;
}

interface GetDoctorVariables {
  input: string;
}

const MyAppointmentDetail: NextPage = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const rawId = router.query.id;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId;

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

  const appointmentsInput = useMemo<AppointmentsInquiry>(
    () => ({
      page: 1,
      limit: 300,
      sort: "appointmentDate",
      direction: "DESC" as AppointmentsInquiry["direction"],
      search: {},
    }),
    [],
  );

  const { loading, data, error } = useQuery<GetAppointmentsResponse, GetAppointmentsVariables>(
    GET_MEMBER_APPOINTMENTS,
    {
      fetchPolicy: "cache-and-network",
      variables: { input: appointmentsInput },
      notifyOnNetworkStatusChange: true,
      skip: !user?._id,
    },
  );

  const detail = useMemo<Appointment | undefined>(() => {
    if (!appointmentId) return undefined;
    return (data?.getMyAppointments?.list ?? []).find((item) => item._id === appointmentId);
  }, [appointmentId, data]);

  const doctorId = detail?.doctor || "";

  const { data: getDoctorData } = useQuery<GetDoctorResponse, GetDoctorVariables>(GET_DOCTOR, {
    fetchPolicy: "cache-and-network",
    variables: { input: doctorId },
    skip: !doctorId,
  });

  const doctorName =
    detail?.doctorData?.memberFullName ||
    detail?.doctorData?.memberNick ||
    getDoctorData?.getDoctor?.memberFullName ||
    getDoctorData?.getDoctor?.memberNick ||
    "Unknown Doctor";
  const appointmentDateLabel = detail?.appointmentDate
    ? new Date(detail.appointmentDate).toLocaleDateString("en-US", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";
  const appointmentTimeLabel = detail?.timeSlot?.start || "-";
  const bookedAtLabel = detail?.createdAt
    ? new Date(detail.createdAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  const symptomsLabel =
    detail?.symptoms?.length
      ? detail.symptoms.join(", ")
      : detail?.notes?.trim() || detail?.reason?.trim() || "-";

  if (loading) {
    return (
      <Stack sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", minHeight: "70vh" }}>
        <CircularProgress size={"3rem"} />
      </Stack>
    );
  }

  if (error || !detail) {
    return (
      <div id="mypage-page">
        <Stack className="mypage-container">
          <Box className="mypage-panel">
            <Typography className="mypage-section-title">Appointment Detail</Typography>
            <Box className="mypage-list-item">
              <Typography>
                Appointment detail not found.
              </Typography>
            </Box>
          </Box>
        </Stack>
      </div>
    );
  }

  return (
    <div id="mypage-page">
      <Stack className="mypage-container">
        <Box className="mypage-panel">
          <Button
            variant="outlined"
            size="small"
            onClick={() => router.back()}
            sx={{ mb: 1.5, borderRadius: "10px" }}
          >
            Back
          </Button>
          <Typography className="mypage-section-title">Appointment Detail</Typography>

          <Stack spacing={1.2}>
            <Box className="mypage-list-item">
              <Typography>Doctor: {doctorName}</Typography>
            </Box>
            <Box className="mypage-list-item">
              <Typography>
                Appointment Date & Time: {appointmentDateLabel} {appointmentTimeLabel}
              </Typography>
            </Box>
            <Box className="mypage-list-item">
              <Typography>Booked At: {bookedAtLabel}</Typography>
            </Box>
            <Box className="mypage-list-item">
              <Typography>Reason: {detail.reason || "-"}</Typography>
            </Box>
            <Box className="mypage-list-item">
              <Typography>Symptoms: {symptomsLabel}</Typography>
            </Box>
            <Box className="mypage-list-item">
              <Typography>Payment Status: {detail.paymentStatus || "-"}</Typography>
            </Box>
          </Stack>
        </Box>
      </Stack>
    </div>
  );
};

export default withLayoutMain(MyAppointmentDetail);
