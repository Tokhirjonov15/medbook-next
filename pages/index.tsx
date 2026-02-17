import Entrance from "@/libs/components/homepage/Entrance";
import Events from "@/libs/components/homepage/Events";
import HowItWorks from "@/libs/components/homepage/HowItWorks";
import BrowseBySpecialization from "@/libs/components/homepage/Filter";
import TopRatedDoctors from "@/libs/components/homepage/TopDoctors";
import HealthTips from "@/libs/components/homepage/HealthTips";
import TrustSecurity from "@/libs/components/homepage/TrustSecurity";
import withLayoutMain from "@/libs/components/layout/LayoutMember";
import useDeviceDetect from "@/libs/hooks/useDeviceDetect";
import { Stack } from "@mui/material";
import { NextPage } from "next";
import dynamic from "next/dynamic";

const PortalShowcase = dynamic(
  () => import("@/libs/components/homepage/PortalShowcase"),
  { ssr: false },
);

const Home: NextPage = () => {
  const device = useDeviceDetect();

  if (device === "mobile") {
    return (
      <Stack className={"home-page mobile"}>
        <Entrance />
        <HowItWorks />
        <PortalShowcase />
        <BrowseBySpecialization />
        <TopRatedDoctors />
        <HealthTips />
        <TrustSecurity />
        <Events />
      </Stack>
    );
  } else {
    return (
      <Stack className={"home-page"}>
        <Entrance />
        <HowItWorks />
        <PortalShowcase />
        <BrowseBySpecialization />
        <TopRatedDoctors />
        <HealthTips />
        <TrustSecurity />
        <Events />
      </Stack>
    );
  }
};

export default withLayoutMain(Home);


