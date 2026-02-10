import React, { useState } from "react";
import { NextPage } from "next";
import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogContent,
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
import CloseIcon from "@mui/icons-material/Close";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import VideocamIcon from "@mui/icons-material/Videocam";
import LocalHospitalIcon from "@mui/icons-material/LocalHospital";
import CreditCardIcon from "@mui/icons-material/CreditCard";
import MoneyIcon from "@mui/icons-material/Money";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { StaticDatePicker } from "@mui/x-date-pickers/StaticDatePicker";
import withLayoutMain from "@/libs/components/layout/LayoutHome";

const steps = ["Date & Time", "Details", "Payment"];

const PaymentPage: NextPage = () => {
  const router = useRouter();
  const { id } = router.query;

  const [activeStep, setActiveStep] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(new Date());
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [consultationType, setConsultationType] = useState<string>("clinic");
  const [reason, setReason] = useState<string>("");
  const [symptoms, setSymptoms] = useState<string[]>([]);
  const [symptomInput, setSymptomInput] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("credit");
  const [cardDetails, setCardDetails] = useState({
    number: "",
    expiry: "",
    cvv: "",
  });
  const [showSuccess, setShowSuccess] = useState(false);
  const [showVideoAlert, setShowVideoAlert] = useState(false);

  // Mock data - replace with API call
  const doctor = {
    id: "1",
    name: "Dr. Sarah Smith",
    specialization: "Dermatologist",
    image: "/img/defaultUser.svg",
    consultationFee: 150,
    workingDays: ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"],
    workingHours: "09:00 AM - 05:00 PM",
  };

  const availableSlots = [
    "09:00 AM",
    "09:30 AM",
    "10:00 AM",
    "10:30 AM",
    "11:00 AM",
    "02:00 PM",
    "02:30 PM",
  ];

  const handleNext = () => {
    if (activeStep === 0 && !selectedTime) {
      alert("Please select a time slot");
      return;
    }
    if (activeStep === 1 && consultationType === "video") {
      setShowVideoAlert(true);
      return;
    }
    if (activeStep === 1 && !reason.trim()) {
      alert("Please provide a reason for visit");
      return;
    }
    setActiveStep((prevActiveStep) => prevActiveStep + 1);
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
    if (paymentMethod === "credit") {
      if (!cardDetails.number || !cardDetails.expiry || !cardDetails.cvv) {
        alert("Please fill in all card details");
        return;
      }
    }

    try {
      // TODO: API call to create appointment and payment
      const appointmentData = {
        doctorId: id,
        date: selectedDate,
        time: selectedTime,
        consultationType,
        reason,
        symptoms,
        paymentMethod,
      };

      console.log("Booking appointment:", appointmentData);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      setShowSuccess(true);
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("Failed to create appointment. Please try again.");
    }
  };

  const handleSuccessClose = () => {
    setShowSuccess(false);
    router.push("/mypage");
  };

  const handleClose = () => {
    if (
      confirm(
        "Are you sure you want to cancel the booking? Your progress will be lost.",
      )
    ) {
      router.back();
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDateFns}>
      <div id="payment-page">
        <Stack className="payment-container">
          <Stack className="payment-modal">
            {/* Header */}
            <Stack className="modal-header">
              <Typography className="modal-title">Book Appointment</Typography>
              <IconButton onClick={handleClose} className="close-btn">
                <CloseIcon />
              </IconButton>
            </Stack>

            {/* Stepper */}
            <Stack className="stepper-section">
              <Stepper activeStep={activeStep} className="booking-stepper">
                {steps.map((label, index) => (
                  <Step key={label}>
                    <StepLabel className="step-label">
                      <Typography className="step-text">{label}</Typography>
                    </StepLabel>
                  </Step>
                ))}
              </Stepper>
            </Stack>

            {/* Step Content */}
            <Stack className="step-content">
              {/* Step 1: Date & Time */}
              {activeStep === 0 && (
                <Stack className="step-one">
                  <Typography className="section-title">Select Date</Typography>
                  <Box className="date-picker-box">
                    <StaticDatePicker
                      displayStaticWrapperAs="desktop"
                      value={selectedDate}
                      onChange={(newValue: Date | null) =>
                        setSelectedDate(newValue)
                      }
                      minDate={new Date()}
                      className="date-picker"
                    />
                  </Box>

                  <Typography className="section-title">
                    Available Slots
                  </Typography>
                  <Stack className="time-slots">
                    {availableSlots.map((slot) => (
                      <Button
                        key={slot}
                        variant={
                          selectedTime === slot ? "contained" : "outlined"
                        }
                        onClick={() => setSelectedTime(slot)}
                        className={`time-slot ${
                          selectedTime === slot ? "selected" : ""
                        }`}
                      >
                        {slot}
                      </Button>
                    ))}
                  </Stack>
                </Stack>
              )}

              {/* Step 2: Details */}
              {activeStep === 1 && (
                <Stack className="step-two">
                  <Typography className="section-title">
                    Consultation Type
                  </Typography>
                  <Stack className="consultation-types">
                    <Box
                      className={`consultation-card ${
                        consultationType === "video" ? "selected" : ""
                      }`}
                      onClick={() => setConsultationType("video")}
                    >
                      <VideocamIcon className="card-icon" />
                      <Typography className="card-title">Video Call</Typography>
                    </Box>
                    <Box
                      className={`consultation-card ${
                        consultationType === "clinic" ? "selected" : ""
                      }`}
                      onClick={() => setConsultationType("clinic")}
                    >
                      <LocalHospitalIcon className="card-icon" />
                      <Typography className="card-title">
                        Clinic Visit
                      </Typography>
                    </Box>
                  </Stack>

                  <Typography className="section-title">
                    Reason for Visit
                  </Typography>
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
                        <Chip
                          key={symptom}
                          label={symptom}
                          onDelete={() => handleRemoveSymptom(symptom)}
                          className="symptom-chip"
                        />
                      ))}
                    </Stack>
                    <TextField
                      fullWidth
                      placeholder="Type and press Enter"
                      value={symptomInput}
                      onChange={(e) => setSymptomInput(e.target.value)}
                      onKeyPress={handleAddSymptom}
                      className="symptom-input"
                    />
                  </Stack>
                </Stack>
              )}

              {/* Step 3: Payment */}
              {activeStep === 2 && (
                <Stack className="step-three">
                  <Stack className="payment-layout">
                    <Stack className="payment-left">
                      <Typography className="section-title">
                        Payment Method
                      </Typography>

                      <Stack className="payment-methods">
                        <Box
                          className={`payment-method-card ${
                            paymentMethod === "credit" ? "selected" : ""
                          }`}
                          onClick={() => setPaymentMethod("credit")}
                        >
                          <Radio
                            checked={paymentMethod === "credit"}
                            className="payment-radio"
                          />
                          <Stack className="payment-info">
                            <Typography className="payment-title">
                              Credit Card
                            </Typography>
                            <Typography className="payment-subtitle">
                              **** **** **** 4242
                            </Typography>
                          </Stack>
                          <CreditCardIcon className="payment-icon" />
                        </Box>

                        <Box
                          className={`payment-method-card ${
                            paymentMethod === "property" ? "selected" : ""
                          }`}
                          onClick={() => setPaymentMethod("property")}
                        >
                          <Radio
                            checked={paymentMethod === "property"}
                            className="payment-radio"
                          />
                          <Stack className="payment-info">
                            <Typography className="payment-title">
                              Pay at the Property
                            </Typography>
                            <Typography className="payment-subtitle">
                              Pay when you arrive
                            </Typography>
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
                                number: e.target.value,
                              })
                            }
                            className="card-input"
                          />
                          <Stack className="card-row">
                            <TextField
                              label="Expiry Date"
                              placeholder="MM/YY"
                              value={cardDetails.expiry}
                              onChange={(e) =>
                                setCardDetails({
                                  ...cardDetails,
                                  expiry: e.target.value,
                                })
                              }
                              className="card-input"
                            />
                            <TextField
                              label="CVV"
                              placeholder="123"
                              value={cardDetails.cvv}
                              onChange={(e) =>
                                setCardDetails({
                                  ...cardDetails,
                                  cvv: e.target.value,
                                })
                              }
                              className="card-input"
                            />
                          </Stack>
                        </Stack>
                      )}
                    </Stack>

                    <Stack className="payment-right">
                      <Stack className="summary-card">
                        <Typography className="summary-title">
                          SUMMARY
                        </Typography>

                        <Stack className="doctor-summary">
                          <Box className="doctor-avatar">
                            <img src={doctor.image} alt={doctor.name} />
                          </Box>
                          <Stack className="doctor-info">
                            <Typography className="doctor-name">
                              {doctor.name}
                            </Typography>
                            <Typography className="doctor-spec">
                              {doctor.specialization}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Stack className="summary-details">
                          <Stack className="summary-row">
                            <Typography className="summary-label">
                              Date
                            </Typography>
                            <Typography className="summary-value">
                              {selectedDate?.toLocaleDateString()}
                            </Typography>
                          </Stack>
                          <Stack className="summary-row">
                            <Typography className="summary-label">
                              Time
                            </Typography>
                            <Typography className="summary-value">
                              {selectedTime}
                            </Typography>
                          </Stack>
                          <Stack className="summary-row">
                            <Typography className="summary-label">
                              Type
                            </Typography>
                            <Typography className="summary-value">
                              {consultationType === "clinic"
                                ? "Clinic Visit"
                                : "Video Call"}
                            </Typography>
                          </Stack>
                        </Stack>

                        <Stack className="summary-total">
                          <Typography className="total-label">Total</Typography>
                          <Typography className="total-amount">
                            ${doctor.consultationFee}.00
                          </Typography>
                        </Stack>
                      </Stack>
                    </Stack>
                  </Stack>
                </Stack>
              )}
            </Stack>

            {/* Actions */}
            <Stack className="modal-actions">
              {activeStep > 0 && (
                <Button
                  variant="outlined"
                  onClick={handleBack}
                  className="back-btn"
                >
                  Back
                </Button>
              )}
              <Box sx={{ flex: 1 }} />
              {activeStep < steps.length - 1 ? (
                <Button
                  variant="contained"
                  onClick={handleNext}
                  className="next-btn"
                >
                  Next Step
                </Button>
              ) : (
                <Button
                  variant="contained"
                  onClick={handleConfirmPayment}
                  className="confirm-btn"
                >
                  Confirm & Pay
                </Button>
              )}
            </Stack>
          </Stack>
        </Stack>

        {/* Video Alert Dialog */}
        <Dialog
          open={showVideoAlert}
          onClose={() => setShowVideoAlert(false)}
          className="alert-dialog"
        >
          <DialogContent>
            <Alert severity="info" className="video-alert">
              <Typography variant="h6" className="alert-title">
                Coming Soon!
              </Typography>
              <Typography>
                Video consultation feature is not available yet. Please select
                Clinic Visit for now.
              </Typography>
              <Button
                onClick={() => {
                  setShowVideoAlert(false);
                  setConsultationType("clinic");
                }}
                variant="contained"
                className="alert-btn"
              >
                OK
              </Button>
            </Alert>
          </DialogContent>
        </Dialog>

        {/* Success Dialog */}
        <Dialog
          open={showSuccess}
          onClose={handleSuccessClose}
          className="success-dialog"
        >
          <DialogContent>
            <Stack className="success-content">
              <Box className="success-icon">
                <CheckCircleIcon />
              </Box>
              <Typography className="success-title">
                Booking Confirmed!
              </Typography>
              <Typography className="success-message">
                Your appointment with {doctor.name} is set for{" "}
                {selectedDate?.toLocaleDateString()} at {selectedTime}
              </Typography>
              <Stack className="success-actions">
                <Button
                  variant="contained"
                  onClick={handleSuccessClose}
                  className="view-appointment-btn"
                >
                  View Appointment
                </Button>
                <Button
                  variant="outlined"
                  onClick={handleSuccessClose}
                  className="done-btn"
                >
                  Done
                </Button>
              </Stack>
            </Stack>
          </DialogContent>
        </Dialog>
      </div>
    </LocalizationProvider>
  );
};

export default withLayoutMain(PaymentPage);
