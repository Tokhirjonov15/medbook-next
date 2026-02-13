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
import useMemberTranslation from "@/libs/hooks/useMemberTranslation";

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
  i18nKey?: string;
  doctorCount: number;
  icon: React.ReactNode;
  color: string;
}

const INITIAL_CARD_COUNT = 8;

const BrowseBySpecialization = () => {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const { t } = useMemberTranslation();

  const specializations: Specialization[] = [
    {
      type: DoctorSpecialization.GENERAL_PHYSICIAN,
      name: "General Physician",
      i18nKey: "specialization.generalPhysician",
      doctorCount: 124,
      icon: <LocalHospital />,
      color: "#3b82f6",
    },
    {
      type: DoctorSpecialization.DENTIST,
      name: "Dentist",
      i18nKey: "specialization.dentist",
      doctorCount: 86,
      icon: <MedicalServices />,
      color: "#06b6d4",
    },
    {
      type: DoctorSpecialization.CARDIOLOGIST,
      name: "Cardiologist",
      i18nKey: "specialization.cardiologist",
      doctorCount: 42,
      icon: <Favorite />,
      color: "#ef4444",
    },
    {
      type: DoctorSpecialization.PSYCHIATRIST,
      name: "Psychiatrist",
      i18nKey: "specialization.psychiatrist",
      doctorCount: 35,
      icon: <Psychology />,
      color: "#f59e0b",
    },
    {
      type: DoctorSpecialization.NEUROLOGIST,
      name: "Neurologist",
      i18nKey: "specialization.neurologist",
      doctorCount: 28,
      icon: <BubbleChart />,
      color: "#8b5cf6",
    },
    {
      type: DoctorSpecialization.DERMATOLOGIST,
      name: "Dermatologist",
      i18nKey: "specialization.dermatologist",
      doctorCount: 64,
      icon: <SentimentSatisfied />,
      color: "#ec4899",
    },
    {
      type: DoctorSpecialization.ORTHOPEDIC,
      name: "Orthopedist",
      i18nKey: "specialization.orthopedist",
      doctorCount: 31,
      icon: <Accessible />,
      color: "#14b8a6",
    },
    {
      type: DoctorSpecialization.PEDIATRICIAN,
      name: "Pediatrician",
      i18nKey: "specialization.pediatrician",
      doctorCount: 47,
      icon: <HealthAndSafety />,
      color: "#84cc16",
    },
    {
      type: DoctorSpecialization.ENT_SPECIALIST,
      name: "ENT Specialist",
      i18nKey: "specialization.entSpecialist",
      doctorCount: 22,
      icon: <Hearing />,
      color: "#06b6d4",
    },
    {
      type: DoctorSpecialization.GYNECOLOGIST,
      name: "Gynecologist",
      i18nKey: "specialization.gynecologist",
      doctorCount: 38,
      icon: <PregnantWoman />,
      color: "#ec4899",
    },
    {
      type: DoctorSpecialization.OPHTHALMOLOGIST,
      name: "Ophthalmologist",
      i18nKey: "specialization.ophthalmologist",
      doctorCount: 29,
      icon: <RemoveRedEye />,
      color: "#3b82f6",
    },
    {
      type: DoctorSpecialization.UROLOGIST,
      name: "Urologist",
      i18nKey: "specialization.urologist",
      doctorCount: 19,
      icon: <Spa />,
      color: "#8b5cf6",
    },
    {
      type: DoctorSpecialization.GASTROENTEROLOGIST,
      name: "Gastroenterologist",
      i18nKey: "specialization.gastroenterologist",
      doctorCount: 25,
      icon: <Restaurant />,
      color: "#f59e0b",
    },
    {
      type: DoctorSpecialization.PULMONOLOGIST,
      name: "Pulmonologist",
      i18nKey: "specialization.pulmonologist",
      doctorCount: 18,
      icon: <Air />,
      color: "#14b8a6",
    },
    {
      type: DoctorSpecialization.ENDOCRINOLOGIST,
      name: "Endocrinologist",
      i18nKey: "specialization.endocrinologist",
      doctorCount: 21,
      icon: <Biotech />,
      color: "#a855f7",
    },
    {
      type: DoctorSpecialization.ONCOLOGIST,
      name: "Oncologist",
      i18nKey: "specialization.oncologist",
      doctorCount: 16,
      icon: <LocalPharmacy />,
      color: "#ef4444",
    },
    {
      type: DoctorSpecialization.RADIOLOGIST,
      name: "Radiologist",
      i18nKey: "specialization.radiologist",
      doctorCount: 14,
      icon: <Radar />,
      color: "#06b6d4",
    },
    {
      type: DoctorSpecialization.ANESTHESIOLOGIST,
      name: "Anesthesiologist",
      i18nKey: "specialization.anesthesiologist",
      doctorCount: 12,
      icon: <Vaccines />,
      color: "#84cc16",
    },
    {
      type: DoctorSpecialization.PATHOLOGIST,
      name: "Pathologist",
      i18nKey: "specialization.pathologist",
      doctorCount: 10,
      icon: <Science />,
      color: "#8b5cf6",
    },
    {
      type: DoctorSpecialization.RHEUMATOLOGIST,
      name: "Rheumatologist",
      i18nKey: "specialization.rheumatologist",
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
            {t("home.browseBySpecialization")}
          </h2>
          {hasMore && !showAll && (
            <button
              className="browse-specialization-see-all"
              onClick={handleSeeAll}
            >
              {t("common.seeAll")}
            </button>
          )}
          {hasMore && showAll && (
            <button
              className="browse-specialization-see-all"
              onClick={handleShowLess}
            >
              {t("common.showLess")}
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
                <h3 className="specialization-card-title">{t(spec.i18nKey || "", spec.name)}</h3>
                <p className="specialization-card-count">
                  {spec.doctorCount} {t("common.doctors")}
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
                  <h3 className="specialization-card-title">{t(spec.i18nKey || "", spec.name)}</h3>
                  <p className="specialization-card-count">
                    {spec.doctorCount} {t("common.doctors")}
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
