import React, { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { FiArrowRight, FiArrowLeft, FiCheck } from "react-icons/fi";
import api from "../../../services/api";
import WebcamAdultForm from "./WebcamAdultForm";
import WebcamChildForm from "./WebcamChildForm";

interface WebcamFormProps {
  onSuccess?: (name: string) => void;
}

// Metadata interface for registration
interface WebcamRegisterMetadata {
  employee_id: string;
  form_type: "adult" | "child";
  department?: string;
  role?: string;
  occupation?: string;
  address?: string;
  guardian_name?: string;
  child_data?: {
    date_of_birth: string;
    physical_description: string;
    area_of_disappearance: string;
    guardian_phone: string;
    guardian_id: string;
    address: string;
  };
  train_multiple?: boolean;
  bypass_angle_check?: boolean;
  license_plate?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  chassis_number?: string;
  vehicle_number?: string;
  license_expiration?: string;
  case_details?: string;
  police_station?: string;
  case_number?: string;
  judgment?: string;
  accusation?: string;
  travel_date?: string;
  travel_destination?: string;
  arrival_airport?: string;
  arrival_date?: string;
  flight_number?: string;
  return_date?: string;
}

const WebcamForm: React.FC<WebcamFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation("register");

  // Form state
  const [formType, setFormType] = useState<"adult" | "child">("adult");
  const [webcamCapture, setWebcamCapture] = useState<string | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [useMultiAngle, setUseMultiAngle] = useState(true);
  const [bypassAngleCheck] = useState(false);

  // Common form refs
  const nameRef = useRef<HTMLInputElement>(null);
  const employeeIdRef = useRef<HTMLInputElement>(null);
  const departmentRef = useRef<HTMLInputElement>(null);
  const roleRef = useRef<HTMLInputElement>(null);
  const guardianNameRef = useRef<HTMLInputElement>(null);
  const occupationRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);

  // Child form specific refs
  const dobRef = useRef<HTMLInputElement>(null);
  const physicalDescRef = useRef<HTMLTextAreaElement>(null);
  const lastClothesRef = useRef<HTMLTextAreaElement>(null);
  const areaDisappearanceRef = useRef<HTMLInputElement>(null);
  const guardianPhoneRef = useRef<HTMLInputElement>(null);
  const guardianIdRef = useRef<HTMLInputElement>(null);
  const lastSeenTimeRef = useRef<HTMLInputElement>(null);

  // Additional refs for adult form
  const licensePlateRef = useRef<HTMLInputElement>(null);
  const vehicleModelRef = useRef<HTMLInputElement>(null);
  const vehicleColorRef = useRef<HTMLInputElement>(null);
  const chassisNumberRef = useRef<HTMLInputElement>(null);
  const vehicleNumberRef = useRef<HTMLInputElement>(null);
  const licenseExpirationRef = useRef<HTMLInputElement>(null);
  const caseDetailsRef = useRef<HTMLTextAreaElement>(null);
  const policeStationRef = useRef<HTMLInputElement>(null);
  const caseNumberRef = useRef<HTMLInputElement>(null);
  const judgmentRef = useRef<HTMLInputElement>(null);
  const accusationRef = useRef<HTMLInputElement>(null);
  const travelDateRef = useRef<HTMLInputElement>(null);
  const destinationRef = useRef<HTMLInputElement>(null);
  const arrivalAirportRef = useRef<HTMLInputElement>(null);
  const arrivalDateRef = useRef<HTMLInputElement>(null);
  const flightNumberRef = useRef<HTMLInputElement>(null);
  const returnDateRef = useRef<HTMLInputElement>(null);

  // Add a useEffect to ensure form is properly initialized
  useEffect(() => {
    // Ensure that nameRef has a value when the component mounts
    if (nameRef.current && !nameRef.current.value.trim()) {
      // Check if there's a value in localStorage that we can use
      const savedName = localStorage.getItem("userName");
      if (savedName) {
        nameRef.current.value = savedName;
        console.log("Restored name from localStorage:", savedName);
      }
    }
  }, []);

  // Add a listener for name changes to keep localStorage updated
  useEffect(() => {
    const nameInput = nameRef.current;

    if (nameInput) {
      const handleNameInput = () => {
        const nameValue = nameInput.value?.trim();
        if (nameValue) {
          localStorage.setItem("userName", nameValue);
        }
      };

      nameInput.addEventListener("input", handleNameInput);

      return () => {
        nameInput.removeEventListener("input", handleNameInput);
      };
    }
  }, []);

  const toggleFormType = () => {
    // Save form state before toggling
    console.log("Toggling form type");
    console.log("Current nameRef value:", nameRef.current?.value);

    // Save the current name to localStorage before toggling
    if (nameRef.current?.value?.trim()) {
      localStorage.setItem("userName", nameRef.current.value.trim());
    }

    // Persist form data by not clearing refs, just toggle the form type
    setFormType((prev) => (prev === "adult" ? "child" : "adult"));
    setError(null);

    // Log the change
    console.log(
      `Form type changed to: ${formType === "adult" ? "child" : "adult"}`
    );

    // Add a delayed check to see the value after state update
    setTimeout(() => {
      console.log("nameRef value after toggle:", nameRef.current?.value);

      // Ensure name is restored after toggle
      if (nameRef.current && !nameRef.current.value.trim()) {
        const savedName = localStorage.getItem("userName");
        if (savedName) {
          nameRef.current.value = savedName;
          console.log("Restored name after toggle:", savedName);
        }
      }
    }, 100);
  };

  const handleCaptureChange = (capture: string | null) => {
    setWebcamCapture(capture);
    setError(null);
  };

  const resetForm = () => {
    // Reset common fields
    if (nameRef.current) nameRef.current.value = "";
    if (employeeIdRef.current) employeeIdRef.current.value = "";
    if (departmentRef.current) departmentRef.current.value = "";
    if (roleRef.current) roleRef.current.value = "";
    if (guardianNameRef.current) guardianNameRef.current.value = "";
    if (occupationRef.current) occupationRef.current.value = "";
    if (addressRef.current) addressRef.current.value = "";

    // Reset child form fields
    if (dobRef.current) dobRef.current.value = "";
    if (physicalDescRef.current) physicalDescRef.current.value = "";
    if (lastClothesRef.current) lastClothesRef.current.value = "";
    if (areaDisappearanceRef.current) areaDisappearanceRef.current.value = "";
    if (guardianPhoneRef.current) guardianPhoneRef.current.value = "";
    if (guardianIdRef.current) guardianIdRef.current.value = "";
    if (lastSeenTimeRef.current) lastSeenTimeRef.current.value = "";

    // Reset adult form fields
    if (licensePlateRef?.current) licensePlateRef.current.value = "";
    if (vehicleModelRef?.current) vehicleModelRef.current.value = "";
    if (vehicleColorRef?.current) vehicleColorRef.current.value = "";
    if (chassisNumberRef?.current) chassisNumberRef.current.value = "";
    if (vehicleNumberRef?.current) vehicleNumberRef.current.value = "";
    if (licenseExpirationRef?.current) licenseExpirationRef.current.value = "";
    if (caseDetailsRef?.current) caseDetailsRef.current.value = "";
    if (policeStationRef?.current) policeStationRef.current.value = "";
    if (caseNumberRef?.current) caseNumberRef.current.value = "";
    if (judgmentRef?.current) judgmentRef.current.value = "";
    if (accusationRef?.current) accusationRef.current.value = "";
    if (travelDateRef?.current) travelDateRef.current.value = "";
    if (destinationRef?.current) destinationRef.current.value = "";
    if (arrivalAirportRef?.current) arrivalAirportRef.current.value = "";
    if (arrivalDateRef?.current) arrivalDateRef.current.value = "";
    if (flightNumberRef?.current) flightNumberRef.current.value = "";
    if (returnDateRef?.current) returnDateRef.current.value = "";

    setWebcamCapture(null);
    setError(null);
    setSuccess(null);
  };

  const validateSectionChange = (): boolean => {
    // Get the name value directly
    const nameValue = nameRef.current?.value || "";

    // Check if nameRef exists and has a current value
    if (!nameRef.current || !nameValue.trim()) {
      setError(t("error.nameRequired", "Name is required"));

      // Focus on the name input to help the user
      nameRef.current?.focus();
      return false;
    }

    // Clear any previous errors
    setError(null);
    return true;
  };

  const handleWebcamFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("WebcamForm submission received");

    // Additional validation check specifically for name
    let nameValue = nameRef.current?.value?.trim() || "";

    if (!nameValue) {
      const savedName = localStorage.getItem("userName");
      if (savedName) {
        nameValue = savedName;
        // Update the input field to show the name from localStorage
        if (nameRef.current) {
          nameRef.current.value = savedName;
        }
      }
    }

    if (!nameValue) {
      setError(t("error.nameRequired", "Name is required"));
      return;
    }

    // Perform form submission
    await handleSubmit(e);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Form submission started");

    try {
      // Get the name value with localStorage fallback
      let nameValue = nameRef.current?.value?.trim() || "";

      if (!nameValue) {
        const savedName = localStorage.getItem("userName");
        if (savedName) {
          nameValue = savedName;
          // Update the input field
          if (nameRef.current) {
            nameRef.current.value = savedName;
          }
        }
      }

      console.log("Name value for submission:", nameValue);

      // Perform final validation before submission
      if (!nameValue) {
        setError(t("error.nameRequired", "Name is required"));
        console.log("Validation failed: Name is required");
      return;
    }

    if (!webcamCapture) {
        setError(t("error.photoRequired", "Please capture a photo"));
        console.log("No photo captured");
        return;
      }

      // Only validate guardian name for child form
      if (formType === "child" && !guardianNameRef.current?.value.trim()) {
        setError(t("error.guardianRequired", "Guardian name is required"));
        console.log("Guardian name required but not provided");
      return;
    }

    setIsSubmitting(true);
      setError(null);
      console.log("Form passed validation, submitting...");

      // Format the name based on form type
      const name = nameValue;
      const guardianName = guardianNameRef.current?.value || "";

      // Define formattedName based on form type
      let formattedName = name;
      if (formType === "child" && guardianName) {
        formattedName = `${name} (Guardian: ${guardianName})`;
      }

      console.log("Formatted name:", formattedName);

      // Convert data URL to File object for API call
      const base64Data = webcamCapture.split(",")[1];
      const mimeType = webcamCapture.split(",")[0].split(":")[1].split(";")[0];
      const byteCharacters = atob(base64Data);
      const byteArrays = [];

      for (let offset = 0; offset < byteCharacters.length; offset += 512) {
        const slice = byteCharacters.slice(offset, offset + 512);
        const byteNumbers = new Array(slice.length);
        for (let i = 0; i < slice.length; i++) {
          byteNumbers[i] = slice.charCodeAt(i);
        }
        const byteArray = new Uint8Array(byteNumbers);
        byteArrays.push(byteArray);
      }

      const blob = new Blob(byteArrays, { type: mimeType });
      const file = new File([blob], `${name}-webcam.jpg`, { type: mimeType });

      // Prepare metadata based on form type
      const metadata: WebcamRegisterMetadata = {
        employee_id: employeeIdRef.current?.value || "",
        form_type: formType,
        department: departmentRef.current?.value || "",
        role: roleRef.current?.value || "",
        train_multiple: useMultiAngle,
        bypass_angle_check: bypassAngleCheck,
      };

      if (formType === "adult") {
        // Add all adult form fields with proper null checks
        // Basic info
        metadata.occupation = occupationRef.current?.value || "";
        metadata.address = addressRef.current?.value || "";

        // Vehicle info
        if (licensePlateRef?.current?.value)
          metadata.license_plate = licensePlateRef.current.value;
        if (vehicleModelRef?.current?.value)
          metadata.vehicle_model = vehicleModelRef.current.value;
        if (vehicleColorRef?.current?.value)
          metadata.vehicle_color = vehicleColorRef.current.value;
        if (chassisNumberRef?.current?.value)
          metadata.chassis_number = chassisNumberRef.current.value;
        if (vehicleNumberRef?.current?.value)
          metadata.vehicle_number = vehicleNumberRef.current.value;
        if (licenseExpirationRef?.current?.value)
          metadata.license_expiration = licenseExpirationRef.current.value;

        // Criminal record
        if (caseDetailsRef?.current?.value)
          metadata.case_details = caseDetailsRef.current.value;
        if (policeStationRef?.current?.value)
          metadata.police_station = policeStationRef.current.value;
        if (caseNumberRef?.current?.value)
          metadata.case_number = caseNumberRef.current.value;
        if (judgmentRef?.current?.value)
          metadata.judgment = judgmentRef.current.value;
        if (accusationRef?.current?.value)
          metadata.accusation = accusationRef.current.value;

        // Travel clearance
        if (travelDateRef?.current?.value)
          metadata.travel_date = travelDateRef.current.value;
        if (destinationRef?.current?.value)
          metadata.travel_destination = destinationRef.current.value;
        if (arrivalAirportRef?.current?.value)
          metadata.arrival_airport = arrivalAirportRef.current.value;
        if (arrivalDateRef?.current?.value)
          metadata.arrival_date = arrivalDateRef.current.value;
        if (flightNumberRef?.current?.value)
          metadata.flight_number = flightNumberRef.current.value;
        if (returnDateRef?.current?.value)
          metadata.return_date = returnDateRef.current.value;
      } else if (formType === "child") {
        metadata.guardian_name = guardianNameRef.current?.value || "";
        metadata.child_data = {
          date_of_birth: dobRef.current?.value || "",
          physical_description: physicalDescRef.current?.value || "",
          area_of_disappearance: areaDisappearanceRef.current?.value || "",
          guardian_phone: guardianPhoneRef.current?.value || "",
          guardian_id: guardianIdRef.current?.value || "",
          address: addressRef.current?.value || "",
        };
      }

      console.log("Submitting form with metadata:", metadata);

      // Call API to register face
      const response = await api.registerFaceWithFile(
        formattedName,
        file,
        metadata
      );

      if (response.status === "success") {
        setSuccess(
          response.message || t("success", "Successfully registered!")
        );

        // Call onSuccess callback if provided
        if (onSuccess) {
          onSuccess(formattedName);
        }

        // Reset form
        resetForm();
      } else {
        setError(response.message || t("error.failed", "Registration failed"));
      }
    } catch (err) {
      console.error("Registration error:", err);
      let errorMessage = t("error.unknown", "An unknown error occurred");

      if (err instanceof Error) {
        errorMessage = err.message;
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Form type toggle button */}
        <button
          type="button"
        onClick={toggleFormType}
          className="px-4 py-2 rounded-md text-white font-medium bg-blue-600 hover:bg-blue-700 flex items-center"
        >
        {formType === "adult" ? (
          <>
            {t("form.switchToChild", "Switch to Child Form")}
            <FiArrowRight className="ml-2" />
          </>
        ) : (
          <>
            <FiArrowLeft className="mr-2" />
            {t("form.switchToAdult", "Switch to Adult Form")}
          </>
        )}
      </button>

      {/* Display the appropriate form based on formType */}
      {formType === "adult" ? (
        <WebcamAdultForm
          nameRef={nameRef}
          employeeIdRef={employeeIdRef}
          departmentRef={departmentRef}
          roleRef={roleRef}
          occupationRef={occupationRef}
          addressRef={addressRef}
          // Vehicle info refs
          vehicleNumberRef={vehicleNumberRef}
          licensePlateRef={licensePlateRef}
          vehicleModelRef={vehicleModelRef}
          vehicleColorRef={vehicleColorRef}
          chassisNumberRef={chassisNumberRef}
          licenseExpirationRef={licenseExpirationRef}
          // Criminal record refs
          caseDetailsRef={caseDetailsRef}
          policeStationRef={policeStationRef}
          caseNumberRef={caseNumberRef}
          judgmentRef={judgmentRef}
          accusationRef={accusationRef}
          // Travel clearance refs
          travelDateRef={travelDateRef}
          destinationRef={destinationRef}
          arrivalAirportRef={arrivalAirportRef}
          arrivalDateRef={arrivalDateRef}
          flightNumberRef={flightNumberRef}
          returnDateRef={returnDateRef}
          webcamCapture={webcamCapture}
          handleCaptureChange={handleCaptureChange}
          useMultiAngle={useMultiAngle}
          setUseMultiAngle={setUseMultiAngle}
          loading={isSubmitting}
          handleSubmit={handleWebcamFormSubmit}
          validateSectionChange={validateSectionChange}
        />
      ) : (
        <WebcamChildForm
          nameRef={nameRef}
          employeeIdRef={employeeIdRef}
          guardianNameRef={guardianNameRef}
          dobRef={dobRef}
          physicalDescRef={physicalDescRef}
          lastClothesRef={lastClothesRef}
          lastSeenTimeRef={lastSeenTimeRef}
          areaDisappearanceRef={areaDisappearanceRef}
          guardianPhoneRef={guardianPhoneRef}
          guardianIdRef={guardianIdRef}
          addressRef={addressRef}
          departmentRef={departmentRef}
          webcamCapture={webcamCapture}
          handleCaptureChange={handleCaptureChange}
          useMultiAngle={useMultiAngle}
          setUseMultiAngle={setUseMultiAngle}
          loading={isSubmitting}
          handleSubmit={handleWebcamFormSubmit}
          validateSectionChange={validateSectionChange}
        />
      )}

      {/* Error and success messages */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mt-4">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4 flex items-center">
          <FiCheck className="mr-2" />
          {success}
        </div>
      )}
    </div>
  );
};

export default WebcamForm;
