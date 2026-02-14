import { Doctor, MetaCounter } from "../doctors/doctor";
import { ConsultationType } from "../../enums/consultation.enum";
import { AppointmentStatus } from "../../enums/appoinment.enum";
import { PaymentStatus } from "../../enums/payment.enum";
import { Member } from "../members/member";

export interface TimeSlot {
  start: string;
  end: string;
}

export interface Appointment {
  _id: string;
  patient: string;
  doctor: string;
  appointmentDate: Date;
  timeSlot: TimeSlot;
  consultationType: ConsultationType;
  status: AppointmentStatus;
  reason: string;
  symptoms?: string[];
  notes?: string;
  consultationFee: number;
  paymentStatus: PaymentStatus;
  paidAt?: Date;
  meetingLink?: string;
  meetingId?: string;
  followUpDate?: Date;
  cancelledBy?: string;
  cancellationReason?: string;
  cancelledAt?: Date;
  reminderSent: boolean;
  completedAt?: Date;
  duration?: number;
  createdAt: Date;
  updatedAt: Date;
  patientData?: Member;
  doctorData?: Doctor;
}

export interface Appointments {
  list: Appointment[];
  metaCounter: MetaCounter[];
}

