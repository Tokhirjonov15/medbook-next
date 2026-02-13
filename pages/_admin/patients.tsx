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

type PatientRow = {
  id: number;
  name: string;
  status: MemberStatus;
};

const AdminPatientsPage: NextPage = () => {
  const [patients, setPatients] = React.useState<PatientRow[]>([
    { id: 1, name: "Sarah Jenkins", status: MemberStatus.ACTIVE },
    { id: 2, name: "Michael Ross", status: MemberStatus.BLOCK },
    { id: 3, name: "Emily Davis", status: MemberStatus.ACTIVE },
    { id: 4, name: "David Wilson", status: MemberStatus.DELETE },
  ]);

  const onChangeStatus = (patientId: number, next: MemberStatus) => {
    setPatients((prev) =>
      prev.map((item) =>
        item.id === patientId ? { ...item, status: next } : item,
      ),
    );
  };

  return (
    <Box className="admin-section">
      <Typography variant="h4" className="admin-section__title" gutterBottom>
        Patients
      </Typography>
      <Typography variant="body2" className="admin-section__subtitle">
        Manage patient account statuses.
      </Typography>

      <Stack className="admin-list" spacing={1.5}>
        {patients.map((patient) => (
          <Box className="admin-list__row" key={patient.id}>
            <Box className="admin-list__col admin-list__col--main">
              <Typography className="admin-list__name">{patient.name}</Typography>
            </Box>

            <FormControl size="small" className="admin-list__status">
              <InputLabel>Status</InputLabel>
              <Select
                label="Status"
                value={patient.status}
                onChange={(event) =>
                  onChangeStatus(patient.id, event.target.value as MemberStatus)
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

export default withLayoutAdmin(AdminPatientsPage);
