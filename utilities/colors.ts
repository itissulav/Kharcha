// src/utils/colors.ts

export const getProgressColor = (progress: number): string => {
  if (progress > 1) {
    return "bg-red-500"; // Over budget
  }
  if (progress > 0.8) {
    return "bg-yellow-500"; // Warning
  }
  return "bg-green-500"; // On track
};
