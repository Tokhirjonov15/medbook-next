import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import withLayoutDoctor from "@/libs/components/layout/LayoutDoctor";

type MyPageTab =
  | "profile"
  | "schedule"
  | "clinic"
  | "followers"
  | "followings"
  | "articles";

const tabFromQuery = (value: string | string[] | undefined): MyPageTab => {
  const one = Array.isArray(value) ? value[0] : value;
  if (
    one === "schedule" ||
    one === "clinic" ||
    one === "followers" ||
    one === "followings" ||
    one === "articles"
  ) {
    return one;
  }
  return "profile";
};

type WorkDay = {
  key: string;
  label: string;
  enabled: boolean;
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
};

const allLanguages = [
  "English",
  "Spanish",
  "French",
  "German",
  "Korean",
  "Russian",
];

const allSpecializations = [
  "Cardiology",
  "Dermatology",
  "Neurology",
  "Pediatrics",
  "Orthopedics",
  "Psychiatry",
];

const timeOptions = [
  "08:00 AM",
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
  "06:00 PM",
];

const INITIAL_PROFILE = {
  image: "/img/defaultUser.svg",
  fullName: "Dr. Alex Johnson",
  phone: "+1 (555) 123-9876",
  description:
    "Senior Cardiologist with 12+ years of experience focused on preventive heart care.",
};

const INITIAL_LANGUAGE_SELECTIONS = ["English", "Spanish"];
const INITIAL_SPECIALIZATION_SELECTIONS = ["Cardiology", "Neurology"];

const DoctorMyPage: NextPage = () => {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<MyPageTab>("profile");
  const [acceptingAppointments, setAcceptingAppointments] = useState(true);

  const [profile, setProfile] = useState(INITIAL_PROFILE);
  const [imageFileName, setImageFileName] = useState<string>("");
  const [languageSelections, setLanguageSelections] = useState<string[]>(
    INITIAL_LANGUAGE_SELECTIONS,
  );
  const [specializationSelections, setSpecializationSelections] = useState<
    string[]
  >(INITIAL_SPECIALIZATION_SELECTIONS);

  const [clinic, setClinic] = useState({
    city: "New York",
    address: "123 Medical Center, NY 10001",
  });

  const [weeklyHours, setWeeklyHours] = useState<WorkDay[]>([
    {
      key: "mon",
      label: "Monday",
      enabled: true,
      morningStart: "09:00 AM",
      morningEnd: "12:00 PM",
      afternoonStart: "01:00 PM",
      afternoonEnd: "05:00 PM",
    },
    {
      key: "tue",
      label: "Tuesday",
      enabled: true,
      morningStart: "09:00 AM",
      morningEnd: "12:00 PM",
      afternoonStart: "01:00 PM",
      afternoonEnd: "05:00 PM",
    },
    {
      key: "wed",
      label: "Wednesday",
      enabled: true,
      morningStart: "09:00 AM",
      morningEnd: "12:00 PM",
      afternoonStart: "01:00 PM",
      afternoonEnd: "05:00 PM",
    },
    {
      key: "thu",
      label: "Thursday",
      enabled: true,
      morningStart: "09:00 AM",
      morningEnd: "12:00 PM",
      afternoonStart: "01:00 PM",
      afternoonEnd: "05:00 PM",
    },
    {
      key: "fri",
      label: "Friday",
      enabled: true,
      morningStart: "09:00 AM",
      morningEnd: "12:00 PM",
      afternoonStart: "01:00 PM",
      afternoonEnd: "03:00 PM",
    },
    {
      key: "sat",
      label: "Saturday",
      enabled: false,
      morningStart: "09:00 AM",
      morningEnd: "12:00 PM",
      afternoonStart: "01:00 PM",
      afternoonEnd: "03:00 PM",
    },
    {
      key: "sun",
      label: "Sunday",
      enabled: false,
      morningStart: "09:00 AM",
      morningEnd: "12:00 PM",
      afternoonStart: "01:00 PM",
      afternoonEnd: "03:00 PM",
    },
  ]);

  const followers = [
    "Sarah Jenkins",
    "Michael Chen",
    "Emily Davis",
    "David Wilson",
    "Jessica Garcia",
  ];
  const followings = [
    "Cardio Community",
    "Health Daily",
    "Med Research Hub",
    "Neurology Updates",
  ];
  const myArticles = [
    { id: 1, title: "Top 10 Heart Health Tips for 2026" },
    { id: 2, title: "How to Reduce Blood Pressure Naturally" },
    { id: 3, title: "Latest Trends in Cardiac Diagnostics" },
  ];
  const followersCount = followers.length;
  const followingsCount = followings.length;

  useEffect(() => {
    if (!router.isReady) return;
    setActiveTab(tabFromQuery(router.query.category));
  }, [router.isReady, router.query.category]);

  const hasProfileChanges = useMemo(() => {
    const sameProfile =
      profile.image === INITIAL_PROFILE.image &&
      profile.fullName.trim() === INITIAL_PROFILE.fullName &&
      profile.phone.trim() === INITIAL_PROFILE.phone &&
      profile.description.trim() === INITIAL_PROFILE.description;

    const sameLanguages =
      [...languageSelections].sort().join("|") ===
      [...INITIAL_LANGUAGE_SELECTIONS].sort().join("|");
    const sameSpecializations =
      [...specializationSelections].sort().join("|") ===
      [...INITIAL_SPECIALIZATION_SELECTIONS].sort().join("|");

    return !(sameProfile && sameLanguages && sameSpecializations);
  }, [profile, languageSelections, specializationSelections]);

  const toggleSelection = (
    item: string,
    values: string[],
    setter: (next: string[]) => void,
  ) => {
    if (values.includes(item)) {
      setter(values.filter((value) => value !== item));
      return;
    }
    setter([...values, item]);
  };

  const updateWorkDay = (key: string, patch: Partial<WorkDay>) => {
    setWeeklyHours((prev) =>
      prev.map((day) => (day.key === key ? { ...day, ...patch } : day)),
    );
  };

  const handleImageUpload = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    const localUrl = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, image: localUrl }));
    setImageFileName(file.name);
  };

  const updateTab = (next: MyPageTab) => {
    setActiveTab(next);
    if (next === "profile") {
      router.push("/_doctor/mypage", undefined, { shallow: true });
      return;
    }
    router.push(`/_doctor/mypage?category=${next}`, undefined, { shallow: true });
  };

  return (
    <Box className="doctor-mypage">
      <Box className="doctor-mypage__header">
        <Typography className="doctor-mypage__title">Doctor Settings</Typography>
        <Typography className="doctor-mypage__subtitle">
          Manage your profile, schedule, clinic details, and social stats.
        </Typography>
      </Box>

      <Stack direction="row" className="doctor-mypage__tabs">
        <button
          className={`doctor-mypage__tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => updateTab("profile")}
        >
          Profile Information
        </button>
        <button
          className={`doctor-mypage__tab ${activeTab === "schedule" ? "active" : ""}`}
          onClick={() => updateTab("schedule")}
        >
          Schedule & Availability
        </button>
        <button
          className={`doctor-mypage__tab ${activeTab === "clinic" ? "active" : ""}`}
          onClick={() => updateTab("clinic")}
        >
          Clinic Details
        </button>
        <button
          className={`doctor-mypage__tab ${activeTab === "followers" ? "active" : ""}`}
          onClick={() => updateTab("followers")}
        >
          Followers ({followersCount})
        </button>
        <button
          className={`doctor-mypage__tab ${activeTab === "followings" ? "active" : ""}`}
          onClick={() => updateTab("followings")}
        >
          Followings ({followingsCount})
        </button>
        <button
          className={`doctor-mypage__tab ${activeTab === "articles" ? "active" : ""}`}
          onClick={() => updateTab("articles")}
        >
          My Articles
        </button>
      </Stack>

      <Box className="doctor-mypage__panel">
        {activeTab === "profile" && (
          <Box className="doctor-mypage__section">
            <Typography className="doctor-mypage__section-title">
              Profile Information
            </Typography>

            <Stack direction="row" spacing={2.5} className="doctor-mypage__avatar-row">
              <Avatar src={profile.image} className="doctor-mypage__avatar" />
              <Box className="doctor-mypage__upload-box">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="doctor-mypage__file-input"
                  onChange={handleImageUpload}
                />
                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  className="doctor-mypage__upload-btn"
                >
                  Upload Image
                </Button>
                <Typography className="doctor-mypage__upload-hint">
                  {imageFileName || "No file selected"}
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={2} className="doctor-mypage__form">
              <TextField
                fullWidth
                label="Full Name"
                value={profile.fullName}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, fullName: event.target.value }))
                }
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={profile.phone}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Description"
                value={profile.description}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </Stack>

            <Box className="doctor-mypage__checkbox-group">
              <Typography className="doctor-mypage__group-title">Languages</Typography>
              <Box className="doctor-mypage__checkbox-grid">
                {allLanguages.map((language) => (
                  <label key={language} className="doctor-mypage__checkbox-item">
                    <input
                      type="checkbox"
                      checked={languageSelections.includes(language)}
                      onChange={() =>
                        toggleSelection(
                          language,
                          languageSelections,
                          setLanguageSelections,
                        )
                      }
                    />
                    <span>{language}</span>
                  </label>
                ))}
              </Box>
            </Box>

            <Box className="doctor-mypage__checkbox-group">
              <Typography className="doctor-mypage__group-title">
                Specializations
              </Typography>
              <Box className="doctor-mypage__checkbox-grid">
                {allSpecializations.map((specialization) => (
                  <label key={specialization} className="doctor-mypage__checkbox-item">
                    <input
                      type="checkbox"
                      checked={specializationSelections.includes(specialization)}
                      onChange={() =>
                        toggleSelection(
                          specialization,
                          specializationSelections,
                          setSpecializationSelections,
                        )
                      }
                    />
                    <span>{specialization}</span>
                  </label>
                ))}
              </Box>
            </Box>

            <Box className="doctor-mypage__actions">
              <Button
                variant="contained"
                className={`doctor-mypage__save-btn ${hasProfileChanges ? "active" : ""}`}
                disabled={!hasProfileChanges}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === "schedule" && (
          <Box className="doctor-mypage__section">
            <Typography className="doctor-mypage__section-title">
              Schedule & Availability
            </Typography>

            <Box className="doctor-mypage__appointments-toggle">
              <Stack>
                <Typography className="doctor-mypage__toggle-title">
                  Accepting New Appointments
                </Typography>
                <Typography className="doctor-mypage__toggle-subtitle">
                  Turn this off to temporarily hide your profile from search results.
                </Typography>
              </Stack>
              <Switch
                checked={acceptingAppointments}
                onChange={(event) => setAcceptingAppointments(event.target.checked)}
              />
            </Box>

            <Stack spacing={1.2} className="doctor-mypage__weekly-hours">
              {weeklyHours.map((day) => (
                <Box key={day.key} className={`doctor-mypage__day-row ${day.enabled ? "" : "disabled"}`}>
                  <Box className="doctor-mypage__day-name">{day.label}</Box>
                  <TextField
                    select
                    size="small"
                    value={day.morningStart}
                    onChange={(event) =>
                      updateWorkDay(day.key, { morningStart: event.target.value })
                    }
                    disabled={!day.enabled}
                    className="doctor-mypage__time-select"
                  >
                    {timeOptions.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    value={day.morningEnd}
                    onChange={(event) =>
                      updateWorkDay(day.key, { morningEnd: event.target.value })
                    }
                    disabled={!day.enabled}
                    className="doctor-mypage__time-select"
                  >
                    {timeOptions.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    value={day.afternoonStart}
                    onChange={(event) =>
                      updateWorkDay(day.key, { afternoonStart: event.target.value })
                    }
                    disabled={!day.enabled}
                    className="doctor-mypage__time-select"
                  >
                    {timeOptions.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    value={day.afternoonEnd}
                    onChange={(event) =>
                      updateWorkDay(day.key, { afternoonEnd: event.target.value })
                    }
                    disabled={!day.enabled}
                    className="doctor-mypage__time-select"
                  >
                    {timeOptions.map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Switch
                    checked={day.enabled}
                    onChange={(event) =>
                      updateWorkDay(day.key, { enabled: event.target.checked })
                    }
                  />
                </Box>
              ))}
            </Stack>

            <Box className="doctor-mypage__actions">
              <Button variant="contained" className="doctor-mypage__save-btn">
                Save Changes
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === "clinic" && (
          <Box className="doctor-mypage__section">
            <Typography className="doctor-mypage__section-title">
              Clinic Details
            </Typography>

            <Stack spacing={2} className="doctor-mypage__form">
              <TextField
                fullWidth
                label="City"
                value={clinic.city}
                onChange={(event) =>
                  setClinic((prev) => ({ ...prev, city: event.target.value }))
                }
              />
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Clinic Address"
                value={clinic.address}
                onChange={(event) =>
                  setClinic((prev) => ({ ...prev, address: event.target.value }))
                }
              />
            </Stack>

            <Box className="doctor-mypage__actions">
              <Button variant="contained" className="doctor-mypage__save-btn">
                Save Changes
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === "followers" && (
          <Box className="doctor-mypage__section">
            <Typography className="doctor-mypage__section-title">
              Followers ({followersCount})
            </Typography>
            <Stack spacing={1.2}>
              {followers.map((name, idx) => (
                <Box key={`${name}-${idx}`} className="doctor-mypage__list-item">
                  <Avatar src="/img/defaultUser.svg" />
                  <Typography>{name}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {activeTab === "followings" && (
          <Box className="doctor-mypage__section">
            <Typography className="doctor-mypage__section-title">
              Followings ({followingsCount})
            </Typography>
            <Stack spacing={1.2}>
              {followings.map((name, idx) => (
                <Box key={`${name}-${idx}`} className="doctor-mypage__list-item">
                  <Avatar src="/img/defaultUser.svg" />
                  <Typography>{name}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}

        {activeTab === "articles" && (
          <Box className="doctor-mypage__section">
            <Typography className="doctor-mypage__section-title">My Articles</Typography>
            <Stack spacing={1.2}>
              {myArticles.map((article) => (
                <Box
                  key={article.id}
                  className="doctor-mypage__list-item article clickable"
                  onClick={() =>
                    router.push(`/_doctor/community/detail?id=${article.id}`)
                  }
                >
                  <Typography>{article.title}</Typography>
                </Box>
              ))}
            </Stack>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default withLayoutDoctor(DoctorMyPage);
