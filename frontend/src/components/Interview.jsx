const Interview = ({ applications }) => {
  console.log("📅 InterviewCalendar received applications:", applications);

  const interviews = applications.filter((app) => {
    const hasInterview =
      app.interviewDate &&
      (app.status === "INTERVIEW" || app.status === "SCREENING");

    if (hasInterview) {
      console.log("✅ Found interview:", {
        company: app.companyName,
        date: app.interviewDate,
        time: app.interviewTime,
      });
    }

    return hasInterview;
  });

  console.log("📊 Total interviews found:", interviews.length);

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const upcomingInterviews = interviews.filter(
    (app) => new Date(app.interviewDate) >= today
  );

  const pastInterviews = interviews.filter(
    (app) => new Date(app.interviewDate) < today
  );

  console.log(
    "📈 Upcoming:",
    upcomingInterviews.length,
    "Past:",
    pastInterviews.length
  );

  const InterviewCard = ({ app }) => (
    <div className="border-l-4 border-purple-600 bg-white p-4 rounded-r-lg shadow hover:shadow-md transition">
      <div className="flex justify-between items-start mb-2">
        <div>
          <h3 className="font-bold text-gray-900">{app.companyName}</h3>
          <p className="text-sm text-gray-600">{app.position}</p>
        </div>
        {app.interviewType && (
          <span className="text-xs bg-purple-100 text-purple-800 px-2 py-1 rounded">
            {app.interviewType.replace("_", " ")}
          </span>
        )}
      </div>

      <div className="space-y-1 text-sm text-gray-700">
        <div className="flex items-center gap-2">
          <span>📅</span>
          <span className="font-semibold">
            {new Date(app.interviewDate).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </span>
        </div>

        {app.interviewTime && (
          <div className="flex items-center gap-2">
            <span>🕐</span>
            <span>{app.interviewTime}</span>
          </div>
        )}

        {app.interviewLocation && (
          <div className="flex items-center gap-2">
            <span>📍</span>
            <span className="break-all">{app.interviewLocation}</span>
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Debug Info */}
      <div className="bg-blue-50 p-3 rounded text-sm">
        Total applications: {applications.length} | With interviews:{" "}
        {interviews.length} | Upcoming: {upcomingInterviews.length} | Past:{" "}
        {pastInterviews.length}
      </div>

      {/* Upcoming Interviews */}
      <div>
        <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
          <span>🗓️</span>
          <span>Upcoming Interviews</span>
          <span className="text-lg font-normal text-gray-500">
            ({upcomingInterviews.length})
          </span>
        </h2>

        {upcomingInterviews.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-8 text-center">
            <p className="text-gray-500 text-lg mb-2">
              No upcoming interviews scheduled
            </p>
            <p className="text-sm text-gray-400">
              Schedule interviews by setting an application status to
              "Interview" and adding interview details
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {upcomingInterviews.map((app) => (
              <InterviewCard key={app.id} app={app} />
            ))}
          </div>
        )}
      </div>

      {/* Past Interviews */}
      {pastInterviews.length > 0 && (
        <div>
          <h2 className="text-xl font-bold mb-4 flex items-center gap-2 text-gray-600">
            <span>📜</span>
            <span>Past Interviews</span>
            <span className="text-lg font-normal text-gray-500">
              ({pastInterviews.length})
            </span>
          </h2>

          <div className="space-y-3 opacity-60">
            {pastInterviews.map((app) => (
              <InterviewCard key={app.id} app={app} />
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default Interview;
