import React from "react";
import { Box, Button, Stack, Typography } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/router";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LocationOnIcon from "@mui/icons-material/LocationOn";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import { useMutation, useReactiveVar } from "@apollo/client";
import { Doctor } from "@/libs/types/doctors/doctor";
import { userVar } from "@/apollo/store";
import { LIKE_TARGET_DOCTOR } from "@/apollo/user/mutation";
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from "@/libs/sweetAlert";
import { Messages } from "@/libs/config";

interface DoctorCardProps {
  doctor: Doctor;
  refetch: any;
  query: any;
}

const DoctorCard = ({ doctor, refetch, query }: DoctorCardProps) => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const imagePath: string = doctor.memberImage || "/img/defaultUser.svg";
  const doctorName = doctor.memberFullName || doctor.memberNick;
  const specializationRaw = Array.isArray(doctor.specialization)
    ? doctor.specialization
    : doctor.specialization
      ? [doctor.specialization]
      : [];
  const specialization = specializationRaw
    .map((item) => String(item).replaceAll("_", " "))
    .join(", ");
  const location = doctor.clinicAddress || "Clinic address not set";
  const availability = doctor.workingDays?.length
    ? `Available on ${doctor.workingDays[0]}`
    : "Available";
  const isVerified = doctor.memberStatus === "ACTIVE";
  const [likeTargetDoctor] = useMutation(LIKE_TARGET_DOCTOR);
  const liked = Boolean(doctor.meLiked?.length);
  const likeCount = doctor.memberLikes ?? 0;

  const likeDoctorHandler = async (id: string, refetchHandler: any, queryInput: any) => {
    try {
      if (!id) return;
      if (!user._id) throw new Error(Messages.error2);

      await likeTargetDoctor({
        variables: {
          input: id,
        },
      });
      await sweetTopSmallSuccessAlert("Success!", 800);
      await refetchHandler({ input: queryInput });
    } catch (err: any) {
      console.log("ERROR, likeDoctorHandler:", err.message);
      sweetErrorHandling(err).then();
    }
  };

  return (
    <Stack className="doctor-card-config">
      <Stack className="doctor-card-left">
        <Box className="doctor-avatar">
          <img src={imagePath} alt={doctorName} />
          <div className="online-indicator"></div>
        </Box>
      </Stack>

      <Stack className="doctor-card-middle">
        <Stack className="doctor-header">
          <Stack className="doctor-name-section">
            <Stack className="name-verified">
              <Link
                href={{
                  pathname: "/doctor/detail",
                  query: { id: doctor._id },
                }}
              >
                <Typography className="doctor-name">{doctorName}</Typography>
              </Link>
              {isVerified && <CheckCircleIcon className="verified-icon" />}
            </Stack>
            <Typography className="specialization">{specialization}</Typography>
          </Stack>
        </Stack>

        <Stack className="doctor-rating">
          <Stack className="rating-stars" direction="row" alignItems="center" spacing={0.8}>
            <Button
              onClick={() => likeDoctorHandler(doctor._id, refetch, query)}
              sx={{ minWidth: 0, padding: 0, color: liked ? "#ef4444" : "#64748b" }}
            >
              {liked ? <FavoriteIcon fontSize="small" /> : <FavoriteBorderIcon fontSize="small" />}
            </Button>
            <Typography className="reviews">{likeCount} likes</Typography>
          </Stack>
        </Stack>

        <Stack className="doctor-details">
          <Stack className="detail-item">
            <MedicalServicesIcon />
            <Typography>{doctor.experience} Years Exp.</Typography>
          </Stack>
          <Stack className="detail-item">
            <LocationOnIcon />
            <Typography>{location}</Typography>
          </Stack>
        </Stack>

        <Stack className="doctor-availability">
          <Stack className="available-time">
            <CalendarMonthIcon />
            <Typography className="available-text">{availability}</Typography>
          </Stack>
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
          <Button
            className="book-now-btn"
            variant="contained"
            onClick={() => router.push(`/payment?id=${doctor._id}`)}
          >
            Book Now
          </Button>
          <Link
            href={{
              pathname: "/doctor/detail",
              query: { id: doctor._id },
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

