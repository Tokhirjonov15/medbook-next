import React, { useEffect, useMemo, useState } from "react";
import {
  Box,
  CircularProgress,
  OutlinedInput,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import withLayoutDoctor from "@/libs/components/layout/LayoutDoctor";
import PatientCard, {
  PatientCardData,
} from "@/libs/components/_doctorsHome/PatientCard";
import { useApolloClient, useQuery, useReactiveVar } from "@apollo/client";
import { doctorVar } from "@/apollo/store";
import {
  GET_DOCTOR_APPOINTMENTS,
  GET_MEMBER,
  GET_MEMBER_FOLLOWERS,
  GET_MEMBER_FOLLOWINGS,
} from "@/apollo/doctor/query";
import { Appointments, Appointment } from "@/libs/types/appoinment/appoinment";
import { AppointmentsInquiry } from "@/libs/types/appoinment/appoinment.input";
import { Member } from "@/libs/types/members/member";
import { FollowInquiry } from "@/libs/types/follow/follow.input";
import { Followers, Followings } from "@/libs/types/follow/follow";
import { Direction } from "@/libs/enums/common.enum";

interface GetDoctorAppointmentsResponse {
  getDoctorAppointments: Appointments;
}

interface GetDoctorAppointmentsVariables {
  input: AppointmentsInquiry;
}

interface GetMemberResponse {
  getMember: Member;
}

interface GetMemberVariables {
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

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ||
  process.env.REACT_APP_API_URL ||
  "http://localhost:3004";

const toAbsoluteMediaUrl = (value?: string): string => {
  const src = String(value || "").trim();
  if (!src) return "";
  if (/^https?:\/\//i.test(src)) return src;
  if (src.startsWith("/img/")) return src;
  if (src.startsWith("/uploads/")) return `${API_BASE_URL}${src}`;
  if (src.startsWith("uploads/")) return `${API_BASE_URL}/${src}`;
  return src;
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const DoctorPatients: NextPage = () => {
  const router = useRouter();
  const apolloClient = useApolloClient();
  const doctor = useReactiveVar(doctorVar);
  const doctorId = doctor?._id || "";

  const [searchText, setSearchText] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "latest">("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const [memberDetailsMap, setMemberDetailsMap] = useState<
    Record<string, Member>
  >({});
  const [followCountsMap, setFollowCountsMap] = useState<
    Record<string, { followers: number; followings: number }>
  >({});
  const itemsPerPage = 8;

  const appointmentsInput = useMemo<AppointmentsInquiry>(
    () => ({
      page: 1,
      limit: 1000,
      sort: "appointmentDate",
      direction: Direction.DESC,
      search: { doctorId },
    }),
    [doctorId],
  );

  const {
    loading: getDoctorAppointmentsLoading,
    data: getDoctorAppointmentsData,
    error: getDoctorAppointmentsError,
  } = useQuery<GetDoctorAppointmentsResponse, GetDoctorAppointmentsVariables>(
    GET_DOCTOR_APPOINTMENTS,
    {
      fetchPolicy: "cache-and-network",
      variables: { input: appointmentsInput },
      notifyOnNetworkStatusChange: true,
      skip: !doctorId,
    },
  );

  const uniquePatientsBase = useMemo(() => {
    const list = getDoctorAppointmentsData?.getDoctorAppointments?.list ?? [];
    const map = new Map<string, Appointment["patientData"]>();

    list.forEach((appointment: Appointment) => {
      const patientData = appointment.patientData;
      const patientId = patientData?._id || appointment.patient;
      if (!patientId) return;
      if (!map.has(patientId)) {
        map.set(patientId, patientData);
      }
    });

    return Array.from(map.entries()).map(([id, patientData]) => ({
      id,
      patientData,
    }));
  }, [getDoctorAppointmentsData]);

  useEffect(() => {
    let cancelled = false;
    const fetchMembers = async () => {
      if (!uniquePatientsBase.length) {
        if (!cancelled) {
          setMemberDetailsMap({});
          setFollowCountsMap({});
        }
        return;
      }

      const detailEntries = await Promise.all(
        uniquePatientsBase.map(async ({ id }) => {
          try {
            const { data } = await apolloClient.query<
              GetMemberResponse,
              GetMemberVariables
            >({
              query: GET_MEMBER,
              variables: { input: id },
              fetchPolicy: "network-only",
            });
            return [id, data?.getMember] as const;
          } catch {
            return [id, undefined] as const;
          }
        }),
      );

      const followCountEntries = await Promise.all(
        uniquePatientsBase.map(async ({ id }) => {
          try {
            const [followersRes, followingsRes] = await Promise.all([
              apolloClient.query<GetFollowersResponse, GetFollowVariables>({
                query: GET_MEMBER_FOLLOWERS,
                variables: {
                  input: {
                    page: 1,
                    limit: 1,
                    search: { followingId: id },
                  },
                },
                fetchPolicy: "network-only",
              }),
              apolloClient.query<GetFollowingsResponse, GetFollowVariables>({
                query: GET_MEMBER_FOLLOWINGS,
                variables: {
                  input: {
                    page: 1,
                    limit: 1,
                    search: { followerId: id },
                  },
                },
                fetchPolicy: "network-only",
              }),
            ]);
            return [
              id,
              {
                followers:
                  followersRes.data?.getMemberFollowers?.metaCounter?.[0]
                    ?.total ?? 0,
                followings:
                  followingsRes.data?.getMemberFollowings?.metaCounter?.[0]
                    ?.total ?? 0,
              },
            ] as const;
          } catch {
            return [id, { followers: 0, followings: 0 }] as const;
          }
        }),
      );

      if (cancelled) return;
      const nextMap: Record<string, Member> = {};
      detailEntries.forEach(([id, member]) => {
        if (member) nextMap[id] = member;
      });
      const nextFollowCounts: Record<
        string,
        { followers: number; followings: number }
      > = {};
      followCountEntries.forEach(([id, counts]) => {
        nextFollowCounts[id] = counts;
      });
      setMemberDetailsMap(nextMap);
      setFollowCountsMap(nextFollowCounts);
    };

    fetchMembers().catch(() => null);
    return () => {
      cancelled = true;
    };
  }, [apolloClient, uniquePatientsBase]);

  const patients = useMemo<PatientCardData[]>(() => {
    return uniquePatientsBase.map(({ id, patientData }) => {
      const memberDetail = memberDetailsMap[id];
      return {
        id,
        name:
          memberDetail?.memberNick ||
          patientData?.memberNick ||
          "Unknown Patient",
        image:
          toAbsoluteMediaUrl(
            memberDetail?.memberImage || patientData?.memberImage,
          ) || "/img/defaultUser.svg",
        followers:
          followCountsMap[id]?.followers ?? memberDetail?.memberFollowers ?? 0,
        followings:
          followCountsMap[id]?.followings ??
          memberDetail?.memberFollowings ??
          0,
        likes: memberDetail?.memberLikes || 0,
        createdAt: String(
          memberDetail?.createdAt ||
            patientData?.createdAt ||
            new Date().toISOString(),
        ),
      };
    });
  }, [uniquePatientsBase, memberDetailsMap, followCountsMap]);

  const filteredPatients = useMemo(() => {
    const search = searchText.trim();
    let result = [...patients];

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      result = result.filter((patient) => regex.test(patient.name));
    }

    result.sort((a, b) => {
      const first = new Date(a.createdAt).getTime();
      const second = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? second - first : first - second;
    });

    return result;
  }, [patients, searchText, sortBy]);

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visiblePatients = filteredPatients.slice(startIndex, endIndex);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleSort = (value: "newest" | "latest") => {
    setSortBy(value);
    setCurrentPage(1);
  };

  if (!doctorId || getDoctorAppointmentsLoading) {
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
    <Box className="doctor-patients">
      <Box className="doctor-patients__header">
        <Typography variant="h4" className="doctor-patients__title">
          My Patients
        </Typography>
        <Typography className="doctor-patients__subtitle">
          Total {filteredPatients.length} patients
        </Typography>
      </Box>

      <Box className="doctor-patients__controls">
        <OutlinedInput
          className="doctor-patients__search"
          placeholder="Search by patient name..."
          value={searchText}
          onChange={(event) => handleSearch(event.target.value)}
        />
        <select
          className="doctor-patients__sort"
          value={sortBy}
          onChange={(event) =>
            handleSort(event.target.value as "newest" | "latest")
          }
        >
          <option value="newest">Newest (createdAt)</option>
          <option value="latest">Latest (createdAt)</option>
        </select>
      </Box>

      <Box className="doctor-patients__list-wrap">
        <Box className="doctor-patients__list">
          {getDoctorAppointmentsError && (
            <Typography>Failed to load patients.</Typography>
          )}
          {!getDoctorAppointmentsError && visiblePatients.length === 0 && (
            <Typography>No patients found.</Typography>
          )}
          {!getDoctorAppointmentsError &&
            visiblePatients.map((patient) => (
              <PatientCard
                key={patient.id}
                patient={patient}
                onNameClick={(id) =>
                  router.push(`/_doctor/patients/detail?id=${id}`)
                }
              />
            ))}
        </Box>

        <Box className="doctor-patients__footer">
          <Typography className="doctor-patients__result-text">
            Showing {filteredPatients.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(endIndex, filteredPatients.length)} of{" "}
            {filteredPatients.length} results
          </Typography>
          <Pagination
            page={currentPage}
            count={Math.max(totalPages, 1)}
            onChange={(_, page) => setCurrentPage(page)}
            shape="rounded"
            className="doctor-patients__pagination"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default withLayoutDoctor(DoctorPatients);
