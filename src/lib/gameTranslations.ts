/**
 * Copy for the grocery time machine. Kept separate from the legacy chart copy
 * in translations.ts so the two can evolve independently.
 */

export type Lang = "en" | "zh";

const copy = {
  "nav.brand": { en: "RM100", zh: "RM100" },
  "nav.how": { en: "How it works", zh: "玩法说明" },
  "nav.langLabel": { en: "Switch to Chinese", zh: "切换到英文" },

  "hero.title": { en: "What happened to your RM100?", zh: "你的 RM100 去哪了？" },
  "hero.sub": {
    en: "Same groceries. A different year. Let's see what changed.",
    zh: "一样的杂货，不一样的年份。看看变了什么。",
  },
  "hero.tryPreset": { en: "Try a ready-made basket", zh: "试试现成的菜篮" },
  "hero.build": { en: "Build my basket", zh: "自己配菜篮" },
  "hero.imageAlt": {
    en: "Illustration of a Malaysian neighbourhood kedai runcit with shelves of groceries",
    zh: "马来西亚邻里杂货店（kedai runcit）插画，货架上摆满杂货",
  },
  "hero.dataNote": {
    en: "Built on Malaysia's official PriceCatcher price surveys.",
    zh: "数据来自马来西亚官方 PriceCatcher 价格调查。",
  },

  "preset.pick": { en: "Pick a starting basket", zh: "选一个起点菜篮" },
  "preset.everyday": { en: "Everyday essentials", zh: "日常必需" },
  "preset.freshmarket": { en: "Fresh market", zh: "巴刹鲜货" },
  "preset.breakfast": { en: "Breakfast basics", zh: "早餐基本款" },
  "preset.note": {
    en: "Illustrative mixes to get you started — not representative household baskets.",
    zh: "只是方便开始的示范组合，并非代表性家庭菜篮。",
  },
  "preset.startEmpty": { en: "Start empty instead", zh: "改为从空菜篮开始" },

  "editor.title": { en: "Your basket", zh: "你的菜篮" },
  "editor.pickGroceries": { en: "Pick your groceries", zh: "挑选你的杂货" },
  "editor.search": { en: "Search groceries", zh: "搜索杂货" },
  "editor.searchPlaceholder": { en: "Search e.g. rice, eggs…", zh: "搜索，例如：白米、鸡蛋……" },
  "editor.noResults": { en: "Nothing matched that search.", zh: "没有找到相符的项目。" },
  "editor.empty": { en: "Your basket is empty", zh: "菜篮还是空的" },
  "editor.emptyHint": {
    en: "Tap any grocery above to add it. Add at least one to see your receipt.",
    zh: "点击上面任何一样杂货即可加入。至少加入一样才能看到收据。",
  },
  "editor.add": { en: "Add", zh: "加入" },
  "editor.remove": { en: "Remove", zh: "移除" },
  "editor.increase": { en: "Increase quantity", zh: "增加数量" },
  "editor.decrease": { en: "Decrease quantity", zh: "减少数量" },
  "editor.clear": { en: "Clear basket", zh: "清空菜篮" },
  "editor.approxUnit": { en: "unit varies by pack", zh: "单位依包装而异" },
  "editor.itemsIn": { en: "in your basket", zh: "在菜篮里" },
  "editor.noHistory": { en: "No usable history", zh: "没有可用的历史数据" },

  "time.title": { en: "Choose two months", zh: "选择两个月份" },
  "time.baseline": { en: "Back then", zh: "从前" },
  "time.comparison": { en: "Compared with", zh: "对比" },
  "time.help": {
    en: "Only months with observed prices appear. 'Back then' must come first.",
    zh: "只会出现有实际观测价格的月份。「从前」必须在前。",
  },
  "time.latestObs": { en: "Latest observed price date", zh: "最新观测价格日期" },
  "time.coverage": { en: "items priced in both months", zh: "两个月都有价格的品项" },
  "time.noMonths": {
    en: "No months with enough observed prices yet.",
    zh: "目前还没有足够观测价格的月份。",
  },

  "receipt.title": { en: "Your receipt", zh: "你的收据" },
  "receipt.item": { en: "Item", zh: "品项" },
  "receipt.then": { en: "Then", zh: "从前" },
  "receipt.now": { en: "Now", zh: "现在" },
  "receipt.total": { en: "Basket total", zh: "菜篮总额" },
  "receipt.difference": { en: "Difference", zh: "差额" },
  "receipt.rm100": { en: "The RM100 twist", zh: "RM100 的玄机" },
  "receipt.rm100Help": {
    en: "If this exact mix cost RM100 back then, the same mix costs this much now. It is a scaled example, not the total of your chosen quantities.",
    zh: "如果这个组合在「从前」刚好是 RM100，同样的组合现在就是这个价。这是等比换算的示例，并非你所选数量的实际总额。",
  },
  "receipt.modeSame": { en: "Same groceries", zh: "同样的杂货" },
  "receipt.modeRM100": { en: "Same RM100", zh: "同样的 RM100" },
  "receipt.affordable": { en: "of the same mix", zh: "的同样组合" },
  "receipt.affordableHelp": {
    en: "Scaling the whole mix proportionally on the old budget. Real shopping cannot buy a fraction of an egg — this is a proportion, not a purchase.",
    zh: "以旧预算按比例缩放整个组合。现实中当然买不到半颗蛋 —— 这是比例，不是实际购买。",
  },
  "receipt.missingTitle": { en: "Left off this receipt", zh: "未列入收据" },
  "receipt.missingHelp": {
    en: "No observed price in one or both of the chosen months, so these are excluded from the totals rather than guessed.",
    zh: "在所选月份之一（或两者）没有观测价格，因此不列入总额，也不做推测。",
  },
  "receipt.noneUsable": {
    en: "None of your groceries have prices in both chosen months. Try different months or add other items.",
    zh: "你选的杂货在这两个月都没有价格。换个月份或加入其他品项试试。",
  },
  "receipt.printed": { en: "Prices are monthly averages of observed survey days.", zh: "价格为观测调查日的月度平均值。" },

  "quiz.title": { en: "Which changed more?", zh: "哪个变得更多？" },
  "quiz.prompt": {
    en: "Tap the one whose price rose more between these two months.",
    zh: "点选在这两个月之间涨得更多的那一个。",
  },
  "quiz.correct": { en: "Spot on!", zh: "答对了！" },
  "quiz.wrong": { en: "Not this time.", zh: "这次不对。" },
  "quiz.tie": { en: "It's a tie — both moved about the same.", zh: "平手 —— 两者变动差不多。" },
  "quiz.again": { en: "Another round", zh: "再来一轮" },
  "quiz.unavailable": {
    en: "Not enough items priced in both months for a fair round.",
    zh: "这两个月都有价格的品项不足，无法公平出题。",
  },

  "changed.title": { en: "What changed most?", zh: "什么变化最大？" },
  "changed.sub": {
    en: "How much each grocery added to — or took off — your basket's bill.",
    zh: "每样杂货为你的账单加了多少、又减了多少。",
  },
  "changed.up": { en: "costs more", zh: "变贵了" },
  "changed.down": { en: "costs less", zh: "变便宜了" },
  "changed.explore": { en: "Explore the prices", zh: "查看价格走势" },
  "changed.hide": { en: "Hide the prices", zh: "收起价格走势" },

  "chart.modeRM": { en: "RM per unit", zh: "每单位令吉" },
  "chart.modeIndex": { en: "Rebased to 100", zh: "以 100 为基准" },
  "chart.indexNote": {
    en: "Every line starts at 100 in your 'back then' month, so shapes are comparable.",
    zh: "每条线在「从前」那个月都从 100 开始，方便比较走势。",
  },
  "chart.empty": { en: "Add groceries to see their prices.", zh: "加入杂货后即可查看价格。" },

  "share.button": { en: "Share this receipt", zh: "分享这张收据" },
  "share.copied": { en: "Link copied", zh: "链接已复制" },
  "share.failed": { en: "Could not share — try copying the address bar.", zh: "无法分享 —— 请手动复制网址。" },
  "share.print": { en: "Print / save receipt", zh: "打印 / 保存收据" },
  "share.text": { en: "See what happened to my RM100 of groceries", zh: "看看我的 RM100 杂货变成怎样了" },

  "how.title": { en: "How it works", zh: "玩法与数据说明" },
  "how.prices": {
    en: "Prices are daily observations collected by PriceCatcher surveyors at retail premises. For each grocery and each month we average the days that were actually observed — nothing is filled in, carried forward or invented.",
    zh: "价格是 PriceCatcher 调查员在零售场所每日采集的观测值。我们把每样杂货每个月「实际有观测」的日子取平均 —— 不填补、不顺延、不虚构。",
  },
  "how.basket": {
    en: "Your basket totals are simply your quantities multiplied by those monthly averages. A grocery with no observed price in one of the two months is left out of the totals and listed separately.",
    zh: "菜篮总额就是你的数量乘上这些月度平均价。若某样杂货在其中一个月没有观测价格，就不计入总额，并另行列出。",
  },
  "how.caveat": {
    en: "PriceCatcher is a price surveillance programme, not an official inflation measure and not a representative household basket. Nothing here is a cost-of-living or salary claim.",
    zh: "PriceCatcher 是价格监测计划，并非官方通胀指标，也不是代表性家庭菜篮。本站内容不构成生活成本或薪资方面的论断。",
  },
  "how.cpi": {
    en: "The CPI figures shown are the DOSM core CPI series (overall), not the headline CPI. Months without a published figure stay blank.",
    zh: "所显示的 CPI 为马来西亚统计局的核心 CPI（整体）序列，并非整体（headline）CPI。没有公布数据的月份保持空白。",
  },
  "how.provenance": {
    en: "Observations ingested from the official monthly files are tagged with their source file and fetch time. Older rows that predate this tagging remain labelled legacy and unverified.",
    zh: "从官方月度档案导入的观测值会标注来源档案与抓取时间。早于此机制的旧数据仍标示为「旧数据 · 未核实」。",
  },
  "how.sources": { en: "Sources", zh: "数据来源" },
  "how.sourcePrices": { en: "PriceCatcher price data (data.gov.my)", zh: "PriceCatcher 价格数据（data.gov.my）" },
  "how.sourceCpi": { en: "CPI series (OpenDOSM)", zh: "CPI 序列（OpenDOSM）" },

  "common.loading": { en: "Setting up the shop…", zh: "正在开店……" },
  "common.error": { en: "We couldn't load the prices.", zh: "无法载入价格数据。" },
  "common.retry": { en: "Try again", zh: "重试" },
  "common.back": { en: "Back", zh: "返回" },
  "common.startOver": { en: "Start over", zh: "重新开始" },
  "common.close": { en: "Close", zh: "关闭" },

  "nav.soundOn": { en: "Sound on", zh: "音效开" },
  "nav.soundOff": { en: "Sound off", zh: "音效关" },
  "nav.soundToggleOn": { en: "Turn sound on", zh: "开启音效" },
  "nav.soundToggleOff": { en: "Turn sound off", zh: "关闭音效" },

  "hero.kicker": { en: "Malaysian grocery time machine", zh: "马来西亚杂货时光机" },
  "hero.tapHint": {
    en: "Tap a grocery in the scene to add it to your basket",
    zh: "点击画面里的杂货，把它加入菜篮",
  },
  "hero.quickPick": { en: "More groceries", zh: "更多杂货" },
  "hero.scroll": { en: "Scroll for the years", zh: "往下选年份" },
  "hero.stickerJom": { en: "Jom, explore!", zh: "来，逛逛吧！" },
  "hero.stickerMakan": { en: "Makan lokal, hidup bermakna", zh: "吃在地，活得有味" },
  "hero.stickerSmall": { en: "Same little things. A fuller tomorrow.", zh: "同样的小事，更饱满的明天。" },
  "item.inBasket": { en: "in your basket", zh: "已在菜篮" },
  "item.tapAdd": { en: "tap to add", zh: "点击加入" },

  "tray.kicker": { en: "Your scene", zh: "你的画面" },
  "tray.title": { en: "Your basket", zh: "你的菜篮" },
  "tray.emptyTitle": { en: "Your basket is waiting", zh: "菜篮还是空的" },
  "tray.emptyHint": {
    en: "Tap a grocery in the illustration, or open the editor to start picking.",
    zh: "点击插画里的杂货，或者打开编辑器开始挑选。",
  },
  "tray.edit": { en: "Edit my basket", zh: "编辑菜篮" },
  "tray.reveal": { en: "Reveal the result", zh: "揭晓结果" },
  "tray.revealHint": { en: "Pick at least one grocery first", zh: "先挑至少一样杂货" },
  "tray.priceHint": {
    en: "Add groceries to see the price story.",
    zh: "加入杂货后，这里会显示价格。",
  },
  "tray.itemCount": { en: "items", zh: "样" },

  "steps.pick": { en: "Pick groceries", zh: "挑杂货" },
  "steps.months": { en: "Choose months", zh: "选月份" },
  "steps.reveal": { en: "Reveal", zh: "揭晓" },

  "results.kicker": { en: "The full receipt", zh: "完整收据" },
  "results.title": { en: "The price story, unpacked", zh: "价格故事的细节" },
} as const;

export type GameKey = keyof typeof copy;

export function g(key: GameKey, lang: Lang): string {
  return copy[key]?.[lang] ?? key;
}
