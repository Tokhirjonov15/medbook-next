export interface TimeSlotInput {
  start: string;
  end: string;
}

export interface AppointmentUpdate {
  _id: string | undefined;
  appointmentDate?: Date;
  timeSlot?: TimeSlotInput;
  symptoms?: string[];
  notes?: string;
}

