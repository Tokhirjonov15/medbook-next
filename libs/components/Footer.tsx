import { Box, Stack } from "@mui/material";
import Link from "next/link";
import useMemberTranslation from "@/libs/hooks/useMemberTranslation";
import FacebookRoundedIcon from "@mui/icons-material/FacebookRounded";
import InstagramIcon from "@mui/icons-material/Instagram";
import YouTubeIcon from "@mui/icons-material/YouTube";
import LinkedInIcon from "@mui/icons-material/LinkedIn";
import AppleIcon from "@mui/icons-material/Apple";
import AndroidIcon from "@mui/icons-material/Android";

const Footer = () => {
  const { t } = useMemberTranslation();

  return (
    <Stack className={"footer"}>
      <Stack className={"footer-trust-strip"}>
        <Stack className={"container"}>
          <span>Verified Doctors</span>
          <span>Secure Payments</span>
          <span>Privacy Protected</span>
        </Stack>
      </Stack>
      <Stack className={"footer-main"}>
        <Stack className={"container"}>
          <Box component={"div"} className={"footer-columns"}>
            <Box className={"footer-column"}>
              <strong>Explore</strong>
              <Link href={"/"}>{t("nav.home")}</Link>
              <Link href={"/doctor"}>{t("footer.doctors")}</Link>
              <Link href={"/community?articleCategory=FREE"}>{t("nav.community")}</Link>
              <Link href={"/cs"}>{t("nav.cs")}</Link>
            </Box>

            <Box className={"footer-column"}>
              <strong>For Patients</strong>
              <Link href={"/doctor"}>Find Doctors</Link>
              <Link href={"/mypage?category=myAppointments"}>My Appointments</Link>
              <Link href={"/mypage?category=medicalRecords"}>Medical Records</Link>
            </Box>

            <Box className={"footer-column"}>
              <strong>{t("footer.terms")}</strong>
              <Link href={"/cs"}>{t("footer.privacy")}</Link>
              <Link href={"/cs"}>{t("footer.terms")}</Link>
              <Link href={"/cs"}>Support</Link>
            </Box>
          </Box>

          <Box component={"div"} className={"footer-contact"}>
            <strong>Contact</strong>
            <span>help@medbook.com</span>
            <span>+82 10-0000-0000</span>
          </Box>

          <Box component={"div"} className={"footer-brand right"}>
            <Link href={"/"} className={"footer-brand-link"}>
              <span className={"footer-logo-text"}>MedBook</span>
              <img src="/img/logo.png" alt="MedBook" className={"footer-logo-image"} />
            </Link>
            <span className={"footer-tagline"}>{t("footer.tagline")}</span>
            <span className={"footer-brand-desc"}>
              Book trusted doctors, manage appointments, and keep your health records in one secure place.
            </span>
          </Box>
        </Stack>
      </Stack>
      <Stack className={"footer-bottom"}>
        <Stack className={"container"}>
          <Box className={"footer-socials"}>
            <button type="button" aria-label="facebook">
              <FacebookRoundedIcon />
            </button>
            <button type="button" aria-label="instagram">
              <InstagramIcon />
            </button>
            <button type="button" aria-label="youtube">
              <YouTubeIcon />
            </button>
            <button type="button" aria-label="linkedin">
              <LinkedInIcon />
            </button>
          </Box>

          <span className={"footer-copyright"}>
            {new Date().getFullYear()} MedBook. {t("footer.rights")}
          </span>

          <Box className={"footer-apps"}>
            <button type="button">
              <AppleIcon />
              App Store
            </button>
            <button type="button">
              <AndroidIcon />
              Google Play
            </button>
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Footer;
