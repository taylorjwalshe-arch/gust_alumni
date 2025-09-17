import { redirect } from "next/navigation";

export default async function TeamFeedRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const target = `/feed${slug ? `?team=${encodeURIComponent(slug)}` : ""}`;
  redirect(target);
}
