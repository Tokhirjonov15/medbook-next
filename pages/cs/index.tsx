import React, { useState } from "react";
import { NextPage } from "next";
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
import withLayoutMain from "@/libs/components/layout/LayoutMember";

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

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleAccordionChange =
    (panel: string) => (event: React.SyntheticEvent, isExpanded: boolean) => {
      setExpanded(isExpanded ? panel : false);
    };

  const faqs = [
    {
      id: "faq1",
      question: "How do I book an appointment with a doctor?",
      answer:
        "To book an appointment, navigate to the 'Find Doctors' page, search for your preferred doctor, and click on their profile. Then click the 'Book Appointment' button and follow the instructions to select your preferred date and time.",
    },
    {
      id: "faq2",
      question: "What payment methods do you accept?",
      answer:
        "We accept various payment methods including credit cards (Visa, Mastercard, American Express), debit cards, and online payment platforms like PayPal. All payments are processed securely through our encrypted payment gateway.",
    },
    {
      id: "faq3",
      question: "Can I cancel or reschedule my appointment?",
      answer:
        "Yes, you can cancel or reschedule your appointment up to 24 hours before the scheduled time. To do so, go to 'My Appointments' in your profile, select the appointment you wish to modify, and choose either 'Cancel' or 'Reschedule'. Please note that cancellations made less than 24 hours before the appointment may incur a cancellation fee.",
    },
    {
      id: "faq4",
      question: "How does video consultation work?",
      answer:
        "Video consultations allow you to consult with doctors remotely. After booking a video consultation, you'll receive a link to join the video call at your scheduled time. Make sure you have a stable internet connection and a device with a camera and microphone. The consultation will be conducted through our secure video platform.",
    },
    {
      id: "faq5",
      question: "Is my personal and medical information secure?",
      answer:
        "Absolutely. We take data security very seriously. All your personal and medical information is encrypted and stored securely in compliance with HIPAA regulations and data protection laws. We never share your information with third parties without your explicit consent.",
    },
    {
      id: "faq6",
      question: "How do I update my profile information?",
      answer:
        "To update your profile information, log in to your account and go to 'My Page'. Click on 'Edit Profile' and you can update your personal details, contact information, and medical history. Don't forget to save your changes before leaving the page.",
    },
    {
      id: "faq7",
      question: "What should I do if I have a medical emergency?",
      answer:
        "If you're experiencing a medical emergency, please call your local emergency services immediately (911 in the US, 112 in Europe, etc.). Our platform is designed for non-emergency consultations and scheduled appointments. For urgent but non-emergency medical concerns, you can use the 'Urgent Care' filter to find doctors with same-day availability.",
    },
    {
      id: "faq8",
      question: "Can I get a prescription through online consultation?",
      answer:
        "Yes, licensed doctors on our platform can prescribe medication during online consultations if they determine it's medically appropriate. The prescription will be sent electronically to your preferred pharmacy. However, certain controlled substances may require an in-person visit.",
    },
    {
      id: "faq9",
      question: "How do I write a review for a doctor?",
      answer:
        "After your appointment is completed, you'll receive a notification to leave a review. You can also go to the doctor's profile and click on the 'Reviews' tab, then click 'Write a Review'. Your feedback helps other patients make informed decisions and helps doctors improve their services.",
    },
    {
      id: "faq10",
      question: "What if I need to contact customer support?",
      answer:
        "You can contact our customer support team through the 'Contact Us' page. We offer support via email, phone, and live chat. Our team is available Monday to Friday, 9 AM to 6 PM EST. For urgent matters, please use the live chat feature for the fastest response.",
    },
  ];

  return (
    <div id="customer-service-page">
      <Stack className="cs-container">
        <Stack className="cs-header">
          <Typography className="page-title">Customer Service</Typography>
          <Typography className="page-subtitle">
            Find answers to common questions and learn about our terms
          </Typography>
        </Stack>

        <Stack className="cs-content">
          {/* Tabs */}
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
                icon={<DescriptionIcon />}
                iconPosition="start"
                label="Terms & Conditions"
                className="tab-item"
              />
            </Tabs>
          </Box>

          {/* Tab Content */}
          <Stack className="tab-content">
            {/* FAQ Tab */}
            <TabPanel value={tabValue} index={0}>
              <Stack className="faq-content">
                <Typography className="section-intro">
                  Browse through our frequently asked questions to find quick
                  answers to common queries. If you can't find what you're
                  looking for, please contact our support team.
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

            {/* Terms & Conditions Tab */}
            <TabPanel value={tabValue} index={1}>
              <Stack className="terms-content">
                <Typography className="terms-title">
                  Terms and Conditions
                </Typography>
                <Typography className="terms-date">
                  Last Updated: February 10, 2026
                </Typography>

                <Stack className="terms-section">
                  <Typography className="section-title">
                    1. Acceptance of Terms
                  </Typography>
                  <Typography className="section-text">
                    By accessing and using MedBook's services, you accept and
                    agree to be bound by the terms and provision of this
                    agreement. If you do not agree to abide by the above, please
                    do not use this service.
                  </Typography>
                </Stack>

                <Stack className="terms-section">
                  <Typography className="section-title">
                    2. Use License
                  </Typography>
                  <Typography className="section-text">
                    Permission is granted to temporarily access the materials
                    (information or software) on MedBook's platform for
                    personal, non-commercial transitory viewing only. This is
                    the grant of a license, not a transfer of title, and under
                    this license you may not:
                  </Typography>
                  <ul className="terms-list">
                    <li>Modify or copy the materials</li>
                    <li>
                      Use the materials for any commercial purpose, or for any
                      public display (commercial or non-commercial)
                    </li>
                    <li>
                      Attempt to decompile or reverse engineer any software
                      contained on MedBook's platform
                    </li>
                    <li>
                      Remove any copyright or other proprietary notations from
                      the materials
                    </li>
                    <li>
                      Transfer the materials to another person or "mirror" the
                      materials on any other server
                    </li>
                  </ul>
                </Stack>

                <Stack className="terms-section">
                  <Typography className="section-title">
                    3. Medical Disclaimer
                  </Typography>
                  <Typography className="section-text">
                    MedBook is a platform connecting patients with healthcare
                    professionals. We do not provide medical advice, diagnosis,
                    or treatment. All medical information and consultations
                    provided through our platform are delivered by licensed
                    healthcare professionals who are solely responsible for
                    their medical opinions and advice.
                  </Typography>
                  <Typography className="section-text">
                    The information provided on MedBook is for informational
                    purposes only and is not intended to replace a one-on-one
                    relationship with a qualified health care professional or
                    licensed physician and is not medical advice.
                  </Typography>
                </Stack>

                <Stack className="terms-section">
                  <Typography className="section-title">
                    4. User Accounts
                  </Typography>
                  <Typography className="section-text">
                    When you create an account with us, you must provide
                    information that is accurate, complete, and current at all
                    times. Failure to do so constitutes a breach of the Terms,
                    which may result in immediate termination of your account on
                    our Service.
                  </Typography>
                  <Typography className="section-text">
                    You are responsible for safeguarding the password that you
                    use to access the Service and for any activities or actions
                    under your password. You agree not to disclose your password
                    to any third party.
                  </Typography>
                </Stack>

                <Stack className="terms-section">
                  <Typography className="section-title">
                    5. Privacy Policy
                  </Typography>
                  <Typography className="section-text">
                    Your privacy is important to us. Our Privacy Policy explains
                    how we collect, use, and protect your personal information.
                    By using MedBook, you agree to the collection and use of
                    information in accordance with our Privacy Policy.
                  </Typography>
                  <Typography className="section-text">
                    We are committed to protecting your personal and medical
                    information in compliance with HIPAA regulations and
                    applicable data protection laws.
                  </Typography>
                </Stack>

                <Stack className="terms-section">
                  <Typography className="section-title">
                    6. Payment Terms
                  </Typography>
                  <Typography className="section-text">
                    All fees for services are quoted in USD and are subject to
                    change. Payment is required at the time of booking unless
                    otherwise specified. Cancellations made less than 24 hours
                    before the scheduled appointment may be subject to a
                    cancellation fee.
                  </Typography>
                  <Typography className="section-text">
                    Refunds, if applicable, will be processed within 5-10
                    business days to the original payment method.
                  </Typography>
                </Stack>

                <Stack className="terms-section">
                  <Typography className="section-title">
                    7. Intellectual Property
                  </Typography>
                  <Typography className="section-text">
                    The Service and its original content, features, and
                    functionality are and will remain the exclusive property of
                    MedBook and its licensors. The Service is protected by
                    copyright, trademark, and other laws of both the United
                    States and foreign countries.
                  </Typography>
                </Stack>

                <Stack className="terms-section">
                  <Typography className="section-title">
                    8. Limitation of Liability
                  </Typography>
                  <Typography className="section-text">
                    In no event shall MedBook, nor its directors, employees,
                    partners, agents, suppliers, or affiliates, be liable for
                    any indirect, incidental, special, consequential or punitive
                    damages, including without limitation, loss of profits,
                    data, use, goodwill, or other intangible losses, resulting
                    from your access to or use of or inability to access or use
                    the Service.
                  </Typography>
                </Stack>

                <Stack className="terms-section">
                  <Typography className="section-title">
                    9. Governing Law
                  </Typography>
                  <Typography className="section-text">
                    These Terms shall be governed and construed in accordance
                    with the laws of the United States, without regard to its
                    conflict of law provisions. Our failure to enforce any right
                    or provision of these Terms will not be considered a waiver
                    of those rights.
                  </Typography>
                </Stack>

                <Stack className="terms-section">
                  <Typography className="section-title">
                    10. Changes to Terms
                  </Typography>
                  <Typography className="section-text">
                    We reserve the right, at our sole discretion, to modify or
                    replace these Terms at any time. If a revision is material,
                    we will try to provide at least 30 days' notice prior to any
                    new terms taking effect. What constitutes a material change
                    will be determined at our sole discretion.
                  </Typography>
                  <Typography className="section-text">
                    By continuing to access or use our Service after those
                    revisions become effective, you agree to be bound by the
                    revised terms.
                  </Typography>
                </Stack>

                <Stack className="terms-section">
                  <Typography className="section-title">
                    11. Contact Us
                  </Typography>
                  <Typography className="section-text">
                    If you have any questions about these Terms, please contact
                    us at:
                  </Typography>
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
