// src/app/users-table/page.tsx
"use client";

import { useState, useEffect, useCallback } from "react";
import CandidateForm from "../../components/CandidateForm";
import AssignCourseForm from "../../components/AssignCourseForm";
import AssignInternshipForm from "../../components/AssignInternshipForm";
import ManageTagsForm from "../../components/ManageTagsForm";
import { DatabaseUser } from "../../lib/types";

interface Pagination {
  page: number;
  limit: number;
  total: number;
  pages: number;
}

export default function UsersTable() {
  const [loading, setLoading] = useState(true);
  const [users, setUsers] = useState<DatabaseUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    page: 1,
    limit: 10,
    total: 0,
    pages: 0,
  });
  const [search, setSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAssignCourseOpen, setIsAssignCourseOpen] = useState(false);
  const [isAssignInternshipOpen, setIsAssignInternshipOpen] = useState(false);
  const [isManageTagsOpen, setIsManageTagsOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState<DatabaseUser | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [usersLoading, setUsersLoading] = useState(false);
  const [currentUserType, setCurrentUserType] = useState<string | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500);

    return () => {
      clearTimeout(handler);
    };
  }, [search]);

  useEffect(() => {
    // Check authentication
    fetch("/api/user")
      .then((res) => {
        if (!res.ok) {
          window.location.href = "/login";
          return;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          setCurrentUserType(data.user?.type ?? null);
          setLoading(false);
        }
      })
      .catch(() => {
        window.location.href = "/login";
      });
  }, []);

  const fetchUsers = useCallback(async () => {
    setUsersLoading(true);
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
        search: debouncedSearch,
      });

      const response = await fetch(`/api/users?${params}`);
      const data = await response.json();

      if (response.ok) {
        setUsers(data.users);
        setPagination(data.pagination);
      }
    } catch (error) {
      console.error("Error fetching users:", error);
    }
    setUsersLoading(false);
  }, [pagination.page, pagination.limit, debouncedSearch]);

  useEffect(() => {
    if (!loading) {
      fetchUsers();
    }
  }, [fetchUsers, loading]);

  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearch(e.target.value);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setPagination((prev) => ({ ...prev, page: newPage }));
  };

  const handleCreateNew = () => {
    setSelectedUser(null);
    setIsEditing(false);
    setIsFormOpen(true);
  };

  const handleEditUser = (user?: DatabaseUser) => {
    const userToEdit = user || selectedUser;
    if (userToEdit) {
      setSelectedUser(userToEdit);
      setIsEditing(true);
      setIsFormOpen(true);
    }
  };

  const handleAssignCourse = () => {
    if (selectedUser) {
      setIsAssignCourseOpen(true);
    }
  };

  const handleAssignInternship = () => {
    if (selectedUser) {
      setIsAssignInternshipOpen(true);
    }
  };

  const handleManageTags = () => {
    if (selectedUser) {
      setIsManageTagsOpen(true);
    }
  };

  const handleRowClick = (user: DatabaseUser) => {
    setSelectedUser(user);
  };

  const handleFormSuccess = () => {
    fetchUsers();
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatDateOfBirth = (dateString?: string) => {
    if (!dateString) return "-";
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`transition-all duration-300 ease-in-out ${
        isFormOpen ||
        isAssignCourseOpen ||
        isAssignInternshipOpen ||
        isManageTagsOpen
          ? "mr-[400px]"
          : ""
      }`}
    >
      <div className="max-w-full mx-auto py-6 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">
              User Management
            </h1>
            <p className="mt-1 text-gray-600">
              Manage candidates and recruiters
            </p>
          </div>
          <div className="mt-4 sm:mt-0 flex space-x-3">
              <button
                onClick={() => handleEditUser()}
                disabled={!selectedUser}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedUser
                    ? "bg-orange-600 hover:bg-orange-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Edit User
              </button>
              <button
                onClick={handleManageTags}
                disabled={!selectedUser}
                className={`px-4 py-2 rounded-md font-medium transition-colors ${
                  selectedUser
                    ? "bg-teal-600 hover:bg-teal-700 text-white"
                    : "bg-gray-300 text-gray-500 cursor-not-allowed"
                }`}
              >
                Edit Tags
              </button>
            <button
              onClick={handleAssignCourse}
              disabled={!selectedUser}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedUser
                  ? "bg-green-600 hover:bg-green-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Manage Courses
            </button>
            <button
              onClick={handleAssignInternship}
              disabled={!selectedUser}
              className={`px-4 py-2 rounded-md font-medium transition-colors ${
                selectedUser
                  ? "bg-purple-600 hover:bg-purple-700 text-white"
                  : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Manage Internships
            </button>
            <button
              onClick={handleCreateNew}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md font-medium"
            >
              Add Users
            </button>
          </div>
        </div>

        {/* Selected User Info */}
        {selectedUser && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Selected:</strong> {selectedUser.name || "No Name"} (
              {selectedUser.phoneNumber})
              {selectedUser.assignedCourses &&
                selectedUser.assignedCourses.length > 0 && (
                  <span className="ml-2">
                    - <strong>Courses:</strong>{" "}
                    {selectedUser.assignedCourses.length} subscribed
                  </span>
                )}
              {selectedUser.assignedInternships &&
                selectedUser.assignedInternships.length > 0 && (
                  <span className="ml-2">
                    - <strong>Internships:</strong>{" "}
                    {selectedUser.assignedInternships.length} assigned
                  </span>
                )}
            </p>
          </div>
        )}

        {/* Search */}
        <div className="mb-6">
          <input
            type="text"
            placeholder="Search users..."
            value={search}
            onChange={handleSearch}
            className="w-full max-w-md px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Users Table */}
        <div className="bg-white shadow overflow-hidden sm:rounded-md">
          {usersLoading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Name
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Phone Number
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Tags
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Date of Birth
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Created At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Company Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Office Email
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      CIN PAN GST
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Agree to Terms
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Is Recruiter
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Is Verified
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Updated At
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      ID
                    </th>
                    {currentUserType === "admin" && (
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Company ID
                      </th>
                    )}
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Remarks
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {users.map((user) => (
                    <tr
                      key={user._id}
                      onClick={() => handleRowClick(user)}
                      onDoubleClick={() => handleEditUser(user)}
                      className={`hover:bg-gray-50 cursor-pointer transition-colors ${
                        selectedUser?._id === user._id
                          ? "bg-blue-50 border-l-4 border-blue-500"
                          : ""
                      }`}
                    >
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.name}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.phoneNumber}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                        {user.tags && user.tags.length > 0 ? (
                          <div className="flex flex-wrap gap-1">
                            {user.tags.map((tag) => (
                              <span
                                key={typeof tag === "string" ? tag : tag._id}
                                className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                              >
                                {typeof tag === "string" ? "..." : tag.name}
                              </span>
                            ))}
                          </div>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDateOfBirth(user.dateOfBirth)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.createdAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-blue-600">
                        {user.email || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.companyEmail || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.officeEmail || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.cinPanGst || "-"}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.agreeToTerms ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isRecruiter ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {user.isVerified ? (
                          <span className="text-green-600">✓</span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(user.updatedAt)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {user._id.slice(-8)}...
                      </td>
                      {currentUserType === "admin" && (
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 font-mono">
                          {user.company_id || "-"}
                        </td>
                      )}
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {user.remarks || "-"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {pagination.pages > 1 && (
          <div className="mt-6 flex items-center justify-between">
            <div className="text-sm text-gray-700">
              Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
              {Math.min(pagination.page * pagination.limit, pagination.total)}{" "}
              of {pagination.total} results
            </div>
            <div className="flex space-x-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>

              {[...Array(pagination.pages)].map((_, index) => {
                const page = index + 1;
                return (
                  <button
                    key={page}
                    onClick={() => handlePageChange(page)}
                    className={`px-3 py-2 text-sm rounded-md ${
                      page === pagination.page
                        ? "bg-blue-600 text-white"
                        : "bg-white border border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {page}
                  </button>
                );
              })}

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.pages}
                className="px-3 py-2 text-sm bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Candidate Form Slide Panel */}
      <CandidateForm
        isOpen={isFormOpen}
        onClose={() => {
          setIsFormOpen(false);
          setSelectedUser(null);
        }}
        onSuccess={handleFormSuccess}
        user={selectedUser}
        isEditing={isEditing}
      />

      {/* Assign Course Form Slide Panel */}
      <AssignCourseForm
        isOpen={isAssignCourseOpen}
        onClose={() => {
          setIsAssignCourseOpen(false);
        }}
        onSuccess={handleFormSuccess}
        user={selectedUser}
      />

      {/* Assign Internship Form Slide Panel */}
      <AssignInternshipForm
        isOpen={isAssignInternshipOpen}
        onClose={() => {
          setIsAssignInternshipOpen(false);
        }}
        onSuccess={handleFormSuccess}
        user={selectedUser}
      />

      {/* Manage Tags Form Slide Panel */}
      <ManageTagsForm
        isOpen={isManageTagsOpen}
        onClose={() => {
          setIsManageTagsOpen(false);
          // Don't clear selected user here as we might want to edit again
        }}
        onSuccess={handleFormSuccess}
        user={selectedUser}
      />
    </div>
  );
}
