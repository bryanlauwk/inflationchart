import { Link } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";
import { t, tArray } from "@/lib/translations";
import type { TranslationKey } from "@/lib/translations";

// Item mapping data for the reference table
const ITEM_MAPPING = [
  { key: "chicken", codes: "1", unit: "1 kg", notes: { zh: "标准鸡肉", en: "Standard chicken" } },
  { key: "eggs", codes: "118", unit: "10 pcs", notes: { zh: "鸡蛋（10粒）", en: "Eggs (10 pcs)" } },
  { key: "rice", codes: "904, 992, 1445, 1581, 1582", unit: "1 kg", notes: { zh: "10kg 袋装 ÷ 10 换算为每公斤", en: "10kg bags ÷ 10 to normalize per kg" } },
  { key: "milk", codes: "224, 225, 1852", unit: "1 L", notes: { zh: "鲜奶", en: "Fresh milk" } },
  { key: "sugar", codes: "1589, 1590", unit: "1 kg", notes: { zh: "白砂糖", en: "White sugar" } },
  { key: "cookingoil", codes: "1091", unit: "1 kg", notes: { zh: "标准1kg瓶装食用油（排除补贴袋装918及不同规格1092/1093）", en: "Standard 1kg bottled oil (excludes subsidized packet 918 and other sizes 1092/1093)" } },
  { key: "tomato", codes: "114", unit: "1 kg", notes: { zh: "番茄", en: "Tomato" } },
  { key: "longbeans", codes: "98", unit: "1 kg", notes: { zh: "长豆", en: "Long beans" } },
  { key: "kangkung", codes: "1559", unit: "1 kg", notes: { zh: "空心菜", en: "Water spinach" } },
  { key: "onion", codes: "129, 1440, 1441", unit: "1 kg", notes: { zh: "洋葱（印度/本地/红）", en: "Onion (Indian/local/red)" } },
  { key: "chili", codes: "92, 93, 94", unit: "1 kg", notes: { zh: "青椒、红辣椒平均", en: "Average across green and red varieties" } },
  { key: "cabbage", codes: "104, 105, 1396, 1458", unit: "1 kg", notes: { zh: "进口/本地品种", en: "Import and local varieties" } },
  { key: "spinach", codes: "1556, 1557", unit: "1 kg", notes: { zh: "绿/红菠菜（bayam）", en: "Green/red bayam (spinach)" } },
  { key: "papaya", codes: "16", unit: "1 kg", notes: { zh: "木瓜", en: "Papaya (betik)" } },
  { key: "banana", codes: "18", unit: "1 kg", notes: { zh: "香蕉（berangan 品种）", en: "Banana (pisang berangan)" } },
  { key: "watermelon", codes: "20, 21", unit: "1 kg", notes: { zh: "有籽/无籽西瓜平均", en: "Average seeded + seedless" } },
  { key: "lime", codes: "1132", unit: "1 kg", notes: { zh: "酸柑（limau nipis）", en: "Lime (limau nipis)" } },
];

const About = () => {
  const { lang, toggleLang } = useLanguage();
  const headers = tArray("about.mappingHeaders", lang);
  const freshnessItems = tArray("about.freshnessItems", lang);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border px-4 py-10 md:py-12">
        <div className="mx-auto max-w-3xl">
          <div className="flex items-start justify-between">
            <h1 className="font-serif text-2xl font-bold leading-tight text-foreground md:text-4xl">
              {t("about.title", lang)}
            </h1>
            <div className="mt-1 flex shrink-0 items-center gap-3">
              <Link
                to="/"
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {t("nav.home", lang)}
              </Link>
              <button
                onClick={toggleLang}
                className="text-sm text-muted-foreground transition-colors hover:text-primary"
              >
                {lang === "zh" ? "EN" : "中"}
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Content */}
      <main className="mx-auto max-w-3xl px-4 py-8 md:py-12">
        <div className="space-y-10">
          {/* Section 1: What This Tracks */}
          <section>
            <h2 className="mb-4 font-serif text-lg font-bold text-foreground">
              {t("about.whatTitle", lang)}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("about.whatBody", lang)}
            </p>
          </section>

          {/* Section 2: Data Pipeline */}
          <section>
            <h2 className="mb-4 font-serif text-lg font-bold text-foreground">
              {t("about.pipelineTitle", lang)}
            </h2>
            <p className="text-sm leading-relaxed text-muted-foreground">
              {t("about.pipelineBody", lang)}
            </p>
          </section>

          {/* Section 3: Calculation Method */}
          <section>
            <h2 className="mb-4 font-serif text-lg font-bold text-foreground">
              {t("about.methodTitle", lang)}
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li className="flex gap-2">
                <span className="shrink-0 text-primary">·</span>
                {t("about.methodNominal", lang)}
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 text-primary">·</span>
                <span className="font-mono text-xs text-foreground">
                  {t("about.methodReal", lang)}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 text-primary">·</span>
                {t("about.methodBasket", lang)}
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 text-primary">·</span>
                <span className="text-xs text-muted-foreground/80">
                  {t("about.methodWeights", lang)}
                </span>
              </li>
              <li className="flex gap-2">
                <span className="shrink-0 text-primary">·</span>
                {t("about.methodChange", lang)}
              </li>
            </ul>
          </section>

          {/* Section 4: Item Code Mapping Table */}
          <section>
            <h2 className="mb-4 font-serif text-lg font-bold text-foreground">
              {t("about.mappingTitle", lang)}
            </h2>
            <div className="overflow-x-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/30">
                    {headers.map((h, i) => (
                      <th
                        key={i}
                        className="px-3 py-2.5 text-left text-xs font-medium text-muted-foreground"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {ITEM_MAPPING.map((row) => (
                    <tr key={row.key} className="border-b border-border/50 last:border-0">
                      <td className="px-3 py-2 text-foreground">
                        {t(`item.${row.key}` as TranslationKey, lang)}
                      </td>
                      <td className="px-3 py-2 font-mono text-xs text-muted-foreground">
                        {row.codes}
                      </td>
                      <td className="px-3 py-2 text-muted-foreground">{row.unit}</td>
                      <td className="px-3 py-2 text-xs text-muted-foreground">
                        {row.notes[lang]}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Section 5: Data Freshness & Limitations */}
          <section>
            <h2 className="mb-4 font-serif text-lg font-bold text-foreground">
              {t("about.freshnessTitle", lang)}
            </h2>
            <ul className="space-y-2 text-sm text-muted-foreground">
              {freshnessItems.map((item, i) => (
                <li key={i} className="flex gap-2">
                  <span className="shrink-0 text-primary">·</span>
                  {item}
                </li>
              ))}
            </ul>
          </section>

          {/* Section 6: Credits & Links */}
          <section>
            <h2 className="mb-4 font-serif text-lg font-bold text-foreground">
              {t("about.creditsTitle", lang)}
            </h2>
            <div className="space-y-2 text-sm text-muted-foreground">
              <p>
                <a
                  href="https://open.dosm.gov.my"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  OpenDOSM
                </a>
                {" — "}
                {lang === "zh"
                  ? "马来西亚开放数据平台"
                  : "Malaysia's open data platform"}
              </p>
              <p>
                <a
                  href="https://www.kpdn.gov.my"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  KPDN
                </a>
                {" — "}
                {lang === "zh"
                  ? "国内贸易及生活成本部"
                  : "Ministry of Domestic Trade and Cost of Living"}
              </p>
              <p>
                <a
                  href="https://www.dosm.gov.my"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline"
                >
                  DOSM
                </a>
                {" — "}
                {lang === "zh"
                  ? "马来西亚统计局"
                  : "Department of Statistics Malaysia"}
              </p>
            </div>
          </section>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-4 py-10 text-center text-xs text-muted-foreground">
        <Link to="/" className="text-primary hover:underline">
          ← {t("nav.home", lang)}
        </Link>
      </footer>
    </div>
  );
};

export default About;
