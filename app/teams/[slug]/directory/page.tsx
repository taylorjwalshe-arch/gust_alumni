import { redirect } from "next/navigation";

export default async function TeamDirectoryRedirect({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const target = `/directory${slug ? `?team=${encodeURIComponent(slug)}` : ""}`;
  redirect(target);
}
