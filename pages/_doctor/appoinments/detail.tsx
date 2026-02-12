import React from "react";
import { Avatar, Box, Divider, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";
import withLayoutDoctor from "@/libs/components/layout/LayoutDoctor";
import { NextPage } from "next";

type AppointmentDetail = {
  id: string;
  patientName: string;
  appointmentType: string;
  status: "Confirmed" | "Pending";
  date: string;
  time: string;
  phone: string;
  email: string;
  note: string;
};

const mockAppointmentDetails: Record<string, AppointmentDetail> = {
  "1": {
    id: "1",
    patientName: "Sarah Connor",
    appointmentType: "General Checkup",
    status: "Confirmed",
    date: "Thursday, February 12, 2026",
    time: "10:00 AM - 10:45 AM",
    phone: "+1 (555) 120-0110",
    email: "s.connor@example.com",
    note:
      "Patient reported occasional fatigue and mild headaches. Review blood pressure trend and hydration routine.",
  },
  "2": {
    id: "2",
    patientName: "Michael Ross",
    appointmentType: "Follow-up Visit",
    status: "Pending",
    date: "Saturday, February 14, 2026",
    time: "01:30 PM - 02:10 PM",
    phone: "+1 (555) 120-0220",
    email: "m.ross@example.com",
    note:
      "Follow-up on previous treatment plan. Confirm medication response and schedule next review.",
  },
};

const DoctorAppointmentDetail: NextPage = () => {
  const router = useRouter();
  const rawId = router.query.id;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId;
  const detail = appointmentId ? mockAppointmentDetails[appointmentId] : undefined;

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

      {!detail ? (
        <Box className="doctor-appointment-detail__empty">
          <Typography variant="h6">Appointment not found</Typography>
          <Typography variant="body2">
            Invalid appointment id. Try opening from calendar cards.
          </Typography>
        </Box>
      ) : (
        <Stack direction={{ xs: "column", md: "row" }} spacing={2}>
          <Box className="doctor-appointment-detail__card doctor-appointment-detail__main-card">
            <Stack direction="row" spacing={2} alignItems="center" className="doctor-appointment-detail__patient-head">
              <Avatar src="/img/defaultUser.svg" className="doctor-appointment-detail__avatar" />
              <Box>
                <Typography className="doctor-appointment-detail__patient-name">
                  {detail.patientName}
                </Typography>
                <Typography className="doctor-appointment-detail__patient-type">
                  {detail.appointmentType}
                </Typography>
              </Box>
              <Box
                className={`doctor-appointment-detail__status ${
                  detail.status === "Confirmed" ? "confirmed" : "pending"
                }`}
              >
                {detail.status}
              </Box>
            </Stack>

            <Divider />

            <Stack spacing={2} className="doctor-appointment-detail__meta">
              <Box className="doctor-appointment-detail__row">
                <Typography className="doctor-appointment-detail__label">Appointment ID</Typography>
                <Typography className="doctor-appointment-detail__value">
                  #{detail.id}
                </Typography>
              </Box>
              <Box className="doctor-appointment-detail__row">
                <Typography className="doctor-appointment-detail__label">Date</Typography>
                <Typography className="doctor-appointment-detail__value">
                  {detail.date}
                </Typography>
              </Box>
              <Box className="doctor-appointment-detail__row">
                <Typography className="doctor-appointment-detail__label">Time</Typography>
                <Typography className="doctor-appointment-detail__value">
                  {detail.time}
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
                  {detail.phone}
                </Typography>
              </Box>
              <Box className="doctor-appointment-detail__row">
                <Typography className="doctor-appointment-detail__label">Email</Typography>
                <Typography className="doctor-appointment-detail__value">
                  {detail.email}
                </Typography>
              </Box>
            </Stack>

            <Typography className="doctor-appointment-detail__section-title doctor-appointment-detail__section-title--note">
              Clinical Note
            </Typography>
            <Typography className="doctor-appointment-detail__note">
              {detail.note}
            </Typography>
          </Box>
        </Stack>
      )}
    </Box>
  );
};

export default withLayoutDoctor(DoctorAppointmentDetail);
