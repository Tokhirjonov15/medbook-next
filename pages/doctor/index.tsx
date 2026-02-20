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
import { Direction } from "@/libs/enums/common.enum";
import useMemberTranslation from "@/libs/hooks/useMemberTranslation";

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
  const { t } = useMemberTranslation();
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
              placeholder={t("doctor.list.searchPlaceholder", "Search by doctor name or specialization...")}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) =>
                handleSearch(e.target.value)
              }
            />
          </Stack>
          <Box className="sort-box">
            <span>{t("doctor.list.sortBy", "Sort by:")}</span>
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
                {sortBy === "most_viewed" && t("doctor.list.sort.mostViewed", "Most Viewed")}
                {sortBy === "newest" && t("doctor.list.sort.newest", "Newest")}
                {sortBy === "oldest" && t("doctor.list.sort.oldest", "Oldest")}
                {sortBy === "rating" && t("doctor.list.sort.highestRating", "Highest Rating")}
              </Button>
            </div>
          </Box>
        </Box>

        <Stack className="result-count">
          <Typography>{totalDoctors} {t("doctor.list.found", "doctors found")}</Typography>
          <Typography className="subtitle">
            {t("doctor.list.subtitle", "Your health is our priority!!")}
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
                <Typography>{t("doctor.list.loadError", "Failed to load doctors.")}</Typography>
              )}
              {!getDoctorsLoading &&
                !getDoctorsError &&
                doctors.length === 0 && (
                  <Typography>{t("doctor.list.empty", "No doctors found.")}</Typography>
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
                <Typography>{t("doctor.list.totalPrefix", "Total")} {totalDoctors} {t("doctor.list.totalSuffix", "doctors available")}</Typography>
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
    direction: Direction.DESC,
    search: {},
  },
};

export default withLayoutMain(DoctorList);
