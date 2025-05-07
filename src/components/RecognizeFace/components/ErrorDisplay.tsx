import React from "react";
import { useTranslation } from "react-i18next";

interface ErrorDisplayProps {
  apiError: string | null;
  diagnosticInfo?: any;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  apiError,
  diagnosticInfo,
}) => {
  const { t } = useTranslation("recognize");

  if (!apiError) return null;

  // Check if we have a timeout error
  const isTimeout =
    apiError.includes("timeout") || diagnosticInfo?.error_type === "timeout";

  // Check if face was detected but not recognized
  const faceDetectedButNotRecognized =
    diagnosticInfo?.face_detected && !diagnosticInfo?.recognized;

  // Check for server errors
  const isServerError =
    apiError.includes("500") ||
    diagnosticInfo?.error_code === 500 ||
    apiError.includes("server");

  return (
    <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
      <div className="flex items-start">
        <div className="flex-shrink-0">
          <svg
            className="h-5 w-5 text-red-500"
            viewBox="0 0 20 20"
            fill="currentColor"
          >
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
              clipRule="evenodd"
            />
          </svg>
        </div>
        <div className="ml-3">
          <h3 className="text-sm font-medium text-red-800">
            {t("error.title", "Recognition Error")}
          </h3>
          <div className="mt-2 text-sm text-red-700">
            <p>{apiError}</p>

            {/* Troubleshooting suggestions based on error type */}
            <div className="mt-3 p-3 bg-white rounded border border-red-100">
              <h4 className="font-medium mb-1">
                {t("error.suggestions", "Suggestions:")}
              </h4>
              <ul className="list-disc pl-5 space-y-1 text-sm">
                {isTimeout && (
                  <>
                    <li>
                      {t(
                        "error.timeout.smaller",
                        "Try a smaller or lower resolution image"
                      )}
                    </li>
                    <li>
                      {t(
                        "error.timeout.tryAgain",
                        "Try again in a few moments when the server is less busy"
                      )}
                    </li>
                    <li>
                      {t(
                        "error.timeout.differentMethod",
                        "Try a different capture method (webcam instead of upload or vice versa)"
                      )}
                    </li>
                  </>
                )}

                {faceDetectedButNotRecognized && (
                  <>
                    <li>
                      {t(
                        "error.noMatch.register",
                        "Make sure the person is registered in the system"
                      )}
                    </li>
                    <li>
                      {t(
                        "error.noMatch.lighting",
                        "Try taking a photo with better lighting"
                      )}
                    </li>
                    <li>
                      {t(
                        "error.noMatch.angle",
                        "Ensure the face is looking directly at the camera"
                      )}
                    </li>
                  </>
                )}

                {apiError.includes("No face") && (
                  <>
                    <li>
                      {t(
                        "error.noFace.clear",
                        "Make sure the face is clearly visible in the image"
                      )}
                    </li>
                    <li>
                      {t(
                        "error.noFace.lighting",
                        "Improve lighting conditions"
                      )}
                    </li>
                    <li>
                      {t(
                        "error.noFace.distance",
                        "Position the face closer to the camera"
                      )}
                    </li>
                  </>
                )}

                {isServerError && (
                  <>
                    <li>
                      {t("error.server.refresh", "Try refreshing the page")}
                    </li>
                    <li>
                      {t(
                        "error.server.later",
                        "Try again later when the server may be less busy"
                      )}
                    </li>
                    <li>
                      {t(
                        "error.server.support",
                        "Contact support if the problem persists"
                      )}
                    </li>
                  </>
                )}

                {/* Default suggestions */}
                {!isTimeout &&
                  !faceDetectedButNotRecognized &&
                  !apiError.includes("No face") &&
                  !isServerError && (
                    <>
                      <li>
                        {t(
                          "error.general.tryAgain",
                          "Try again with a different photo"
                        )}
                      </li>
                      <li>
                        {t(
                          "error.general.clearFace",
                          "Ensure the face is clearly visible with good lighting"
                        )}
                      </li>
                      <li>
                        {t(
                          "error.general.refresh",
                          "Refresh the page and try again"
                        )}
                      </li>
                    </>
                  )}
              </ul>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ErrorDisplay;
