import type { ReactNode } from "react";
import Link from "next/link";
import type { Demo } from "@/lib/types";
import { Badge } from "@/components/ui/badge";
import { IconArrowLeft } from "@/components/ui/icons";
import { ContactCta } from "@/components/sections/contact-cta";
import { DemoFrame } from "@/components/demos/demo-frame";
import { DemoSection } from "@/components/demos/demo-section";
import { WorkflowSteps } from "@/components/projects/workflow-steps";
import { PageContainer } from "@/components/layout/page-container";

/**
 * Shared demo page structure (docs/06_DEMO_SPECIFICATIONS.MD):
 * Introduction → Problem → Solution → Interactive Demo → How It Works → CTA.
 */
export function DemoShell({
  demo,
  problem,
  solution,
  workflow,
  children,
}: {
  demo: Demo;
  problem: string;
  solution: string;
  workflow: string[];
  children: ReactNode;
}) {
  return (
    <>
      <section className="pt-16 sm:pt-24">
        <PageContainer className="flex flex-col items-center gap-5 text-center">
          <Link
            href="/demos"
            className="inline-flex items-center gap-1.5 text-sm text-muted transition-colors hover:text-foreground"
          >
            <IconArrowLeft className="h-4 w-4" />
            All demos
          </Link>
          <Badge variant="secondary">{demo.category}</Badge>
          <h1 className="section-title">{demo.title}</h1>
          <p className="section-subtitle">{demo.description}</p>
        </PageContainer>
      </section>

      <section className="pt-10">
        <PageContainer className="flex flex-col-reverse gap-10 pb-16 sm:pb-20 lg:flex-row">
          <div className="flex flex-col gap-8 lg:w-1/2">
            <DemoSection title="The problem">
              <p>{problem}</p>
            </DemoSection>
            <DemoSection title="The solution">
              <p>{solution}</p>
            </DemoSection>
            <DemoSection title="How it works">
              <WorkflowSteps steps={workflow} />
            </DemoSection>
          </div>

          <div className="lg:w-1/2 lg:self-start lg:sticky lg:top-24">
            <DemoFrame>{children}</DemoFrame>
          </div>
        </PageContainer>
      </section>

      <ContactCta />
    </>
  );
}
