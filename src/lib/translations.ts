const translations = {
  // Page title
  pageTitle: {
    zh: "你的菜钱到底够不够用？",
    en: "Is Your Grocery Bill Lying to You?",
  },
  pageSubtitle: {
    zh: "追踪马来西亚食品真实价格 —— 扣除通胀后的购买力",
    en: "Track real food prices across Malaysia — adjusted for inflation",
  },

  // Items — Staples
  "item.basket": { zh: "综合菜篮", en: "Full Basket" },
  "item.chicken": { zh: "鸡肉", en: "Chicken" },
  "item.eggs": { zh: "鸡蛋", en: "Eggs" },
  "item.rice": { zh: "白米", en: "Rice" },
  "item.milk": { zh: "牛奶", en: "Milk" },
  "item.sugar": { zh: "白糖", en: "Sugar" },
  "item.cookingoil": { zh: "食用油", en: "Cooking Oil" },
  "item.flour": { zh: "面粉", en: "Flour" },
  "item.bread": { zh: "面包", en: "Bread" },
  "item.santan": { zh: "椰浆", en: "Coconut Milk" },

  // Items — Protein & Seafood
  "item.fish": { zh: "甘望鱼", en: "Mackerel" },
  "item.beef": { zh: "牛肉", en: "Beef" },
  "item.prawns": { zh: "虾", en: "Prawns" },

  // Items — Vegetables
  "item.tomato": { zh: "番茄", en: "Tomato" },
  "item.longbeans": { zh: "长豆", en: "Long Beans" },
  "item.kangkung": { zh: "空心菜", en: "Kangkung" },
  "item.onion": { zh: "洋葱", en: "Onion" },
  "item.chili": { zh: "辣椒", en: "Chili" },
  "item.cabbage": { zh: "包菜", en: "Cabbage" },
  "item.spinach": { zh: "菠菜", en: "Spinach" },
  "item.garlic": { zh: "蒜头", en: "Garlic" },
  "item.potato": { zh: "马铃薯", en: "Potato" },

  // Items — Fruits
  "item.papaya": { zh: "木瓜", en: "Papaya" },
  "item.banana": { zh: "香蕉", en: "Banana" },
  "item.watermelon": { zh: "西瓜", en: "Watermelon" },
  "item.lime": { zh: "酸柑", en: "Lime" },

  // Category labels
  "category.staples": { zh: "主食", en: "Staples" },
  "category.protein": { zh: "蛋白质 & 海鲜", en: "Protein & Seafood" },
  "category.vegetables": { zh: "蔬菜", en: "Vegetables" },
  "category.fruits": { zh: "水果", en: "Fruits" },

  // Periods
  "period.1y": { zh: "近一年", en: "1 Year" },
  "period.2y": { zh: "近两年", en: "2 Years" },
  "period.3y": { zh: "近三年", en: "3 Years" },
  "period.4y": { zh: "近四年", en: "4 Years" },
  "period.all": { zh: "全部", en: "All Time" },

  // Stats
  "stats.since.1y": { zh: "去年以来", en: "since last year" },
  "stats.since.2y": { zh: "两年以来", en: "since 2 years ago" },
  "stats.since.3y": { zh: "三年以来", en: "since 3 years ago" },
  "stats.since.4y": { zh: "四年以来", en: "since 4 years ago" },
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
  "data.priceSource": {
    zh: "价格数据来自",
    en: "Price data from",
  },
  "data.priceSourceName": {
    zh: "PriceCatcher",
    en: "PriceCatcher",
  },
  "data.priceSourceBy": {
    zh: "，由马来西亚国内贸易及生活成本部（KPDN）通过",
    en: ", published by Ministry of Domestic Trade and Cost of Living (KPDN) via",
  },
  "data.openDosm": {
    zh: "OpenDOSM",
    en: "OpenDOSM",
  },
  "data.priceSourceEnd": {
    zh: "开放数据平台发布。",
    en: " open data platform.",
  },
  "data.cpiSource": {
    zh: "消费者物价指数（CPI）数据来自",
    en: "Consumer Price Index (CPI) data from",
  },
  "data.cpiSourceName": {
    zh: "马来西亚统计局（DOSM）",
    en: "Department of Statistics Malaysia (DOSM)",
  },
  "data.disclaimer": {
    zh: "价格为 PriceCatcher 调查员在全国各零售店每日采集的实际价格平均值。部分商品在某些日期可能覆盖较少。",
    en: "Prices are daily national averages from actual retail prices collected by PriceCatcher surveyors across premises nationwide. Some items may have sparse coverage on certain dates.",
  },
  "data.methodology": {
    zh: "实际价格 = 名义价格 ÷ CPI × 100。反映扣除通胀后的真实购买力变化。",
    en: "Real Price = Nominal Price ÷ CPI × 100. Reflects purchasing power changes adjusted for inflation.",
  },

  // Navigation
  "nav.home": { zh: "首页", en: "Home" },
  "nav.about": { zh: "关于", en: "About" },

  // Footer
  "footer.builtBy": { zh: "开发者", en: "Built by" },
  "footer.dataBy": { zh: "数据", en: "Data" },

  // Current prices grid
  "grid.noData": { zh: "暂无价格数据", en: "No price data available" },
  "grid.vsYesterday": { zh: "较昨日", en: "vs yesterday" },

  // Basket methodology badge
  "basket.badge": {
    zh: "加权菜篮 · 14天滚动窗口 · 13品项全覆盖",
    en: "Weighted basket · 14-day rolling · All 13 items",
  },

  // Purchasing power analysis
  "analysis.title": {
    zh: "四年购买力变化",
    en: "4-Year Purchasing Power Shift",
  },
  "analysis.subtitle": {
    zh: "2022 Q1 至今的实际价格变化（扣除通胀）",
    en: "Real price changes since Q1 2022, adjusted for inflation",
  },
  "analysis.losersTitle": {
    zh: "购买力下降最多",
    en: "Biggest Purchasing Power Loss",
  },
  "analysis.stableTitle": {
    zh: "受补贴保护 / 价格稳定",
    en: "Subsidized / Price-Stable",
  },
  "analysis.footnote": {
    zh: "实际价格变化 = 名义价格变化 − 通胀率。负值表示购买力增加（价格涨幅低于通胀）。数据基于全国每日平均价格，每日自动更新。",
    en: "Real change = nominal change − inflation. Negative values mean purchasing power increased (price rose less than inflation). Based on national daily averages, updated daily.",
  },
} as const;

export type TranslationKey = keyof typeof translations;

export function t(key: TranslationKey, lang: "zh" | "en"): string {
  const val = translations[key]?.[lang];
  if (val === undefined) return key;
  if (typeof val === "string") return val;
  return key; // arrays are accessed directly, not via t()
}

// Helper to get array translations
export function tArray(key: TranslationKey, lang: "zh" | "en"): string[] {
  const val = translations[key]?.[lang];
  if (Array.isArray(val)) return val as string[];
  return [];
}

export default translations;
