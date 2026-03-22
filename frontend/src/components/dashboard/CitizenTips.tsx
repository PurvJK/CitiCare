import { Link } from 'react-router-dom';
import { Lightbulb, PlusCircle } from 'lucide-react';

const tips = [
  'Add a clear photo of the issue — it helps the department act faster.',
  'Mention the exact location (landmark or address) so the team can find it easily.',
  'You can track your report anytime from "Track my issues".',
];

export function CitizenTips() {
  return (
    <div className="rounded-2xl border border-[#046A38]/20 bg-[#046A38]/5 p-5">
      <div className="flex items-center gap-2 mb-3">
        <Lightbulb className="h-5 w-5 text-[#046A38]" />
        <h3 className="font-semibold text-foreground">Tips for a quick response</h3>
      </div>
      <ul className="space-y-2 text-sm text-muted-foreground mb-4">
        {tips.map((tip, i) => (
          <li key={i} className="flex gap-2">
            <span className="text-[#046A38] font-medium shrink-0">{i + 1}.</span>
            {tip}
          </li>
        ))}
      </ul>
      <Link
        to="/complaints/new"
        className="inline-flex items-center gap-2 text-sm font-medium text-[#046A38] hover:underline"
      >
        <PlusCircle className="h-4 w-4" />
        Report an issue in under a minute
      </Link>
    </div>
  );
}
