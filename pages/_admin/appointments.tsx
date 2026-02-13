import React from "react";
import { NextPage } from "next";
import {
  Box,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { AppointmentStatus } from "@/libs/enums/appoinment.enum";
import withLayoutAdmin from "@/libs/components/layout/LayoutAdmin";

type AppointmentRow = {
  id: number;
  doctorName: string;
  patientName: string;
  status: AppointmentStatus;
};

const appointmentStatusOptions: AppointmentStatus[] = [
  AppointmentStatus.SCHEDULED,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CANCELLED,
];

const AdminAppointmentsPage: NextPage = () => {
  const [appointments, setAppointments] = React.useState<AppointmentRow[]>([
    {
      id: 1,
      doctorName: "Dr. Sarah Wilson",
      patientName: "Sarah Jenkins",
      status: AppointmentStatus.SCHEDULED,
    },
    {
      id: 2,
      doctorName: "Dr. Michael Chen",
      patientName: "Michael Ross",
      status: AppointmentStatus.CONFIRMED,
    },
    {
      id: 3,
      doctorName: "Dr. Emily White",
      patientName: "Emily Davis",
      status: AppointmentStatus.COMPLETED,
    },
    {
      id: 4,
      doctorName: "Dr. Sarah Wilson",
      patientName: "David Wilson",
      status: AppointmentStatus.CANCELLED,
    },
  ]);

  const onChangeStatus = (appointmentId: number, next: AppointmentStatus) => {
    setAppointments((prev) =>
      prev.map((item) =>
        item.id === appointmentId ? { ...item, status: next } : item,
      ),
    );
  };

  return (
    <Box className="admin-section">
      <Typography variant="h4" className="admin-section__title" gutterBottom>
        Appointments
      </Typography>
      <Typography variant="body2" className="admin-section__subtitle">
        View and update appointment statuses.
      </Typography>

      <Stack className="admin-list" spacing={1.5}>
        {appointments.map((appointment) => (
          <Box className="admin-list__row" key={appointment.id}>
            <Box className="admin-list__col admin-list__col--main">
              <Typography className="admin-list__name">
                {appointment.patientName}
              </Typography>
              <Typography className="admin-list__meta">
                Doctor: {appointment.doctorName}
              </Typography>
            </Box>

            <FormControl size="small" className="admin-list__status">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={appointment.status}
                onChange={(event) =>
                  onChangeStatus(
                    appointment.id,
                    event.target.value as AppointmentStatus,
                  )
                }
              >
                {appointmentStatusOptions.map((status) => (
                  <MenuItem value={status} key={status}>
                    {status}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default withLayoutAdmin(AdminAppointmentsPage);
