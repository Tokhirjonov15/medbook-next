import { Box, Stack } from "@mui/material";
import {
  LocalHospital,
  SentimentSatisfied,
  Favorite,
  Psychology,
  BubbleChart,
  Accessible,
  Hearing,
  MedicalServices,
  PregnantWoman,
  RemoveRedEye,
  Spa,
  Restaurant,
  Air,
  Biotech,
  LocalPharmacy,
  Radar,
  Vaccines,
  Science,
  HealthAndSafety,
} from "@mui/icons-material";
import { useState } from "react";
import { useRouter } from "next/navigation";

enum DoctorSpecialization {
  CARDIOLOGIST = "CARDIOLOGIST",
  DERMATOLOGIST = "DERMATOLOGIST",
  PEDIATRICIAN = "PEDIATRICIAN",
  PSYCHIATRIST = "PSYCHIATRIST",
  NEUROLOGIST = "NEUROLOGIST",
  ORTHOPEDIC = "ORTHOPEDIC",
  ENT_SPECIALIST = "ENT_SPECIALIST",
  GENERAL_PHYSICIAN = "GENERAL_PHYSICIAN",
  GYNECOLOGIST = "GYNECOLOGIST",
  DENTIST = "DENTIST",
  OPHTHALMOLOGIST = "OPHTHALMOLOGIST",
  UROLOGIST = "UROLOGIST",
  GASTROENTEROLOGIST = "GASTROENTEROLOGIST",
  PULMONOLOGIST = "PULMONOLOGIST",
  ENDOCRINOLOGIST = "ENDOCRINOLOGIST",
  ONCOLOGIST = "ONCOLOGIST",
  RADIOLOGIST = "RADIOLOGIST",
  ANESTHESIOLOGIST = "ANESTHESIOLOGIST",
  PATHOLOGIST = "PATHOLOGIST",
  RHEUMATOLOGIST = "RHEUMATOLOGIST",
}

interface Specialization {
  type: DoctorSpecialization;
  name: string;
  doctorCount: number;
  icon: React.ReactNode;
  color: string;
}

const INITIAL_CARD_COUNT = 8;

const BrowseBySpecialization = () => {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);

  const specializations: Specialization[] = [
    {
      type: DoctorSpecialization.GENERAL_PHYSICIAN,
      name: "General Physician",
      doctorCount: 124,
      icon: <LocalHospital />,
      color: "#3b82f6",
    },
    {
      type: DoctorSpecialization.DENTIST,
      name: "Dentist",
      doctorCount: 86,
      icon: <MedicalServices />,
      color: "#06b6d4",
    },
    {
      type: DoctorSpecialization.CARDIOLOGIST,
      name: "Cardiologist",
      doctorCount: 42,
      icon: <Favorite />,
      color: "#ef4444",
    },
    {
      type: DoctorSpecialization.PSYCHIATRIST,
      name: "Psychiatrist",
      doctorCount: 35,
      icon: <Psychology />,
      color: "#f59e0b",
    },
    {
      type: DoctorSpecialization.NEUROLOGIST,
      name: "Neurologist",
      doctorCount: 28,
      icon: <BubbleChart />,
      color: "#8b5cf6",
    },
    {
      type: DoctorSpecialization.DERMATOLOGIST,
      name: "Dermatologist",
      doctorCount: 64,
      icon: <SentimentSatisfied />,
      color: "#ec4899",
    },
    {
      type: DoctorSpecialization.ORTHOPEDIC,
      name: "Orthopedist",
      doctorCount: 31,
      icon: <Accessible />,
      color: "#14b8a6",
    },
    {
      type: DoctorSpecialization.PEDIATRICIAN,
      name: "Pediatrician",
      doctorCount: 47,
      icon: <HealthAndSafety />,
      color: "#84cc16",
    },
    {
      type: DoctorSpecialization.ENT_SPECIALIST,
      name: "ENT Specialist",
      doctorCount: 22,
      icon: <Hearing />,
      color: "#06b6d4",
    },
    {
      type: DoctorSpecialization.GYNECOLOGIST,
      name: "Gynecologist",
      doctorCount: 38,
      icon: <PregnantWoman />,
      color: "#ec4899",
    },
    {
      type: DoctorSpecialization.OPHTHALMOLOGIST,
      name: "Ophthalmologist",
      doctorCount: 29,
      icon: <RemoveRedEye />,
      color: "#3b82f6",
    },
    {
      type: DoctorSpecialization.UROLOGIST,
      name: "Urologist",
      doctorCount: 19,
      icon: <Spa />,
      color: "#8b5cf6",
    },
    {
      type: DoctorSpecialization.GASTROENTEROLOGIST,
      name: "Gastroenterologist",
      doctorCount: 25,
      icon: <Restaurant />,
      color: "#f59e0b",
    },
    {
      type: DoctorSpecialization.PULMONOLOGIST,
      name: "Pulmonologist",
      doctorCount: 18,
      icon: <Air />,
      color: "#14b8a6",
    },
    {
      type: DoctorSpecialization.ENDOCRINOLOGIST,
      name: "Endocrinologist",
      doctorCount: 21,
      icon: <Biotech />,
      color: "#a855f7",
    },
    {
      type: DoctorSpecialization.ONCOLOGIST,
      name: "Oncologist",
      doctorCount: 16,
      icon: <LocalPharmacy />,
      color: "#ef4444",
    },
    {
      type: DoctorSpecialization.RADIOLOGIST,
      name: "Radiologist",
      doctorCount: 14,
      icon: <Radar />,
      color: "#06b6d4",
    },
    {
      type: DoctorSpecialization.ANESTHESIOLOGIST,
      name: "Anesthesiologist",
      doctorCount: 12,
      icon: <Vaccines />,
      color: "#84cc16",
    },
    {
      type: DoctorSpecialization.PATHOLOGIST,
      name: "Pathologist",
      doctorCount: 10,
      icon: <Science />,
      color: "#8b5cf6",
    },
    {
      type: DoctorSpecialization.RHEUMATOLOGIST,
      name: "Rheumatologist",
      doctorCount: 9,
      icon: <MedicalServices />,
      color: "#f59e0b",
    },
  ];

  const initialSpecializations = specializations.slice(0, INITIAL_CARD_COUNT);
  const remainingSpecializations = specializations.slice(INITIAL_CARD_COUNT);
  const hasMore = remainingSpecializations.length > 0;

  const handleSpecializationClick = (type: DoctorSpecialization) => {
    router.push(`/doctors?specialization=${type}`);
  };

  const handleSeeAll = () => {
    setShowAll(true);
  };

  const handleShowLess = () => {
    setShowAll(false);
  };

  return (
    <Box className="browse-specialization">
      <Stack className="browse-specialization-container">
        {/* Header */}
        <Box className="browse-specialization-header">
          <h2 className="browse-specialization-title">
            Browse by Specialization
          </h2>
          {hasMore && !showAll && (
            <button
              className="browse-specialization-see-all"
              onClick={handleSeeAll}
            >
              See all
            </button>
          )}
          {hasMore && showAll && (
            <button
              className="browse-specialization-see-all"
              onClick={handleShowLess}
            >
              Show less
            </button>
          )}
        </Box>

        {/* Specialization Cards: first 8 */}
        <Box className="browse-specialization-grid">
          {initialSpecializations.map((spec) => (
            <Box
              key={spec.type}
              className="specialization-card"
              onClick={() => handleSpecializationClick(spec.type)}
            >
              <Box
                className="specialization-card-icon"
                sx={{ backgroundColor: `${spec.color}15` }}
              >
                <Box sx={{ color: spec.color }}>{spec.icon}</Box>
              </Box>
              <Box className="specialization-card-content">
                <h3 className="specialization-card-title">{spec.name}</h3>
                <p className="specialization-card-count">
                  {spec.doctorCount} Doctors
                </p>
              </Box>
            </Box>
          ))}
        </Box>

        {/* Remaining cards below when "See all" is clicked */}
        {showAll && remainingSpecializations.length > 0 && (
          <Box className="browse-specialization-grid">
            {remainingSpecializations.map((spec) => (
              <Box
                key={spec.type}
                className="specialization-card"
                onClick={() => handleSpecializationClick(spec.type)}
              >
                <Box
                  className="specialization-card-icon"
                  sx={{ backgroundColor: `${spec.color}15` }}
                >
                  <Box sx={{ color: spec.color }}>{spec.icon}</Box>
                </Box>
                <Box className="specialization-card-content">
                  <h3 className="specialization-card-title">{spec.name}</h3>
                  <p className="specialization-card-count">
                    {spec.doctorCount} Doctors
                  </p>
                </Box>
              </Box>
            ))}
          </Box>
        )}
      </Stack>
    </Box>
  );
};

export default BrowseBySpecialization;
