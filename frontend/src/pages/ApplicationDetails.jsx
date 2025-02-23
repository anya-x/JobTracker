import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import api from "../utils/api";
import DocumentUpload from "../components/DocumentUpload";

const ApplicationDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [application, setApplication] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    fetchApplication();
  }, [id]);

  const fetchApplication = async () => {
    try {
      const response = await api.get(`/applications/${id}`);
      setApplication(response.data);
      setEditData(response.data);
    } catch (err) {
      alert("Failed to fetch application");
      navigate("/dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    try {
      await api.put(`/applications/${id}`, editData);
      setApplication(editData);
      setIsEditing(false);
    } catch (err) {
      alert("Failed to update application");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this application?")) {
      try {
        await api.delete(`/applications/${id}`);
        navigate("/dashboard");
      } catch (err) {
        alert("Failed to delete application");
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!application) {
    return null;
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not set";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow">
        <div className="max-w-5xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            <button
              onClick={() => navigate("/dashboard")}
              className="text-indigo-600 hover:text-indigo-800"
            >
              ← Back to Dashboard
            </button>
            <div className="flex space-x-3">
              {!isEditing ? (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                  >
                    Delete
                  </button>
                </>
              ) : (
                <>
                  <button
                    onClick={() => {
                      setIsEditing(false);
                      setEditData(application);
                    }}
                    className="px-4 py-2 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Save Changes
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="bg-white shadow rounded-lg p-8">
          {/* Title Section */}
          <div className="mb-6">
            {isEditing ? (
              <input
                type="text"
                value={editData.position}
                onChange={(e) =>
                  setEditData({ ...editData, position: e.target.value })
                }
                className="text-3xl font-bold text-gray-900 w-full border-b-2 border-gray-300 focus:border-indigo-500 outline-none"
              />
            ) : (
              <h1 className="text-3xl font-bold text-gray-900">
                {application.position}
              </h1>
            )}
            <p className="text-xl text-gray-600 mt-2">
              {application.companyName}
            </p>
          </div>

          {/* Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            {/* Status */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Status
              </label>
              {isEditing ? (
                <select
                  value={editData.status}
                  onChange={(e) =>
                    setEditData({ ...editData, status: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                >
                  <option value="SAVED">Saved</option>
                  <option value="APPLIED">Applied</option>
                  <option value="SCREENING">Screening</option>
                  <option value="INTERVIEW">Interview</option>
                  <option value="OFFER">Offer</option>
                  <option value="REJECTED">Rejected</option>
                  <option value="ACCEPTED">Accepted</option>
                  <option value="WITHDRAWN">Withdrawn</option>
                </select>
              ) : (
                <p className="text-gray-900">
                  {application.status.replace("_", " ")}
                </p>
              )}
            </div>

            {/* Location */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.location || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, location: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              ) : (
                <p className="text-gray-900">
                  {application.location || "Not specified"}
                </p>
              )}
            </div>

            {/* Salary Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Salary Range
              </label>
              {isEditing ? (
                <input
                  type="text"
                  value={editData.salaryRange || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, salaryRange: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              ) : (
                <p className="text-gray-900">
                  {application.salaryRange || "Not specified"}
                </p>
              )}
            </div>

            {/* Applied Date */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Applied Date
              </label>
              {isEditing ? (
                <input
                  type="date"
                  value={editData.appliedDate || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, appliedDate: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              ) : (
                <p className="text-gray-900">
                  {formatDate(application.appliedDate)}
                </p>
              )}
            </div>

            {/* Priority */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Priority
              </label>
              {isEditing ? (
                <input
                  type="number"
                  min="1"
                  max="5"
                  value={editData.priority || 3}
                  onChange={(e) =>
                    setEditData({
                      ...editData,
                      priority: parseInt(e.target.value),
                    })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              ) : (
                <p className="text-gray-900">
                  {"⭐".repeat(application.priority || 3)}
                </p>
              )}
            </div>
            {/* Interview */}
            {(application.status === "INTERVIEW" ||
              application.status === "SCREENING") && (
              <div className="bg-purple-50 border border-purple-200 rounded-lg p-6 mb-6">
                <h3 className="text-lg font-bold text-purple-900 mb-4 flex items-center gap-2">
                  <span>🗓️</span>
                  <span>Interview Details</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Interview Date */}
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-2">
                      Interview Date
                    </label>
                    {isEditing ? (
                      <input
                        type="date"
                        value={editData.interviewDate || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            interviewDate: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500"
                      />
                    ) : application.interviewDate ? (
                      <p className="text-purple-900 font-semibold">
                        {new Date(application.interviewDate).toLocaleDateString(
                          "en-US",
                          {
                            weekday: "long",
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          }
                        )}
                      </p>
                    ) : (
                      <p className="text-gray-500">Not scheduled</p>
                    )}
                  </div>

                  {/* Interview Time */}
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-2">
                      Interview Time
                    </label>
                    {isEditing ? (
                      <input
                        type="time"
                        value={editData.interviewTime || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            interviewTime: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500"
                      />
                    ) : application.interviewTime ? (
                      <p className="text-purple-900 font-semibold flex items-center gap-2">
                        <span>🕐</span>
                        <span>{application.interviewTime}</span>
                      </p>
                    ) : (
                      <p className="text-gray-500">Not set</p>
                    )}
                  </div>

                  {/* Interview Type */}
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-2">
                      Interview Type
                    </label>
                    {isEditing ? (
                      <select
                        value={editData.interviewType || "PHONE"}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            interviewType: e.target.value,
                          })
                        }
                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500"
                      >
                        <option value="PHONE">Phone Call</option>
                        <option value="VIDEO">Video Call</option>
                        <option value="ONSITE">On-site</option>
                        <option value="TECHNICAL">Technical Interview</option>
                        <option value="BEHAVIORAL">Behavioral Interview</option>
                        <option value="FINAL">Final Round</option>
                      </select>
                    ) : application.interviewType ? (
                      <p className="text-purple-900 flex items-center gap-2">
                        <span>💼</span>
                        <span>
                          {application.interviewType.replace("_", " ")}
                        </span>
                      </p>
                    ) : (
                      <p className="text-gray-500">Not specified</p>
                    )}
                  </div>

                  {/* Interview Location/Link */}
                  <div>
                    <label className="block text-sm font-medium text-purple-700 mb-2">
                      Location / Meeting Link
                    </label>
                    {isEditing ? (
                      <input
                        type="text"
                        value={editData.interviewLocation || ""}
                        onChange={(e) =>
                          setEditData({
                            ...editData,
                            interviewLocation: e.target.value,
                          })
                        }
                        placeholder="Zoom link, office address, etc."
                        className="w-full px-3 py-2 border border-purple-300 rounded-md focus:ring-2 focus:ring-purple-500"
                      />
                    ) : application.interviewLocation ? (
                      application.interviewLocation.startsWith("http") ? (
                        <a
                          href={application.interviewLocation}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-600 hover:text-purple-800 underline break-all flex items-center gap-2"
                        >
                          <span>🔗</span>
                          <span>{application.interviewLocation}</span>
                        </a>
                      ) : (
                        <p className="text-purple-900 flex items-center gap-2">
                          <span>📍</span>
                          <span>{application.interviewLocation}</span>
                        </p>
                      )
                    ) : (
                      <p className="text-gray-500">Not specified</p>
                    )}
                  </div>
                </div>

                {/* Time Until Interview */}
                {!isEditing && application.interviewDate && (
                  <div className="mt-6 pt-6 border-t border-purple-200">
                    <TimeUntilInterview
                      date={application.interviewDate}
                      time={application.interviewTime}
                    />
                  </div>
                )}
              </div>
            )}
            {/* Job URL */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job URL
              </label>
              {isEditing ? (
                <input
                  type="url"
                  value={editData.jobUrl || ""}
                  onChange={(e) =>
                    setEditData({ ...editData, jobUrl: e.target.value })
                  }
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              ) : application.jobUrl ? (
                <a
                  href={application.jobUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-indigo-600 hover:text-indigo-800"
                >
                  View Job Posting →
                </a>
              ) : (
                <p className="text-gray-900">No URL provided</p>
              )}
            </div>
          </div>

          {/* Notes Section */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Notes
            </label>
            {isEditing ? (
              <textarea
                value={editData.notes || ""}
                onChange={(e) =>
                  setEditData({ ...editData, notes: e.target.value })
                }
                rows={6}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Add notes about this application..."
              />
            ) : (
              <div className="prose max-w-none">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {application.notes || "No notes added yet."}
                </p>
              </div>
            )}
          </div>

          {/* Job Description Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Job Description
            </label>
            {isEditing ? (
              <textarea
                value={editData.jobDescription || ""}
                onChange={(e) =>
                  setEditData({ ...editData, jobDescription: e.target.value })
                }
                rows={10}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="Paste the job description here..."
              />
            ) : (
              <div className="prose max-w-none">
                <p className="text-gray-900 whitespace-pre-wrap">
                  {application.jobDescription || "No job description saved."}
                </p>
              </div>
            )}
          </div>
          <div className="mb-8">
            <DocumentUpload applicationId={application.id} />
          </div>

          {/* Timeline */}
          <div className="mt-8 pt-8 border-t border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">
              Timeline
            </h3>
            <div className="space-y-3">
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-indigo-600 rounded-full"></div>
                <div className="ml-4">
                  <p className="text-sm text-gray-900">Created</p>
                  <p className="text-xs text-gray-600">
                    {formatDate(application.createdAt)}
                  </p>
                </div>
              </div>
              {application.appliedDate && (
                <div className="flex items-start">
                  <div className="flex-shrink-0 w-2 h-2 mt-2 bg-yellow-500 rounded-full"></div>
                  <div className="ml-4">
                    <p className="text-sm text-gray-900">Applied</p>
                    <p className="text-xs text-gray-600">
                      {formatDate(application.appliedDate)}
                    </p>
                  </div>
                </div>
              )}
              <div className="flex items-start">
                <div className="flex-shrink-0 w-2 h-2 mt-2 bg-gray-400 rounded-full"></div>
                <div className="ml-4">
                  <p className="text-sm text-gray-900">Last Updated</p>
                  <p className="text-xs text-gray-600">
                    {formatDate(application.updatedAt)}
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

const TimeUntilInterview = ({ date, time }) => {
  const [timeText, setTimeText] = useState("");
  const [colorClass, setColorClass] = useState("");

  useEffect(() => {
    const updateCountdown = () => {
      const interviewDateTime = new Date(date);

      if (time) {
        const [hours, minutes] = time.split(":");
        interviewDateTime.setHours(parseInt(hours), parseInt(minutes));
      }

      const now = new Date();
      const diff = interviewDateTime - now;

      if (diff < 0) {
        setTimeText("Interview has passed");
        setColorClass("text-gray-600");
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor(
        (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
      );
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

      if (days === 0 && hours === 0) {
        setTimeText(`In ${minutes} minute${minutes !== 1 ? "s" : ""} ⏰`);
        setColorClass("text-red-600 font-bold animate-pulse");
      } else if (days === 0) {
        setTimeText(`Today in ${hours} hour${hours !== 1 ? "s" : ""} 🔔`);
        setColorClass("text-orange-600 font-semibold");
      } else if (days === 1) {
        setTimeText("Tomorrow 📅");
        setColorClass("text-yellow-600 font-semibold");
      } else if (days <= 7) {
        setTimeText(`In ${days} day${days !== 1 ? "s" : ""}`);
        setColorClass("text-green-600");
      } else {
        setTimeText(`In ${days} days`);
        setColorClass("text-purple-600");
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 60000);

    return () => clearInterval(interval);
  }, [date, time]);

  return (
    <div className="flex items-center justify-center gap-3 bg-purple-100 rounded-lg p-4">
      <span className="text-sm font-medium text-purple-700">
        Time until interview:
      </span>
      <span className={`text-lg font-bold ${colorClass}`}>{timeText}</span>
    </div>
  );
};

export default ApplicationDetails;
