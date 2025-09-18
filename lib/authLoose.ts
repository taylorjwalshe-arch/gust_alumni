import { getServerSession } from "next-auth";
import { authOptions } from "@/auth";

export const getServerAuthSession = () => {
  return getServerSession(authOptions);
};
