/**
 * Centralized number formatting utility for the clicker game
 * Formats large numbers with appropriate suffixes for readability
 */

// Number suffixes for large numbers
const SUFFIXES = [
  { value: 1e33, suffix: 'Dc' },   // Decillion
  { value: 1e30, suffix: 'No' },   // Nonillion
  { value: 1e27, suffix: 'Oc' },   // Octillion
  { value: 1e24, suffix: 'Sp' },   // Septillion
  { value: 1e21, suffix: 'Sx' },   // Sextillion
  { value: 1e18, suffix: 'Qi' },   // Quintillion
  { value: 1e15, suffix: 'Qa' },   // Quadrillion
  { value: 1e12, suffix: 'T' },    // Trillion
  { value: 1e9, suffix: 'B' },     // Billion
  { value: 1e6, suffix: 'M' },     // Million
  { value: 1e3, suffix: 'K' },     // Thousand
];

/**
 * Format a number with appropriate suffix for display
 * @param num - The number to format
 * @param decimals - Number of decimal places (default: 2)
 * @returns Formatted string like "24.86Qi" or "1,234"
 */
export const formatNumber = (num: number, decimals: number = 2): string => {
  // Handle negative numbers
  if (num < 0) {
    return '-' + formatNumber(-num, decimals);
  }
  
  // Handle very small numbers
  if (num === 0) return '0';
  
  // Find appropriate suffix
  for (const { value, suffix } of SUFFIXES) {
    if (num >= value) {
      const formatted = (num / value).toFixed(decimals);
      // Remove trailing zeros after decimal point
      const cleaned = formatted.replace(/\.?0+$/, '');
      return cleaned + suffix;
    }
  }
  
  // For numbers less than 1000
  if (num < 10 && num % 1 !== 0) {
    return num.toFixed(decimals);
  }
  
  return Math.floor(num).toLocaleString();
};

/**
 * Format a number with 1 decimal place (for compact display)
 */
export const formatNumberCompact = (num: number): string => {
  return formatNumber(num, 1);
};

/**
 * Format a number for display in stats (2 decimal places)
 */
export const formatNumberStats = (num: number): string => {
  return formatNumber(num, 2);
};

/**
 * Format time in seconds to readable string
 * @param seconds - Time in seconds
 * @returns Formatted string like "1h 30m" or "45s"
 */
export const formatTime = (seconds: number): string => {
  if (seconds < 0) return '0s';
  
  seconds = Math.floor(seconds);
  
  if (seconds < 60) return `${seconds}s`;
  
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  
  if (minutes < 60) {
    return remainingSeconds > 0 ? `${minutes}m ${remainingSeconds}s` : `${minutes}m`;
  }
  
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  
  if (hours < 24) {
    return remainingMinutes > 0 ? `${hours}h ${remainingMinutes}m` : `${hours}h`;
  }
  
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
};

/**
 * Format time for compact display (like timers)
 */
export const formatTimeCompact = (seconds: number): string => {
  if (seconds < 0) return '0:00';
  
  seconds = Math.floor(seconds);
  
  if (seconds >= 3600) {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    return `${h}h${m}m`;
  }
  
  if (seconds >= 60) {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
  }
  
  return `0:${seconds.toString().padStart(2, '0')}`;
};