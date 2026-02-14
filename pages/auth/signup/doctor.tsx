import { useState } from "react";
import { Stack, TextField, Button, Typography, MenuItem } from "@mui/material";
import Link from "next/link";
import { signUpDoctor } from "@/libs/auth";
import { Gender } from "@/libs/enums/gender.enum";
import { Specialization } from "@/libs/enums/specialization.enum";
import AuthShell from "../_components/AuthShell";
import { sweetErrorHandling } from "@/libs/sweetAlert";

const DoctorSignupPage = () => {
  const SPECIALIZATION_OPTIONS = Object.values(Specialization);

  const [loading, setLoading] = useState(false);

  const [memberNick, setMemberNick] = useState("");
  const [memberFullName, setMemberFullName] = useState("");
  const [memberPhone, setMemberPhone] = useState("");
  const [memberPassword, setMemberPassword] = useState("");
  const [licenseNumber, setLicenseNumber] = useState("");
  const [specialization, setSpecialization] = useState<Specialization | "">("");
  const [experience, setExperience] = useState("");
  const [consultationFee, setConsultationFee] = useState("");
  const [memberGender, setMemberGender] = useState<Gender | "">("");
  const [memberDesc, setMemberDesc] = useState("");

  const submitHandler = async () => {
    if (loading) return;

    const trimmedNick = memberNick.trim();
    const trimmedFullName = memberFullName.trim();
    const trimmedPhone = memberPhone.trim();
    const trimmedPassword = memberPassword.trim();
    const trimmedLicense = licenseNumber.trim();
    const parsedExperience = Number(experience);
    const parsedConsultationFee = Number(consultationFee);

    if (
      !trimmedNick ||
      !trimmedFullName ||
      !trimmedPhone ||
      !trimmedPassword ||
      !trimmedLicense ||
      !specialization ||
      experience === "" ||
      consultationFee === ""
    ) {
      await sweetErrorHandling({ message: "Please fill in all required fields." });
      return;
    }

    if (trimmedNick.length < 4 || trimmedNick.length > 15) {
      await sweetErrorHandling({ message: "Member Nick must be between 4 and 15 characters." });
      return;
    }

    if (trimmedFullName.length < 4 || trimmedFullName.length > 100) {
      await sweetErrorHandling({ message: "Full Name must be between 4 and 100 characters." });
      return;
    }

    if (trimmedPassword.length < 5 || trimmedPassword.length > 12) {
      await sweetErrorHandling({ message: "Password must be between 5 and 12 characters." });
      return;
    }

    if (!Number.isFinite(parsedExperience) || parsedExperience < 0) {
      await sweetErrorHandling({ message: "Experience must be 0 or greater." });
      return;
    }

    if (!Number.isFinite(parsedConsultationFee) || parsedConsultationFee < 0) {
      await sweetErrorHandling({ message: "Consultation fee must be 0 or greater." });
      return;
    }

    setLoading(true);
    try {
      await signUpDoctor({
        memberNick: trimmedNick,
        memberFullName: trimmedFullName,
        memberPhone: trimmedPhone,
        memberPassword: trimmedPassword,
        licenseNumber: trimmedLicense,
        specialization,
        experience: parsedExperience,
        consultationFee: parsedConsultationFee,
        memberGender: memberGender || undefined,
        memberDesc: memberDesc.trim() || undefined,
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSocialClick = async () => {
    await sweetErrorHandling({ message: "Google/Apple signup is not available yet." });
  };

  return (
    <AuthShell title="Doctor Sign Up" subtitle="Create your doctor account." activeTab="signup">
      <Stack spacing={2}>
        <TextField label="Member Nick" value={memberNick} onChange={(e) => setMemberNick(e.target.value)} />
        <TextField label="Full Name" value={memberFullName} onChange={(e) => setMemberFullName(e.target.value)} />
        <TextField label="Phone Number" value={memberPhone} onChange={(e) => setMemberPhone(e.target.value)} />
        <TextField
          label="Password"
          type="password"
          value={memberPassword}
          onChange={(e) => setMemberPassword(e.target.value)}
        />
        <TextField label="License Number" value={licenseNumber} onChange={(e) => setLicenseNumber(e.target.value)} />
        <TextField
          select
          label="Specialization"
          value={specialization}
          onChange={(e) => setSpecialization(e.target.value as Specialization)}
        >
          {SPECIALIZATION_OPTIONS.map((option) => (
            <MenuItem key={option} value={option}>
              {option.replaceAll("_", " ")}
            </MenuItem>
          ))}
        </TextField>
        <TextField
          label="Experience (years)"
          type="number"
          value={experience}
          inputProps={{ min: 0 }}
          onChange={(e) => setExperience(e.target.value)}
        />
        <TextField
          label="Consultation Fee"
          type="number"
          value={consultationFee}
          inputProps={{ min: 0 }}
          onChange={(e) => setConsultationFee(e.target.value)}
        />
        <TextField
          select
          label="Gender"
          value={memberGender}
          onChange={(e) => setMemberGender(e.target.value as Gender)}
        >
          <MenuItem value={Gender.MALE}>Male</MenuItem>
          <MenuItem value={Gender.FEMALE}>Female</MenuItem>
        </TextField>
        <TextField
          label="Description"
          multiline
          minRows={3}
          value={memberDesc}
          onChange={(e) => setMemberDesc(e.target.value)}
        />

        <Button variant="contained" size="large" onClick={submitHandler} disabled={loading}>
          {loading ? "Creating account..." : "Create Doctor Account"}
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
          Want member signup?{" "}
          <Link href="/auth/signup/member" style={{ color: "#2463eb", fontWeight: 700 }}>
            Go member signup
          </Link>
        </Typography>
      </Stack>
    </AuthShell>
  );
};

export default DoctorSignupPage;
