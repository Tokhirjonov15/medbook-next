import { useRouter } from "next/router";
import { getMemberText, resolveLocale } from "@/libs/i18n/member";

const useMemberTranslation = () => {
  const router = useRouter();
  const locale = resolveLocale(router.locale);

  const t = (key: string, fallback?: string): string => getMemberText(locale, key, fallback);

  return { t, locale };
};

export default useMemberTranslation;
