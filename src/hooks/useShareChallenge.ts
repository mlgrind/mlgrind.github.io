import { useCallback, useEffect, useState } from "react";
import { track } from "../lib/analytics";

/** Draws and downloads the 1200x630 "Challenge completed" card. */
export function downloadCompletionCard(title: string) {
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  canvas.height = 630;
  const context = canvas.getContext("2d");
  if (!context) return;
  context.fillStyle = "#10111b";
  context.fillRect(0, 0, 1200, 630);
  context.fillStyle = "#a79bff";
  context.font = "bold 36px sans-serif";
  context.fillText("ML GRIND", 80, 100);
  context.fillStyle = "#ffffff";
  context.font = "bold 44px sans-serif";
  context.fillText("Challenge completed", 80, 220);
  context.font = "32px sans-serif";
  // Wrap long titles to keep downloaded cards readable.
  const words = title.split(" ");
  let line = "";
  let y = 300;
  for (const word of words) {
    if (context.measureText(`${line} ${word}`).width > 1020) {
      context.fillText(line, 80, y);
      line = word;
      y += 45;
    } else line += `${line ? " " : ""}${word}`;
  }
  context.fillText(line, 80, y);
  context.fillStyle = "#b7bbc9";
  context.font = "26px sans-serif";
  context.fillText("Build ML algorithms. Run Python in your browser.", 80, 490);
  context.fillText("mlgrind.github.io", 80, 550);
  const link = document.createElement("a");
  link.download = "mlgrind-challenge.png";
  link.href = canvas.toDataURL("image/png");
  link.click();
}

/**
 * Copy-link state for a challenge. `autoClear` hides the "Link copied" message
 * after a few seconds (the compact problem-page button uses it); the fallback
 * message with the raw URL stays until the next copy.
 */
export function useShareChallenge(path: string, autoClear = false) {
  const [message, setMessage] = useState("");
  const url = `https://mlgrind.github.io${path}`;
  useEffect(() => setMessage(""), [path]);
  useEffect(() => {
    if (!autoClear || message !== "Link copied") return;
    const timer = setTimeout(() => setMessage(""), 2500);
    return () => clearTimeout(timer);
  }, [autoClear, message]);
  const copy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copied");
      track("challenge_shared");
    } catch {
      setMessage(`Copy this link: ${url}`);
    }
  }, [url]);
  return { url, message, copy };
}
