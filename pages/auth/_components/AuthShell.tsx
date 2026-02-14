import { Box, Stack, Typography } from "@mui/material";
import Link from "next/link";
import type { ReactNode } from "react";

interface AuthShellProps {
  title: string;
  subtitle: string;
  activeTab: "login" | "signup";
  children: ReactNode;
}

const AuthShell = ({
  title,
  subtitle,
  activeTab,
  children,
}: AuthShellProps) => {
  return (
    <Stack
      sx={{
        minHeight: "100vh",
        p: { xs: 1.5, md: 2 },
        alignItems: "center",
        justifyContent: "center",
        background: "#f5f7fb",
      }}
    >
      <Stack
        sx={{
          width: "100%",
          maxWidth: 1180,
          minHeight: { md: 720 },
          borderRadius: 2,
          overflow: "hidden",
          boxShadow: "0 12px 40px rgba(0,0,0,0.12)",
          background: "#fff",
          flexDirection: { xs: "column", md: "row" },
        }}
      >
        <Box
          sx={{
            width: { xs: "100%", md: "58%" },
            px: { xs: 3, md: 5 },
            py: { xs: 4, md: 4 },
            color: "#fff",
            background: "linear-gradient(180deg, #2b63df 0%, #4b86ff 100%)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
          }}
        >
          <Stack direction="row" alignItems="center" spacing={1.2}>
            <Box
              sx={{
                width: 28,
                height: 28,
                borderRadius: 1,
                border: "1px solid rgba(255,255,255,0.55)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 700,
              }}
            >
              +
            </Box>
            <Typography fontSize={32} fontWeight={700}>
              MedBook
            </Typography>
          </Stack>

          <Stack
            alignItems="center"
            spacing={3}
            sx={{ mt: { xs: 4, md: 7 }, mb: { xs: 4, md: 8 } }}
          >
            <Box
              sx={{
                width: "100%",
                maxWidth: 470,
                height: { xs: 210, md: 270 },
                borderRadius: 2,
                border: "2px solid rgba(29,78,216,0.35)",
                overflow: "hidden",
                boxShadow: "0 14px 40px rgba(15,23,42,0.35)",
              }}
            >
              <img
                src="/img/news.png"
                alt="MedBook preview"
                style={{ width: "100%", height: "100%", objectFit: "cover" }}
              />
            </Box>
            <Typography
              fontSize={{ xs: 36, md: 46 }}
              fontWeight={700}
              lineHeight={1.15}
              textAlign="center"
            >
              Your Health Journey, Simplified.
            </Typography>
            <Typography
              textAlign="center"
              sx={{
                opacity: 0.95,
                maxWidth: 460,
                lineHeight: 1.65,
                fontSize: { xs: 16, md: 24 },
              }}
            >
              Connect with top specialists, manage appointments, and track your
              health records all in one secure place.
            </Typography>
          </Stack>

          <Stack
            direction="row"
            justifyContent="space-between"
            fontSize={13}
            sx={{ opacity: 0.92 }}
          >
            <span>© 2026 MedBook Inc.</span>
            <Stack direction="row" spacing={2}></Stack>
          </Stack>
        </Box>

        <Box
          sx={{
            width: { xs: "100%", md: "42%" },
            p: { xs: 3, md: 5 },
            display: "flex",
            alignItems: "center",
          }}
        >
          <Box sx={{ width: "100%" }}>
            <Typography fontSize={40} fontWeight={700} color="#121a2d">
              {title}
            </Typography>
            <Typography color="#5f6f92" mt={1} mb={3}>
              {subtitle}
            </Typography>

            <Stack
              direction="row"
              sx={{ p: 0.5, mb: 3, background: "#f2f4f8", borderRadius: 1.5 }}
            >
              <Link href="/auth/login" style={{ flex: 1 }}>
                <Box
                  sx={{
                    textAlign: "center",
                    py: 1,
                    fontWeight: 700,
                    borderRadius: 1.2,
                    color: activeTab === "login" ? "#2463eb" : "#4a5a7d",
                    background: activeTab === "login" ? "#fff" : "transparent",
                    boxShadow:
                      activeTab === "login"
                        ? "0 1px 4px rgba(0,0,0,0.08)"
                        : "none",
                  }}
                >
                  Sign In
                </Box>
              </Link>
              <Link href="/auth/signup" style={{ flex: 1 }}>
                <Box
                  sx={{
                    textAlign: "center",
                    py: 1,
                    fontWeight: 700,
                    borderRadius: 1.2,
                    color: activeTab === "signup" ? "#2463eb" : "#4a5a7d",
                    background: activeTab === "signup" ? "#fff" : "transparent",
                    boxShadow:
                      activeTab === "signup"
                        ? "0 1px 4px rgba(0,0,0,0.08)"
                        : "none",
                  }}
                >
                  Sign Up
                </Box>
              </Link>
            </Stack>

            {children}
          </Box>
        </Box>
      </Stack>
    </Stack>
  );
};

export default AuthShell;
