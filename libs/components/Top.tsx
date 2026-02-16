import { Box, Stack } from "@mui/material";
import Link from "next/link";
import MenuItem from "@mui/material/MenuItem";
import Menu from "@mui/material/Menu";
import { Logout } from "@mui/icons-material";
import { useState, MouseEvent } from "react";
import { useRouter } from "next/router";
import DarkModeOutlinedIcon from "@mui/icons-material/DarkModeOutlined";
import LightModeOutlinedIcon from "@mui/icons-material/LightModeOutlined";
import { LANGUAGE_OPTIONS } from "@/libs/i18n/member";
import type { LocaleKey } from "@/libs/i18n/member";
import useMemberTranslation from "@/libs/hooks/useMemberTranslation";

interface User {
  name: string;
  image?: string;
}

interface NavbarProps {
  user?: User | null;
  themeMode?: "light" | "dark";
  onToggleThemeMode?: () => void;
  onLogin?: () => void;
  onSignup?: () => void;
  onLogout?: () => void;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:3004";

const DEFAULT_USER_IMAGE = "/img/defaultUser.svg";

const toAbsoluteMediaUrl = (value?: string): string => {
  const src = String(value || "").trim();
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/img/")) return src;
  if (src.startsWith("/uploads/")) return `${API_BASE_URL}${src}`;
  if (src.startsWith("uploads/")) return `${API_BASE_URL}/${src}`;
  return src;
};

const Top = ({ user = null, themeMode = "light", onToggleThemeMode, onLogin, onSignup, onLogout }: NavbarProps) => {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [langAnchorEl, setLangAnchorEl] = useState<null | HTMLElement>(null);
  const open = Boolean(anchorEl);
  const langOpen = Boolean(langAnchorEl);
  const router = useRouter();
  const { t, locale } = useMemberTranslation();

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

  const handleLangMenuOpen = (event: MouseEvent<HTMLElement>) => {
    setLangAnchorEl(event.currentTarget);
  };

  const handleLangMenuClose = () => {
    setLangAnchorEl(null);
  };

  const handleLanguageChange = async (nextLocale: LocaleKey) => {
    handleLangMenuClose();
    if (nextLocale === locale) return;
    await router.push(router.asPath, router.asPath, { locale: nextLocale });
  };

  const isActive = (path: string) => {
    return router.pathname === path;
  };
  const userImage = toAbsoluteMediaUrl(user?.image) || DEFAULT_USER_IMAGE;

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
                {t("nav.home")}
              </div>
            </Link>
            <Link href={"/doctor"}>
              <div
                className={`router-link ${isActive("/doctor") ? "active" : ""}`}
              >
                {t("nav.findDoctors")}
              </div>
            </Link>
            <Link href={"/community"}>
              <div
                className={`router-link ${
                  isActive("/community") ? "active" : ""
                }`}
              >
                {t("nav.community")}
              </div>
            </Link>
            <Link href={"/cs"}>
              <div className={`router-link ${isActive("/cs") ? "active" : ""}`}>
                {t("nav.cs")}
              </div>
            </Link>
            {user && (
              <Link href={"/mypage"}>
                <div
                  className={`router-link ${isActive("/mypage") ? "active" : ""}`}
                >
                  {t("nav.myPage")}
                </div>
              </Link>
            )}
          </Box>
          <Box component={"div"} className={"user-box"}>
            <button className="theme-toggle-btn" onClick={onToggleThemeMode} aria-label="Toggle theme">
              {themeMode === "dark" ? (
                <LightModeOutlinedIcon sx={{ fontSize: 18, color: "#f59e0b" }} />
              ) : (
                <DarkModeOutlinedIcon sx={{ fontSize: 18, color: "#475569" }} />
              )}
            </button>
            <button className="lang-btn" onClick={handleLangMenuOpen} aria-label="Change language">
              <img
                className="lang-flag"
                src={LANGUAGE_OPTIONS.find((item) => item.locale === locale)?.flag ?? "/img/en.png"}
                alt={`${locale} flag`}
                style={{ width: 18, height: 13, objectFit: "cover", borderRadius: 3, border: "1px solid #dbe3ea" }}
              />
              <span className="lang-label">{locale.toUpperCase()}</span>
            </button>
            <Menu
              id="lang-menu"
              anchorEl={langAnchorEl}
              open={langOpen}
              onClose={handleLangMenuClose}
              sx={{
                mt: "12px",
                "& .MuiPaper-root": {
                  borderRadius: "10px",
                  width: "148px",
                  minWidth: "148px",
                  maxWidth: "148px",
                },
                "& .MuiMenuItem-root": {
                  minHeight: "34px",
                  padding: "6px 10px",
                  fontSize: "13px",
                  lineHeight: 1.2,
                },
                "& .lang-option-flag": {
                  width: "18px",
                  height: "13px",
                  objectFit: "cover",
                  borderRadius: "3px",
                  marginRight: "8px",
                  border: "1px solid #dbe3ea",
                  flexShrink: 0,
                  display: "inline-block",
                },
              }}
              transformOrigin={{ horizontal: "right", vertical: "top" }}
              anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
            >
              {LANGUAGE_OPTIONS.map((item) => (
                <MenuItem key={item.locale} onClick={() => handleLanguageChange(item.locale)}>
                  <img
                    className="lang-option-flag"
                    src={item.flag}
                    alt={`${item.label} flag`}
                    style={{ width: 18, height: 13, objectFit: "cover", borderRadius: 3, border: "1px solid #dbe3ea" }}
                  />
                  <span>{item.label}</span>
                </MenuItem>
              ))}
            </Menu>
            {!user ? (
              <>
                <button className="signup-btn" onClick={onSignup}>
                  Sign Up
                </button>
                <button className="login-btn" onClick={onLogin}>
                  {t("nav.login")}
                </button>
                <div className={"default-user"}>
                  <img src={"/img/defaultUser.svg"} alt="Default User" />
                </div>
              </>
            ) : (
              <>
                <div className={"login-user"} onClick={handleClick}>
                  <img
                    src={userImage}
                    alt={user.name}
                    onError={(event) => {
                      const target = event.currentTarget;
                      if (target.src.endsWith(DEFAULT_USER_IMAGE)) return;
                      target.src = DEFAULT_USER_IMAGE;
                    }}
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
                      minWidth: "160px",
                      width: "160px",
                      boxShadow:
                        "0 10px 40px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(0, 0, 0, 0.05)",
                    },
                    "& .menu-header": {
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "10px 8px 8px",
                      marginBottom: "4px",
                    },
                    "& .menu-info": {
                      width: "100%",
                      textAlign: "center",
                    },
                    "& .menu-name": {
                      textAlign: "center",
                    },
                    "& .menu-divider": {
                      margin: "0 10px 4px",
                    },
                    "& .menu-logout": {
                      justifyContent: "center",
                      textAlign: "center",
                      minHeight: "36px",
                    },
                  }}
                  transformOrigin={{ horizontal: "right", vertical: "top" }}
                  anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
                >
                  <Box
                    className="menu-header"
                    sx={{
                      display: "flex",
                      flexDirection: "column",
                      alignItems: "center",
                      justifyContent: "center",
                      gap: "6px",
                      padding: "10px 8px 8px",
                      marginBottom: "4px",
                      textAlign: "center",
                    }}
                  >
                    <Box
                      className="menu-avatar"
                      sx={{
                        width: "44px",
                        height: "44px",
                        borderRadius: "50%",
                        overflow: "hidden",
                        border: "2px solid #e8ecef",
                        flexShrink: 0,
                      }}
                    >
                      <img
                        src={userImage}
                        alt={user.name}
                        style={{
                          width: "44px",
                          height: "44px",
                          objectFit: "cover",
                          display: "block",
                          borderRadius: "50%",
                        }}
                        onError={(event) => {
                          const target = event.currentTarget;
                          if (target.src.endsWith(DEFAULT_USER_IMAGE)) return;
                          target.src = DEFAULT_USER_IMAGE;
                        }}
                      />
                    </Box>
                    <Box className="menu-info">
                      <Box className="menu-name">{user.name}</Box>
                    </Box>
                  </Box>
                  <Box className="menu-divider" />
                  <MenuItem onClick={handleLogout} className="menu-logout">
                    <Logout fontSize="small" style={{ marginRight: "10px" }} />
                    {t("nav.logout")}
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
