import { PaymentStatus, PaymentMethod } from "../../enums/payment.enum";
import { MetaCounter } from "../doctors/doctor";

export interface Payment {
  _id: string;
  appointment: string;
  patient: string;
  doctor: string;
  amount: number;
  platformFee: number;
  doctorAmount: number;
  paymentMethod: PaymentMethod;
  status: PaymentStatus;
  refundRequestReason?: string;
  refundRequestedAt?: Date;
  refundedBy?: string;
  refundReason?: string;
  refundedAt?: Date;
  paidAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payments {
  list: Payment[];
  metaCounter: MetaCounter[];
}

export interface PaymentAppointmentData {
  _id: string;
  appointmentDate: Date;
  timeSlot: string;
  status: string;
}

export interface PaymentPatientData {
  _id: string;
  memberNick: string;
  memberFullName: string;
  memberPhone?: string;
}

export interface PaymentDoctorData {
  _id: string;
  memberNick: string;
  memberFullName: string;
  specializations?: string[];
}

export interface PaymentRefundedByData {
  _id: string;
  memberNick: string;
  memberFullName: string;
}
