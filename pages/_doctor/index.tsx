import React, { useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Rating,
} from "@mui/material";
import { useRouter } from "next/router";
import TrendingUpIcon from "@mui/icons-material/TrendingUp";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import withLayoutDoctor from "@/libs/components/layout/LayoutDoctor";
import { NextPage } from "next";
import { useReactiveVar } from "@apollo/client";
import { doctorVar } from "@/apollo/store";

const DoctorDashboard: NextPage = () => {
  const router = useRouter();
  const doctor = useReactiveVar(doctorVar);
  const doctorName = doctor?.memberFullName || doctor?.memberNick || "Doctor";

  // Mock data - replace with API calls
  const stats = {
    totalPatients: 1245,
    patientsGrowth: 5,
    todaysAppointments: 8,
    pendingAppointments: 2,
    followers: 234,
    followersGrowth: 12,
    followings: 45,
    followingsGrowth: 3,
  };

  const recentAppointments = [
    {
      id: 1,
      patient: {
        name: "Sarah Jenkins",
        id: "#P-2458",
        avatar: "/img/defaultUser.svg",
      },
      date: "Oct 24, 2023",
      time: "09:00 AM",
      type: "General Checkup",
      status: "Completed",
    },
    {
      id: 2,
      patient: {
        name: "Mike Ross",
        id: "#P-2459",
        avatar: "/img/defaultUser.svg",
      },
      date: "Oct 24, 2023",
      time: "10:30 AM",
      type: "Follow-up",
      status: "Pending",
    },
    {
      id: 3,
      patient: {
        name: "Emily Watson",
        id: "#P-2460",
        avatar: "/img/defaultUser.svg",
      },
      date: "Oct 24, 2023",
      time: "01:15 PM",
      type: "Dermatology",
      status: "In Progress",
    },
  ];

  const patientReviews = [
    {
      id: 1,
      patient: {
        name: "John Doe",
        avatar: "/img/defaultUser.svg",
      },
      rating: 5,
      comment:
        '"Dr. Smith was very attentive and explained everything clearly. Highly recommended!"',
      time: "2 days ago",
    },
    {
      id: 2,
      patient: {
        name: "Alice Lee",
        avatar: "/img/defaultUser.svg",
      },
      rating: 4,
      comment:
        '"Great clinic, but the wait time was a bit longer than expected."',
      time: "5 days ago",
    },
    {
      id: 3,
      patient: {
        name: "Mark K.",
        avatar: "/img/defaultUser.svg",
      },
      rating: 5,
      comment:
        '"Professional and caring staff. The online booking system is very convenient."',
      time: "1 week ago",
    },
  ];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Completed":
        return "success";
      case "Pending":
        return "warning";
      case "In Progress":
        return "info";
      default:
        return "default";
    }
  };

  const handleNewAppointment = () => {
    // TODO: Open new appointment modal or navigate
    console.log("New appointment");
  };

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
                  {stats.totalPatients.toLocaleString()}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: "#22c55e" }} />
                  <Typography variant="caption" color="#22c55e">
                    +{stats.patientsGrowth}%
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
                  {stats.todaysAppointments}
                </Typography>
                <Typography variant="caption" color="text.secondary" mt={1}>
                  {stats.pendingAppointments} pending
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
                  {stats.followers}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: "#22c55e" }} />
                  <Typography variant="caption" color="#22c55e">
                    +{stats.followersGrowth}%
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
                  {stats.followings}
                </Typography>
                <Stack direction="row" alignItems="center" spacing={0.5} mt={1}>
                  <TrendingUpIcon sx={{ fontSize: 16, color: "#22c55e" }} />
                  <Typography variant="caption" color="#22c55e">
                    +{stats.followingsGrowth}%
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
                  {recentAppointments.map((appointment) => (
                    <TableRow key={appointment.id} hover>
                      <TableCell>
                        <Stack
                          direction="row"
                          alignItems="center"
                          spacing={1.5}
                        >
                          <Avatar src={appointment.patient.avatar} />
                          <Box>
                            <Typography variant="body2" fontWeight={600}>
                              {appointment.patient.name}
                            </Typography>
                            <Typography
                              variant="caption"
                              color="text.secondary"
                            >
                              {appointment.patient.id}
                            </Typography>
                          </Box>
                        </Stack>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {appointment.date}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {appointment.time}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2">
                          {appointment.type}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Chip
                          label={appointment.status}
                          color={getStatusColor(appointment.status)}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </CardContent>
        </Card>

        {/* Patient Reviews */}
        <Card sx={{ flex: 1 }}>
          <CardContent>
            <Typography variant="h6" fontWeight={700} mb={2}>
              Patient Reviews
            </Typography>

            <Stack spacing={2}>
              {patientReviews.map((review) => (
                <Box
                  key={review.id}
                  sx={{
                    p: 2,
                    backgroundColor: "#f8fafc",
                    borderRadius: 2,
                  }}
                >
                  <Stack direction="row" spacing={1.5} mb={1}>
                    <Avatar
                      src={review.patient.avatar}
                      sx={{ width: 36, height: 36 }}
                    />
                    <Box flex={1}>
                      <Typography variant="body2" fontWeight={600}>
                        {review.patient.name}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {review.time}
                      </Typography>
                    </Box>
                  </Stack>
                  <Rating
                    value={review.rating}
                    readOnly
                    size="small"
                    sx={{ mb: 1 }}
                  />
                  <Typography
                    variant="caption"
                    color="text.secondary"
                    sx={{ fontStyle: "italic" }}
                  >
                    {review.comment}
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
