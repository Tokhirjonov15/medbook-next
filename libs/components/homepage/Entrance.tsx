import { Box, Stack } from "@mui/material";
import {
  CalendarMonth,
  AccessTime,
  Description,
  Medication,
} from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { sweetMixinErrorAlert } from "@/libs/sweetAlert";

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

  const handleBookAppointment = () => {
    router.push("/doctors");
  };

  const handleMyAppointments = () => {
    if (user) {
      router.push("/my-appointments");
    } else {
      sweetMixinErrorAlert("Please login first");
    }
  };

  const handleMedicalRecords = () => {
    if (user) {
      router.push("/medical-records");
    } else {
      sweetMixinErrorAlert("Please login first");
    }
  };

  const handlePrescriptions = () => {
    if (user) {
      router.push("/prescriptions");
    } else {
      sweetMixinErrorAlert("Please login first");
    }
  };

  return (
    <Box className="hero">
      <Stack className="hero-container">
        {/* Greeting Section */}
        <Box className="hero-greeting">
          <h1 className="hero-title">
            Hello{user ? `, ${user.name.split(" ")[0]}` : ""}!
          </h1>
          <p className="hero-subtitle">How can we help you today?</p>
        </Box>

        {/* Action Cards */}
        <Box className="hero-cards">
          <Box className="hero-card" onClick={handleBookAppointment}>
            <Box className="hero-card-icon hero-card-icon--blue">
              <CalendarMonth />
            </Box>
            <Box className="hero-card-content">
              <h3 className="hero-card-title">Book Appointment</h3>
              <p className="hero-card-description">Find a doctor near you</p>
            </Box>
          </Box>

          <Box className="hero-card" onClick={handleMyAppointments}>
            <Box className="hero-card-icon hero-card-icon--purple">
              <AccessTime />
            </Box>
            <Box className="hero-card-content">
              <h3 className="hero-card-title">My Appointments</h3>
              <p className="hero-card-description">Check schedule</p>
            </Box>
          </Box>

          <Box className="hero-card" onClick={handleMedicalRecords}>
            <Box className="hero-card-icon hero-card-icon--green">
              <Description />
            </Box>
            <Box className="hero-card-content">
              <h3 className="hero-card-title">Medical Records</h3>
              <p className="hero-card-description">History & Results</p>
            </Box>
          </Box>

          <Box className="hero-card" onClick={handlePrescriptions}>
            <Box className="hero-card-icon hero-card-icon--orange">
              <Medication />
            </Box>
            <Box className="hero-card-content">
              <h3 className="hero-card-title">Prescriptions</h3>
              <p className="hero-card-description">View active meds</p>
            </Box>
          </Box>
        </Box>
      </Stack>
    </Box>
  );
};

export default Entrance;
