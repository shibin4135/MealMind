import * as React from "react";
import { cn } from "@/lib/utils";

interface SectionProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  description?: string;
}

const Section = React.forwardRef<HTMLDivElement, SectionProps>(
  ({ className, title, description, children, ...props }, ref) => {
    return (
      <section ref={ref} className={cn("space-y-6", className)} {...props}>
        {(title || description) && (
          <div className="space-y-2">
            {title && (
              <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
            )}
            {description && (
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </section>
    );
  }
);
Section.displayName = "Section";

export { Section };

