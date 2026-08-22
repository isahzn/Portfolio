import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { LiveCounter } from "@/components/site/live-status";

/**
 * Final conversion CTA — large editorial statement with a live
 * "automations processed" counter ticking next to it.
 */
export function ContactCta() {
  return (
    <section>
      <PageContainer className="py-20 sm:py-24">
        <div className="grid items-end gap-8 border-b border-border-soft pb-14 md:grid-cols-[1.3fr_0.7fr] md:gap-12">
          <h2 className="text-[clamp(2rem,3.6vw,3rem)] font-semibold leading-[1.1] tracking-tight text-foreground">
            Ready for a system that <br />
            <em className="serif-em">never sleeps?</em> Let&apos;s build it.
          </h2>
          <div className="flex flex-col items-start gap-3.5">
            <Button size="lg" href="/contact" data-track-click="contact">
              Get 24/7 Automation
            </Button>
            <span className="flex items-center gap-1.5 font-mono text-[11px] text-faint">
              <span className="live-dot" aria-hidden="true" />
              <LiveCounter /> automations processed since you opened this page
            </span>
          </div>
        </div>
      </PageContainer>
    </section>
  );
}
