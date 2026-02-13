import { Stack } from "@mui/material";
import Head from "next/head";
import Top from "../Top";
import Footer from "../Footer";
import useDeviceDetect from "@/libs/hooks/useDeviceDetect";

const withLayoutMain = (Component: any) => {
  return (props: any) => {
    const device = useDeviceDetect();
    const isMobile = device === "mobile";

    return (
      <>
        <Head>
          <title>Medbook</title>
          <meta name={"title"} content={`Medbook`} />
        </Head>
        <Stack id="pc-wrap" className={isMobile ? "member-mobile" : ""}>
          <Stack id={"top"}>
            <Top />
          </Stack>

          <Stack id={"main"}>
            <Component {...props} />
          </Stack>

          <Stack id={"footer"}>
            <Footer />
          </Stack>
        </Stack>
      </>
    );
  };
};

export default withLayoutMain;
