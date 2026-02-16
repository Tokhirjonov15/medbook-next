import React from "react";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import { Stack, Typography } from "@mui/material";
import withLayoutDoctor from "@/libs/components/layout/LayoutDoctor";

const TEditorComponent = dynamic(
  () => import("@/libs/components/community/Teditor"),
  {
    ssr: false,
  },
);

const DoctorCommunityCreate: NextPage = () => {
  return (
    <div id="community-create-page">
      <Stack className="create-container">
        <Stack className="create-content">
          <Stack className="create-header">
            <Typography className="page-title">Write New Article</Typography>
            <Typography className="page-subtitle">
              Share your knowledge and insights with the community
            </Typography>
          </Stack>

          <TEditorComponent />
        </Stack>
      </Stack>
    </div>
  );
};

export default withLayoutDoctor(DoctorCommunityCreate);
