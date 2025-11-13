import { auth } from "@/app/api/auth/[...nextauth]/route";

export function getSession() {
  return auth();
}

