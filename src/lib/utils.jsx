import { clsx } from 'clsx';
import { intervalToDuration } from 'date-fns';
import { twMerge } from 'tailwind-merge';
export function cn(...inputs) {
  return twMerge(clsx(inputs));
}

export const formatSecondsToHMS = (secondsInput) => {
  if (typeof secondsInput !== 'number' || secondsInput < 0) return '0s';

  const duration = intervalToDuration({
    start: 0,
    end: secondsInput * 1000, // 👈 convert seconds to ms
  });

  const { hours = 0, minutes = 0, seconds = 0 } = duration;

  const parts = [];
  if (hours) parts.push(`${hours}h`);
  if (minutes) parts.push(`${minutes}m`);
  if (seconds || parts.length === 0) parts.push(`${seconds}s`);

  return parts.join(' ');
};


// Function to strip HTML tags
const stripHtml = (html) => {
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = html;
  return tempDiv.textContent || tempDiv.innerText || "";
};

export const TruncatedText = ({ content, maxLength = 100 }) => {
  const plainText = stripHtml(content);
  const displayText = plainText.length > maxLength 
    ? plainText.substring(0, maxLength) + "..." 
    : plainText;

  return <p>{displayText}</p>;
};