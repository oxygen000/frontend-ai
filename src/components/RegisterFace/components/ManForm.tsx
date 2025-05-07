import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ImagePreview from "../../common/ImagePreview";

interface ManFormProps {
  nameRef: React.RefObject<HTMLInputElement | null>;
  employeeIdRef: React.RefObject<HTMLInputElement | null>;
  occupationRef: React.RefObject<HTMLInputElement | null>;
  addressRef: React.RefObject<HTMLTextAreaElement | null>;
  vehicleNumberRef: React.RefObject<HTMLInputElement | null>;
  licensePlateRef: React.RefObject<HTMLInputElement | null>;
  vehicleModelRef: React.RefObject<HTMLInputElement | null>;
  vehicleColorRef: React.RefObject<HTMLInputElement | null>;
  chassisNumberRef: React.RefObject<HTMLInputElement | null>;
  licenseExpirationRef: React.RefObject<HTMLInputElement | null>;
  caseDetailsRef: React.RefObject<HTMLTextAreaElement | null>;
  policeStationRef: React.RefObject<HTMLInputElement | null>;
  caseNumberRef: React.RefObject<HTMLInputElement | null>;
  judgmentRef: React.RefObject<HTMLInputElement | null>;
  accusationRef: React.RefObject<HTMLInputElement | null>;
  travelDateRef: React.RefObject<HTMLInputElement | null>;
  destinationRef: React.RefObject<HTMLInputElement | null>;
  arrivalAirportRef: React.RefObject<HTMLInputElement | null>;
  arrivalDateRef: React.RefObject<HTMLInputElement | null>;
  flightNumberRef: React.RefObject<HTMLInputElement | null>;
  returnDateRef: React.RefObject<HTMLInputElement | null>;
  handleFileSelect: (file: File | null, previewUrl: string | null) => void;
  previewUrl: string;
  loading: boolean;
  handleSubmit: (event: React.FormEvent) => void;
}

const ManForm: React.FC<ManFormProps> = ({
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
  handleFileSelect,
  previewUrl,
  loading,
  handleSubmit,
}) => {
  const { t } = useTranslation("register");
  const [currentSection, setCurrentSection] = useState<number>(1);
  const [hasCriminalRecord, setHasCriminalRecord] = useState<boolean>(false);

  const nextSection = () => {
    if (currentSection < 4) {
      // Add debug logging
      console.log(
        `Trying to move from section ${currentSection} to ${currentSection + 1}`
      );

      // When moving from section 1, ensure name is provided
      if (currentSection === 1) {
        // Get name value directly - don't rely on validateSectionChange
        const nameValue = nameRef.current?.value?.trim();

        if (!nameValue) {
          console.log("Name validation failed - cannot proceed");
          alert("Please enter your full name to continue");
          // Focus on name field
          nameRef.current?.focus();
          return;
        }

        // Explicitly save the name to localStorage before moving sections
        localStorage.setItem("userName", nameValue);

        console.log(
          `Name validation passed: "${nameValue}", moving to section ${
            currentSection + 1
          }`
        );
        setCurrentSection(currentSection + 1);
      } else {
        // For other sections, allow moving forward without validation
        console.log(
          `Moving to section ${currentSection + 1} without validation`
        );
        setCurrentSection(currentSection + 1);
      }
    }
  };

  const prevSection = () => {
    if (currentSection > 1) {
      setCurrentSection(currentSection - 1);
    }
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("ManForm - Submitting form from section:", currentSection);

    // Force retrieve the current name value from both the nameRef and localStorage
    let nameValue = nameRef?.current?.value?.trim() || "";

    // Double-check localStorage as a fallback
    if (!nameValue) {
      const savedName = localStorage.getItem("userName");
      if (savedName) {
        nameValue = savedName;
        // Update the input field if it's empty but we found a value in localStorage
        if (nameRef.current) {
          nameRef.current.value = savedName;
        }
      }
    }

    console.log("ManForm nameRef value for submission:", nameValue);

    // Name validation check
    if (!nameValue) {
      console.error("Name is still required for submission");
      alert("Please provide your name before submitting");
      // Navigate back to section 1 to fix the name
      setCurrentSection(1);
      // Focus the name field
      setTimeout(() => nameRef.current?.focus(), 100);
      return;
    }

    // Now that we've validated the name directly, we can proceed
    if (currentSection === 4) {
      // If we're in the final section and name is valid, submit the form
      console.log(
        "ManForm - Form validated, calling parent submit handler with valid name:",
        nameValue
      );
      handleSubmit(e);
    } else {
      // If not in section 4, move to the last section
      console.log("ManForm - Not in section 4, moving to section 4");
      setCurrentSection(4);
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

  // Add an effect to set a placeholder name for testing if in development
  useEffect(() => {
    console.log("ManForm mounted, checking nameRef");

    // Check for saved name in localStorage when component mounts
    if (nameRef.current && !nameRef.current.value.trim()) {
      const savedName = localStorage.getItem("userName");
      if (savedName) {
        nameRef.current.value = savedName;
        console.log("Loaded saved name from localStorage:", savedName);
      }
    }

    // If nameRef exists but is empty, focus on it
    if (nameRef.current && !nameRef.current.value.trim()) {
      console.log("Focusing on name field");
      // Focus on the name input to help the user
      if (currentSection === 1) {
        nameRef.current.focus();
      }
    }

    // Log nameRef status for debugging
    console.log("Current nameRef value:", nameRef.current?.value);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentSection]);

  // Add a new useEffect to persist the name in localStorage when it changes
  useEffect(() => {
    // Only run when nameRef is available
    if (nameRef.current) {
      // Save current ref value to a variable to use in cleanup
      const nameInputElement = nameRef.current;

      // First, try to load the saved name from localStorage when component mounts
      const savedName = localStorage.getItem("userName");
      if (savedName && !nameInputElement.value.trim()) {
        nameInputElement.value = savedName;
        console.log("Initialized name from localStorage:", savedName);
      }

      // Set up a change listener to save the name when it changes
      const handleNameChange = () => {
        const name = nameInputElement?.value?.trim();
        if (name) {
          console.log("Saving name to localStorage:", name);
          localStorage.setItem("userName", name);
        }
      };

      // Also set up an input listener to update in real-time
      const handleNameInput = () => {
        const name = nameInputElement?.value?.trim();
        if (name) {
          localStorage.setItem("userName", name);
        }
      };

      // Attach the listeners
      nameInputElement.addEventListener("change", handleNameChange);
      nameInputElement.addEventListener("input", handleNameInput);

      // Clean up
      return () => {
        nameInputElement.removeEventListener("change", handleNameChange);
        nameInputElement.removeEventListener("input", handleNameInput);
      };
    }
  }, [nameRef]);

  // Add a listener for input changes to keep localStorage updated for key fields
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
    <form onSubmit={handleFormSubmit} className="space-y-4">
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

      {/* Section 1: Personal Information */}
      {currentSection === 1 && (
        <>
          <div>
            <label className="block font-medium mb-1">
              {t("form.manName", "Full Name")}
            </label>
            <input
              type="text"
              ref={nameRef}
              placeholder={t("form.namePlaceholder", "Enter full name") || ""}
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
              placeholder={
                t("form.employeeIdPlaceholder", "Enter employee ID") || ""
              }
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
              placeholder={
                t("form.occupationPlaceholder", "Enter occupation") || ""
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {t("form.address", "Address")}
            </label>
            <textarea
              ref={addressRef}
              placeholder={
                t("form.addressPlaceholder", "Enter complete address") || ""
              }
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
                placeholder={
                  t("form.licensePlatePlaceholder", "Enter license plate") || ""
                }
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
                placeholder={
                  t("form.vehicleModelPlaceholder", "Enter model") || ""
                }
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
                placeholder={
                  t("form.vehicleColorPlaceholder", "Enter color") || ""
                }
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
                placeholder={
                  t("form.chassisNumberPlaceholder", "Enter chassis number") ||
                  ""
                }
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
                placeholder={
                  t("form.vehicleNumberPlaceholder", "Enter vehicle number") ||
                  ""
                }
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

      {/* Section 3: Criminal Record and Photo */}
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
                  placeholder={
                    t("form.caseDetailsPlaceholder", "Enter case details") || ""
                  }
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

          <ImagePreview
            onImageChange={(file, previewUrl) =>
              handleFileSelect(file, previewUrl)
            }
            previewUrl={previewUrl}
            placeholderText={
              t("form.photoPlaceholder", "Upload face photo") || ""
            }
            acceptedFormats="image/*"
            required
          />

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

      {/* Section 4: Travel Clearance */}
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
                placeholder={
                  t(
                    "form.travelDestinationPlaceholder",
                    "Destination country"
                  ) || ""
                }
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
                placeholder={
                  t("form.arrivalAirportPlaceholder", "Enter airport name") ||
                  ""
                }
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
                placeholder={
                  t("form.flightNumberPlaceholder", "e.g. MS123") || ""
                }
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

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={prevSection}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              {t("form.previous", "Back")}
            </button>
            <button
              type="submit"
              disabled={loading}
              onClick={() => {
                // Double check that we have a name before submitting
                let nameValue = nameRef?.current?.value?.trim() || "";

                if (!nameValue) {
                  const savedName = localStorage.getItem("userName");
                  if (savedName) {
                    nameValue = savedName;
                    // Update the input field if it's empty but we found a value in localStorage
                    if (nameRef.current) {
                      nameRef.current.value = savedName;
                    }
                  }
                }

                if (!nameValue) {
                  alert("Please provide your name before submitting");
                  setCurrentSection(1);
                  setTimeout(() => nameRef.current?.focus(), 100);
                  return false;
                }

                return true;
              }}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {loading
                ? t("form.processing", "Processing...")
                : t("form.submit", "Submit")}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default ManForm;
