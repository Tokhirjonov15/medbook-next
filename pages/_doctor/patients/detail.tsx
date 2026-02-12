import React, { useEffect, useMemo, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  Stack,
  Tab,
  Tabs,
  TextField,
  Typography,
} from "@mui/material";
import FavoriteBorderIcon from "@mui/icons-material/FavoriteBorder";
import FavoriteIcon from "@mui/icons-material/Favorite";
import PersonAddIcon from "@mui/icons-material/PersonAdd";
import PersonRemoveIcon from "@mui/icons-material/PersonRemove";
import withLayoutDoctor from "@/libs/components/layout/LayoutDoctor";
import { NextPage } from "next";
import { useRouter } from "next/router";

type PatientDetail = {
  id: number;
  name: string;
  image: string;
  likes: number;
  followers: number;
  followings: number;
  articles: { id: number; title: string; createdAt: string }[];
  reviews: {
    id: number;
    author: string;
    rating: number;
    comment: string;
    createdAt: string;
  }[];
  followerUsers: string[];
  followingUsers: string[];
};

const mockPatients: PatientDetail[] = [
  {
    id: 1,
    name: "Sarah Jenkins",
    image: "/img/defaultUser.svg",
    likes: 310,
    followers: 120,
    followings: 42,
    articles: [
      { id: 1, title: "My Recovery Journey", createdAt: "2026-02-11" },
      { id: 2, title: "Healthy Diet Notes", createdAt: "2026-02-08" },
    ],
    reviews: [
      {
        id: 1,
        author: "Dr. Alex",
        rating: 5,
        comment: "Patient follows treatment plan very well.",
        createdAt: "2026-02-11",
      },
      {
        id: 2,
        author: "Clinic Staff",
        rating: 4,
        comment: "Always on time and cooperative.",
        createdAt: "2026-02-09",
      },
    ],
    followerUsers: ["Emily Davis", "Nora White", "Hannah Lee", "Lucas Perez"],
    followingUsers: ["Dr. Alex", "Cardio Community", "Wellness Daily"],
  },
  {
    id: 2,
    name: "Michael Chen",
    image: "/img/defaultUser.svg",
    likes: 204,
    followers: 88,
    followings: 21,
    articles: [
      { id: 1, title: "Post-surgery Weekly Update", createdAt: "2026-02-10" },
      { id: 2, title: "My Exercise Checklist", createdAt: "2026-02-05" },
    ],
    reviews: [
      {
        id: 1,
        author: "Dr. Alex",
        rating: 4,
        comment: "Consistent progress in follow-up visits.",
        createdAt: "2026-02-10",
      },
      {
        id: 2,
        author: "Clinic Staff",
        rating: 5,
        comment: "Very active in patient community.",
        createdAt: "2026-02-06",
      },
    ],
    followerUsers: ["Grace Thompson", "Sofia Martinez", "Ethan Clark"],
    followingUsers: ["Dr. Alex", "Nutrition Club"],
  },
];

const DoctorPatientDetail: NextPage = () => {
  const router = useRouter();
  const [tab, setTab] = useState(0);
  const [liked, setLiked] = useState(false);
  const [followed, setFollowed] = useState(false);
  const [reviewText, setReviewText] = useState("");

  const rawId = router.query.id;
  const id = Array.isArray(rawId) ? Number(rawId[0]) : Number(rawId);
  const patient = useMemo(
    () => mockPatients.find((item) => item.id === id) || mockPatients[0],
    [id],
  );
  const [patientReviews, setPatientReviews] = useState(patient.reviews);

  useEffect(() => {
    setPatientReviews(patient.reviews);
    setReviewText("");
  }, [patient]);

  const likeCount = patient.likes + (liked ? 1 : 0);
  const followerCount = patient.followers + (followed ? 1 : 0);

  const handleAddReview = () => {
    const text = reviewText.trim();
    if (!text) return;

    setPatientReviews((prev) => [
      {
        id: Date.now(),
        author: "You",
        rating: 5,
        comment: text,
        createdAt: new Date().toISOString(),
      },
      ...prev,
    ]);
    setReviewText("");
  };

  return (
    <Box className="doctor-patient-detail">
      <Box className="doctor-patient-detail__container">
        <Box className="doctor-patient-detail__top">
          <Stack direction="row" spacing={2} alignItems="center">
            <Avatar src={patient.image} className="doctor-patient-detail__avatar" />
            <Box>
              <Typography className="doctor-patient-detail__name">{patient.name}</Typography>
              <Typography className="doctor-patient-detail__role">PATIENT</Typography>
              <Stack direction="row" spacing={1} alignItems="center" className="doctor-patient-detail__like-row">
                <button
                  type="button"
                  className="doctor-patient-detail__icon-btn"
                  onClick={() => setLiked((prev) => !prev)}
                >
                  {liked ? <FavoriteIcon className="liked" /> : <FavoriteBorderIcon />}
                </button>
                <Typography className="doctor-patient-detail__like-text">
                  {likeCount} Likes
                </Typography>
              </Stack>
            </Box>
          </Stack>

          <Button
            variant={followed ? "outlined" : "contained"}
            startIcon={followed ? <PersonRemoveIcon /> : <PersonAddIcon />}
            onClick={() => setFollowed((prev) => !prev)}
            className={followed ? "doctor-patient-detail__unfollow-btn" : "doctor-patient-detail__follow-btn"}
          >
            {followed ? "Unfollow" : "Follow"}
          </Button>
        </Box>

        <Box className="doctor-patient-detail__stats">
          <Box className="doctor-patient-detail__stat">
            <Typography className="doctor-patient-detail__stat-num">{followerCount}</Typography>
            <Typography className="doctor-patient-detail__stat-label">Followers</Typography>
          </Box>
          <Box className="doctor-patient-detail__divider" />
          <Box className="doctor-patient-detail__stat">
            <Typography className="doctor-patient-detail__stat-num">{patient.followings}</Typography>
            <Typography className="doctor-patient-detail__stat-label">Followings</Typography>
          </Box>
        </Box>

        <Box className="doctor-patient-detail__tabs-wrap">
          <Tabs
            value={tab}
            onChange={(_, value) => setTab(value)}
            className="doctor-patient-detail__tabs"
            TabIndicatorProps={{ className: "doctor-patient-detail__tab-indicator" }}
          >
            <Tab label="Articles" className="doctor-patient-detail__tab" />
            <Tab label="Reviews" className="doctor-patient-detail__tab" />
            <Tab label="Followers" className="doctor-patient-detail__tab" />
            <Tab label="Followings" className="doctor-patient-detail__tab" />
          </Tabs>
        </Box>

        <Box className="doctor-patient-detail__content">
          {tab === 0 && (
            <Stack spacing={1.5}>
              {patient.articles.map((article) => (
                <Box key={article.id} className="doctor-patient-detail__item-card">
                  <Typography className="doctor-patient-detail__item-title">{article.title}</Typography>
                  <Typography className="doctor-patient-detail__item-sub">
                    {new Date(article.createdAt).toLocaleDateString("en-US")}
                  </Typography>
                </Box>
              ))}
            </Stack>
          )}

          {tab === 1 && (
            <Stack spacing={1.5}>
              {patientReviews.map((review) => (
                <Box key={review.id} className="doctor-patient-detail__item-card">
                  <Typography className="doctor-patient-detail__item-title">
                    {review.author} - {review.rating}/5
                  </Typography>
                  <Typography className="doctor-patient-detail__item-sub">
                    {review.comment}
                  </Typography>
                  <Typography className="doctor-patient-detail__item-date">
                    {new Date(review.createdAt).toLocaleDateString("en-US")}
                  </Typography>
                </Box>
              ))}

              <Box className="doctor-patient-detail__review-form">
                <Typography className="doctor-patient-detail__item-title">
                  Write a Review
                </Typography>
                <TextField
                  multiline
                  minRows={3}
                  placeholder="Write your review..."
                  value={reviewText}
                  onChange={(event) => setReviewText(event.target.value)}
                  className="doctor-patient-detail__review-input"
                />
                <Button
                  variant="contained"
                  onClick={handleAddReview}
                  disabled={!reviewText.trim()}
                  className="doctor-patient-detail__review-submit"
                >
                  Submit Review
                </Button>
              </Box>
            </Stack>
          )}

          {tab === 2 && (
            <Stack spacing={1.5}>
              {patient.followerUsers.map((name, idx) => (
                <Box key={`${name}-${idx}`} className="doctor-patient-detail__item-card">
                  <Typography className="doctor-patient-detail__item-title">{name}</Typography>
                </Box>
              ))}
            </Stack>
          )}

          {tab === 3 && (
            <Stack spacing={1.5}>
              {patient.followingUsers.map((name, idx) => (
                <Box key={`${name}-${idx}`} className="doctor-patient-detail__item-card">
                  <Typography className="doctor-patient-detail__item-title">{name}</Typography>
                </Box>
              ))}
            </Stack>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default withLayoutDoctor(DoctorPatientDetail);
