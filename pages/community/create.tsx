import React from "react";
import { NextPage } from "next";
import dynamic from "next/dynamic";
import { Stack, Typography } from "@mui/material";
import withLayoutMain from "@/libs/components/layout/LayoutMember";
import useMemberTranslation from "@/libs/hooks/useMemberTranslation";

const TEditorComponent = dynamic(() => import("@/libs/components/community/Teditor"), {
  ssr: false,
});

const CommunityCreate: NextPage = () => {
  const { t } = useMemberTranslation();

  return (
    <div id="community-create-page">
      <Stack className="create-container">
        <Stack className="create-content">
          <Stack className="create-header">
            <Typography className="page-title">{t("community.create.title", "Write New Article")}</Typography>
            <Typography className="page-subtitle">
              {t("community.create.subtitle", "Share your knowledge and insights with the community")}
            </Typography>
          </Stack>

          <TEditorComponent />
        </Stack>
      </Stack>
    </div>
  );
};

export default withLayoutMain(CommunityCreate);
