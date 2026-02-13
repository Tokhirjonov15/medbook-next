export type CsPostType = "FAQ" | "NOTICE";

export interface CsPost {
  id: string;
  type: CsPostType;
  title: string;
  content: string;
  createdAt: string;
}

export const CS_POSTS_STORAGE_KEY = "medbook_cs_posts";

export const defaultFaqs = [
  {
    id: "faq1",
    question: "How do I book an appointment with a doctor?",
    answer:
      "Go to Find Doctors, open a doctor profile, and click Book Appointment to choose date and time.",
  },
  {
    id: "faq2",
    question: "What payment methods do you accept?",
    answer:
      "We support major cards and online payment methods. Payments are processed through secure checkout.",
  },
  {
    id: "faq3",
    question: "Can I cancel or reschedule an appointment?",
    answer:
      "Yes. You can manage appointments from My Appointments before the appointment time.",
  },
];

export const defaultNotices = [
  {
    id: "notice1",
    title: "System maintenance",
    content: "Scheduled maintenance every Sunday 02:00 - 03:00 AM UTC.",
    createdAt: "2026-02-10T10:00:00.000Z",
  },
];

export const getStoredCsPosts = (): CsPost[] => {
  if (typeof window === "undefined") return [];
  try {
    const raw = window.localStorage.getItem(CS_POSTS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw) as CsPost[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

export const setStoredCsPosts = (posts: CsPost[]) => {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(CS_POSTS_STORAGE_KEY, JSON.stringify(posts));
};
