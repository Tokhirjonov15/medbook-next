import React, { useState } from "react";
import { Box, Button, Pagination, Stack, Typography } from "@mui/material";
import { NextPage } from "next";
import { useRouter } from "next/router";
import CreateIcon from "@mui/icons-material/Create";
import CommunityFilter from "@/libs/components/community/Filter";
import CommunityCard from "@/libs/components/community/Communitycard";
import withLayoutDoctor from "@/libs/components/layout/LayoutDoctor";

const DoctorCommunityList: NextPage = () => {
  const router = useRouter();

  const [articles, setArticles] = useState<any[]>([
    {
      id: 1,
      title: "Top 10 Heart Health Tips for 2024",
      category: "Free",
      author: {
        name: "Dr. Sarah Jenkins",
        image: "/img/defaultUser.svg",
      },
      content:
        "Maintaining heart health is crucial for overall well-being. Here are some essential tips...",
      image: "/img/article.png",
      views: 1234,
      likes: 89,
      comments: 12,
      createdAt: "2024-02-08",
    },
    {
      id: 2,
      title: "Understanding COVID-19 Vaccines",
      category: "Recommend",
      author: {
        name: "Dr. Michael Chen",
        image: "/img/defaultUser.svg",
      },
      content:
        "Everything you need to know about COVID-19 vaccines and their importance...",
      image: "/img/article.png",
      views: 2456,
      likes: 234,
      comments: 45,
      createdAt: "2024-02-07",
    },
    {
      id: 3,
      title: "New Study: Exercise and Mental Health",
      category: "News",
      author: {
        name: "Dr. Emily Roberts",
        image: "/img/defaultUser.svg",
      },
      content:
        "Recent research shows strong connection between physical activity and mental wellness...",
      image: "/img/news.png",
      views: 3421,
      likes: 456,
      comments: 67,
      createdAt: "2024-02-06",
    },
    {
      id: 4,
      title: "How to manage diabetes effectively?",
      category: "Question",
      author: {
        name: "John Doe",
        image: "/img/defaultUser.svg",
      },
      content:
        "I was recently diagnosed with type 2 diabetes. What are the best practices for managing it?",
      image: "/img/news.png",
      views: 567,
      likes: 23,
      comments: 8,
      createdAt: "2024-02-05",
    },
    {
      id: 5,
      title: "Benefits of Mediterranean Diet",
      category: "Free",
      author: {
        name: "Dr. Sarah Jenkins",
        image: "/img/defaultUser.svg",
      },
      content:
        "Discover why the Mediterranean diet is considered one of the healthiest...",
      image: "/img/article.png",
      views: 890,
      likes: 67,
      comments: 15,
      createdAt: "2024-02-04",
    },
    {
      id: 6,
      title: "Sleep Hygiene: Expert Recommendations",
      category: "Recommend",
      author: {
        name: "Dr. James Wilson",
        image: "/img/defaultUser.svg",
      },
      content:
        "Quality sleep is essential for health. Here are expert-backed recommendations...",
      image: "/img/article.png",
      views: 1567,
      likes: 123,
      comments: 28,
      createdAt: "2024-02-03",
    },
    {
      id: 7,
      title: "Breaking: FDA Approves New Cancer Treatment",
      category: "News",
      author: {
        name: "Dr. Michael Chen",
        image: "/img/defaultUser.svg",
      },
      content:
        "The FDA has approved a groundbreaking new treatment for lung cancer...",
      image: "/img/news.png",
      views: 4321,
      likes: 567,
      comments: 89,
      createdAt: "2024-02-02",
    },
    {
      id: 8,
      title: "What causes frequent headaches?",
      category: "Question",
      author: {
        name: "Jane Smith",
        image: "/img/defaultUser.svg",
      },
      content:
        "I've been experiencing frequent headaches lately. Should I be concerned?",
      image: "/img/news.png",
      views: 432,
      likes: 12,
      comments: 5,
      createdAt: "2024-02-01",
    },
    {
      id: 9,
      title: "Mental Health in the Modern Workplace",
      category: "Free",
      author: {
        name: "Dr. Emily Roberts",
        image: "/img/defaultUser.svg",
      },
      content:
        "Addressing mental health challenges in today's work environment...",
      image: "/img/article.png",
      views: 2134,
      likes: 178,
      comments: 34,
      createdAt: "2024-01-31",
    },
    {
      id: 10,
      title: "Vitamin D: Are You Getting Enough?",
      category: "Recommend",
      author: {
        name: "Dr. Sarah Jenkins",
        image: "/img/defaultUser.svg",
      },
      content:
        "Learn about the importance of vitamin D and how to ensure adequate levels...",
      image: "/img/article.png",
      views: 1876,
      likes: 145,
      comments: 23,
      createdAt: "2024-01-30",
    },
  ]);

  const [selectedCategory, setSelectedCategory] = useState<string>("All");
  const [currentPage, setCurrentPage] = useState<number>(1);
  const itemsPerPage = 6;

  const filteredArticles = articles.filter((article) => {
    if (selectedCategory === "All") return true;
    return article.category === selectedCategory;
  });

  const sortedArticles = [...filteredArticles].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime(),
  );

  const totalPages = Math.ceil(sortedArticles.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentArticles = sortedArticles.slice(startIndex, endIndex);

  const handlePageChange = (
    event: React.ChangeEvent<unknown>,
    value: number,
  ) => {
    setCurrentPage(value);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleCategoryFilter = (category: string) => {
    setSelectedCategory(category);
    setCurrentPage(1);
  };

  const handleCreateArticle = () => {
    router.push("/community/create");
  };

  return (
    <div id="community-list-page" style={{ position: "relative" }}>
      <Stack className="container">
        <Stack className="result-count">
          <Typography>{sortedArticles.length} articles found</Typography>
          <Typography className="subtitle">
            Share your knowledge and connect with the community
          </Typography>
        </Stack>

        <Stack className="community-page">
          <Stack className="filter-config">
            <CommunityFilter
              selectedCategory={selectedCategory}
              onCategoryChange={handleCategoryFilter}
            />
          </Stack>
          <Stack className="main-config" mb={"76px"}>
            <Stack className="write-section">
              <Button
                variant="contained"
                startIcon={<CreateIcon />}
                onClick={handleCreateArticle}
                className="write-btn"
              >
                Write Article
              </Button>
            </Stack>

            <Stack className="list-config">
              {currentArticles.map((article, index) => {
                return <CommunityCard key={index} article={article} />;
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
                  Total {sortedArticles.length} articles available
                </Typography>
              </Stack>
            </Stack>
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
};

export default withLayoutDoctor(DoctorCommunityList);
