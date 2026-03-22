// Complaint categories for forms and filters
export const complaintCategories = [
  { value: 'roads', label: 'Roads & Potholes', icon: '🛣️' },
  { value: 'water', label: 'Water Supply', icon: '💧' },
  { value: 'electricity', label: 'Electricity', icon: '⚡' },
  { value: 'garbage', label: 'Garbage Collection', icon: '🗑️' },
  { value: 'sewage', label: 'Sewage & Drainage', icon: '🚰' },
  { value: 'street_lights', label: 'Street Lights', icon: '💡' },
  { value: 'parks', label: 'Parks & Gardens', icon: '🌳' },
  { value: 'other', label: 'Other Issues', icon: '📋' },
];

// Status filters for complaint lists
export const statusFilters = [
  { value: 'all', label: 'All Status' },
  { value: 'pending', label: 'Pending' },
  { value: 'in_progress', label: 'Processing' },
  { value: 'on_hold', label: 'On Hold' },
  { value: 'resolved', label: 'Solved' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'closed', label: 'Closed' },
];

// Priority levels
export const priorityLevels = [
  { value: 'low', label: 'Low', color: 'bg-slate-100 text-slate-800' },
  { value: 'medium', label: 'Medium', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'high', label: 'High', color: 'bg-orange-100 text-orange-800' },
  { value: 'urgent', label: 'Urgent', color: 'bg-red-100 text-red-800' },
];