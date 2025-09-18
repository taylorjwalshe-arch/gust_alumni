import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export async function getServerAuthSession() {
  return await getServerSession(authOptions);
}

export async function getSessionLoose(...args: Parameters<typeof getServerSession>) {
  return getServerSession(...args);
}
