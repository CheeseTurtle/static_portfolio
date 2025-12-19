import { LoaderIcon, type LucideProps } from "lucide-react"

import { cn } from "@/lib/utils"
import React from "react"


type LucideIconComponent = React.ForwardRefExoticComponent<Omit<LucideProps, "ref"> & React.RefAttributes<SVGSVGElement>>

export function CustomSpinner({ className, Icon = LoaderIcon, ...props }: React.ComponentProps<"svg"> & {Icon?: LucideIconComponent} & React.ComponentProps<LucideIconComponent>) {

    return (
        <Icon
            role="status"
            aria-label="Loading"
            className={cn("size-4 animate-spin", className)}
            {...props}
        />
    )
}

export function SpinnerCustomWrapped() {
    return (
        <div className="flex items-center gap-4">
            <CustomSpinner Icon={LoaderIcon} />
        </div>
    )
}
