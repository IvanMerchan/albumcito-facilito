"use server";

import { redirect } from "next/navigation";
import { getMe } from "@/app/lib/auth-api";
import { addSticker } from "@/app/lib/collection-api";
import { getSessionToken } from "@/app/lib/session";

// Bound with the chosen stickerId via `.bind(null, stickerId)` on a
// per-sticker <form action={...}> -- see
// app/components/onboarding-sticker-picker.tsx. React appends the form's
// FormData as a trailing argument, which this function simply ignores.
export async function addStickerAction(stickerId: string): Promise<void> {
  const token = await getSessionToken();
  if (!token) {
    redirect("/login");
  }

  await addSticker(token, stickerId);

  const user = await getMe(token);
  if (!user) {
    redirect("/login");
  }

  // redirect() throws internally, so it must stay outside any try/catch.
  redirect(`/dashboard/${user.username}`);
}
