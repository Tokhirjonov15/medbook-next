import React from "react";
import {
  Button,
  Checkbox,
  FormControl,
  MenuItem,
  OutlinedInput,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { ConsultationType } from "@/libs/enums/consultation.enum";
import { Specialization } from "@/libs/enums/specialization.enum";

interface FilterProps {
  locationText: string;
  selectedSpecialization: Specialization | "";
  consultationType: ConsultationType[];
  feeRange: {
    min: number;
    max: number;
  };
  onLocationChange: (value: string) => void;
  onSpecializationChange: (value: Specialization | "") => void;
  onConsultationTypeChange: (value: ConsultationType[]) => void;
  onFeeRangeChange: (value: { min: number; max: number }) => void;
  onReset: () => void;
}

const Filter = ({
  locationText,
  selectedSpecialization,
  consultationType,
  feeRange,
  onLocationChange,
  onSpecializationChange,
  onConsultationTypeChange,
  onFeeRangeChange,
  onReset,
}: FilterProps) => {
  const toggleConsultationType = (type: ConsultationType) => {
    if (consultationType.includes(type)) {
      onConsultationTypeChange(consultationType.filter((t) => t !== type));
    } else {
      onConsultationTypeChange([...consultationType, type]);
    }
  };

  return (
    <Stack className="filter-main">
      <Stack className="find-your-doctor" mb={"40px"}>
        <Typography className="title-main">Filters</Typography>
        <Stack className="clear-all">
          <Button onClick={onReset} className="clear-btn">
            Clear All
          </Button>
        </Stack>
      </Stack>

      <Stack className="find-your-doctor" mb={"30px"}>
        <Typography className="title">Location</Typography>
        <Stack className="input-box">
          <OutlinedInput
            value={locationText}
            type="text"
            className="location-input"
            placeholder="e.g. New York, USA"
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => onLocationChange(e.target.value)}
          />
        </Stack>
      </Stack>

      <Stack className="find-your-doctor" mb={"30px"}>
        <Typography className="title">Specialization</Typography>
        <FormControl fullWidth>
          <Select
            value={selectedSpecialization}
            onChange={(e) => onSpecializationChange(e.target.value as Specialization | "")}
            displayEmpty
            className="specialization-select"
          >
            <MenuItem value="">
              <em>Select specialization</em>
            </MenuItem>
            {Object.values(Specialization).map((spec) => (
              <MenuItem key={spec} value={spec}>
                {spec.replaceAll("_", " ")}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Stack>

      <Stack className="find-your-doctor" mb={"30px"}>
        <Typography className="title">Consultation Type</Typography>
        <Stack className="input-box">
          <Checkbox
            id={"both"}
            className="doctor-checkbox"
            color="default"
            size="small"
            checked={consultationType.includes(ConsultationType.BOTH)}
            onChange={() => toggleConsultationType(ConsultationType.BOTH)}
          />
          <label htmlFor={"both"} style={{ cursor: "pointer" }}>
            <Typography className="doctor-type">Both</Typography>
          </label>
        </Stack>
        <Stack className="input-box">
          <Checkbox
            id={"video-consult"}
            className="doctor-checkbox"
            color="default"
            size="small"
            checked={consultationType.includes(ConsultationType.VIDEO)}
            onChange={() => toggleConsultationType(ConsultationType.VIDEO)}
          />
          <label htmlFor={"video-consult"} style={{ cursor: "pointer" }}>
            <Typography className="doctor-type">Video Consult</Typography>
          </label>
        </Stack>
        <Stack className="input-box">
          <Checkbox
            id={"clinic-visit"}
            className="doctor-checkbox"
            color="default"
            size="small"
            checked={consultationType.includes(ConsultationType.CLINIC)}
            onChange={() => toggleConsultationType(ConsultationType.CLINIC)}
          />
          <label htmlFor={"clinic-visit"} style={{ cursor: "pointer" }}>
            <Typography className="doctor-type">Clinic Visit</Typography>
          </label>
        </Stack>
      </Stack>

      <Stack className="find-your-doctor" mb={"30px"}>
        <Typography className="title">Fee Range</Typography>
        <Stack className="fee-display">
          <Typography className="fee-text">
            ${feeRange.min} - ${feeRange.max}
          </Typography>
        </Stack>
        <Stack className="fee-inputs">
          <input
            type="number"
            placeholder="$ min"
            min={0}
            value={feeRange.min}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 0) {
                onFeeRangeChange({ ...feeRange, min: value });
              }
            }}
          />
          <div className="central-divider"></div>
          <input
            type="number"
            placeholder="$ max"
            value={feeRange.max}
            onChange={(e) => {
              const value = Number(e.target.value);
              if (value >= 0) {
                onFeeRangeChange({ ...feeRange, max: value });
              }
            }}
          />
        </Stack>
      </Stack>
    </Stack>
  );
};

export default Filter;
