import { ConsultationType } from "../../enums/consultation.enum";
import { AppointmentStatus } from "../../enums/appoinment.enum";
import { Direction } from "../../enums/common.enum";

export interface TimeSlotInput {
  start: string;
  end: string;
}

export interface BookAppointmentInput {
  doctor: string;
  appointmentDate: Date;
  timeSlot: TimeSlotInput;
  consultationType: ConsultationType;
  reason: string;
  symptoms?: string[];
  notes?: string;
}

export interface AppointmentsInquirySearch {
  doctorId?: string;
  patientId?: string;
  status?: AppointmentStatus;
  dateFrom?: Date;
  dateTo?: Date;
}

export interface AppointmentsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search?: AppointmentsInquirySearch;
}

interface AAISearch {
  appointmentStatus?: AppointmentStatus;
}

export interface AllAppointmentsInquiry {
  page: number;
  limit: number;
  sort?: string;
  direction?: Direction;
  search?: AAISearch;
}

