import { ReactNode } from 'react';

interface FeatureCardProps {
  icon: ReactNode;
  title: string;
  description: string;
}

export function FeatureCard({ icon, title, description }: FeatureCardProps) {
  return (
    <div className="bg-card group relative rounded-lg border p-8 shadow-sm transition-all hover:-translate-y-1 hover:shadow-md">
      <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-lg bg-primary/10 text-primary">
        {icon}
      </div>
      <h3 className="mb-3 text-2xl font-semibold">{title}</h3>
      <p className="text-lg text-muted-foreground">{description}</p>
    </div>
  );
}
