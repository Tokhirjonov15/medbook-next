import withLayoutMain from "@/libs/components/layout/LayoutHome";
import { Stack } from "@mui/material";
import { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <Stack>
      <Stack flexDirection={"column"}>
        <Stack>
          <Stack className="container">Upcoming Appointments</Stack>
        </Stack>
        <Stack>
          <Stack className="container">Browse by Specialization</Stack>
        </Stack>
        <Stack>
          <Stack className="container">Top Rated Doctors</Stack>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default withLayoutMain(Home);
