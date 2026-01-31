import { Link } from 'react-router-dom';
import { PlusCircle, ClipboardList, FolderOpen, HardHat, ArrowRight } from 'lucide-react';

const guideSteps = [
  { icon: PlusCircle, title: 'File a complaint', href: '/complaints/new', desc: 'Submit issue with photos & location' },
  { icon: ClipboardList, title: 'Track status', href: '/complaints', desc: 'View your complaints & updates' },
  { icon: FolderOpen, title: 'Documents', href: '/documents', desc: 'Download circulars & notices' },
  { icon: HardHat, title: 'Projects', href: '/projects', desc: 'Ongoing municipal projects' },
];

export function DashboardUserGuide() {
  return (
    <div className="min-h-[220px] h-full rounded-xl border border-border bg-card shadow-md p-4 overflow-y-auto">
      <h3 className="text-base font-semibold text-[#06038D] mb-3 pb-2 border-b border-border">
        User Guide
      </h3>
      <ul className="space-y-3">
        {guideSteps.map((item) => (
          <li key={item.href}>
            <Link
              to={item.href}
              className="flex items-start gap-3 p-2 rounded-lg hover:bg-primary/5 transition-colors group"
            >
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-[#06038D]">
                <item.icon className="h-4 w-4" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="font-medium text-sm text-foreground group-hover:text-[#06038D]">
                  {item.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">{item.desc}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-muted-foreground group-hover:text-[#06038D] mt-1" />
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
