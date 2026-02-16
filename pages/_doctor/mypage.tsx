import React, { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import {
  Avatar,
  Box,
  Button,
  CircularProgress,
  MenuItem,
  Stack,
  Switch,
  TextField,
  Typography,
} from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import axios from "axios";
import { useMutation, useQuery, useReactiveVar } from "@apollo/client";
import withLayoutDoctor from "@/libs/components/layout/LayoutDoctor";
import { doctorVar } from "@/apollo/store";
import { getJwtToken, updateStorage, updateUserInfo } from "@/libs/auth";
import { GET_DOCTOR } from "@/apollo/doctor/query";
import { UPDATE_DOCTOR } from "@/apollo/doctor/mutation";
import {
  GET_BOARD_ARTICLES,
  GET_MEMBER_FOLLOWERS,
  GET_MEMBER_FOLLOWINGS,
} from "@/apollo/user/query";
import {
  SUBSCRIBE_DOCTOR,
  SUBSCRIBE_MEMBER,
  UNSUBSCRIBE_DOCTOR,
  UNSUBSCRIBE_MEMBER,
} from "@/apollo/user/mutation";
import { Doctor } from "@/libs/types/doctors/doctor";
import { DoctorUpdate } from "@/libs/types/doctors/doctor.update";
import { FollowInquiry } from "@/libs/types/follow/follow.input";
import { Followers, Followings } from "@/libs/types/follow/follow";
import { BoardArticle, BoardArticles } from "@/libs/types/board-article/board-article";
import { BoardArticlesInquiry } from "@/libs/types/board-article/board-article.input";
import { MemberType } from "@/libs/enums/member.enum";
import { DayOfWeek } from "@/libs/enums/day-of-week.enum";
import { Specialization } from "@/libs/enums/specialization.enum";
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from "@/libs/sweetAlert";

type MyPageTab =
  | "profile"
  | "schedule"
  | "clinic"
  | "followers"
  | "followings"
  | "articles";

type WorkDay = {
  key: string;
  label: string;
  enabled: boolean;
  morningStart: string;
  morningEnd: string;
  afternoonStart: string;
  afternoonEnd: string;
};

type ProfileState = {
  image: string;
  fullName: string;
  phone: string;
  description: string;
};

type FollowListItem = {
  id: string;
  name: string;
  image: string;
  memberType?: MemberType;
  followedByMe: boolean;
};

interface GetDoctorResponse {
  getDoctor: Doctor;
}

interface GetDoctorVariables {
  input: string;
}

interface GetFollowersResponse {
  getMemberFollowers: Followers;
}

interface GetFollowingsResponse {
  getMemberFollowings: Followings;
}

interface GetFollowVariables {
  input: FollowInquiry;
}

interface GetBoardArticlesResponse {
  getBoardArticles: BoardArticles;
}

interface GetBoardArticlesVariables {
  input: BoardArticlesInquiry;
}

interface UpdateDoctorResponse {
  updateDoctor: Doctor;
}

interface UpdateDoctorVariables {
  input: DoctorUpdate;
}

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:3004";

const tabFromQuery = (value: string | string[] | undefined): MyPageTab => {
  const one = Array.isArray(value) ? value[0] : value;
  if (
    one === "schedule" ||
    one === "clinic" ||
    one === "followers" ||
    one === "followings" ||
    one === "articles"
  ) {
    return one;
  }
  return "profile";
};

const toAbsoluteMediaUrl = (value?: string): string => {
  const src = String(value || "").trim();
  if (!src) return "";
  if (src.startsWith("blob:")) return src;
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/img/")) return src;
  if (src.startsWith("/uploads/")) return `${API_BASE_URL}${src}`;
  if (src.startsWith("uploads/")) return `${API_BASE_URL}/${src}`;
  return src;
};

const isFollowedByMe = (value: any): boolean => {
  if (!value) return false;
  if (Array.isArray(value)) return value.some((item) => Boolean(item?.myFollowing));
  return Boolean(value?.myFollowing);
};

const normalizeLanguage = (value: string): string => {
  const raw = String(value || "").trim();
  if (!raw) return "";
  const lower = raw.toLowerCase();
  if (lower === "uzbbek" || lower === "uzbek") return "Uzbek";
  return raw.charAt(0).toUpperCase() + raw.slice(1).toLowerCase();
};

const normalizeLanguageList = (values: string[] = []): string[] => {
  const next: string[] = [];
  const seen = new Set<string>();
  values.forEach((value) => {
    const normalized = normalizeLanguage(value);
    if (!normalized) return;
    const key = normalized.toLowerCase();
    if (seen.has(key)) return;
    seen.add(key);
    next.push(normalized);
  });
  return next;
};

const SPECIALIZATION_OPTIONS = Object.values(Specialization);

const SPECIALIZATION_LABELS: Record<Specialization, string> = {
  [Specialization.CARDIOLOGIST]: "Cardiologist",
  [Specialization.DERMATOLOGIST]: "Dermatologist",
  [Specialization.PEDIATRICIAN]: "Pediatrician",
  [Specialization.PSYCHIATRIST]: "Psychiatrist",
  [Specialization.NEUROLOGIST]: "Neurologist",
  [Specialization.ORTHOPEDIC]: "Orthopedic",
  [Specialization.ENT_SPECIALIST]: "ENT Specialist",
  [Specialization.GENERAL_PHYSICIAN]: "General Physician",
  [Specialization.GYNECOLOGIST]: "Gynecologist",
  [Specialization.DENTIST]: "Dentist",
  [Specialization.OPHTHALMOLOGIST]: "Ophthalmologist",
  [Specialization.UROLOGIST]: "Urologist",
  [Specialization.GASTROENTEROLOGIST]: "Gastroenterologist",
  [Specialization.PULMONOLOGIST]: "Pulmonologist",
  [Specialization.ENDOCRINOLOGIST]: "Endocrinologist",
  [Specialization.ONCOLOGIST]: "Oncologist",
  [Specialization.RADIOLOGIST]: "Radiologist",
  [Specialization.ANESTHESIOLOGIST]: "Anesthesiologist",
  [Specialization.PATHOLOGIST]: "Pathologist",
  [Specialization.RHEUMATOLOGIST]: "Rheumatologist",
};

const DEFAULT_LANGUAGES = [
  "English",
  "Spanish",
  "French",
  "German",
  "Korean",
  "Russian",
  "Uzbek",
];

const WEEKDAY_CONFIG: Array<{ key: string; label: string; day: DayOfWeek }> = [
  { key: "mon", label: "Monday", day: DayOfWeek.MONDAY },
  { key: "tue", label: "Tuesday", day: DayOfWeek.TUESDAY },
  { key: "wed", label: "Wednesday", day: DayOfWeek.WEDNESDAY },
  { key: "thu", label: "Thursday", day: DayOfWeek.THURSDAY },
  { key: "fri", label: "Friday", day: DayOfWeek.FRIDAY },
  { key: "sat", label: "Saturday", day: DayOfWeek.SATURDAY },
  { key: "sun", label: "Sunday", day: DayOfWeek.SUNDAY },
];

const TIME_OPTIONS = [
  "00:00",
  "01:00",
  "02:00",
  "03:00",
  "04:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "12:00",
  "13:00",
  "14:00",
  "15:00",
  "16:00",
  "17:00",
  "18:00",
  "19:00",
  "20:00",
  "21:00",
  "22:00",
  "23:00",
];

const normalizeTime = (value: string | undefined, fallback: string): string => {
  const next = String(value || "").trim();
  if (!next) return fallback;
  return /^\d{2}:\d{2}$/.test(next) ? next : fallback;
};

const getTimeOptions = (value?: string) => {
  const normalized = String(value || "").trim();
  if (normalized && !TIME_OPTIONS.includes(normalized)) {
    return [normalized, ...TIME_OPTIONS];
  }
  return TIME_OPTIONS;
};

const WEEKLY_HOURS_CACHE_KEY_PREFIX = "doctor-mypage-weekly-hours-v1:";

const buildWeeklyHours = (
  workingDays: string[] = [],
  workingHours: string[] = [],
  breakTime: string[] = [],
): WorkDay[] => {
  const start = normalizeTime(workingHours[0], "09:00");
  const end = normalizeTime(workingHours[1], "17:00");
  const breakStart = normalizeTime(breakTime[0], "12:00");
  const breakEnd = normalizeTime(breakTime[1], "13:00");

  return WEEKDAY_CONFIG.map((item) => ({
    key: item.key,
    label: item.label,
    enabled: workingDays.includes(item.day),
    morningStart: start,
    morningEnd: breakStart,
    afternoonStart: breakEnd,
    afternoonEnd: end,
  }));
};

const getWeeklyHoursCacheKey = (doctorId: string) =>
  `${WEEKLY_HOURS_CACHE_KEY_PREFIX}${doctorId}`;

const loadWeeklyHoursCache = (doctorId: string): WorkDay[] | null => {
  if (!doctorId || typeof window === "undefined") return null;
  try {
    const raw = window.localStorage.getItem(getWeeklyHoursCacheKey(doctorId));
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return null;
    if (parsed.length !== WEEKDAY_CONFIG.length) return null;
    return parsed as WorkDay[];
  } catch {
    return null;
  }
};

const saveWeeklyHoursCache = (doctorId: string, value: WorkDay[]) => {
  if (!doctorId || typeof window === "undefined") return;
  try {
    window.localStorage.setItem(getWeeklyHoursCacheKey(doctorId), JSON.stringify(value));
  } catch {
    // no-op
  }
};

const DoctorMyPage: NextPage = () => {
  const router = useRouter();
  const doctor = useReactiveVar(doctorVar);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [activeTab, setActiveTab] = useState<MyPageTab>("profile");
  const doctorId = doctor?._id || "";

  const [profile, setProfile] = useState<ProfileState>({
    image: "/img/defaultUser.svg",
    fullName: "",
    phone: "",
    description: "",
  });
  const [initialProfile, setInitialProfile] = useState<ProfileState>({
    image: "/img/defaultUser.svg",
    fullName: "",
    phone: "",
    description: "",
  });

  const [imageFileName, setImageFileName] = useState<string>("");
  const [uploadedDoctorImagePath, setUploadedDoctorImagePath] = useState("");
  const [uploadingImage, setUploadingImage] = useState(false);
  const [languageSelections, setLanguageSelections] = useState<string[]>([]);
  const [selectedSpecializations, setSelectedSpecializations] = useState<Specialization[]>([]);
  const [clinic, setClinic] = useState({ city: "", address: "" });
  const [weeklyHours, setWeeklyHours] = useState<WorkDay[]>(buildWeeklyHours());
  const [scheduleTimeSourceKey, setScheduleTimeSourceKey] = useState<string>("");

  useEffect(() => {
    const token = getJwtToken();
    if (!doctor?._id && token) {
      updateUserInfo(token);
      return;
    }
    if (!token) {
      router.replace("/auth/login");
    }
  }, [doctor, router]);

  const {
    loading: getDoctorLoading,
    data: getDoctorData,
    refetch: getDoctorRefetch,
  } = useQuery<GetDoctorResponse, GetDoctorVariables>(GET_DOCTOR, {
    fetchPolicy: "cache-and-network",
    variables: { input: doctorId },
    notifyOnNetworkStatusChange: true,
    skip: !doctorId,
  });

  const followersInput = useMemo<FollowInquiry>(
    () => ({ page: 1, limit: 1000, search: { followingId: doctorId } }),
    [doctorId],
  );
  const followingsInput = useMemo<FollowInquiry>(
    () => ({ page: 1, limit: 1000, search: { followerId: doctorId } }),
    [doctorId],
  );

  const {
    loading: getFollowersLoading,
    data: getFollowersData,
    refetch: getFollowersRefetch,
  } = useQuery<GetFollowersResponse, GetFollowVariables>(GET_MEMBER_FOLLOWERS, {
    fetchPolicy: "cache-and-network",
    variables: { input: followersInput },
    notifyOnNetworkStatusChange: true,
    skip: !doctorId,
  });

  const {
    loading: getFollowingsLoading,
    data: getFollowingsData,
    refetch: getFollowingsRefetch,
  } = useQuery<GetFollowingsResponse, GetFollowVariables>(GET_MEMBER_FOLLOWINGS, {
    fetchPolicy: "cache-and-network",
    variables: { input: followingsInput },
    notifyOnNetworkStatusChange: true,
    skip: !doctorId,
  });

  const myArticlesInput = useMemo<BoardArticlesInquiry>(
    () => ({
      page: 1,
      limit: 200,
      sort: "createdAt",
      direction: "DESC" as unknown as BoardArticlesInquiry["direction"],
      search: {},
    }),
    [],
  );

  const {
    loading: getArticlesLoading,
    data: getArticlesData,
    refetch: getArticlesRefetch,
  } = useQuery<GetBoardArticlesResponse, GetBoardArticlesVariables>(GET_BOARD_ARTICLES, {
    fetchPolicy: "cache-and-network",
    variables: { input: myArticlesInput },
    notifyOnNetworkStatusChange: true,
    skip: !doctorId,
  });

  const [updateDoctor, { loading: updateDoctorLoading }] = useMutation<
    UpdateDoctorResponse,
    UpdateDoctorVariables
  >(UPDATE_DOCTOR);
  const [subscribeMember, { loading: subscribeMemberLoading }] = useMutation(SUBSCRIBE_MEMBER);
  const [unsubscribeMember, { loading: unsubscribeMemberLoading }] = useMutation(UNSUBSCRIBE_MEMBER);
  const [subscribeDoctor, { loading: subscribeDoctorLoading }] = useMutation(SUBSCRIBE_DOCTOR);
  const [unsubscribeDoctor, { loading: unsubscribeDoctorLoading }] = useMutation(UNSUBSCRIBE_DOCTOR);

  const currentDoctor = getDoctorData?.getDoctor;

  useEffect(() => {
    if (!router.isReady) return;
    setActiveTab(tabFromQuery(router.query.category));
  }, [router.isReady, router.query.category]);

  useEffect(() => {
    if (!currentDoctor) return;
    const nextProfile: ProfileState = {
      image: toAbsoluteMediaUrl(currentDoctor.memberImage) || "/img/defaultUser.svg",
      fullName: currentDoctor.memberFullName || currentDoctor.memberNick || "",
      phone: currentDoctor.memberPhone || "",
      description: currentDoctor.memberDesc || "",
    };

    setProfile(nextProfile);
    setInitialProfile(nextProfile);
    setLanguageSelections(normalizeLanguageList(currentDoctor.languages || []));
    const specializationValue = (currentDoctor as any)?.specialization;
    const specializationList = Array.isArray(specializationValue)
      ? specializationValue
      : specializationValue
        ? [specializationValue]
        : [];
    setSelectedSpecializations(
      specializationList.filter((value: string) =>
        SPECIALIZATION_OPTIONS.includes(value as Specialization),
      ) as Specialization[],
    );
    setClinic({
      city: currentDoctor.clinicName || "",
      address: currentDoctor.clinicAddress || "",
    });
    const fallbackWeeklyHours = buildWeeklyHours(
      currentDoctor.workingDays || [],
      currentDoctor.workingHours || [],
      currentDoctor.breakTime || [],
    );
    const cachedWeeklyHours = loadWeeklyHoursCache(doctorId);
    if (cachedWeeklyHours) {
      const merged = WEEKDAY_CONFIG.map((item, index) => {
        const cached = cachedWeeklyHours[index];
        const fallback = fallbackWeeklyHours[index];
        return {
          ...fallback,
          morningStart: cached?.morningStart || fallback.morningStart,
          morningEnd: cached?.morningEnd || fallback.morningEnd,
          afternoonStart: cached?.afternoonStart || fallback.afternoonStart,
          afternoonEnd: cached?.afternoonEnd || fallback.afternoonEnd,
        };
      });
      setWeeklyHours(merged);
    } else {
      setWeeklyHours(fallbackWeeklyHours);
    }
    const firstEnabledKey =
      WEEKDAY_CONFIG.find((item) => (currentDoctor.workingDays || []).includes(item.day))?.key ||
      WEEKDAY_CONFIG[0].key;
    setScheduleTimeSourceKey(firstEnabledKey);
    setUploadedDoctorImagePath("");
  }, [currentDoctor, doctorId]);

  const availableLanguages = useMemo(() => {
    const dynamic = normalizeLanguageList(currentDoctor?.languages || []);
    return normalizeLanguageList([...DEFAULT_LANGUAGES, ...dynamic]);
  }, [currentDoctor?.languages]);

  const followers = useMemo<FollowListItem[]>(
    () =>
      (getFollowersData?.getMemberFollowers?.list ?? []).map((row) => ({
        id: row.followerData?._id || row.followerId || row._id,
        name: row.followerData?.memberNick || "Unknown",
        image: toAbsoluteMediaUrl(row.followerData?.memberImage) || "/img/defaultUser.svg",
        memberType: row.followerData?.memberType as MemberType | undefined,
        followedByMe: isFollowedByMe(row.meFollowed),
      })),
    [getFollowersData],
  );

  const followings = useMemo<FollowListItem[]>(
    () =>
      (getFollowingsData?.getMemberFollowings?.list ?? []).map((row) => ({
        id: row.followingData?._id || row.followingId || row._id,
        name: row.followingData?.memberNick || "Unknown",
        image: toAbsoluteMediaUrl(row.followingData?.memberImage) || "/img/defaultUser.svg",
        memberType: row.followingData?.memberType as MemberType | undefined,
        followedByMe: isFollowedByMe(row.meFollowed) || true,
      })),
    [getFollowingsData],
  );

  const followersCount =
    getFollowersData?.getMemberFollowers?.metaCounter?.[0]?.total ??
    currentDoctor?.memberFollowers ??
    followers.length;
  const followingsCount =
    getFollowingsData?.getMemberFollowings?.metaCounter?.[0]?.total ??
    currentDoctor?.memberFollowings ??
    followings.length;

  const myArticles = useMemo(
    () =>
      (getArticlesData?.getBoardArticles?.list ?? [])
        .filter((article: BoardArticle) => article.memberId === doctorId)
        .map((article) => ({ id: article._id, title: article.articleTitle })),
    [getArticlesData, doctorId],
  );
  const myArticlesCount = myArticles.length;

  const hasProfileChanges = useMemo(() => {
    const profileChanged =
      profile.fullName.trim() !== initialProfile.fullName ||
      profile.phone.trim() !== initialProfile.phone ||
      profile.description.trim() !== initialProfile.description ||
      Boolean(uploadedDoctorImagePath);

    const languageChanged =
      [...languageSelections].sort().join("|") !==
      [...(currentDoctor?.languages || [])].sort().join("|");
    const currentSpecializationRaw = (currentDoctor as any)?.specialization;
    const currentSpecializations = Array.isArray(currentSpecializationRaw)
      ? currentSpecializationRaw
      : currentSpecializationRaw
        ? [currentSpecializationRaw]
        : [];
    const specializationChanged =
      [...selectedSpecializations].sort().join("|") !==
      [...(currentSpecializations as string[])].sort().join("|");

    return profileChanged || languageChanged || specializationChanged;
  }, [
    currentDoctor?.languages,
    currentDoctor?.specialization,
    initialProfile.description,
    initialProfile.fullName,
    initialProfile.phone,
    languageSelections,
    profile.description,
    profile.fullName,
    profile.phone,
    selectedSpecializations,
    uploadedDoctorImagePath,
  ]);

  const hasClinicChanges = useMemo(() => {
    return (
      clinic.city.trim() !== String(currentDoctor?.clinicName || "").trim() ||
      clinic.address.trim() !== String(currentDoctor?.clinicAddress || "").trim()
    );
  }, [clinic.address, clinic.city, currentDoctor?.clinicAddress, currentDoctor?.clinicName]);

  const hasScheduleChanges = useMemo(() => {
    const enabledDays = weeklyHours
      .filter((day) => day.enabled)
      .map((day) => {
        const meta = WEEKDAY_CONFIG.find((item) => item.key === day.key);
        return meta?.day || "";
      })
      .filter(Boolean);
    const currentDays = currentDoctor?.workingDays || [];
    if ([...enabledDays].sort().join("|") !== [...currentDays].sort().join("|")) return true;

    const sourceDay =
      weeklyHours.find((day) => day.key === scheduleTimeSourceKey) ||
      weeklyHours.find((day) => day.enabled) ||
      weeklyHours[0];
    const nextWorkingHours = [
      sourceDay?.morningStart || "",
      sourceDay?.afternoonEnd || "",
    ].join("|");
    const nextBreakTime = [
      sourceDay?.morningEnd || "",
      sourceDay?.afternoonStart || "",
    ].join("|");
    const currentWorkingHours = (currentDoctor?.workingHours || []).join("|");
    const currentBreakTime = (currentDoctor?.breakTime || []).join("|");

    return nextWorkingHours !== currentWorkingHours || nextBreakTime !== currentBreakTime;
  }, [
    currentDoctor?.breakTime,
    currentDoctor?.workingDays,
    currentDoctor?.workingHours,
    scheduleTimeSourceKey,
    weeklyHours,
  ]);

  const updateWorkDay = (key: string, patch: Partial<WorkDay>) => {
    const isTimePatch =
      patch.morningStart !== undefined ||
      patch.morningEnd !== undefined ||
      patch.afternoonStart !== undefined ||
      patch.afternoonEnd !== undefined;
    if (isTimePatch) setScheduleTimeSourceKey(key);
    setWeeklyHours((prev) =>
      prev.map((day) => (day.key === key ? { ...day, ...patch } : day)),
    );
  };

  const toggleLanguage = (language: string) => {
    setLanguageSelections((prev) =>
      prev.includes(language)
        ? prev.filter((value) => value !== language)
        : [...prev, language],
    );
  };

  const updateTab = (next: MyPageTab) => {
    setActiveTab(next);
    if (next === "profile") {
      router.push("/_doctor/mypage", undefined, { shallow: true });
      return;
    }
    router.push(`/_doctor/mypage?category=${next}`, undefined, { shallow: true });
  };

  const uploadDoctorImage = async (file: File): Promise<string> => {
    const token = getJwtToken();
    const graphqlUrl =
      process.env.NEXT_PUBLIC_API_GRAPHQL_URL ||
      process.env.REACT_APP_API_GRAPHQL_URL ||
      "http://localhost:3004/graphql";

    const formData = new FormData();
    formData.append(
      "operations",
      JSON.stringify({
        query: `mutation ImageUploader($file: Upload!, $target: String!) {
          imageUploader(file: $file, target: $target)
        }`,
        variables: {
          file: null,
          target: "member",
        },
      }),
    );
    formData.append("map", JSON.stringify({ "0": ["variables.file"] }));
    formData.append("0", file, file.name);

    const response = await axios.post(graphqlUrl, formData, {
      headers: {
        "Content-Type": "multipart/form-data",
        "apollo-require-preflight": "true",
        Authorization: token ? `Bearer ${token}` : "",
      },
    });

    const uploaded = response?.data?.data?.imageUploader;
    if (!uploaded) throw new Error("Image upload failed");
    return String(uploaded);
  };

  const handleImageUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setImageFileName(file.name);
    const localUrl = URL.createObjectURL(file);
    setProfile((prev) => ({ ...prev, image: localUrl }));

    try {
      setUploadingImage(true);
      const uploadedPath = await uploadDoctorImage(file);
      setUploadedDoctorImagePath(uploadedPath);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    } finally {
      setUploadingImage(false);
    }
  };

  const runDoctorRefreshes = async () => {
    if (!doctorId) return;
    await Promise.all([
      getDoctorRefetch({ input: doctorId }),
      getFollowersRefetch({ input: followersInput }),
      getFollowingsRefetch({ input: followingsInput }),
      getArticlesRefetch({ input: myArticlesInput }),
    ]);
  };

  const handleSaveProfile = async () => {
    try {
      if (!doctorId) return;

      const result = await updateDoctor({
        variables: {
          input: {
            _id: doctorId,
            memberFullName: profile.fullName.trim(),
            memberPhone: profile.phone.trim(),
            memberDesc: profile.description.trim(),
            memberImage: uploadedDoctorImagePath || undefined,
            languages: normalizeLanguageList(languageSelections),
            specialization: selectedSpecializations.length
              ? selectedSpecializations
              : undefined,
          },
        },
      });

      const accessToken = result?.data?.updateDoctor?.accessToken;
      if (accessToken) {
        updateStorage({ jwtToken: accessToken });
        updateUserInfo(accessToken);
      }

      await runDoctorRefreshes();
      await sweetTopSmallSuccessAlert("Profile updated", 900);
      setImageFileName("");
      setUploadedDoctorImagePath("");
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const handleSaveSchedule = async () => {
    try {
      if (!doctorId) return;
      const enabledDays = weeklyHours
        .filter((day) => day.enabled)
        .map((day) => WEEKDAY_CONFIG.find((item) => item.key === day.key)?.day)
        .filter(Boolean) as string[];
      const sourceDay =
        weeklyHours.find((day) => day.key === scheduleTimeSourceKey) ||
        weeklyHours.find((day) => day.enabled) ||
        weeklyHours[0];

      await updateDoctor({
        variables: {
          input: {
            _id: doctorId,
            workingDays: enabledDays,
            workingHours: sourceDay
              ? [sourceDay.morningStart, sourceDay.afternoonEnd]
              : [],
            breakTime: sourceDay
              ? [sourceDay.morningEnd, sourceDay.afternoonStart]
              : [],
          },
        },
      });
      saveWeeklyHoursCache(doctorId, weeklyHours);

      await runDoctorRefreshes();
      await sweetTopSmallSuccessAlert("Schedule updated", 900);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const handleSaveClinic = async () => {
    try {
      if (!doctorId) return;
      await updateDoctor({
        variables: {
          input: {
            _id: doctorId,
            clinicName: clinic.city.trim(),
            clinicAddress: clinic.address.trim(),
          },
        },
      });

      await runDoctorRefreshes();
      await sweetTopSmallSuccessAlert("Clinic details updated", 900);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const handleFollowToggle = async (
    targetId: string,
    targetType: MemberType | undefined,
    currentlyFollowing: boolean,
  ) => {
    try {
      if (!targetId || !doctorId) return;
      if (targetId === doctorId) return;

      if (currentlyFollowing) {
        if (targetType === MemberType.DOCTOR) {
          await unsubscribeDoctor({ variables: { input: targetId } });
        } else {
          await unsubscribeMember({ variables: { input: targetId } });
        }
      } else if (targetType === MemberType.DOCTOR) {
        await subscribeDoctor({ variables: { input: targetId } });
      } else {
        await subscribeMember({ variables: { input: targetId } });
      }

      await Promise.all([
        getFollowersRefetch({ input: followersInput }),
        getFollowingsRefetch({ input: followingsInput }),
        getDoctorRefetch({ input: doctorId }),
      ]);
      await sweetTopSmallSuccessAlert("Success!", 800);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const followMutationLoading =
    subscribeMemberLoading ||
    unsubscribeMemberLoading ||
    subscribeDoctorLoading ||
    unsubscribeDoctorLoading;

  if (!doctorId || getDoctorLoading) {
    return (
      <Stack
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          width: "100%",
          minHeight: "70vh",
        }}
      >
        <CircularProgress size={"3rem"} />
      </Stack>
    );
  }

  return (
    <Box className="doctor-mypage" sx={{ position: "relative" }}>
      {(updateDoctorLoading || uploadingImage || followMutationLoading) && (
        <Stack
          sx={{
            position: "absolute",
            inset: 0,
            zIndex: 20,
            background: "rgba(255,255,255,0.55)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <CircularProgress size={"3rem"} />
        </Stack>
      )}

      <Box className="doctor-mypage__header">
        <Typography className="doctor-mypage__title">Doctor Settings</Typography>
        <Typography className="doctor-mypage__subtitle">
          Manage your profile, schedule, clinic details, and social stats.
        </Typography>
      </Box>

      <Stack direction="row" className="doctor-mypage__tabs">
        <button
          className={`doctor-mypage__tab ${activeTab === "profile" ? "active" : ""}`}
          onClick={() => updateTab("profile")}
        >
          Profile Information
        </button>
        <button
          className={`doctor-mypage__tab ${activeTab === "schedule" ? "active" : ""}`}
          onClick={() => updateTab("schedule")}
        >
          Schedule & Availability
        </button>
        <button
          className={`doctor-mypage__tab ${activeTab === "clinic" ? "active" : ""}`}
          onClick={() => updateTab("clinic")}
        >
          Clinic Details
        </button>
        <button
          className={`doctor-mypage__tab ${activeTab === "followers" ? "active" : ""}`}
          onClick={() => updateTab("followers")}
        >
          Followers ({followersCount})
        </button>
        <button
          className={`doctor-mypage__tab ${activeTab === "followings" ? "active" : ""}`}
          onClick={() => updateTab("followings")}
        >
          Followings ({followingsCount})
        </button>
        <button
          className={`doctor-mypage__tab ${activeTab === "articles" ? "active" : ""}`}
          onClick={() => updateTab("articles")}
        >
          My Articles ({myArticlesCount})
        </button>
      </Stack>

      <Box className="doctor-mypage__panel">
        {activeTab === "profile" && (
          <Box className="doctor-mypage__section">
            <Typography className="doctor-mypage__section-title">
              Profile Information
            </Typography>

            <Stack direction="row" spacing={2.5} className="doctor-mypage__avatar-row">
              <Avatar src={profile.image} className="doctor-mypage__avatar" />
              <Box className="doctor-mypage__upload-box">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="doctor-mypage__file-input"
                  onChange={handleImageUpload}
                />
                <Button
                  variant="outlined"
                  onClick={() => fileInputRef.current?.click()}
                  className="doctor-mypage__upload-btn"
                >
                  Upload Image
                </Button>
                <Typography className="doctor-mypage__upload-hint">
                  {imageFileName || "No file selected"}
                </Typography>
              </Box>
            </Stack>

            <Stack spacing={2} className="doctor-mypage__form">
              <TextField
                fullWidth
                label="Full Name"
                value={profile.fullName}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, fullName: event.target.value }))
                }
              />
              <TextField
                fullWidth
                label="Phone Number"
                value={profile.phone}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, phone: event.target.value }))
                }
              />
              <TextField
                fullWidth
                multiline
                minRows={4}
                label="Description"
                value={profile.description}
                onChange={(event) =>
                  setProfile((prev) => ({ ...prev, description: event.target.value }))
                }
              />
            </Stack>

            <Box className="doctor-mypage__checkbox-group">
              <Typography className="doctor-mypage__group-title">Languages</Typography>
              <Box className="doctor-mypage__checkbox-grid">
                {availableLanguages.map((language) => (
                  <label key={language} className="doctor-mypage__checkbox-item">
                    <input
                      type="checkbox"
                      checked={languageSelections.includes(language)}
                      onChange={() => toggleLanguage(language)}
                    />
                    <span>{language}</span>
                  </label>
                ))}
              </Box>
            </Box>

            <Box className="doctor-mypage__checkbox-group">
              <Typography className="doctor-mypage__group-title">
                Specializations
              </Typography>
              <Box className="doctor-mypage__checkbox-grid">
                {SPECIALIZATION_OPTIONS.map((specialization) => (
                  <label key={specialization} className="doctor-mypage__checkbox-item">
                    <input
                      type="checkbox"
                      checked={selectedSpecializations.includes(specialization)}
                      onChange={() =>
                        setSelectedSpecializations((prev) =>
                          prev.includes(specialization)
                            ? prev.filter((item) => item !== specialization)
                            : [...prev, specialization],
                        )
                      }
                    />
                    <span>{SPECIALIZATION_LABELS[specialization]}</span>
                  </label>
                ))}
              </Box>
            </Box>

            <Box className="doctor-mypage__actions">
              <Button
                variant="contained"
                className={`doctor-mypage__save-btn ${hasProfileChanges ? "active" : ""}`}
                disabled={!hasProfileChanges}
                onClick={handleSaveProfile}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === "schedule" && (
          <Box className="doctor-mypage__section">
            <Typography className="doctor-mypage__section-title">
              Schedule & Availability
            </Typography>

            <Stack spacing={1.2} className="doctor-mypage__weekly-hours">
              <Box
                sx={{
                  display: "grid",
                  gridTemplateColumns: "130px repeat(4, minmax(96px, 1fr)) 70px",
                  alignItems: "center",
                  gap: 1.2,
                  px: 0.5,
                  color: "#64748b",
                  fontSize: "12px",
                  fontWeight: 600,
                }}
              >
                <Typography component="span" sx={{ fontSize: "12px", fontWeight: 600 }}>
                  Day
                </Typography>
                <Typography component="span" sx={{ fontSize: "12px", fontWeight: 600 }}>
                  Work Start
                </Typography>
                <Typography component="span" sx={{ fontSize: "12px", fontWeight: 600 }}>
                  Break Start
                </Typography>
                <Typography component="span" sx={{ fontSize: "12px", fontWeight: 600 }}>
                  Break End
                </Typography>
                <Typography component="span" sx={{ fontSize: "12px", fontWeight: 600 }}>
                  Work End
                </Typography>
                <Typography component="span" sx={{ fontSize: "12px", fontWeight: 600 }}>
                  On
                </Typography>
              </Box>
              {weeklyHours.map((day) => (
                <Box key={day.key} className={`doctor-mypage__day-row ${day.enabled ? "" : "disabled"}`}>
                  <Box className="doctor-mypage__day-name">{day.label}</Box>
                  <TextField
                    select
                    size="small"
                    value={day.morningStart}
                    onChange={(event) =>
                      updateWorkDay(day.key, { morningStart: event.target.value })
                    }
                    disabled={!day.enabled}
                    className="doctor-mypage__time-select"
                  >
                    {getTimeOptions(day.morningStart).map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    value={day.morningEnd}
                    onChange={(event) =>
                      updateWorkDay(day.key, { morningEnd: event.target.value })
                    }
                    disabled={!day.enabled}
                    className="doctor-mypage__time-select"
                  >
                    {getTimeOptions(day.morningEnd).map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    value={day.afternoonStart}
                    onChange={(event) =>
                      updateWorkDay(day.key, { afternoonStart: event.target.value })
                    }
                    disabled={!day.enabled}
                    className="doctor-mypage__time-select"
                  >
                    {getTimeOptions(day.afternoonStart).map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </TextField>
                  <TextField
                    select
                    size="small"
                    value={day.afternoonEnd}
                    onChange={(event) =>
                      updateWorkDay(day.key, { afternoonEnd: event.target.value })
                    }
                    disabled={!day.enabled}
                    className="doctor-mypage__time-select"
                  >
                    {getTimeOptions(day.afternoonEnd).map((time) => (
                      <MenuItem key={time} value={time}>
                        {time}
                      </MenuItem>
                    ))}
                  </TextField>
                  <Switch
                    checked={day.enabled}
                    onChange={(event) =>
                      updateWorkDay(day.key, { enabled: event.target.checked })
                    }
                  />
                </Box>
              ))}
            </Stack>

            <Box className="doctor-mypage__actions">
              <Button
                variant="contained"
                className={`doctor-mypage__save-btn ${hasScheduleChanges ? "active" : ""}`}
                disabled={!hasScheduleChanges}
                onClick={handleSaveSchedule}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        )}
        {activeTab === "clinic" && (
          <Box className="doctor-mypage__section">
            <Typography className="doctor-mypage__section-title">
              Clinic Details
            </Typography>

            <Stack spacing={2} className="doctor-mypage__form">
              <TextField
                fullWidth
                label="City"
                value={clinic.city}
                onChange={(event) =>
                  setClinic((prev) => ({ ...prev, city: event.target.value }))
                }
              />
              <TextField
                fullWidth
                multiline
                minRows={3}
                label="Clinic Address"
                value={clinic.address}
                onChange={(event) =>
                  setClinic((prev) => ({ ...prev, address: event.target.value }))
                }
              />
            </Stack>

            <Box className="doctor-mypage__actions">
              <Button
                variant="contained"
                className={`doctor-mypage__save-btn ${hasClinicChanges ? "active" : ""}`}
                disabled={!hasClinicChanges}
                onClick={handleSaveClinic}
              >
                Save Changes
              </Button>
            </Box>
          </Box>
        )}

        {activeTab === "followers" && (
          <Box className="doctor-mypage__section">
            <Typography className="doctor-mypage__section-title">
              Followers ({followersCount})
            </Typography>
            {getFollowersLoading ? (
              <Stack sx={{ py: 2, alignItems: "center" }}>
                <CircularProgress size={"2rem"} />
              </Stack>
            ) : (
              <Stack spacing={1.2}>
                {followers.length === 0 ? (
                  <Typography className="doctor-mypage__list-item">No followers yet.</Typography>
                ) : (
                  followers.map((item) => (
                    <Box key={item.id} className="doctor-mypage__list-item">
                      <Avatar src={item.image} />
                      <Typography>{item.name}</Typography>
                      <Button
                        variant={item.followedByMe ? "outlined" : "contained"}
                        size="small"
                        onClick={() =>
                          handleFollowToggle(item.id, item.memberType, item.followedByMe)
                        }
                        sx={{ marginLeft: "auto", minWidth: "92px" }}
                      >
                        {item.followedByMe ? "Following" : "Follow"}
                      </Button>
                    </Box>
                  ))
                )}
              </Stack>
            )}
          </Box>
        )}

        {activeTab === "followings" && (
          <Box className="doctor-mypage__section">
            <Typography className="doctor-mypage__section-title">
              Followings ({followingsCount})
            </Typography>
            {getFollowingsLoading ? (
              <Stack sx={{ py: 2, alignItems: "center" }}>
                <CircularProgress size={"2rem"} />
              </Stack>
            ) : (
              <Stack spacing={1.2}>
                {followings.length === 0 ? (
                  <Typography className="doctor-mypage__list-item">No followings yet.</Typography>
                ) : (
                  followings.map((item) => (
                    <Box key={item.id} className="doctor-mypage__list-item">
                      <Avatar src={item.image} />
                      <Typography>{item.name}</Typography>
                      <Button
                        variant="outlined"
                        color="error"
                        size="small"
                        onClick={() => handleFollowToggle(item.id, item.memberType, true)}
                        sx={{ marginLeft: "auto", minWidth: "92px" }}
                      >
                        Unfollow
                      </Button>
                    </Box>
                  ))
                )}
              </Stack>
            )}
          </Box>
        )}

        {activeTab === "articles" && (
          <Box className="doctor-mypage__section">
            <Typography className="doctor-mypage__section-title">
              My Articles ({myArticlesCount})
            </Typography>
            {getArticlesLoading ? (
              <Stack sx={{ py: 2, alignItems: "center" }}>
                <CircularProgress size={"2rem"} />
              </Stack>
            ) : (
              <Stack spacing={1.2}>
                {myArticles.length === 0 ? (
                  <Typography className="doctor-mypage__list-item">No articles yet.</Typography>
                ) : (
                  myArticles.map((article) => (
                    <Box
                      key={article.id}
                      className="doctor-mypage__list-item article clickable"
                      onClick={() => router.push(`/_doctor/community/detail?id=${article.id}`)}
                    >
                      <Typography>{article.title}</Typography>
                    </Box>
                  ))
                )}
              </Stack>
            )}
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default withLayoutDoctor(DoctorMyPage);
