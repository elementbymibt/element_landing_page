import { notFound } from "next/navigation";

import { IntakeWizard } from "@/src/components/intake/intake-wizard";
import { Container } from "@/src/components/ui/container";
import { intakeStore } from "@/src/lib/intake/store";
import { buildMetadata } from "@/src/lib/seo";

type PageProps = {
  params: Promise<{ id: string }>;
};

export async function generateMetadata(props: PageProps) {
  const params = await props.params;

  return buildMetadata({
    title: "Klijentski upitnik",
    description: "Nastavite klijentski upitnik i završite projektni brief.",
    path: `/intake/${params.id}`,
  });
}

export default async function IntakePage(props: PageProps) {
  const params = await props.params;
  const record = await intakeStore.getIntakeWithProject(params.id.toLowerCase());

  if (!record) {
    notFound();
  }

  return (
    <Container className="py-8 sm:py-12">
      <IntakeWizard initialIntake={record.intake} />
    </Container>
  );
}
