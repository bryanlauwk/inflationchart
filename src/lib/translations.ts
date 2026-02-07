const translations = {
  // Page title
  pageTitle: {
    zh: "马来西亚食品价格 —— 实际购买力",
    en: "Malaysian Food Prices — Real Purchasing Power",
  },

  // Items
  "item.basket": { zh: "综合菜篮", en: "Full Basket" },
  "item.chicken": { zh: "鸡肉", en: "Chicken" },
  "item.eggs": { zh: "鸡蛋", en: "Eggs" },
  "item.tomato": { zh: "番茄", en: "Tomato" },
  "item.longbeans": { zh: "长豆", en: "Long Beans" },
  "item.rice": { zh: "白米", en: "Rice" },
  "item.milk": { zh: "牛奶", en: "Milk" },
  "item.kangkung": { zh: "空心菜", en: "Kangkung" },
  "item.onion": { zh: "洋葱", en: "Onion" },
  "item.sugar": { zh: "白糖", en: "Sugar" },
  "item.cookingoil": { zh: "食用油", en: "Cooking Oil" },

  // Periods
  "period.1y": { zh: "近一年", en: "1 Year" },
  "period.2y": { zh: "近两年", en: "2 Years" },
  "period.all": { zh: "全部", en: "All Time" },

  // Stats
  "stats.since.1y": { zh: "去年以来", en: "since last year" },
  "stats.since.2y": { zh: "两年以来", en: "since 2 years ago" },
  "stats.since.all": { zh: "自起始以来", en: "since the start" },
  "stats.currentPrice": { zh: "当前价格", en: "Current price" },
  "stats.priceChanged": {
    zh: "食品价格变动",
    en: "Food prices changed",
  },

  // Chart legend
  "chart.nominal": { zh: "名义价格 (RM)", en: "Nominal (RM)" },
  "chart.cpi": { zh: "消费者物价指数", en: "CPI Index" },
  "chart.real": { zh: "实际价格", en: "Real Price" },
  "chart.loading": { zh: "正在加载图表数据……", en: "Loading chart data..." },
  "chart.noData": {
    zh: "暂无数据。请运行数据回填功能以填充历史价格。",
    en: "No data available. Run the backfill to populate historical prices.",
  },

  // Sidebar headings
  "sidebar.chartExplain": { zh: "图表说明", en: "What This Chart Shows" },
  "sidebar.dataSources": { zh: "数据来源", en: "Data Sources" },
  "sidebar.currentPrices": { zh: "今日价格", en: "Today's Prices" },

  // Legend descriptions
  "legend.green": {
    zh: "你在市场上实际支付的价格",
    en: "What you actually pay at the market",
  },
  "legend.blue": {
    zh: "官方消费者物价指数",
    en: "Official government inflation (CPI index)",
  },
  "legend.red": {
    zh: "实际购买力 —— 你的钱真正的价值",
    en: "Real purchasing power — what your money is actually worth",
  },
  "legend.greenLabel": { zh: "名义价格", en: "Nominal" },
  "legend.blueLabel": { zh: "CPI 指数", en: "CPI" },
  "legend.redLabel": { zh: "实际价格", en: "Real" },

  // Sidebar explanation
  "sidebar.explanation": {
    zh: "当红线上升速度快于蓝线时，食品的实际价格正在上涨——你的令吉买到的食物比官方通胀数据显示的更少。",
    en: "When the red line rises faster than blue, food is getting more expensive in real terms — your ringgit buys less food than official inflation suggests.",
  },

  // Data sources
  "data.source": {
    zh: "价格数据来自 OpenDOSM PriceCatcher（马来西亚国内贸易部）。CPI 数据来自马来西亚统计局。",
    en: "Prices from OpenDOSM PriceCatcher (Ministry of Domestic Trade). CPI from Department of Statistics Malaysia.",
  },
  "data.disclaimer": {
    zh: "价格为全国各店铺每日平均值。部分商品在某些日期可能无数据。",
    en: "Prices are daily national averages across all premises. Some items may have sparse coverage on certain dates.",
  },

  // Footer
  "footer.builtBy": { zh: "开发者", en: "Built by" },
  "footer.inspiredBy": { zh: "灵感来自", en: "Inspired by" },

  // Current prices grid
  "grid.noData": { zh: "暂无价格数据", en: "No price data available" },
  "grid.vsYesterday": { zh: "较昨日", en: "vs yesterday" },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: "zh" | "en"): string {
  return translations[key]?.[lang] ?? key;
}

export default translations;
