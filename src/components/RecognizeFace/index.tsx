import React, { useState, useRef, useCallback, useEffect } from "react";
import { useTranslation } from "react-i18next";
import Webcam from "react-webcam";
import api from "../../services/api";
import { RecognizeResponse } from "./types";
import { User } from "../../types";
import CaptureModeButtons from "./components/CaptureModeButtons";
import WebcamCapture from "./components/WebcamCapture";
import FileUpload from "./components/FileUpload";
import FaceRecognitionResults from "./components/FaceRecognitionResults";
import ErrorDisplay from "./ErrorDisplay";
import { getUserImageUrl } from "../users/utils/formatters";
import { Link } from "react-router-dom";
import { dataUrlToFile } from "./hooks/imageUtils";

// Extended API response type to handle both response formats
interface ExtendedRecognizeResponse extends RecognizeResponse {
  user_id?: string;
  username?: string;
  confidence?: number;
  message?: string;
}

// Extend the Webcam type to include srcObject
interface ExtendedWebcam extends Webcam {
  srcObject?: MediaStream | null;
}

const RecognizeFace: React.FC = () => {
  const { t } = useTranslation("recognize");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<RecognizeResponse | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [captureMode, setCaptureMode] = useState<"upload" | "webcam" | "multi">(
    "upload"
  );
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);
  const [multiCaptures, setMultiCaptures] = useState<string[]>([]);
  const [webcamActive, setWebcamActive] = useState<boolean>(false);

  const webcamRef = useRef<ExtendedWebcam | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const videoConstraints = {
    width: 500,
    height: 375,
    facingMode: "user",
  };

  useEffect(() => {
    if (captureMode === "multi" && !webcamRef.current) {
      setCaptureMode("multi");
    }
  }, [captureMode]);

  const captureMultiple = useCallback(() => {
    if (!webcamRef.current) {
      setApiError(
        t("error.webcamNotReady", "Webcam is not ready. Please try again.")
      );
      return;
    }

    const captures: string[] = [];
    setMultiCaptures([]);
    setResult(null);
    setApiError(null);

    const takeSnapshot = (index: number) => {
      const imageSrc = webcamRef.current?.getScreenshot();
      if (imageSrc) {
        captures.push(imageSrc);
        setMultiCaptures([...captures]);
      } else {
        setApiError(
          t("error.captureFailure", "Failed to capture image from webcam")
        );
      }

      if (index < 2) {
        setTimeout(() => takeSnapshot(index + 1), 1000);
      }
    };

    takeSnapshot(0);
  }, [t]);

  const handleImageChange = (
    file: File | null,
    imagePreviewUrl: string | null
  ) => {
    setSelectedFile(file);
    setPreviewUrl(imagePreviewUrl);
    setResult(null);
    setApiError(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    try {
      setLoading(true);

      // Handle different capture modes
      if (captureMode === "multi" && multiCaptures.length > 0) {
        await handleMultiCaptureSubmit();
        return;
      }

      if (!selectedFile && previewUrl) {
        // Convert webcam data URL to file
        const filename = `webcam-${Date.now()}.jpg`;
        const file = await dataUrlToFile(previewUrl, filename);
        setSelectedFile(file);

        // Process directly
        handleImageRecognition(file);
      } else if (selectedFile) {
        // Process directly
        handleImageRecognition(selectedFile);
      } else {
        setApiError(t("errors.noImage"));
      }
    } catch (error: Error | unknown) {
      console.error("Error in handleSubmit:", error);
      setApiError(error instanceof Error ? error.message : t("errors.unknown"));
    }
  };

  const handleMultiCaptureSubmit = async () => {
    try {
      setLoading(true);

      if (multiCaptures.length === 0) {
        setApiError(
          t(
            "errors.noCaptures",
            "No captures available for multi-angle recognition"
          )
        );
        setLoading(false);
        return;
      }

      // Process the first capture as primary
      const primaryCapture = multiCaptures[0];
      const primaryFile = await dataUrlToFile(
        primaryCapture,
        `webcam-multi-${Date.now()}.jpg`
      );

      // Process directly using single image for speed
      await handleImageRecognition(primaryFile);
    } catch (error: Error | unknown) {
      console.error("Error in multi-capture submission:", error);
      setApiError(error instanceof Error ? error.message : t("errors.unknown"));
      setLoading(false);
    }
  };

  // Separate function to handle image recognition
  const handleImageRecognition = async (imageFile: File) => {
    try {
      setLoading(true);

      // Use file upload directly which is faster
      const response = await api.recognizeFace(imageFile, {
        preferMethod: "file",
        useMultiAngle: true,
      });

      // Store the response in the result state with proper typing
      const typedResponse = response as ExtendedRecognizeResponse;
      setResult(typedResponse);

      if (typedResponse.recognized) {
        // User recognized successfully
        onRecognitionSuccess?.({
          userId: typedResponse.user_id || typedResponse.user?.id || "",
          username: typedResponse.username || typedResponse.user?.name || "",
          confidence: typedResponse.confidence || 0,
        });
      } else {
        // Not recognized or error
        setApiError(typedResponse.message || t("errors.notRecognized"));
        onRecognitionFailure?.(typedResponse.message);
      }
    } catch (error: Error | unknown) {
      console.error("Recognition failed:", error);
      setApiError(error instanceof Error ? error.message : t("errors.unknown"));
    } finally {
      setLoading(false);
    }
  };

  const resetState = () => {
    setPreviewUrl(null);
    setSelectedFile(null);
    setResult(null);
    setApiError(null);
    setMultiCaptures([]);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Stop webcam when component unmounts
  useEffect(() => {
    // Store current ref value inside the effect
    const webcamCurrent = webcamRef.current;

    return () => {
      if (webcamCurrent?.srcObject) {
        const stream = webcamCurrent.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, []);

  // Clean up webcam when mode changes
  useEffect(() => {
    // Store current ref value inside the effect
    const webcamCurrent = webcamRef.current;

    if (captureMode !== "webcam" && webcamActive) {
      if (webcamCurrent?.srcObject) {
        const stream = webcamCurrent.srcObject as MediaStream;
        stream.getTracks().forEach((track) => track.stop());
        webcamCurrent.srcObject = null;
      }
      setWebcamActive(false);
    }
  }, [captureMode, webcamActive]);

  // Define missing functions/variables
  const onRecognitionSuccess = (data: {
    userId: string;
    username: string;
    confidence: number;
  }) => {
    console.log("Recognition successful:", data);
  };
  const onRecognitionFailure = (error: string | undefined) => {
    console.error("Recognition failed:", error);
  };

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4 text-white">
          <h1 className="text-3xl font-bold text-center">
            {t("title", "Face Recognition")}
          </h1>
          <h2 className="text-xl font-semibold text-center mt-2 text-blue-100">
            {t(
              "description",
              "Upload a photo or take a snapshot to identify a registered person."
            )}
          </h2>
        </div>

        <div className="p-6">
          <CaptureModeButtons
            captureMode={captureMode}
            setCaptureMode={setCaptureMode}
            resetState={resetState}
            t={t}
          />

          <form onSubmit={handleSubmit} className="space-y-6">
            {captureMode === "upload" ? (
              <FileUpload
                onImageChange={handleImageChange}
                previewUrl={previewUrl}
                t={t}
              />
            ) : captureMode === "webcam" ? (
              <WebcamCapture
                webcamRef={webcamRef}
                previewUrl={previewUrl}
                videoConstraints={videoConstraints}
                captureFromWebcam={() =>
                  setPreviewUrl(webcamRef.current?.getScreenshot() || null)
                }
                resetState={resetState}
                t={t}
              />
            ) : (
              <>
                <div className="mb-4">
                  <Webcam
                    audio={false}
                    height={375}
                    ref={webcamRef}
                    screenshotFormat="image/jpeg"
                    width={500}
                    videoConstraints={videoConstraints}
                    className="w-full rounded-lg shadow-md mx-auto"
                  />
                </div>
                <FaceRecognitionResults
                  multiCaptures={multiCaptures}
                  captureMultiple={captureMultiple}
                  t={t}
                />
              </>
            )}

            {apiError && <ErrorDisplay error={apiError} />}

            {/* Display recognition results when available */}
            {result && (
              <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                <h3 className="text-lg font-semibold mb-2">
                  {result.recognized
                    ? t("recognize.result.title", "Face Recognized!")
                    : t("recognize.error.notRecognized", "Face not recognized")}
                </h3>

                {/* Show user info whether from user property or direct properties */}
                {result.recognized && (
                  <Link
                    to={`/users/${
                      result.user?.id ||
                      (result as ExtendedRecognizeResponse).user_id
                    }`}
                  >
                    <div className="space-y-2">
                      {/* User image */}
                      <div>
                        <img
                          src={
                            result.user?.image ||
                            getUserImageUrl(
                              result.user ||
                                ({
                                  id: (result as ExtendedRecognizeResponse)
                                    .user_id,
                                  name: (result as ExtendedRecognizeResponse)
                                    .username,
                                  created_at: new Date().toISOString(),
                                } as User),
                              api.getServerUrl()
                            )
                          }
                          alt={
                            result.user?.name ||
                            (result as ExtendedRecognizeResponse).username ||
                            "Recognized User"
                          }
                          className="w-32 h-32 object-cover rounded-full border border-gray-300 mb-2"
                          onError={(e) => {
                            (
                              e.target as HTMLImageElement
                            ).src = `${api.getServerUrl()}/static/default-avatar.png`;
                          }}
                        />
                      </div>

                      <p>
                        <span className="font-medium">
                          {t("recognize.result.name", "Name:")}
                        </span>{" "}
                        {result.user?.name ||
                          (result as ExtendedRecognizeResponse).username ||
                          "Unknown User"}
                      </p>
                      {result.user?.employee_id && (
                        <p>
                          <span className="font-medium">
                            {t("recognize.result.id", "Employee ID:")}
                          </span>{" "}
                          {result.user.employee_id}
                        </p>
                      )}
                      {result.user?.department && (
                        <p>
                          <span className="font-medium">
                            {t("recognize.result.department", "Department:")}
                          </span>{" "}
                          {result.user.department}
                        </p>
                      )}
                      {result.user?.role && (
                        <p>
                          <span className="font-medium">
                            {t("recognize.result.role", "Role:")}
                          </span>{" "}
                          {result.user.role}
                        </p>
                      )}
                      <p>
                        <span className="font-medium">
                          {t("recognize.result.confidence", "Confidence:")}
                        </span>{" "}
                        {(
                          ((result as ExtendedRecognizeResponse).confidence ||
                            0) * 100
                        ).toFixed(2)}
                        %
                      </p>
                    </div>
                  </Link>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={
                loading ||
                (captureMode === "webcam" && !previewUrl) ||
                (captureMode === "upload" && !selectedFile) ||
                (captureMode === "multi" && multiCaptures.length === 0)
              }
              className={`w-full py-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg shadow-lg hover:bg-blue-500 focus:outline-none ${
                loading ||
                (captureMode === "webcam" && !previewUrl) ||
                (captureMode === "upload" && !selectedFile) ||
                (captureMode === "multi" && multiCaptures.length === 0)
                  ? "opacity-50 cursor-not-allowed"
                  : ""
              }`}
            >
              {loading
                ? t("recognize.processing", "Processing...")
                : t("recognize.submit", "Submit")}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecognizeFace;
