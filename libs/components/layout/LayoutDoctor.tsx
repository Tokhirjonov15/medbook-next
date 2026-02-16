import type { ComponentType } from "react";
import React, { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import { Menu, MenuItem } from "@mui/material";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import NotificationsIcon from "@mui/icons-material/Notifications";
import SettingsIcon from "@mui/icons-material/Settings";
import LogoutIcon from "@mui/icons-material/Logout";
import DoctorMenuList from "../_doctorsHome/DoctorMenuList";
import useDeviceDetect from "@/libs/hooks/useDeviceDetect";
import { useReactiveVar } from "@apollo/client";
import { doctorVar } from "@/apollo/store";
import { MemberType } from "@/libs/enums/member.enum";
import { getJwtToken, logOut, updateUserInfo } from "@/libs/auth";

const drawerWidth = 240;
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:3004";

const toAbsoluteMediaUrl = (value?: string): string => {
  const src = String(value || "").trim();
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/img/")) return src;
  if (src.startsWith("/uploads/")) return `${API_BASE_URL}${src}`;
  if (src.startsWith("uploads/")) return `${API_BASE_URL}/${src}`;
  return src;
};

const withLayoutDoctor = (Component: ComponentType) => {
  return (props: object) => {
    const device = useDeviceDetect();

    const router = useRouter();
    const doctor = useReactiveVar(doctorVar);
    const isMyPage = router.pathname.startsWith("/_doctor/mypage");
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
      null,
    );
    const [loading, setLoading] = useState(true);

    /** LIFECYCLES **/
    useEffect(() => {
      const token = getJwtToken();
      if (!doctor?._id && token) {
        updateUserInfo(token);
        return;
      }

      if (!doctor?._id || doctor.memberType !== MemberType.DOCTOR) {
        router.replace("/auth/login");
      } else {
        setLoading(false);
      }
    }, [router, doctor]);

    const doctorDisplayName = doctor?.memberFullName || doctor?.memberNick || "Doctor";
    const doctorPhone = doctor?.memberPhone || "-";
    const doctorImage = toAbsoluteMediaUrl(doctor?.memberImage) || "/img/defaultUser.svg";

    /** HANDLERS **/
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
      setAnchorElUser(null);
    };

    if (loading) return null;

    if (device === "mobile") {
      return <Stack>DOCTOR MOBILE</Stack>;
    } else {
      return (
        <main id="pc-wrap" className="doctor-panel">
          <Box component={"div"} sx={{ display: "flex" }}>
            <AppBar
              position="fixed"
              sx={{
                width: `calc(100% - ${drawerWidth}px)`,
                ml: `${drawerWidth}px`,
                boxShadow: "none",
                background: "#fff",
                borderBottom: "1px solid #e8ecef",
              }}
            >
              <Toolbar sx={{ justifyContent: "space-between" }}>
                <Box />
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton>
                    <NotificationsIcon />
                  </IconButton>
                  <IconButton
                    className={`doctor-settings-btn ${
                      isMyPage ? "active" : ""
                    }`}
                    onClick={() => router.push("/_doctor/mypage")}
                  >
                    <SettingsIcon />
                  </IconButton>
                  <Tooltip title="Open settings">
                    <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                      <Avatar src={doctorImage} />
                    </IconButton>
                  </Tooltip>
                </Stack>
                <Menu
                  sx={{ mt: "45px" }}
                  id="menu-appbar"
                  className={"pop-menu"}
                  anchorEl={anchorElUser}
                  anchorOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  keepMounted
                  transformOrigin={{
                    vertical: "top",
                    horizontal: "right",
                  }}
                  open={Boolean(anchorElUser)}
                  onClose={handleCloseUserMenu}
                >
                  <Box
                    component={"div"}
                    onClick={handleCloseUserMenu}
                    sx={{
                      width: "200px",
                    }}
                  >
                    <Stack sx={{ px: "20px", my: "12px" }}>
                      <Typography
                        variant={"h6"}
                        component={"h6"}
                        sx={{ mb: "4px" }}
                      >
                        {doctorDisplayName}
                      </Typography>
                      <Typography
                        variant={"subtitle1"}
                        component={"p"}
                        color={"#757575"}
                      >
                        {doctorPhone}
                      </Typography>
                    </Stack>
                    <Divider />
                    <Box component={"div"} sx={{ p: 1, py: "6px" }}>
                      <MenuItem sx={{ px: "16px", py: "6px" }}>
                        <Typography variant={"subtitle1"} component={"span"}>
                          <span onClick={() => logOut()}>Logout</span>
                        </Typography>
                      </MenuItem>
                    </Box>
                  </Box>
                </Menu>
              </Toolbar>
            </AppBar>

            <Drawer
              sx={{
                width: drawerWidth,
                flexShrink: 0,
                "& .MuiDrawer-paper": {
                  width: drawerWidth,
                  boxSizing: "border-box",
                  borderRight: "1px solid #e8ecef",
                },
              }}
              variant="permanent"
              anchor="left"
              className="doctor-aside"
            >
              <Toolbar
                sx={{
                  flexDirection: "column",
                  alignItems: "flex-start",
                  py: 3,
                }}
              >
                <Stack
                  className={"logo-box"}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                  mb={2}
                >
                  <Avatar
                    src={doctorImage}
                    sx={{ width: 40, height: 40 }}
                  />
                  <Stack>
                    <Typography variant="subtitle1" fontWeight={600}>
                      MedBook
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {doctorDisplayName}
                    </Typography>
                  </Stack>
                </Stack>
              </Toolbar>

              <Divider />

              <DoctorMenuList />

              <Box sx={{ mt: "auto", p: 2 }}>
                <Divider sx={{ mb: 2 }} />
                <MenuItem sx={{ borderRadius: 1, color: "#ef4444" }}>
                  <LogoutIcon />
                  <Typography variant="body2" onClick={() => logOut()}>
                    Logout
                  </Typography>
                </MenuItem>
              </Box>
            </Drawer>

            <Box
              component={"div"}
              id="doctor-content"
              sx={{ flexGrow: 1, p: 3, mt: 8 }}
            >
              {/*@ts-ignore*/}
              <Component {...props} />
            </Box>
          </Box>
        </main>
      );
    }
  };
};

export default withLayoutDoctor;
