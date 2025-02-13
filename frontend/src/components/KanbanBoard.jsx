import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../utils/api";

const KanbanBoard = ({ applications, onUpdate }) => {
  const columns = [
    { id: "SAVED", title: "Saved", color: "bg-gray-100" },
    { id: "APPLIED", title: "Applied", color: "bg-yellow-100" },
    { id: "SCREENING", title: "Screening", color: "bg-blue-100" },
    { id: "INTERVIEW", title: "Interview", color: "bg-purple-100" },
    { id: "OFFER", title: "Offer", color: "bg-green-100" },
  ];

  const getApplicationsByStatus = (status) => {
    return applications.filter((app) => app.status === status);
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const { draggableId, destination } = result;
    const applicationId = parseInt(draggableId);
    const newStatus = destination.droppableId;

    // Find the application
    const application = applications.find((app) => app.id === applicationId);
    if (!application || application.status === newStatus) return;

    try {
      // Update status on backend
      await api.put(`/applications/${applicationId}`, {
        ...application,
        status: newStatus,
      });

      // Refresh the list
      onUpdate();
    } catch (err) {
      alert("Failed to update status: " + (err.response?.data || err.message));
      onUpdate(); // Refresh to show correct state
    }
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <div className="flex space-x-4 overflow-x-auto pb-4">
        {columns.map((column) => (
          <div key={column.id} className="flex-shrink-0 w-80">
            <div className={`${column.color} rounded-t-lg px-4 py-2`}>
              <h3 className="font-semibold text-gray-800">
                {column.title}
                <span className="ml-2 text-sm text-gray-600">
                  ({getApplicationsByStatus(column.id).length})
                </span>
              </h3>
            </div>

            <Droppable droppableId={column.id}>
              {(provided, snapshot) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className={`bg-gray-50 rounded-b-lg p-4 min-h-[500px] ${
                    snapshot.isDraggingOver ? "bg-gray-100" : ""
                  }`}
                >
                  {getApplicationsByStatus(column.id).map((app, index) => (
                    <Draggable
                      key={app.id}
                      draggableId={app.id.toString()}
                      index={index}
                    >
                      {(provided, snapshot) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className={`bg-white rounded-lg shadow p-4 mb-3 ${
                            snapshot.isDragging ? "shadow-lg" : ""
                          }`}
                        >
                          <h4 className="font-semibold text-gray-900 mb-1">
                            {app.position}
                          </h4>
                          <p className="text-sm text-gray-600 mb-2">
                            {app.companyName}
                          </p>
                          {app.location && (
                            <p className="text-xs text-gray-500">
                              📍 {app.location}
                            </p>
                          )}
                          {app.salaryRange && (
                            <p className="text-xs text-gray-500">
                              💰 {app.salaryRange}
                            </p>
                          )}
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </div>
        ))}
      </div>
    </DragDropContext>
  );
};

export default KanbanBoard;
