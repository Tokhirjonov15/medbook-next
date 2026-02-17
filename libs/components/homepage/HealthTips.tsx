import { Box, Stack, Typography } from "@mui/material";
import OpacityOutlinedIcon from "@mui/icons-material/OpacityOutlined";
import BedtimeOutlinedIcon from "@mui/icons-material/BedtimeOutlined";
import DirectionsWalkOutlinedIcon from "@mui/icons-material/DirectionsWalkOutlined";
import RestaurantOutlinedIcon from "@mui/icons-material/RestaurantOutlined";
import SelfImprovementOutlinedIcon from "@mui/icons-material/SelfImprovementOutlined";
import MedicationOutlinedIcon from "@mui/icons-material/MedicationOutlined";

const TIPS = [
  {
    title: "Stay Hydrated",
    desc: "Drink enough water daily to reduce fatigue and headaches.",
    icon: <OpacityOutlinedIcon />,
  },
  {
    title: "Sleep Routine",
    desc: "Sleep and wake at consistent times for better recovery.",
    icon: <BedtimeOutlinedIcon />,
  },
  {
    title: "Move Daily",
    desc: "20-30 minutes of walking improves heart and mood health.",
    icon: <DirectionsWalkOutlinedIcon />,
  },
  {
    title: "Balanced Plate",
    desc: "Add vegetables, protein, and whole grains in each meal.",
    icon: <RestaurantOutlinedIcon />,
  },
  {
    title: "Stress Check",
    desc: "Use short breathing exercises when stress rises.",
    icon: <SelfImprovementOutlinedIcon />,
  },
  {
    title: "Medication Safety",
    desc: "Take medicines only as prescribed and avoid overuse.",
    icon: <MedicationOutlinedIcon />,
  },
];

const HealthTips = () => {
  return (
    <Stack className="health-tips">
      <Box className="health-tips-container">
        <Stack className="health-tips-header">
          <Typography className="health-tips-title">Health Tips</Typography>
          <Typography className="health-tips-subtitle">
            Everyday habits for a healthier life
          </Typography>
        </Stack>
        <Box className="health-tips-grid">
          {TIPS.map((tip) => (
            <Stack className="health-tip-card" key={tip.title}>
              <Box className="health-tip-icon">{tip.icon}</Box>
              <Typography className="health-tip-title">{tip.title}</Typography>
              <Typography className="health-tip-desc">{tip.desc}</Typography>
            </Stack>
          ))}
        </Box>
      </Box>
    </Stack>
  );
};

export default HealthTips;

