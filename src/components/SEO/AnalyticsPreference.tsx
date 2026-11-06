import { useState } from "react";
import { readStorage, writeStorage } from "../../lib/storage";
export default function AnalyticsPreference() {
  const [disabled, setDisabled] = useState(
    () => readStorage("mlgrind-analytics-disabled") === "true",
  );
  return (
    <div className="p-4 my-4 border rounded-lg border-gray-300 dark:border-dark-500">
      <p className="text-gray-600 dark:text-dark-200">
        Optional usage analytics help us understand which exercises work well.
        We respect your browser’s Do Not Track preference.
      </p>
      <button
        className="mt-3 px-4 py-2 bg-primary-500 text-white rounded-lg"
        onClick={() => {
          if (writeStorage("mlgrind-analytics-disabled", String(!disabled))) {
            setDisabled(!disabled);
            window.location.reload();
          }
        }}
      >
        {disabled ? "Enable usage analytics" : "Disable usage analytics"}
      </button>
    </div>
  );
}
