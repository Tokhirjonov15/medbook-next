import { Stack, Typography, Button, Divider } from "@mui/material";
import Link from "next/link";
import AuthShell from "../_components/AuthShell";
import { sweetErrorHandling } from "@/libs/sweetAlert";

const SignupChoosePage = () => {
  const handleSocialClick = async () => {
    await sweetErrorHandling({ message: "Google/Apple signup is not available yet." });
  };

  return (
    <AuthShell title="Create Account" subtitle="Choose account type to continue." activeTab="signup">
      <Stack spacing={2}>
        <Link href="/auth/signup/member">
          <Button fullWidth variant="contained" size="large">
            Continue as Patient
          </Button>
        </Link>
        <Link href="/auth/signup/doctor">
          <Button fullWidth variant="outlined" size="large">
            Continue as Doctor
          </Button>
        </Link>

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
          Already have an account?{" "}
          <Link href="/auth/login" style={{ color: "#2463eb", fontWeight: 700 }}>
            Sign in
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  );
};

export default SignupChoosePage;
