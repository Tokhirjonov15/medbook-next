import { Box, Stack } from "@mui/material";
import { ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useRouter } from "next/router";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, type Swiper as SwiperType } from "swiper";
import { useRef, useState } from "react";
import useMemberTranslation from "@/libs/hooks/useMemberTranslation";
import { useQuery } from "@apollo/client";
import { GET_DOCTORS } from "@/apollo/user/query";
import { Doctor } from "@/libs/types/doctors/doctor";
import { DoctorsInquiry } from "@/libs/types/members/member.input";
import { T } from "@/libs/types/common";

interface TopDoctorsProps {
  initialInput?: DoctorsInquiry;
}

const TopRatedDoctors = ({
  initialInput = DEFAULT_DOCTORS_INPUT,
}: TopDoctorsProps) => {
  const router = useRouter();
  const swiperRef = useRef<SwiperType | null>(null);
  const { t } = useMemberTranslation();
  const [topDoctors, setTopDoctors] = useState<Doctor[]>([]);
 
  /** APOLLO */
  const {
    loading: getDoctorsLoading,
    data: getDoctorsData,
    error: getDoctorsError,
    refetch: getDoctorsRefetch,
  } = useQuery(GET_DOCTORS, {
    fetchPolicy: "cache-and-network",
    variables: { input: initialInput },
    notifyOnNetworkStatusChange: true,
    onCompleted: (data: T) => {
      setTopDoctors(data?.getDoctors?.list);
    },
  });

  /** HANDLERS **/

  const handleBooking = (doctorId: string) => {
    router.push(`/doctor/detail?id=${doctorId}`);
  };

  const getSpecializationLabel = (value: Doctor["specialization"]) => {
    const list = Array.isArray(value) ? value : value ? [value] : [];
    return list.map((item) => String(item).replaceAll("_", " ")).join(", ");
  };

  const getAvailabilityText = (doctor: Doctor) => {
    if (doctor?.workingDays?.length) {
      return `${t("home.nextAvailableMon")}: ${doctor.workingDays[0]}`;
    }
    return t("home.availableToday");
  };

  return (
    <Box className="top-rated-doctors">
      <Stack className="top-rated-doctors-container">
        <Box className="top-rated-doctors-header">
          <h2 className="top-rated-doctors-title">
            {t("home.topRatedDoctors")}
          </h2>
          <Box className="swiper-navigation-buttons">
            <button
              className="swiper-button-custom swiper-button-prev-custom"
              onClick={() => swiperRef.current?.slidePrev()}
            >
              <ChevronLeft />
            </button>
            <button
              className="swiper-button-custom swiper-button-next-custom"
              onClick={() => swiperRef.current?.slideNext()}
            >
              <ChevronRight />
            </button>
          </Box>
        </Box>

        <Box className="top-rated-doctors-swiper">
          <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={20}
            slidesPerView={1}
            slidesPerGroup={1}
            onSwiper={(swiper) => {
              swiperRef.current = swiper;
            }}
            breakpoints={{
              480: {
                slidesPerView: 1,
                spaceBetween: 16,
              },
              640: {
                slidesPerView: 2,
                spaceBetween: 16,
              },
              768: {
                slidesPerView: 2,
                spaceBetween: 20,
              },
              1024: {
                slidesPerView: 3,
                spaceBetween: 20,
              },
              1280: {
                slidesPerView: 4,
                spaceBetween: 20,
              },
            }}
          >
            {topDoctors.map((doctor) => (
              <SwiperSlide key={doctor._id}>
                <Box className="doctor-card">
                  <Box
                    className="doctor-card-image"
                    sx={{ backgroundColor: "#2d3748" }}
                  >
                    <img
                      src={doctor.memberImage || "/img/defaultUser.svg"}
                      alt={doctor.memberFullName || doctor.memberNick}
                    />
                  </Box>
                  <Box className="doctor-card-content">
                    <h3 className="doctor-card-name">
                      {doctor.memberFullName || doctor.memberNick}
                    </h3>
                    <p className="doctor-card-specialization">
                      {getSpecializationLabel(doctor.specialization)} -{" "}
                      {doctor.experience} {t("home.yearsExp")}
                    </p>
                    <Box className="doctor-card-footer">
                      <span className="doctor-card-availability">
                        {getAvailabilityText(doctor)}
                      </span>
                      <button
                        className="doctor-card-book-btn"
                        onClick={() => handleBooking(doctor._id)}
                      >
                        {t("home.book")}
                      </button>
                    </Box>
                  </Box>
                </Box>
              </SwiperSlide>
            ))}
          </Swiper>
        </Box>
      </Stack>
    </Box>
  );
};

const DEFAULT_DOCTORS_INPUT: DoctorsInquiry = {
  page: 1,
  limit: 4,
  sort: "doctorViews",
  search: {},
};

TopRatedDoctors.defaultProps = {
  initialInput: DEFAULT_DOCTORS_INPUT,
};

export default TopRatedDoctors;
