import React, { useState, FormEvent, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import api from "../../../services/api";
import { FiArrowRight, FiArrowLeft } from "react-icons/fi";
import ManForm from "./ManForm";
import ChildForm from "./ChildForm";

interface UploadFormProps {
  onSuccess?: (name: string) => void;
}

// Metadata interface for registration
interface RegisterMetadata {
  employee_id: string;
  form_type: "adult" | "child";
  bypass_angle_check?: boolean;
  occupation?: string;
  address?: string;
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
  child_data?: {
    date_of_birth?: string;
    physical_description?: string;
    last_clothes?: string;
    area_of_disappearance?: string;
    guardian_phone?: string;
    guardian_id?: string;
    address?: string;
    last_seen_time?: string;
  };
  guardian_name?: string;
}

const UploadForm: React.FC<UploadFormProps> = ({ onSuccess }) => {
  const { t } = useTranslation("register");

  // Form state
  const [formType, setFormType] = useState<"adult" | "child">("adult");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  // UI state
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [bypassAngleCheck] = useState(false);

  // Common form refs
  const nameRef = useRef<HTMLInputElement>(null);
  const employeeIdRef = useRef<HTMLInputElement>(null);
  const guardianNameRef = useRef<HTMLInputElement>(null);
  const addressRef = useRef<HTMLTextAreaElement>(null);

  // Additional refs for child form
  const dobRef = useRef<HTMLInputElement>(null);
  const physicalDescRef = useRef<HTMLTextAreaElement>(null);
  const lastClothesRef = useRef<HTMLTextAreaElement>(null);
  const areaDisappearanceRef = useRef<HTMLInputElement>(null);
  const guardianPhoneRef = useRef<HTMLInputElement>(null);
  const guardianIdRef = useRef<HTMLInputElement>(null);
  const lastSeenTimeRef = useRef<HTMLInputElement>(null);
  const departmentRef = useRef<HTMLInputElement>(null);

  // Adult form refs
  const occupationRef = useRef<HTMLInputElement>(null);
  const vehicleNumberRef = useRef<HTMLInputElement>(null);
  const licensePlateRef = useRef<HTMLInputElement>(null);
  const vehicleModelRef = useRef<HTMLInputElement>(null);
  const vehicleColorRef = useRef<HTMLInputElement>(null);
  const chassisNumberRef = useRef<HTMLInputElement>(null);
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

  // Add debugging for component state
  useEffect(() => {
    console.log("Form type:", formType);
  }, [formType]);

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

    // Function to help debug refs
    const logRefValue = (
      name: string,
      ref: React.RefObject<HTMLInputElement | HTMLTextAreaElement | null>
    ) => {
      console.log(`${name} ref value:`, ref.current?.value || "");
    };

    // Log all important refs
    logRefValue("Name", nameRef);
    logRefValue("EmployeeId", employeeIdRef);
    logRefValue("GuardianName", guardianNameRef);

    console.log("Form initialized");
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

  const handleImageChange = (file: File | null, imageUrl: string | null) => {
    setSelectedFile(file);
    setPreviewUrl(imageUrl);
    setError(null);
  };

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

  const resetForm = () => {
    // Reset common fields
    if (nameRef.current) nameRef.current.value = "";
    if (employeeIdRef.current) employeeIdRef.current.value = "";
    if (guardianNameRef.current) guardianNameRef.current.value = "";
    if (addressRef.current) addressRef.current.value = "";

    // Reset child fields
    if (dobRef.current) dobRef.current.value = "";
    if (physicalDescRef.current) physicalDescRef.current.value = "";
    if (lastClothesRef.current) lastClothesRef.current.value = "";
    if (areaDisappearanceRef.current) areaDisappearanceRef.current.value = "";
    if (guardianPhoneRef.current) guardianPhoneRef.current.value = "";
    if (guardianIdRef.current) guardianIdRef.current.value = "";
    if (lastSeenTimeRef.current) lastSeenTimeRef.current.value = "";

    // Reset adult fields
    if (occupationRef.current) occupationRef.current.value = "";
    if (vehicleNumberRef.current) vehicleNumberRef.current.value = "";
    if (licensePlateRef.current) licensePlateRef.current.value = "";
    if (vehicleModelRef.current) vehicleModelRef.current.value = "";
    if (vehicleColorRef.current) vehicleColorRef.current.value = "";
    if (chassisNumberRef.current) chassisNumberRef.current.value = "";
    if (licenseExpirationRef.current) licenseExpirationRef.current.value = "";
    if (caseDetailsRef.current) caseDetailsRef.current.value = "";
    if (policeStationRef.current) policeStationRef.current.value = "";
    if (caseNumberRef.current) caseNumberRef.current.value = "";
    if (judgmentRef.current) judgmentRef.current.value = "";
    if (accusationRef.current) accusationRef.current.value = "";
    if (travelDateRef.current) travelDateRef.current.value = "";
    if (destinationRef.current) destinationRef.current.value = "";
    if (arrivalAirportRef.current) arrivalAirportRef.current.value = "";
    if (arrivalDateRef.current) arrivalDateRef.current.value = "";
    if (flightNumberRef.current) flightNumberRef.current.value = "";
    if (returnDateRef.current) returnDateRef.current.value = "";

    setSelectedFile(null);
    setPreviewUrl(null);
    setError(null);
    setSuccess(null);
  };

  const handleManFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    console.log("UploadForm - ManForm submission received");

    // Additional validation check specifically for name
    // Try to get name from ref first, then localStorage as fallback
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
      console.error(
        "Name validation failed in UploadForm during ManForm submission"
      );
      alert("Please provide your name before submitting");
      return;
    }

    // Perform form submission
    await handleSubmit(e);
  };

  const handleSubmit = async (e: FormEvent) => {
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

      if (!selectedFile) {
        setError(t("error.photoRequired", "Please upload a photo"));
        console.log("No photo selected");
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
      const name = nameValue; // Ensure name is trimmed before sending
      const guardianName = guardianNameRef.current?.value || "";

      // Define formattedName based on form type
      let formattedName = name;
      if (formType === "child" && guardianName) {
        formattedName = `${name} (Guardian: ${guardianName})`;
      }

      console.log("Formatted name:", formattedName);

      // Verify photo is properly selected
      if (!selectedFile || selectedFile.size === 0) {
        setError(
          t(
            "error.photoInvalid",
            "Selected photo is invalid. Please try another photo."
          )
        );
        setIsSubmitting(false);
        return;
      }

      // Prepare metadata based on form type
      const metadata: RegisterMetadata = {
        employee_id: employeeIdRef.current?.value || "",
        form_type: formType,
        bypass_angle_check: bypassAngleCheck,
      };

      if (formType === "adult") {
        // Add adult-specific fields directly to the metadata, but only if they have values
        // Basic info
        if (occupationRef.current?.value)
          metadata.occupation = occupationRef.current.value;
        if (addressRef.current?.value)
          metadata.address = addressRef.current.value;

        // Vehicle info
        if (licensePlateRef.current?.value)
          metadata.license_plate = licensePlateRef.current.value;
        if (vehicleModelRef.current?.value)
          metadata.vehicle_model = vehicleModelRef.current.value;
        if (vehicleColorRef.current?.value)
          metadata.vehicle_color = vehicleColorRef.current.value;
        if (chassisNumberRef.current?.value)
          metadata.chassis_number = chassisNumberRef.current.value;
        if (vehicleNumberRef.current?.value)
          metadata.vehicle_number = vehicleNumberRef.current.value;
        if (licenseExpirationRef.current?.value)
          metadata.license_expiration = licenseExpirationRef.current.value;

        // Criminal record
        if (caseDetailsRef.current?.value)
          metadata.case_details = caseDetailsRef.current.value;
        if (policeStationRef.current?.value)
          metadata.police_station = policeStationRef.current.value;
        if (caseNumberRef.current?.value)
          metadata.case_number = caseNumberRef.current.value;
        if (judgmentRef.current?.value)
          metadata.judgment = judgmentRef.current.value;
        if (accusationRef.current?.value)
          metadata.accusation = accusationRef.current.value;

        // Travel clearance
        if (travelDateRef.current?.value)
          metadata.travel_date = travelDateRef.current.value;
        if (destinationRef.current?.value)
          metadata.travel_destination = destinationRef.current.value;
        if (arrivalAirportRef.current?.value)
          metadata.arrival_airport = arrivalAirportRef.current.value;
        if (arrivalDateRef.current?.value)
          metadata.arrival_date = arrivalDateRef.current.value;
        if (flightNumberRef.current?.value)
          metadata.flight_number = flightNumberRef.current.value;
        if (returnDateRef.current?.value)
          metadata.return_date = returnDateRef.current.value;
      } else if (formType === "child") {
        // Add guardian name as top-level field for child form
        if (guardianNameRef.current?.value)
          metadata.guardian_name = guardianNameRef.current.value;

        // Add child-specific data to the child_data object, but only for non-empty values
        const childData: {
          date_of_birth?: string;
          physical_description?: string;
          last_clothes?: string;
          area_of_disappearance?: string;
          guardian_phone?: string;
          guardian_id?: string;
          address?: string;
          last_seen_time?: string;
        } = {};

        if (dobRef.current?.value)
          childData.date_of_birth = dobRef.current.value;
        if (physicalDescRef.current?.value)
          childData.physical_description = physicalDescRef.current.value;
        if (lastClothesRef.current?.value)
          childData.last_clothes = lastClothesRef.current.value;
        if (areaDisappearanceRef.current?.value)
          childData.area_of_disappearance = areaDisappearanceRef.current.value;
        if (guardianPhoneRef.current?.value)
          childData.guardian_phone = guardianPhoneRef.current.value;
        if (guardianIdRef.current?.value)
          childData.guardian_id = guardianIdRef.current.value;
        if (addressRef.current?.value)
          childData.address = addressRef.current.value;
        if (lastSeenTimeRef.current?.value)
          childData.last_seen_time = lastSeenTimeRef.current.value;

        // Only add child_data if there's at least one field
        if (Object.keys(childData).length > 0) {
          metadata.child_data = childData;
        }
      }

      console.log("Submitting form with metadata:", metadata);

      // Call API to register face
      const response = await api.registerFaceWithFile(
        formattedName,
        selectedFile,
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

        // Handle specific error cases
        if (err.message.includes("Name is required")) {
          errorMessage = t("error.nameRequired", "Name is required");
        } else if (err.message.includes("Failed to process image")) {
          errorMessage = t(
            "error.photoProcessingFailed",
            "Failed to process the photo. Please try with a different photo."
          );
        } else if (err.message.includes("No face detected")) {
          errorMessage = t(
            "error.noFaceDetected",
            "No face was detected in the image. Please ensure the face is clearly visible."
          );
        }
      }

      setError(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const validateSectionChange = (): boolean => {
    console.log("Validating section change in UploadForm");
    console.log("nameRef:", nameRef);
    console.log("nameRef.current:", nameRef.current);

    // Get the name value directly
    const nameValue = nameRef.current?.value || "";
    console.log("Name value in validateSectionChange:", nameValue);

    // Check if nameRef exists and has a current value
    if (!nameRef.current || !nameValue.trim()) {
      setError(t("error.nameRequired", "Name is required"));
      console.log("Validation failed: Name is required");

      // Focus on the name input to help the user
      nameRef.current?.focus();
      return false;
    }

    // Form-specific validations can be added here if needed in the future

    // Clear any previous errors
    setError(null);
    console.log("Validation passed with name:", nameValue.trim());
    return true;
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
        <ManForm
          nameRef={nameRef}
          employeeIdRef={employeeIdRef}
          occupationRef={occupationRef}
          addressRef={addressRef}
          vehicleNumberRef={vehicleNumberRef}
          licensePlateRef={licensePlateRef}
          vehicleModelRef={vehicleModelRef}
          vehicleColorRef={vehicleColorRef}
          chassisNumberRef={chassisNumberRef}
          licenseExpirationRef={licenseExpirationRef}
          caseDetailsRef={caseDetailsRef}
          policeStationRef={policeStationRef}
          caseNumberRef={caseNumberRef}
          judgmentRef={judgmentRef}
          accusationRef={accusationRef}
          travelDateRef={travelDateRef}
          destinationRef={destinationRef}
          arrivalAirportRef={arrivalAirportRef}
          arrivalDateRef={arrivalDateRef}
          flightNumberRef={flightNumberRef}
          returnDateRef={returnDateRef}
          handleFileSelect={handleImageChange}
          previewUrl={previewUrl || ""}
          loading={isSubmitting}
          handleSubmit={handleManFormSubmit}
        />
      ) : (
        <ChildForm
          nameRef={nameRef}
          employeeIdRef={employeeIdRef}
          guardianNameRef={guardianNameRef}
          dobRef={dobRef}
          physicalDescRef={physicalDescRef}
          lastClothesRef={lastClothesRef}
          areaDisappearanceRef={areaDisappearanceRef}
          guardianPhoneRef={guardianPhoneRef}
          guardianIdRef={guardianIdRef}
          addressRef={addressRef}
          lastSeenTimeRef={lastSeenTimeRef}
          departmentRef={departmentRef}
          handleFileSelect={handleImageChange}
          previewUrl={previewUrl || ""}
          loading={isSubmitting}
          handleSubmit={handleSubmit}
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
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mt-4">
          {success}
        </div>
      )}
    </div>
  );
};

export default UploadForm;
