
import { cn } from "@/lib/utils";

interface SectionHeadingProps {
  title: string;
  subtitle?: string;
  centered?: boolean;
  className?: string;
}

export function SectionHeading({ title, subtitle, centered = false, className }: SectionHeadingProps) {
  return (
    <div className={cn(
      "mb-12 md:mb-16 space-y-4",
      centered ? "text-center" : "text-left",
      className
    )}>
      <h2 className="text-3xl md:text-5xl font-headline font-bold text-primary animate-fade-in-up">
        {title}
      </h2>
      {subtitle && (
        <p className="text-muted-foreground text-lg md:text-xl max-w-2xl mx-auto md:mx-0 animate-fade-in-up [animation-delay:100ms]">
          {subtitle}
        </p>
      )}
    </div>
  );
}
