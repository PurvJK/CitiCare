import { Link } from 'react-router-dom';
import { PlusCircle, ClipboardList, FolderOpen, HardHat, ArrowRight } from 'lucide-react';

const actions = [
  {
    icon: PlusCircle,
    title: 'Report an issue',
    description: 'Pothole, street light, garbage, or water problem? Report it with a photo.',
    href: '/complaints/new',
    label: 'Report now',
    accent: 'saffron',
  },
  {
    icon: ClipboardList,
    title: 'Track my issues',
    description: 'See status of your reports and get updates from the department.',
    href: '/complaints',
    label: 'View status',
    accent: 'blue',
  },
  {
    icon: FolderOpen,
    title: 'Documents & circulars',
    description: 'Download notices, circulars, and official documents.',
    href: '/documents',
    label: 'Browse',
    accent: 'green',
  },
  {
    icon: HardHat,
    title: 'Projects in my area',
    description: 'See ongoing civic works and development projects.',
    href: '/projects',
    label: 'Explore',
    accent: 'blue',
  },
];

export function CitizenQuickActions() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {actions.map((item) => (
        <Link
          key={item.href}
          to={item.href}
          className="group rounded-2xl border border-border bg-card p-5 shadow-sm hover:shadow-lg hover:border-[#06038D]/30 transition-all duration-200 hover:-translate-y-0.5"
        >
          <div
            className={`inline-flex h-12 w-12 rounded-xl items-center justify-center mb-4 ${
              item.accent === 'saffron'
                ? 'bg-[#FF671F]/15 text-[#FF671F]'
                : item.accent === 'green'
                  ? 'bg-[#046A38]/15 text-[#046A38]'
                  : 'bg-[#06038D]/10 text-[#06038D]'
            }`}
          >
            <item.icon className="h-6 w-6" />
          </div>
          <h3 className="font-semibold text-foreground mb-1 group-hover:text-[#06038D] transition-colors">
            {item.title}
          </h3>
          <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{item.description}</p>
          <span className="inline-flex items-center text-sm font-medium text-[#06038D] group-hover:underline">
            {item.label}
            <ArrowRight className="ml-1 h-4 w-4 transition-transform group-hover:translate-x-0.5" />
          </span>
        </Link>
      ))}
    </div>
  );
}
