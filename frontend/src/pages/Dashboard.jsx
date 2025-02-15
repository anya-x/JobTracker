import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import ApplicationForm from "../components/ApplicationForm";
import ApplicationCard from "../components/ApplicationCard";
import api from "../utils/api";
import KanbanBoard from "../components/KanbanBoard";
import Charts from "../components/Charts";

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

  useEffect(() => {
    fetchApplications();
  }, []);

  useEffect(() => {
    filterApplications();
  }, [applications, filterStatus, searchQuery]);

  const fetchApplications = async () => {
    try {
      const response = await api.get("/applications");
      setApplications(response.data);
    } catch (err) {
      console.error("Failed to fetch applications:", err);
    } finally {
      setLoading(false);
    }
  };

  const filterApplications = () => {
    let filtered = applications;

    // Filter by status
    if (filterStatus !== "ALL") {
      filtered = filtered.filter((app) => app.status === filterStatus);
    }

    // Filter by search query
    if (searchQuery) {
      filtered = filtered.filter(
        (app) =>
          app.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
          app.position.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredApplications(filtered);
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingApplication(null);
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
        fetchApplications();
      } catch (err) {
        alert("Failed to delete application");
      }
    }
  };

  const statusCounts = {
    ALL: applications.length,
    SAVED: applications.filter((a) => a.status === "SAVED").length,
    APPLIED: applications.filter((a) => a.status === "APPLIED").length,
    INTERVIEW: applications.filter(
      (a) => a.status === "INTERVIEW" || a.status === "SCREENING"
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
                onClick={() => setFilterStatus(stat.status)}
                className={`bg-white p-4 rounded-lg shadow cursor-pointer transition ${
                  filterStatus === stat.status ? "ring-2 ring-indigo-500" : ""
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
          <div className="mb-6">
            <input
              type="text"
              placeholder="Search by company or position..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>

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
                } rounded-r-lg`}
              >
                Kanban
              </button>
              <button
                onClick={() => {
                  if (filterStatus === "ALL") {
                    setViewMode("stats");
                  }
                }}
                disabled={filterStatus !== "ALL"}
                className={`px-4 py-2 text-sm font-medium border-t border-b border-r ${
                  viewMode === "stats"
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : filterStatus !== "ALL"
                    ? "bg-gray-100 text-gray-400 border-gray-200 cursor-not-allowed" // ✅ Grey when disabled
                    : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                } rounded-r-lg transition-colors`}
                title={
                  filterStatus !== "ALL"
                    ? "Stats only available when viewing all applications"
                    : "View statistics"
                }
              >
                Stats
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

          {/* Applications List/Kanban/stats */}
          {loading ? (
            <div className="text-center py-12">
              <div className="text-gray-600">Loading applications...</div>
            </div>
          ) : filteredApplications.length === 0 ? (
            <div className="text-center py-12 bg-white rounded-lg shadow">
              <div className="text-gray-600 mb-4">
                {searchQuery || filterStatus !== "ALL"
                  ? "No applications match your filters"
                  : "No applications yet. Create your first one!"}
              </div>
            </div>
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
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
