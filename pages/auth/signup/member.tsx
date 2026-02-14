import { useState } from "react";
import { Stack, TextField, Button, Typography, MenuItem } from "@mui/material";
import Link from "next/link";
import { signUpMember } from "@/libs/auth";
import { Gender } from "@/libs/enums/gender.enum";
import AuthShell from "../_components/AuthShell";
import { sweetErrorHandling } from "@/libs/sweetAlert";

const MemberSignupPage = () => {
  const [memberNick, setMemberNick] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [memberGender, setMemberGender] = useState<Gender | "">("");
  const [loading, setLoading] = useState(false);

  const submitHandler = async () => {
    if (!memberNick || !memberPhone || !memberPassword || loading) return;
    setLoading(true);
    try {
      await signUpMember(memberNick, memberPassword, memberPhone, memberGender || undefined);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = async () => {
    await sweetErrorHandling({ message: "Google/Apple signup is not available yet." });
  };

  return (
    <AuthShell title="Patient Sign Up" subtitle="Create your patient account." activeTab="signup">
      <Stack spacing={2}>
        <TextField placeholder="Member Nick" value={memberNick} onChange={(e) => setMemberNick(e.target.value)} />
        <TextField placeholder="Phone Number" value={memberPhone} onChange={(e) => setMemberPhone(e.target.value)} />
        <TextField
          placeholder="Password"
          type="password"
          value={memberPassword}
          onChange={(e) => setMemberPassword(e.target.value)}
        />
        <TextField
          select
          placeholder="Gender"
          value={memberGender}
          onChange={(e) => setMemberGender(e.target.value as Gender)}
        >
          <MenuItem value={Gender.MALE}>Male</MenuItem>
          <MenuItem value={Gender.FEMALE}>Female</MenuItem>
        </TextField>

        <Button variant="contained" size="large" onClick={submitHandler} disabled={loading}>
          {loading ? "Creating account..." : "Create Patient Account"}
        </Button>

        <Stack direction="row" spacing={1.5}>
          <Button variant="outlined" fullWidth onClick={handleSocialClick}>
            Google
          </Button>
          <Button variant="outlined" fullWidth onClick={handleSocialClick}>
            Apple
          </Button>
        </Stack>

        <Typography variant="body2" textAlign="center">
          Want doctor signup?{" "}
          <Link href="/auth/signup/doctor" style={{ color: "#2463eb", fontWeight: 700 }}>
            Go doctor signup
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  );
};

export default MemberSignupPage;
