import React from "react";
import {
  Box,
  Button,
  CircularProgress,
  OutlinedInput,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import { NextPage } from "next";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import { useQuery } from "@apollo/client";
import DoctorCard from "@/libs/components/doctors/DoctorCard";
import Filter from "@/libs/components/doctors/Filter";
import withLayoutMain from "@/libs/components/layout/LayoutMember";
import { GET_DOCTORS } from "@/apollo/user/query";
import { Doctors } from "@/libs/types/doctors/doctor";
import { DoctorsInquiry } from "@/libs/types/members/member.input";
import { useDoctorQueryState } from "@/libs/hooks/useDoctorQueryState";

interface DoctorListProps {
  initialInput: DoctorsInquiry;
}

interface GetDoctorsResponse {
  getDoctors: Doctors;
}

interface GetDoctorsVariables {
  input: DoctorsInquiry;
}

const DoctorList: NextPage<DoctorListProps> = (props: DoctorListProps) => {
  const { initialInput } = props;
  const {
    queryInput,
    searchText,
    sortBy,
    currentPage,
    locationText,
    selectedSpecializationFilter,
    consultationTypeFilter,
    feeRange,
    setCurrentPage,
    setLocationText,
    setSelectedSpecializationFilter,
    setConsultationTypeFilter,
    setFeeRange,
    handleSearch,
    handleSort,
    handleResetFilters,
  } = useDoctorQueryState(initialInput);

  /** APOLLO REQUESTS **/
  const {
    loading: getDoctorsLoading,
    data: getDoctorsData,
    error: getDoctorsError,
    refetch: getDoctorsRefetch,
  } = useQuery<GetDoctorsResponse, GetDoctorsVariables>(GET_DOCTORS, {
    fetchPolicy: "cache-and-network",
    variables: { input: queryInput },
    notifyOnNetworkStatusChange: true,
  });

  const doctors = getDoctorsData?.getDoctors?.list ?? [];
  const totalDoctors = getDoctorsData?.getDoctors?.metaCounter?.[0]?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(totalDoctors / queryInput.limit));

  /** HANDLERS **/
  const handlePageChange = (
    _event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div id="doctor-list-page" style={{ position: "relative" }}>
      <Stack className="container">
        <Box className="top-controls">
          <Stack className="search-box">
            <OutlinedInput
              value={searchText}
              type="text"
              className="search-input"
              placeholder="Search by doctor name or specialization..."
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSearch(e.target.value)
              }
            />
          </Stack>
          <Box className="sort-box">
            <span>Sort by:</span>
            <div>
              <Button
                endIcon={<KeyboardArrowDownRoundedIcon />}
                onClick={() => {
                  const sortOptions = [
                    "most_viewed",
                    "newest",
                    "oldest",
                    "rating",
                  ];
                  const currentIndex = sortOptions.indexOf(sortBy);
                  const nextIndex = (currentIndex + 1) % sortOptions.length;
                  handleSort(sortOptions[nextIndex]);
                }}
              >
                {sortBy === "most_viewed" && "Most Viewed"}
                {sortBy === "newest" && "Newest"}
                {sortBy === "oldest" && "Oldest"}
                {sortBy === "rating" && "Highest Rating"}
              </Button>
            </div>
          </Box>
        </Box>

        <Stack className="result-count">
          <Typography>{totalDoctors} doctors found</Typography>
          <Typography className="subtitle">
            Find your doctor from real-time MedBook database
          </Typography>
        </Stack>

        <Stack className="doctor-page">
          <Stack className="filter-config">
            <Filter
              locationText={locationText}
              selectedSpecialization={selectedSpecializationFilter}
              consultationType={consultationTypeFilter}
              feeRange={feeRange}
              onLocationChange={setLocationText}
              onSpecializationChange={setSelectedSpecializationFilter}
              onConsultationTypeChange={setConsultationTypeFilter}
              onFeeRangeChange={setFeeRange}
              onReset={handleResetFilters}
            />
          </Stack>
          <Stack className="main-config" mb={"76px"}>
            <Stack className="list-config">
              {getDoctorsLoading && (
                <Stack
                  sx={{
                    display: "flex",
                    justifyContent: "center",
                    alignItems: "center",
                    width: "100%",
                    minHeight: "520px",
                  }}
                >
                  <CircularProgress size={"3rem"} />
                </Stack>
              )}
              {getDoctorsError && (
                <Typography>Failed to load doctors.</Typography>
              )}
              {!getDoctorsLoading &&
                !getDoctorsError &&
                doctors.length === 0 && (
                  <Typography>No doctors found.</Typography>
                )}
              {!getDoctorsLoading &&
                !getDoctorsError &&
                doctors.map((doctor) => (
                  <DoctorCard
                    key={doctor._id}
                    doctor={doctor}
                    refetch={getDoctorsRefetch}
                    query={queryInput}
                  />
                ))}
            </Stack>
            <Stack className="pagination-config">
              <Stack className="pagination-box">
                <Pagination
                  page={currentPage}
                  count={totalPages}
                  shape="circular"
                  color="secondary"
                  onChange={handlePageChange}
                />
              </Stack>
              <Stack className="total-result">
                <Typography>Total {totalDoctors} doctors available</Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
};

DoctorList.defaultProps = {
  initialInput: {
    page: 1,
    limit: 5,
    sort: "doctorViews",
    direction: "DESC",
    search: {},
  },
};

export default withLayoutMain(DoctorList);
