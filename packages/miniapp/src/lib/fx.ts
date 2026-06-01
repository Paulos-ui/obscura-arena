"use client";

import confetti from "canvas-confetti";

/** Gold + violet particle explosion for the reveal ceremony. */
export function royalConfetti() {
  const colors = ["#f4c560", "#ffe39c", "#8b5cf6", "#a855f7", "#ffffff"];
  const fire = (particleRatio: number, opts: confetti.Options) =>
    confetti({
      origin: { y: 0.6 },
      colors,
      particleCount: Math.floor(200 * particleRatio),
      ...opts,
    });
  fire(0.25, { spread: 26, startVelocity: 55 });
  fire(0.2, { spread: 60 });
  fire(0.35, { spread: 100, decay: 0.91, scalar: 0.9 });
  fire(0.1, { spread: 120, startVelocity: 25, decay: 0.92, scalar: 1.2 });
  fire(0.1, { spread: 120, startVelocity: 45 });
}

export function shortAddr(addr?: string) {
  if (!addr) return "0x0000…0000";
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

/** Deterministic faux-ciphertext string from a bigint handle, for the sealed display. */
export function cipherString(handle?: bigint | null, len = 18) {
  const hex = "0123456789abcdef";
  if (!handle) return "•".repeat(len);
  let seed = handle % 1000000007n;
  let out = "";
  for (let i = 0; i < len; i++) {
    seed = (seed * 48271n) % 2147483647n;
    out += hex[Number(seed % 16n)];
  }
  return out;
}

export function fmtCountdown(secondsLeft: number) {
  if (secondsLeft <= 0) return "CLOSED";
  const h = Math.floor(secondsLeft / 3600);
  const m = Math.floor((secondsLeft % 3600) / 60);
  const s = Math.floor(secondsLeft % 60);
  return `${String(h).padStart(2, "0")}:${String(m).padStart(2, "0")}:${String(s).padStart(2, "0")}`;
}
