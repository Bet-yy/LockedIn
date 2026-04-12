interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <div className="max-w-3xl">
      <p className="section-label">{eyebrow}</p>
      <h1 className="mt-1 font-display text-2xl font-bold text-gray-900">
        {title}
      </h1>
      <p className="mt-1 text-sm leading-6 text-gray-500">{description}</p>
    </div>
  );
}
