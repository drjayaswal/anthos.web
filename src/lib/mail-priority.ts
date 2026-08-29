export const DEFAULT_MAIL_PRIORITY = "0.0000";

export function parseMailPriority(value: string | number | undefined | null): number {
  if (value == null || value === "") return 0;
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

export function formatMailPriorityDisplay(value: string | undefined | null): string {
  return value != null && value !== "" ? value : DEFAULT_MAIL_PRIORITY;
}
export const getPriorityColor = (pri: number) => {
  const val = Number(pri);

  if (val <= -0.75) return "bg-emerald-600";
  if (val <= -0.5) return "bg-green-500";
  if (val <= -0.25) return "bg-teal-400";
  if (val <= 0) return "bg-yellow-400";
  if (val <= 0.25) return "bg-amber-400";
  if (val <= 0.5) return "bg-orange-500";
  if (val <= 0.75) return "bg-red-500";
  return "bg-red-700";
};

export const getPriorityMessage = (pri: number) => {
  const val = Number(pri);

  if (val <= -0.75) return "Archive";
  if (val <= -0.5) return "Read Later";
  if (val <= -0.25) return "Routine";
  if (val <= 0) return "Normal";
  if (val <= 0.25) return "Needs Review";
  if (val <= 0.5) return "Important";
  if (val <= 0.75) return "High Priority";
  return "Urgent!";
};