import { useLanguage } from "@/contexts/LanguageContext";
import { g } from "@/lib/gameTranslations";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

export function HowItWorks({ latestObservation }: { latestObservation: string | null }) {
  const { lang } = useLanguage();

  return (
    <section id="how-it-works" aria-labelledby="how-heading" className="scroll-mt-20">
      <Accordion type="single" collapsible className="rounded-2xl border border-border bg-card px-5">
        <AccordionItem value="how" className="border-none">
          <AccordionTrigger className="py-5 text-left">
            <h2 id="how-heading" className="font-serif text-xl font-bold text-foreground">
              {g("how.title", lang)}
            </h2>
          </AccordionTrigger>
          <AccordionContent className="pb-6">
            <div className="space-y-3 text-base leading-relaxed text-muted-foreground">
              <p>{g("how.prices", lang)}</p>
              <p>{g("how.basket", lang)}</p>
              <p>{g("how.cpi", lang)}</p>
              <p>{g("how.provenance", lang)}</p>
              <p className="font-medium text-foreground">{g("how.caveat", lang)}</p>
              {latestObservation && (
                <p className="font-receipt text-sm">
                  {g("time.latestObs", lang)}: {latestObservation}
                </p>
              )}
              <div>
                <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-foreground">
                  {g("how.sources", lang)}
                </h3>
                <ul className="mt-2 space-y-1">
                  <li>
                    <a
                      className="text-primary underline underline-offset-2"
                      href="https://data.gov.my/data-catalogue/pricecatcher"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {g("how.sourcePrices", lang)}
                    </a>
                  </li>
                  <li>
                    <a
                      className="text-primary underline underline-offset-2"
                      href="https://open.dosm.gov.my/data-catalogue/cpi_headline"
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      {g("how.sourceCpi", lang)}
                    </a>
                  </li>
                </ul>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </section>
  );
}
