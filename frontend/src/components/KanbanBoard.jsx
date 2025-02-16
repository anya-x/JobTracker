import { useState } from "react";
import api from "../utils/api";

const KanbanBoard = ({ applications, onUpdate, onEdit, onDelete }) => {
  const [draggedCard, setDraggedCard] = useState(null);

  const columns = [
    { id: "SAVED", title: "Saved", color: "bg-gray-100", badge: "bg-gray-500" },
    {
      id: "APPLIED",
      title: "APPLIED",
      color: "bg-blue-50",
      badge: "bg-blue-500",
    },
    {
      id: "SCREENING",
      title: "SCREENING",
      color: "bg-yellow-50",
      badge: "bg-yellow-500",
    },
    {
      id: "INTERVIEW",
      title: "INTERVIEW",
      color: "bg-purple-50",
      badge: "bg-purple-500",
    },
    {
      id: "OFFER",
      title: "OFFER",
      color: "bg-green-50",
      badge: "bg-green-500",
    },
    {
      id: "REJECTED",
      title: "REJECTED",
      color: "bg-red-50",
      badge: "bg-red-500",
    },
  ];

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

      onUpdate(); // Refresh applications
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
    <div className="flex gap-4 overflow-x-auto pb-4">
      {columns.map((column) => {
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
                <h3 className="font-semibold text-gray-800">{column.title}</h3>
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
                    {/* Company Name */}
                    <h4 className="font-semibold text-gray-900 mb-1">
                      {app.companyName}
                    </h4>

                    {/* Position */}
                    <p className="text-sm text-gray-600 mb-3">{app.position}</p>

                    {/* Location & Salary */}
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
                    </div>

                    {/* Applied Date */}
                    {app.appliedDate && (
                      <p className="text-xs text-gray-500 mb-3">
                        Applied:{" "}
                        {new Date(app.appliedDate).toLocaleDateString()}
                      </p>
                    )}

                    {/* Actions */}
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
  );
};

export default KanbanBoard;
