import { Card } from '../components/atoms/Card';

interface PlaceholderPageProps {
  title: string;
  icon?: string;
  storyId?: string;
}

export function PlaceholderPage({ title, storyId }: PlaceholderPageProps) {
  return (
    <div className="flex items-center justify-center min-h-[50vh]">
      <Card className="p-12 text-center max-w-sm w-full">
        <h2 className="text-slate-200 font-semibold text-lg mb-2">{title}</h2>
        {storyId && (
          <p className="text-slate-600 text-xs uppercase tracking-widest">
            {storyId} — Coming soon
          </p>
        )}
        <p className="text-slate-600 text-sm mt-3">
          This module will be implemented in the next update.
        </p>
      </Card>
    </div>
  );
}