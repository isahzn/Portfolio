import services from "@/data/services.json";
import { PageContainer } from "@/components/layout/page-container";

/**
 * ServicesSection — numbered capability rows (01/02/03) driven by
 * data/services.json (docs/08_CONTENT_PLAN.MD, floza-redesign.html).
 * `showHeader` is disabled on the services page which provides its own heading.
 */
export function ServicesSection({
  title = "What we build",
  subtitle = "Every engagement starts the same way — understanding where time actually goes, then building the system that gets it back.",
  showHeader = true,
}: {
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
}) {
  return (
    <section className="border-b border-border-soft">
      <PageContainer className="py-20 sm:py-24">
        {showHeader && (
          <div className="section-head">
            <div>
              <div className="section-tag mb-4">{title}</div>
              <h2 className="section-title">
                Three ways we remove <em>repetitive work.</em>
              </h2>
            </div>
            <p className="section-subtitle max-w-[420px]">{subtitle}</p>
          </div>
        )}

        <div className="flex flex-col">
          {services.map((service, index) => (
            <div
              key={service.title}
              data-track-impression="service"
              data-track-click="service"
              data-track-slug={service.title}
              className="grid items-start gap-4 border-t border-border-soft py-9 md:grid-cols-[80px_1.1fr_1.4fr] md:gap-10"
            >
              <span className="pt-1 font-serif text-[15px] text-faint">
                {String(index + 1).padStart(2, "0")}
              </span>
              <div>
                <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                  <h3 className="text-[19px] font-semibold tracking-tight text-foreground">
                    {service.title}
                  </h3>
                  <span className="inline-flex items-center gap-1.5 rounded-sm border border-online/25 bg-online/10 px-2 py-0.5 font-mono text-[10px] uppercase tracking-[0.06em] text-online">
                    <span className="live-dot" aria-hidden="true" />
                    Running 24/7
                  </span>
                </div>
                <p className="mt-2 max-w-xs text-[14.5px] leading-relaxed text-muted">
                  {service.description}
                </p>
              </div>
              <div className="flex flex-wrap gap-2.5 pt-1.5">
                {service.features.map((feature) => (
                  <span
                    key={feature}
                    className="border border-border px-3 py-1.5 font-mono text-xs text-muted"
                  >
                    {feature}
                  </span>
                ))}
              </div>
            </div>
          ))}
          <div className="border-b border-border-soft" />
        </div>
      </PageContainer>
    </section>
  );
}
