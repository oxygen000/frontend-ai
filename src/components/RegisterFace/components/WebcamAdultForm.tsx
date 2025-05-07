import React, { useState, useRef, useCallback, useEffect } from "react";
import Webcam from "react-webcam";
import { useTranslation } from "react-i18next";
import { FiCamera, FiRefreshCw } from "react-icons/fi";

interface WebcamAdultFormProps {
  nameRef: React.RefObject<HTMLInputElement | null>;
  employeeIdRef: React.RefObject<HTMLInputElement | null>;
  departmentRef: React.RefObject<HTMLInputElement | null>;
  roleRef: React.RefObject<HTMLInputElement | null>;
  occupationRef: React.RefObject<HTMLInputElement | null>;
  addressRef: React.RefObject<HTMLTextAreaElement | null>;
  // Additional refs for vehicle information
  vehicleNumberRef?: React.RefObject<HTMLInputElement | null>;
  licensePlateRef?: React.RefObject<HTMLInputElement | null>;
  vehicleModelRef?: React.RefObject<HTMLInputElement | null>;
  vehicleColorRef?: React.RefObject<HTMLInputElement | null>;
  chassisNumberRef?: React.RefObject<HTMLInputElement | null>;
  licenseExpirationRef?: React.RefObject<HTMLInputElement | null>;
  // Additional refs for criminal record
  caseDetailsRef?: React.RefObject<HTMLTextAreaElement | null>;
  policeStationRef?: React.RefObject<HTMLInputElement | null>;
  caseNumberRef?: React.RefObject<HTMLInputElement | null>;
  judgmentRef?: React.RefObject<HTMLInputElement | null>;
  accusationRef?: React.RefObject<HTMLInputElement | null>;
  // Additional refs for travel clearance
  travelDateRef?: React.RefObject<HTMLInputElement | null>;
  destinationRef?: React.RefObject<HTMLInputElement | null>;
  arrivalAirportRef?: React.RefObject<HTMLInputElement | null>;
  arrivalDateRef?: React.RefObject<HTMLInputElement | null>;
  flightNumberRef?: React.RefObject<HTMLInputElement | null>;
  returnDateRef?: React.RefObject<HTMLInputElement | null>;
  webcamCapture: string | null;
  handleCaptureChange: (capture: string | null) => void;
  useMultiAngle: boolean;
  setUseMultiAngle: (value: boolean) => void;
  loading: boolean;
  handleSubmit: (event: React.FormEvent) => void;
  validateSectionChange: () => boolean;
}

const WebcamAdultForm: React.FC<WebcamAdultFormProps> = ({
  nameRef,
  employeeIdRef,
  occupationRef,
  addressRef,
  vehicleNumberRef,
  licensePlateRef,
  vehicleModelRef,
  vehicleColorRef,
  chassisNumberRef,
  licenseExpirationRef,
  caseDetailsRef,
  policeStationRef,
  caseNumberRef,
  judgmentRef,
  accusationRef,
  travelDateRef,
  destinationRef,
  arrivalAirportRef,
  arrivalDateRef,
  flightNumberRef,
  returnDateRef,
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
  const [hasCriminalRecord, setHasCriminalRecord] = useState<boolean>(false);

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
    if (currentSection < 4) {
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
      return "bg-blue-600 text-white"; // Current section
    } else if (currentSection > sectionNum) {
      return "bg-green-600 text-white"; // Completed section
    } else if (sectionNum === currentSection + 1) {
      return "bg-yellow-500 text-white"; // Next section to complete
    } else {
      return "bg-gray-200"; // Future sections
    }
  };

  // Add a useEffect to ensure inputs are preserved even when navigating away
  useEffect(() => {
    // Create a function that will save any field to localStorage
    const createInputHandler = (
      ref:
        | React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
        | undefined,
      storageKey: string
    ) => {
      if (!ref || !ref.current) return;

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
      createInputHandler(occupationRef, "userOccupation"),
      createInputHandler(addressRef, "userAddress"),
      createInputHandler(vehicleNumberRef, "userVehicleNumber"),
      createInputHandler(licensePlateRef, "userLicensePlate"),
      createInputHandler(vehicleModelRef, "userVehicleModel"),
      createInputHandler(vehicleColorRef, "userVehicleColor"),
      createInputHandler(chassisNumberRef, "userChassisNumber"),
      createInputHandler(licenseExpirationRef, "userLicenseExpiration"),
      createInputHandler(travelDateRef, "userTravelDate"),
      createInputHandler(destinationRef, "userTravelDestination"),
      createInputHandler(arrivalAirportRef, "userArrivalAirport"),
      createInputHandler(arrivalDateRef, "userArrivalDate"),
      createInputHandler(flightNumberRef, "userFlightNumber"),
      createInputHandler(returnDateRef, "userReturnDate"),
    ].filter(Boolean);

    // Clean up all listeners
    return () => {
      cleanups.forEach((cleanup) => cleanup && cleanup());
    };
  }, [
    occupationRef,
    addressRef,
    vehicleNumberRef,
    licensePlateRef,
    vehicleModelRef,
    vehicleColorRef,
    chassisNumberRef,
    licenseExpirationRef,
    travelDateRef,
    destinationRef,
    arrivalAirportRef,
    arrivalDateRef,
    flightNumberRef,
    returnDateRef,
  ]);

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
        <h2 className="text-lg font-semibold text-blue-800">
          {t("form.adultTitle", "Adult Registration")}
        </h2>
        <p className="text-sm text-blue-700">
          {t(
            "form.adultInfo",
            "Please provide information about the person being registered."
          )}
        </p>
      </div>

      {/* Section indicators */}
      <div className="flex justify-between mb-4">
        {[1, 2, 3, 4].map((num) => (
          <React.Fragment key={num}>
            {num > 1 && (
              <div className="flex-1 h-1 self-center mx-2 bg-gray-200">
                <div
                  className={`h-full bg-blue-600 ${
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

      {/* Section 1: Basic Information and Name */}
      {currentSection === 1 && (
        <>
          <div>
            <label className="block font-medium mb-1">
              {t("form.manName", "Full Name")}
            </label>
            <input
              type="text"
              ref={nameRef}
              placeholder={t("form.namePlaceholder", "Enter full name")}
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {t("form.manEmployeeId", "Employee ID")}
            </label>
            <input
              type="text"
              ref={employeeIdRef}
              placeholder={t("form.employeeIdPlaceholder", "Enter employee ID")}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {t("form.occupation", "Occupation")}
            </label>
            <input
              type="text"
              ref={occupationRef}
              placeholder={t("form.occupationPlaceholder", "Enter occupation")}
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {t("form.address", "Address")}
            </label>
            <textarea
              ref={addressRef}
              placeholder={t(
                "form.addressPlaceholder",
                "Enter complete address"
              )}
              className="w-full p-2 border rounded-md h-24"
            />
          </div>

          <div className="flex justify-end mt-4">
            <button
              type="button"
              onClick={nextSection}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t("form.next", "Next")}
            </button>
          </div>
        </>
      )}

      {/* Section 2: Vehicle Information */}
      {currentSection === 2 && (
        <>
          <h3 className="text-lg font-semibold mb-3 text-blue-700">
            {t("form.vehicleInfo", "Vehicle Information")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">
                {t("form.licensePlate", "License Plate Number")}
              </label>
              <input
                type="text"
                ref={licensePlateRef}
                placeholder={t(
                  "form.licensePlatePlaceholder",
                  "Enter license plate"
                )}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t("form.vehicleModel", "Vehicle Model")}
              </label>
              <input
                type="text"
                ref={vehicleModelRef}
                placeholder={t("form.vehicleModelPlaceholder", "Enter model")}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t("form.vehicleColor", "Vehicle Color")}
              </label>
              <input
                type="text"
                ref={vehicleColorRef}
                placeholder={t("form.vehicleColorPlaceholder", "Enter color")}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t("form.chassisNumber", "Chassis Number")}
              </label>
              <input
                type="text"
                ref={chassisNumberRef}
                placeholder={t(
                  "form.chassisNumberPlaceholder",
                  "Enter chassis number"
                )}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t("form.vehicleNumber", "Vehicle Number")}
              </label>
              <input
                type="text"
                ref={vehicleNumberRef}
                placeholder={t(
                  "form.vehicleNumberPlaceholder",
                  "Enter vehicle number"
                )}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t("form.licenseExpiration", "License Expiration Date")}
              </label>
              <input
                type="date"
                ref={licenseExpirationRef}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={prevSection}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              {t("form.previous", "Back")}
            </button>
            <button
              type="button"
              onClick={nextSection}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t("form.next", "Next")}
            </button>
          </div>
        </>
      )}

      {/* Section 3: Criminal Record */}
      {currentSection === 3 && (
        <>
          <h3 className="text-lg font-semibold mb-3 text-blue-700">
            {t("form.criminalRecord", "Criminal Record")}
          </h3>

          <div className="mb-4">
            <label className="inline-flex items-center">
              <input
                type="checkbox"
                checked={hasCriminalRecord}
                onChange={(e) => setHasCriminalRecord(e.target.checked)}
                className="form-checkbox h-5 w-5 text-blue-600"
              />
              <span className="ml-2">
                {t("form.hasCriminalRecord", "Has criminal record")}
              </span>
            </label>
          </div>

          {hasCriminalRecord && (
            <div className="space-y-4 border-l-4 border-blue-500 pl-4 py-2 bg-blue-50">
              <div>
                <label className="block font-medium mb-1">
                  {t("form.caseDetails", "Case Details")}
                </label>
                <textarea
                  ref={caseDetailsRef}
                  placeholder={t(
                    "form.caseDetailsPlaceholder",
                    "Enter case details"
                  )}
                  className="w-full p-2 border rounded-md h-20"
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block font-medium mb-1">
                    {t("form.policeStation", "Police Station")}
                  </label>
                  <input
                    type="text"
                    ref={policeStationRef}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    {t("form.caseNumber", "Case Number")}
                  </label>
                  <input
                    type="text"
                    ref={caseNumberRef}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    {t("form.judgment", "Judgment")}
                  </label>
                  <input
                    type="text"
                    ref={judgmentRef}
                    className="w-full p-2 border rounded-md"
                  />
                </div>

                <div>
                  <label className="block font-medium mb-1">
                    {t("form.accusation", "Accusation")}
                  </label>
                  <input
                    type="text"
                    ref={accusationRef}
                    className="w-full p-2 border rounded-md"
                  />
                </div>
              </div>
            </div>
          )}
          <div className="mt-8 mb-6">
            <h3 className="text-lg font-semibold mb-3 text-blue-700">
              {t("form.capturePhoto", "Capture Photo")}
            </h3>

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
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg shadow flex items-center"
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
          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={prevSection}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              {t("form.previous", "Back")}
            </button>
            <button
              type="button"
              onClick={nextSection}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              {t("form.next", "Next")}
            </button>
          </div>
        </>
      )}

      {/* Section 4: Webcam Capture, Travel Clearance and Submit */}
      {currentSection === 4 && (
        <>
          <h3 className="text-lg font-semibold mb-3 text-blue-700">
            {t("form.travelInfo", "Travel Clearance")}
          </h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block font-medium mb-1">
                {t("form.travelDate", "Travel Date")}
              </label>
              <input
                type="date"
                ref={travelDateRef}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t("form.travelDestination", "Travel Destination")}
              </label>
              <input
                type="text"
                ref={destinationRef}
                placeholder={t(
                  "form.travelDestinationPlaceholder",
                  "Destination country"
                )}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t("form.arrivalAirport", "Arrival Airport")}
              </label>
              <input
                type="text"
                ref={arrivalAirportRef}
                placeholder={t(
                  "form.arrivalAirportPlaceholder",
                  "Enter airport name"
                )}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t("form.flightNumber", "Flight Number")}
              </label>
              <input
                type="text"
                ref={flightNumberRef}
                placeholder={t("form.flightNumberPlaceholder", "e.g. MS123")}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t("form.arrivalDate", "Arrival Date")}
              </label>
              <input
                type="date"
                ref={arrivalDateRef}
                className="w-full p-2 border rounded-md"
              />
            </div>

            <div>
              <label className="block font-medium mb-1">
                {t("form.returnDate", "Return Date")}
              </label>
              <input
                type="date"
                ref={returnDateRef}
                className="w-full p-2 border rounded-md"
              />
            </div>
          </div>

          {/* Multi-angle training option */}
          <div className="mb-4 flex items-center">
            <input
              type="checkbox"
              id="useMultiAngle"
              checked={useMultiAngle}
              onChange={(e) => setUseMultiAngle(e.target.checked)}
              className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
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
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? t("form.processing", "Processing...")
                : t("form.submit", "Register Face")}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default WebcamAdultForm;
