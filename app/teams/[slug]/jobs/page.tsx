import { redirect } from "next/navigation";

export default async function TeamJobsRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const target = `/jobs${slug ? `?team=${encodeURIComponent(slug)}` : ""}`;
  redirect(target);
}
