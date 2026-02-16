import React from "react";
import { Avatar, Box, Stack, Typography } from "@mui/material";

export interface PatientCardData {
  id: string;
  name: string;
  image?: string;
  followers: number;
  followings: number;
  likes: number;
  createdAt: string;
}

interface PatientCardProps {
  patient: PatientCardData;
  onNameClick?: (id: string) => void;
}

const PatientCard = ({ patient, onNameClick }: PatientCardProps) => {
  const joinDate = new Date(patient.createdAt).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });

  return (
    <Box className="doctor-patient-card">
      <Stack direction="row" spacing={1.5} alignItems="center" className="doctor-patient-card__head">
        <Avatar
          src={patient.image || "/img/defaultUser.svg"}
          className="doctor-patient-card__avatar"
          sx={{ cursor: "pointer" }}
          onClick={() => onNameClick?.(patient.id)}
        />
        <Box>
          <button
            type="button"
            className="doctor-patient-card__name-button"
            onClick={() => onNameClick?.(patient.id)}
          >
            <Typography className="doctor-patient-card__name">{patient.name}</Typography>
          </button>
          <Typography className="doctor-patient-card__joined">Joined: {joinDate}</Typography>
        </Box>
      </Stack>

      <Stack direction="row" spacing={1} className="doctor-patient-card__stats">
        <Box className="doctor-patient-card__stat">
          <Typography className="doctor-patient-card__stat-label">Followers</Typography>
          <Typography className="doctor-patient-card__stat-value">{patient.followers}</Typography>
        </Box>
        <Box className="doctor-patient-card__stat">
          <Typography className="doctor-patient-card__stat-label">Followings</Typography>
          <Typography className="doctor-patient-card__stat-value">{patient.followings}</Typography>
        </Box>
        <Box className="doctor-patient-card__stat">
          <Typography className="doctor-patient-card__stat-label">Likes</Typography>
          <Typography className="doctor-patient-card__stat-value">{patient.likes}</Typography>
        </Box>
      </Stack>
    </Box>
  );
};

export default PatientCard;
