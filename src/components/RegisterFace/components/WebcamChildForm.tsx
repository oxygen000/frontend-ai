import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { useTranslation } from "react-i18next";
import { FiCamera, FiRefreshCw } from "react-icons/fi";

interface WebcamChildFormProps {
  nameRef: React.RefObject<HTMLInputElement | null>;
  employeeIdRef: React.RefObject<HTMLInputElement | null>;
  guardianNameRef: React.RefObject<HTMLInputElement | null>;
  dobRef: React.RefObject<HTMLInputElement | null>;
  physicalDescRef: React.RefObject<HTMLTextAreaElement | null>;
  lastClothesRef: React.RefObject<HTMLTextAreaElement | null>;
  lastSeenTimeRef: React.RefObject<HTMLInputElement | null>;
  areaDisappearanceRef: React.RefObject<HTMLInputElement | null>;
  departmentRef: React.RefObject<HTMLInputElement | null>;
  guardianPhoneRef: React.RefObject<HTMLInputElement | null>;
  guardianIdRef: React.RefObject<HTMLInputElement | null>;
  addressRef: React.RefObject<HTMLTextAreaElement | null>;
  webcamCapture: string | null;
  handleCaptureChange: (capture: string | null) => void;
  useMultiAngle: boolean;
  setUseMultiAngle: (value: boolean) => void;
  loading: boolean;
  handleSubmit: (event: React.FormEvent) => void;
  validateSectionChange: () => boolean;
}

const WebcamChildForm: React.FC<WebcamChildFormProps> = ({
  nameRef,
  employeeIdRef,
  guardianNameRef,
  dobRef,
  physicalDescRef,
  lastClothesRef,
  lastSeenTimeRef,
  areaDisappearanceRef,
  departmentRef,
  guardianPhoneRef,
  guardianIdRef,
  addressRef,
  webcamCapture,
  handleCaptureChange,
  useMultiAngle,
  setUseMultiAngle,
  loading,
  handleSubmit,
  validateSectionChange,
}) => {
  const { t } = useTranslation("register");
  const webcamRef = useRef<Webcam>(null);
  const [currentSection, setCurrentSection] = useState<number>(1);
  const [cameraFacingMode, setCameraFacingMode] = useState<
    "user" | "environment"
  >("user");

  // Toggle camera facing mode
  const toggleCameraFacing = () => {
    setCameraFacingMode((prev) => (prev === "user" ? "environment" : "user"));
  };

  // Capture photo from webcam
  const captureWebcamPhoto = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      handleCaptureChange(imageSrc);
    }
  }, [handleCaptureChange]);

  // Reset captured photo
  const resetCapture = () => {
    handleCaptureChange(null);
  };

  // Section navigation
  const nextSection = () => {
    if (currentSection < 3) {
      if (currentSection === 1 && !validateSectionChange()) {
        return;
      }
      setCurrentSection(currentSection + 1);
    }
  };

  const prevSection = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const indicatorClasses = (sectionNum: number) => {
    if (currentSection === sectionNum) {
      return "bg-yellow-600 text-white";
    } else if (currentSection > sectionNum) {
      return "bg-yellow-200 text-yellow-800";
    } else {
      return "bg-gray-200 text-gray-600";
    }
  };

  // Add a useEffect to ensure inputs are preserved even when navigating away
  useEffect(() => {
    // Create a function that will save any field to localStorage
    const createInputHandler = (
      ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>,
      storageKey: string
    ) => {
      if (!ref.current) return;

      const element = ref.current;

      const handleInput = () => {
        const value = element?.value?.trim();
        if (value) {
          localStorage.setItem(storageKey, value);
        }
      };

      element.addEventListener("input", handleInput);

      // Check if there's a saved value and restore it
      const savedValue = localStorage.getItem(storageKey);
      if (savedValue && !element.value.trim()) {
        element.value = savedValue;
      }

      return () => {
        element.removeEventListener("input", handleInput);
      };
    };

    // Create handlers for important fields
    const cleanups = [
      createInputHandler(nameRef, "childName"),
      createInputHandler(employeeIdRef, "childNationalId"),
      createInputHandler(dobRef, "childDob"),
      createInputHandler(lastClothesRef, "childLastClothes"),
      createInputHandler(lastSeenTimeRef, "childLastSeen"),
      createInputHandler(departmentRef, "childDepartment"),
      createInputHandler(physicalDescRef, "childPhysicalDesc"),
      createInputHandler(areaDisappearanceRef, "childAreaDisappearance"),
      createInputHandler(guardianPhoneRef, "guardianPhone"),
      createInputHandler(guardianIdRef, "guardianId"),
      createInputHandler(addressRef, "childAddress"),
      createInputHandler(guardianNameRef, "guardianName"),
    ].filter(Boolean);

    // Clean up all listeners
    return () => {
      cleanups.forEach((cleanup) => cleanup && cleanup());
    };
  }, [
    nameRef,
    employeeIdRef,
    dobRef,
    lastClothesRef,
    lastSeenTimeRef,
    departmentRef,
    physicalDescRef,
    areaDisappearanceRef,
    guardianPhoneRef,
    guardianIdRef,
    addressRef,
    guardianNameRef,
  ]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <h2 className="text-lg font-semibold text-yellow-800">
          {t("form.childTitle", "Child Registration")}
        </h2>
        <p className="text-sm text-yellow-700">
          {t(
            "form.childInfo",
            "Please provide information about the child being registered."
          )}
        </p>
      </div>

      {/* Section indicators */}
      <div className="flex justify-between mb-4">
        {[1, 2, 3].map((num) => (
          <React.Fragment key={num}>
            {num > 1 && (
              <div className="flex-1 h-1 self-center mx-2 bg-gray-200">
                <div
                  className={`h-full bg-yellow-600 ${
                    currentSection >= num ? "w-full" : "w-0"
                  } transition-width duration-300`}
                ></div>
              </div>
            )}
            <div
              className={`rounded-full h-8 w-8 flex items-center justify-center cursor-pointer ${indicatorClasses(
                num
              )}`}
              onClick={() => {
                // Allow clicking on completed sections or the next section
                if (num <= currentSection || num === currentSection + 1) {
                  setCurrentSection(num);
                }
              }}
            >
              {num}
            </div>
          </React.Fragment>
        ))}
      </div>

      {/* Section 1: Basic Child Information */}
      {currentSection === 1 && (
        <>
          <div>
            <label className="block font-medium mb-1">
              {t("form.childName", "Child's Name")}
            </label>
            <input
              type="text"
              ref={nameRef}
              placeholder={t("form.childNamePlaceholder", "Enter child's name")}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {t("form.nationalId", "National ID Number")}
            </label>
            <input
              type="text"
              ref={employeeIdRef}
              placeholder={t(
                "form.nationalIdPlaceholder",
                "Enter national ID number"
              )}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {t("form.childDOB", "Date of Birth")}
            </label>
            <input
              type="date"
              ref={dobRef}
              className="w-full p-2 border rounded-md"
              required
            />
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={nextSection}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              {t("form.next", "Next")}
            </button>
          </div>
        </>
      )}

      {/* Section 2: Additional Information */}
      {currentSection === 2 && (
        <>
          <div>
            <label className="block font-medium mb-1">
              {t("form.department", "Associated Department")}
            </label>
            <input
              type="text"
              ref={departmentRef}
              placeholder={t(
                "form.departmentPlaceholder",
                "Enter associated department"
              )}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {t("form.lastSeen", "Last Seen (Date & Time)")}
            </label>
            <input
              type="datetime-local"
              ref={lastSeenTimeRef}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {t("form.lastClothes", "Clothes Worn")}
            </label>
            <textarea
              ref={lastClothesRef}
              placeholder={t(
                "form.lastClothesPlaceholder",
                "Describe what the child was wearing"
              )}
              required
              className="w-full p-2 border rounded-md h-24"
            />
          </div>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={prevSection}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              {t("form.previous", "Previous")}
            </button>
            <button
              type="button"
              onClick={nextSection}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              {t("form.next", "Next")}
            </button>
          </div>
        </>
      )}

      {/* Section 3: Webcam Capture and Submit */}
      {currentSection === 3 && (
        <>
          <div>
            <label className="block font-medium mb-1">
              {t("form.physicalDesc", "Physical Description")}
            </label>
            <textarea
              ref={physicalDescRef}
              placeholder={t(
                "form.physicalDescPlaceholder",
                "Height, weight, eye color, hair color, distinguishing features"
              )}
              className="w-full p-2 border rounded-md h-20"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {t("form.areaDisappearance", "Location Details")}
            </label>
            <input
              type="text"
              ref={areaDisappearanceRef}
              placeholder={t(
                "form.areaDisappearancePlaceholder",
                "Location details if applicable"
              )}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="mb-8 mt-4">
            <label className="block font-medium mb-2">
              {t("form.capturePhoto", "Capture Photo")}
            </label>

            {!webcamCapture ? (
              <div className="relative">
                <Webcam
                  audio={false}
                  ref={webcamRef}
                  screenshotFormat="image/jpeg"
                  videoConstraints={{
                    facingMode: cameraFacingMode,
                    width: 640,
                    height: 480,
                  }}
                  className="w-full h-auto rounded-lg border"
                />
                <div className="absolute bottom-4 left-0 right-0 flex justify-center space-x-4">
                  <button
                    type="button"
                    onClick={captureWebcamPhoto}
                    className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded-lg shadow flex items-center"
                  >
                    <FiCamera className="mr-2" />
                    {t("form.capturePhoto", "Capture Photo")}
                  </button>
                  <button
                    type="button"
                    onClick={toggleCameraFacing}
                    className="bg-gray-600 text-white px-4 py-2 rounded hover:bg-gray-700"
                  >
                    {t("form.switchCamera", "Switch Camera")}
                  </button>
                </div>
              </div>
            ) : (
              <div className="relative">
                <img
                  src={webcamCapture}
                  alt={t("form.preview", "Preview")}
                  className="w-full h-auto rounded-lg border"
                />
                <button
                  type="button"
                  onClick={resetCapture}
                  className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-2"
                  title={t("form.retakePhoto", "Retake photo")}
                >
                  <FiRefreshCw />
                </button>
              </div>
            )}
          </div>

          {/* Multi-angle training option */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="useMultiAngle"
              checked={useMultiAngle}
              onChange={(e) => setUseMultiAngle(e.target.checked)}
              className="h-4 w-4 text-yellow-600 rounded border-gray-300 focus:ring-yellow-500"
            />
            <label
              htmlFor="useMultiAngle"
              className="ml-2 text-sm text-gray-600"
            >
              {t(
                "form.useMultiAngle",
                "Train with multiple angles (Recommended)"
              )}
            </label>
          </div>

          {/* Hidden input for setting form_type to 'child' automatically */}
          <input type="hidden" name="form_type" value="child" />

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={prevSection}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              {t("form.previous", "Previous")}
            </button>
            <button
              type="submit"
              disabled={loading || !webcamCapture}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                loading || !webcamCapture
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              {loading
                ? t("form.processing", "Processing...")
                : t("form.registerChild", "Register Child")}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default WebcamChildForm;
