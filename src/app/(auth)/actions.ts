"use server";

import { lucia, validateRequest } from "@/auth";
import prisma from "@/lib/prisma";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

export async function logout() {
  const { session } = await validateRequest();
  if (!session) {
    throw new Error("Unauthorized");
  }

  await lucia.invalidateSession(session.id);

  const sessoinCookie = lucia.createBlankSessionCookie();

  cookies().set(
    sessoinCookie.name,
    sessoinCookie.value,
    sessoinCookie.attributes,
  );

  return redirect("/login");
}
