"use server";

import { createHash, timingSafeEqual } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const ADMIN_COOKIE = "media-echo-admin";

function digest(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left);
  const rightBuffer = Buffer.from(right);
  if (leftBuffer.length !== rightBuffer.length) {
    return false;
  }
  return timingSafeEqual(leftBuffer, rightBuffer);
}

export async function hasAdminAccess() {
  const expected = process.env.ADMIN_PORTAL_PASSWORD;
  if (!expected) {
    return false;
  }

  const cookieStore = await cookies();
  const current = cookieStore.get(ADMIN_COOKIE)?.value;
  return current ? safeEqual(current, digest(expected)) : false;
}

export async function unlockAdmin(formData: FormData) {
  const expected = process.env.ADMIN_PORTAL_PASSWORD;
  if (!expected) {
    redirect("/admin?error=missing");
  }

  const submitted = String(formData.get("password") ?? "");
  if (!submitted || !safeEqual(digest(submitted), digest(expected))) {
    redirect("/admin?error=invalid");
  }

  const cookieStore = await cookies();
  cookieStore.set(ADMIN_COOKIE, digest(expected), {
    httpOnly: true,
    sameSite: "lax",
    secure: true,
    path: "/",
    maxAge: 60 * 60 * 8,
  });

  redirect("/admin");
}

export async function lockAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE);
  redirect("/");
}