"use server";

import { lucia } from "@/auth";
import prisma from "@/lib/prisma";
import { loginSchema, LoginValues } from "@/lib/validation";
import { isRedirectError } from "next/dist/client/components/redirect";
import { redirect } from "next/navigation";
import { verify } from "@node-rs/argon2";
import { cookies } from "next/headers";

export async function login(
  credentials: LoginValues,
): Promise<{ error: string }> {
  try {
    const { username, password } = loginSchema.parse(credentials);
    const existingUser = await prisma.user.findFirst({
      where: { username: { equals: username, mode: "insensitive" } },
    });

    if (!existingUser || !existingUser.passwordHash) {
      return { error: "Invalid username or password." };
    }

    const validPassword = await verify(existingUser.passwordHash, password, {
      memoryCost: 19456,
      timeCost: 2,
      outputLen: 32,
      parallelism: 1,
    });

    if (!validPassword) {
      return { error: "Invalid username or password." };
    }

    const sessoin = await lucia.createSession(existingUser.id, {});
    const sessoinCookie = lucia.createSessionCookie(sessoin.id);
    cookies().set(
      sessoinCookie.name,
      sessoinCookie.value,
      sessoinCookie.attributes,
    );

    return redirect("/");
  } catch (error) {
    if (isRedirectError(error)) throw error;

    console.error(error);
    return { error: "An unexpected error occurred." };
  }
}
