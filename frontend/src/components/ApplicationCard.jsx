const ApplicationCard = ({ application, onEdit, onDelete }) => {
  const statusColors = {
    SAVED: "bg-gray-100 text-gray-800",
    APPLIED: "bg-yellow-100 text-yellow-800",
    PHONE_SCREEN: "bg-blue-100 text-blue-800",
    INTERVIEW: "bg-purple-100 text-purple-800",
    OFFER: "bg-green-100 text-green-800",
    REJECTED: "bg-red-100 text-red-800",
    ACCEPTED: "bg-green-200 text-green-900",
    WITHDRAWN: "bg-gray-200 text-gray-700",
  };

  const formatDate = (dateString) => {
    if (!dateString) return "";
    const date = new Date(dateString);
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="bg-white rounded-lg shadow p-5 hover:shadow-md transition">
      {/* Header */}
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 mb-1">
            {application.position}
          </h3>
          <p className="text-sm text-gray-600">{application.companyName}</p>
        </div>
        <span
          className={`px-2 py-1 rounded-full text-xs font-medium ${
            statusColors[application.status]
          }`}
        >
          {application.status.replace("_", " ")}
        </span>
      </div>

      {/* Details */}
      <div className="space-y-2 mb-4">
        {application.location && (
          <p className="text-sm text-gray-600">📍 {application.location}</p>
        )}
        {application.salaryRange && (
          <p className="text-sm text-gray-600">💰 {application.salaryRange}</p>
        )}
        {application.appliedDate && (
          <p className="text-sm text-gray-600">
            📅 Applied: {formatDate(application.appliedDate)}
          </p>
        )}
      </div>

      {/* Notes Preview */}
      {application.notes && (
        <div className="mb-4">
          <p className="text-sm text-gray-600 line-clamp-2">
            {application.notes}
          </p>
        </div>
      )}

      {/* Actions */}
      <div className="flex justify-end space-x-2 pt-3 border-t border-gray-200">
        {application.jobUrl && (
          <a
            href={application.jobUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-sm text-indigo-600 hover:text-indigo-800"
          >
            View Job
          </a>
        )}
        <button
          onClick={() => onEdit(application)}
          className="text-sm text-indigo-600 hover:text-indigo-800"
        >
          Edit
        </button>
        <button
          onClick={() => onDelete(application.id)}
          className="text-sm text-red-600 hover:text-red-800"
        >
          Delete
        </button>
      </div>
    </div>
  );
};

export default ApplicationCard;
