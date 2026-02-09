import React, { useState } from "react";
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

const Filter = () => {
  const [searchText, setSearchText] = useState<string>("");
  const [selectedLocations, setSelectedLocations] = useState<string[]>([]);
  const [selectedSpecialization, setSelectedSpecialization] =
    useState<string>("");
  const [consultationType, setConsultationType] = useState<string[]>([]);
  const [feeRange, setFeeRange] = useState({
    min: 50,
    max: 300,
  });
  const [selectedRating, setSelectedRating] = useState<number | null>(null);
  const [selectedAvailability, setSelectedAvailability] = useState<string>("");

  const handleReset = () => {
    setSearchText("");
    setSelectedLocations([]);
    setSelectedSpecialization("");
    setConsultationType([]);
    setFeeRange({ min: 50, max: 300 });
    setSelectedRating(null);
    setSelectedAvailability("");
  };

  const handleLocationChange = (location: string) => {
    if (selectedLocations.includes(location)) {
      setSelectedLocations(selectedLocations.filter((loc) => loc !== location));
    } else {
      setSelectedLocations([...selectedLocations, location]);
    }
  };

  const handleConsultationTypeChange = (type: string) => {
    if (consultationType.includes(type)) {
      setConsultationType(consultationType.filter((t) => t !== type));
    } else {
      setConsultationType([...consultationType, type]);
    }
  };

  return (
    <Stack className="filter-main">
      <Stack className="find-your-doctor" mb={"40px"}>
        <Typography className="title-main">Filters</Typography>
        <Stack className="clear-all">
          <Button onClick={handleReset} className="clear-btn">
            Clear All
          </Button>
        </Stack>
      </Stack>

      <Stack className="find-your-doctor" mb={"30px"}>
        <Typography className="title">Location</Typography>
        <Stack className="input-box">
          <OutlinedInput
            value={searchText}
            type="text"
            className="location-input"
            placeholder="e.g. New York, USA"
          />
        </Stack>
      </Stack>

      <Stack className="find-your-doctor" mb={"30px"}>
        <Typography className="title">Specialization</Typography>
        <FormControl fullWidth>
          <Select
            value={selectedSpecialization}
            onChange={(e) => setSelectedSpecialization(e.target.value)}
            displayEmpty
            className="specialization-select"
          >
            <MenuItem value="">
              <em>Select specialization</em>
            </MenuItem>
            <MenuItem value="cardiologist">Cardiologist</MenuItem>
            <MenuItem value="dermatologist">Dermatologist</MenuItem>
            <MenuItem value="pediatrician">Pediatrician</MenuItem>
            <MenuItem value="neurologist">Neurologist</MenuItem>
            <MenuItem value="orthopedic">Orthopedic</MenuItem>
            <MenuItem value="psychiatrist">Psychiatrist</MenuItem>
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
            checked={consultationType.includes("both")}
            onChange={() => handleConsultationTypeChange("both")}
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
            checked={consultationType.includes("video")}
            onChange={() => handleConsultationTypeChange("video")}
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
            checked={consultationType.includes("clinic")}
            onChange={() => handleConsultationTypeChange("clinic")}
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
            onChange={(e: any) => {
              if (e.target.value >= 0) {
                setFeeRange({ ...feeRange, min: Number(e.target.value) });
              }
            }}
          />
          <div className="central-divider"></div>
          <input
            type="number"
            placeholder="$ max"
            value={feeRange.max}
            onChange={(e: any) => {
              if (e.target.value >= 0) {
                setFeeRange({ ...feeRange, max: Number(e.target.value) });
              }
            }}
          />
        </Stack>
      </Stack>

      <Stack className="find-your-doctor">
        <Typography className="title">Availability</Typography>
        <Stack className="availability-buttons">
          <Button
            className={selectedAvailability === "today" ? "active" : ""}
            onClick={() =>
              setSelectedAvailability(
                selectedAvailability === "today" ? "" : "today",
              )
            }
          >
            Today
          </Button>
          <Button
            className={selectedAvailability === "tomorrow" ? "active" : ""}
            onClick={() =>
              setSelectedAvailability(
                selectedAvailability === "tomorrow" ? "" : "tomorrow",
              )
            }
          >
            Tomorrow
          </Button>
          <Button
            className={selectedAvailability === "this-week" ? "active" : ""}
            onClick={() =>
              setSelectedAvailability(
                selectedAvailability === "this-week" ? "" : "this-week",
              )
            }
          >
            This Week
          </Button>
        </Stack>
      </Stack>

      <Stack className="apply-filter-section" mt={"30px"}>
        <Button className="apply-filter-btn" fullWidth>
          Apply Filters
        </Button>
      </Stack>
    </Stack>
  );
};

export default Filter;
