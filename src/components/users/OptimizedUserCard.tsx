import React, { memo, useMemo, useState } from "react";
import { useTranslation } from "react-i18next";
import {
  FiClock,
  FiEdit2,
  FiTrash2,
  FiMail,
  FiPhone,
  FiActivity,
  FiAward,
  FiUser,
  FiEye,
  FiBriefcase,
  FiHash,
  FiCalendar,
  FiCamera,
  FiKey,
  FiTruck,
  FiLock,
  FiMoreVertical,
  FiEdit,
} from "react-icons/fi";
import { User } from "../../types";
import { UserStatus, type UserRoleLevel } from "../users/types";
import { Badge, Tooltip, Button } from "../common";
import {
  formatDate,
  formatRelativeTime,
  getUserImageUrl,
  getUserActivityStatus,
  getActivityStatusColor,
  getUserStatusColor,
} from "./utils/formatters";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useUserContext } from "../../context/UserContext";
import useUserPermissions from "../../hooks/useUserPermissions";
import useUserImage from "../../hooks/useUserImage";
import UserAvatar from "./UserAvatar";

// Extend the User type locally to add our custom properties
interface ExtendedUser extends Omit<User, "face_id"> {
  face_id?: string | boolean;
  status?: UserStatus;
  profile_completion?: number;
  date_registered?: string;
  last_login?: string;
  email?: string;
  phone?: string;
  access_level?: number;
  permissions?: string[];
  vehicle_model?: string;
}

/**
 * Type for user card props
 */
interface UserCardProps {
  user: User;
  compact?: boolean;
  extended?: boolean;
  className?: string;
  apiUrl?: string;
  onClick?: (user: User) => void;
  onEdit?: (user: User) => void;
  onDelete?: (user: User) => void;
  selected?: boolean;
  isDeleting?: boolean;
}

/**
 * InfoItem component for consistent formatting
 */
interface InfoItemProps {
  label: string;
  value: React.ReactNode;
  icon: React.ComponentType<any>;
  monospace?: boolean;
  className?: string;
}

const InfoItem = memo(
  ({
    label,
    value,
    icon: Icon,
    monospace = false,
    className = "",
  }: InfoItemProps) => (
    <div className={`flex items-start space-x-3 ${className}`}>
      <span className="text-gray-500 flex-shrink-0 mt-0.5">
        <Icon size={16} />
      </span>
      <div>
        <div className="text-xs text-gray-500 mb-0.5">{label}</div>
        <div
          className={`text-gray-700 ${monospace ? "font-mono text-sm" : ""}`}
        >
          {value}
        </div>
      </div>
    </div>
  )
);

InfoItem.displayName = "InfoItem";

/**
 * Activity badge component
 */
const ActivityBadge = memo(({ status }: { status: string }) => {
  const colors = {
    today: "bg-green-100 text-green-800 border-green-200",
    recent: "bg-blue-100 text-blue-800 border-blue-200",
    inactive: "bg-amber-100 text-amber-800 border-amber-200",
    never: "bg-gray-100 text-gray-800 border-gray-200",
  };

  const color =
    colors[status as keyof typeof colors] ||
    "bg-gray-100 text-gray-800 border-gray-200";

  return (
    <span
      className={`px-2 py-1 rounded-full text-xs font-medium border ${color}`}
    >
      {status}
    </span>
  );
});

ActivityBadge.displayName = "ActivityBadge";

// Cast function to safely convert between types
const asUser = (user: ExtendedUser): User => {
  // Create a copy to avoid modifying the original
  const copy = { ...user };

  // Convert boolean face_id to string if needed
  if (typeof copy.face_id === "boolean") {
    copy.face_id = copy.face_id ? "true" : undefined;
  }

  return copy as User;
};

/**
 * Highly optimized UserCard component
 * Uses memoization and component splitting for maximum performance
 */
const OptimizedUserCard: React.FC<UserCardProps> = memo(
  ({
    user,
    compact = false,
    extended = false,
    className = "",
    apiUrl,
    onClick,
    onEdit,
    onDelete,
    selected = false,
    isDeleting = false,
  }) => {
    // Cast user to ExtendedUser to access extended properties
    const userExtended = user as ExtendedUser;
    const { t } = useTranslation("users");

    // Memoized values - ensures these computations only run when dependencies change
    const userImageUrl = useMemo(
      () => getUserImageUrl(asUser(userExtended), apiUrl),
      [userExtended, apiUrl]
    );

    // Fix for potential undefined values in user object
    const userName = useMemo(
      () => userExtended.name || t("userCard.unknownName", "Unknown User"),
      [userExtended.name, t]
    );

    const userRole = useMemo(
      () => userExtended.role || "",
      [userExtended.role]
    );

    const userDepartment = useMemo(
      () => userExtended.department || "",
      [userExtended.department]
    );

    const activityStatus = useMemo(
      () => getUserActivityStatus(asUser(userExtended)),
      [userExtended]
    );

    const employeeId = useMemo(
      () => userExtended.employee_id || "",
      [userExtended.employee_id]
    );

    // Format creation date once
    const formattedCreationDate = useMemo(
      () =>
        userExtended.created_at ? formatDate(userExtended.created_at) : "",
      [userExtended.created_at]
    );

    // Relative time for last login
    const lastLoginRelative = useMemo(
      () =>
        userExtended.last_login
          ? formatRelativeTime(userExtended.last_login)
          : "",
      [userExtended.last_login]
    );

    // Event handlers - memoizing to prevent rerenders
    const handleClick = useMemo(
      () =>
        onClick
          ? (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              onClick(asUser(userExtended));
            }
          : undefined,
      [onClick, userExtended]
    );

    const handleEdit = useMemo(
      () =>
        onEdit
          ? (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              onEdit(asUser(userExtended));
            }
          : undefined,
      [onEdit, userExtended]
    );

    const handleDelete = useMemo(
      () =>
        onDelete
          ? (e: React.MouseEvent) => {
              e.preventDefault();
              e.stopPropagation();
              onDelete(asUser(userExtended));
            }
          : undefined,
      [onDelete, userExtended]
    );

    // Compute card classes
    const cardClasses = useMemo(() => {
      let classes = `bg-white rounded-xl shadow-sm hover:shadow-lg 
        transition-all duration-300 border ${
          selected ? "border-blue-400 ring-2 ring-blue-200" : "border-gray-100"
        }
        ${onClick ? "cursor-pointer hover:translate-y-[-3px]" : ""} 
        ${isDeleting ? "opacity-50 pointer-events-none" : ""}
        ${className}`;
      return classes;
    }, [className, onClick, selected, isDeleting]);

    // Render compact card
    if (compact) {
      return (
        <div
          className={`${cardClasses} p-3 flex items-center space-x-3`}
          onClick={handleClick}
        >
          <div className="flex-shrink-0">
            <div className="relative">
              <img
                src={userImageUrl}
                alt={userName}
                className="w-10 h-10 object-cover rounded-full"
                onError={(e) => {
                  e.currentTarget.src =
                    "https://ui-avatars.com/api/?name=" +
                    encodeURIComponent(userName) +
                    "&color=fff&background=3182ce";
                }}
              />
              {userExtended.status && (
                <span
                  className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getUserStatusColor(
                    userExtended.status
                  )}`}
                ></span>
              )}
            </div>
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium text-gray-900 truncate">
              {userName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {userRole || userDepartment
                ? `${userRole}${
                    userRole && userDepartment ? " • " : ""
                  }${userDepartment}`
                : t("userCard.noInfo", "No additional info")}
            </p>
          </div>
          <div className="flex-shrink-0 flex">
            {onEdit && (
              <Tooltip content={t("userCard.edit", "Edit User")}>
                <button
                  type="button"
                  onClick={handleEdit}
                  className="ml-1 text-gray-400 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                >
                  <FiEdit2 size={16} />
                </button>
              </Tooltip>
            )}
            {onDelete && (
              <Tooltip content={t("userCard.delete", "Delete User")}>
                <button
                  type="button"
                  onClick={handleDelete}
                  className="ml-1 text-gray-400 hover:text-red-600 p-1 rounded-full hover:bg-red-50 transition-colors"
                >
                  <FiTrash2 size={16} />
                </button>
              </Tooltip>
            )}
          </div>
        </div>
      );
    }

    // Render full card
    return (
      <div
        className={`${cardClasses} overflow-hidden h-full flex flex-col`}
        onClick={handleClick}
      >
        {/* Card Header with gradient background */}
        <div className="bg-gradient-to-r from-blue-600 to-indigo-700 p-4 text-white">
          <div className="flex justify-between items-start">
            <h3 className="text-lg font-semibold truncate">{userName}</h3>
            {userExtended.status && (
              <span
                className={`px-2 py-1 text-xs font-medium rounded-full ${
                  userExtended.status === "active"
                    ? "bg-green-400 text-white"
                    : userExtended.status === "inactive"
                    ? "bg-gray-400 text-white"
                    : userExtended.status === "locked"
                    ? "bg-red-400 text-white"
                    : "bg-blue-400 text-white"
                }`}
              >
                {userExtended.status === "active"
                  ? t("user:status.active", "Active")
                  : userExtended.status === "inactive"
                  ? t("user:status.inactive", "Inactive")
                  : userExtended.status === "locked"
                  ? t("user:status.suspended", "Suspended")
                  : t("user:status.unknown", "Unknown")}
              </span>
            )}
          </div>
          <div className="flex items-center text-blue-100 text-sm mt-1">
            {userRole && <span>{userRole}</span>}
            {userRole && userDepartment && <span className="mx-1">•</span>}
            {userDepartment && <span>{userDepartment}</span>}
          </div>
        </div>

        {/* Card Body */}
        <div className="p-4 flex-grow">
          <div className="flex items-start mb-4">
            <div className="flex-shrink-0 mr-3">
              <div className="relative">
                <img
                  src={userImageUrl}
                  alt={userName}
                  className="w-16 h-16 object-cover rounded-full border-2 border-white shadow-sm"
                  onError={(e) => {
                    e.currentTarget.src =
                      "https://ui-avatars.com/api/?name=" +
                      encodeURIComponent(userName) +
                      "&color=fff&background=3182ce";
                  }}
                />
                {userExtended.status && (
                  <span
                    className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white ${getUserStatusColor(
                      userExtended.status
                    )}`}
                  ></span>
                )}
                {/* Add badge for face recognition if available */}
                {userExtended.face_id && (
                  <span
                    className="absolute top-0 right-0 w-5 h-5 rounded-full bg-green-500 border-2 border-white flex items-center justify-center"
                    title={t(
                      "faceRecognitionEnabled",
                      "Face Recognition Enabled"
                    )}
                  >
                    <FiCamera className="text-white" size={10} />
                  </span>
                )}
              </div>
            </div>
            <div className="flex-grow">
              <div className="grid grid-cols-1 gap-2">
                {employeeId && (
                  <InfoItem
                    label={t("employeeId", "Employee ID")}
                    value={employeeId}
                    icon={FiHash}
                    monospace={true}
                  />
                )}
                {userExtended.email && (
                  <InfoItem
                    label={t("email", "Email")}
                    value={userExtended.email}
                    icon={FiMail}
                    monospace={false}
                  />
                )}
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-3">
            {/* Display more information */}
            {userExtended.phone && (
              <InfoItem
                label={t("phone", "Phone")}
                value={userExtended.phone}
                icon={FiPhone}
                monospace={false}
              />
            )}

            {userExtended.access_level && (
              <InfoItem
                label={t("accessLevel", "Access Level")}
                value={userExtended.access_level}
                icon={FiLock}
                monospace={false}
              />
            )}

            {formattedCreationDate && (
              <InfoItem
                label={t("registered", "Registered")}
                value={formattedCreationDate}
                icon={FiCalendar}
                monospace={false}
              />
            )}

            {lastLoginRelative && (
              <InfoItem
                label={t("lastSeen", "Last Seen")}
                value={lastLoginRelative}
                icon={FiClock}
                monospace={false}
              />
            )}
          </div>

          {/* Display badges for key attributes */}
          {(userExtended.face_id ||
            userExtended.permissions ||
            userExtended.vehicle_model) && (
            <div className="flex flex-wrap gap-2 mt-4">
              {userExtended.face_id && (
                <span className="inline-flex items-center bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full">
                  <FiCamera className="mr-1" size={12} />
                  {t("biometric", "Biometric")}
                </span>
              )}
              {userExtended.permissions &&
                userExtended.permissions.length > 0 && (
                  <span className="inline-flex items-center bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full">
                    <FiKey className="mr-1" size={12} />
                    {t("withPermissions", "Permissions")}
                  </span>
                )}
              {userExtended.vehicle_model && (
                <span className="inline-flex items-center bg-indigo-100 text-indigo-800 text-xs font-medium px-2 py-1 rounded-full">
                  <FiTruck className="mr-1" size={12} />
                  {t("hasVehicle", "Vehicle")}
                </span>
              )}
            </div>
          )}
        </div>

        {/* Card Footer */}
        <div className="bg-gray-50 p-3 border-t border-gray-100 mt-auto">
          <div className="flex justify-between items-center">
            {onClick && (
              <Button
                size="sm"
                variant="secondary"
                onClick={handleClick}
                icon={FiEye}
              >
                {t("userCard.details", "Details")}
              </Button>
            )}
            <div className="flex space-x-2">
              {onEdit && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={handleEdit}
                  icon={FiEdit2}
                >
                  {t("userCard.edit", "Edit")}
                </Button>
              )}
              {onDelete && (
                <Button
                  size="sm"
                  variant="danger-ghost"
                  onClick={handleDelete}
                  icon={FiTrash2}
                >
                  {t("userCard.delete", "Delete")}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  }
);

OptimizedUserCard.displayName = "OptimizedUserCard";

export default OptimizedUserCard;
