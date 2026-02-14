import { GET_DOCTORS } from "@/apollo/user/query";
import Entrance from "@/libs/components/homepage/Entrance";
import Events from "@/libs/components/homepage/Events";
import BrowseBySpecialization from "@/libs/components/homepage/Filter";
import TopRatedDoctors from "@/libs/components/homepage/TopDoctors";
import withLayoutMain from "@/libs/components/layout/LayoutMember";
import useDeviceDetect from "@/libs/hooks/useDeviceDetect";
import { useQuery } from "@apollo/client";
import { Stack } from "@mui/material";
import { NextPage } from "next";

const Home: NextPage = () => {
  const device = useDeviceDetect();

  const {
    loading: getDoctorsLoading,
    data: getDoctorsData,
    error: getDoctorsError,
    refetch: getDoctorsRefetch,
  } = useQuery(GET_DOCTORS, {
    fetchPolicy: "cache-and-network",
    variables: {
      input: {
        page: 1,
        limit: 10,
        search: {},
      },
    },
  });
  console.log("getDoctorsData:", getDoctorsData);

  if (device === "mobile") {
    return (
      <Stack className={"home-page mobile"}>
        <Entrance />
        <BrowseBySpecialization />
        <TopRatedDoctors />
        <Events />
      </Stack>
    );
  } else {
    return (
      <Stack className={"home-page"}>
        <Entrance />
        <BrowseBySpecialization />
        <TopRatedDoctors />
        <Events />
      </Stack>
    );
  }
};

export default withLayoutMain(Home);
