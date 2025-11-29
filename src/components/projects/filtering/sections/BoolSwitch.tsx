import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type React from "react";

export default function BoolSwitch({className, checked, ...props}: React.ComponentProps<typeof Switch>) {

    return <div role="group" aria-label="Tag match mode" className="flex text-xs rounded-2xl dark:bg-black bg-white gap-2 px-2 py-1 items-center">
        <span className={!checked ? '' : 'text-muted-foreground'} aria-hidden="true">Match ALL</span>

        <Switch
            className={cn("inline-flex focus-visible:ring-2 focus-visible:ring-primary", className)}
            aria-label="Toggle match mode: Match ALL or Match ANY"
            checked={checked}
            {...props}
        />

        <span className={checked ? '' : 'text-muted-foreground'} aria-hidden="true">Match ANY</span>
    </div>
}