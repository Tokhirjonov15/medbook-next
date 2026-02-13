import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import withLayoutMain from "@/libs/components/layout/LayoutMember";

const MyAppointmentDetail: NextPage = () => {
  const router = useRouter();
  const rawId = router.query.id;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId;

  return (
    <div id="mypage-page">
      <Stack className="mypage-container">
        <Box className="mypage-panel">
          <Typography className="mypage-section-title">Appointment Detail</Typography>
          <Box className="mypage-list-item">
            <Box>
              <Typography>
                Appointment ID: #{appointmentId || "N/A"}
              </Typography>
              <Typography className="mypage-list-subtitle">
                Detail page is ready for backend integration.
              </Typography>
            </Box>
          </Box>
        </Box>
      </Stack>
    </div>
  );
};

export default withLayoutMain(MyAppointmentDetail);
