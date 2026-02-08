import { Box, Stack } from "@mui/material";
import Link from "next/link";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { Logout } from "@mui/icons-material";

const Top = () => {
  return (
    <Stack className={"navbar"}>
      <Stack className={"navbar-main"}>
        <Stack className={"container"}>
          <Box component={"div"} className={"logo-box"}>
            <Link href={"/"}>
              <span className={"logo-text"}>MEDBOOK</span>
              <img src="/img/logo.png" alt="MedBook" />
            </Link>
          </Box>
          <Box component={"div"} className={"router-box"}>
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
          <Box component={"div"} className={"user-box"}>
            <>
              <div className={"login-user"}>
                <img src={"/img/defaultUser.svg"} alt="" />
              </div>

              <Menu id="basic-menu" sx={{ mt: "5px" }} open={false}>
                <MenuItem>
                  <Logout
                    fontSize="small"
                    style={{ color: "blue", marginRight: "10px" }}
                  />
                  Logout
                </MenuItem>
              </Menu>
            </>
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Top;
