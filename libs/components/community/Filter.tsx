import React from "react";
import { Button, Stack, Typography } from "@mui/material";

interface CommunityFilterProps {
  selectedCategory: string;
  onCategoryChange: (category: string) => void;
}

const CommunityFilter = ({
  selectedCategory,
  onCategoryChange,
}: CommunityFilterProps) => {
  const categories = ["All", "Free", "Recommend", "News", "Question"];

  return (
    <Stack className="filter-main">
      <Stack className="find-articles" mb={"20px"}>
        <Typography className="title-main">Filter by Category</Typography>
      </Stack>

      <Stack className="find-articles">
        <Typography className="title">Categories</Typography>
        <Stack className="category-list">
          {categories.map((category) => (
            <Button
              key={category}
              className={`category-btn ${
                selectedCategory === category ? "active" : ""
              }`}
              onClick={() => onCategoryChange(category)}
            >
              {category}
            </Button>
          ))}
        </Stack>
      </Stack>
    </Stack>
  );
};

export default CommunityFilter;
