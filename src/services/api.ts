import axios from "axios";
import {
  ApiResponse,
  RegistrationResponse as RegisterResponse,
  RecognitionResponse as RecognizeResponse,
  UserListResponse,
} from "../types";
import { User } from "../components/users/types";
import { processLargeImage } from "../components/RecognizeFace/hooks/imageUtils";
import { AxiosRequestConfig } from "axios";

// Define an API error interface
interface ApiError extends Error {
  data?: unknown;
}

// API configuration - update with correct paths
const API_URL =
  import.meta.env.VITE_API_URL || "https://backend-fast-api-ai.fly.dev/api";
const SERVER_URL =
  import.meta.env.VITE_API_URL || "https://backend-fast-api-ai.fly.dev";

// Log the server URL for debugging
console.log("API Configuration:", {
  API_URL,
  SERVER_URL,
  VITE_API_URL: import.meta.env.VITE_API_URL,
});

/**
 * Generate mock user data when the backend is unavailable
 * This helps prevent the UI from breaking completely when there are server errors
 */
const mockUsersList = (count = 3): User[] => {
  return Array(count)
    .fill(0)
    .map((_, index) => ({
      id: `mock-${index}`,
      face_id: `mock-face-${index}`,
      name: `Demo User ${index + 1}`,
      employee_id: `EMP${10000 + index}`,
      department: "Demo Department",
      role: "Mock User",
      image_path: undefined,
      created_at: new Date().toISOString(),
    }));
};

// Fix the endpoint path to match the backend API structure
const getEndpointPath = (path: string): string => {
  // Create the full path
  let fullPath;

  // Check if path already has /api prefix
  if (path.startsWith("/api/")) {
    // Path already has /api prefix, use as is
    fullPath = `${SERVER_URL}${path}`;
  } else if (!path.startsWith("/")) {
    // If path doesn't start with /, add /api/ prefix
    fullPath = `${SERVER_URL}/api/${path}`;
  } else {
    // If path starts with / but not /api/, add /api prefix
    fullPath = `${SERVER_URL}/api${path}`;
  }

  console.log(`API Endpoint: ${fullPath}`);
  return fullPath;
};

// Configure axios defaults
axios.defaults.baseURL = API_URL;
axios.defaults.timeout = 30000; // 30 seconds
axios.defaults.headers.common = {
  "Content-Type": "application/json",
  Accept: "application/json",
};

// Create an axios instance with retry capability
const apiClient = axios.create({
  baseURL: API_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
    Accept: "application/json",
  },
});

// Add request interceptor for debugging
apiClient.interceptors.request.use(
  (config) => {
    console.log(
      `API Request: ${config.method?.toUpperCase()} ${config.url}`,
      config
    );
    return config;
  },
  (error) => {
    console.error("API Request Error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for debugging
apiClient.interceptors.response.use(
  (response) => {
    console.log(
      `API Response: ${response.status} ${response.config.url}`,
      response.data ? true : false // Just log if data exists to avoid bloating console
    );
    return response;
  },
  (error) => {
    console.error("API Response Error:", error);
    if (error.response) {
      console.error("Response status:", error.response.status);
    }
    return Promise.reject(error);
  }
);

interface RegisterMetadata {
  employee_id?: string;
  department?: string;
  role?: string;
  train_multiple?: boolean;
  bypass_angle_check?: boolean;
  form_type?: "adult" | "child";
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
  guardian_name?: string;
}

// API object
const api = {
  /**
   * Get the base API URL
   * @returns {string} The base URL for API requests
   */
  getBaseUrl: (): string => {
    return API_URL;
  },

  /**
   * Get the base server URL (without /api)
   * @returns {string} The base server URL
   */
  getServerUrl: (): string => {
    return SERVER_URL;
  },

  /**
   * Register a new face with direct base64 data
   * @param {string} name - User's name
   * @param {string} imageBase64 - Base64 encoded image string
   * @param {RegisterMetadata} metadata - Additional user metadata
   * @returns {Promise<RegisterResponse>} Registration result
   */
  registerFace: async (
    name: string,
    imageBase64: string,
    metadata: RegisterMetadata = {}
  ): Promise<RegisterResponse> => {
    try {
      console.log("Registering face for user:", name);

      // Send the registration request - use the full API path to avoid double /api prefix
      const response = await axios.post(
        `${SERVER_URL}/api/register`,
        {
          name,
          image_base64: imageBase64,
          employee_id: metadata.employee_id,
          department: metadata.department,
          role: metadata.role,
          bypass_angle_check: metadata.bypass_angle_check,
          train_multiple: metadata.train_multiple !== false, // Enable by default unless explicitly disabled
        },
        {
          timeout: 60000, // Increase timeout to 60 seconds for larger images
        }
      );

      console.log("Registration successful:", response.data);

      // Log if multi-angle training was used
      if (response.data.multi_angle_trained) {
        console.log(
          "Successfully trained with multiple angles for better recognition"
        );
      }

      return response.data;
    } catch (error: unknown) {
      console.error("Registration failed:", error);

      if (axios.isAxiosError(error) && error.response) {
        console.error("API Error Response:", {
          status: error.response.status,
          statusText: error.response.statusText,
          data: error.response.data,
          url: error.config?.url,
        });

        const e = new Error(
          error.response.data?.message ||
            error.response.data?.detail ||
            "Registration failed"
        ) as ApiError;
        e.data = error.response.data;
        throw e;
      }
      throw new Error((error as Error).message || "Registration failed");
    }
  },

  /**
   * Register a new face with file upload
   * @param {string} name - User's name
   * @param {File} photoFile - Photo file containing a face
   * @param {RegisterMetadata} metadata - Additional user metadata
   * @returns {Promise<RegisterResponse>} Registration result
   */
  registerFaceWithFile: async (
    name: string,
    photoFile: File,
    metadata: RegisterMetadata = {}
  ): Promise<RegisterResponse> => {
    const MAX_RETRIES = 3;
    let retryCount = 0;
    let lastError: any = null;

    // Validate name before attempting to submit
    if (!name || !name.trim()) {
      console.error("Name is required for registration");
      throw new Error("Name is required");
    }

    // Validate the photo file
    if (!photoFile || photoFile.size === 0) {
      console.error("Invalid photo file for registration");
      throw new Error("Valid photo file is required");
    }

    console.log(`Starting registration with name: "${name}"`);
    console.log(
      `Photo file: ${photoFile.name}, size: ${photoFile.size} bytes, type: ${photoFile.type}`
    );

    while (retryCount <= MAX_RETRIES) {
      try {
        if (retryCount > 0) {
          console.log(
            `Retry attempt ${retryCount}/${MAX_RETRIES} for face registration...`
          );
          // Exponential backoff: wait longer between retries
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
        }

        console.log("Registering face for user with file:", name);
        console.log("Metadata:", metadata);

        // Compress the image first to ensure reasonable size
        const compressedFile = await processLargeImage(photoFile);
        console.log("Image compressed for upload:", {
          originalSize: `${(photoFile.size / 1024).toFixed(2)} KB`,
          compressedSize: `${(compressedFile.size / 1024).toFixed(2)} KB`,
          name: compressedFile.name,
          type: compressedFile.type,
        });

        // Create a FormData object for multipart/form-data
        const formData = new FormData();

        // Ensure name is properly set - this is critical
        formData.append("name", name.trim());
        console.log("Name being sent to server:", name.trim());

        // Add the file with a specific file name to avoid blob conversion issues
        try {
          const safeFile = new File([compressedFile], "face_photo.jpg", {
            type: compressedFile.type || "image/jpeg",
          });
          formData.append("file", safeFile);
        } catch (fileError) {
          console.log("Failed to create safe file, using original:", fileError);
          formData.append("file", compressedFile);
        }

        // Add optional metadata if present using safe append
        const safeAppend = (key: string, value: any) => {
          if (value !== undefined && value !== null && value !== "") {
            formData.append(key, String(value));
          }
        };

        safeAppend("employee_id", metadata.employee_id);
        safeAppend("department", metadata.department);
        safeAppend("role", metadata.role);
        safeAppend(
          "bypass_angle_check",
          metadata.bypass_angle_check ? "true" : undefined
        );
        safeAppend(
          "train_multiple",
          metadata.train_multiple ? "true" : undefined
        );
        safeAppend("form_type", metadata.form_type);

        // Add adult form fields if they exist in metadata
        safeAppend("occupation", metadata.occupation);
        safeAppend("address", metadata.address);
        safeAppend("license_plate", metadata.license_plate);
        safeAppend("vehicle_model", metadata.vehicle_model);
        safeAppend("vehicle_color", metadata.vehicle_color);
        safeAppend("chassis_number", metadata.chassis_number);
        safeAppend("vehicle_number", metadata.vehicle_number);
        safeAppend("license_expiration", metadata.license_expiration);
        safeAppend("case_details", metadata.case_details);
        safeAppend("police_station", metadata.police_station);
        safeAppend("case_number", metadata.case_number);
        safeAppend("judgment", metadata.judgment);
        safeAppend("accusation", metadata.accusation);
        safeAppend("travel_date", metadata.travel_date);
        safeAppend("travel_destination", metadata.travel_destination);
        safeAppend("arrival_airport", metadata.arrival_airport);
        safeAppend("arrival_date", metadata.arrival_date);
        safeAppend("flight_number", metadata.flight_number);
        safeAppend("return_date", metadata.return_date);

        // Add the guardian name directly if present using safeAppend
        safeAppend("guardian_name", metadata.guardian_name);

        // Add child data if present
        if (metadata.child_data) {
          try {
            // Convert child_data object to JSON string to send as a single field
            const childDataJson = JSON.stringify(metadata.child_data);
            formData.append("child_data", childDataJson);
            console.log(
              "Child data JSON:",
              childDataJson.substring(0, 100) +
                (childDataJson.length > 100 ? "..." : "")
            );
          } catch (jsonError) {
            console.error("Failed to stringify child_data:", jsonError);
            // Still try to send individual fields if JSON conversion fails
            Object.entries(metadata.child_data).forEach(([key, value]) => {
              if (value) {
                formData.append(`child_data_${key}`, String(value));
              }
            });
          }
        }

        // Send the registration request - use our new upload endpoint
        console.log(
          "Sending registration request to:",
          `${SERVER_URL}/api/register/upload`
        );

        // Log form data contents for debugging (excluding the file content)
        const formDataLog: Record<string, string> = {};
        formData.forEach((value, key) => {
          if (key !== "file") {
            formDataLog[key] = value as string;
          } else {
            formDataLog[key] = "[File content]";
          }
        });
        console.log("FormData contents:", formDataLog);

        const response = await axios.post(
          `${SERVER_URL}/api/register/upload`,
          formData,
          {
            timeout: 120000, // Increase timeout to 120 seconds for larger images
            headers: {
              "Content-Type": "multipart/form-data",
              Accept: "application/json",
            },
            onUploadProgress: (progressEvent) => {
              const percentCompleted = progressEvent.total
                ? Math.round((progressEvent.loaded * 100) / progressEvent.total)
                : 0;
              console.log(`Upload progress: ${percentCompleted}%`);
            },
          }
        );

        console.log("Registration with file successful:", response.data);
        return response.data;
      } catch (error: unknown) {
        lastError = error;
        const isTimeout =
          axios.isAxiosError(error) &&
          (error.code === "ECONNABORTED" ||
            (error.message && error.message.includes("timeout")));

        // Log detailed error information
        if (axios.isAxiosError(error) && error.response) {
          console.error("API Error Response:", {
            status: error.response.status,
            statusText: error.response.statusText,
            data: error.response.data,
            url: error.config?.url,
          });

          // If it's a 400 error with a "Name is required" message
          if (
            error.response.status === 400 &&
            error.response.data &&
            error.response.data.message === "Name is required"
          ) {
            // Break retry loop for specific validation errors
            console.error("Name validation failed on server side");
            break;
          }
        }

        // Only retry on timeout or network errors
        if (isTimeout || (axios.isAxiosError(error) && !error.response)) {
          retryCount++;
          console.warn(
            `Registration attempt failed (${retryCount}/${MAX_RETRIES}):`,
            isTimeout ? "Request timeout" : "Network error"
          );

          if (retryCount <= MAX_RETRIES) {
            continue; // Try again
          }
        } else {
          // Don't retry for other errors (like validation errors)
          break;
        }
      }
    }

    // If we get here, all retries failed or it was a non-retryable error
    console.error("Registration with file failed after retries:", lastError);

    if (axios.isAxiosError(lastError) && lastError.response) {
      console.error("API Error Response:", {
        status: lastError.response.status,
        statusText: lastError.response.statusText,
        data: lastError.response.data,
        url: lastError.config?.url,
      });

      const e = new Error(
        lastError.response.data?.message ||
          lastError.response.data?.detail ||
          "Registration failed"
      ) as ApiError;
      e.data = lastError.response.data;
      throw e;
    }
    throw new Error((lastError as Error).message || "Registration failed");
  },

  /**
   * Recognize a face
   * @param {File} imageFile - Image file containing a face to recognize
   * @param {Object} options - Additional options for recognition
   * @returns {Promise<RecognizeResponse>} Recognition result
   */
  recognizeFace: async (
    imageFile: File,
    options: {
      preferMethod?: "base64" | "file";
      useMultiAngle?: boolean;
    } = {}
  ): Promise<RecognizeResponse> => {
    try {
      // First compress the image to ensure reasonable size
      const compressedFile = await processLargeImage(imageFile);

      // Log file info for debugging
      console.log(
        `Recognition image prepared: ${(compressedFile.size / 1024).toFixed(
          2
        )}KB`
      );

      // Skip base64 and use direct file upload which is more efficient
      const formData = new FormData();
      formData.append("file", compressedFile);

      if (options.useMultiAngle) {
        formData.append("use_multi_angle", "true");
      }

      // Set a reasonable timeout to prevent hanging
      const requestConfig: AxiosRequestConfig = {
        timeout: 20000, // 20 seconds max
        headers: {
          "Content-Type": "multipart/form-data",
        },
      };

      console.log("API Endpoint: " + getEndpointPath("/recognize"));
      const response = await axios.post(
        getEndpointPath("/recognize"),
        formData,
        requestConfig
      );

      return response.data;
    } catch (error: any) {
      console.error("Face recognition failed:", error.message);

      // Return a structured error response for easier handling
      return {
        recognized: false,
        status: "error",
        message: error.message,
        user: undefined,
        diagnostic: { error_details: error.response?.data || "Unknown error" },
      };
    }
  },

  /**
   * Get a list of all registered users
   * @param {Object} options - Options for pagination
   * @param {number} options.page - Page number (starting from 1)
   * @param {number} options.limit - Number of items per page
   * @returns {Promise<UserListResponse>} User list response
   */
  getUsers: async (
    options = { page: 1, limit: 100 }
  ): Promise<UserListResponse> => {
    const MAX_RETRIES = 2;
    let retryCount = 0;
    let lastError: any = null;

    while (retryCount <= MAX_RETRIES) {
      try {
        if (retryCount > 0) {
          console.log(
            `Retry attempt ${retryCount}/${MAX_RETRIES} for fetching users...`
          );
          // Exponential backoff: wait longer between retries
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
        }

        console.log("Calling getUsers API endpoint");

        // Use the correct API endpoint from the backend - avoid double /api prefix
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 20000); // 20 second timeout

        const params = new URLSearchParams({
          page: options.page.toString(),
          limit: options.limit.toString(),
        });

        // Use getEndpointPath for consistent path formatting
        const response = await axios.get(
          getEndpointPath(`/users?${params.toString()}`),
          {
            signal: controller.signal,
            timeout: 20000,
          }
        );

        clearTimeout(timeoutId);

        console.log("Raw API response:", response.status);

        // Simple normalization to ensure users array exists
        const responseData = response.data || {};

        if (!responseData.users && Array.isArray(responseData.data)) {
          // Support both response formats (users or data)
          responseData.users = responseData.data;
        }

        if (!responseData.users || !Array.isArray(responseData.users)) {
          console.warn("Response missing users array, creating empty array");
          responseData.users = [];
        }

        if (!responseData.status) {
          responseData.status = "success";
        }

        return responseData;
      } catch (error) {
        lastError = error;

        // Check if this is a server error (500) or network/timeout error
        const isServerError =
          axios.isAxiosError(error) && error.response?.status === 500;
        const isNetworkError =
          axios.isAxiosError(error) &&
          (error.code === "ECONNABORTED" ||
            error.message.includes("timeout") ||
            !error.response);

        if (isServerError || isNetworkError) {
          retryCount++;
          console.warn(
            `Getting users failed (${retryCount}/${MAX_RETRIES}):`,
            isServerError ? "Server error (500)" : "Network/timeout error"
          );

          if (retryCount <= MAX_RETRIES) {
            continue; // Try again
          }
        } else {
          // Don't retry for other errors
          break;
        }
      }
    }

    console.error("Error getting users after retries:", lastError);
    console.warn("Using mock data since the server is unavailable");

    // Generate some mock users for a better user experience when the server is down
    const mockUsers = mockUsersList(5);

    // Return mock data with a warning message
    return {
      status: "error",
      message: axios.isAxiosError(lastError)
        ? lastError.response?.status === 500
          ? "Server error: Using demo data. The actual users list is temporarily unavailable."
          : `Request error: ${lastError.message}. Using demo data.`
        : lastError instanceof Error
        ? `${lastError.message}. Using demo data.`
        : "Failed to fetch users. Using demo data.",
      users: mockUsers,
    } as UserListResponse;
  },

  /**
   * Get a specific user by ID
   * @param {string} userId - User ID to fetch
   * @returns {Promise<ApiResponse<User>>} User data response
   */
  getUserById: async (userId: string): Promise<ApiResponse<User>> => {
    const MAX_RETRIES = 2;
    let retryCount = 0;
    let lastError: any = null;

    while (retryCount <= MAX_RETRIES) {
      try {
        if (retryCount > 0) {
          console.log(
            `Retry attempt ${retryCount}/${MAX_RETRIES} for fetching user ${userId}...`
          );
          // Exponential backoff: wait longer between retries
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
        }

        console.log(`Fetching user with ID: ${userId}`);

        // Use the correct API endpoint with consistent path formatting
        const response = await axios.get(getEndpointPath(`/users/${userId}`), {
          timeout: 10000,
        });

        // Log the response for debugging
        console.log(`User API response status:`, response.status);

        // Normalize the response to ensure it has a consistent format
        const responseData = response.data || {};

        // If the response doesn't have a status field, add it
        if (!responseData.status) {
          responseData.status = "success";
        }

        // Support both response formats (user or data property)
        if (responseData.user && !responseData.data) {
          responseData.data = responseData.user;
        } else if (responseData.data && !responseData.user) {
          responseData.user = responseData.data;
        }

        return responseData;
      } catch (error) {
        lastError = error;

        // Check if this is a server error (500) or network/timeout error
        const isServerError =
          axios.isAxiosError(error) && error.response?.status === 500;
        const isNetworkError =
          axios.isAxiosError(error) &&
          (error.code === "ECONNABORTED" ||
            error.message.includes("timeout") ||
            !error.response);

        if (isServerError || isNetworkError) {
          retryCount++;
          console.warn(
            `Getting user ${userId} failed (${retryCount}/${MAX_RETRIES}):`,
            isServerError ? "Server error (500)" : "Network/timeout error"
          );

          if (retryCount <= MAX_RETRIES) {
            continue; // Try again
          }
        } else {
          // Don't retry for other errors
          break;
        }
      }
    }

    console.error(`Error getting user ${userId} after retries:`, lastError);

    // Check if this is a mock user ID
    if (userId.startsWith("mock-")) {
      const mockIndex = parseInt(userId.split("-")[1], 10);
      const mockUser = mockUsersList(mockIndex + 1)[mockIndex];

      // Return the mock user
      return {
        status: "success",
        message: "Using mock user data",
        data: mockUser,
        user: mockUser,
      };
    }

    // For real IDs that failed, return a demo user but with warning status
    console.warn(
      `Using mock data for user ${userId} since the server is unavailable`
    );
    const mockUser = mockUsersList(1)[0];
    mockUser.id = userId; // Use the requested ID
    mockUser.name = `Demo User (ID: ${userId.substring(0, 8)}...)`;

    return {
      status: "error",
      message:
        "Server error: Using demo data. The actual user data is temporarily unavailable.",
      data: mockUser,
      user: mockUser,
    };
  },

  /**
   * Get a user's image with proper CORS handling
   * @param {string} userId - User ID to get image for
   * @returns {Promise<{imageUrl: string}>} The image URL or fallback
   */
  getUserImage: async (userId: string): Promise<{ imageUrl: string }> => {
    try {
      // First try to get user details to check if they have a face_id
      const userResponse = await apiClient.get(`/users/${userId}`);
      const user = userResponse.data?.user;

      if (user?.image_url) {
        // If the user has an image_url, use it directly
        return { imageUrl: user.image_url };
      }

      // Generate a unique timestamp to bust cache
      const timestamp = new Date().getTime();

      // If user has face_id, try to get their face image
      if (user?.face_id) {
        try {
          // Use apiClient with modified error handler to suppress 404 errors in console
          const response = await axios.get(
            `${SERVER_URL}/api/users/${userId}/face-image`,
            {
              responseType: "blob",
              params: { t: timestamp }, // Add timestamp to prevent caching
              validateStatus: (status) => status === 200, // Only consider 200 as success
            }
          );

          if (response.status === 200) {
            const imageUrl = URL.createObjectURL(response.data);
            return { imageUrl };
          }
        } catch (error) {
          // Silently fail, no need to log 404 errors for face images
        }
      }

      // Try to get regular user image as fallback
      try {
        const response = await axios.get(
          `${SERVER_URL}/api/users/${userId}/image`,
          {
            responseType: "blob",
            params: { t: timestamp }, // Add timestamp to prevent caching
            validateStatus: (status) => status === 200, // Only consider 200 as success
          }
        );

        if (response.status === 200) {
          const imageUrl = URL.createObjectURL(response.data);
          return { imageUrl };
        }
      } catch (error) {
        // Silently fail, no need to log errors for fallback images
      }

      // Fallback to ui-avatars if everything else fails
      return {
        imageUrl: `https://ui-avatars.com/api/?name=${encodeURIComponent(
          user?.name || "User"
        )}&size=200&background=3182ce&color=fff`,
      };
    } catch (error) {
      // Only log a generic error message without the full error details
      console.log("Unable to fetch user image, using fallback avatar");

      // Return a default avatar as fallback
      return {
        imageUrl: `https://ui-avatars.com/api/?name=User&size=200&background=3182ce&color=fff`,
      };
    }
  },

  /**
   * Delete a user by ID
   * @param {string} userId - User ID to delete
   * @returns {Promise<ApiResponse>} Delete response
   */
  deleteUser: async (userId: string): Promise<ApiResponse> => {
    try {
      console.log(`Deleting user with ID: ${userId}`);
      // Use the correct API endpoint from the backend
      const response = await axios.delete(getEndpointPath(`/users/${userId}`));

      console.log(`Delete user API response:`, response.status);

      // Normalize response data
      const responseData = response.data || {};
      if (!responseData.status) {
        responseData.status = "success";
      }

      if (!responseData.message) {
        responseData.message = "User deleted successfully";
      }

      return responseData;
    } catch (error) {
      console.error(`Error deleting user ${userId}:`, error);

      // Check if it's an API error with response data
      if (axios.isAxiosError(error) && error.response?.data) {
        const responseData = error.response.data;
        return {
          status: "error",
          message:
            responseData.message || `Failed to delete user with ID ${userId}`,
          ...responseData,
        };
      }

      // Return a formatted error response
      return {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : `Failed to delete user with ID ${userId}`,
      };
    }
  },

  /**
   * Check API health/connectivity
   * @returns {Promise<ApiResponse>} API health response
   */
  checkHealth: async (): Promise<ApiResponse> => {
    try {
      // Use a direct API call to check health
      const response = await apiClient.get(getEndpointPath("/health"), {
        timeout: 5000, // Short timeout for health check
      });
      return response.data;
    } catch (error) {
      console.error("API health check failed:", error);

      return {
        status: "error",
        message: "API health check failed",
      };
    }
  },
};

export default api;
