/** Malaysian festival dates for chart annotations */
export interface Festival {
  date: string; // YYYY-MM-DD
  en: string;
  zh: string;
  emoji: string;
}

// Key festivals that typically affect food prices
export const FESTIVALS: Festival[] = [
  // 2022
  { date: "2022-02-01", en: "CNY", zh: "新年", emoji: "🧧" },
  { date: "2022-05-02", en: "Hari Raya", zh: "开斋节", emoji: "🌙" },
  { date: "2022-07-10", en: "Raya Haji", zh: "哈芝节", emoji: "🐑" },
  { date: "2022-10-24", en: "Deepavali", zh: "屠妖节", emoji: "🪔" },

  // 2023
  { date: "2023-01-22", en: "CNY", zh: "新年", emoji: "🧧" },
  { date: "2023-04-22", en: "Hari Raya", zh: "开斋节", emoji: "🌙" },
  { date: "2023-06-29", en: "Raya Haji", zh: "哈芝节", emoji: "🐑" },
  { date: "2023-11-12", en: "Deepavali", zh: "屠妖节", emoji: "🪔" },

  // 2024
  { date: "2024-02-10", en: "CNY", zh: "新年", emoji: "🧧" },
  { date: "2024-04-10", en: "Hari Raya", zh: "开斋节", emoji: "🌙" },
  { date: "2024-06-17", en: "Raya Haji", zh: "哈芝节", emoji: "🐑" },
  { date: "2024-11-01", en: "Deepavali", zh: "屠妖节", emoji: "🪔" },

  // 2025
  { date: "2025-01-29", en: "CNY", zh: "新年", emoji: "🧧" },
  { date: "2025-03-31", en: "Hari Raya", zh: "开斋节", emoji: "🌙" },
  { date: "2025-06-07", en: "Raya Haji", zh: "哈芝节", emoji: "🐑" },
  { date: "2025-10-20", en: "Deepavali", zh: "屠妖节", emoji: "🪔" },

  // 2026
  { date: "2026-01-17", en: "CNY", zh: "新年", emoji: "🧧" },
  { date: "2026-03-20", en: "Hari Raya", zh: "开斋节", emoji: "🌙" },
  { date: "2026-05-27", en: "Raya Haji", zh: "哈芝节", emoji: "🐑" },
  { date: "2026-11-08", en: "Deepavali", zh: "屠妖节", emoji: "🪔" },
];

/**
 * Given chart data points, return festivals that fall within the data range
 * mapped to their nearest chart x-axis label.
 */
export function getFestivalsInRange(
  data: { dateRaw: string; date: string }[]
): { x: string; label: string; emoji: string }[] {
  if (data.length < 2) return [];

  const startRaw = data[0].dateRaw;
  const endRaw = data[data.length - 1].dateRaw;

  const results: { x: string; label: string; emoji: string }[] = [];

  for (const fest of FESTIVALS) {
    if (fest.date < startRaw || fest.date > endRaw) continue;

    // Find closest data point
    let closest = data[0];
    let closestDist = Infinity;
    for (const d of data) {
      const dist = Math.abs(
        new Date(d.dateRaw).getTime() - new Date(fest.date).getTime()
      );
      if (dist < closestDist) {
        closestDist = dist;
        closest = d;
      }
    }

    results.push({
      x: closest.date,
      label: fest.zh, // we'll pick lang in the component
      emoji: fest.emoji,
    });
  }

  return results;
}
