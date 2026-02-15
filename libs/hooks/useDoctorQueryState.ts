import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/router";
import { ConsultationType } from "@/libs/enums/consultation.enum";
import { Specialization } from "@/libs/enums/specialization.enum";
import { DoctorsInquiry } from "@/libs/types/members/member.input";

export const DEFAULT_FEE_RANGE = { min: 0, max: 500 };

const getSortConfig = (sortBy: string) => {
  if (sortBy === "newest")
    return { sort: "createdAt", direction: "DESC" as const };
  if (sortBy === "oldest")
    return { sort: "createdAt", direction: "ASC" as const };
  if (sortBy === "rating") return { sort: "rating", direction: "DESC" as const };
  return { sort: "doctorViews", direction: "DESC" as const };
};

const getSortByFromQuery = (sort?: string, direction?: string) => {
  if (sort === "createdAt" && direction === "DESC") return "newest";
  if (sort === "createdAt" && direction === "ASC") return "oldest";
  if (sort === "rating") return "rating";
  return "most_viewed";
};

/** LIFECYCLES **/
const parseDoctorsInputFromQuery = (
  rawInput: string | undefined,
  initialInput: DoctorsInquiry,
  rawSpecialization: string | undefined,
): DoctorsInquiry => {
  try {
    const parsed = rawInput ? JSON.parse(rawInput) : {};
    const parsedSearch = parsed?.search ?? {};

    const parsedSpecialization =
      parsedSearch?.specializationList &&
      Object.values(Specialization).includes(parsedSearch.specializationList)
        ? parsedSearch.specializationList
        : rawSpecialization &&
            Object.values(Specialization).includes(
              rawSpecialization as Specialization,
            )
          ? rawSpecialization
          : undefined;

    const parsedConsultationType =
      parsedSearch?.consultationTypeList &&
      Object.values(ConsultationType).includes(parsedSearch.consultationTypeList)
        ? parsedSearch.consultationTypeList
        : undefined;

    const parsedStart = Number(parsedSearch?.pricesRange?.start);
    const parsedEnd = Number(parsedSearch?.pricesRange?.end);
    const hasValidFeeRange =
      Number.isFinite(parsedStart) && Number.isFinite(parsedEnd);

    return {
      page: Number(parsed?.page) > 0 ? Number(parsed.page) : initialInput.page,
      limit: Number(parsed?.limit) > 0 ? Number(parsed.limit) : initialInput.limit,
      sort: typeof parsed?.sort === "string" ? parsed.sort : initialInput.sort,
      direction:
        parsed?.direction === "ASC" || parsed?.direction === "DESC"
          ? parsed.direction
          : initialInput.direction,
      search: {
        text: typeof parsedSearch?.text === "string" ? parsedSearch.text : undefined,
        location:
          typeof parsedSearch?.location === "string"
            ? parsedSearch.location
            : undefined,
        specializationList: parsedSpecialization,
        consultationTypeList: parsedConsultationType,
        pricesRange: hasValidFeeRange
          ? { start: parsedStart, end: parsedEnd }
          : undefined,
      },
    };
  } catch {
    return initialInput;
  }
};

export const useDoctorQueryState = (initialInput: DoctorsInquiry) => {
  const router = useRouter();
  const [searchText, setSearchText] = useState<string>("");
  const [sortBy, setSortBy] = useState<string>("most_viewed");
  const [currentPage, setCurrentPage] = useState<number>(initialInput.page);
  const [isHydratedFromQuery, setIsHydratedFromQuery] = useState<boolean>(false);
  const [locationText, setLocationText] = useState<string>("");
  const [selectedSpecializationFilter, setSelectedSpecializationFilter] =
    useState<Specialization | "">("");
  const [consultationTypeFilter, setConsultationTypeFilter] = useState<
    ConsultationType[]
  >([]);
  const [feeRange, setFeeRange] = useState<{ min: number; max: number }>(
    DEFAULT_FEE_RANGE,
  );
  const defaultInputString = useMemo(
    () => JSON.stringify(initialInput),
    [initialInput],
  );

  useEffect(() => {
    if (!router.isReady) return;

    const rawInput = Array.isArray(router.query.input)
      ? router.query.input[0]
      : router.query.input;
    const rawSpecialization = Array.isArray(router.query.specialization)
      ? router.query.specialization[0]
      : router.query.specialization;

    const parsedInput = parseDoctorsInputFromQuery(
      typeof rawInput === "string" ? rawInput : undefined,
      initialInput,
      typeof rawSpecialization === "string" ? rawSpecialization : undefined,
    );

    setCurrentPage(parsedInput.page);
    setSortBy(
      getSortByFromQuery(
        typeof parsedInput.sort === "string" ? parsedInput.sort : undefined,
        typeof parsedInput.direction === "string"
          ? parsedInput.direction
          : undefined,
      ),
    );
    setSearchText(parsedInput.search?.text ?? "");
    setLocationText(parsedInput.search?.location ?? "");
    setSelectedSpecializationFilter(parsedInput.search?.specializationList ?? "");
    setConsultationTypeFilter(
      parsedInput.search?.consultationTypeList
        ? [parsedInput.search.consultationTypeList]
        : [],
    );
    setFeeRange(
      parsedInput.search?.pricesRange
        ? {
            min: parsedInput.search.pricesRange.start,
            max: parsedInput.search.pricesRange.end,
          }
        : DEFAULT_FEE_RANGE,
    );
    setIsHydratedFromQuery(true);
  }, [
    router.isReady,
    router.query.input,
    router.query.specialization,
    initialInput,
  ]);

  const queryInput = useMemo<DoctorsInquiry>(() => {
    const sortConfig = getSortConfig(sortBy);
    const effectiveText = searchText.trim();
    const effectiveLocation = locationText.trim();
    const hasCustomFeeRange =
      feeRange.min !== DEFAULT_FEE_RANGE.min ||
      feeRange.max !== DEFAULT_FEE_RANGE.max;

    return {
      page: currentPage,
      limit: initialInput.limit,
      sort: sortConfig.sort,
      direction: sortConfig.direction,
      search: {
        text: effectiveText || undefined,
        location: effectiveLocation || undefined,
        specializationList: selectedSpecializationFilter || undefined,
        consultationTypeList: consultationTypeFilter.length
          ? consultationTypeFilter[0]
          : undefined,
        pricesRange: hasCustomFeeRange
          ? {
              start: feeRange.min,
              end: feeRange.max,
            }
          : undefined,
      },
    };
  }, [
    currentPage,
    sortBy,
    searchText,
    locationText,
    selectedSpecializationFilter,
    consultationTypeFilter,
    feeRange,
    initialInput.limit,
  ]);

  useEffect(() => {
    if (!router.isReady || !isHydratedFromQuery) return;

    const nextInput = JSON.stringify(queryInput);
    const currentInput = Array.isArray(router.query.input)
      ? router.query.input[0]
      : router.query.input;

    // Keep clean URL on first entry: add ?input only after user changes filters/state.
    if (!currentInput && nextInput === defaultInputString) return;
    if (currentInput === nextInput) return;

    const nextUrl = `/doctor?input=${nextInput}`;
    router.push(nextUrl, nextUrl, { scroll: false, shallow: true });
  }, [
    router,
    router.isReady,
    router.query.input,
    queryInput,
    isHydratedFromQuery,
    defaultInputString,
  ]);

  const handleSearch = (value: string) => {
    setSearchText(value);
    setCurrentPage(1);
  };

  const handleSort = (sortType: string) => {
    setSortBy(sortType);
    setCurrentPage(1);
  };

  const handleResetFilters = () => {
    setLocationText("");
    setSelectedSpecializationFilter("");
    setConsultationTypeFilter([]);
    setFeeRange(DEFAULT_FEE_RANGE);
    setCurrentPage(1);
  };

  return {
    queryInput,
    searchText,
    sortBy,
    currentPage,
    locationText,
    selectedSpecializationFilter,
    consultationTypeFilter,
    feeRange,
    setCurrentPage,
    setLocationText,
    setSelectedSpecializationFilter,
    setConsultationTypeFilter,
    setFeeRange,
    handleSearch,
    handleSort,
    handleResetFilters,
  };
};
