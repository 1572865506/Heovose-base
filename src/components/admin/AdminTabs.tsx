import * as React from "react"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { cn } from "@/lib/utils"

/**
 * 统一的后台标签页组件
 */
export const AdminTabs = Tabs

export const AdminTabsList = React.forwardRef<
  React.ElementRef<typeof TabsList>,
  React.ComponentPropsWithoutRef<typeof TabsList>
>(({ className, ...props }, ref) => (
  <TabsList
    ref={ref}
    className={cn(
      "bg-card/50 backdrop-blur-xl border border-border/40 p-1 rounded-2xl h-14 inline-flex items-center justify-start gap-1 shadow-sm overflow-hidden",
      className
    )}
    {...props}
  />
))
AdminTabsList.displayName = "AdminTabsList"

export const AdminTabsTrigger = React.forwardRef<
  React.ElementRef<typeof TabsTrigger>,
  React.ComponentPropsWithoutRef<typeof TabsTrigger>
>(({ className, ...props }, ref) => (
  <TabsTrigger
    ref={ref}
    className={cn(
      "rounded-xl px-6 md:px-8 h-12 font-bold text-[10px] uppercase tracking-widest transition-all duration-300 gap-2 text-muted-foreground hover:text-foreground/80 hover:bg-primary/5",
      "data-[state=active]:bg-primary data-[state=active]:text-white data-[state=active]:shadow-md data-[state=active]:shadow-primary/10 data-[state=active]:hover:bg-primary data-[state=active]:hover:text-white",
      "active:scale-98 active:duration-75",
      className
    )}
    {...props}
  />
))
AdminTabsTrigger.displayName = "AdminTabsTrigger"

export const AdminTabsContent = TabsContent
