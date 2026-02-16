import decodeJWT from "jwt-decode";
import { initializeApollo } from "../../apollo/client";
import { doctorVar, userVar } from "../../apollo/store";
import { CustomJwtPayloadDoctor, CustomJwtPayloadMember } from "../types/customJwtPayload";
import { sweetErrorHandling, sweetMixinErrorAlert, sweetTopSuccessAlert } from "../sweetAlert";
import { FORGOT_PASSWORD, LOGIN, RESET_PASSWORD, SIGN_UP } from "../../apollo/user/mutation";
import { DOCTOR_LOGIN, DOCTOR_SIGNUP } from "../../apollo/doctor/mutation";
import { MemberType } from "../enums/member.enum";
import { Gender } from "../enums/gender.enum";
import { Specialization } from "../enums/specialization.enum";

export function getJwtToken(): string {
  if (typeof window === "undefined") return "";
  return localStorage.getItem("accessToken") ?? "";
}

const setAuthCookie = (token: string) => {
  if (typeof window === "undefined") return;
  document.cookie = `accessToken=${token}; path=/; max-age=604800; samesite=lax`;
};

const removeAuthCookie = () => {
  if (typeof window === "undefined") return;
  document.cookie = "accessToken=; path=/; max-age=0; samesite=lax";
};

export function setJwtToken(token: string) {
  if (typeof window === "undefined") return;
  localStorage.setItem("accessToken", token);
  setAuthCookie(token);
}

const getRoleRedirectPath = (memberType?: string): string => {
  if (memberType === MemberType.DOCTOR) return "/_doctor";
  if (memberType === MemberType.ADMIN) return "/_admin";
  return "/";
};

export const logIn = async (nick: string, password: string): Promise<void> => {
  try {
    const { jwtToken } = await requestJwtToken({ nick, password });

    if (!jwtToken) throw new Error("No access token");

    updateStorage({ jwtToken });
    const claims = updateUserInfo(jwtToken);
    const redirectPath = getRoleRedirectPath(claims?.memberType);
    window.location.href = redirectPath;
  } catch (err) {
    console.warn("login err", err);
    logOut(false);
    throw err;
  }
};

const requestJwtToken = async ({
  nick,
  password,
}: {
  nick: string;
  password: string;
}): Promise<{ jwtToken: string }> => {
  const apolloClient = await initializeApollo();

  try {
    const result = await apolloClient.mutate({
      mutation: LOGIN,
      variables: { input: { memberNick: nick, memberPassword: password } },
      fetchPolicy: "network-only",
    });

    const { accessToken } = result?.data?.login ?? {};
    return { jwtToken: accessToken };
  } catch (err: any) {
    const gqlMessage = err?.graphQLErrors?.[0]?.message ?? "";

    // Members and doctors are stored in separate collections.
    // If user is not found in members, try doctor login with the same credentials.
    if (gqlMessage.includes("No member with that member nick")) {
      try {
        const doctorResult = await apolloClient.mutate({
          mutation: DOCTOR_LOGIN,
          variables: { input: { memberNick: nick, memberPassword: password } },
          fetchPolicy: "network-only",
        });

        const { accessToken } = doctorResult?.data?.DoctorLogin ?? {};
        return { jwtToken: accessToken };
      } catch (doctorErr: any) {
        const doctorMessage = doctorErr?.graphQLErrors?.[0]?.message ?? "";
        if (doctorMessage.includes("password")) {
          await sweetMixinErrorAlert("Please check your password again");
        } else if (doctorMessage.includes("blocked")) {
          await sweetMixinErrorAlert("User has been blocked!");
        } else {
          await sweetMixinErrorAlert("Login failed. Please try again.");
        }
        throw new Error("token error");
      }
    }

    if (gqlMessage.includes("login and password do not match") || gqlMessage.includes("password")) {
      await sweetMixinErrorAlert("Please check your password again");
    } else if (gqlMessage.includes("blocked")) {
      await sweetMixinErrorAlert("User has been blocked!");
    } else {
      await sweetMixinErrorAlert("Login failed. Please try again.");
    }
    throw new Error("token error");
  }
};

export const signUpMember = async (
  nick: string,
  password: string,
  phone: string,
  gender?: Gender,
): Promise<void> => {
  try {
    const { jwtToken } = await requestMemberSignUpToken({ nick, password, phone, gender });

    if (!jwtToken) throw new Error("No access token");

    updateStorage({ jwtToken });
    const claims = updateUserInfo(jwtToken);
    const redirectPath = getRoleRedirectPath(claims?.memberType);
    window.location.href = redirectPath;
  } catch (err) {
    console.warn("signup member err", err);
    logOut(false);
    throw err;
  }
};

export const signUpDoctor = async (input: {
  memberNick: string;
  memberPassword: string;
  memberPhone: string;
  memberFullName: string;
  memberGender?: Gender;
  licenseNumber: string;
  specialization: Specialization | Specialization[];
  experience: number;
  consultationFee: number;
  languages?: string[];
  consultationType?: string;
  memberDesc?: string;
  workingDays?: string[];
  workingHours?: string[];
  breakTime?: string[];
}): Promise<void> => {
  try {
    const { jwtToken } = await requestDoctorSignUpToken(input);

    if (!jwtToken) throw new Error("No access token");

    await sweetTopSuccessAlert("Doctor signup completed successfully");
    updateStorage({ jwtToken });
    const claims = updateUserInfo(jwtToken);
    const redirectPath = getRoleRedirectPath(claims?.memberType);
    window.location.href = redirectPath;
  } catch (err) {
    console.warn("signup doctor err", err);
    logOut(false);
    throw err;
  }
};

// Backward compatibility for existing calls
export const signUp = signUpMember;

export const forgotPassword = async (memberNick: string, memberPhone: string): Promise<boolean> => {
  const apolloClient = await initializeApollo();
  try {
    const result = await apolloClient.mutate({
      mutation: FORGOT_PASSWORD,
      variables: { input: { memberNick, memberPhone } },
      fetchPolicy: "network-only",
    });

    const success = Boolean(result?.data?.forgotPassword?.success);
    if (success) {
      await sweetTopSuccessAlert("Credentials verified. You can now reset your password");
      return true;
    }

    await sweetMixinErrorAlert("Credentials do not match");
    return false;
  } catch (err: any) {
    await sweetMixinErrorAlert(err?.graphQLErrors?.[0]?.message ?? "Verification failed");
    return false;
  }
};

export const resetPassword = async (
  memberNick: string,
  memberPhone: string,
  newPassword: string,
): Promise<boolean> => {
  const apolloClient = await initializeApollo();
  try {
    const result = await apolloClient.mutate({
      mutation: RESET_PASSWORD,
      variables: { input: { memberNick, memberPhone, newPassword } },
      fetchPolicy: "network-only",
    });

    const success = Boolean(result?.data?.resetPassword?.success);
    if (success) {
      await sweetTopSuccessAlert("Password has been reset successfully");
      return true;
    }

    await sweetMixinErrorAlert("Unable to reset password");
    return false;
  } catch (err: any) {
    await sweetMixinErrorAlert(err?.graphQLErrors?.[0]?.message ?? "Reset password failed");
    return false;
  }
};

const requestMemberSignUpToken = async ({
  nick,
  password,
  phone,
  gender,
}: {
  nick: string;
  password: string;
  phone: string;
  gender?: Gender;
}): Promise<{ jwtToken: string }> => {
  const apolloClient = await initializeApollo();

  try {
    const result = await apolloClient.mutate({
      mutation: SIGN_UP,
      variables: {
        input: {
          memberNick: nick,
          memberPassword: password,
          memberPhone: phone,
          memberType: MemberType.PATIENT,
          memberGender: gender,
        },
      },
      fetchPolicy: "network-only",
    });

    const { accessToken } = result?.data?.signup ?? {};
    return { jwtToken: accessToken };
  } catch (err: any) {
    const gqlMessage = err?.graphQLErrors?.[0]?.message ?? "";
    if (gqlMessage.includes("already exists")) {
      await sweetMixinErrorAlert("Nickname or phone already exists");
    } else {
      await sweetMixinErrorAlert("Signup failed. Please try again.");
    }
    throw new Error("member signup token error");
  }
};

const requestDoctorSignUpToken = async (input: {
  memberNick: string;
  memberPassword: string;
  memberPhone: string;
  memberFullName: string;
  memberGender?: Gender;
  licenseNumber: string;
  specialization: Specialization | Specialization[];
  experience: number;
  consultationFee: number;
  languages?: string[];
  consultationType?: string;
  memberDesc?: string;
  workingDays?: string[];
  workingHours?: string[];
  breakTime?: string[];
}): Promise<{ jwtToken: string }> => {
  const apolloClient = await initializeApollo();

  try {
    const result = await apolloClient.mutate({
      mutation: DOCTOR_SIGNUP,
      variables: { input },
      fetchPolicy: "network-only",
    });

    const { accessToken } = result?.data?.doctorSignup ?? {};
    return { jwtToken: accessToken };
  } catch (err: any) {
    const gqlMessage = err?.graphQLErrors?.[0]?.message ?? "";
    if (gqlMessage.includes("already exists")) {
      await sweetErrorHandling({ message: "Doctor nickname/phone/license already exists" });
    } else {
      await sweetErrorHandling({ message: gqlMessage || "Doctor signup failed. Please try again." });
    }
    throw new Error(gqlMessage || "Doctor signup failed");
  }
};

export const updateStorage = ({ jwtToken }: { jwtToken: string }) => {
  setJwtToken(jwtToken);
  window.localStorage.setItem("login", Date.now().toString());
};

export const updateUserInfo = (jwtToken: string): CustomJwtPayloadMember | null => {
  if (!jwtToken) return null;

  const claims = decodeJWT<CustomJwtPayloadMember & CustomJwtPayloadDoctor>(jwtToken);
  const memberType = claims?.memberType ?? "";

  if (memberType === MemberType.DOCTOR) {
    doctorVar({
      _id: claims._id ?? "",
      memberType: claims.memberType ?? "",
      memberStatus: claims.memberStatus ?? "",
      totalPatients: claims.totalPatients ?? 0,
      memberPhone: claims.memberPhone ?? "",
      memberNick: claims.memberNick ?? "",
      memberFullName: claims.memberFullName ?? "",
      memberImage: claims.memberImage ?? "",
      memberAddress: claims.memberAddress ?? "",
      memberDesc: claims.memberDesc ?? "",
      memberGender: claims.memberGender ?? "",
      memberArticles: claims.memberArticles ?? 0,
      memberLikes: claims.memberLikes ?? 0,
      memberViews: claims.memberViews ?? 0,
      memberWarnings: claims.memberWarnings ?? 0,
      memberBlocks: claims.memberBlocks ?? 0,
      licenseNumber: claims.licenseNumber ?? "",
      specialization: claims.specialization ?? "",
      experience: claims.experience ?? 0,
      languages: claims.languages ?? [],
      clinicName: claims.clinicName ?? "",
      clinicAddress: claims.clinicAddress ?? "",
      consultationFee: claims.consultationFee ?? 0,
      consultationType: claims.consultationType ?? "",
      workingDays: claims.workingDays ?? [],
      workingHours: claims.workingHours ?? [],
      breakTime: claims.breakTime ?? [],
      reviewCount: claims.reviewCount ?? 0,
      awards: claims.awards ?? [],
    });
  }

  userVar({
    _id: claims._id ?? "",
    memberType: claims.memberType ?? "",
    memberStatus: claims.memberStatus ?? "",
    memberPhone: claims.memberPhone ?? "",
    memberNick: claims.memberNick ?? "",
    memberFullName: claims.memberFullName ?? "",
    memberImage:
      claims.memberImage === null || claims.memberImage === undefined
        ? "/img/defaultUser.svg"
        : `${claims.memberImage}`,
    memberAddress: claims.memberAddress ?? "",
    memberDesc: claims.memberDesc ?? "",
    memberGender: claims.memberGender ?? "",
    memberArticles: claims.memberArticles ?? 0,
    memberLikes: claims.memberLikes ?? 0,
    memberViews: claims.memberViews ?? 0,
    memberWarnings: claims.memberWarnings ?? 0,
    memberBlocks: claims.memberBlocks ?? 0,
    isActive: claims.isActive ?? true,
    lastLogin: claims.lastLogin ?? null,
    bloodGroup: claims.bloodGroup ?? "",
    allergies: claims.allergies ?? [],
    chronicDiseases: claims.chronicDiseases ?? [],
    emergencyContact: claims.emergencyContact ?? "",
  });

  return claims;
};

export const logOut = (shouldReload: boolean = true) => {
  deleteStorage();
  deleteUserInfo();
  if (shouldReload && typeof window !== "undefined") window.location.href = "/";
};

const deleteStorage = () => {
  if (typeof window === "undefined") return;
  localStorage.removeItem("accessToken");
  removeAuthCookie();
  window.localStorage.setItem("logout", Date.now().toString());
};

const deleteUserInfo = () => {
  userVar({
    _id: "",
    memberType: "",
    memberStatus: "",
    memberPhone: "",
    memberNick: "",
    memberFullName: "",
    memberImage: "",
    memberAddress: "",
    memberDesc: "",
    memberGender: "",
    memberArticles: 0,
    memberLikes: 0,
    memberViews: 0,
    memberWarnings: 0,
    memberBlocks: 0,
    isActive: true,
    lastLogin: null,
    bloodGroup: "",
    allergies: [],
    chronicDiseases: [],
    emergencyContact: "",
  });

  doctorVar({
    _id: "",
    memberType: "",
    memberStatus: "",
    totalPatients: 0,
    memberPhone: "",
    memberNick: "",
    memberFullName: "",
    memberImage: "",
    memberAddress: "",
    memberDesc: "",
    memberGender: "",
    memberArticles: 0,
    memberLikes: 0,
    memberViews: 0,
    memberWarnings: 0,
    memberBlocks: 0,
    licenseNumber: "",
    specialization: "",
    experience: 0,
    languages: [],
    clinicName: "",
    clinicAddress: "",
    consultationFee: 0,
    consultationType: "",
    workingDays: [],
    workingHours: [],
    breakTime: [],
    reviewCount: 0,
    awards: [],
  });
};
