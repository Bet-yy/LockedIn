interface PageIntroProps {
  eyebrow: string;
  title: string;
  description: string;
}

export function PageIntro({ eyebrow, title, description }: PageIntroProps) {
  return (
    <div className="max-w-3xl">
      <p className="section-label">{eyebrow}</p>
      <h1 className="mt-4 font-display text-4xl font-bold tracking-tight text-sand-100 md:text-5xl">
        {title}
      </h1>
      <p className="mt-4 text-lg leading-8 text-sand-200/78">{description}</p>
    </div>
  );
}
