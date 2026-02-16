import React, { useEffect, useMemo, useState } from "react";
import { NextPage } from "next";
import {
  Box,
  Button,
  Chip,
  CircularProgress,
  IconButton,
  Radio,
  Stack,
  Step,
  StepLabel,
  Stepper,
  TextField,
  Typography,
} from "@mui/material";
import { useRouter } from "next/router";
import { useMutation, useQuery } from "@apollo/client";
import CloseIcon from "@mui/icons-material/Close";
import VideocamIcon from "@mui/icons-material/Videocam";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MoneyIcon from "@mui/icons-material/Money";
import Swal from "sweetalert2";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import withLayoutMain from "@/libs/components/layout/LayoutMember";
import { GET_DOCTOR } from "@/apollo/user/query";
import { GET_DOCTOR_APPOINTMENTS } from "@/apollo/doctor/query";
import { BOOK_APPOINTMENT, CREATE_PAYMENT } from "@/apollo/user/mutation";
import { Doctor } from "@/libs/types/doctors/doctor";
import { BookAppointmentInput } from "@/libs/types/appoinment/appoinment.input";
import { CreatePaymentInput } from "@/libs/types/payment/payment.input";
import { Appointment, Appointments } from "@/libs/types/appoinment/appoinment";
import { AppointmentsInquiry } from "@/libs/types/appoinment/appoinment.input";
import { Payment } from "@/libs/types/payment/payment";
import { ConsultationType } from "@/libs/enums/consultation.enum";
import { PaymentMethod } from "@/libs/enums/payment.enum";
import { DayOfWeek } from "@/libs/enums/day-of-week.enum";
import { AppointmentStatus } from "@/libs/enums/appoinment.enum";
import {
  sweetErrorHandling,
  sweetMixinErrorAlert,
  sweetMixinSuccessAlert,
} from "@/libs/sweetAlert";
import { Messages } from "@/libs/config";

const steps = ["Date & Time", "Details", "Payment"];

interface GetDoctorResponse {
  getDoctor: Doctor;
}

interface GetDoctorVariables {
  input: string;
}

interface BookAppointmentResponse {
  bookAppointment: Appointment;
}

interface BookAppointmentVariables {
  input: BookAppointmentInput;
}

interface CreatePaymentResponse {
  createPayment: Payment;
}

interface CreatePaymentVariables {
  input: CreatePaymentInput;
}

interface GetDoctorAppointmentsResponse {
  getDoctorAppointments: Appointments;
}

interface GetDoctorAppointmentsVariables {
  input: AppointmentsInquiry;
}

const dayToIndex: Record<string, number> = {
  [DayOfWeek.SUNDAY]: 0,
  [DayOfWeek.MONDAY]: 1,
  [DayOfWeek.TUESDAY]: 2,
  [DayOfWeek.WEDNESDAY]: 3,
  [DayOfWeek.THURSDAY]: 4,
  [DayOfWeek.FRIDAY]: 5,
  [DayOfWeek.SATURDAY]: 6,
};

const parseTimeToMinutes = (value: string): number | null => {
  const clean = value?.trim();
  if (!clean) return null;
  const rangeSafe = clean.split("-")[0]?.trim() || clean;
  const match = rangeSafe.match(/^(\d{1,2}):(\d{2})(?::\d{2})?(?:\s*([AaPp][Mm]))?$/);
  if (!match) return null;
  let h = Number(match[1]);
  const m = Number(match[2]);
  const meridiem = match[3]?.toUpperCase();
  if (Number.isNaN(h) || Number.isNaN(m)) return null;
  if (m < 0 || m > 59) return null;

  if (meridiem) {
    if (h < 1 || h > 12) return null;
    if (meridiem === "PM" && h !== 12) h += 12;
    if (meridiem === "AM" && h === 12) h = 0;
  } else if (h < 0 || h > 23) {
    return null;
  }

  return h * 60 + m;
};

const resolveWorkingRange = (workingHours?: string[]): [number, number] | null => {
  if (!workingHours?.length) return null;

  const source = workingHours.map((v) => String(v || "").trim()).join(" ");
  if (!source) return null;

  const timeMatches = source.match(/\d{1,2}:\d{2}(?::\d{2})?(?:\s*[AaPp][Mm])?/g) || [];
  const parsed = timeMatches
    .map((t) => parseTimeToMinutes(t))
    .filter((v): v is number => typeof v === "number");

  if (parsed.length >= 2) {
    const [start, end] = parsed;
    if (start < end) return [start, end];
  }

  return null;
};

const generateSlots = (workingHours?: string[]): string[] => {
  const range = resolveWorkingRange(workingHours);
  if (!range) return [];
  const [start, end] = range;
  if (start === null || end === null || start >= end) return [];

  const slots: string[] = [];
  for (let t = start; t + 30 <= end; t += 30) {
    const hh = String(Math.floor(t / 60)).padStart(2, "0");
    const mm = String(t % 60).padStart(2, "0");
    slots.push(`${hh}:${mm}`);
  }
  return slots;
};

const slotEndTime = (start: string) => {
  const begin = parseTimeToMinutes(start);
  if (begin === null) return start;
  const total = begin + 30;
  const hh = String(Math.floor(total / 60)).padStart(2, "0");
  const mm = String(total % 60).padStart(2, "0");
  return `${hh}:${mm}`;
};

const isSameDate = (a: Date, b: Date) =>
  a.getFullYear() === b.getFullYear() &&
  a.getMonth() === b.getMonth() &&
  a.getDate() === b.getDate();

const PaymentPage: NextPage = () => {
  const router = useRouter();
  const doctorId = useMemo(() => {
    const raw = router.query.id;
    return Array.isArray(raw) ? raw[0] : raw;
  }, [router.query.id]);

  const [activeStep, setActiveStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [consultationType, setConsultationType] = useState<ConsultationType>(ConsultationType.CLINIC);
  const [reason, setReason] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<"credit" | "property">("credit");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });

  const {
    loading: getDoctorLoading,
    data: getDoctorData,
    error: getDoctorError,
  } = useQuery<GetDoctorResponse, GetDoctorVariables>(GET_DOCTOR, {
    fetchPolicy: "cache-and-network",
    variables: { input: doctorId || "" },
    notifyOnNetworkStatusChange: true,
    skip: !doctorId,
  });

  const [bookAppointment] = useMutation<BookAppointmentResponse, BookAppointmentVariables>(BOOK_APPOINTMENT);
  const [createPayment] = useMutation<CreatePaymentResponse, CreatePaymentVariables>(CREATE_PAYMENT);

  const doctor = getDoctorData?.getDoctor;
  const baseSlots = generateSlots(doctor?.workingHours);
  const allowedDays = useMemo(() => {
    const set = new Set<number>();
    (doctor?.workingDays || []).forEach((d) => {
      const idx = dayToIndex[String(d).toUpperCase()];
      if (typeof idx === "number") set.add(idx);
    });
    return set;
  }, [doctor?.workingDays]);

  const shouldDisableDate = (date: Date) => {
    if (!allowedDays.size) return false;
    return !allowedDays.has(date.getDay());
  };

  const doctorAppointmentsInput = useMemo<AppointmentsInquiry | null>(() => {
    if (!doctorId || !selectedDate) return null;
    const dayStart = new Date(selectedDate);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(selectedDate);
    dayEnd.setHours(23, 59, 59, 999);

    return {
      page: 1,
      limit: 200,
      sort: "createdAt",
      direction: "DESC" as unknown as AppointmentsInquiry["direction"],
      search: {
        doctorId,
        dateFrom: dayStart,
        dateTo: dayEnd,
      },
    };
  }, [doctorId, selectedDate]);

  const {
    loading: getDoctorAppointmentsLoading,
    data: getDoctorAppointmentsData,
    error: getDoctorAppointmentsError,
  } = useQuery<GetDoctorAppointmentsResponse, GetDoctorAppointmentsVariables>(GET_DOCTOR_APPOINTMENTS, {
    fetchPolicy: "cache-and-network",
    variables: doctorAppointmentsInput ? { input: doctorAppointmentsInput } : undefined,
    notifyOnNetworkStatusChange: true,
    skip: !doctorAppointmentsInput,
  });

  const occupiedSlotSet = useMemo(() => {
    const occupied = new Set<string>();
    const items = getDoctorAppointmentsData?.getDoctorAppointments?.list ?? [];
    items.forEach((appointment) => {
      const rawDate = appointment?.appointmentDate ? new Date(appointment.appointmentDate) : null;
      if (!rawDate || !selectedDate || !isSameDate(rawDate, selectedDate)) return;
      if (appointment.status === AppointmentStatus.CANCELLED) return;

      const normalizedStart = parseTimeToMinutes(appointment?.timeSlot?.start || "");
      if (normalizedStart === null) return;
      const hh = String(Math.floor(normalizedStart / 60)).padStart(2, "0");
      const mm = String(normalizedStart % 60).padStart(2, "0");
      occupied.add(`${hh}:${mm}`);
    });
    return occupied;
  }, [getDoctorAppointmentsData, selectedDate]);

  const availableSlots = useMemo(
    () => baseSlots.filter((slot) => !occupiedSlotSet.has(slot)),
    [baseSlots, occupiedSlotSet],
  );

  useEffect(() => {
    if (!selectedDate) return;
    if (!allowedDays.size) return;
    if (!shouldDisableDate(selectedDate)) return;

    const next = new Date(selectedDate);
    for (let i = 0; i < 14; i += 1) {
      next.setDate(next.getDate() + 1);
      if (!shouldDisableDate(next)) {
        setSelectedDate(new Date(next));
        break;
      }
    }
  }, [allowedDays, selectedDate]);

  useEffect(() => {
    if (!availableSlots.length) {
      setSelectedTime("");
      return;
    }
    if (selectedTime && !availableSlots.includes(selectedTime)) {
      setSelectedTime("");
    }
  }, [availableSlots, selectedTime]);

  const handleNext = async () => {
    try {
      if (activeStep === 0 && !selectedDate) throw new Error("Please select a date");
      if (activeStep === 0 && selectedDate && shouldDisableDate(selectedDate)) {
        throw new Error("Selected day is not available for this doctor");
      }
      if (activeStep === 0 && getDoctorAppointmentsError) {
        throw new Error("Unable to verify booked slots. Please try again.");
      }
      if (activeStep === 0 && !selectedTime) throw new Error("Please select a time slot");
      if (activeStep === 0 && occupiedSlotSet.has(selectedTime)) {
        throw new Error("This time slot is already booked. Please choose another slot.");
      }
      if (activeStep === 1 && !reason.trim()) throw new Error("Please provide a reason for visit");
      setActiveStep((prevActiveStep) => prevActiveStep + 1);
    } catch (err: any) {
      sweetErrorHandling(err).then();
    }
  };

  const handleBack = () => {
    setActiveStep((prevActiveStep) => prevActiveStep - 1);
  };

  const handleAddSymptom = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && symptomInput.trim()) {
      if (!symptoms.includes(symptomInput.trim())) {
        setSymptoms([...symptoms, symptomInput.trim()]);
      }
      setSymptomInput("");
    }
  };

  const handleRemoveSymptom = (symptom: string) => {
    setSymptoms(symptoms.filter((s) => s !== symptom));
  };

  const handleConfirmPayment = async () => {
    try {
      if (!doctorId) throw new Error(Messages.error1);
      if (!selectedDate || !selectedTime) throw new Error(Messages.error3);
      if (selectedDate && shouldDisableDate(selectedDate)) {
        throw new Error("Selected day is not available for this doctor");
      }
      if (occupiedSlotSet.has(selectedTime)) {
        throw new Error("This time slot is already booked. Please choose another slot.");
      }
      if (!reason.trim()) throw new Error(Messages.error3);
      if (paymentMethod === "credit" && (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv)) {
        throw new Error("Please fill in all card details");
      }
      if (paymentMethod === "credit" && cardDetails.number.length !== 16) {
        throw new Error("Card number must be 16 digits");
      }
      if (paymentMethod === "credit" && cardDetails.expiry.length !== 4) {
        throw new Error("Expiry must be 4 digits (MMYY)");
      }
      if (paymentMethod === "credit" && cardDetails.cvv.length !== 3) {
        throw new Error("CVC must be 3 digits");
      }

      const appointmentInput: BookAppointmentInput = {
        doctor: doctorId,
        appointmentDate: selectedDate,
        timeSlot: {
          start: selectedTime,
          end: slotEndTime(selectedTime),
        },
        consultationType,
        reason: reason.trim(),
        symptoms: symptoms.length ? symptoms : undefined,
      };

      const appointmentRes = await bookAppointment({
        variables: { input: appointmentInput },
      });
      const appointmentId = appointmentRes.data?.bookAppointment?._id;
      if (!appointmentId) throw new Error(Messages.error1);

      const paymentInput: CreatePaymentInput = {
        appointmentId,
        paymentMethod: paymentMethod === "credit" ? PaymentMethod.CARD : PaymentMethod.CASH,
      };
      await createPayment({ variables: { input: paymentInput } });

      await sweetMixinSuccessAlert("Appointment and payment created successfully");
      await Swal.fire({
        icon: "success",
        title: "Booking Confirmed!",
        text: `Your appointment with ${doctorName} is set for ${selectedDate?.toLocaleDateString()} at ${selectedTime}`,
        showConfirmButton: true,
        confirmButtonText: "Done",
      });
      await router.push("/mypage?category=myAppointments");
    } catch (err: any) {
      const msg = String(err?.message || "");
      if (msg.includes("BAD_REQUEST")) {
        await sweetErrorHandling(new Error("This time slot is already booked. Please choose another slot."));
        return;
      }
      console.log("ERROR, handleConfirmPayment:", err.message);
      sweetErrorHandling(err).then();
    }
  };

  const handleClose = () => {
    router.back();
  };

  if (!doctorId || getDoctorLoading) {
    return (
      <Stack sx={{ display: "flex", justifyContent: "center", alignItems: "center", width: "100%", minHeight: "70vh" }}>
        <CircularProgress size={"3rem"} />
      </Stack>
    );
  }

  if (getDoctorError || !doctor) {
    return (
      <Stack sx={{ width: "100%", minHeight: "60vh", justifyContent: "center", alignItems: "center" }}>
        <Typography>Failed to load doctor data.</Typography>
      </Stack>
    );
  }

  const doctorName = doctor.memberFullName || doctor.memberNick;
  const doctorSpec = (Array.isArray(doctor.specialization)
    ? doctor.specialization
    : doctor.specialization
      ? [doctor.specialization]
      : []
  )
    .map((value) => String(value).replaceAll("_", " "))
    .join(", ");
  const doctorImage = doctor.memberImage || "/img/defaultUser.svg";

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div id="payment-page">
        <Stack className="payment-container">
          <Stack className="payment-modal">
            <Stack className="modal-header">
              <Typography className="modal-title">Book Appointment</Typography>
              <IconButton onClick={handleClose} className="close-btn">
                <CloseIcon />
              </IconButton>
            </Stack>

            <Stack className="stepper-section">
              <Stepper activeStep={activeStep} className="booking-stepper">
                {steps.map((label) => (
                  <Step key={label}>
                    <StepLabel className="step-label">
                      <Typography className="step-text">{label}</Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Stack>

            <Stack className="step-content">
              {activeStep === 0 && (
                <Stack className="step-one">
                  <Typography className="section-title">Select Date</Typography>
                  <Box className="date-picker-box">
                    <StaticDatePicker
                      displayStaticWrapperAs="desktop"
                      value={selectedDate}
                      onChange={(newValue: Date | null) => setSelectedDate(newValue)}
                      minDate={new Date()}
                      shouldDisableDate={shouldDisableDate}
                      className="date-picker"
                    />
                  </Box>

                  <Typography className="section-title">Available Slots</Typography>
                  <Stack className="time-slots">
                    {getDoctorAppointmentsLoading && <CircularProgress size={"1.2rem"} />}
                    {availableSlots.length === 0 ? (
                      <Typography sx={{ color: "#6b7280" }}>
                        {baseSlots.length === 0
                          ? "No available slots configured for this doctor."
                          : "All slots are booked for this date. Please choose another day."}
                      </Typography>
                    ) : (
                      availableSlots.map((slot) => (
                        <Button
                          key={slot}
                          variant={selectedTime === slot ? "contained" : "outlined"}
                          onClick={() => setSelectedTime(slot)}
                          className={`time-slot ${selectedTime === slot ? "selected" : ""}`}
                        >
                          {slot}
                        </Button>
                      ))
                    )}
                  </Stack>
                </Stack>
              )}

              {activeStep === 1 && (
                <Stack className="step-two">
                  <Typography className="section-title">Consultation Type</Typography>
                  <Stack className="consultation-types">
                    <Box
                      className={`consultation-card ${consultationType === ConsultationType.VIDEO ? "selected" : ""}`}
                      onClick={async () => {
                        await sweetMixinErrorAlert("Video consultation is not available yet");
                        setConsultationType(ConsultationType.CLINIC);
                      }}
                    >
                      <VideocamIcon className="card-icon" />
                      <Typography className="card-title">Video Call</Typography>
                    </Box>
                    <Box
                      className={`consultation-card ${consultationType === ConsultationType.CLINIC ? "selected" : ""}`}
                      onClick={() => setConsultationType(ConsultationType.CLINIC)}
                    >
                      <LocalHospitalIcon className="card-icon" />
                      <Typography className="card-title">Clinic Visit</Typography>
                    </Box>
                  </Stack>

                  <Typography className="section-title">Reason for Visit</Typography>
                  <TextField
                    multiline
                    rows={4}
                    fullWidth
                    placeholder="Briefly describe what you're experiencing..."
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    className="reason-input"
                  />

                  <Typography className="section-title">Symptoms</Typography>
                  <Stack className="symptoms-section">
                    <Stack className="symptoms-chips">
                      {symptoms.map((symptom) => (
                        <Chip key={symptom} label={symptom} onDelete={() => handleRemoveSymptom(symptom)} className="symptom-chip" />
                      ))}
                    </Stack>
                    <TextField
                      fullWidth
                      placeholder="Type and press Enter"
                      value={symptomInput}
                      onChange={(e) => setSymptomInput(e.target.value)}
                      onKeyDown={handleAddSymptom}
                      className="symptom-input"
                    />
                  </Stack>
                </Stack>
              )}

              {activeStep === 2 && (
                <Stack className="step-three">
                  <Stack className="payment-layout">
                    <Stack className="payment-left">
                      <Typography className="section-title">Payment Method</Typography>
                      <Stack className="payment-methods">
                        <Box className={`payment-method-card ${paymentMethod === "credit" ? "selected" : ""}`} onClick={() => setPaymentMethod("credit")}>
                          <Radio checked={paymentMethod === "credit"} className="payment-radio" />
                          <Stack className="payment-info">
                            <Typography className="payment-title">Credit Card</Typography>
                            <Typography className="payment-subtitle">**** **** **** 4242</Typography>
                          </Stack>
                          <CreditCardIcon className="payment-icon" />
                        </Box>
                        <Box className={`payment-method-card ${paymentMethod === "property" ? "selected" : ""}`} onClick={() => setPaymentMethod("property")}>
                          <Radio checked={paymentMethod === "property"} className="payment-radio" />
                          <Stack className="payment-info">
                            <Typography className="payment-title">Pay at the Clinic</Typography>
                            <Typography className="payment-subtitle">Pay when you arrive</Typography>
                          </Stack>
                          <MoneyIcon className="payment-icon" />
                        </Box>
                      </Stack>

                      {paymentMethod === "credit" && (
                        <Stack className="card-details">
                          <TextField
                            fullWidth
                            label="Card Number"
                            placeholder="1234 5678 9012 3456"
                            value={cardDetails.number}
                            onChange={(e) =>
                              setCardDetails({
                                ...cardDetails,
                                number: e.target.value.replace(/\D/g, "").slice(0, 16),
                              })
                            }
                            inputProps={{ inputMode: "numeric", maxLength: 16 }}
                            className="card-input"
                          />
                          <Stack className="card-row">
                            <TextField
                              label="Expiry Date"
                              placeholder="MMYY"
                              value={cardDetails.expiry}
                              onChange={(e) =>
                                setCardDetails({
                                  ...cardDetails,
                                  expiry: e.target.value.replace(/\D/g, "").slice(0, 4),
                                })
                              }
                              inputProps={{ inputMode: "numeric", maxLength: 4 }}
                              className="card-input"
                            />
                            <TextField
                              label="CVV"
                              placeholder="123"
                              value={cardDetails.cvv}
                              onChange={(e) =>
                                setCardDetails({
                                  ...cardDetails,
                                  cvv: e.target.value.replace(/\D/g, "").slice(0, 3),
                                })
                              }
                              inputProps={{ inputMode: "numeric", maxLength: 3 }}
                              className="card-input"
                            />
                          </Stack>
                        </Stack>
                      )}
                    </Stack>

                    <Stack className="payment-right">
                      <Stack className="summary-card">
                        <Typography className="summary-title">SUMMARY</Typography>
                        <Stack className="doctor-summary">
                          <Box className="doctor-avatar">
                            <img src={doctorImage} alt={doctorName} />
                          </Box>
                          <Stack className="doctor-info">
                            <Typography className="doctor-name">{doctorName}</Typography>
                            <Typography className="doctor-spec">{doctorSpec}</Typography>
                          </Stack>
                        </Stack>
                        <Stack className="summary-details">
                          <Stack className="summary-row">
                            <Typography className="summary-label">Date</Typography>
                            <Typography className="summary-value">{selectedDate?.toLocaleDateString()}</Typography>
                          </Stack>
                          <Stack className="summary-row">
                            <Typography className="summary-label">Time</Typography>
                            <Typography className="summary-value">{selectedTime}</Typography>
                          </Stack>
                          <Stack className="summary-row">
                            <Typography className="summary-label">Type</Typography>
                            <Typography className="summary-value">
                              {consultationType === ConsultationType.CLINIC ? "Clinic Visit" : "Video Call"}
                            </Typography>
                          </Stack>
                        </Stack>
                        <Stack className="summary-total">
                          <Typography className="total-label">Total</Typography>
                          <Typography className="total-amount">${doctor.consultationFee}.00</Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              )}
            </Stack>

            <Stack className="modal-actions">
              {activeStep > 0 && (
                <Button variant="outlined" onClick={handleBack} className="back-btn">
                  Back
                </Button>
              )}
              <Box sx={{ flex: 1 }} />
              {activeStep < steps.length - 1 ? (
                <Button variant="contained" onClick={handleNext} className="next-btn">
                  Next Step
                </Button>
              ) : (
                <Button variant="contained" onClick={handleConfirmPayment} className="confirm-btn">
                  Confirm & Pay
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>

      </div>
    </LocalizationProvider>
  );
};

export default withLayoutMain(PaymentPage);
