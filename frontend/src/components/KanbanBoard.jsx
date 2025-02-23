import { useState } from "react";
import api from "../utils/api";

const KanbanBoard = ({ applications, onUpdate, onEdit, onDelete }) => {
  const [draggedCard, setDraggedCard] = useState(null);
  const [showColumnSelector, setShowColumnSelector] = useState(false);

  const allColumns = [
    {
      id: "SAVED",
      title: "Saved",
      color: "bg-gray-50",
      badge: "bg-gray-500",
      default: true,
    },
    {
      id: "APPLIED",
      title: "Applied",
      color: "bg-blue-50",
      badge: "bg-blue-500",
      default: true,
    },
    {
      id: "SCREENING",
      title: "Screening",
      color: "bg-yellow-50",
      badge: "bg-yellow-500",
      default: true,
    },
    {
      id: "INTERVIEW",
      title: "Interview",
      color: "bg-purple-50",
      badge: "bg-purple-500",
      default: true,
    },
    {
      id: "ACCEPTED",
      title: "Accepted",
      color: "bg-teal-50",
      badge: "bg-teal-500",
      default: true,
    },
    {
      id: "OFFER",
      title: "Offer",
      color: "bg-green-50",
      badge: "bg-green-500",
      default: false,
    },
    {
      id: "REJECTED",
      title: "Rejected",
      color: "bg-red-50",
      badge: "bg-red-500",
      default: false,
    },
    {
      id: "WITHDRAWN",
      title: "Withdrawn",
      color: "bg-orange-50",
      badge: "bg-orange-500",
      default: false,
    },
  ];

  const [visibleColumnIds, setVisibleColumnIds] = useState(
    allColumns.filter((col) => col.default).map((col) => col.id)
  );

  const visibleColumns = allColumns.filter((col) =>
    visibleColumnIds.includes(col.id)
  );

  const toggleColumn = (columnId) => {
    setVisibleColumnIds((prev) => {
      if (prev.includes(columnId)) {
        // Don't allow removing the last column
        if (prev.length === 1) return prev;
        return prev.filter((id) => id !== columnId);
      } else {
        return [...prev, columnId];
      }
    });
  };

  const resetToDefault = () => {
    setVisibleColumnIds(
      allColumns.filter((col) => col.default).map((col) => col.id)
    );
  };

  const showAllColumns = () => {
    setVisibleColumnIds(allColumns.map((col) => col.id));
  };

  const handleDragStart = (e, application) => {
    setDraggedCard(application);
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
  };

  const handleDrop = async (e, newStatus) => {
    e.preventDefault();

    if (!draggedCard || draggedCard.status === newStatus) {
      setDraggedCard(null);
      return;
    }

    try {
      await api.put(`/applications/${draggedCard.id}`, {
        ...draggedCard,
        status: newStatus,
      });

      onUpdate();
      setDraggedCard(null);
    } catch (error) {
      console.error("Failed to update application status:", error);
      alert("Failed to update status");
      setDraggedCard(null);
    }
  };

  const getApplicationsForColumn = (status) => {
    return applications.filter((app) => app.status === status);
  };

  return (
    <div>
      {/* ✅ Column Selector Controls */}
      <div className="mb-4 flex justify-between items-center">
        <div className="text-sm text-gray-600">
          Showing {visibleColumns.length} of {allColumns.length} columns
        </div>

        <div className="flex gap-2">
          {/* Quick Actions */}
          {visibleColumnIds.length < allColumns.length && (
            <button
              onClick={showAllColumns}
              className="px-3 py-1.5 text-sm bg-indigo-50 text-indigo-700 border border-indigo-200 rounded-lg hover:bg-indigo-100 transition"
            >
              Show All
            </button>
          )}

          {visibleColumnIds.length !==
            allColumns.filter((c) => c.default).length && (
            <button
              onClick={resetToDefault}
              className="px-3 py-1.5 text-sm bg-gray-50 text-gray-700 border border-gray-200 rounded-lg hover:bg-gray-100 transition"
            >
              Reset to Default
            </button>
          )}

          {/* Column Selector Toggle */}
          <button
            onClick={() => setShowColumnSelector(!showColumnSelector)}
            className="px-4 py-1.5 text-sm bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition flex items-center gap-2"
          >
            <span>⚙️</span>
            <span>Customize Columns</span>
          </button>
        </div>
      </div>

      {/* ✅ Column Selector Dropdown */}
      {showColumnSelector && (
        <div className="mb-4 bg-white border border-gray-300 rounded-lg p-4 shadow-lg">
          <h3 className="text-sm font-semibold text-gray-900 mb-3">
            Select Columns to Display
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {allColumns.map((column) => {
              const count = getApplicationsForColumn(column.id).length;
              return (
                <label
                  key={column.id}
                  className="flex items-center gap-2 cursor-pointer hover:bg-gray-50 p-2 rounded"
                >
                  <input
                    type="checkbox"
                    checked={visibleColumnIds.includes(column.id)}
                    onChange={() => toggleColumn(column.id)}
                    className="w-4 h-4 text-indigo-600 rounded focus:ring-2 focus:ring-indigo-500"
                  />
                  <span className="text-sm text-gray-700">{column.title}</span>
                  <span
                    className={`ml-auto text-xs ${column.badge} text-white px-2 py-0.5 rounded-full`}
                  >
                    {count}
                  </span>
                </label>
              );
            })}
          </div>

          <div className="mt-3 pt-3 border-t flex justify-end gap-2">
            <button
              onClick={() => setShowColumnSelector(false)}
              className="px-3 py-1.5 text-sm text-gray-600 hover:text-gray-900"
            >
              Done
            </button>
          </div>
        </div>
      )}

      {/* Kanban Board */}
      <div className="flex gap-4 overflow-x-auto pb-4">
        {visibleColumns.map((column) => {
          const columnApplications = getApplicationsForColumn(column.id);

          return (
            <div
              key={column.id}
              className="flex-shrink-0 w-80"
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, column.id)}
            >
              {/* Column Header */}
              <div
                className={`${column.color} rounded-t-lg p-4 border-b-2 border-gray-300`}
              >
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-gray-800">
                    {column.title}
                  </h3>
                  <span
                    className={`${column.badge} text-white text-xs font-bold px-2 py-1 rounded-full`}
                  >
                    {columnApplications.length}
                  </span>
                </div>
              </div>

              {/* Column Content */}
              <div className="bg-gray-50 rounded-b-lg p-4 min-h-[500px] space-y-3">
                {columnApplications.length === 0 ? (
                  <p className="text-gray-400 text-sm text-center py-8">
                    No applications
                  </p>
                ) : (
                  columnApplications.map((app) => (
                    <div
                      key={app.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, app)}
                      className="bg-white rounded-lg shadow-sm p-4 cursor-move hover:shadow-md transition-shadow border border-gray-200"
                    >
                      <h4 className="font-semibold text-gray-900 mb-1">
                        {app.companyName}
                      </h4>
                      <p className="text-sm text-gray-600 mb-3">
                        {app.position}
                      </p>

                      <div className="text-xs text-gray-500 space-y-1 mb-3">
                        {app.location && (
                          <div className="flex items-center gap-1">
                            <span>📍</span>
                            <span>{app.location}</span>
                          </div>
                        )}
                        {app.salaryRange && (
                          <div className="flex items-center gap-1">
                            <span>💰</span>
                            <span>{app.salaryRange}</span>
                          </div>
                        )}
                        {app.appliedDate && (
                          <div className="flex items-center gap-1">
                            <span>📅</span>
                            <span>
                              {new Date(app.appliedDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                        {app.interviewDate && (
                          <div className="flex items-center gap-1 text-purple-600 font-semibold">
                            <span>🗓️</span>
                            <span>
                              {new Date(app.interviewDate).toLocaleDateString()}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2 pt-3 border-t border-gray-100">
                        <button
                          onClick={() => onEdit(app)}
                          className="flex-1 px-3 py-1 text-xs font-medium text-indigo-600 hover:bg-indigo-50 rounded transition"
                        >
                          Edit
                        </button>
                        <button
                          onClick={() => onDelete(app.id)}
                          className="flex-1 px-3 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition"
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanBoard;
