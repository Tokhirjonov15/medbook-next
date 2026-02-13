import { Box, Stack } from "@mui/material";
import Link from "next/link";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { Logout } from "@mui/icons-material";
import { useState, MouseEvent } from "react";
import { useRouter } from "next/router";

interface User {
  name: string;
  image?: string;
}

interface NavbarProps {
  user?: User | null;
  onLogin?: () => void;
  onLogout?: () => void;
}

const Top = ({ user = null, onLogin, onLogout }: NavbarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const router = useRouter();

  const handleClick = (event: MouseEvent<HTMLElement>) => {
    if (user) {
      setAnchorEl(event.currentTarget);
    }
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleClose();
    onLogout?.();
  };

  const isActive = (path: string) => {
    return router.pathname === path;
  };

  return (
    <Stack className={"navbar"}>
      <Stack className={"navbar-main"}>
        <Stack className={"container"}>
          <Box component={"div"} className={"logo-box"}>
            <Link href={"/"}>
              <img src="/img/logo.png" alt="MedBook Logo" />
              <span className="logo-text">MedBook</span>
            </Link>
          </Box>
          <Box component={"div"} className={"router-box"}>
            <Link href={"/"}>
              <div className={`router-link ${isActive("/") ? "active" : ""}`}>
                Home
              </div>
            </Link>
            <Link href={"/doctor"}>
              <div
                className={`router-link ${isActive("/doctor") ? "active" : ""}`}
              >
                Find Doctors
              </div>
            </Link>
            <Link href={"/community"}>
              <div
                className={`router-link ${
                  isActive("/community") ? "active" : ""
                }`}
              >
                Community
              </div>
            </Link>
            <Link href={"/cs"}>
              <div className={`router-link ${isActive("/cs") ? "active" : ""}`}>
                CS
              </div>
            </Link>
            <Link href={"/mypage"}>
              <div
                className={`router-link ${isActive("/mypage") ? "active" : ""}`}
              >
                My Page
              </div>
            </Link>
          </Box>
          <Box component={"div"} className={"user-box"}>
            {!user ? (
              <>
                <button className="login-btn" onClick={onLogin}>
                  Login
                </button>
                <div className={"default-user"}>
                  <img src={"/img/defaultUser.svg"} alt="Default User" />
                </div>
              </>
            ) : (
              <>
                <div className={"login-user"} onClick={handleClick}>
                  <img
                    src={user.image || "/img/defaultUser.svg"}
                    alt={user.name}
                  />
                </div>

                <Menu
                  id="user-menu"
                  anchorEl={anchorEl}
                  open={open}
                  onClose={handleClose}
                  sx={{
                    mt: "12px",
                    "& .MuiPaper-root": {
                      borderRadius: "12px",
                      minWidth: "260px",
                      boxShadow:
                        "0 10px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <Box className="menu-header">
                    <Box className="menu-avatar">
                      <img
                        src={user.image || "/img/defaultUser.svg"}
                        alt={user.name}
                      />
                    </Box>
                    <Box className="menu-info">
                      <Box className="menu-name">{user.name}</Box>
                    </Box>
                  </Box>
                  <Box className="menu-divider" />
                  <MenuItem onClick={handleLogout} className="menu-logout">
                    <Logout fontSize="small" style={{ marginRight: "10px" }} />
                    Logout
                  </MenuItem>
                </Menu>
              </>
            )}
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Top;
