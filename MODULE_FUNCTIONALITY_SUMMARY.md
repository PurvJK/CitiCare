# 5.5 Module and Component Functionality

This section summarizes the main implementation modules in CitiCare and the brief functionality provided by the functions, classes, and components defined inside them.

## Backend Modules

### Bootstrap and Configuration

| Module | Key functions/classes | Brief functionality |
|---|---|---|
| [backend/src/index.js](backend/src/index.js) | `main()` | Loads environment settings, prepares uploads, connects to MongoDB or dev stubs, and starts the server. |
| [backend/src/app.js](backend/src/app.js) | `app` | Builds the Express application, applies CORS/JSON/static middleware, and mounts API routers. |
| [backend/src/config/db.js](backend/src/config/db.js) | `connectDB()` | Establishes the MongoDB connection used by the backend. |
| [backend/src/dev-stubs.js](backend/src/dev-stubs.js) | `installDevStubs()` | Registers lightweight DB-less API responses for frontend development. |
| [backend/src/seed.js](backend/src/seed.js) | `seed()` | Seeds the database with admin data, locations, departments, settings, and default department heads. |

### Controllers

| Module | Key functions/classes | Brief functionality |
|---|---|---|
| [backend/src/controllers/auth.controller.js](backend/src/controllers/auth.controller.js) | `register`, `login`, `me` | Handles user registration, login, and current-user lookup. |
| [backend/src/controllers/complaints.controller.js](backend/src/controllers/complaints.controller.js) | `listComplaints`, `getComplaintById`, `createComplaint`, `updateComplaint`, `deleteComplaint`, `getComplaintStats`, `getMonthlyComplaints`, `listNearbyComplaints`, `listWardNearbyComplaints`, `listComplaintsByWard`, `listComplaintDepartmentsMeta`, `listOfficersMeta`, `listComplaintComments`, `uploadComplaintImages`, `upvoteComplaint`, `submitComplaintFeedback`, `addComplaintComment` | Provides complaint CRUD, filtering, analytics, nearby search, attachments, comments, feedback, and upvotes. |
| [backend/src/controllers/analytics.controller.js](backend/src/controllers/analytics.controller.js) | `getDepartmentOverview` | Produces department-level analytics and dashboard summary metrics. |
| [backend/src/controllers/ai.controller.js](backend/src/controllers/ai.controller.js) | `draftHelper`, `imageSuggest` | Exposes AI-assisted complaint drafting and image-based suggestion endpoints. |
| [backend/src/controllers/announcements.controller.js](backend/src/controllers/announcements.controller.js) | `createAnnouncement`, `listAnnouncements` | Creates and lists announcements with filtering and targeting support. |
| [backend/src/controllers/departments.controller.js](backend/src/controllers/departments.controller.js) | `listDepartments`, `createDepartment`, `updateDepartment`, `deleteDepartment` | Manages department records. |
| [backend/src/controllers/profile.controller.js](backend/src/controllers/profile.controller.js) | `getProfile`, `updateProfile`, `uploadAvatar`, `changePassword` | Reads and updates user profile data, avatar uploads, and password changes. |
| [backend/src/controllers/users.controller.js](backend/src/controllers/users.controller.js) | `listUsers`, `createUser`, `updateUserRole`, `updateUserDepartment`, `deleteUser` | Supports admin user administration. |
| [backend/src/controllers/locations.controller.js](backend/src/controllers/locations.controller.js) | `listZones`, `listWards`, `listAreas`, `listDepartments` | Serves hierarchical location data and department lookups. |
| [backend/src/controllers/documents.controller.js](backend/src/controllers/documents.controller.js) | `listDocuments` | Returns document repository entries. |
| [backend/src/controllers/projects.controller.js](backend/src/controllers/projects.controller.js) | `listProjects` | Returns public projects with department and ward associations. |
| [backend/src/controllers/settings.controller.js](backend/src/controllers/settings.controller.js) | `getSettings`, `updateSetting` | Reads and updates application-wide system settings. |

### Middleware

| Module | Key functions/classes | Brief functionality |
|---|---|---|
| [backend/src/middleware/auth.js](backend/src/middleware/auth.js) | `authMiddleware`, `requireRole()` | Verifies JWT sessions and enforces role-based access control. |
| [backend/src/middleware/upload.js](backend/src/middleware/upload.js) | `upload`, `uploadAny` | Configures Multer upload handling for images and documents. |

### Services

| Module | Key functions/classes | Brief functionality |
|---|---|---|
| [backend/src/services/auth/auth.service.js](backend/src/services/auth/auth.service.js) | `registerUser`, `loginUser`, `getCurrentUser`, `issueToken`, `toPublicUser` | Contains the core authentication workflow and JWT/public-user helpers. |
| [backend/src/services/ai/draft-helper.js](backend/src/services/ai/draft-helper.js) | `fallbackHints`, `parseModelJson`, `generateDraftHelper` | Generates complaint draft assistance with local fallback logic and AI response parsing. |
| [backend/src/services/ai/image-suggest.js](backend/src/services/ai/image-suggest.js) | `clampConfidence`, `detectCategoryFromText`, `fallbackImageSuggestion`, `normalizeFallbackReasonFromError`, `bestDepartmentMatch`, `parseModelJson`, `generateImageSuggestions` | Derives complaint category and department suggestions from uploaded images and fallback heuristics. |
| [backend/src/services/ai/gemini.js](backend/src/services/ai/gemini.js) | `extractGeminiText`, `callGemini`, `createGeminiTextCompletion`, `createGeminiVisionCompletion` | Wraps Gemini API calls for text and vision completions. |
| [backend/src/services/ai/sanitizer.js](backend/src/services/ai/sanitizer.js) | `normalizeWhitespace`, `sanitizeForAI` | Cleans sensitive complaint text before sending it to external AI services. |

### Models

| Module | Key functions/classes | Brief functionality |
|---|---|---|
| [backend/src/models/User.js](backend/src/models/User.js) | `User`, `comparePassword` | Stores user identity, roles, assignments, and authentication data. |
| [backend/src/models/Complaint.js](backend/src/models/Complaint.js) | `Complaint` | Stores complaint lifecycle data, geolocation, priorities, feedback, and assignments. |
| [backend/src/models/Department.js](backend/src/models/Department.js) | `Department` | Stores department metadata and in-charge references. |
| [backend/src/models/Announcement.js](backend/src/models/Announcement.js) | `Announcement` | Stores announcements and their targeting/priority data. |
| [backend/src/models/Zone.js](backend/src/models/Zone.js) | `Zone` | Represents city zones. |
| [backend/src/models/Ward.js](backend/src/models/Ward.js) | `Ward` | Represents wards linked to zones. |
| [backend/src/models/Area.js](backend/src/models/Area.js) | `Area` | Represents areas linked to wards. |
| [backend/src/models/ComplaintComment.js](backend/src/models/ComplaintComment.js) | `ComplaintComment` | Stores complaint comment threads. |
| [backend/src/models/ComplaintImage.js](backend/src/models/ComplaintImage.js) | `ComplaintImage` | Stores complaint image attachments. |
| [backend/src/models/ComplaintCounter.js](backend/src/models/ComplaintCounter.js) | `getNextComplaintNumber()` | Generates sequential complaint numbers. |
| [backend/src/models/Document.js](backend/src/models/Document.js) | `Document` | Stores document repository entries. |
| [backend/src/models/Project.js](backend/src/models/Project.js) | `Project` | Stores public project data, budget, and progress details. |
| [backend/src/models/SystemSetting.js](backend/src/models/SystemSetting.js) | `SystemSetting` | Stores key-value system configuration. |

### Route Modules

| Module | Key functions/classes | Brief functionality |
|---|---|---|
| [backend/src/routes/auth.js](backend/src/routes/auth.js) | `router` | Maps authentication endpoints to controller actions. |
| [backend/src/routes/complaints.js](backend/src/routes/complaints.js) | `router` | Maps complaint endpoints, uploads, and related actions to controllers. |
| [backend/src/routes/users.js](backend/src/routes/users.js) | `router` | Maps admin user-management endpoints. |
| [backend/src/routes/profile.js](backend/src/routes/profile.js) | `router` | Maps profile endpoints. |
| [backend/src/routes/documents.js](backend/src/routes/documents.js) | `router` | Maps document listing endpoints. |
| [backend/src/routes/projects.js](backend/src/routes/projects.js) | `router` | Maps project listing endpoints. |
| [backend/src/routes/locations.js](backend/src/routes/locations.js) | `router` | Maps zone, ward, area, and department lookup endpoints. |
| [backend/src/routes/settings.js](backend/src/routes/settings.js) | `router` | Maps system settings endpoints. |
| [backend/src/routes/departments.js](backend/src/routes/departments.js) | `router` | Maps department CRUD endpoints. |
| [backend/src/routes/analytics.js](backend/src/routes/analytics.js) | `router` | Maps analytics endpoints. |
| [backend/src/routes/ai.js](backend/src/routes/ai.js) | `router` | Maps AI helper endpoints. |
| [backend/src/routes/announcements.js](backend/src/routes/announcements.js) | `router` | Maps announcement endpoints. |

## Frontend Modules

### Entry and App Shell

| Module | Key functions/classes | Brief functionality |
|---|---|---|
| [frontend/src/main.jsx](frontend/src/main.jsx) | `createRoot` | Bootstraps the React application into the DOM. |
| [frontend/src/App.jsx](frontend/src/App.jsx) | `App` | Composes providers, toasters, routing, and page-level layout. |
| [frontend/src/contexts/AuthContext.jsx](frontend/src/contexts/AuthContext.jsx) | `AuthProvider`, `useAuth` | Manages client-side authentication state and session persistence. |
| [frontend/src/components/theme-provider.jsx](frontend/src/components/theme-provider.jsx) | `ThemeProvider` | Supplies theme context to the application. |
| [frontend/src/components/layout/DashboardLayout.jsx](frontend/src/components/layout/DashboardLayout.jsx) | `DashboardLayout` | Wraps authenticated dashboard pages with shared chrome. |
| [frontend/src/components/layout/Header.jsx](frontend/src/components/layout/Header.jsx) | `Header` | Renders the top application header. |
| [frontend/src/components/layout/NavBar.jsx](frontend/src/components/layout/NavBar.jsx) | `NavBar`, `NavBarWithLogo`, `getNavItems` | Builds role-aware navigation menus and logo navigation. |
| [frontend/src/components/layout/Sidebar.jsx](frontend/src/components/layout/Sidebar.jsx) | `Sidebar` | Provides responsive sidebar navigation. |
| [frontend/src/components/NavLink.jsx](frontend/src/components/NavLink.jsx) | `NavLink` | Provides a reusable navigation link helper. |

### Pages

| Module | Key functions/classes | Brief functionality |
|---|---|---|
| [frontend/src/pages/Landing.jsx](frontend/src/pages/Landing.jsx) | `Landing` | Public landing page with hero content and quick access actions. |
| [frontend/src/pages/Login.jsx](frontend/src/pages/Login.jsx) | `Login` | User sign-in page. |
| [frontend/src/pages/Register.jsx](frontend/src/pages/Register.jsx) | `Register` | User registration page. |
| [frontend/src/pages/Dashboard.jsx](frontend/src/pages/Dashboard.jsx) | `getGreeting`, `CitizenDashboard`, `OfficerDashboard`, `DepartmentHeadDashboard`, `AdminDashboard`, `Dashboard` | Renders role-specific dashboard views. |
| [frontend/src/pages/Complaints.jsx](frontend/src/pages/Complaints.jsx) | `Complaints` | Lists, filters, and sorts complaints based on user role. |
| [frontend/src/pages/ComplaintDetail.jsx](frontend/src/pages/ComplaintDetail.jsx) | `ComplaintDetail` | Displays a single complaint with metadata, status, and related information. |
| [frontend/src/pages/NewComplaint.jsx](frontend/src/pages/NewComplaint.jsx) | `NewComplaint` | Complaint submission form with category, location, image, and AI draft support. |
| [frontend/src/pages/NearbyComplaints.jsx](frontend/src/pages/NearbyComplaints.jsx) | `NearbyComplaints` | Shows nearby complaints using location-aware filtering. |
| [frontend/src/pages/CityMap.jsx](frontend/src/pages/CityMap.jsx) | `CityMap` | Visual map-based view of complaints across the city. |
| [frontend/src/pages/Analytics.jsx](frontend/src/pages/Analytics.jsx) | `Analytics` | Presents analytics dashboards and department summaries. |
| [frontend/src/pages/Projects.jsx](frontend/src/pages/Projects.jsx) | `Projects` | Displays public infrastructure projects. |
| [frontend/src/pages/Documents.jsx](frontend/src/pages/Documents.jsx) | `Documents` | Browses document repository entries. |
| [frontend/src/pages/Users.jsx](frontend/src/pages/Users.jsx) | `UsersPage` | Admin interface for user management. |
| [frontend/src/pages/Officers.jsx](frontend/src/pages/Officers.jsx) | `Officers` | Department-head view for managing officers. |
| [frontend/src/pages/Departments.jsx](frontend/src/pages/Departments.jsx) | `Departments` | Department management and listing page. |
| [frontend/src/pages/Profile.jsx](frontend/src/pages/Profile.jsx) | `Profile` | User profile and account settings page. |
| [frontend/src/pages/Settings.jsx](frontend/src/pages/Settings.jsx) | `Settings` | System settings and personal preference controls. |
| [frontend/src/pages/Index.jsx](frontend/src/pages/Index.jsx) | `Index` | Home/index redirect or landing entry page. |
| [frontend/src/pages/NotFound.jsx](frontend/src/pages/NotFound.jsx) | `NotFound` | 404 fallback page. |

### Hooks

| Module | Key functions/classes | Brief functionality |
|---|---|---|
| [frontend/src/hooks/useComplaints.js](frontend/src/hooks/useComplaints.js) | `useComplaints`, `useComplaint`, `useCreateComplaint`, `useToggleUpvote`, `useComplaintStats`, `useMonthlyComplaintStats`, `useComplaintComments`, `useAddComment`, `useSubmitComplaintFeedback`, `useUpdateComplaint`, `useDeleteComplaint`, `useUploadComplaintImages`, `useDepartments`, `useOfficers` | Provides complaint queries, mutations, stats, comments, and supporting lookups. |
| [frontend/src/hooks/useAnnouncements.js](frontend/src/hooks/useAnnouncements.js) | `useAnnouncements`, `useCreateAnnouncement` | Fetches and creates announcements. |
| [frontend/src/hooks/useAnalytics.js](frontend/src/hooks/useAnalytics.js) | `useAdminDepartmentOverview` | Fetches department overview analytics. |
| [frontend/src/hooks/useDepartments.js](frontend/src/hooks/useDepartments.js) | `useAdminDepartments`, `useCreateDepartment`, `useUpdateDepartment`, `useDeleteDepartment` | Handles department queries and mutations. |
| [frontend/src/hooks/useLocations.js](frontend/src/hooks/useLocations.js) | `useZones`, `useWards`, `useAreas`, `useDepartments` | Fetches zone, ward, area, and department data. |
| [frontend/src/hooks/useProfile.js](frontend/src/hooks/useProfile.js) | `useProfile`, `useUpdateProfile` | Fetches and updates profile data. |
| [frontend/src/hooks/useUsers.js](frontend/src/hooks/useUsers.js) | `useUsers`, `useCreateUser`, `useUpdateUserRole`, `useUpdateUserDepartment`, `useDeleteUser` | Handles admin user management data flow. |
| [frontend/src/hooks/useDocuments.js](frontend/src/hooks/useDocuments.js) | `useDocuments` | Fetches documents for the repository page. |
| [frontend/src/hooks/useProjects.js](frontend/src/hooks/useProjects.js) | `useProjects` | Fetches public project data. |
| [frontend/src/hooks/useSettings.js](frontend/src/hooks/useSettings.js) | `useSystemSettings`, `useUpdateSystemSetting`, `useUploadAvatar`, `useChangePassword` | Manages settings updates and account actions. |
| [frontend/src/hooks/useTwoFactor.js](frontend/src/hooks/useTwoFactor.js) | `useTwoFactor` | Provides the two-factor authentication flow hook. |
| [frontend/src/hooks/useComplaintDraftHelper.js](frontend/src/hooks/useComplaintDraftHelper.js) | `useComplaintDraftHelper`, `useDebouncedValue` | Supplies debounced AI draft assistance for complaint creation. |
| [frontend/src/hooks/useImageComplaintSuggest.js](frontend/src/hooks/useImageComplaintSuggest.js) | `useImageComplaintSuggest` | Requests complaint suggestions from uploaded images. |
| [frontend/src/hooks/use-toast.js](frontend/src/hooks/use-toast.js) | `reducer`, `toast`, `useToast` | Implements the toast notification state and API. |

### Core Components

| Module | Key functions/classes | Brief functionality |
|---|---|---|
| [frontend/src/components/dashboard/AnnouncementPanel.jsx](frontend/src/components/dashboard/AnnouncementPanel.jsx) | `getDepartmentIcon`, `priorityBadgeVariant`, `AnnouncementCard`, `AnnouncementPanel` | Displays and creates announcements on dashboard screens. |
| [frontend/src/components/dashboard/TrackStatusPanel.jsx](frontend/src/components/dashboard/TrackStatusPanel.jsx) | `TrackStatusPanel` | Shows current complaint status tracking highlights. |
| [frontend/src/components/dashboard/RecentComplaints.jsx](frontend/src/components/dashboard/RecentComplaints.jsx) | `RecentComplaints` | Shows the most recent complaint entries. |
| [frontend/src/components/dashboard/ComplaintCard.jsx](frontend/src/components/dashboard/ComplaintCard.jsx) | `ComplaintCard` | Renders a complaint summary card with optional actions. |
| [frontend/src/components/dashboard/ComplaintsChart.jsx](frontend/src/components/dashboard/ComplaintsChart.jsx) | `ComplaintsBarChart`, `ComplaintsStatusChart` | Visualizes complaint volume and status distribution. |
| [frontend/src/components/dashboard/CitizenQuickActions.jsx](frontend/src/components/dashboard/CitizenQuickActions.jsx) | `CitizenQuickActions` | Surfaces common citizen actions on the dashboard. |
| [frontend/src/components/dashboard/CitizenActivityCard.jsx](frontend/src/components/dashboard/CitizenActivityCard.jsx) | `CitizenActivityCard` | Summarizes citizen activity in a card view. |
| [frontend/src/components/dashboard/CitizenTips.jsx](frontend/src/components/dashboard/CitizenTips.jsx) | `CitizenTips` | Shows user guidance and helpful tips. |
| [frontend/src/components/dashboard/DashboardSlider.jsx](frontend/src/components/dashboard/DashboardSlider.jsx) | `DashboardSlider` | Presents dashboard content in a slider format. |
| [frontend/src/components/dashboard/DashboardUserGuide.jsx](frontend/src/components/dashboard/DashboardUserGuide.jsx) | `DashboardUserGuide` | Provides onboarding/help guidance for dashboard users. |
| [frontend/src/components/dashboard/StatCard.jsx](frontend/src/components/dashboard/StatCard.jsx) | `StatCard` | Reusable card for metrics, trends, and quick navigation. |
| [frontend/src/components/complaint/ImageGallery.jsx](frontend/src/components/complaint/ImageGallery.jsx) | `ImageGallery`, `openLightbox`, `navigateImage`, `ImageGrid` | Displays complaint images with grouped previews and lightbox navigation. |
| [frontend/src/components/complaint/ImageUpload.jsx](frontend/src/components/complaint/ImageUpload.jsx) | `ImageUpload`, `handleFiles`, `handleDrag`, `handleDrop`, `removeImage`, `getPreviewUrl` | Handles image selection, drag-and-drop upload, previews, and removal. |
| [frontend/src/components/complaint/LocationSelector.jsx](frontend/src/components/complaint/LocationSelector.jsx) | `LocationSelector`, `handleZoneChange`, `handleWardChange` | Guides complaint location selection through zone, ward, and area inputs. |
| [frontend/src/components/complaint/DepartmentWorkPanel.jsx](frontend/src/components/complaint/DepartmentWorkPanel.jsx) | `DepartmentWorkPanel` | Shows department-specific complaint work details. |
| [frontend/src/components/complaint/StaffActionsPanel.jsx](frontend/src/components/complaint/StaffActionsPanel.jsx) | `StaffActionsPanel` | Provides staff actions for complaint handling. |
| [frontend/src/components/layout/DashboardLayout.jsx](frontend/src/components/layout/DashboardLayout.jsx) | `DashboardLayout` | Shared layout wrapper for authenticated sections. |
| [frontend/src/components/layout/Header.jsx](frontend/src/components/layout/Header.jsx) | `Header` | Application header bar. |
| [frontend/src/components/layout/NavBar.jsx](frontend/src/components/layout/NavBar.jsx) | `NavBar`, `NavBarWithLogo`, `getNavItems` | Role-aware navigation and menu construction. |
| [frontend/src/components/layout/Sidebar.jsx](frontend/src/components/layout/Sidebar.jsx) | `Sidebar` | Side navigation and mobile navigation support. |
| [frontend/src/components/ui/toaster.jsx](frontend/src/components/ui/toaster.jsx) | `Toaster` | Renders toast notifications. |
| [frontend/src/components/ui/sonner.jsx](frontend/src/components/ui/sonner.jsx) | `Toaster` | Provides the Sonner toast container. |
| [frontend/src/components/ui/tooltip.jsx](frontend/src/components/ui/tooltip.jsx) | `TooltipProvider` and related exports | Supplies tooltip behavior and styling primitives. |

### Libraries, Data, and Utilities

| Module | Key functions/classes | Brief functionality |
|---|---|---|
| [frontend/src/lib/api.js](frontend/src/lib/api.js) | `api`, `setAuthToken`, `getAuthToken`, `clearAuthToken`, `resolveAssetUrl` | Centralizes API requests, token persistence, and asset URL resolution. |
| [frontend/src/lib/utils.js](frontend/src/lib/utils.js) | `cn()` | Utility helper for merging CSS class names. |
| [frontend/src/data/suratData.js](frontend/src/data/suratData.js) | `getWardsByZone`, `getAreasByWard`, `getZoneById`, `getWardById`, `getAreaById` | Supplies local location metadata and lookup helpers. |
| [frontend/src/data/categories.js](frontend/src/data/categories.js) | data constants | Provides complaint category metadata used across the UI. |

### Shared UI Primitives

The files under [frontend/src/components/ui](frontend/src/components/ui) are reusable design-system primitives such as buttons, cards, dialogs, sheets, tables, inputs, alerts, tabs, badges, dropdowns, sliders, and form controls. They mainly wrap lower-level UI behavior with consistent styling so the feature modules above can stay focused on business logic.

## Notes

- Route modules are intentionally thin: they connect endpoint paths to controller functions and middleware.
- Shared UI primitives are grouped above because they are numerous and primarily provide styling/interaction scaffolding rather than domain logic.
- Build artifacts such as `frontend/dist` are excluded from this summary.