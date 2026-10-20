// Cabeçalho padrão das páginas internas: eyebrow com traço, título pesado e subtítulo
export default function PageHeader({
  eyebrow,
  title,
  description,
  children,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
}) {
  return (
    <header className="pt-10 pb-10">
      <p className="flex items-center gap-4 font-mono text-xs md:text-sm font-medium uppercase tracking-[0.3em] mb-5">
        <span className="h-[3px] w-8 bg-primary" aria-hidden="true" />
        {eyebrow}
      </p>
      <h1 className="text-4xl md:text-6xl font-extrabold leading-[1.05] mb-6">
        {title}
      </h1>
      {description && (
        <p className="max-w-2xl text-base md:text-lg leading-relaxed text-muted-foreground">
          {description}
        </p>
      )}
      {children}
    </header>
  );
}
