import React, { useEffect, useMemo, useState } from "react";
import { NextPage } from "next";
import { useQuery } from "@apollo/client";
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Stack,
  Tab,
  Tabs,
  Typography,
} from "@mui/material";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import HelpOutlineIcon from "@mui/icons-material/HelpOutline";
import DescriptionIcon from "@mui/icons-material/Description";
import CampaignIcon from "@mui/icons-material/Campaign";
import withLayoutMain from "@/libs/components/layout/LayoutMember";
import { GET_NOTICES } from "@/apollo/user/query";
import {
  defaultFaqs,
  getStoredCsPosts,
} from "@/libs/configs/csContent";

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`cs-tabpanel-${index}`}
      aria-labelledby={`cs-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ pt: 3 }}>{children}</Box>}
    </div>
  );
}

const CustomerService: NextPage = () => {
  const [tabValue, setTabValue] = useState(0);
  const [expanded, setExpanded] = useState<string | false>("faq1");
  const [refreshTick, setRefreshTick] = useState(0);
  const noticeQueryInput = useMemo(
    () => ({
      page: 1,
      limit: 100,
      sort: "createdAt",
      direction: "DESC",
      search: {},
    }),
    [],
  );

  const { data: noticesData, loading: noticesLoading } = useQuery(GET_NOTICES, {
    fetchPolicy: "cache-and-network",
    variables: { input: noticeQueryInput },
    notifyOnNetworkStatusChange: true,
  });

  useEffect(() => {
    const onFocus = () => setRefreshTick((prev) => prev + 1);
    window.addEventListener("focus", onFocus);
    return () => window.removeEventListener("focus", onFocus);
  }, []);

  const posts = useMemo(() => getStoredCsPosts(), [refreshTick]);

  const faqs = useMemo(() => {
    const customFaqs = posts
      .filter((item) => item.type === "FAQ")
      .map((item) => ({
        id: item.id,
        question: item.title,
        answer: item.content,
      }));
    return [...defaultFaqs, ...customFaqs];
  }, [posts]);

  const notices = useMemo(() => {
    const dbNotices = (noticesData?.getNotices?.list ?? [])
      .filter((item: any) => item?.target === "ALL" || item?.target === "PATIENT")
      .map((item: any) => ({
        id: item?._id,
        title: item?.title,
        content: item?.content,
        createdAt: item?.createdAt,
      }));
    const customNotices = posts.filter((item) => item.type === "NOTICE")
      .map((item) => ({
        id: item.id,
        title: item.title,
        content: item.content,
        createdAt: item.createdAt,
      }));
    return [...dbNotices, ...customNotices];
  }, [noticesData, posts]);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  return (
    <div id="customer-service-page">
      <Stack className="cs-container">
        <Stack className="cs-header">
          <Typography className="page-title">Customer Service</Typography>
          <Typography className="page-subtitle">
            Find answers, platform notices, and terms.
          </Typography>
        </Stack>

        <Stack className="cs-content">
          <Box className="tabs-section">
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              className="cs-tabs"
              TabIndicatorProps={{ className: "tab-indicator" }}
            >
              <Tab
                icon={<HelpOutlineIcon />}
                iconPosition="start"
                label="FAQ"
                className="tab-item"
              />
              <Tab
                icon={<CampaignIcon />}
                iconPosition="start"
                label="Notices"
                className="tab-item"
              />
              <Tab
                icon={<DescriptionIcon />}
                iconPosition="start"
                label="Terms & Conditions"
                className="tab-item"
              />
            </Tabs>
          </Box>

          <Stack className="tab-content">
            <TabPanel value={tabValue} index={0}>
              <Stack className="faq-content">
                <Typography className="section-intro">
                  Admin-added FAQ entries will also appear here automatically.
                </Typography>

                <Stack className="faq-list">
                  {faqs.map((faq) => (
                    <Accordion
                      key={faq.id}
                      expanded={expanded === faq.id}
                      onChange={handleAccordionChange(faq.id)}
                      className="faq-accordion"
                    >
                      <AccordionSummary
                        expandIcon={<ExpandMoreIcon />}
                        className="faq-summary"
                      >
                        <Typography className="faq-question">
                          {faq.question}
                        </Typography>
                      </AccordionSummary>
                      <AccordionDetails className="faq-details">
                        <Typography className="faq-answer">
                          {faq.answer}
                        </Typography>
                      </AccordionDetails>
                    </Accordion>
                  ))}
                </Stack>
              </Stack>
            </TabPanel>

            <TabPanel value={tabValue} index={1}>
              <Stack className="terms-content">
                <Typography className="terms-title">
                  Platform Notices
                </Typography>
                <Stack className="terms-section">
                  {noticesLoading && notices.length === 0 && (
                    <Typography className="section-text">Loading notices...</Typography>
                  )}
                  {notices.map((notice) => (
                    <Stack key={notice.id} className="terms-section">
                      <Typography className="section-title">
                        {notice.title}
                      </Typography>
                      <Typography className="section-text">
                        {notice.content}
                      </Typography>
                      <Typography className="terms-date">
                        {new Date(notice.createdAt).toLocaleString()}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Stack>
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <Stack className="terms-content">
                <Typography className="terms-title">
                  Terms and Conditions
                </Typography>
                <Typography className="terms-date">
                  Last Updated: February 13, 2026
                </Typography>

                <Stack className="terms-section">
                  <Typography className="section-title">
                    1. Acceptance of Terms
                  </Typography>
                  <Typography className="section-text">
                    By using MedBook you agree to platform terms, privacy
                    policy, and usage guidelines.
                  </Typography>
                </Stack>

                <Stack className="terms-section">
                  <Typography className="section-title">
                    2. Medical Disclaimer
                  </Typography>
                  <Typography className="section-text">
                    MedBook is a communication platform. Diagnosis and treatment
                    responsibility belongs to licensed professionals.
                  </Typography>
                </Stack>

                <Stack className="terms-section">
                  <Typography className="section-title">3. Contact</Typography>
                  <ul className="terms-list">
                    <li>Email: support@medbook.com</li>
                    <li>Email: mntokhirjonov@gmail.com</li>
                    <li>Phone: +8210 2076 7640</li>
                  </ul>
                </Stack>
              </Stack>
            </TabPanel>
          </Stack>
        </Stack>
      </Stack>
    </div>
  );
};

export default withLayoutMain(CustomerService);
