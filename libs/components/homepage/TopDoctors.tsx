import { Box, Stack } from "@mui/material";
import { Star, ChevronLeft, ChevronRight } from "@mui/icons-material";
import { useRouter } from "next/navigation";
import { Swiper, SwiperSlide } from "swiper/react";
import { Navigation, Pagination, type Swiper as SwiperType } from "swiper";
import { useRef } from "react";
import "swiper/css";
import "swiper/css/navigation";
import "swiper/css/pagination";

interface Doctor {
  id: string;
  name: string;
  specialization: string;
  experience: number;
  rating: number;
  image: string;
  availability: string;
  backgroundColor: string;
}

const TopRatedDoctors = () => {
  const router = useRouter();
  const swiperRef = useRef<SwiperType | null>(null);
  const doctors: Doctor[] = [
    {
      id: "1",
      name: "Dr. Sarah Smith",
      specialization: "Dermatologist",
      experience: 8,
      rating: 4.9,
      image: "/img/girl.svg",
      availability: "Available Today",
      backgroundColor: "#4fd1c5",
    },
    {
      id: "2",
      name: "Dr. James Wilson",
      specialization: "Neurologist",
      experience: 12,
      rating: 4.8,
      image: "/img/girl.svg",
      availability: "Next Available: Mon",
      backgroundColor: "#2d3748",
    },
    {
      id: "3",
      name: "Dr. Anita Patel",
      specialization: "Pediatrician",
      experience: 6,
      rating: 5.0,
      image: "/img/girl.svg",
      availability: "Available Tomorrow",
      backgroundColor: "#f6e05e",
    },
    {
      id: "4",
      name: "Dr. Michael Ross",
      specialization: "Orthopedist",
      experience: 15,
      rating: 4.7,
      image: "/img/girl.svg",
      availability: "Next Available: Wed",
      backgroundColor: "#48bb78",
    },
  ];

  const handleBooking = (doctorId: string) => {
    router.push(`/doctors/${doctorId}/book`);
  };

  return (
    <Box className="top-rated-doctors">
      <Stack className="top-rated-doctors-container">
        {/* Header */}
        <Box className="top-rated-doctors-header">
          <h2 className="top-rated-doctors-title">Top Rated Doctors</h2>
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

        {/* Doctors Swiper */}
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
            {doctors.map((doctor) => (
              <SwiperSlide key={doctor.id}>
                <Box className="doctor-card">
                  <Box
                    className="doctor-card-image"
                    sx={{ backgroundColor: doctor.backgroundColor }}
                  >
                    <img src={doctor.image} alt={doctor.name} />
                    <Box className="doctor-card-rating">
                      <Star />
                      <span>{doctor.rating}</span>
                    </Box>
                  </Box>
                  <Box className="doctor-card-content">
                    <h3 className="doctor-card-name">{doctor.name}</h3>
                    <p className="doctor-card-specialization">
                      {doctor.specialization} • {doctor.experience} yrs exp
                    </p>
                    <Box className="doctor-card-footer">
                      <span className="doctor-card-availability">
                        {doctor.availability}
                      </span>
                      <button
                        className="doctor-card-book-btn"
                        onClick={() => handleBooking(doctor.id)}
                      >
                        Book
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

export default TopRatedDoctors;
