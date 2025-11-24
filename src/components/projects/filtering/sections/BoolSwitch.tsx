import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";
import type React from "react";

export default function BoolSwitch({className, checked, ...props}: React.ComponentProps<typeof Switch>) {

    return <div className="flex text-xs rounded-2xl dark:bg-black bg-white gap-2 px-2 py-1">
        <label className={!checked ? '' : 'text-muted-foreground'}>Match ALL</label>

        <Switch className={cn("inline-flex", 
            
            className)} {...props}></Switch>
        <label className={checked ? '' : 'text-muted-foreground'}>Match ANY</label>
    </div>
}