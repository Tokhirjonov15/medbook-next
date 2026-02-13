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
import { MemberStatus } from "@/libs/enums/member.enum";
import withLayoutAdmin from "@/libs/components/layout/LayoutAdmin";

type DoctorRow = {
  id: number;
  name: string;
  specialization: string;
  status: MemberStatus;
};

const AdminHome: NextPage = () => {
  const [doctors, setDoctors] = React.useState<DoctorRow[]>([
    {
      id: 1,
      name: "Dr. Sarah Wilson",
      specialization: "Cardiology",
      status: MemberStatus.ACTIVE,
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialization: "Dermatology",
      status: MemberStatus.BLOCK,
    },
    {
      id: 3,
      name: "Dr. Emily White",
      specialization: "General Practice",
      status: MemberStatus.DELETE,
    },
  ]);

  const onChangeStatus = (doctorId: number, next: MemberStatus) => {
    setDoctors((prev) =>
      prev.map((item) =>
        item.id === doctorId ? { ...item, status: next } : item,
      ),
    );
  };

  return (
    <Box className="admin-section">
      <Typography variant="h4" className="admin-section__title" gutterBottom>
        Doctors
      </Typography>
      <Typography variant="body2" className="admin-section__subtitle">
        Manage doctor status and visibility.
      </Typography>

      <Stack className="admin-list" spacing={1.5}>
        {doctors.map((doctor) => (
          <Box className="admin-list__row" key={doctor.id}>
            <Box className="admin-list__col admin-list__col--main">
              <Typography className="admin-list__name">{doctor.name}</Typography>
              <Typography className="admin-list__meta">
                {doctor.specialization}
              </Typography>
            </Box>

            <FormControl size="small" className="admin-list__status">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={doctor.status}
                onChange={(event) =>
                  onChangeStatus(doctor.id, event.target.value as MemberStatus)
                }
              >
                <MenuItem value={MemberStatus.ACTIVE}>ACTIVE</MenuItem>
                <MenuItem value={MemberStatus.BLOCK}>BLOCK</MenuItem>
                <MenuItem value={MemberStatus.DELETE}>DELETE</MenuItem>
              </Select>
            </FormControl>
          </Box>
        ))}
      </Stack>
    </Box>
  );
};

export default withLayoutAdmin(AdminHome);
