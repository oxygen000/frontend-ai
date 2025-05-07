import React, { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import ImagePreview from "../../common/ImagePreview";

interface ChildFormProps {
  nameRef: React.RefObject<HTMLInputElement | null>;
  employeeIdRef: React.RefObject<HTMLInputElement | null>;
  guardianNameRef: React.RefObject<HTMLInputElement | null>;
  dobRef: React.RefObject<HTMLInputElement | null>;
  physicalDescRef: React.RefObject<HTMLTextAreaElement | null>;
  lastClothesRef: React.RefObject<HTMLTextAreaElement | null>;
  areaDisappearanceRef: React.RefObject<HTMLInputElement | null>;
  guardianPhoneRef: React.RefObject<HTMLInputElement | null>;
  guardianIdRef: React.RefObject<HTMLInputElement | null>;
  addressRef: React.RefObject<HTMLTextAreaElement | null>;
  lastSeenTimeRef: React.RefObject<HTMLInputElement | null>;
  departmentRef: React.RefObject<HTMLInputElement | null>;
  handleFileSelect: (file: File | null, previewUrl: string | null) => void;
  previewUrl: string | null;
  loading: boolean;
  handleSubmit: (event: React.FormEvent) => void;
  validateSectionChange: () => boolean;
}

const ChildForm: React.FC<ChildFormProps> = ({
  nameRef,
  employeeIdRef,
  dobRef,
  physicalDescRef,
  lastClothesRef,
  areaDisappearanceRef,
  lastSeenTimeRef,
  departmentRef,
  handleFileSelect,
  previewUrl,
  loading,
  handleSubmit,
  validateSectionChange,
}) => {
  const { t } = useTranslation("register");
  const [currentSection, setCurrentSection] = useState<number>(1);

  const nextSection = () => {
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
        alert("Please enter the child's full name to continue");
        // Focus on name field
        nameRef.current?.focus();
        return;
      }

      console.log(
        `Name validation passed: "${nameValue}", moving to section ${
          currentSection + 1
        }`
      );
      setCurrentSection((prev) => Math.min(prev + 1, 3));
    } else {
      // For other sections, allow moving forward without validation
      console.log(`Moving to section ${currentSection + 1} without validation`);
      setCurrentSection((prev) => Math.min(prev + 1, 3));
    }
  };

  const prevSection = () => {
    setCurrentSection((prev) => Math.max(prev - 1, 1));
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("ChildForm - Submitting form from section:", currentSection);

    // Add debugging for nameRef
    console.log("ChildForm nameRef:", nameRef);
    console.log("ChildForm nameRef.current:", nameRef.current);
    console.log("ChildForm nameRef value:", nameRef.current?.value);

    // First, ensure section 1 (with name field) is displayed before submission
    if (currentSection !== 1) {
      // Get name value safely
      const nameValue = nameRef.current?.value?.trim() || "";

      // Make sure we're in the right section before submitting
      if (currentSection === 3) {
        // Validate child name
        if (!nameValue) {
          console.error("Child name is required for submission");
          alert("Please provide the child's name before submitting");
          setCurrentSection(1);
          return;
        }

        // If validation passes, call the parent's submit handler
        console.log(
          "ChildForm - Form validated, calling parent submit handler"
        );
        handleSubmit(e);
      } else {
        // If not in section 3, move to the last section
        console.log("ChildForm - Not in section 3, moving to section 3");
        setCurrentSection(3);
      }
    } else {
      // If we're in section 1, move to section 2 after validation
      if (validateSectionChange()) {
        setCurrentSection(2);
      }
    }
  };

  const indicatorClasses = (sectionNum: number) => {
    if (currentSection === sectionNum) {
      return "bg-yellow-600 text-white"; // Current section - yellow for child form
    } else if (currentSection > sectionNum) {
      return "bg-green-600 text-white"; // Completed section
    } else if (sectionNum === currentSection + 1) {
      return "bg-yellow-400 text-white"; // Next section to complete
    } else {
      return "bg-gray-200"; // Future sections
    }
  };

  // Add an effect to focus on name field when component mounts
  useEffect(() => {
    console.log("ChildForm mounted, checking nameRef");

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
  }, [nameRef, currentSection]);

  // Add a useEffect to ensure inputs are preserved
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
  ]);

  return (
    <form onSubmit={handleFormSubmit} className="space-y-4">
      <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 mb-4">
        <h2 className="text-lg font-semibold text-yellow-800">
          {t("missingChildTitle", "Child Registration")}
        </h2>
        <p className="text-sm text-yellow-700">
          {t(
            "missingChildInfo",
            "Please provide information about the child to be registered."
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
              {t("childName", "Child's Name")}
            </label>
            <input
              type="text"
              ref={nameRef}
              placeholder={
                t("childNamePlaceholder", "Enter child's full name") || ""
              }
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {t("nationalId", "National ID Number")}
            </label>
            <input
              type="text"
              ref={employeeIdRef}
              placeholder={
                t("nationalIdPlaceholder", "Enter national ID number") || ""
              }
              required
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {t("childDOB", "Date of Birth")}
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
              {t("next", "Next")}
            </button>
          </div>
        </>
      )}

      {/* Section 2: Additional Information */}
      {currentSection === 2 && (
        <>
          <div>
            <label className="block font-medium mb-1">
              {t("department", "Associated Department")}
            </label>
            <input
              type="text"
              ref={departmentRef}
              placeholder={
                t("departmentPlaceholder", "Enter associated department") || ""
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {t("lastSeen", "Last Seen (Date & Time)")}
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
              {t("lastClothes", "Clothes Worn")}
            </label>
            <textarea
              ref={lastClothesRef}
              placeholder={
                t(
                  "lastClothesPlaceholder",
                  "Describe what the child was wearing"
                ) || ""
              }
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
              {t("previous", "Previous")}
            </button>
            <button
              type="button"
              onClick={nextSection}
              className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700"
            >
              {t("next", "Next")}
            </button>
          </div>
        </>
      )}

      {/* Section 3: Photo Upload and Submit */}
      {currentSection === 3 && (
        <>
          <div>
            <label className="block font-medium mb-1">
              {t("physicalDesc", "Physical Description")}
            </label>
            <textarea
              ref={physicalDescRef}
              placeholder={
                t(
                  "physicalDescPlaceholder",
                  "Height, weight, eye color, hair color, distinguishing features"
                ) || ""
              }
              className="w-full p-2 border rounded-md h-20"
            />
          </div>

          <div>
            <label className="block font-medium mb-1">
              {t("areaDisappearance", "Location Details")}
            </label>
            <input
              type="text"
              ref={areaDisappearanceRef}
              placeholder={
                t(
                  "areaDisappearancePlaceholder",
                  "Location details if applicable"
                ) || ""
              }
              className="w-full p-2 border rounded-md"
            />
          </div>

          <div className="mt-4">
            <label className="block font-medium mb-1">
              {t("childPhoto", "Child's Photo")}
            </label>
            <ImagePreview
              onImageChange={(file, previewUrl) =>
                handleFileSelect(file, previewUrl)
              }
              previewUrl={previewUrl || ""}
              placeholderText={
                t(
                  "childPhotoPlaceholder",
                  "Upload a clear, recent photo of the child"
                ) || ""
              }
              acceptedFormats="image/*"
              required
            />
          </div>

          {/* Hidden input for setting form_type to 'child' automatically */}
          <input type="hidden" name="form_type" value="child" />

          <div className="flex justify-between mt-4">
            <button
              type="button"
              onClick={prevSection}
              className="px-4 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400"
            >
              {t("previous", "Previous")}
            </button>
            <button
              type="submit"
              disabled={loading}
              className={`px-4 py-2 rounded-md text-white font-medium ${
                loading
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-yellow-600 hover:bg-yellow-700"
              }`}
            >
              {loading
                ? t("processing", "Processing...")
                : t("registerChild", "Register Child")}
            </button>
          </div>
        </>
      )}
    </form>
  );
};

export default ChildForm;
