import React from "react";
import { useTranslation } from "react-i18next";
import { FiAlertCircle } from "react-icons/fi";

interface ErrorDisplayProps {
  error: string | null;
  retryFn?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error }) => {
  const { t } = useTranslation("common");

  // Determine error type
  const errorMessage =
    typeof error === "string"
      ? error
      : (error as unknown as { message?: string })?.message ||
        t("recognition.unknownError", "An unknown error occurred");

  // Check for specific error types
  const isNoFace =
    errorMessage.toLowerCase().includes("no face") ||
    errorMessage.toLowerCase().includes("no faces");

  const isTimeout =
    errorMessage.toLowerCase().includes("timeout") ||
    errorMessage.toLowerCase().includes("timed out");

  return (
    <div className="p-4 rounded-lg bg-red-50 border border-red-200 text-red-800 dark:bg-red-900/30 dark:border-red-800 dark:text-red-300">
      <div className="flex items-center mb-3">
        <FiAlertCircle className="mr-2 text-red-500 text-xl" />
        <h3 className="font-medium">
          {t("recognition.error", "Recognition Error")}
        </h3>
      </div>
      <p className="mb-2 text-sm">{errorMessage}</p>

      {isNoFace && (
        <div className="mt-2 text-sm">
          {t(
            "common.makeSureFaceVisible",
            "Make sure your face is clearly visible in the image"
          )}
        </div>
      )}

      {isTimeout && (
        <div className="mt-2 text-sm">
          {t(
            "common.trySmallerImage",
            "Try using a smaller image or improving your connection"
          )}
        </div>
      )}
    </div>
  );
};

export default ErrorDisplay;
