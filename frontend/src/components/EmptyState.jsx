const EmptyState = ({ icon, title, description, action }) => {
  return (
    <div className="text-center py-12 bg-white rounded-lg shadow">
      <div className="text-6xl mb-4">{icon}</div>
      <h3 className="text-lg font-medium text-gray-900 mb-2">{title}</h3>
      <p className="text-gray-600 mb-6">{description}</p>
      {action && (
        <button
          onClick={action.onClick}
          className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
        >
          {action.label}
        </button>
      )}
    </div>
  );
};

export default EmptyState;
