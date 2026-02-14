import { Stack } from "@mui/material";
import Head from "next/head";
import Top from "../Top";
import Footer from "../Footer";
import useDeviceDetect from "@/libs/hooks/useDeviceDetect";
import useMemberTranslation from "@/libs/hooks/useMemberTranslation";
import { useRouter } from "next/router";
import { useReactiveVar } from "@apollo/client";
import { userVar } from "@/apollo/store";
import { logOut } from "@/libs/auth";

const withLayoutMain = (Component: any) => {
  return (props: any) => {
    const device = useDeviceDetect();
    const isMobile = device === "mobile";
    const { t, locale } = useMemberTranslation();
    const router = useRouter();
    const user = useReactiveVar(userVar);
    const isLoggedIn = Boolean(user?._id);

    return (
      <>
        <Head>
          <title>{t("meta.title")}</title>
          <meta name={"title"} content={t("meta.title")} />
        </Head>
        <Stack id="pc-wrap" className={isMobile ? "member-mobile" : ""}>
          <Stack id={"top"}>
            <Top
              user={
                isLoggedIn
                  ? { name: user?.memberFullName || user?.memberNick || "User", image: user?.memberImage || "" }
                  : null
              }
              onLogin={() => router.push("/auth/login")}
              onSignup={() => router.push("/auth/signup")}
              onLogout={() => logOut()}
            />
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
