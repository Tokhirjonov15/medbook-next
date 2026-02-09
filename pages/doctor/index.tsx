import React, { useState } from "react";
import {
  Box,
  Button,
  OutlinedInput,
  Pagination,
  Stack,
  Typography,
} from "@mui/material";
import { NextPage } from "next";
import KeyboardArrowDownRoundedIcon from "@mui/icons-material/KeyboardArrowDownRounded";
import withLayoutMain from "@/libs/components/layout/LayoutHome";
import DoctorCard from "@/libs/components/doctors/DoctorCard";
import Filter from "@/libs/components/doctors/Filter";

const DoctorList: NextPage = () => {
  const [doctors, setDoctors] = useState<any[]>([
    {
      id: 1,
      name: "Dr. Sarah Jenkins",
      specialization: "Cardiologist",
      rating: 4.9,
      reviews: 120,
      experience: 12,
      location: "New York, NY",
      consultationFee: 120,
      availability: "Available Today, 4:00 PM",
      availableNow: true,
      verified: true,
      videoConsult: true,
    },
    {
      id: 2,
      name: "Dr. Michael Chen",
      specialization: "Dermatologist",
      rating: 4.7,
      reviews: 95,
      experience: 8,
      location: "Brooklyn, NY",
      consultationFee: 100,
      availability: "Video Consult Available",
      availableNow: false,
      verified: true,
      videoConsult: true,
    },
    {
      id: 3,
      name: "Dr. Emily Roberts",
      specialization: "Pediatrician",
      rating: 5.0,
      reviews: 42,
      experience: 6,
      location: "Queens, NY",
      consultationFee: 90,
      availability: "Next Available: Tomorrow",
      availableNow: false,
      verified: false,
      videoConsult: false,
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      specialization: "Neurologist",
      rating: 4.8,
      reviews: 210,
      experience: 18,
      location: "Manhattan, NY",
      consultationFee: 180,
      availability: "Available Today, 6:30 PM",
      availableNow: true,
      verified: true,
      videoConsult: false,
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      specialization: "Neurologist",
      rating: 4.8,
      reviews: 210,
      experience: 18,
      location: "Manhattan, NY",
      consultationFee: 180,
      availability: "Available Today, 6:30 PM",
      availableNow: true,
      verified: true,
      videoConsult: false,
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      specialization: "Neurologist",
      rating: 4.8,
      reviews: 210,
      experience: 18,
      location: "Manhattan, NY",
      consultationFee: 180,
      availability: "Available Today, 6:30 PM",
      availableNow: true,
      verified: true,
      videoConsult: false,
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      specialization: "Neurologist",
      rating: 4.8,
      reviews: 210,
      experience: 18,
      location: "Manhattan, NY",
      consultationFee: 180,
      availability: "Available Today, 6:30 PM",
      availableNow: true,
      verified: true,
      videoConsult: false,
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      specialization: "Neurologist",
      rating: 4.8,
      reviews: 210,
      experience: 18,
      location: "Manhattan, NY",
      consultationFee: 180,
      availability: "Available Today, 6:30 PM",
      availableNow: true,
      verified: true,
      videoConsult: false,
    },
    {
      id: 4,
      name: "Dr. James Wilson",
      specialization: "Neurologist",
      rating: 4.8,
      reviews: 210,
      experience: 18,
      location: "Manhattan, NY",
      consultationFee: 180,
      availability: "Available Today, 6:30 PM",
      availableNow: true,
      verified: true,
      videoConsult: false,
    },
  ]);

  const [searchText, setSearchText] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("relevance");
  const [filteredDoctors, setFilteredDoctors] = useState<any[]>(doctors);
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 4;

  // Handle search
  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1); // Reset to first page when searching
    filterDoctors(value, sortBy);
  };

  // Handle sort
  const handleSort = (sortType: string) => {
    setSortBy(sortType);
    setCurrentPage(1); // Reset to first page when sorting
    filterDoctors(searchText, sortType);
  };

  // Handle page change
  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Filter and sort doctors
  const filterDoctors = (search: string, sort: string) => {
    let filtered = [...doctors];

    // Filter by search text (doctor name)
    if (search) {
      filtered = filtered.filter((doctor) =>
        doctor.name.toLowerCase().includes(search.toLowerCase()),
      );
    }

    // Sort doctors
    if (sort === "newest") {
      filtered = filtered.sort((a, b) => b.id - a.id);
    } else if (sort === "oldest") {
      filtered = filtered.sort((a, b) => a.id - b.id);
    } else if (sort === "price_low") {
      filtered = filtered.sort((a, b) => a.consultationFee - b.consultationFee);
    } else if (sort === "price_high") {
      filtered = filtered.sort((a, b) => b.consultationFee - a.consultationFee);
    } else if (sort === "rating") {
      filtered = filtered.sort((a, b) => b.rating - a.rating);
    }

    setFilteredDoctors(filtered);
  };

  // Calculate pagination
  const totalPages = Math.ceil(filteredDoctors.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentDoctors = filteredDoctors.slice(startIndex, endIndex);

  return (
    <div id="doctor-list-page" style={{ position: "relative" }}>
      <Stack className="container">
        <Box className="top-controls">
          <Stack className="search-box">
            <OutlinedInput
              value={searchText}
              type="text"
              className="search-input"
              placeholder="Search by doctor name..."
              onChange={(e: any) => handleSearch(e.target.value)}
            />
          </Stack>
          <Box className="sort-box">
            <span>Sort by:</span>
            <div>
              <Button
                endIcon={<KeyboardArrowDownRoundedIcon />}
                onClick={() => {
                  const sortOptions = [
                    "relevance",
                    "newest",
                    "oldest",
                    "price_low",
                    "price_high",
                    "rating",
                  ];
                  const currentIndex = sortOptions.indexOf(sortBy);
                  const nextIndex = (currentIndex + 1) % sortOptions.length;
                  handleSort(sortOptions[nextIndex]);
                }}
              >
                {sortBy === "relevance" && "Relevance"}
                {sortBy === "newest" && "Newest"}
                {sortBy === "oldest" && "Oldest"}
                {sortBy === "price_low" && "Price: Low to High"}
                {sortBy === "price_high" && "Price: High to Low"}
                {sortBy === "rating" && "Highest Rating"}
              </Button>
            </div>
          </Box>
        </Box>

        <Stack className="result-count">
          <Typography>{filteredDoctors.length} doctors found</Typography>
          <Typography className="subtitle">
            Specialists available in New York, USA
          </Typography>
        </Stack>

        <Stack className="doctor-page">
          <Stack className="filter-config">
            <Filter />
          </Stack>
          <Stack className="main-config" mb={"76px"}>
            <Stack className="list-config">
              {currentDoctors.map((doctor, index) => {
                return <DoctorCard key={index} doctor={doctor} />;
              })}
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
                <Typography>
                  Total {filteredDoctors.length} doctors available
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
};

export default withLayoutMain(DoctorList);
