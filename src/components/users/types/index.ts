import { User as BaseUser } from "../../../types";

/**
 * User status options
 */
export type UserStatus = "active" | "inactive" | "pending" | "locked";

/**
 * Extended User interface with additional properties
 */
export interface User extends BaseUser {
  /**
   * User's last login timestamp
   */
  last_login?: string;

  /**
   * User's email address
   */
  email?: string;

  /**
   * User's phone number
   */
  phone?: string;

  /**
   * User's physical address
   */
  address?: string;

  /**
   * User's current status
   */
  status?: UserStatus;

  /**
   * User's profile completion percentage
   */
  profile_completion?: number;

  /**
   * Access level (numeric value)
   */
  access_level?: number;

  /**
   * Date when face was registered
   */
  face_registered_date?: string;

  /**
   * Face recognition success rate percentage
   */
  face_recognition_rate?: number;

  /**
   * URL to the facial recognition image
   */
  face_image_url?: string;

  /**
   * Number of login attempts
   */
  login_count?: number;

  /**
   * Security clearance level
   */
  security_level?: string;

  /**
   * Additional notes about the user
   */
  notes?: string;

  /**
   * Timestamp of last update
   */
  updated_at?: string;

  /**
   * ID or name of user who created this record
   */
  created_by?: string;

  /**
   * User access permissions
   */
  permissions?: string[];

  /**
   * Activity history
   */
  activity_log?: {
    date: string;
    action: string;
    details?: string;
  }[];

  /**
   * Vehicle information
   */
  vehicle_model?: string;
  license_plate?: string;
  vehicle_color?: string;
  license_expiration?: string;

  /**
   * Travel information
   */
  travel_date?: string;
  travel_destination?: string;
  arrival_airport?: string;
  arrival_date?: string;
  flight_number?: string;
  return_date?: string;
}

/**
 * User activity status based on last_login timestamp
 */
export type UserActivityStatus = "today" | "recent" | "inactive" | "never";

/**
 * Props for the UserCard component
 */
export interface UserCardProps {
  /**
   * User data object
   */
  user: User;

  /**
   * Whether the card should render in compact mode
   */
  compact?: boolean;

  /**
   * Whether to show extended information
   */
  extended?: boolean;

  /**
   * Additional CSS classes
   */
  className?: string;

  /**
   * Base API URL for images
   */
  apiUrl?: string;

  /**
   * Click handler for the card
   */
  onClick?: (user: User) => void;

  /**
   * Edit handler
   */
  onEdit?: (user: User) => void;

  /**
   * Delete handler
   */
  onDelete?: (user: User) => void;
}

/**
 * Sort options for user lists
 */
export type UserSortField =
  | "name"
  | "created_at"
  | "department"
  | "role"
  | "last_login"
  | "access_level";

/**
 * Sort direction options
 */
export type SortDirection = "asc" | "desc";

/**
 * Filter options for user lists
 */
export interface UserFilters {
  searchQuery?: string;
  department?: string;
  role?: string;
  status?: UserStatus;
  dateRange?: [Date | null, Date | null];
}

/**
 * UserList view modes
 */
export type UserListViewMode = "grid" | "list" | "table";

/**
 * Props for UserList component
 */
export interface UserListProps {
  /**
   * Whether to use pagination instead of infinite scroll
   */
  usePagination?: boolean;

  /**
   * Initial view mode
   */
  initialViewMode?: UserListViewMode;

  /**
   * Whether to allow selection of users
   */
  selectable?: boolean;

  /**
   * Whether to enable user actions (edit, delete)
   */
  enableActions?: boolean;

  /**
   * API URL for backend services
   */
  apiUrl?: string;
}

/**
 * Props for UserDetail component
 */
export interface UserDetailProps {
  /**
   * User ID to load, if not provided via route
   */
  userId?: string;

  /**
   * Whether the component is in edit mode
   */
  editMode?: boolean;

  /**
   * Whether to show back button
   */
  showBackButton?: boolean;

  /**
   * API URL for backend services
   */
  apiUrl?: string;

  /**
   * Success callback after saving
   */
  onSaved?: (user: User) => void;
}
