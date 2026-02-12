import React, { useEffect, useState } from "react";
import { useRouter, withRouter } from "next/router";
import Link from "next/link";
import {
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import PeopleIcon from "@mui/icons-material/People";
import ForumIcon from "@mui/icons-material/Forum";
import PersonIcon from "@mui/icons-material/Person";
import HeadsetMicIcon from "@mui/icons-material/HeadsetMic";

const DoctorMenuList = (props: any) => {
  const router = useRouter();
  const [activeMenu, setActiveMenu] = useState("Dashboard");

  const {
    router: { pathname },
  } = props;

  const pathnames = pathname.split("/").filter((x: any) => x);

  /** LIFECYCLES **/
  useEffect(() => {
    switch (pathnames[1]) {
      case "dashboard":
        setActiveMenu("Dashboard");
        break;
      case "appointments":
        setActiveMenu("Appointments");
        break;
      case "patients":
        setActiveMenu("Patients");
        break;
      case "community":
        setActiveMenu("Community");
        break;
      case "mypage":
        setActiveMenu("My Page");
        break;
      case "cs":
        setActiveMenu("CS");
        break;
      default:
        setActiveMenu("Dashboard");
        break;
    }
  }, [pathname]);

  const menu_items = [
    {
      title: "Dashboard",
      icon: <DashboardIcon />,
      url: "/_doctor/dashboard",
    },
    {
      title: "Appointments",
      icon: <CalendarMonthIcon />,
      url: "/_doctor/appointments",
    },
    {
      title: "Patients",
      icon: <PeopleIcon />,
      url: "/_doctor/patients",
    },
    {
      title: "Community",
      icon: <ForumIcon />,
      url: "/_doctor/community",
    },
    {
      title: "My Page",
      icon: <PersonIcon />,
      url: "/_doctor/mypage",
    },
    {
      title: "CS",
      icon: <HeadsetMicIcon />,
      url: "/_doctor/cs",
    },
  ];

  return (
    <List className="doctor-menu-list" sx={{ px: 1, pt: 2 }}>
      {menu_items.map((item, index) => (
        <Link href={item.url} key={index} passHref>
          <ListItemButton
            component="li"
            selected={activeMenu === item.title}
            sx={{
              borderRadius: 2,
              mb: 0.5,
              "&.Mui-selected": {
                backgroundColor: "#e0e7ff",
                color: "#4361ee",
                "& .MuiListItemIcon-root": {
                  color: "#4361ee",
                },
                "&:hover": {
                  backgroundColor: "#dbeafe",
                },
              },
              "&:hover": {
                backgroundColor: "#f1f5f9",
              },
            }}
          >
            <ListItemIcon
              sx={{
                minWidth: 40,
                color: activeMenu === item.title ? "#4361ee" : "#64748b",
              }}
            >
              {item.icon}
            </ListItemIcon>
            <ListItemText
              primary={item.title}
              primaryTypographyProps={{
                fontSize: 14,
                fontWeight: activeMenu === item.title ? 600 : 500,
              }}
            />
          </ListItemButton>
        </Link>
      ))}
    </List>
  );
};

export default withRouter(DoctorMenuList);
