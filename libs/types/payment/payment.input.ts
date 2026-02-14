import { PaymentMethod, PaymentStatus } from "../../enums/payment.enum";
import { Direction } from "../../enums/common.enum";

export interface CreatePaymentInput {
  appointmentId: string;
  paymentMethod: PaymentMethod;
}

export interface RequestRefundInput {
  paymentId: string;
  reason: string;
}

export interface RefundByAdminInput {
  paymentId: string;
  adminNote: string;
}

export interface PaymentFilter {
  status?: PaymentStatus;
  patientId?: string;
  doctorId?: string;
  startDate?: Date;
  endDate?: Date;
}

export interface PaymentsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  filter?: PaymentFilter;
}
