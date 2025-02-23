import { useState, useEffect } from "react";
import api from "../utils/api";

const ApplicationForm = ({ application, onSuccess, onCancel }) => {
  const [formData, setFormData] = useState({
    companyId: "",
    companyName: "",
    position: "",
    jobUrl: "",
    location: "",
    salaryRange: "",
    status: "SAVED",
    appliedDate: "",
    notes: "",
    priority: 3,
    interviewDate: "",
    interviewTime: "",
    interviewType: "PHONE",
    interviewLocation: "",
  });

  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [showCompanyDropdown, setShowCompanyDropdown] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (
        showCompanyDropdown &&
        !event.target.closest(".company-search-container")
      ) {
        setShowCompanyDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [showCompanyDropdown]);

  useEffect(() => {
    if (application) {
      setFormData({
        companyId: application.companyId,
        companyName: application.companyName,
        position: application.position,
        jobUrl: application.jobUrl || "",
        location: application.location || "",
        salaryRange: application.salaryRange || "",
        status: application.status,
        appliedDate: application.appliedDate || "",
        notes: application.notes || "",
        priority: application.priority || 3,
        interviewDate: application.interviewDate || "",
        interviewTime: application.interviewTime || "",
        interviewType: application.interviewType || "PHONE",
        interviewLocation: application.interviewLocation || "",
      });
      setSearchQuery(application.companyName);
    }
  }, [application]);

  useEffect(() => {
    const fetchCompanies = async () => {
      if (searchQuery.length > 0) {
        try {
          const response = await api.get(
            `/companies/search?query=${searchQuery}`
          );
          setCompanies(response.data);
        } catch (err) {
          console.error("Failed to fetch companies:", err);
        }
      } else {
        setCompanies([]);
      }
    };

    const debounce = setTimeout(fetchCompanies, 300);
    return () => clearTimeout(debounce);
  }, [searchQuery]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleCompanySearch = (e) => {
    setSearchQuery(e.target.value);
    setFormData({ ...formData, companyName: e.target.value, companyId: "" });
    setShowCompanyDropdown(true);
  };

  const selectCompany = (company) => {
    setFormData({
      ...formData,
      companyId: company.id,
      companyName: company.name,
    });
    setSearchQuery(company.name);
    setShowCompanyDropdown(false);
  };

  const createNewCompany = async () => {
    if (!searchQuery.trim()) return;

    try {
      const response = await api.post("/companies", {
        name: searchQuery,
      });
      setFormData({
        ...formData,
        companyId: response.data.id,
        companyName: response.data.name,
      });
      setShowCompanyDropdown(false);
    } catch (err) {
      setError("Failed to create company");
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      let companyId = formData.companyId;
      if (!companyId && formData.companyName) {
        const companyResponse = await api.post("/companies", {
          name: formData.companyName,
        });
        companyId = companyResponse.data.id;
      }

      const applicationData = {
        ...formData,
        companyId,
      };

      if (application) {
        await api.put(`/applications/${application.id}`, applicationData);
      } else {
        await api.post("/applications", applicationData);
      }

      onSuccess();
    } catch (err) {
      setError(err.response?.data || "Failed to save application");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          {error}
        </div>
      )}

      {/* Company Search */}
      <div className="relative company-search-container">
        <label className="block text-sm font-medium text-gray-700">
          Company *
        </label>
        <input
          type="text"
          value={searchQuery}
          onChange={handleCompanySearch}
          onFocus={() => setShowCompanyDropdown(true)}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Search or create company"
          required
        />

        {showCompanyDropdown && searchQuery.length > 0 && (
          <div className="absolute z-10 mt-1 w-full bg-white shadow-lg max-h-60 rounded-md py-1 text-base overflow-auto">
            {companies.length > 0 ? (
              companies.map((company) => (
                <div
                  key={company.id}
                  onClick={() => selectCompany(company)}
                  className="cursor-pointer px-4 py-2 hover:bg-gray-100"
                >
                  {company.name}
                </div>
              ))
            ) : (
              <div
                onClick={createNewCompany}
                className="cursor-pointer px-4 py-2 hover:bg-gray-100 text-indigo-600"
              >
                + Create "{searchQuery}"
              </div>
            )}
          </div>
        )}
      </div>

      {/* Position */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Position *
        </label>
        <input
          type="text"
          name="position"
          value={formData.position}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., Senior Software Engineer"
          required
        />
      </div>

      {/* Job URL */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Job URL
        </label>
        <input
          type="url"
          name="jobUrl"
          value={formData.jobUrl}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="https://..."
        />
      </div>

      {/* Location */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Location
        </label>
        <input
          type="text"
          name="location"
          value={formData.location}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., London, England"
        />
      </div>

      {/* Salary Range */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Salary Range
        </label>
        <input
          type="text"
          name="salaryRange"
          value={formData.salaryRange}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="e.g., £88k - £120k"
        />
      </div>

      {/* Status */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Status *
        </label>
        <select
          name="status"
          value={formData.status}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
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
      </div>

      {/* Applied Date */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Applied Date
        </label>
        <input
          type="date"
          name="appliedDate"
          value={formData.appliedDate}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Priority */}
      <div>
        <label className="block text-sm font-medium text-gray-700">
          Priority (1-5)
        </label>
        <input
          type="number"
          name="priority"
          min="1"
          max="5"
          value={formData.priority}
          onChange={handleChange}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700">Notes</label>
        <textarea
          name="notes"
          value={formData.notes}
          onChange={handleChange}
          rows={4}
          className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
          placeholder="Add any notes about this application..."
        />
      </div>

      {/*Interview */}
      {(formData.status === "INTERVIEW" || formData.status === "SCREENING") && (
        <div className="border-t pt-4 mt-4">
          <h3 className="text-lg font-semibold mb-3 text-gray-900">
            📅 Interview Details
          </h3>

          {/* Interview Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interview Date
            </label>
            <input
              type="date"
              name="interviewDate"
              value={formData.interviewDate}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Interview Time */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interview Time
            </label>
            <input
              type="time"
              name="interviewTime"
              value={formData.interviewTime}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>

          {/* Interview Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Interview Type
            </label>
            <select
              name="interviewType"
              value={formData.interviewType}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            >
              <option value="PHONE">Phone Call</option>
              <option value="VIDEO">Video Call</option>
              <option value="ONSITE">On-site</option>
              <option value="TECHNICAL">Technical Interview</option>
              <option value="BEHAVIORAL">Behavioral Interview</option>
              <option value="FINAL">Final Round</option>
            </select>
          </div>

          {/* Interview Location/Link */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location / Meeting Link
            </label>
            <input
              type="text"
              name="interviewLocation"
              value={formData.interviewLocation}
              onChange={handleChange}
              placeholder="Zoom link, office address, etc."
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </div>
      )}

      {/* Buttons */}
      <div className="flex justify-end space-x-3">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={loading}
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400"
        >
          {loading ? "Saving..." : application ? "Update" : "Create"}
        </button>
      </div>
    </form>
  );
};

export default ApplicationForm;
