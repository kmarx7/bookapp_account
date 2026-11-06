import { COURSE_STEPS } from "@/lib/course";
import { StepDetail } from "./step-detail";

export function generateStaticParams() {
  return COURSE_STEPS.map((step) => ({ step: step.id }));
}

export default async function LearnStepPage({
  params,
}: PageProps<"/learn/[step]">) {
  const { step } = await params;
  return <StepDetail stepId={step} />;
}
