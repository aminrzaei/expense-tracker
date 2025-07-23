import {
  format,
  formatDistanceToNow,
  startOfDay,
  endOfDay,
  subDays,
  addDays,
} from "date-fns-jalali";

export const formatPersianDate = (
  date: Date | string,
  formatStr: string = "yyyy/MM/dd"
) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, formatStr);
};

export const formatPersianDateTime = (date: Date | string) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "yyyy/MM/dd - HH:mm");
};

export const formatPersianTime = (date: Date | string) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "HH:mm");
};

export const formatPersianRelativeTime = (date: Date | string) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return formatDistanceToNow(dateObj, { addSuffix: true });
};

export const formatPersianMonth = (date: Date | string) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "MMMM yyyy");
};

export const formatPersianDayMonth = (date: Date | string) => {
  const dateObj = typeof date === "string" ? new Date(date) : date;
  return format(dateObj, "dd MMMM");
};

export const getPersianToday = () => {
  return startOfDay(new Date());
};

export const getPersianTodayEnd = () => {
  return endOfDay(new Date());
};

export const getPersianYesterday = () => {
  return subDays(new Date(), 1);
};

export const getPersianTomorrow = () => {
  return addDays(new Date(), 1);
};

// Persian number conversion
export const toPersianNumbers = (str: string | number): string => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  return str
    .toString()
    .replace(/\d/g, (digit) => persianDigits[parseInt(digit)]);
};

export const toEnglishNumbers = (str: string): string => {
  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const englishDigits = ["0", "1", "2", "3", "4", "5", "6", "7", "8", "9"];

  let result = str;
  persianDigits.forEach((persian, index) => {
    result = result.replace(new RegExp(persian, "g"), englishDigits[index]);
  });
  return result;
};
