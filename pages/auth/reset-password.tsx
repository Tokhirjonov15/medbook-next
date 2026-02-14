import { useEffect, useMemo, useState } from "react";
import { Stack, TextField, Button, Typography } from "@mui/material";
import { useRouter } from "next/router";
import AuthShell from "./_components/AuthShell";
import { resetPassword } from "@/libs/auth";

const ResetPasswordPage = () => {
  const router = useRouter();
  const initialNick = useMemo(() => {
    const q = router.query.memberNick;
    return Array.isArray(q) ? q[0] ?? "" : q ?? "";
  }, [router.query.memberNick]);
  const initialPhone = useMemo(() => {
    const q = router.query.memberPhone;
    return Array.isArray(q) ? q[0] ?? "" : q ?? "";
  }, [router.query.memberPhone]);

  const [memberNick, setMemberNick] = useState(initialNick);
  const [memberPhone, setMemberPhone] = useState(initialPhone);
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (initialNick) setMemberNick(initialNick);
  }, [initialNick]);
  useEffect(() => {
    if (initialPhone) setMemberPhone(initialPhone);
  }, [initialPhone]);

  const submitHandler = async () => {
    if (!memberNick || !memberPhone || !newPassword || loading) return;
    setLoading(true);
    try {
      const success = await resetPassword(memberNick, memberPhone, newPassword);
      if (success) {
        router.push("/auth/login");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <AuthShell title="Reset Password" subtitle="Please verify your credentials and set a new password." activeTab="login">
      <Stack spacing={2}>
        <TextField placeholder="Member Nick" value={memberNick} onChange={(e) => setMemberNick(e.target.value)} />
        <TextField
          placeholder="Member Phone"
          value={memberPhone}
          onChange={(e) => setMemberPhone(e.target.value)}
        />
        <TextField
          placeholder="New Password"
          type="password"
          value={newPassword}
          onChange={(e) => setNewPassword(e.target.value)}
        />
        <Button variant="contained" size="large" onClick={submitHandler} disabled={loading}>
          {loading ? "Resetting..." : "Reset Password"}
        </Button>
        <Typography variant="body2" textAlign="center" color="#5f6f92">
          After successful reset, you will be redirected to login.
        </Typography>
      </Stack>
    </AuthShell>
  );
};

export default ResetPasswordPage;
