import { Suspense } from "react";
import { CreateJobLayout } from "@/components/create-job/CreateJobLayout";
import { JobFormProvider } from "@/contexts/JobFormContext";
import CreateJobSkeleton from "@/components/skeleton/CreateJobSkeleton";
import { Metadata } from "next";

export const metadata: Metadata = {
  title: "TriggerX App | Automate Everything Onchain",
  description:
    "Access the TriggerX App to create, manage, and run automated onchain tasks with shared security. Fast, reliable, and trust-minimized.",
  openGraph: {
    title: "TriggerX App | Secure Onchain Automation",
    description:
      "Access the TriggerX App to create, manage, and run automated onchain tasks with shared security. Fast, reliable, and trust-minimized.",
    url: `https://app.triggerx.network/`,
    siteName: "TriggerX",
    images: [
      {
        url: `https://app.triggerx.network/OGImages/build.png`,
        width: 1200,
        height: 630,
        alt: "TriggerX App interface",
        type: "image/png",
      },
    ],
    type: "website",
  },
  alternates: {
    canonical: `https://app.triggerx.network/`,
  },
};

export default function Home() {
  return (
    <Suspense fallback={<CreateJobSkeleton />}>
      <JobFormProvider>
        <CreateJobLayout />
      </JobFormProvider>
    </Suspense>
  );
}
