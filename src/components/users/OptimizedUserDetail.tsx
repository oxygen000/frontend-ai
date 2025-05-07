import React, { useState, useEffect, useCallback } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiArrowLeft,
  FiUsers,
  FiUser,
  FiClock,
  FiBriefcase,
  FiHash,
  FiCamera,
  FiEdit,
  FiTrash2,
  FiAlertCircle,
  FiCheckCircle,
  FiRefreshCw,
  FiCalendar,
  FiActivity,
  FiPhone,
  FiHome,
  FiPercent,
  FiLock,
  FiFileText,
  FiTruck,
  FiCreditCard,
  FiDroplet,
  FiMap,
  FiNavigation,
  FiLayers,
} from "react-icons/fi";
import { FaBirthdayCake, FaIdCard, FaUserTag } from "react-icons/fa";
import { useUserDetail } from "../../hooks";
import api from "../../services/api";
import { Button, Modal } from "../common";
import { useUserContext } from "../../contexts/UserContext";
import { formatDate, formatRelativeTime } from "./utils/formatters";

/**
 * Extended user type to include all fields from ManForm and ChildForm
 */
interface ExtendedUser {
  // Required User properties
  id: string;
  name: string;
  created_at: string;

  // Optional User properties
  employee_id?: string;
  department?: string;
  role?: string;
  face_id?: string;
  image_url?: string;
  image_path?: string;
  image?: string;

  // Additional ManForm fields
  occupation?: string;
  address?: string;
  license_plate?: string;
  vehicle_model?: string;
  vehicle_color?: string;
  vehicle_number?: string;
  chassis_number?: string;
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

  // ChildForm fields
  guardian_name?: string;
  date_of_birth?: string;
  physical_description?: string;
  last_clothes?: string;
  area_of_disappearance?: string;
  last_seen_time?: string;
  guardian_phone?: string;
  guardian_id?: string;

  // Additional system fields
  status?: string;
  face_registered_date?: string | Date;
  face_image_url?: string;
  face_recognition_rate?: number;
  last_login?: string | Date;
  updated_at?: string | Date;
  form_type?: "adult" | "child";
}

/**
 * Loading state component with skeleton UI
 */
const LoadingState: React.FC = () => {
  const { t } = useTranslation(["userDetail", "common"]);

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-blue-600 to-blue-800 px-6 py-4">
          <div className="h-8 w-64 bg-white/20 rounded animate-pulse mb-2"></div>
          <div className="h-4 w-48 bg-white/20 rounded animate-pulse"></div>
        </div>

        <div className="p-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start mb-8">
            {/* Skeleton for user image */}
            <div className="w-32 h-32 rounded-full bg-gray-200 animate-pulse mr-6"></div>

            <div className="mt-4 sm:mt-0 text-center sm:text-left">
              <div className="h-7 w-48 bg-gray-200 rounded animate-pulse mb-3"></div>
              <div className="h-5 w-32 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
            {/* Skeleton for personal info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>

            {/* Skeleton for system info */}
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="h-6 w-48 bg-gray-200 rounded animate-pulse mb-4"></div>
              <div className="space-y-3">
                <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
                <div className="h-5 w-full bg-gray-200 rounded animate-pulse"></div>
              </div>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="h-10 w-24 bg-gray-200 rounded animate-pulse"></div>
            <div className="h-10 w-32 bg-gray-200 rounded animate-pulse"></div>
          </div>
        </div>
      </div>

      <div className="text-center mt-4 text-gray-600">
        {t("loading", "Loading user details...")}
      </div>
    </div>
  );
};

/**
 * Error state component
 */
interface ErrorStateProps {
  error: string;
  onBack: () => void;
  onRetry?: () => void;
}

const ErrorState: React.FC<ErrorStateProps> = ({ error, onBack, onRetry }) => {
  const { t } = useTranslation(["userDetail", "common"]);

  return (
    <div className="container mx-auto px-4 max-w-4xl">
      <div className="bg-white rounded-xl shadow-lg overflow-hidden">
        <div className="bg-gradient-to-r from-red-600 to-red-800 px-6 py-4 text-white">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center">
            <FiAlertCircle className="mr-2" />
            {t("error.title", "Error Loading User")}
          </h2>
          <p className="text-red-100 mt-1">
            {t(
              "error.subtitle",
              "There was a problem retrieving the user details"
            )}
          </p>
        </div>

        <div className="p-6">
          <div className="p-6 bg-red-50 rounded-lg border border-red-200 mb-6">
            <p className="text-red-700 font-medium">{error}</p>
          </div>

          <div className="flex flex-wrap gap-3 mt-8">
            <Button variant="secondary" icon={FiArrowLeft} onClick={onBack}>
              {t("common:buttons.back", "Back")}
            </Button>

            {onRetry && (
              <Button variant="primary" icon={FiRefreshCw} onClick={onRetry}>
                {t("common:buttons.retry", "Retry")}
              </Button>
            )}

            <Link to="/users">
              <Button variant="primary" icon={FiUsers}>
                {t("allUsers", "All Users")}
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

/**
 * Info item component for displaying a label-value pair
 */
interface InfoItemProps {
  label: string;
  value: string | React.ReactNode;
  icon?: React.ReactNode;
  monospace?: boolean;
  copyable?: boolean;
}

const InfoItem: React.FC<InfoItemProps> = React.memo(
  ({ label, value, icon, monospace = false, copyable = false }) => {
    const [copied, setCopied] = useState(false);

    const handleCopy = useCallback(() => {
      if (typeof value === "string") {
        navigator.clipboard
          .writeText(value)
          .then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
          })
          .catch((err) => console.error("Failed to copy text:", err));
      }
    }, [value]);

    return (
      <div className="flex items-start group p-3 hover:bg-gray-50 rounded-lg transition-colors">
        {icon && (
          <div className="text-indigo-500 mr-3 mt-1 text-xl">{icon}</div>
        )}
        <div className="flex-grow">
          <p className="text-gray-700 relative">
            <span className="font-medium text-gray-600 block mb-1">
              {label}
            </span>
            <span
              className={`${
                monospace ? "font-mono text-sm" : ""
              } break-words text-gray-800 font-medium`}
            >
              {value || "—"}
            </span>
          </p>
        </div>
        {copyable && typeof value === "string" && (
          <button
            onClick={handleCopy}
            className="opacity-0 group-hover:opacity-100 transition-opacity ml-2 text-gray-400 hover:text-gray-700"
            title="Copy to clipboard"
          >
            {copied ? (
              <FiCheckCircle className="text-green-500" />
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="9" y="9" width="13" height="13" rx="2" ry="2"></rect>
                <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
              </svg>
            )}
          </button>
        )}
      </div>
    );
  }
);

// Set display name for React DevTools
InfoItem.displayName = "InfoItem";

// Function to ensure date is a string
const ensureDateString = (
  date: string | Date | undefined
): string | undefined => {
  if (!date) return undefined;
  return typeof date === "string" ? date : date.toString();
};

/**
 * Optimized UserDetail component with performance improvements
 */
const OptimizedUserDetail: React.FC = () => {
  const { t } = useTranslation(["userDetail", "common"]);
  const { userId } = useParams<{ userId: string }>();
  const navigate = useNavigate();
  const { isUserDeleted } = useUserContext();
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
  const [userImage, setUserImage] = useState<string | null>(null);
  const [imageLoaded, setImageLoaded] = useState<boolean>(false);

  // Use our custom hook to get user data
  const { user, loading, error } = useUserDetail(userId);

  // Cast to extended user to access additional fields
  const extendedUser = user as ExtendedUser;

  // Fetch user image when user data is loaded
  useEffect(() => {
    // Skip if we've already loaded an image or don't have the necessary data
    if (imageLoaded || !userId || !user) return;

    // Set a flag to prevent multiple loading attempts
    setImageLoaded(true);

    const fetchUserImage = async () => {
      try {
        // Instead of direct fetch which might cause CORS issues, use API service if available
        if (api.getUserImage) {
          try {
            const response = await api.getUserImage(userId);
            if (response && response.imageUrl) {
              setUserImage(response.imageUrl);
              return;
            }
          } catch (error) {
            // Only log in development to keep console clean
            if (process.env.NODE_ENV === "development") {
              console.debug("Failed to fetch image through API:", error);
            }
          }
        }

        // If API method not available, try using the image_url directly
        if (user.image_url) {
          setUserImage(user.image_url);
          return;
        }

        // Last resort - use avatar service
        setUserImage(
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.name || "User"
          )}&size=200&background=3182ce&color=fff`
        );
      } catch (error) {
        // Only log in development to keep console clean
        if (process.env.NODE_ENV === "development") {
          console.error("Error fetching user image:", error);
        }

        // Set a fallback image
        setUserImage(
          `https://ui-avatars.com/api/?name=${encodeURIComponent(
            user.name || "User"
          )}&size=200&background=3182ce&color=fff`
        );
      }
    };

    fetchUserImage();

    // Clean up any object URLs when component unmounts
    return () => {
      if (userImage && userImage.startsWith("blob:")) {
        URL.revokeObjectURL(userImage);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId, user, imageLoaded, navigate, t]);

  // Handle user deletion
  const handleDeleteUser = useCallback(async () => {
    if (!userId) return;

    try {
      setIsDeleteModalOpen(false);
      const result = await api.deleteUser(userId);

      if (result.status === "success") {
        // Navigate back to users list
        navigate("/users", {
          state: { message: t("deleteSuccess", "User successfully deleted") },
        });
      } else {
        throw new Error(result.message || "Failed to delete user");
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      // Show error toast or notification
    }
  }, [userId, navigate, t]);

  // Check if user is deleted
  useEffect(() => {
    if (userId && isUserDeleted(userId)) {
      navigate("/users", {
        state: { error: t("userDeleted", "This user has been deleted") },
      });
    }
  }, [userId, isUserDeleted, navigate, t]);

  // Loading state
  if (loading) {
    return <LoadingState />;
  }

  // Error state
  if (error || !user) {
    return (
      <ErrorState
        error={
          typeof error === "string"
            ? error
            : t("userNotFound", "User not found")
        }
        onBack={() => navigate("/users")}
      />
    );
  }

  // Format user's creation date
  const createdDate = user.created_at
    ? formatDate(user.created_at)
    : t("common:dateUnknown", "Unknown date");

  // Extract all user data for display
  const userDetails = [
    { label: t("fullName", "Full Name"), value: user.name, icon: <FiUser /> },
    {
      label: t("employeeId", "Employee ID"),
      value: user.employee_id || "N/A",
      icon: <FiHash />,
    },
    {
      label: t("department", "Department"),
      value: user.department || "N/A",
      icon: <FiBriefcase />,
    },
    {
      label: t("phone", "Phone"),
      value: user.phone || "N/A",
      icon: <FiPhone />,
    },
    {
      label: t("address", "Address"),
      value: user.address || "N/A",
      icon: <FiHome />,
    },
    {
      label: t("registered", "Registered"),
      value: createdDate,
      icon: <FiCalendar />,
    },
    {
      label: t("lastLogin", "Last Login"),
      value: user.last_login
        ? formatRelativeTime(user.last_login)
        : t("never", "Never"),
      icon: <FiClock />,
    },
    {
      label: t("status", "Status"),
      value: user.status || "N/A",
      icon: <FiActivity />,
    },
    {
      label: t("accessLevel", "Access Level"),
      value: user.access_level || "N/A",
      icon: <FiLock />,
    },
    {
      label: t("notes", "Notes"),
      value: user.notes || "N/A",
      icon: <FiFileText />,
    },
    // Additional fields for ManForm
    {
      label: t("occupation", "Occupation"),
      value: extendedUser.occupation || "N/A",
      icon: <FiBriefcase />,
    },
  ];

  // Vehicle information from ManForm - ensure all fields are displayed with N/A if missing
  const vehicleDetails = [
    {
      label: t("vehicleNumber", "Vehicle Number"),
      value: extendedUser.vehicle_number || "N/A",
      icon: <FiTruck />,
    },
    {
      label: t("licensePlate", "License Plate"),
      value: extendedUser.license_plate || "N/A",
      icon: <FiCreditCard />,
    },
    {
      label: t("vehicleModel", "Vehicle Model"),
      value: extendedUser.vehicle_model || "N/A",
      icon: <FiTruck />,
    },
    {
      label: t("vehicleColor", "Vehicle Color"),
      value: extendedUser.vehicle_color || "N/A",
      icon: <FiDroplet />,
    },
    {
      label: t("chassisNumber", "Chassis Number"),
      value: extendedUser.chassis_number || "N/A",
      icon: <FiHash />,
    },
    {
      label: t("licenseExpiration", "License Expiration"),
      value: extendedUser.license_expiration
        ? formatDate(extendedUser.license_expiration)
        : "N/A",
      icon: <FiCalendar />,
    },
  ];

  // Case details section
  const caseDetails = [
    {
      label: t("caseDetails", "Case Details"),
      value: extendedUser.case_details || "N/A",
      icon: <FiFileText />,
    },
    {
      label: t("policeStation", "Police Station"),
      value: extendedUser.police_station || "N/A",
      icon: <FiBriefcase />,
    },
    {
      label: t("caseNumber", "Case Number"),
      value: extendedUser.case_number || "N/A",
      icon: <FiHash />,
    },
    {
      label: t("judgment", "Judgment"),
      value: extendedUser.judgment || "N/A",
      icon: <FiFileText />,
    },
    {
      label: t("accusation", "Accusation"),
      value: extendedUser.accusation || "N/A",
      icon: <FiAlertCircle />,
    },
  ];

  // Travel information from ManForm - ensure all fields are displayed with N/A if missing
  const travelDetails = [
    {
      label: t("travelDate", "Travel Date"),
      value: extendedUser.travel_date
        ? formatDate(extendedUser.travel_date)
        : "N/A",
      icon: <FiCalendar />,
    },
    {
      label: t("travelDestination", "Travel Destination"),
      value: extendedUser.travel_destination || "N/A",
      icon: <FiMap />,
    },
    {
      label: t("arrivalAirport", "Arrival Airport"),
      value: extendedUser.arrival_airport || "N/A",
      icon: <FiNavigation />,
    },
    {
      label: t("arrivalDate", "Arrival Date"),
      value: extendedUser.arrival_date
        ? formatDate(extendedUser.arrival_date)
        : "N/A",
      icon: <FiCalendar />,
    },
    {
      label: t("flightNumber", "Flight Number"),
      value: extendedUser.flight_number || "N/A",
      icon: <FiHash />,
    },
    {
      label: t("returnDate", "Return Date"),
      value: extendedUser.return_date
        ? formatDate(extendedUser.return_date)
        : "N/A",
      icon: <FiCalendar />,
    },
  ];

  // Check if details are available - we'll always display these sections now
  const hasTravelDetails = true; // Show even if all are N/A
  const hasVehicleDetails = true; // Show even if all are N/A
  const hasCaseDetails = true; // Show even if all are N/A

  // Improve the isChildRecord detection
  const isChildRecord =
    extendedUser.form_type === "child" ||
    !!extendedUser.guardian_name ||
    !!extendedUser.date_of_birth ||
    !!extendedUser.physical_description ||
    !!extendedUser.last_clothes ||
    !!extendedUser.area_of_disappearance ||
    !!extendedUser.last_seen_time;

  // Render the page
  return (
    <div className="bg-gray-50 min-h-screen pb-12">
      {/* Simplified header with glass effect */}
      <div
        className={`sticky top-0 z-10 backdrop-blur-md bg-opacity-90 shadow-md ${
          isChildRecord ? "bg-amber-600" : "bg-indigo-700"
        }`}
      >
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => navigate("/users")}
                className="p-2 mr-4 rounded-full bg-white/20 hover:bg-white/30 transition-colors"
                aria-label={t("common:buttons.back", "Back")}
              >
                <FiArrowLeft size={20} className="text-white" />
              </button>
              <div>
                <h1 className="text-xl font-bold text-white">
                  {user.name || t("unknownUser", "Unknown User")}
                </h1>
                <div className="flex items-center text-white/70 text-sm">
                  {user.employee_id && <span>{user.employee_id}</span>}
                  {user.department && (
                    <>
                      {user.employee_id && <span className="mx-2">•</span>}
                      <span>{user.department}</span>
                    </>
                  )}
                </div>
              </div>
            </div>

            {user.status && (
              <span
                className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                  user.status === "active"
                    ? "bg-green-100 text-green-800"
                    : user.status === "inactive"
                    ? "bg-gray-100 text-gray-800"
                    : user.status === "pending" || user.status === "locked"
                    ? "bg-red-100 text-red-800"
                    : "bg-blue-100 text-blue-800"
                }`}
              >
                <span
                  className={`w-2 h-2 mr-2 rounded-full ${
                    user.status === "active"
                      ? "bg-green-400"
                      : user.status === "inactive"
                      ? "bg-gray-400"
                      : user.status === "pending" || user.status === "locked"
                      ? "bg-red-400"
                      : "bg-blue-400"
                  }`}
                ></span>
                {user.status}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main content with streamlined layout */}
      <div className="container mx-auto px-4 py-6">
        {/* Simplified page title banner */}
        <div
          className={`mb-6 p-6 rounded-xl shadow-lg bg-gradient-to-r ${
            isChildRecord
              ? "from-amber-500 to-amber-700"
              : "from-indigo-500 to-indigo-800"
          } text-white`}
        >
          <div className="flex flex-col md:flex-row md:items-center justify-between">
            <div className="flex flex-col md:flex-row md:items-center mb-4 md:mb-0">
              <div className="relative w-20 h-20 md:w-24 md:h-24 rounded-xl overflow-hidden border-4 border-white/30 shadow-lg mr-6 mb-4 md:mb-0">
                <img
                  src={
                    userImage ||
                    `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name || "User"
                    )}&size=200&background=3182ce&color=fff`
                  }
                  alt={user.name || t("unknownUser", "Unknown User")}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    const target = e.target as HTMLImageElement;
                    target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(
                      user.name || "User"
                    )}&size=200&background=3182ce&color=fff`;
                    target.onerror = null;
                  }}
                />
              </div>
              <div>
                <h1 className="text-2xl md:text-3xl font-bold flex items-center">
                  {user.name || t("unknownUser", "Unknown User")}
                  {isChildRecord && (
                    <span className="ml-2 text-xs bg-yellow-500 text-white px-2 py-1 rounded-full flex items-center">
                      <FiAlertCircle className="mr-1" size={12} />
                      {t("childRecord", "Child Record")}
                    </span>
                  )}
                </h1>
                <div className="flex flex-wrap items-center gap-2 mt-2">
                  {user.department && (
                    <span className="bg-white/20 px-2 py-1 rounded-full text-sm">
                      {user.department}
                    </span>
                  )}
                </div>
                {user.created_at && (
                  <div className="text-white/70 text-sm mt-2">
                    <FiCalendar className="inline mr-1" size={14} />
                    {t("registeredOn", "Registered")}:{" "}
                    {formatDate(
                      ensureDateString(user.created_at) || new Date().toString()
                    )}
                  </div>
                )}
              </div>
            </div>
            <div className="flex flex-wrap gap-2 mt-4 md:mt-0">
              <Link to={`/users/${userId}/edit`}>
                <Button
                  variant="light"
                  icon={FiEdit}
                  className="transition-all hover:shadow-md"
                >
                  {t("edit", "Edit")}
                </Button>
              </Link>
              <Button
                variant="danger-ghost"
                icon={FiTrash2}
                onClick={() => setIsDeleteModalOpen(true)}
                className="transition-all hover:shadow-md"
              >
                {t("delete", "Delete")}
              </Button>
            </div>
          </div>
        </div>

        {/* Main content grid - simplified */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - Main information */}
          <div className="lg:col-span-2 space-y-6">
            {/* Profile information card */}
            <div
              className={`${
                isChildRecord
                  ? "bg-amber-50 border-amber-100"
                  : "bg-indigo-50 border-indigo-100"
              } px-4 py-3 border-l-4 font-medium flex items-center justify-between`}
            >
              <span className="flex items-center">
                <FiUser
                  className={`mr-2 ${
                    isChildRecord ? "text-amber-700" : "text-indigo-700"
                  }`}
                />
                {t("personalInfo", "Personal Information")}
              </span>
            </div>
            <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
              {userDetails.map((detail, index) => (
                <InfoItem
                  key={`detail-${index}`}
                  label={detail.label}
                  value={detail.value}
                  icon={detail.icon}
                />
              ))}
            </div>

            {/* Child-specific information card */}
            {isChildRecord && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-amber-100 transition-all hover:shadow-md">
                <div className="bg-amber-50 border-l-4 border-amber-300 px-4 py-3 font-medium flex items-center justify-between">
                  <span className="flex items-center">
                    <FaBirthdayCake className="mr-2 text-amber-700" />
                    {t("childInfo", "Child Information")}
                  </span>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  <InfoItem
                    label={t("guardianName", "Guardian Name")}
                    value={extendedUser.guardian_name || "N/A"}
                    icon={<FiUser />}
                  />
                  <InfoItem
                    label={t("guardianPhone", "Guardian Phone")}
                    value={extendedUser.guardian_phone || "N/A"}
                    icon={<FiPhone />}
                  />
                  <InfoItem
                    label={t("guardianId", "Guardian ID")}
                    value={extendedUser.guardian_id || "N/A"}
                    icon={<FaIdCard />}
                  />
                  <InfoItem
                    label={t("dateOfBirth", "Date of Birth")}
                    value={
                      extendedUser.date_of_birth
                        ? formatDate(extendedUser.date_of_birth)
                        : "N/A"
                    }
                    icon={<FiCalendar />}
                  />
                  <InfoItem
                    label={t("physicalDescription", "Physical Description")}
                    value={extendedUser.physical_description || "N/A"}
                    icon={<FiFileText />}
                  />
                  <InfoItem
                    label={t("lastClothes", "Last Clothes")}
                    value={extendedUser.last_clothes || "N/A"}
                    icon={<FaUserTag />}
                  />
                  <InfoItem
                    label={t("areaOfDisappearance", "Area of Disappearance")}
                    value={extendedUser.area_of_disappearance || "N/A"}
                    icon={<FiMap />}
                  />
                  <InfoItem
                    label={t("lastSeenTime", "Last Seen Time")}
                    value={
                      extendedUser.last_seen_time
                        ? formatDate(extendedUser.last_seen_time)
                        : "N/A"
                    }
                    icon={<FiClock />}
                  />
                </div>
              </div>
            )}

            {/* Case information card */}
            {hasCaseDetails && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-red-100 transition-all hover:shadow-md">
                <div className="bg-red-50 border-l-4 border-red-300 px-4 py-3 font-medium flex items-center justify-between">
                  <span className="flex items-center">
                    <FiFileText className="mr-2 text-red-700" />
                    {t("caseInfo", "Case Information")}
                  </span>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {caseDetails.map((detail, index) => (
                    <InfoItem
                      key={`case-${index}`}
                      label={detail.label}
                      value={detail.value}
                      icon={detail.icon}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Travel information card */}
            {hasTravelDetails && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-green-100 transition-all hover:shadow-md">
                <div className="bg-green-50 border-l-4 border-green-300 px-4 py-3 font-medium flex items-center justify-between">
                  <span className="flex items-center">
                    <FiMap className="mr-2 text-green-700" />
                    {t("travelInfo", "Travel Information")}
                  </span>
                </div>
                <div className="p-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                  {travelDetails.map((detail, index) => (
                    <InfoItem
                      key={`travel-${index}`}
                      label={detail.label}
                      value={detail.value}
                      icon={detail.icon}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right column - Vehicle details and system info */}
          <div>
            {/* Vehicle details card */}
            {hasVehicleDetails && (
              <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-blue-100 mb-6 transition-all hover:shadow-md">
                <div className="bg-blue-50 border-l-4 border-blue-300 px-4 py-3 font-medium flex items-center justify-between">
                  <span className="flex items-center">
                    <FiTruck className="mr-2 text-blue-700" />
                    {t("vehicleInfo", "Vehicle Information")}
                  </span>
                </div>
                <div className="p-4 space-y-3">
                  {vehicleDetails.map((detail, index) => (
                    <InfoItem
                      key={`vehicle-${index}`}
                      label={detail.label}
                      value={detail.value}
                      icon={detail.icon}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* System info card */}
            <div className="bg-white rounded-xl shadow-sm overflow-hidden border border-gray-100 mb-6 transition-all hover:shadow-md">
              <div className="bg-gray-50 border-l-4 border-gray-300 px-4 py-3 font-medium flex items-center justify-between">
                <span className="flex items-center">
                  <FiLayers className="mr-2 text-gray-700" />
                  {t("systemInfo", "System Information")}
                </span>
              </div>
              <div className="p-4 space-y-3">
                <InfoItem
                  label={t("userId", "User ID")}
                  value={user.id}
                  monospace={true}
                  copyable={true}
                  icon={<FiHash />}
                />
                {user.face_id && (
                  <InfoItem
                    label={t("faceId", "Face ID")}
                    value={user.face_id}
                    monospace={true}
                    copyable={true}
                    icon={<FiCamera />}
                  />
                )}
                {user.face_registered_date && (
                  <InfoItem
                    label={t("faceRegistered", "Face Registered")}
                    value={formatDate(
                      ensureDateString(user.face_registered_date) ||
                        new Date().toString()
                    )}
                    icon={<FiCalendar />}
                  />
                )}
                {user.face_recognition_rate && (
                  <InfoItem
                    label={t("recognitionRate", "Recognition Rate")}
                    value={`${user.face_recognition_rate}%`}
                    icon={<FiPercent />}
                  />
                )}
                <InfoItem
                  label={t("created", "Created")}
                  value={formatDate(
                    ensureDateString(user.created_at) || new Date().toString()
                  )}
                  icon={<FiCalendar />}
                />
                {user.updated_at && (
                  <InfoItem
                    label={t("updated", "Updated")}
                    value={formatRelativeTime(
                      ensureDateString(user.updated_at) || new Date().toString()
                    )}
                    icon={<FiClock />}
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Delete confirmation modal */}
      <Modal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        title={t("deleteConfirmation", "Delete User")}
      >
        <div className="p-6">
          <div className="flex items-center text-red-600 mb-4">
            <FiAlertCircle className="text-3xl mr-4" />
            <p className="font-medium">
              {t(
                "deleteWarning",
                "Are you sure you want to delete this user? This action cannot be undone."
              )}
            </p>
          </div>
          <p className="mb-6 text-gray-600">
            {user.name || t("unknownUser", "Unknown User")}
            {user.employee_id && ` (${user.employee_id})`}
          </p>
          <div className="flex justify-end gap-3">
            <Button
              variant="secondary"
              onClick={() => setIsDeleteModalOpen(false)}
            >
              {t("common:buttons.cancel", "Cancel")}
            </Button>
            <Button variant="danger" onClick={handleDeleteUser}>
              {t("common:buttons.delete", "Delete")}
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default OptimizedUserDetail;
