import { Box, Stack } from "@mui/material";
import Link from "next/link";

const Footer = () => {
  return (
    <Stack className={"footer"}>
      <Stack className={"footer-main"}>
        <Stack className={"container"}>
          <Box component={"div"} className={"footer-brand"}>
            <Link href={"/"} className={"footer-brand-link"}>
              <img src="/img/logo.png" alt="MedBook" />
              <span className={"footer-logo-text"}>MedBook</span>
            </Link>
            <span className={"footer-tagline"}>Your health, our priority.</span>
          </Box>
          <Box component={"div"} className={"footer-links"}>
            <Link href={"/"}>
              <div>Home</div>
            </Link>
            <Link href={"/doctor"}>
              <div>Doctors</div>
            </Link>
            <Link href={"/community?articleCategory=FREE"}>
              <div>Community</div>
            </Link>
            <Link href={"/cs"}>
              <div>CS</div>
            </Link>
          </Box>
          <Box component={"div"} className={"footer-legal"}>
            <Link href={"/cs"}>
              <div>Privacy</div>
            </Link>
            <Link href={"/cs"}>
              <div>Terms</div>
            </Link>
          </Box>
        </Stack>
      </Stack>
      <Stack className={"footer-bottom"}>
        <Stack className={"container"}>
          <span className={"footer-copyright"}>
            © {new Date().getFullYear()} MedBook. All rights reserved.
          </span>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Footer;
