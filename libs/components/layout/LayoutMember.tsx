import { Stack } from "@mui/material";
import Head from "next/head";
import Top from "../Top";
import Footer from "../Footer";
import useDeviceDetect from "@/libs/hooks/useDeviceDetect";
import useMemberTranslation from "@/libs/hooks/useMemberTranslation";

const withLayoutMain = (Component: any) => {
  return (props: any) => {
    const device = useDeviceDetect();
    const isMobile = device === "mobile";
    const { t, locale } = useMemberTranslation();

    return (
      <>
        <Head>
          <title>{t("meta.title")}</title>
          <meta name={"title"} content={t("meta.title")} />
        </Head>
        <Stack id="pc-wrap" className={isMobile ? "member-mobile" : ""}>
          <Stack id={"top"}>
            <Top />
          </Stack>

          <Stack id={"main"}>
            <Component {...props} t={t} locale={locale} />
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
