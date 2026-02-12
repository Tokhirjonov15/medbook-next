import React, { useState } from "react";
import { NextPage } from "next";
import {
  Box,
  Button,
  Stack,
  Typography,
  Tab,
  Tabs,
  IconButton,
  Rating,
  TextField,
  Avatar,
  Chip,
} from "@mui/material";
import { useRouter } from "next/router";
import FavoriteIcon from "@mui/icons-material/Favorite";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import LanguageIcon from "@mui/icons-material/Language";
import withLayoutMain from "@/libs/components/layout/LayoutMember";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`doctor-tabpanel-${index}`}
      aria-labelledby={`doctor-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const DoctorDetail: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [tabValue, setTabValue] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [isFollowed, setIsFollowed] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState<number | null>(5);

  // Mock data - bu qismni API dan olingan data bilan almashtiring
  const doctor = {
    id: "1",
    name: "Dr. Sarah Bennett",
    specialization: "Cardiologist",
    experience: 12,
    image: "/img/girl.svg",
    consultationFee: 100,
    verified: true,
    likes: 245,
    followers: 1234,
    followings: 89,
    memberDescription:
      "Dr. Sarah Bennett is a highly skilled Senior Cardiologist with over 12 years of experience in diagnosing and treating cardiovascular diseases. She specializes in interventional cardiology and has performed over 500 successful surgeries. Dr. Bennett is dedicated to providing personalized care and is known for her patient-centric approach.",
    specializations: [
      "Angiogram",
      "Heart Surgery",
      "Hypertension",
      "ECG Service",
      "Cholesterol Management",
    ],
    languages: ["English", "Spanish", "French"],
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    workingHours: "9:00 AM - 5:00 PM",
    clinicLocation: {
      address: "123 Medical Center, New York, NY 10001",
      lat: 40.7128,
      lng: -74.006,
    },
  };

  const reviews = [
    {
      id: 1,
      userName: "John Doe",
      userImage: "/img/defaultUser.svg",
      rating: 5,
      comment: "Excellent doctor! Very professional and caring.",
      date: "2024-01-15",
    },
    {
      id: 2,
      userName: "Jane Smith",
      userImage: "/img/defaultUser.svg",
      rating: 4,
      comment: "Great experience. Highly recommend!",
      date: "2024-01-10",
    },
    {
      id: 3,
      userName: "Mike Johnson",
      userImage: "/img/defaultUser.svg",
      rating: 5,
      comment: "Very knowledgeable and patient. Thank you!",
      date: "2024-01-05",
    },
  ];

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleLike = () => {
    setIsLiked(!isLiked);
    // TODO: API call to like/unlike doctor
  };

  const handleFollow = () => {
    setIsFollowed(!isFollowed);
    // TODO: API call to follow/unfollow doctor
  };

  const handleSubmitReview = () => {
    if (reviewText.trim() && reviewRating) {
      // TODO: API call to submit review
      console.log("Review submitted:", { reviewText, reviewRating });
      setReviewText("");
      setReviewRating(5);
    }
  };

  return (
    <div id="doctor-detail-page">
      <Stack className="detail-container">
        <Stack className="detail-content">
          {/* Doctor Info */}
          <Stack className="doctor-info-section">
            <Stack className="doctor-main-info">
              <Box className="doctor-avatar-box">
                <img
                  src={doctor.image}
                  alt={doctor.name}
                  className="doctor-avatar"
                />
                <Box className="online-indicator" />
              </Box>

              <Stack className="doctor-details">
                <Stack className="name-section">
                  <Typography className="doctor-name">{doctor.name}</Typography>
                  {doctor.verified && (
                    <CheckCircleIcon className="verified-icon" />
                  )}
                </Stack>
                <Typography className="specialization">
                  {doctor.specialization} • {doctor.experience} Years Experience
                </Typography>
                <Stack className="like-section">
                  <IconButton onClick={handleLike} className="like-btn">
                    {isLiked ? (
                      <FavoriteIcon className="liked" />
                    ) : (
                      <FavoriteBorderIcon />
                    )}
                  </IconButton>
                  <Typography className="like-count">
                    {doctor.likes + (isLiked ? 1 : 0)} Likes
                  </Typography>
                </Stack>
              </Stack>

              <Stack className="fee-follow-section">
                <Stack className="consultation-fee">
                  <Typography className="fee-amount">
                    ${doctor.consultationFee}
                  </Typography>
                  <Typography className="fee-label">
                    per consultation
                  </Typography>
                </Stack>
                <Button
                  variant={isFollowed ? "outlined" : "contained"}
                  startIcon={
                    isFollowed ? <PersonRemoveIcon /> : <PersonAddIcon />
                  }
                  onClick={handleFollow}
                  className={isFollowed ? "unfollow-btn" : "follow-btn"}
                >
                  {isFollowed ? "Unfollow" : "Follow"}
                </Button>
              </Stack>
            </Stack>

            {/* Followers/Following Stats */}
            <Stack className="stats-section">
              <Stack className="stat-item">
                <Typography className="stat-number">
                  {doctor.followers}
                </Typography>
                <Typography className="stat-label">Followers</Typography>
              </Stack>
              <Stack className="stat-divider" />
              <Stack className="stat-item">
                <Typography className="stat-number">
                  {doctor.followings}
                </Typography>
                <Typography className="stat-label">Following</Typography>
              </Stack>
            </Stack>
          </Stack>

          {/* Tabs */}
          <Box className="tabs-section">
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              className="doctor-tabs"
              TabIndicatorProps={{ className: "tab-indicator" }}
            >
              <Tab label="About" className="tab-item" />
              <Tab label="Reviews" className="tab-item" />
              <Tab label="Availability" className="tab-item" />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Stack className="tab-content">
            {/* About Tab */}
            <TabPanel value={tabValue} index={0}>
              <Stack className="about-content">
                <Stack className="section">
                  <Typography className="section-title">Biography</Typography>
                  <Typography className="section-text">
                    {doctor.memberDescription}
                  </Typography>
                </Stack>

                <Stack className="section">
                  <Typography className="section-title">
                    Specializations
                  </Typography>
                  <Stack className="specializations-list">
                    {doctor.specializations.map((spec, index) => (
                      <Chip key={index} label={spec} className="spec-chip" />
                    ))}
                  </Stack>
                </Stack>

                <Stack className="section">
                  <Typography className="section-title">Languages</Typography>
                  <Stack className="languages-list">
                    {doctor.languages.map((lang, index) => (
                      <Stack key={index} className="language-item">
                        <LanguageIcon className="lang-icon" />
                        <Typography>{lang}</Typography>
                      </Stack>
                    ))}
                  </Stack>
                </Stack>

                <Stack className="section">
                  <Typography className="section-title">
                    Clinic Location
                  </Typography>
                  <Typography className="section-text">
                    {doctor.clinicLocation.address}
                  </Typography>
                  <Box className="map-placeholder">
                    <img
                      src="/img/map-placeholder.png"
                      alt="Clinic Location"
                      style={{ width: "100%", borderRadius: "8px" }}
                    />
                  </Box>
                </Stack>
              </Stack>
            </TabPanel>

            {/* Reviews Tab */}
            <TabPanel value={tabValue} index={1}>
              <Stack className="reviews-content">
                {/* Write Review */}
                <Stack className="write-review-section">
                  <Typography className="section-title">
                    Write a Review
                  </Typography>
                  <Stack className="rating-input">
                    <Typography className="rating-label">
                      Your Rating:
                    </Typography>
                    <Rating
                      value={reviewRating}
                      onChange={(event, newValue) => setReviewRating(newValue)}
                      size="large"
                    />
                  </Stack>
                  <TextField
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Share your experience with this doctor..."
                    value={reviewText}
                    onChange={(e) => setReviewText(e.target.value)}
                    className="review-input"
                  />
                  <Button
                    variant="contained"
                    onClick={handleSubmitReview}
                    disabled={!reviewText.trim() || !reviewRating}
                    className="submit-review-btn"
                  >
                    Submit Review
                  </Button>
                </Stack>

                {/* Reviews List */}
                <Stack className="reviews-list">
                  <Typography className="section-title">
                    All Reviews ({reviews.length})
                  </Typography>
                  {reviews.map((review) => (
                    <Stack key={review.id} className="review-item">
                      <Stack className="review-header">
                        <Avatar
                          src={review.userImage}
                          className="review-avatar"
                        />
                        <Stack className="review-user-info">
                          <Typography className="review-user-name">
                            {review.userName}
                          </Typography>
                          <Typography className="review-date">
                            {new Date(review.date).toLocaleDateString()}
                          </Typography>
                        </Stack>
                        <Rating value={review.rating} readOnly size="small" />
                      </Stack>
                      <Typography className="review-comment">
                        {review.comment}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </TabPanel>

            {/* Availability Tab */}
            <TabPanel value={tabValue} index={2}>
              <Stack className="availability-content">
                <Stack className="section">
                  <Typography className="section-title">
                    Working Days
                  </Typography>
                  <Stack className="working-days-list">
                    {doctor.workingDays.map((day, index) => (
                      <Chip key={index} label={day} className="day-chip" />
                    ))}
                  </Stack>
                </Stack>

                <Stack className="section">
                  <Typography className="section-title">
                    Working Hours
                  </Typography>
                  <Typography className="working-hours">
                    {doctor.workingHours}
                  </Typography>
                </Stack>
              </Stack>
            </TabPanel>
          </Stack>

          {/* Book Appointment Button */}
          <Stack className="book-section">
            <Button variant="contained" fullWidth className="book-btn">
              Book Appointment for ${doctor.consultationFee}
            </Button>
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
};

export default withLayoutMain(DoctorDetail);
