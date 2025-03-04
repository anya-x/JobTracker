import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ApplicationForm from "../components/ApplicationForm";
import ApplicationCard from "../components/ApplicationCard";
import api from "../utils/api";
import KanbanBoard from "../components/KanbanBoard";
import Charts from "../components/Charts";
import Interview from "../components/Interview";
import EmptyState from "../components/EmptyState";
import LoadingSkeleton from "../components/LoadingSkeleton";
import AdvancedFilters from "../components/AdvancedFilters";
import toast from "react-hot-toast";
import Pagination from "../components/Pagination";

const Dashboard = () => {
  const { user, logout } = useAuth();
  const [applications, setApplications] = useState([]);
  const [filteredApplications, setFilteredApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editingApplication, setEditingApplication] = useState(null);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [searchQuery, setSearchQuery] = useState("");
  const [viewMode, setViewMode] = useState("cards");
  const [advancedFilters, setAdvancedFilters] = useState(null);
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const [currentPage, setCurrentPage] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, filterStatus, searchQuery, advancedFilters]);

  const fetchApplications = async (page = 0) => {
    try {
      const response = await api.get(`/applications?page=${page}&size=21`);
      setApplications(response.data.applications);
      setCurrentPage(response.data.currentPage);
      setTotalPages(response.data.totalPages);
      setTotalItems(response.data.totalItems);
    } catch (err) {
      toast.error("Failed to load applications");
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    if (!advancedFilters) {
      if (filterStatus !== "ALL") {
        if (filterStatus === "INTERVIEW") {
          filtered = filtered.filter(
            (app) =>
              app.status === "INTERVIEW" ||
              app.status === "SCREENING" ||
              app.status === "PHONE_SCREEN"
          );
        } else {
          filtered = filtered.filter((app) => app.status === filterStatus);
        }
      }

      if (searchQuery) {
        filtered = filtered.filter(
          (app) =>
            app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
            app.position.toLowerCase().includes(searchQuery.toLowerCase())
        );
      }
    }

    if (advancedFilters) {
      if (advancedFilters.status && advancedFilters.status !== "ALL") {
        filtered = filtered.filter(
          (app) => app.status === advancedFilters.status
        );
      }

      if (advancedFilters.startDate) {
        filtered = filtered.filter((app) => {
          if (!app.appliedDate) return false;

          const appDate = new Date(app.appliedDate);
          const startDate = new Date(advancedFilters.startDate);

          appDate.setHours(0, 0, 0, 0);
          startDate.setHours(0, 0, 0, 0);

          return appDate >= startDate;
        });
      }

      if (advancedFilters.endDate) {
        filtered = filtered.filter((app) => {
          if (!app.appliedDate) return false;

          const appDate = new Date(app.appliedDate);
          const endDate = new Date(advancedFilters.endDate);

          appDate.setHours(0, 0, 0, 0);
          endDate.setHours(0, 0, 0, 0);

          return appDate <= endDate;
        });
      }
      if (advancedFilters.location) {
        filtered = filtered.filter(
          (app) =>
            app.location &&
            app.location
              .toLowerCase()
              .includes(advancedFilters.location.toLowerCase())
        );
      }
      if (advancedFilters.priority) {
        filtered = filtered.filter(
          (app) =>
            app.priority && app.priority >= parseInt(advancedFilters.priority)
        );
      }

      if (advancedFilters.minSalary || advancedFilters.maxSalary) {
        filtered = filtered.filter((app) => {
          if (!app.salary) return false;

          const salaryNumbers = app.salary.match(/\d+/g);
          if (!salaryNumbers || salaryNumbers.length === 0) return false;

          const minSalary = parseInt(salaryNumbers[0].replace(/,/g, ""));
          const maxSalary =
            salaryNumbers.length > 1
              ? parseInt(salaryNumbers[1].replace(/,/g, ""))
              : minSalary;

          const filterMin = advancedFilters.minSalary
            ? parseInt(advancedFilters.minSalary)
            : 0;
          const filterMax = advancedFilters.maxSalary
            ? parseInt(advancedFilters.maxSalary)
            : Infinity;

          return maxSalary >= filterMin && minSalary <= filterMax;
        });
      }
    }

    setFilteredApplications(filtered);
  };

  const handleApplyAdvanced = (filters) => {
    console.log("Applying filters:", filters); // Debug log
    setAdvancedFilters(filters);
    setFilterStatus("ALL");
    setSearchQuery("");
    toast.success("Filters applied");
  };

  const handleResetAdvanced = () => {
    setAdvancedFilters(null);
    setFilterStatus("ALL");
    setSearchQuery("");
    setShowAdvancedFilters(false);
    toast.info("Filters reset");
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingApplication(null);
    toast.success(
      editingApplication ? "Application updated!" : "Application created!"
    );
    fetchApplications();
  };

  const handleEdit = (application) => {
    setEditingApplication(application);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        await api.delete(`/applications/${id}`);
        toast.success("Application deleted");
        fetchApplications();
      } catch (err) {
        toast.error("Failed to delete application");
      }
    }
  };

  const statusCounts = {
    ALL: applications.length,
    SAVED: applications.filter((a) => a.status === "SAVED").length,
    APPLIED: applications.filter((a) => a.status === "APPLIED").length,
    INTERVIEW: applications.filter(
      (a) =>
        a.status === "INTERVIEW" ||
        a.status === "SCREENING" ||
        a.status === "PHONE_SCREEN"
    ).length,
    OFFER: applications.filter((a) => a.status === "OFFER").length,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Navbar */}
      <nav className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16">
            <div className="flex items-center">
              <h1 className="text-xl font-bold text-gray-900">JobTracker</h1>
            </div>
            <div className="flex items-center space-x-4">
              <span className="text-gray-700">
                {user?.firstName} {user?.lastName}
              </span>
              <button
                onClick={logout}
                className="text-gray-600 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {/* Header */}
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-2xl font-bold text-gray-900">
              My Applications
            </h2>
            <button
              onClick={() => {
                setEditingApplication(null);
                setShowForm(true);
              }}
              className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
            >
              + New Application
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
            {[
              {
                label: "Total",
                value: statusCounts.ALL,
                status: "ALL",
                color: "blue",
              },
              {
                label: "Saved",
                value: statusCounts.SAVED,
                status: "SAVED",
                color: "gray",
              },
              {
                label: "Applied",
                value: statusCounts.APPLIED,
                status: "APPLIED",
                color: "yellow",
              },
              {
                label: "Interview",
                value: statusCounts.INTERVIEW,
                status: "INTERVIEW",
                color: "purple",
              },
              {
                label: "Offer",
                value: statusCounts.OFFER,
                status: "OFFER",
                color: "green",
              },
            ].map((stat) => (
              <div
                key={stat.status}
                onClick={() => {
                  setFilterStatus(stat.status);
                  setAdvancedFilters(null);
                  setShowAdvancedFilters(false);
                }}
                className={`bg-white p-4 rounded-lg shadow cursor-pointer transition ${
                  filterStatus === stat.status && !advancedFilters
                    ? "ring-2 ring-indigo-500"
                    : ""
                }`}
              >
                <div className="text-sm text-gray-600">{stat.label}</div>
                <div className="text-2xl font-bold text-gray-900">
                  {stat.value}
                </div>
              </div>
            ))}
          </div>

          {/* Search */}
          <div className="mb-4">
            <input
              type="text"
              placeholder="Search by company or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              disabled={!!advancedFilters}
              className={`w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 ${
                advancedFilters ? "bg-gray-100 cursor-not-allowed" : ""
              }`}
            />
            {advancedFilters && (
              <p className="text-sm text-gray-500 mt-1">
                Basic search disabled while advanced filters are active
              </p>
            )}
          </div>

          {/* Advanced Filters Toggle */}
          <div className="mb-4">
            <button
              onClick={() => setShowAdvancedFilters((prev) => !prev)}
              className="text-sm text-indigo-600 hover:text-indigo-800 font-medium"
            >
              {showAdvancedFilters ? "▼ Hide" : "▶ Show"} Advanced Filters
              {advancedFilters && " ✓"}
            </button>
            {advancedFilters && (
              <span className="ml-3 text-sm text-green-600 font-medium">
                Active filters applied
              </span>
            )}
          </div>

          {/* Advanced Filters Component */}
          {showAdvancedFilters && (
            <AdvancedFilters
              onApply={handleApplyAdvanced}
              onReset={handleResetAdvanced}
            />
          )}

          {/* View Toggle */}
          <div className="flex justify-end mb-4">
            <div className="inline-flex rounded-md shadow-sm" role="group">
              <button
                onClick={() => setViewMode("cards")}
                className={`px-4 py-2 text-sm font-medium border ${
                  viewMode === "cards"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                } rounded-l-lg`}
              >
                Cards
              </button>
              <button
                onClick={() => setViewMode("kanban")}
                className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${
                  viewMode === "kanban"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Kanban
              </button>
              <button
                onClick={() => {
                  if (filterStatus === "ALL" && !advancedFilters) {
                    setViewMode("stats");
                  }
                }}
                disabled={filterStatus !== "ALL" || !!advancedFilters}
                className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${
                  viewMode === "stats"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : filterStatus !== "ALL" || advancedFilters
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                } transition-colors`}
                title={
                  filterStatus !== "ALL" || advancedFilters
                    ? "Stats only available when viewing all applications without filters"
                    : "View statistics"
                }
              >
                Stats
              </button>
              <button
                onClick={() => setViewMode("interviews")}
                className={`px-4 py-2 text-sm font-medium border-t border-b border-r rounded-r-lg ${
                  viewMode === "interviews"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                }`}
              >
                Interviews
              </button>
            </div>
          </div>

          {/* Form Modal */}
          {showForm && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
              <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6">
                <h3 className="text-lg font-bold mb-4">
                  {editingApplication ? "Edit Application" : "New Application"}
                </h3>
                <ApplicationForm
                  application={editingApplication}
                  onSuccess={handleFormSuccess}
                  onCancel={() => {
                    setShowForm(false);
                    setEditingApplication(null);
                  }}
                />
              </div>
            </div>
          )}

          {/* Applications List/Kanban/Stats/Interviews */}
          {loading ? (
            <LoadingSkeleton />
          ) : filteredApplications.length === 0 ? (
            searchQuery || filterStatus !== "ALL" || advancedFilters ? (
              <EmptyState
                icon="🔍"
                title="No matches found"
                description="Try adjusting your search or filters"
              />
            ) : (
              <EmptyState
                icon="📝"
                title="No applications yet"
                description="Start tracking your job applications to see them here"
                action={{
                  label: "+ Add Your First Application",
                  onClick: () => {
                    setEditingApplication(null);
                    setShowForm(true);
                  },
                }}
              />
            )
          ) : viewMode === "interviews" ? (
            <Interview applications={applications} />
          ) : viewMode === "stats" ? (
            <Charts applications={applications} />
          ) : viewMode === "kanban" ? (
            <KanbanBoard
              applications={filteredApplications}
              onUpdate={fetchApplications}
              onEdit={handleEdit}
              onDelete={handleDelete}
            />
          ) : (
            <>
              {/* Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredApplications.map((app) => (
                  <ApplicationCard
                    key={app.id}
                    application={app}
                    onEdit={handleEdit}
                    onDelete={handleDelete}
                  />
                ))}
              </div>

              {/* Pagination */}
              {viewMode === "cards" && totalPages > 1 && (
                <div className="mt-6">
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={(page) => {
                      setCurrentPage(page);
                      fetchApplications(page);
                    }}
                  />
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
