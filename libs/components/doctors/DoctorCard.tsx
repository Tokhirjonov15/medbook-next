import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";

interface DoctorCardProps {
  doctor: {
    id: number;
    name: string;
    specialization: string;
    rating: number;
    reviews: number;
    experience: number;
    location: string;
    consultationFee: number;
    availability: string;
    availableNow: boolean;
    verified: boolean;
    videoConsult: boolean;
  };
}

const DoctorCard = ({ doctor }: DoctorCardProps) => {
  const imagePath: string = "/img/girl.svg";

  const renderStars = (rating: number) => {
    const stars = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <span key={i} className="star filled">
          ★
        </span>,
      );
    }
    if (hasHalfStar) {
      stars.push(
        <span key="half" className="star half">
          ★
        </span>,
      );
    }
    for (let i = stars.length; i < 5; i++) {
      stars.push(
        <span key={i} className="star">
          ★
        </span>,
      );
    }
    return stars;
  };

  return (
    <Stack className="doctor-card-config">
      <Stack className="doctor-card-left">
        <Box className="doctor-avatar">
          <img src={imagePath} alt={doctor.name} />
          {doctor.availableNow && <div className="online-indicator"></div>}
        </Box>
      </Stack>

      <Stack className="doctor-card-middle">
        <Stack className="doctor-header">
          <Stack className="doctor-name-section">
            <Stack className="name-verified">
              <Link
                href={{
                  pathname: "/doctor/detail",
                  query: { id: doctor.id },
                }}
              >
                <Typography className="doctor-name">{doctor.name}</Typography>
              </Link>
              {doctor.verified && <CheckCircleIcon className="verified-icon" />}
            </Stack>
            <Typography className="specialization">
              {doctor.specialization}
            </Typography>
          </Stack>
        </Stack>

        <Stack className="doctor-rating">
          <Stack className="rating-stars">
            <Typography className="rating-number">{doctor.rating}</Typography>
            <Stack className="stars">{renderStars(doctor.rating)}</Stack>
            <Typography className="reviews">
              ({doctor.reviews} reviews)
            </Typography>
          </Stack>
        </Stack>

        <Stack className="doctor-details">
          <Stack className="detail-item">
            <MedicalServicesIcon />
            <Typography>{doctor.experience} Years Exp.</Typography>
          </Stack>
          <Stack className="detail-item">
            <LocationOnIcon />
            <Typography>{doctor.location}</Typography>
          </Stack>
        </Stack>

        <Stack className="doctor-availability">
          {doctor.videoConsult && (
            <Box className="video-badge">
              <Typography>Video Consult Available</Typography>
            </Box>
          )}
          {doctor.availableNow ? (
            <Stack className="available-time">
              <CalendarMonthIcon />
              <Typography className="available-text">
                {doctor.availability}
              </Typography>
            </Stack>
          ) : (
            <Stack className="next-available">
              <CalendarMonthIcon />
              <Typography className="next-available-text">
                {doctor.availability}
              </Typography>
            </Stack>
          )}
        </Stack>
      </Stack>

      <Stack className="doctor-card-right">
        <Stack className="consultation-fee">
          <Typography className="fee-label">CONSULTATION FEE</Typography>
          <Typography className="fee-amount">
            ${doctor.consultationFee} <span>/ visit</span>
          </Typography>
        </Stack>

        <Stack className="action-buttons">
          <Button className="book-now-btn" variant="contained">
            Book Now
          </Button>
          <Link
            href={{
              pathname: "/doctor/detail",
              query: { id: doctor.id },
            }}
            style={{ textDecoration: "none" }}
          >
            <Button className="view-profile-btn" variant="outlined">
              View Profile
            </Button>
          </Link>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default DoctorCard;
