import type { ComponentType } from "react";
import React from "react";
import { useRouter } from "next/router";
import Link from "next/link";
import Toolbar from "@mui/material/Toolbar";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Drawer from "@mui/material/Drawer";
import AppBar from "@mui/material/AppBar";
import Avatar from "@mui/material/Avatar";
import IconButton from "@mui/material/IconButton";
import Divider from "@mui/material/Divider";
import Typography from "@mui/material/Typography";
import Tooltip from "@mui/material/Tooltip";
import List from "@mui/material/List";
import ListItemButton from "@mui/material/ListItemButton";
import ListItemIcon from "@mui/material/ListItemIcon";
import ListItemText from "@mui/material/ListItemText";
import NotificationsIcon from "@mui/icons-material/Notifications";
import LogoutIcon from "@mui/icons-material/Logout";
import MedicalServicesIcon from "@mui/icons-material/MedicalServices";
import PeopleIcon from "@mui/icons-material/People";
import ArticleIcon from "@mui/icons-material/Article";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";
import useDeviceDetect from "@/libs/hooks/useDeviceDetect";

const withLayoutAdmin = (Component: ComponentType) => {
  return (props: object) => {
    const device = useDeviceDetect();

    const router = useRouter();
    const pathnames = router.pathname.split("/").filter((x: string) => x);
    const adminSection = pathnames[1];

    const activeMenu =
      adminSection === "doctors"
        ? "Doctors"
        : adminSection === "patients"
        ? "Patients"
        : adminSection === "articles"
        ? "Articles"
        : adminSection === "appointments"
        ? "Appointments"
        : adminSection === "cs"
        ? "CS"
        : "Doctors";

    const menuItems = [
      {
        title: "Doctors",
        icon: <MedicalServicesIcon />,
        url: "/_admin",
      },
      {
        title: "Patients",
        icon: <PeopleIcon />,
        url: "/_admin/patients",
      },
      {
        title: "Articles",
        icon: <ArticleIcon />,
        url: "/_admin/articles",
      },
      {
        title: "Appointments",
        icon: <CalendarMonthIcon />,
        url: "/_admin/appointments",
      },
      {
        title: "CS",
        icon: <HeadsetMicIcon />,
        url: "/_admin/cs",
      },
    ];

    if (device === "mobile") {
      return <Stack>ADMIN MOBILE</Stack>;
    } else {
      return (
        <main id="pc-wrap" className="admin-panel">
          <Box component={"div"} className="admin-panel__layout">
            <AppBar position="fixed" className="admin-panel__appbar">
              <Toolbar className="admin-panel__toolbar">
                <Box />
                <Stack direction="row" spacing={1} alignItems="center">
                  <IconButton>
                    <NotificationsIcon />
                  </IconButton>
                  <Tooltip title="Admin">
                    <IconButton className="admin-panel__avatar-button">
                      <Avatar src={"/img/defaultUser.svg"} />
                    </IconButton>
                  </Tooltip>
                </Stack>
              </Toolbar>
            </AppBar>

            <Drawer variant="permanent" anchor="left" className="admin-aside">
              <Toolbar className="admin-aside__toolbar">
                <Stack
                  className={"logo-box"}
                  direction="row"
                  alignItems="center"
                  spacing={1}
                >
                  <Avatar
                    src={"/img/defaultUser.svg"}
                    className="admin-logo__avatar"
                  />
                  <Stack>
                    <Typography
                      variant="subtitle1"
                      className="admin-logo__title"
                    >
                      MedBook
                    </Typography>
                    <Typography
                      variant="caption"
                      className="admin-logo__subtitle"
                    >
                      Admin Panel
                    </Typography>
                  </Stack>
                </Stack>
              </Toolbar>

              <Divider />

              <List className="admin-menu-list">
                {menuItems.map((item, index) => (
                  <Link href={item.url} key={index} passHref>
                    <ListItemButton
                      component="li"
                      selected={activeMenu === item.title}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.title} />
                    </ListItemButton>
                  </Link>
                ))}
              </List>

              <Box className="admin-aside__logout">
                <Divider className="admin-aside__logout-divider" />
                <MenuItemLogout onClick={() => router.push("/")} />
              </Box>
            </Drawer>

            <Box component={"div"} id="admin-content">
              {/*@ts-ignore*/}
              <Component {...props} />
            </Box>
          </Box>
        </main>
      );
    }
  };
};

const MenuItemLogout = ({ onClick }: { onClick: () => void }) => {
  return (
    <ListItemButton onClick={onClick} className="admin-menu-list__logout-btn">
      <ListItemIcon>
        <LogoutIcon />
      </ListItemIcon>
      <ListItemText primary="Logout" />
    </ListItemButton>
  );
};

export default withLayoutAdmin;
