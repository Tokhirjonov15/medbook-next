import React, { useMemo, useState } from "react";
import { Box, OutlinedInput, Pagination, Typography } from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import withLayoutDoctor from "@/libs/components/layout/LayoutDoctor";
import PatientCard, { PatientCardData } from "@/libs/components/_doctorsHome/PatientCard";

const mockPatients: PatientCardData[] = [
  { id: 1, name: "Sarah Jenkins", followers: 120, followings: 42, likes: 310, createdAt: "2026-02-12T09:30:00Z" },
  { id: 2, name: "Michael Chen", followers: 88, followings: 21, likes: 204, createdAt: "2026-02-11T08:10:00Z" },
  { id: 3, name: "Emily Davis", followers: 64, followings: 35, likes: 150, createdAt: "2026-02-10T14:00:00Z" },
  { id: 4, name: "David Wilson", followers: 176, followings: 70, likes: 420, createdAt: "2026-02-09T12:45:00Z" },
  { id: 5, name: "Jessica Garcia", followers: 92, followings: 49, likes: 231, createdAt: "2026-02-08T10:20:00Z" },
  { id: 6, name: "Robert Miller", followers: 73, followings: 33, likes: 178, createdAt: "2026-02-07T16:15:00Z" },
  { id: 7, name: "Olivia Brown", followers: 134, followings: 58, likes: 356, createdAt: "2026-02-06T09:10:00Z" },
  { id: 8, name: "Daniel Kim", followers: 101, followings: 28, likes: 262, createdAt: "2026-02-05T11:40:00Z" },
  { id: 9, name: "Nora White", followers: 59, followings: 22, likes: 145, createdAt: "2026-02-04T13:30:00Z" },
  { id: 10, name: "Anthony Young", followers: 149, followings: 64, likes: 389, createdAt: "2026-02-03T15:10:00Z" },
  { id: 11, name: "Hannah Lee", followers: 111, followings: 44, likes: 280, createdAt: "2026-02-02T10:05:00Z" },
  { id: 12, name: "James Anderson", followers: 96, followings: 39, likes: 241, createdAt: "2026-02-01T09:25:00Z" },
  { id: 13, name: "Grace Thompson", followers: 127, followings: 53, likes: 334, createdAt: "2026-01-31T12:20:00Z" },
  { id: 14, name: "Christopher Hall", followers: 167, followings: 72, likes: 441, createdAt: "2026-01-30T08:55:00Z" },
  { id: 15, name: "Sofia Martinez", followers: 84, followings: 36, likes: 201, createdAt: "2026-01-29T14:35:00Z" },
  { id: 16, name: "Ethan Clark", followers: 112, followings: 47, likes: 294, createdAt: "2026-01-28T16:45:00Z" },
  { id: 17, name: "Mia Rodriguez", followers: 98, followings: 41, likes: 246, createdAt: "2026-01-27T10:50:00Z" },
  { id: 18, name: "Lucas Perez", followers: 141, followings: 66, likes: 372, createdAt: "2026-01-26T11:15:00Z" },
];

const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const DoctorPatients: NextPage = () => {
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>("");
  const [sortBy, setSortBy] = useState<"newest" | "latest">("newest");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 8;

  const filteredPatients = useMemo(() => {
    const search = searchText.trim();
    let result = [...mockPatients];

    if (search) {
      const regex = new RegExp(escapeRegex(search), "i");
      result = result.filter((patient) => regex.test(patient.name));
    }

    result.sort((a, b) => {
      const first = new Date(a.createdAt).getTime();
      const second = new Date(b.createdAt).getTime();
      return sortBy === "newest" ? second - first : first - second;
    });

    return result;
  }, [searchText, sortBy]);

  const totalPages = Math.ceil(filteredPatients.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const visiblePatients = filteredPatients.slice(startIndex, endIndex);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleSort = (value: "newest" | "latest") => {
    setSortBy(value);
    setCurrentPage(1);
  };

  return (
    <Box className="doctor-patients">
      <Box className="doctor-patients__header">
        <Typography variant="h4" className="doctor-patients__title">
          My Patients
        </Typography>
        <Typography className="doctor-patients__subtitle">
          Total {filteredPatients.length} patients
        </Typography>
      </Box>

      <Box className="doctor-patients__controls">
        <OutlinedInput
          className="doctor-patients__search"
          placeholder="Search by patient name..."
          value={searchText}
          onChange={(event) => handleSearch(event.target.value)}
        />
        <select
          className="doctor-patients__sort"
          value={sortBy}
          onChange={(event) => handleSort(event.target.value as "newest" | "latest")}
        >
          <option value="newest">Newest (createdAt)</option>
          <option value="latest">Latest (createdAt)</option>
        </select>
      </Box>

      <Box className="doctor-patients__list-wrap">
        <Box className="doctor-patients__list">
          {visiblePatients.map((patient) => (
            <PatientCard
              key={patient.id}
              patient={patient}
              onNameClick={(id) => router.push(`/_doctor/patients/detail?id=${id}`)}
            />
          ))}
        </Box>

        <Box className="doctor-patients__footer">
          <Typography className="doctor-patients__result-text">
            Showing {filteredPatients.length === 0 ? 0 : startIndex + 1} to{" "}
            {Math.min(endIndex, filteredPatients.length)} of {filteredPatients.length} results
          </Typography>
          <Pagination
            page={currentPage}
            count={Math.max(totalPages, 1)}
            onChange={(_, page) => setCurrentPage(page)}
            shape="rounded"
            className="doctor-patients__pagination"
          />
        </Box>
      </Box>
    </Box>
  );
};

export default withLayoutDoctor(DoctorPatients);
