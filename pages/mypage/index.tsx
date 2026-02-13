import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import { Avatar, Box, Button, Stack, TextField, Typography } from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import withLayoutMain from "@/libs/components/layout/LayoutMember";

type MyPageCategory =
  | "personalInformation"
  | "followers"
  | "followings"
  | "myArticles"
  | "recentlyVisitedDoctor";

type PersonalInfo = {
  image: string;
  username: string;
  phone: string;
};

const categoryFromQuery = (value: string | string[] | undefined): MyPageCategory => {
  const one = Array.isArray(value) ? value[0] : value;
  if (
    one === "followers" ||
    one === "followings" ||
    one === "myArticles" ||
    one === "recentlyVisitedDoctor"
  ) {
    return one;
  }
  return "personalInformation";
};

const initialPersonalInfo: PersonalInfo = {
  image: "/img/defaultUser.svg",
  username: "Patient Alex",
  phone: "+1 (555) 998-1200",
};

const MyPage: NextPage = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [category, setCategory] = useState<MyPageCategory>("personalInformation");

  const [personalInfo, setPersonalInfo] = useState<PersonalInfo>(initialPersonalInfo);
  const [selectedFileName, setSelectedFileName] = useState("");

  const followers = [
    "Dr. Sarah Jenkins",
    "Emily Davis",
    "Michael Chen",
    "Nora White",
    "Lucas Perez",
  ];
  const followings = [
    "Heart Health Hub",
    "Daily Wellness",
    "Nutrition Lab",
    "Dr. Alex Johnson",
  ];
  const followersCount = followers.length;
  const followingsCount = followings.length;
  const myArticles = [
    { id: 1, title: "My Heart Health Progress Journal" },
    { id: 2, title: "How I Improved Sleep Quality" },
    { id: 3, title: "Questions About Blood Pressure Medication" },
  ];
  const recentlyVisitedDoctors = [
    { id: 1, name: "Dr. Sarah Jenkins", specialization: "Cardiologist" },
    { id: 2, name: "Dr. Michael Chen", specialization: "Dermatologist" },
    { id: 3, name: "Dr. Emily Roberts", specialization: "Neurologist" },
  ];

  useEffect(() => {
    if (!router.isReady) return;
    setCategory(categoryFromQuery(router.query.category));
  }, [router.isReady, router.query.category]);

  const hasPersonalChanges = useMemo(() => {
    return (
      personalInfo.image !== initialPersonalInfo.image ||
      personalInfo.username.trim() !== initialPersonalInfo.username ||
      personalInfo.phone.trim() !== initialPersonalInfo.phone
    );
  }, [personalInfo]);

  const updateCategory = (next: MyPageCategory) => {
    setCategory(next);
    if (next === "personalInformation") {
      router.push("/mypage", undefined, { shallow: true });
      return;
    }
    router.push(`/mypage?category=${next}`, undefined, { shallow: true });
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setSelectedFileName(file.name);
    const localUrl = URL.createObjectURL(file);
    setPersonalInfo((prev) => ({ ...prev, image: localUrl }));
  };

  return (
    <div id="mypage-page">
      <Stack className="mypage-container">
        <Box className="mypage-header">
          <Typography className="mypage-title">My Page</Typography>
          <Typography className="mypage-subtitle">
            Manage your personal profile and activity.
          </Typography>
        </Box>

        <Stack direction="row" className="mypage-tabs">
          <button
            className={`mypage-tab ${category === "personalInformation" ? "active" : ""}`}
            onClick={() => updateCategory("personalInformation")}
          >
            Personal Information
          </button>
          <button
            className={`mypage-tab ${category === "followers" ? "active" : ""}`}
            onClick={() => updateCategory("followers")}
          >
            Followers ({followersCount})
          </button>
          <button
            className={`mypage-tab ${category === "followings" ? "active" : ""}`}
            onClick={() => updateCategory("followings")}
          >
            Followings ({followingsCount})
          </button>
          <button
            className={`mypage-tab ${category === "myArticles" ? "active" : ""}`}
            onClick={() => updateCategory("myArticles")}
          >
            My Articles
          </button>
          <button
            className={`mypage-tab ${category === "recentlyVisitedDoctor" ? "active" : ""}`}
            onClick={() => updateCategory("recentlyVisitedDoctor")}
          >
            Recently Visited Doctor
          </button>
        </Stack>

        <Box className="mypage-panel">
          {category === "personalInformation" && (
            <Box className="mypage-section">
              <Typography className="mypage-section-title">Personal Information</Typography>

              <Stack direction="row" spacing={2.5} className="mypage-avatar-row">
                <Avatar src={personalInfo.image} className="mypage-avatar" />
                <Box className="mypage-upload-box">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    className="mypage-file-input"
                    onChange={handleImageUpload}
                  />
                  <Button
                    variant="outlined"
                    className="mypage-upload-btn"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    Upload Image
                  </Button>
                  <Typography className="mypage-upload-hint">
                    {selectedFileName || "No file selected"}
                  </Typography>
                </Box>
              </Stack>

              <Stack spacing={2} className="mypage-form">
                <TextField
                  fullWidth
                  label="Username"
                  value={personalInfo.username}
                  onChange={(event) =>
                    setPersonalInfo((prev) => ({ ...prev, username: event.target.value }))
                  }
                />
                <TextField
                  fullWidth
                  label="Phone Number"
                  value={personalInfo.phone}
                  onChange={(event) =>
                    setPersonalInfo((prev) => ({ ...prev, phone: event.target.value }))
                  }
                />
              </Stack>

              <Box className="mypage-actions">
                <Button
                  variant="contained"
                  className={`mypage-save-btn ${hasPersonalChanges ? "active" : ""}`}
                  disabled={!hasPersonalChanges}
                >
                  Save Changes
                </Button>
              </Box>
            </Box>
          )}

          {category === "followers" && (
            <Box className="mypage-section">
              <Typography className="mypage-section-title">
                Followers ({followersCount})
              </Typography>
              <Stack spacing={1.2}>
                {followers.map((name, index) => (
                  <Box key={`${name}-${index}`} className="mypage-list-item">
                    <Avatar src="/img/defaultUser.svg" />
                    <Typography>{name}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {category === "followings" && (
            <Box className="mypage-section">
              <Typography className="mypage-section-title">
                Followings ({followingsCount})
              </Typography>
              <Stack spacing={1.2}>
                {followings.map((name, index) => (
                  <Box key={`${name}-${index}`} className="mypage-list-item">
                    <Avatar src="/img/defaultUser.svg" />
                    <Typography>{name}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {category === "myArticles" && (
            <Box className="mypage-section">
              <Typography className="mypage-section-title">My Articles</Typography>
              <Stack spacing={1.2}>
                {myArticles.map((article) => (
                  <Box
                    key={article.id}
                    className="mypage-list-item clickable"
                    onClick={() => router.push(`/community/detail?id=${article.id}`)}
                  >
                    <Typography>{article.title}</Typography>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}

          {category === "recentlyVisitedDoctor" && (
            <Box className="mypage-section">
              <Typography className="mypage-section-title">Recently Visited Doctor</Typography>
              <Stack spacing={1.2}>
                {recentlyVisitedDoctors.map((doctor) => (
                  <Box
                    key={doctor.id}
                    className="mypage-list-item clickable"
                    onClick={() => router.push(`/doctor/detail?id=${doctor.id}`)}
                  >
                    <Avatar src="/img/defaultUser.svg" />
                    <Box>
                      <Typography>{doctor.name}</Typography>
                      <Typography className="mypage-list-subtitle">
                        {doctor.specialization}
                      </Typography>
                    </Box>
                  </Box>
                ))}
              </Stack>
            </Box>
          )}
        </Box>
      </Stack>
    </div>
  );
};

export default withLayoutMain(MyPage);
