"use server";

import { db } from "@/lib/db";
import { redirect } from "next/navigation";

export async function postJob(formData: FormData) {
  const title = formData.get("title") as string;
  const company = formData.get("company") as string;
  const location = formData.get("location") as string;

  if (!title || !company) return;

  await db.job.create({
    data: {
      title,
      company,
      location,
      postedAt: new Date(),
    },
  });

  redirect("/jobs");
}
