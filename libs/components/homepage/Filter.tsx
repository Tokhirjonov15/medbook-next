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
import { useRouter } from "next/router";
import { useQuery } from "@apollo/client";
import useMemberTranslation from "@/libs/hooks/useMemberTranslation";
import { GET_DOCTORS } from "@/apollo/user/query";
import { Specialization } from "@/libs/enums/specialization.enum";
import { Doctor } from "@/libs/types/doctors/doctor";
import { Direction } from "@/libs/enums/common.enum";

interface SpecializationCard {
  type: Specialization;
  name: string;
  i18nKey?: string;
  icon: React.ReactNode;
  color: string;
}

const INITIAL_CARD_COUNT = 8;

const normalizeSpecializationKey = (value: unknown): string =>
  String(value || "")
    .trim()
    .replace(/[-\s]+/g, "_")
    .toUpperCase();

const BrowseBySpecialization = () => {
  const router = useRouter();
  const [showAll, setShowAll] = useState(false);
  const { t } = useMemberTranslation();

  const specializations: SpecializationCard[] = [
    {
      type: Specialization.GENERAL_PHYSICIAN,
      name: "General Physician",
      i18nKey: "specialization.generalPhysician",
      icon: <LocalHospital />,
      color: "#3b82f6",
    },
    {
      type: Specialization.DENTIST,
      name: "Dentist",
      i18nKey: "specialization.dentist",
      icon: <MedicalServices />,
      color: "#06b6d4",
    },
    {
      type: Specialization.CARDIOLOGIST,
      name: "Cardiologist",
      i18nKey: "specialization.cardiologist",
      icon: <Favorite />,
      color: "#ef4444",
    },
    {
      type: Specialization.PSYCHIATRIST,
      name: "Psychiatrist",
      i18nKey: "specialization.psychiatrist",
      icon: <Psychology />,
      color: "#f59e0b",
    },
    {
      type: Specialization.NEUROLOGIST,
      name: "Neurologist",
      i18nKey: "specialization.neurologist",
      icon: <BubbleChart />,
      color: "#8b5cf6",
    },
    {
      type: Specialization.DERMATOLOGIST,
      name: "Dermatologist",
      i18nKey: "specialization.dermatologist",
      icon: <SentimentSatisfied />,
      color: "#ec4899",
    },
    {
      type: Specialization.ORTHOPEDIC,
      name: "Orthopedist",
      i18nKey: "specialization.orthopedist",
      icon: <Accessible />,
      color: "#14b8a6",
    },
    {
      type: Specialization.PEDIATRICIAN,
      name: "Pediatrician",
      i18nKey: "specialization.pediatrician",
      icon: <HealthAndSafety />,
      color: "#84cc16",
    },
    {
      type: Specialization.ENT_SPECIALIST,
      name: "ENT Specialist",
      i18nKey: "specialization.entSpecialist",
      icon: <Hearing />,
      color: "#06b6d4",
    },
    {
      type: Specialization.GYNECOLOGIST,
      name: "Gynecologist",
      i18nKey: "specialization.gynecologist",
      icon: <PregnantWoman />,
      color: "#ec4899",
    },
    {
      type: Specialization.OPHTHALMOLOGIST,
      name: "Ophthalmologist",
      i18nKey: "specialization.ophthalmologist",
      icon: <RemoveRedEye />,
      color: "#3b82f6",
    },
    {
      type: Specialization.UROLOGIST,
      name: "Urologist",
      i18nKey: "specialization.urologist",
      icon: <Spa />,
      color: "#8b5cf6",
    },
    {
      type: Specialization.GASTROENTEROLOGIST,
      name: "Gastroenterologist",
      i18nKey: "specialization.gastroenterologist",
      icon: <Restaurant />,
      color: "#f59e0b",
    },
    {
      type: Specialization.PULMONOLOGIST,
      name: "Pulmonologist",
      i18nKey: "specialization.pulmonologist",
      icon: <Air />,
      color: "#14b8a6",
    },
    {
      type: Specialization.ENDOCRINOLOGIST,
      name: "Endocrinologist",
      i18nKey: "specialization.endocrinologist",
      icon: <Biotech />,
      color: "#a855f7",
    },
    {
      type: Specialization.ONCOLOGIST,
      name: "Oncologist",
      i18nKey: "specialization.oncologist",
      icon: <LocalPharmacy />,
      color: "#ef4444",
    },
    {
      type: Specialization.RADIOLOGIST,
      name: "Radiologist",
      i18nKey: "specialization.radiologist",
      icon: <Radar />,
      color: "#06b6d4",
    },
    {
      type: Specialization.ANESTHESIOLOGIST,
      name: "Anesthesiologist",
      i18nKey: "specialization.anesthesiologist",
      icon: <Vaccines />,
      color: "#84cc16",
    },
    {
      type: Specialization.PATHOLOGIST,
      name: "Pathologist",
      i18nKey: "specialization.pathologist",
      icon: <Science />,
      color: "#8b5cf6",
    },
    {
      type: Specialization.RHEUMATOLOGIST,
      name: "Rheumatologist",
      i18nKey: "specialization.rheumatologist",
      icon: <MedicalServices />,
      color: "#f59e0b",
    },
  ];

  const {
    data: getSpecsData,
  } = useQuery(GET_DOCTORS, {
    fetchPolicy: "cache-and-network",
    variables: {
      input: {
        page: 1,
        limit: 1000,
        sort: "doctorViews",
        direction: Direction.DESC,
        search: {},
      },
    },
    notifyOnNetworkStatusChange: true,
  });

  const doctors: Doctor[] = getSpecsData?.getDoctors?.list ?? [];
  const doctorCountBySpecialization = doctors.reduce<Record<string, number>>(
    (acc, doctor) => {
      const specList = Array.isArray(doctor?.specialization)
        ? doctor.specialization
        : doctor?.specialization
          ? [doctor.specialization]
          : [];

      specList.forEach((spec) => {
        const key = normalizeSpecializationKey(spec);
        if (!key) return;
        acc[key] = (acc[key] ?? 0) + 1;
      });

      return acc;
    },
    {},
  );

  const initialSpecializations = specializations.slice(0, INITIAL_CARD_COUNT);
  const remainingSpecializations = specializations.slice(INITIAL_CARD_COUNT);
  const hasMore = remainingSpecializations.length > 0;

  const handleSpecializationClick = (type: Specialization) => {
    router.push(`/doctor?specialization=${type}`);
  };

  return (
    <Box className="browse-specialization">
      <Stack className="browse-specialization-container">
        <Box className="browse-specialization-header">
          <h2 className="browse-specialization-title">
            {t("home.browseBySpecialization")}
          </h2>
          {hasMore && !showAll && (
            <button
              className="browse-specialization-see-all"
              onClick={() => setShowAll(true)}
            >
              {t("common.seeAll")}
            </button>
          )}
          {hasMore && showAll && (
            <button
              className="browse-specialization-see-all"
              onClick={() => setShowAll(false)}
            >
              {t("common.showLess")}
            </button>
          )}
        </Box>

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
                <h3 className="specialization-card-title">
                  {t(spec.i18nKey || "", spec.name)}
                </h3>
                <p className="specialization-card-count">
                  {doctorCountBySpecialization[normalizeSpecializationKey(spec.type)] ?? 0}{" "}
                  {t("common.doctors")}
                </p>
              </Box>
            </Box>
          ))}
        </Box>

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
                  <h3 className="specialization-card-title">
                    {t(spec.i18nKey || "", spec.name)}
                  </h3>
                  <p className="specialization-card-count">
                    {doctorCountBySpecialization[normalizeSpecializationKey(spec.type)] ?? 0}{" "}
                    {t("common.doctors")}
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
