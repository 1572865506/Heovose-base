import * as React from 'react';

import {cn} from '@/lib/utils';

const Textarea = React.forwardRef<HTMLTextAreaElement, React.ComponentProps<'textarea'>>(
  ({className, ...props}, ref) => {
    return (
      <textarea
        className={cn(
          'flex min-h-[80px] w-full rounded-lg border border-border/60 bg-muted/20 px-3 py-2 text-xs transition-all duration-200 ring-offset-background placeholder:text-muted-foreground/60 hover:border-border focus-visible:outline-none focus-visible:border-primary/50 focus-visible:ring-4 focus-visible:ring-primary/5 focus-visible:bg-muted/10 disabled:cursor-not-allowed disabled:opacity-50 scrollbar-minimal overflow-y-auto',
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);
Textarea.displayName = 'Textarea';

export {Textarea};
