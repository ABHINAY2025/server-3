import { cn } from "@/lib/utils"

interface PagePlaceholderProps {
  title: string
  description: string
  className?: string
}

export function PagePlaceholder({
  title,
  description,
  className,
}: PagePlaceholderProps) {
  return (
    <div className={cn("flex flex-1 flex-col gap-6 px-4 py-6 lg:px-6", className)}>
      <div className="max-w-3xl space-y-2">
        <h2 className="text-2xl font-semibold tracking-tight">{title}</h2>
        <p className="text-muted-foreground">{description}</p>
      </div>
      <div className="grid min-h-[320px] place-items-center rounded-lg border border-dashed border-muted-foreground/40 text-sm text-muted-foreground">
        {title} content coming soon.
      </div>
    </div>
  )
}
