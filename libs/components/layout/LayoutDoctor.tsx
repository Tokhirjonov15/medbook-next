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

const drawerWidth = 240;

const withLayoutDoctor = (Component: ComponentType) => {
  return (props: object) => {
    const router = useRouter();
    const isMyPage = router.pathname.startsWith("/_doctor/mypage");
    const [anchorElUser, setAnchorElUser] = React.useState<null | HTMLElement>(
      null,
    );
    const [loading, setLoading] = useState(true);

    /** LIFECYCLES **/
    /** HANDLERS **/
    const handleOpenUserMenu = (event: React.MouseEvent<HTMLElement>) => {
      setAnchorElUser(event.currentTarget);
    };

    const handleCloseUserMenu = () => {
      setAnchorElUser(null);
    };

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
                  className={`doctor-settings-btn ${isMyPage ? "active" : ""}`}
                  onClick={() => router.push("/_doctor/mypage")}
                >
                  <SettingsIcon />
                </IconButton>
                <Tooltip title="Open settings">
                  <IconButton onClick={handleOpenUserMenu} sx={{ p: 0 }}>
                    <Avatar src={"/img/defaultUser.svg"} />
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
                      Alex
                    </Typography>
                    <Typography
                      variant={"subtitle1"}
                      component={"p"}
                      color={"#757575"}
                    >
                      +8210 2076 7640
                    </Typography>
                  </Stack>
                  <Divider />
                  <Box component={"div"} sx={{ p: 1, py: "6px" }}>
                    <MenuItem sx={{ px: "16px", py: "6px" }}>
                      <Typography variant={"subtitle1"} component={"span"}>
                        Logout
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
              sx={{ flexDirection: "column", alignItems: "flex-start", py: 3 }}
            >
              <Stack
                className={"logo-box"}
                direction="row"
                alignItems="center"
                spacing={1}
                mb={2}
              >
                <Avatar
                  src={"/img/defaultUser.svg"}
                  sx={{ width: 40, height: 40 }}
                />
                <Stack>
                  <Typography variant="subtitle1" fontWeight={600}>
                    MedBook
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    Alex
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
                <Typography variant="body2">Logout</Typography>
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
  };
};

export default withLayoutDoctor;
