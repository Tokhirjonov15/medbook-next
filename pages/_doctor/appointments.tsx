import React, { CSSProperties, useMemo, useState } from "react";
import { Box, CircularProgress, IconButton, Stack, Typography } from "@mui/material";
import { useRouter } from "next/router";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import { useQuery, useReactiveVar } from "@apollo/client";
import withLayoutDoctor from "@/libs/components/layout/LayoutDoctor";
import { NextPage } from "next";
import { doctorVar } from "@/apollo/store";
import { GET_DOCTOR_APPOINTMENTS } from "@/apollo/doctor/query";
import { Appointments, Appointment } from "@/libs/types/appoinment/appoinment";
import { AppointmentsInquiry } from "@/libs/types/appoinment/appoinment.input";
import { AppointmentStatus } from "@/libs/enums/appoinment.enum";

type Day = {
  date: Date;
  label: string;
};

type CalendarAppointment = {
  id: string;
  start: Date;
  end: Date;
  patient: string;
  subtitle?: string;
  color: string;
  bg: string;
};

interface GetDoctorAppointmentsResponse {
  getDoctorAppointments: Appointments;
}

interface GetDoctorAppointmentsVariables {
  input: AppointmentsInquiry;
}

const times = [
  "09:00 AM",
  "10:00 AM",
  "11:00 AM",
  "12:00 PM",
  "01:00 PM",
  "02:00 PM",
  "03:00 PM",
  "04:00 PM",
  "05:00 PM",
];

const weekdays = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];
const startHour = 9;
const slotHeight = 76;

const startOfDay = (value: Date) =>
  new Date(value.getFullYear(), value.getMonth(), value.getDate());

const sameDay = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const addDays = (value: Date, days: number) => {
  const next = new Date(value);
  next.setDate(next.getDate() + days);
  return next;
};

const addMonths = (value: Date, months: number) => {
  const next = new Date(value);
  next.setMonth(next.getMonth() + months);
  return next;
};

const mondayIndex = (day: number) => (day === 0 ? 6 : day - 1);

const getWeekDays = (baseDate: Date): Day[] => {
  const dayStart = startOfDay(baseDate);
  const weekStart = addDays(dayStart, -mondayIndex(dayStart.getDay()));

  return Array.from({ length: 7 }).map((_, idx) => {
    const date = addDays(weekStart, idx);
    return {
      date,
      label: weekdays[idx],
    };
  });
};

const getMonthGridDays = (baseDate: Date): Day[] => {
  const firstDay = new Date(baseDate.getFullYear(), baseDate.getMonth(), 1);
  const startDate = addDays(firstDay, -mondayIndex(firstDay.getDay()));

  return Array.from({ length: 42 }).map((_, idx) => {
    const date = addDays(startDate, idx);
    return {
      date,
      label: weekdays[idx % 7],
    };
  });
};

const formatMonthYear = (value: Date) =>
  new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(value);

const formatTimeRange = (start: Date, end: Date) =>
  `${new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(start)} - ${new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(end)}`;

const toTime = (base: Date, hhmm?: string, fallbackHour = 9) => {
  const value = new Date(base);
  if (hhmm && /^\d{2}:\d{2}$/.test(hhmm)) {
    const [h, m] = hhmm.split(":").map(Number);
    value.setHours(h, m, 0, 0);
    return value;
  }
  value.setHours(fallbackHour, 0, 0, 0);
  return value;
};

const statusStyle = (status?: AppointmentStatus) => {
  switch (status) {
    case AppointmentStatus.COMPLETED:
      return { color: "#0f766e", bg: "#d1fae5" };
    case AppointmentStatus.CANCELLED:
    case AppointmentStatus.NO_SHOW:
      return { color: "#b91c1c", bg: "#fee2e2" };
    case AppointmentStatus.IN_PROGRESS:
      return { color: "#1d4ed8", bg: "#dbeafe" };
    case AppointmentStatus.CONFIRMED:
      return { color: "#7c3aed", bg: "#ede9fe" };
    default:
      return { color: "#0369a1", bg: "#e0f2fe" };
  }
};

const DoctorAppointments: NextPage = () => {
  const router = useRouter();
  const doctor = useReactiveVar(doctorVar);
  const doctorId = doctor?._id || "";
  const [viewMode, setViewMode] = useState<"month" | "week">("week");
  const [currentDate, setCurrentDate] = useState<Date>(new Date());
  const baseDate = currentDate;

  const weekDays = useMemo(() => getWeekDays(baseDate), [baseDate]);
  const monthDays = useMemo(() => getMonthGridDays(baseDate), [baseDate]);

  const dateRange = useMemo(() => {
    if (viewMode === "week") {
      const from = startOfDay(weekDays[0].date);
      const to = addDays(startOfDay(weekDays[6].date), 1);
      return { from, to };
    }
    const from = startOfDay(monthDays[0].date);
    const to = addDays(startOfDay(monthDays[monthDays.length - 1].date), 1);
    return { from, to };
  }, [viewMode, weekDays, monthDays]);

  const appointmentInput = useMemo<AppointmentsInquiry>(
    () => ({
      page: 1,
      limit: 300,
      sort: "appointmentDate",
      direction: "DESC",
      search: {
        doctorId,
        dateFrom: dateRange.from,
        dateTo: dateRange.to,
      },
    }),
    [doctorId, dateRange.from, dateRange.to],
  );

  const {
    loading: getDoctorAppointmentsLoading,
    data: getDoctorAppointmentsData,
    error: getDoctorAppointmentsError,
  } = useQuery<GetDoctorAppointmentsResponse, GetDoctorAppointmentsVariables>(
    GET_DOCTOR_APPOINTMENTS,
    {
      fetchPolicy: "cache-and-network",
      variables: { input: appointmentInput },
      notifyOnNetworkStatusChange: true,
      skip: !doctorId,
    },
  );

  const appointments = useMemo<CalendarAppointment[]>(() => {
    const list = getDoctorAppointmentsData?.getDoctorAppointments?.list ?? [];
    return list.map((item: Appointment) => {
      const date = new Date(item.appointmentDate);
      const start = toTime(date, item.timeSlot?.start, 9);
      const end = toTime(date, item.timeSlot?.end, start.getHours() + 1);
      const style = statusStyle(item.status);
      return {
        id: item._id,
        start,
        end,
        patient: item.patientData?.memberNick || "Unknown Patient",
        subtitle: item.reason || item.consultationType || "",
        color: style.color,
        bg: style.bg,
      };
    });
  }, [getDoctorAppointmentsData]);

  const visibleWeekAppointments = useMemo(() => {
    const weekStart = weekDays[0]?.date;
    const weekEnd = weekDays[6]?.date;
    if (!weekStart || !weekEnd) return [];
    const weekStartMs = startOfDay(weekStart).getTime();
    const weekEndMs = addDays(startOfDay(weekEnd), 1).getTime();

    return appointments.filter((item) => {
      const startMs = item.start.getTime();
      return startMs >= weekStartMs && startMs < weekEndMs;
    });
  }, [appointments, weekDays]);

  const onPrev = () => {
    setCurrentDate((prev) =>
      viewMode === "month" ? addMonths(prev, -1) : addDays(prev, -7),
    );
  };

  const onNext = () => {
    setCurrentDate((prev) =>
      viewMode === "month" ? addMonths(prev, 1) : addDays(prev, 7),
    );
  };

  const onOpenDetail = (id: string) => {
    router.push(`/_doctor/appoinments/detail?id=${id}`);
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

  if (getDoctorAppointmentsError) {
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
        <Typography>Failed to load appointments.</Typography>
      </Stack>
    );
  }

  return (
    <Box className="doctor-appointments">
      <Box className="doctor-appointments__header">
        <Typography variant="h4" className="doctor-appointments__title" gutterBottom>
          My Schedule
        </Typography>
        <Typography variant="body2" className="doctor-appointments__subtitle">
          Manage your appointments and availability.
        </Typography>
      </Box>

      <Box className="doctor-appointments__toolbar-card">
        <Stack direction="row" spacing={1}>
          {(["Month", "Week"] as const).map((tab) => {
            const tabMode = tab.toLowerCase() as "month" | "week";
            return (
              <button
                key={tab}
                type="button"
                className={`doctor-appointments__view-tab ${
                  viewMode === tabMode ? "active" : ""
                }`}
                onClick={() => setViewMode(tabMode)}
              >
                {tab}
              </button>
            );
          })}
        </Stack>
      </Box>

      <Box className="doctor-appointments__nav-card">
        <Stack
          direction="row"
          alignItems="center"
          justifyContent="center"
          spacing={2}
        >
          <IconButton onClick={onPrev} size="small" className="doctor-appointments__nav-btn">
            <ChevronLeftIcon />
          </IconButton>
          <Stack direction="row" alignItems="center" spacing={1}>
            <CalendarMonthIcon className="doctor-appointments__calendar-icon" />
            <Typography variant="h6" className="doctor-appointments__month-label">
              {formatMonthYear(currentDate)}
            </Typography>
          </Stack>
          <IconButton onClick={onNext} size="small" className="doctor-appointments__nav-btn">
            <ChevronRightIcon />
          </IconButton>
        </Stack>
      </Box>

      <Box className="doctor-appointments__calendar-wrap">
        <Box className="doctor-appointments__calendar-scroll">
          {viewMode === "week" ? (
            <Box className="doctor-appointments__week-view">
              <Box className="doctor-appointments__week-head">
                <Box className="doctor-appointments__week-time-head">TIME GMT+1</Box>
                {weekDays.map((day) => {
                  const active = sameDay(day.date, currentDate);
                  return (
                    <Box
                      key={day.date.toISOString()}
                      className={`doctor-appointments__week-day-head ${active ? "active" : ""}`}
                    >
                      <Typography className="doctor-appointments__week-day-label">
                        {day.label}
                      </Typography>
                      <Box
                        className={`doctor-appointments__week-day-number ${
                          active ? "active" : ""
                        }`}
                      >
                        {day.date.getDate()}
                      </Box>
                    </Box>
                  );
                })}
              </Box>

              <Box className="doctor-appointments__week-grid">
                <Box className="doctor-appointments__time-column">
                  {times.map((time) => (
                    <Box key={time} className="doctor-appointments__time-slot">
                      <Typography className="doctor-appointments__time-text">{time}</Typography>
                    </Box>
                  ))}
                </Box>

                {weekDays.map((day) => {
                  const active = sameDay(day.date, currentDate);
                  return (
                    <Box
                      key={`column-${day.date.toISOString()}`}
                      className={`doctor-appointments__day-column ${active ? "active" : ""}`}
                    >
                      {times.map((time) => (
                        <Box
                          key={`${day.date.toISOString()}-${time}`}
                          className="doctor-appointments__day-slot"
                        />
                      ))}
                    </Box>
                  );
                })}

                {visibleWeekAppointments.map((appointment) => {
                  const dayIndex = weekDays.findIndex((day) =>
                    sameDay(day.date, appointment.start),
                  );
                  if (dayIndex < 0) return null;

                  const startMinutes =
                    appointment.start.getHours() * 60 + appointment.start.getMinutes();
                  const endMinutes =
                    appointment.end.getHours() * 60 + appointment.end.getMinutes();
                  const minMinutes = startHour * 60;
                  const top = ((startMinutes - minMinutes) / 60) * slotHeight + 8;
                  const height =
                    (Math.max(endMinutes - startMinutes, 30) / 60) * slotHeight - 16;

                  const appointmentStyle = {
                    "--appt-day-index": dayIndex.toString(),
                    "--appt-top": `${top}px`,
                    "--appt-height": `${height}px`,
                    "--appt-color": appointment.color,
                    "--appt-bg": appointment.bg,
                  } as CSSProperties;

                  return (
                    <Box
                      key={appointment.id}
                      className="doctor-appointments__week-appointment"
                      style={appointmentStyle}
                      onClick={() => onOpenDetail(appointment.id)}
                    >
                      <Typography className="doctor-appointments__week-appointment-time">
                        {formatTimeRange(appointment.start, appointment.end)}
                      </Typography>
                      <Typography className="doctor-appointments__week-appointment-patient">
                        {appointment.patient}
                      </Typography>
                      {appointment.subtitle ? (
                        <Typography className="doctor-appointments__week-appointment-subtitle">
                          {appointment.subtitle}
                        </Typography>
                      ) : null}
                    </Box>
                  );
                })}
              </Box>
            </Box>
          ) : (
            <Box className="doctor-appointments__month-view">
              <Box className="doctor-appointments__month-head">
                {weekdays.map((day) => (
                  <Box key={`month-head-${day}`} className="doctor-appointments__month-head-cell">
                    <Typography className="doctor-appointments__month-head-label">
                      {day}
                    </Typography>
                  </Box>
                ))}
              </Box>

              <Box className="doctor-appointments__month-grid">
                {monthDays.map((day) => {
                  const inCurrentMonth = day.date.getMonth() === currentDate.getMonth();
                  const dayAppointments = appointments.filter((item) =>
                    sameDay(item.start, day.date),
                  );
                  const active = sameDay(day.date, currentDate);

                  return (
                    <Box
                      key={`month-cell-${day.date.toISOString()}`}
                      onClick={() => setCurrentDate(day.date)}
                      className={`doctor-appointments__month-cell ${active ? "active" : ""}`}
                    >
                      <Box
                        className={`doctor-appointments__month-day-number ${
                          active ? "active" : ""
                        } ${inCurrentMonth ? "" : "muted"}`}
                      >
                        {day.date.getDate()}
                      </Box>

                      <Stack spacing={0.6}>
                        {dayAppointments.slice(0, 2).map((item) => {
                          const monthItemStyle = {
                            "--month-appt-color": item.color,
                            "--month-appt-bg": item.bg,
                          } as CSSProperties;
                          return (
                            <Box
                              key={`month-item-${item.id}`}
                              className="doctor-appointments__month-appointment"
                              style={monthItemStyle}
                              onClick={(event) => {
                                event.stopPropagation();
                                onOpenDetail(item.id);
                              }}
                            >
                              <Typography className="doctor-appointments__month-appointment-text">
                                {item.patient}
                              </Typography>
                            </Box>
                          );
                        })}
                        {dayAppointments.length > 2 ? (
                          <Typography className="doctor-appointments__month-more">
                            +{dayAppointments.length - 2} more
                          </Typography>
                        ) : null}
                      </Stack>
                    </Box>
                  );
                })}
              </Box>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default withLayoutDoctor(DoctorAppointments);
