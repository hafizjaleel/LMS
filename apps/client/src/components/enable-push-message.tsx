"use client";

import { Button } from "./ui/button";

export async function enablePush(userId: string) {
  const registration = await navigator.serviceWorker.register("/sw.js");

  const subscription = await registration.pushManager.subscribe({
    userVisibleOnly: true,
    applicationServerKey: urlBase64ToUint8Array(
      process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!,
    ),
  });

  await fetch(`${process.env.NEXT_PUBLIC_API}/api/push/subscribe`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ userId, subscription }),
    credentials: "include",
  });

  alert("Push enabled");
}

// helper: VAPID requires Uint8Array
export function urlBase64ToUint8Array(base64: string): ArrayBuffer {
  const padding = "=".repeat((4 - (base64.length % 4)) % 4);

  const base64Safe = (base64 + padding).replace(/-/g, "+").replace(/_/g, "/");

  const raw = atob(base64Safe);

  const output = new Uint8Array(raw.length);

  for (let i = 0; i < raw.length; ++i) {
    output[i] = raw.charCodeAt(i);
  }

  return output.buffer;
}

export function EnablePushButton({ userId }: { userId: string }) {
  return <Button onClick={() => enablePush(userId)}>Enable Push</Button>;
}
