import { Box, Stack } from "@mui/material";
import Link from "next/link";
import useMemberTranslation from "@/libs/hooks/useMemberTranslation";

const Footer = () => {
  const { t } = useMemberTranslation();

  return (
    <Stack className={"footer"}>
      <Stack className={"footer-main"}>
        <Stack className={"container"}>
          <Box component={"div"} className={"footer-brand"}>
            <Link href={"/"} className={"footer-brand-link"}>
              <img src="/img/logo.png" alt="MedBook" />
              <span className={"footer-logo-text"}>MedBook</span>
            </Link>
            <span className={"footer-tagline"}>{t("footer.tagline")}</span>
          </Box>
          <Box component={"div"} className={"footer-links"}>
            <Link href={"/"}>
              <div>{t("nav.home")}</div>
            </Link>
            <Link href={"/doctor"}>
              <div>{t("footer.doctors")}</div>
            </Link>
            <Link href={"/community?articleCategory=FREE"}>
              <div>{t("nav.community")}</div>
            </Link>
            <Link href={"/cs"}>
              <div>{t("nav.cs")}</div>
            </Link>
          </Box>
          <Box component={"div"} className={"footer-legal"}>
            <Link href={"/cs"}>
              <div>{t("footer.privacy")}</div>
            </Link>
            <Link href={"/cs"}>
              <div>{t("footer.terms")}</div>
            </Link>
          </Box>
        </Stack>
      </Stack>
      <Stack className={"footer-bottom"}>
        <Stack className={"container"}>
          <span className={"footer-copyright"}>
            {new Date().getFullYear()} MedBook. {t("footer.rights")}
          </span>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Footer;
