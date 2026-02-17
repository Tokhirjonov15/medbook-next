import { Box, Button, Stack, Typography } from "@mui/material";
import VerifiedUserOutlinedIcon from "@mui/icons-material/VerifiedUserOutlined";
import PaymentsOutlinedIcon from "@mui/icons-material/PaymentsOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import MarkUnreadChatAltOutlinedIcon from "@mui/icons-material/MarkUnreadChatAltOutlined";
import { useRouter } from "next/router";

const ITEMS = [
  {
    title: "Verified Doctors",
    desc: "All listed doctors pass profile and license checks.",
    icon: <VerifiedUserOutlinedIcon />,
  },
  {
    title: "Secure Payments",
    desc: "Appointments use protected and encrypted payment flow.",
    icon: <PaymentsOutlinedIcon />,
  },
  {
    title: "Private Data",
    desc: "Your health information is protected and access-controlled.",
    icon: <LockOutlinedIcon />,
  },
  {
    title: "Safe Communication",
    desc: "Doctor-patient interactions stay within secure channels.",
    icon: <MarkUnreadChatAltOutlinedIcon />,
  },
];

const TrustSecurity = () => {
  const router = useRouter();

  return (
    <Stack className="trust-security">
      <Box className="trust-security-container">
        <Stack className="trust-security-header">
          <Typography className="trust-security-title">Trust & Security</Typography>
          <Typography className="trust-security-subtitle">
            Your data, appointments, and communication are protected.
          </Typography>
        </Stack>

        <Box className="trust-security-grid">
          {ITEMS.map((item) => (
            <Stack className="trust-security-card" key={item.title}>
              <Box className="trust-security-icon">{item.icon}</Box>
              <Typography className="trust-security-card-title">{item.title}</Typography>
              <Typography className="trust-security-card-desc">{item.desc}</Typography>
            </Stack>
          ))}
        </Box>

        <Stack className="trust-security-footer">
          <Typography className="trust-security-note">
            Need help with account safety or suspicious activity?
          </Typography>
          <Button
            className="trust-security-btn"
            variant="outlined"
            onClick={() => router.push("/cs")}
          >
            Contact Support
          </Button>
        </Stack>
      </Box>
    </Stack>
  );
};

export default TrustSecurity;

