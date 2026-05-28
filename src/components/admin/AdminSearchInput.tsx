import * as React from "react"
import { Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

export interface AdminSearchInputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type'> {
  iconClassName?: string;
}

/**
 * 统一的后台高级检索输入框组件
 */
export const AdminSearchInput = React.forwardRef<HTMLInputElement, AdminSearchInputProps>(
  ({ className, placeholder = "实时检索...", iconClassName, ...props }, ref) => {
    return (
      <div className="relative flex-1 w-full group">
        <Search
          className={cn(
            "absolute left-5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground/40 group-focus-within:text-primary transition-all duration-300",
            iconClassName
          )}
        />
        <Input
          ref={ref}
          type="text"
          placeholder={placeholder}
          className={cn(
            "pl-14 border-none bg-muted/20 focus-visible:ring-0 rounded-2xl h-14 text-xs font-bold transition-all duration-300",
            "placeholder:text-muted-foreground/40 placeholder:font-bold placeholder:uppercase placeholder:tracking-[0.15em]",
            className
          )}
          {...props}
        />
      </div>
    )
  }
)

AdminSearchInput.displayName = "AdminSearchInput"
