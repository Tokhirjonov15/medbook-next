import { useState } from "react";
import { Box, Stack, TextField, Button, Typography, FormControlLabel, Checkbox, Divider } from "@mui/material";
import Link from "next/link";
import Swal from "sweetalert2";
import AuthShell from "./_components/AuthShell";
import { forgotPassword, logIn } from "@/libs/auth";
import { sweetErrorHandling } from "@/libs/sweetAlert";

const LoginPage = () => {
  const [memberNick, setMemberNick] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async () => {
    if (!memberNick || !memberPassword || loading) return;
    setLoading(true);
    try {
      await logIn(memberNick, memberPassword);
    } catch (err) {
      // Errors are already handled with sweet alerts inside auth helpers.
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = async () => {
    await sweetErrorHandling({ message: "Google/Apple login is not available yet." });
  };

  const handleForgotPassword = async () => {
    const { value: formValues } = await Swal.fire({
      title: "Forgot Password",
      html:
        '<input id="swal-memberNick" class="swal2-input" placeholder="Member Nick">' +
        '<input id="swal-memberPhone" class="swal2-input" placeholder="Member Phone">',
      focusConfirm: false,
      showCancelButton: true,
      confirmButtonText: "Verify",
      preConfirm: () => {
        const nick = (document.getElementById("swal-memberNick") as HTMLInputElement)?.value?.trim();
        const phone = (document.getElementById("swal-memberPhone") as HTMLInputElement)?.value?.trim();
        if (!nick || !phone) {
          Swal.showValidationMessage("Both memberNick and memberPhone are required");
          return null;
        }
        return { nick, phone };
      },
    });

    if (!formValues) return;

    const verified = await forgotPassword(formValues.nick, formValues.phone);
    if (verified) {
      window.location.href = `/auth/reset-password?memberNick=${encodeURIComponent(formValues.nick)}&memberPhone=${encodeURIComponent(formValues.phone)}`;
    }
  };

  return (
    <AuthShell title="Welcome Back" subtitle="Please enter your details to sign in." activeTab="login">
      <Stack spacing={2}>
        <TextField
          fullWidth
          placeholder="Member Nick"
          value={memberNick}
          onChange={(e) => setMemberNick(e.target.value)}
        />
        <TextField
          fullWidth
          placeholder="Password"
          type="password"
          value={memberPassword}
          onChange={(e) => setMemberPassword(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") submitHandler();
          }}
        />

        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <FormControlLabel control={<Checkbox size="small" />} label="Remember me" />
          <Button variant="text" onClick={handleForgotPassword} sx={{ textTransform: "none", fontWeight: 700 }}>
            Forgot Password?
          </Button>
        </Stack>

        <Button variant="contained" size="large" onClick={submitHandler} disabled={loading}>
          {loading ? "Signing In..." : "Sign In"}
        </Button>

        <Stack direction="row" alignItems="center" spacing={1}>
          <Divider sx={{ flex: 1 }} />
          <Typography variant="caption" color="#6b7a9c">
            OR CONTINUE WITH
          </Typography>
          <Divider sx={{ flex: 1 }} />
        </Stack>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" fullWidth onClick={handleSocialClick}>
            Google
          </Button>
          <Button variant="outlined" fullWidth onClick={handleSocialClick}>
            Apple
          </Button>
        </Stack>

        <Typography variant="body2" textAlign="center" mt={1}>
          Don't have an account?{" "}
          <Link href="/auth/signup" style={{ color: "#2463eb", fontWeight: 700 }}>
            Sign up now
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  );
};

export default LoginPage;
