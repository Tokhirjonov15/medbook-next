import { Box, Stack, Typography } from "@mui/material";
import SearchOutlinedIcon from "@mui/icons-material/SearchOutlined";
import EventAvailableOutlinedIcon from "@mui/icons-material/EventAvailableOutlined";
import MedicalServicesOutlinedIcon from "@mui/icons-material/MedicalServicesOutlined";
import LoginOutlinedIcon from "@mui/icons-material/LoginOutlined";

const STEPS = [
  {
    id: "01",
    title: "Sign Up & Login",
    desc: "Create your account first and log in to continue.",
    icon: <LoginOutlinedIcon />,
  },
  {
    id: "02",
    title: "Find Your Doctor",
    desc: "Search by specialization, location, and availability.",
    icon: <SearchOutlinedIcon />,
  },
  {
    id: "03",
    title: "Book Appointment",
    desc: "Choose a suitable time slot and confirm quickly.",
    icon: <EventAvailableOutlinedIcon />,
  },
  {
    id: "04",
    title: "Visit & Follow Up",
    desc: "Consult safely and track care in your dashboard.",
    icon: <MedicalServicesOutlinedIcon />,
  },
];

const HowItWorks = () => {
  return (
    <Stack className="how-it-works">
      <Box className="how-it-works-container">
        <Stack className="how-it-works-header">
          <Typography className="how-it-works-title">How It Works</Typography>
          <Typography className="how-it-works-subtitle">
            Book your care in three simple steps
          </Typography>
        </Stack>

        <Box className="how-it-works-grid">
          {STEPS.map((step) => (
            <Stack className="how-it-works-card" key={step.id}>
              <Box className="how-it-works-badge">{step.id}</Box>
              <Box className="how-it-works-icon">{step.icon}</Box>
              <Typography className="how-it-works-card-title">
                {step.title}
              </Typography>
              <Typography className="how-it-works-card-desc">
                {step.desc}
              </Typography>
            </Stack>
          ))}
        </Box>
      </Box>
    </Stack>
  );
};

export default HowItWorks;
