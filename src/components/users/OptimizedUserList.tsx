import React, {
  useState,
  useEffect,
  useCallback,
  useRef,
  useReducer,
  useMemo,
} from "react";
import { Link, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import {
  FiSearch,
  FiPlus,
  FiUsers,
  FiRefreshCw,
  FiX,
  FiTrash2,
  FiGrid,
  FiList,
  FiFilter,
  FiSliders,
  FiChevronDown,
  FiCheckCircle,
  FiAlertCircle,
} from "react-icons/fi";
import { User } from "../../types";
import { User as ExtendedUser } from "./types";
import api from "../../services/api";
import { Button, Spinner, Alert, EmptyState, Tooltip, Modal } from "../common";
import { PageHeader } from "../../layout";
import OptimizedUserCard from "./OptimizedUserCard";
import { debounce } from "lodash";
import { useUserContext } from "../../contexts/UserContext";
import {
  userListReducer,
  initialState,
  ITEMS_PER_PAGE,
} from "./state/userListReducer";

// Constants
const API_REQUEST_DEBOUNCE = 1000; // 1 second debounce for API requests

const OptimizedUserList: React.FC = () => {
  const { t } = useTranslation(["users", "common"]);
  const [state, dispatch] = useReducer(userListReducer, initialState);
  const [deleteModalUser, setDeleteModalUser] = useState<User | null>(null);
  const [serverStatus, setServerStatus] = useState<{
    online: boolean;
    message: string;
    checking: boolean;
  }>({
    online: true, // Assume online initially
    message: "",
    checking: false,
  });
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { isUserDeleted, markUserAsDeleted } = useUserContext();

  // Ref to track if an API request has been made for empty state
  const emptyStateChecked = useRef<boolean>(false);
  // Ref to track last request time to prevent rapid consecutive calls
  const lastRequestTime = useRef<number>(0);

  // Additional state for advanced filtering
  const [showFilters, setShowFilters] = useState(false);
  const [selectedDepartments, setSelectedDepartments] = useState<string[]>([]);
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [selectedStatuses, setSelectedStatuses] = useState<string[]>([]);
  const [dateRangeFilter, setDateRangeFilter] = useState<{
    startDate: string;
    endDate: string;
  }>({ startDate: "", endDate: "" });
  const [accessLevelFilter, setAccessLevelFilter] = useState<string[]>([]);

  // Extract unique values for filters
  const availableDepartments = useMemo(
    () => [
      ...new Set(
        (state.allUsers || [])
          .filter((user) => user.department)
          .map((user) => user.department as string)
      ),
    ],
    [state.allUsers]
  );

  const availableRoles = useMemo(
    () => [
      ...new Set(
        (state.allUsers || [])
          .filter((user) => user.role)
          .map((user) => user.role as string)
      ),
    ],
    [state.allUsers]
  );

  const availableStatuses = useMemo(
    () => [
      ...new Set(
        (state.allUsers || [])
          .filter((user) => (user as ExtendedUser).status)
          .map((user) => (user as ExtendedUser).status as string)
      ),
    ],
    [state.allUsers]
  );

  const availableAccessLevels = useMemo(
    () => [
      ...new Set(
        (state.allUsers || [])
          .filter((user) => (user as ExtendedUser).access_level !== undefined)
          .map(
            (user) => (user as ExtendedUser).access_level?.toString() as string
          )
      ),
    ],
    [state.allUsers]
  );

  // Debounced search
  const debouncedSearch = useRef(
    debounce((query: string) => {
      dispatch({ type: "SET_SEARCH_QUERY", payload: query });
    }, 300)
  ).current;

  // Memoized sort and filter function
  const sortAndFilterUsers = useCallback(
    (users: User[]) => {
      if (!users || !users.length) return [];

      // Filter out deleted users first
      let result = [...users].filter((user) => !isUserDeleted(user.id));

      // Apply search filter
      if (state.searchQuery) {
        const query = state.searchQuery.toLowerCase();
        result = result.filter((user) =>
          ["name", "employee_id", "department", "role", "email", "phone"].some(
            (key) => {
              const value = user[key as keyof User];
              return (
                value &&
                typeof value === "string" &&
                value.toLowerCase().includes(query)
              );
            }
          )
        );
      }

      // Apply department filter
      if (selectedDepartments.length > 0) {
        result = result.filter(
          (user) =>
            user.department && selectedDepartments.includes(user.department)
        );
      }

      // Apply role filter
      if (selectedRoles.length > 0) {
        result = result.filter(
          (user) => user.role && selectedRoles.includes(user.role)
        );
      }

      // Apply status filter
      if (selectedStatuses.length > 0) {
        result = result.filter(
          (user) =>
            (user as ExtendedUser).status &&
            selectedStatuses.includes((user as ExtendedUser).status as string)
        );
      }

      // Apply access level filter
      if (accessLevelFilter.length > 0) {
        result = result.filter(
          (user) =>
            (user as ExtendedUser).access_level !== undefined &&
            accessLevelFilter.includes(
              String((user as ExtendedUser).access_level)
            )
        );
      }

      // Apply date range filter
      if (dateRangeFilter.startDate || dateRangeFilter.endDate) {
        result = result.filter((user) => {
          if (!user.created_at) return false;

          const userDate = new Date(user.created_at).getTime();
          const startCondition = dateRangeFilter.startDate
            ? userDate >= new Date(dateRangeFilter.startDate).getTime()
            : true;
          const endCondition = dateRangeFilter.endDate
            ? userDate <= new Date(dateRangeFilter.endDate).getTime()
            : true;

          return startCondition && endCondition;
        });
      }

      // Apply sorting
      result.sort((a, b) => {
        const aValue = a[state.sortField];
        const bValue = b[state.sortField];

        // Handle special case for dates
        if (state.sortField === "created_at") {
          const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
          const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
          return state.sortDirection === "asc" ? dateA - dateB : dateB - dateA;
        }

        // Normal string sorting
        if (typeof aValue === "string" && typeof bValue === "string") {
          return state.sortDirection === "asc"
            ? aValue.localeCompare(bValue)
            : bValue.localeCompare(aValue);
        }

        // Handle undefined or non-string values
        if (!aValue && !bValue) return 0;
        if (!aValue) return state.sortDirection === "asc" ? -1 : 1;
        if (!bValue) return state.sortDirection === "asc" ? 1 : -1;

        return 0;
      });

      return result;
    },
    [
      state.searchQuery,
      state.sortField,
      state.sortDirection,
      isUserDeleted,
      selectedDepartments,
      selectedRoles,
      selectedStatuses,
      accessLevelFilter,
      dateRangeFilter,
    ]
  );

  // Load initial data
  const loadUsers = useCallback(async () => {
    const now = Date.now();

    // Prevent loading if another request was made recently
    if (now - lastRequestTime.current < API_REQUEST_DEBOUNCE) {
      console.log("Skipping API request - too soon after previous request");
      return;
    }

    // Set last request time
    lastRequestTime.current = now;

    dispatch({ type: "FETCH_INIT" });

    let retryCount = 0;
    const MAX_RETRIES = 2;

    while (retryCount <= MAX_RETRIES) {
      try {
        // If retrying, add delay with exponential backoff
        if (retryCount > 0) {
          console.log(
            `Retry attempt ${retryCount}/${MAX_RETRIES} for getting users list...`
          );
          await new Promise((resolve) =>
            setTimeout(resolve, Math.pow(2, retryCount) * 1000)
          );
        }

        const response = await api.getUsers({
          page: 1,
          limit: ITEMS_PER_PAGE * 2,
        });

        if (response.status === "success") {
          // Explicitly handle empty users array case
          const users = response.users || [];

          // If we get an empty array, mark that we've checked for empty state
          if (users.length === 0) {
            emptyStateChecked.current = true;
          }

          // Set hasMorePages to false when no users are found to prevent additional loading attempts
          const hasMorePages = response.pagination
            ? response.pagination.page < response.pagination.pages
            : users.length >= ITEMS_PER_PAGE;

          dispatch({
            type: "FETCH_SUCCESS",
            payload: {
              users: users,
              pagination: response.pagination,
              hasMorePages: hasMorePages,
            },
          });

          // Reset the server status since we got a response
          setServerStatus({
            online: true,
            message: "",
            checking: false,
          });

          // Success - break out of retry loop
          break;
        } else if (
          (response.status as string) === "warning" &&
          response.users
        ) {
          // Handle case where we got mock data due to server issues
          console.warn("Using mock data for users list:", response.message);

          dispatch({
            type: "FETCH_SUCCESS",
            payload: {
              users: response.users,
              pagination: undefined,
              hasMorePages: false,
            },
          });

          // Show a warning about using mock data
          setServerStatus({
            online: false,
            message:
              response.message ||
              t(
                "error.apiWarning",
                "Using sample data. Connect to API for real data."
              ),
            checking: false,
          });

          // Even with a warning, we got usable data, so break out of retry loop
          break;
        } else {
          // Handle pure error case - retry
          console.error("API error:", response.message);
          throw new Error(response.message || "API Error");
        }
      } catch (error) {
        if (retryCount === MAX_RETRIES) {
          // Handle final failure after retries
          console.error("Failed to load users after retries:", error);
          dispatch({
            type: "FETCH_ERROR",
            payload: error instanceof Error ? error.message : "Unknown error",
          });

          setServerStatus({
            online: false,
            message:
              error instanceof Error
                ? error.message
                : "Failed to connect to server",
            checking: false,
          });
        }
        retryCount++;
      }
    }
  }, [t]);

  // Load more users for infinite scroll
  const loadMoreUsers = useCallback(async () => {
    if (!state.hasMorePages || state.isLoading) {
      return;
    }

    dispatch({ type: "LOAD_MORE_INIT" });

    try {
      // Calculate next page based on current data
      const nextPage =
        Math.floor((state.allUsers?.length || 0) / ITEMS_PER_PAGE) + 1;

      const response = await api.getUsers({
        page: nextPage,
        limit: ITEMS_PER_PAGE,
      });

      if (response.status === "success") {
        const users = response.users || [];
        const hasMorePages = response.pagination
          ? response.pagination.page < response.pagination.pages
          : false;

        dispatch({
          type: "LOAD_MORE_SUCCESS",
          payload: {
            users: users,
            hasMore: hasMorePages,
          },
        });
      } else {
        throw new Error(response.message || "Failed to load more users");
      }
    } catch {
      // Ignore error details and just dispatch error action
      dispatch({
        type: "LOAD_MORE_ERROR",
      });
    }
  }, [state.hasMorePages, state.isLoading, state.allUsers?.length]);

  // Check for scroll position to load more users
  const handleScroll = useCallback(() => {
    if (!listRef.current || !state.hasMorePages || state.isLoading) return;

    const element = listRef.current;
    const scrollBottom =
      element.scrollHeight - element.scrollTop - element.clientHeight;

    // Load more when within 200px of bottom
    if (scrollBottom < 200) {
      loadMoreUsers();
    }
  }, [loadMoreUsers, state.hasMorePages, state.isLoading]);

  // Set up infinite scroll
  useEffect(() => {
    const currentRef = listRef.current;
    if (currentRef) {
      currentRef.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (currentRef) {
        currentRef.removeEventListener("scroll", handleScroll);
      }
    };
  }, [handleScroll]);

  // Load users on mount
  useEffect(() => {
    loadUsers();
    // Cleanup debounce
    return () => {
      debouncedSearch.cancel();
    };
  }, [loadUsers, debouncedSearch]);

  // Filter the users for display
  const filteredUsers = useMemo(
    () => sortAndFilterUsers(state.allUsers || []),
    [sortAndFilterUsers, state.allUsers]
  );

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    debouncedSearch(e.target.value);
  };

  const handleClearSearch = () => {
    dispatch({ type: "SET_SEARCH_QUERY", payload: "" });
  };

  const confirmDelete = (user: User) => {
    setDeleteModalUser(user);
  };

  const cancelDelete = () => {
    setDeleteModalUser(null);
  };

  const confirmDeleteAction = () => {
    if (deleteModalUser) {
      markUserAsDeleted(deleteModalUser.id);
      setDeleteModalUser(null);
    }
  };

  const toggleViewMode = () => {
    dispatch({
      type: "TOGGLE_VIEW_MODE",
    });
  };

  const handleUserCardClick = (user: User) => {
    navigate(`/users/${user.id}`);
  };

  const toggleDepartmentFilter = (department: string) => {
    setSelectedDepartments((prev) =>
      prev.includes(department)
        ? prev.filter((d) => d !== department)
        : [...prev, department]
    );
  };

  const toggleRoleFilter = (role: string) => {
    setSelectedRoles((prev) =>
      prev.includes(role) ? prev.filter((r) => r !== role) : [...prev, role]
    );
  };

  const toggleStatusFilter = (status: string) => {
    setSelectedStatuses((prev) =>
      prev.includes(status)
        ? prev.filter((s) => s !== status)
        : [...prev, status]
    );
  };

  const toggleAccessLevelFilter = (level: string) => {
    setAccessLevelFilter((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const clearAllFilters = () => {
    setSelectedDepartments([]);
    setSelectedRoles([]);
    setSelectedStatuses([]);
    setAccessLevelFilter([]);
    setDateRangeFilter({ startDate: "", endDate: "" });
    dispatch({ type: "SET_SEARCH_QUERY", payload: "" });
  };

  // Determine if active filters are applied
  const hasActiveFilters =
    state.searchQuery ||
    selectedDepartments.length > 0 ||
    selectedRoles.length > 0 ||
    selectedStatuses.length > 0 ||
    accessLevelFilter.length > 0 ||
    dateRangeFilter.startDate ||
    dateRangeFilter.endDate;

  // Render page header section
  const renderHeader = () => (
    <div className="mb-6">
      <PageHeader
        title={t("pageTitle", "User Management")}
        subtitle={t("pageDescription", "View and manage user profiles")}
        icon={FiUsers}
      />
      <div className="mt-4 flex justify-end">
        <Button variant="primary" icon={FiPlus}>
          <Link to="/register-face">
            {t("addNewUser", "Add New User")}
          </Link>
        </Button>
      </div>
    </div>
  );

  // Render the search & filter bar
  const renderSearchBar = () => (
    <div className="flex flex-col md:flex-row md:items-center gap-3 mb-6">
      <div className="relative flex-grow">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <FiSearch className="text-gray-400" />
        </div>
        <input
          type="text"
          className="block w-full pl-10 pr-12 py-2 border border-gray-300 rounded-lg bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          placeholder={t(
            "searchPlaceholder",
            "Search by name, email, ID, role..."
          )}
          value={state.searchQuery}
          onChange={handleSearchChange}
        />
        {state.searchQuery && (
          <button
            onClick={handleClearSearch}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            aria-label={t("clearSearch", "Clear search")}
          >
            <FiX size={18} />
          </button>
        )}
      </div>

      <Button
        variant="secondary"
        icon={FiFilter}
        className="md:flex-shrink-0 flex"
        onClick={() => setShowFilters(!showFilters)}
      >
        {t("filter", "Filter")}
        <span className="ml-1 bg-blue-100 text-blue-800 text-xs font-medium rounded-full w-5 h-5 flex items-center justify-center">
          {selectedDepartments.length +
            selectedRoles.length +
            selectedStatuses.length +
            accessLevelFilter.length +
            (dateRangeFilter.startDate || dateRangeFilter.endDate ? 1 : 0)}
        </span>
      </Button>

      <div className="relative">
        <Button
          variant="ghost"
          icon={FiSliders}
          onClick={() => {
            /* Toggle dropdown manually */
          }}
        >
          {t("sort", "Sort")}
          <FiChevronDown className="ml-1" />
        </Button>
        {/* Implement dropdown manually instead of using Dropdown component */}
        {/* The dropdown items would go here */}
      </div>
    </div>
  );

  // Render server status alert
  const renderServerStatus = () => {
    if (serverStatus.online || !serverStatus.message) return null;

    return (
      <div className="mb-6">
        <Alert
          variant="warning"
          title={t("common:mockDataWarning", "Note: Displaying sample data")}
          message={serverStatus.message}
        />
        <div className="mt-2">
          <Button
            variant="ghost"
            size="sm"
            icon={FiRefreshCw}
            onClick={loadUsers}
            loading={serverStatus.checking}
          >
            {t("common:retry", "Retry")}
          </Button>
        </div>
      </div>
    );
  };

  // Render loading state
  const renderLoading = () => {
    if (!state.isLoading || (state.allUsers && state.allUsers.length > 0))
      return null;

    return (
      <div className="py-12 flex flex-col items-center justify-center">
        <Spinner size="lg" className="mb-4" />
        <p className="text-gray-600">{t("loading", "Loading users...")}</p>
      </div>
    );
  };

  // Render empty state
  const renderEmpty = () => {
    if (state.isLoading || (state.allUsers && state.allUsers.length > 0))
      return null;

    return (
      <EmptyState
        icon={<FiUsers size={32} />}
        title={t("noUsers", "No Users Found")}
        description={
          state.searchQuery
            ? t("noSearchResults", "No users match your search criteria")
            : t("noUsersYet", "No users have been added to the system yet")
        }
        action={
          state.searchQuery ? (
            <Button variant="secondary" onClick={handleClearSearch}>
              {t("clearSearch", "Clear Search")}
            </Button>
          ) : (
            <Button variant="primary" icon={FiPlus}>
              {t("addFirstUser", "Add Your First User")}
            </Button>
          )
        }
      />
    );
  };

  // Render error state
  const renderError = () => {
    if (!state.error) return null;

    return (
      <div className="text-center py-12">
        <div className="bg-red-50 rounded-xl p-6 inline-flex flex-col items-center max-w-lg mx-auto">
          <FiAlertCircle className="text-red-500 text-4xl mb-4" />
          <h3 className="text-xl font-semibold text-red-700 mb-2">
            {t("errorTitle", "Something went wrong")}
          </h3>
          <p className="text-gray-600 mb-6">
            {state.error ||
              t("errorGeneric", "There was an error loading users")}
          </p>
          <Button variant="primary" icon={FiRefreshCw} onClick={loadUsers}>
            {t("tryAgain", "Try Again")}
          </Button>
        </div>
      </div>
    );
  };

  // Render user list in grid view
  const renderUserGrid = () => {
    if (!filteredUsers.length || state.error) return null;

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {filteredUsers.map((user) => (
          <OptimizedUserCard
            key={user.id}
            user={user}
            onClick={handleUserCardClick}
            onDelete={confirmDelete}
            isDeleting={
              deleteModalUser ? deleteModalUser.id === user.id : false
            }
          />
        ))}
      </div>
    );
  };

  // Render user list in list view
  const renderUserList = () => {
    if (!filteredUsers.length || state.error) return null;

    return (
      <div className="flex flex-col md:flex-row md:flex-wrap gap-4">
        {filteredUsers.map((user) => (
          <div key={user.id} className="w-full md:w-[calc(50%-1rem)]">
            <OptimizedUserCard
              user={user}
              compact
              onClick={handleUserCardClick}
              onDelete={confirmDelete}
              isDeleting={
                deleteModalUser ? deleteModalUser.id === user.id : false
              }
            />
          </div>
        ))}
      </div>
    );
  };

  // Render loading more indicator
  const renderLoadingMore = () => (
    <div className="flex justify-center py-4">
      <Button
        variant="ghost"
        icon={FiRefreshCw}
        onClick={loadMoreUsers}
        className={state.isLoadingMore ? "animate-spin" : ""}
        disabled={state.isLoadingMore}
      >
        {state.isLoadingMore
          ? t("loading", "Loading...")
          : t("loadMore", "Load More")}
      </Button>
    </div>
  );

  // Render the delete confirmation modal
  const renderDeleteModal = () => {
    if (!deleteModalUser) return null;

    return (
      <Modal
        isOpen={!!deleteModalUser}
        onClose={cancelDelete}
        title={t("delete.title", "Delete User")}
      >
        <div className="p-6">
          <p className="text-gray-700 mb-4">
            {t(
              "delete.description",
              "Are you sure you want to delete this user? This action cannot be undone."
            )}
          </p>

          {deleteModalUser && (
            <div className="p-4 bg-gray-50 rounded-lg mt-4 mb-4">
              <h3 className="font-medium text-lg text-gray-900 mb-1">
                {deleteModalUser.name}
              </h3>
              {deleteModalUser.role && (
                <p className="text-gray-600">{deleteModalUser.role}</p>
              )}
              {deleteModalUser.department && (
                <p className="text-gray-600 text-sm">
                  {deleteModalUser.department}
                </p>
              )}
            </div>
          )}

          <div className="flex justify-end space-x-3 mt-6">
            <Button variant="secondary" onClick={cancelDelete}>
              {t("common:cancel", "Cancel")}
            </Button>
            <Button
              variant="danger"
              onClick={confirmDeleteAction}
              icon={FiTrash2}
            >
              {t("common:delete", "Delete")}
            </Button>
          </div>
        </div>
      </Modal>
    );
  };

  // Advanced filters section
  const renderAdvancedFilters = () => {
    if (!showFilters) return null;

    return (
      <div className="mt-3 p-4 bg-gray-50 border border-gray-200 rounded-lg mb-6">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-medium text-gray-800">
            {t("advancedFilters", "Advanced Filters")}
          </h3>

          {hasActiveFilters && (
            <Button
              variant="light"
              size="sm"
              onClick={clearAllFilters}
              className="text-sm text-blue-600"
            >
              {t("clearFilters", "Clear all filters")}
            </Button>
          )}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Department filters */}
          {availableDepartments.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {t("departments", "Departments")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableDepartments.map((department) => (
                  <button
                    key={department}
                    onClick={() => toggleDepartmentFilter(department)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors
                      ${
                        selectedDepartments.includes(department)
                          ? "bg-blue-100 border-blue-300 text-blue-800"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {selectedDepartments.includes(department) && (
                      <FiCheckCircle
                        className="inline-block mr-1.5 text-blue-600"
                        size={14}
                      />
                    )}
                    {department}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Role filters */}
          {availableRoles.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {t("roles", "Roles")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableRoles.map((role) => (
                  <button
                    key={role}
                    onClick={() => toggleRoleFilter(role)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors
                      ${
                        selectedRoles.includes(role)
                          ? "bg-blue-100 border-blue-300 text-blue-800"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {selectedRoles.includes(role) && (
                      <FiCheckCircle
                        className="inline-block mr-1.5 text-blue-600"
                        size={14}
                      />
                    )}
                    {role}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Status filters */}
          {availableStatuses.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {t("statuses", "Status")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableStatuses.map((status) => (
                  <button
                    key={status}
                    onClick={() => toggleStatusFilter(status)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors
                      ${
                        selectedStatuses.includes(status)
                          ? "bg-blue-100 border-blue-300 text-blue-800"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {selectedStatuses.includes(status) && (
                      <FiCheckCircle
                        className="inline-block mr-1.5 text-blue-600"
                        size={14}
                      />
                    )}
                    {status}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Access Level filters */}
          {availableAccessLevels.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-2">
                {t("accessLevels", "Access Levels")}
              </h4>
              <div className="flex flex-wrap gap-2">
                {availableAccessLevels.map((level) => (
                  <button
                    key={level}
                    onClick={() => toggleAccessLevelFilter(level)}
                    className={`px-3 py-1.5 text-sm rounded-full border transition-colors
                      ${
                        accessLevelFilter.includes(level)
                          ? "bg-blue-100 border-blue-300 text-blue-800"
                          : "bg-white border-gray-300 text-gray-700 hover:bg-gray-100"
                      }`}
                  >
                    {accessLevelFilter.includes(level) && (
                      <FiCheckCircle
                        className="inline-block mr-1.5 text-blue-600"
                        size={14}
                      />
                    )}
                    {level}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Date Range filter */}
          <div className="md:col-span-2">
            <h4 className="text-sm font-medium text-gray-700 mb-2">
              {t("dateRange", "Registration Date Range")}
            </h4>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {t("startDate", "Start Date")}
                </label>
                <input
                  type="date"
                  value={dateRangeFilter.startDate}
                  onChange={(e) =>
                    setDateRangeFilter((prev) => ({
                      ...prev,
                      startDate: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">
                  {t("endDate", "End Date")}
                </label>
                <input
                  type="date"
                  value={dateRangeFilter.endDate}
                  onChange={(e) =>
                    setDateRangeFilter((prev) => ({
                      ...prev,
                      endDate: e.target.value,
                    }))
                  }
                  className="w-full p-2 border rounded-md text-sm"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      {renderHeader()}
      {renderSearchBar()}
      {renderAdvancedFilters()}
      {renderServerStatus()}

      <div className="pb-10">
        {state.isLoading &&
          (!state.allUsers || !state.allUsers.length) &&
          renderLoading()}
        {state.error && renderError()}
        {!state.isLoading &&
          !state.error &&
          filteredUsers.length === 0 &&
          renderEmpty()}

        {filteredUsers.length > 0 && (
          <>
            <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 mb-6 px-4 max-w-screen-xl mx-auto">
              <p className="text-gray-700 text-base sm:text-lg">
                {t("showingUsers", "Showing {{count}} users", {
                  count: filteredUsers.length,
                })}
                {hasActiveFilters &&
                  ` ${t("withFilters", "with active filters")}`}
              </p>

              <div className="flex space-x-3">
                <Tooltip content={t("userList.gridView", "Grid View")}>
                  <button
                    onClick={toggleViewMode}
                    className={`p-2 rounded-lg transition ${
                      state.viewMode === "grid"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                    aria-label={t("userList.gridView", "Grid View")}
                  >
                    <FiGrid size={20} />
                  </button>
                </Tooltip>

                <Tooltip content={t("userList.listView", "List View")}>
                  <button
                    onClick={toggleViewMode}
                    className={`p-2 rounded-lg transition ${
                      state.viewMode === "list"
                        ? "bg-blue-200 text-blue-800"
                        : "bg-gray-200 text-gray-600 hover:bg-gray-300"
                    }`}
                    aria-label={t("userList.listView", "List View")}
                  >
                    <FiList size={20} />
                  </button>
                </Tooltip>
              </div>
            </div>

            <div
              ref={listRef}
              className={`px-4 max-w-screen-xl mx-auto ${
                state.viewMode === "grid"
                  ? "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 gap-8"
                  : "flex flex-col gap-6"
              }`}
            >
              {state.viewMode === "grid" ? renderUserGrid() : renderUserList()}
            </div>

            {state.hasMorePages && renderLoadingMore()}
          </>
        )}
      </div>

      {renderDeleteModal()}
    </div>
  );
};

export default OptimizedUserList;
