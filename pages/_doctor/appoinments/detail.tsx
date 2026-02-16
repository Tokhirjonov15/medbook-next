import React, { useMemo } from "react";
import { Avatar, Box, CircularProgress, Divider, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";
import { useQuery, useReactiveVar } from "@apollo/client";
import withLayoutDoctor from "@/libs/components/layout/LayoutDoctor";
import { NextPage } from "next";
import { doctorVar } from "@/apollo/store";
import { GET_DOCTOR_APPOINTMENTS } from "@/apollo/doctor/query";
import { Appointments, Appointment } from "@/libs/types/appoinment/appoinment";
import { AppointmentsInquiry } from "@/libs/types/appoinment/appoinment.input";
import { AppointmentStatus } from "@/libs/enums/appoinment.enum";

interface GetDoctorAppointmentsResponse {
  getDoctorAppointments: Appointments;
}

interface GetDoctorAppointmentsVariables {
  input: AppointmentsInquiry;
}

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

const toStatusLabel = (status?: AppointmentStatus) =>
  String(status || "")
    .replaceAll("_", " ")
    .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());

const resolveStatusView = (status?: AppointmentStatus) => {
  if (
    status === AppointmentStatus.CONFIRMED ||
    status === AppointmentStatus.IN_PROGRESS ||
    status === AppointmentStatus.COMPLETED
  ) {
    return "confirmed";
  }
  return "pending";
};

const DoctorAppointmentDetail: NextPage = () => {
  const router = useRouter();
  const doctor = useReactiveVar(doctorVar);
  const doctorId = doctor?._id || "";
  const rawId = router.query.id;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId;

  const appointmentsInput = useMemo<AppointmentsInquiry>(
    () => ({
      page: 1,
      limit: 500,
      sort: "appointmentDate",
      direction: "DESC",
      search: { doctorId },
    }),
    [doctorId],
  );

  const {
    loading: getAppointmentsLoading,
    data: getAppointmentsData,
    error: getAppointmentsError,
  } = useQuery<GetDoctorAppointmentsResponse, GetDoctorAppointmentsVariables>(
    GET_DOCTOR_APPOINTMENTS,
    {
      fetchPolicy: "cache-and-network",
      variables: { input: appointmentsInput },
      notifyOnNetworkStatusChange: true,
      skip: !doctorId,
    },
  );

  const detail = useMemo<Appointment | undefined>(() => {
    if (!appointmentId) return undefined;
    return (getAppointmentsData?.getDoctorAppointments?.list ?? []).find(
      (item) => item._id === appointmentId,
    );
  }, [appointmentId, getAppointmentsData]);

  const patientName = detail?.patientData?.memberNick || "Unknown Patient";
  const patientId = detail?.patientData?._id || detail?.patient || "";
  const patientImage =
    toAbsoluteMediaUrl(detail?.patientData?.memberImage) || "/img/defaultUser.svg";
  const appointmentType = String(detail?.consultationType || "").replaceAll("_", " ");
  const statusLabel = toStatusLabel(detail?.status);
  const statusClass = resolveStatusView(detail?.status);
  const dateLabel = detail?.appointmentDate
    ? new Date(detail.appointmentDate).toLocaleDateString("en-US", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      })
    : "-";
  const timeLabel = `${detail?.timeSlot?.start || "-"} - ${detail?.timeSlot?.end || "-"}`;
  const phoneLabel = detail?.patientData?.memberPhone || "-";
  const reasonLabel = detail?.reason || "-";
  const symptomsLabel =
    detail?.symptoms?.length
      ? detail.symptoms.join(", ")
      : detail?.notes?.trim() || "-";
  const paymentLabel = detail?.paymentStatus || "-";
  const bookedAtLabel = detail?.createdAt
    ? new Date(detail.createdAt).toLocaleString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      })
    : "-";

  if (!doctorId || getAppointmentsLoading) {
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

  return (
    <Box className="doctor-appointment-detail">
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        className="doctor-appointment-detail__top"
      >
        <Box>
          <Typography variant="h4" className="doctor-appointment-detail__title" gutterBottom>
            Appointment Detail
          </Typography>
          <Typography
            variant="body2"
            className="doctor-appointment-detail__subtitle"
          >
            Review appointment and patient information.
          </Typography>
        </Box>

        <button
          type="button"
          className="doctor-appointment-detail__back-btn"
          onClick={() => router.push("/_doctor/appointments")}
        >
          Back to Calendar
        </button>
      </Stack>

      {getAppointmentsError || !detail ? (
        <Box className="doctor-appointment-detail__empty">
          <Typography variant="h6">Appointment not found</Typography>
          <Typography variant="body2">
            Invalid appointment id. Try opening from calendar cards.
          </Typography>
        </Box>
      ) : (
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Box className="doctor-appointment-detail__card doctor-appointment-detail__main-card">
            <Stack
              direction="row"
              spacing={2}
              alignItems="center"
              className="doctor-appointment-detail__patient-head"
            >
              <Avatar
                src={patientImage}
                className="doctor-appointment-detail__avatar"
                sx={{ cursor: patientId ? "pointer" : "default" }}
                onClick={() =>
                  patientId
                    ? router.push(`/_doctor/patients/detail?id=${patientId}`)
                    : null
                }
              />
              <Box>
                <Typography
                  className="doctor-appointment-detail__patient-name"
                  sx={{ cursor: patientId ? "pointer" : "default" }}
                  onClick={() =>
                    patientId
                      ? router.push(`/_doctor/patients/detail?id=${patientId}`)
                      : null
                  }
                >
                  {patientName}
                </Typography>
                <Typography className="doctor-appointment-detail__patient-type">
                  {appointmentType || "-"}
                </Typography>
              </Box>
              <Box className={`doctor-appointment-detail__status ${statusClass}`}>
                {statusLabel || "Pending"}
              </Box>
            </Stack>

            <Divider />

            <Stack spacing={2} className="doctor-appointment-detail__meta">
              <Box className="doctor-appointment-detail__row">
                <Typography className="doctor-appointment-detail__label">Appointment ID</Typography>
                <Typography className="doctor-appointment-detail__value">
                  #{detail._id}
                </Typography>
              </Box>
              <Box className="doctor-appointment-detail__row">
                <Typography className="doctor-appointment-detail__label">Date</Typography>
                <Typography className="doctor-appointment-detail__value">
                  {dateLabel}
                </Typography>
              </Box>
              <Box className="doctor-appointment-detail__row">
                <Typography className="doctor-appointment-detail__label">Time</Typography>
                <Typography className="doctor-appointment-detail__value">
                  {timeLabel}
                </Typography>
              </Box>
              <Box className="doctor-appointment-detail__row">
                <Typography className="doctor-appointment-detail__label">Booked At</Typography>
                <Typography className="doctor-appointment-detail__value">
                  {bookedAtLabel}
                </Typography>
              </Box>
            </Stack>
          </Box>

          <Box className="doctor-appointment-detail__card doctor-appointment-detail__side-card">
            <Typography className="doctor-appointment-detail__section-title doctor-appointment-detail__section-title--contact">
              Contact
            </Typography>
            <Stack spacing={1.5} className="doctor-appointment-detail__contact">
              <Box className="doctor-appointment-detail__row">
                <Typography className="doctor-appointment-detail__label">Phone</Typography>
                <Typography className="doctor-appointment-detail__value">
                  {phoneLabel}
                </Typography>
              </Box>
              <Box className="doctor-appointment-detail__row">
                <Typography className="doctor-appointment-detail__label">Payment</Typography>
                <Typography className="doctor-appointment-detail__value">
                  {paymentLabel}
                </Typography>
              </Box>
            </Stack>

            <Typography className="doctor-appointment-detail__section-title doctor-appointment-detail__section-title--note">
              Reason
            </Typography>
            <Typography className="doctor-appointment-detail__note">
              {reasonLabel}
            </Typography>

            <Typography className="doctor-appointment-detail__section-title doctor-appointment-detail__section-title--note">
              Symptoms / Notes
            </Typography>
            <Typography className="doctor-appointment-detail__note">
              {symptomsLabel}
            </Typography>
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default withLayoutDoctor(DoctorAppointmentDetail);
