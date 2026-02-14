import React from "react";
import { Box, Stack, Typography } from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import withLayoutMain from "@/libs/components/layout/LayoutMember";
import { useEffect } from "react";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { getJwtToken, updateUserInfo } from "@/libs/auth";

const MyAppointmentDetail: NextPage = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const rawId = router.query.id;
  const appointmentId = Array.isArray(rawId) ? rawId[0] : rawId;

  useEffect(() => {
    const token = getJwtToken();
    if (!user?._id && token) {
      updateUserInfo(token);
      return;
    }
    if (!token) {
      router.replace("/auth/login");
    }
  }, [router, user]);

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
