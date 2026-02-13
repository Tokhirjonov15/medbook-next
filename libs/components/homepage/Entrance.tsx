import { Box, Stack } from "@mui/material";
import {
  CalendarMonth,
  AccessTime,
  Description,
  Medication,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { sweetMixinErrorAlert } from "@/libs/sweetAlert";
import useMemberTranslation from "@/libs/hooks/useMemberTranslation";

interface User {
  name: string;
  email: string;
  image?: string;
}

interface HeroProps {
  user?: User | null;
}

const Entrance = ({ user = null }: HeroProps) => {
  const router = useRouter();
  const { t } = useMemberTranslation();

  const handleBookAppointment = () => {
    router.push("/doctors");
  };

  const handleMyAppointments = () => {
    if (user) {
      router.push("/my-appointments");
    } else {
      sweetMixinErrorAlert(t("home.alert.loginFirst"));
    }
  };

  const handleMedicalRecords = () => {
    if (user) {
      router.push("/medical-records");
    } else {
      sweetMixinErrorAlert(t("home.alert.loginFirst"));
    }
  };

  const handlePrescriptions = () => {
    if (user) {
      router.push("/prescriptions");
    } else {
      sweetMixinErrorAlert(t("home.alert.loginFirst"));
    }
  };

  return (
    <Box className="hero">
      <Stack className="hero-container">
        {/* Greeting Section */}
        <Box className="hero-greeting">
          <h1 className="hero-title">
            {t("home.hello")}
            {user ? `, ${user.name.split(" ")[0]}` : ""}!
          </h1>
          <p className="hero-subtitle">{t("home.subtitle")}</p>
        </Box>

        {/* Action Cards */}
        <Box className="hero-cards">
          <Box className="hero-card" onClick={handleBookAppointment}>
            <Box className="hero-card-icon hero-card-icon--blue">
              <CalendarMonth />
            </Box>
            <Box className="hero-card-content">
              <h3 className="hero-card-title">{t("home.bookAppointment")}</h3>
              <p className="hero-card-description">{t("home.findDoctorNear")}</p>
            </Box>
          </Box>

          <Box className="hero-card" onClick={handleMyAppointments}>
            <Box className="hero-card-icon hero-card-icon--purple">
              <AccessTime />
            </Box>
            <Box className="hero-card-content">
              <h3 className="hero-card-title">{t("home.myAppointments")}</h3>
              <p className="hero-card-description">{t("home.checkSchedule")}</p>
            </Box>
          </Box>

          <Box className="hero-card" onClick={handleMedicalRecords}>
            <Box className="hero-card-icon hero-card-icon--green">
              <Description />
            </Box>
            <Box className="hero-card-content">
              <h3 className="hero-card-title">{t("home.medicalRecords")}</h3>
              <p className="hero-card-description">{t("home.historyResults")}</p>
            </Box>
          </Box>

          <Box className="hero-card" onClick={handlePrescriptions}>
            <Box className="hero-card-icon hero-card-icon--orange">
              <Medication />
            </Box>
            <Box className="hero-card-content">
              <h3 className="hero-card-title">{t("home.prescriptions")}</h3>
              <p className="hero-card-description">{t("home.viewActiveMeds")}</p>
            </Box>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default Entrance;
