import { useState } from "react";
import { track } from "../../lib/analytics";

export default function ShareChallenge({
  title,
  path,
  completed = false,
}: {
  title: string;
  path: string;
  completed?: boolean;
}) {
  const [message, setMessage] = useState("");
  const url = `https://mlgrind.github.io${path}`;
  async function copy() {
    try {
      await navigator.clipboard.writeText(url);
      setMessage("Link copied");
      track("challenge_shared");
    } catch {
      setMessage(`Copy this link: ${url}`);
    }
  }
  function download() {
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
    context.fillText(
      "Build ML algorithms. Run Python in your browser.",
      80,
      490,
    );
    context.fillText("mlgrind.github.io", 80, 550);
    const link = document.createElement("a");
    link.download = "mlgrind-challenge.png";
    link.href = canvas.toDataURL("image/png");
    link.click();
  }
  return (
    <div className="flex flex-wrap items-center gap-3 text-sm">
      <button
        onClick={copy}
        className="px-3 py-2 rounded-lg border border-gray-300 dark:border-dark-500 text-gray-700 dark:text-dark-100"
      >
        Share challenge
      </button>
      {completed && (
        <button
          onClick={download}
          className="px-3 py-2 rounded-lg bg-primary-500 text-white"
        >
          Download completion card
        </button>
      )}
      <span
        role="status"
        className="text-gray-500 dark:text-dark-200 break-all"
      >
        {message}
      </span>
    </div>
  );
}
