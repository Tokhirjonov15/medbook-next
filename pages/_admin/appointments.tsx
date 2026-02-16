import React from "react";
import { NextPage } from "next";
import {
  Avatar,
  Box,
  CircularProgress,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { useMutation, useQuery } from "@apollo/client";
import withLayoutAdmin from "@/libs/components/layout/LayoutAdmin";
import {
  GET_ALL_APPOINTMENTS_BY_ADMIN,
  GET_ALL_DOCTORS_BY_ADMIN,
  GET_ALL_MEMBERS_BY_ADMIN,
} from "@/apollo/admin/query";
import { UPDATE_APPOINTMENTS_BY_ADMIN } from "@/apollo/admin/mutation";
import { Appointment, Appointments } from "@/libs/types/appoinment/appoinment";
import { AllAppointmentsInquiry } from "@/libs/types/appoinment/appoinment.input";
import { AppointmentStatus } from "@/libs/enums/appoinment.enum";
import { sweetErrorHandling, sweetTopSmallSuccessAlert } from "@/libs/sweetAlert";
import { Doctors } from "@/libs/types/doctors/doctor";
import { Members } from "@/libs/types/members/member";
import { MemberType } from "@/libs/enums/member.enum";

interface GetAllAppointmentsByAdminResponse {
  getAllAppointmentByAdmin: Appointments;
}

interface GetAllAppointmentsByAdminVariables {
  input: AllAppointmentsInquiry;
}
interface GetAllDoctorsByAdminResponse {
  getAllDoctorsByAdmin: Doctors;
}
interface GetAllMembersByAdminResponse {
  getAllMembersByAdmin: Members;
}

interface UpdateAppointmentByAdminInput {
  _id: string;
  status: AppointmentStatus;
}

interface UpdateAppointmentByAdminResponse {
  updateAppointmentByAdmin: Appointment;
}

interface UpdateAppointmentByAdminVariables {
  input: UpdateAppointmentByAdminInput;
}

const appointmentStatusOptions: AppointmentStatus[] = [
  AppointmentStatus.SCHEDULED,
  AppointmentStatus.CONFIRMED,
  AppointmentStatus.IN_PROGRESS,
  AppointmentStatus.COMPLETED,
  AppointmentStatus.CANCELLED,
  AppointmentStatus.NO_SHOW,
];

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

const formatDateTime = (dateValue?: Date | string, start?: string, end?: string) => {
  if (!dateValue) return "Not scheduled";
  const date = new Date(dateValue);
  const datePart = date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
  if (!start && !end) return datePart;
  return `${datePart} ${start || ""}${end ? ` - ${end}` : ""}`.trim();
};

const AdminAppointmentsPage: NextPage = () => {
  const {
    loading: getAppointmentsLoading,
    data: getAppointmentsData,
    error: getAppointmentsError,
    refetch: getAppointmentsRefetch,
  } = useQuery<GetAllAppointmentsByAdminResponse, GetAllAppointmentsByAdminVariables>(
    GET_ALL_APPOINTMENTS_BY_ADMIN,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        input: {
          page: 1,
          limit: 100,
          sort: "createdAt",
          direction: "DESC",
          search: {},
        },
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  const [updateAppointmentByAdmin, { loading: updateAppointmentLoading }] = useMutation<
    UpdateAppointmentByAdminResponse,
    UpdateAppointmentByAdminVariables
  >(UPDATE_APPOINTMENTS_BY_ADMIN);

  const { data: getDoctorsData } = useQuery<GetAllDoctorsByAdminResponse>(
    GET_ALL_DOCTORS_BY_ADMIN,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        input: {
          page: 1,
          limit: 1000,
          sort: "createdAt",
          direction: "DESC",
          search: {},
        },
      },
      notifyOnNetworkStatusChange: true,
    },
  );
  const { data: getMembersData } = useQuery<GetAllMembersByAdminResponse>(
    GET_ALL_MEMBERS_BY_ADMIN,
    {
      fetchPolicy: "cache-and-network",
      variables: {
        input: {
          page: 1,
          limit: 1000,
          sort: "createdAt",
          direction: "DESC",
          search: { memberType: MemberType.PATIENT },
        },
      },
      notifyOnNetworkStatusChange: true,
    },
  );

  const appointments = getAppointmentsData?.getAllAppointmentByAdmin?.list ?? [];
  const doctorNameMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    (getDoctorsData?.getAllDoctorsByAdmin?.list ?? []).forEach((doctor) => {
      map[doctor._id] = doctor.memberFullName || doctor.memberNick || doctor._id;
    });
    return map;
  }, [getDoctorsData]);
  const doctorPhoneMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    (getDoctorsData?.getAllDoctorsByAdmin?.list ?? []).forEach((doctor) => {
      map[doctor._id] = doctor.memberPhone || "";
    });
    return map;
  }, [getDoctorsData]);
  const patientNameMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    (getMembersData?.getAllMembersByAdmin?.list ?? []).forEach((member) => {
      map[member._id] = member.memberNick || member._id;
    });
    return map;
  }, [getMembersData]);
  const patientPhoneMap = React.useMemo(() => {
    const map: Record<string, string> = {};
    (getMembersData?.getAllMembersByAdmin?.list ?? []).forEach((member) => {
      map[member._id] = member.memberPhone || "";
    });
    return map;
  }, [getMembersData]);

  const onChangeStatus = async (appointmentId: string, next: AppointmentStatus) => {
    try {
      await updateAppointmentByAdmin({
        variables: {
          input: {
            _id: appointmentId,
            status: next,
          },
        },
      });
      await getAppointmentsRefetch();
      await sweetTopSmallSuccessAlert("Status updated", 800);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  return (
    <Box className="admin-section">
      <Typography variant="h4" className="admin-section__title" gutterBottom>
        Appointments
      </Typography>
      <Typography variant="body2" className="admin-section__subtitle">
        View and update appointment statuses.
      </Typography>

      {getAppointmentsLoading && (
        <Stack
          sx={{
            width: "100%",
            minHeight: "280px",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <CircularProgress size={"2.6rem"} />
        </Stack>
      )}

      {!getAppointmentsLoading && getAppointmentsError && (
        <Typography>Failed to load appointments.</Typography>
      )}

      {updateAppointmentLoading && !getAppointmentsLoading && (
        <Stack
          sx={{
            width: "100%",
            alignItems: "center",
            justifyContent: "center",
            py: 2,
          }}
        >
          <CircularProgress size={"1.8rem"} />
        </Stack>
      )}

      {!getAppointmentsLoading && !getAppointmentsError && (
        <Stack className="admin-list" spacing={1.5}>
          {appointments.map((appointment) => {
            const doctorName =
              appointment.doctorData?.memberFullName ||
              appointment.doctorData?.memberNick ||
              doctorNameMap[appointment.doctor] ||
              "Unknown Doctor";
            const doctorImage =
              toAbsoluteMediaUrl(appointment.doctorData?.memberImage) ||
              "/img/defaultUser.svg";
            const doctorPhone =
              appointment.doctorData?.memberPhone ||
              doctorPhoneMap[appointment.doctor] ||
              "-";
            const patientName =
              appointment.patientData?.memberNick ||
              patientNameMap[appointment.patient] ||
              "Unknown Patient";
            const patientImage =
              toAbsoluteMediaUrl(appointment.patientData?.memberImage) ||
              "/img/defaultUser.svg";
            const patientPhone =
              appointment.patientData?.memberPhone ||
              patientPhoneMap[appointment.patient] ||
              "-";

            return (
              <Box className="admin-list__row" key={appointment._id}>
                <Box className="admin-list__col admin-list__col--main">
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={patientImage} sx={{ width: 42, height: 42 }} />
                      <Stack spacing={0.3}>
                        <Typography className="admin-list__name">{patientName}</Typography>
                        <Typography className="admin-list__meta">
                          Patient Phone: {patientPhone}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Avatar src={doctorImage} sx={{ width: 42, height: 42 }} />
                      <Stack spacing={0.3}>
                        <Typography className="admin-list__name">{doctorName}</Typography>
                        <Typography className="admin-list__meta">
                          Doctor Phone: {doctorPhone}
                        </Typography>
                      </Stack>
                    </Stack>

                    <Typography className="admin-list__meta">
                      Appointment:{" "}
                      {formatDateTime(
                        appointment.appointmentDate,
                        appointment.timeSlot?.start,
                        appointment.timeSlot?.end,
                      )}
                    </Typography>
                    <Typography className="admin-list__meta">
                      Consultation: {appointment.consultationType || "-"} | Payment:{" "}
                      {appointment.paymentStatus || "-"}
                    </Typography>
                  </Stack>
                </Box>

                <FormControl size="small" className="admin-list__status">
                  <InputLabel>Status</InputLabel>
                  <Select
                    label="Status"
                    value={appointment.status || AppointmentStatus.SCHEDULED}
                    onChange={(event) =>
                      onChangeStatus(
                        appointment._id,
                        event.target.value as AppointmentStatus,
                      )
                    }
                  >
                    {appointmentStatusOptions.map((status) => (
                      <MenuItem value={status} key={status}>
                        {status}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              </Box>
            );
          })}
        </Stack>
      )}
    </Box>
  );
};

export default withLayoutAdmin(AdminAppointmentsPage);
