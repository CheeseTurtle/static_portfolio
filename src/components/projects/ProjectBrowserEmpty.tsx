import { LucideSearchX } from "lucide-react";
import { Button } from "../ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";
import { useFilterContext } from "./filtering/common/browserContext";
import React from "react";



export default function ProjectBrowserEmpty() {

    const resetFilter = useFilterContext(s=>s.resetFilter);
    const onClick = React.useCallback(()=>resetFilter(), [])

    return <Empty>
        <EmptyHeader>
            <EmptyMedia variant="icon">
                <LucideSearchX/>
            </EmptyMedia>
            <EmptyTitle>
                No projects match the current filter.
            </EmptyTitle>
            <EmptyDescription>
                ...
            </EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
            <Button onClick={onClick} className="not-disabled:cursor-pointer">Reset Filters</Button>
            {/* <div className="flex gap-2">
                <Button>Create Project</Button>
                <Button variant="outline">Import Project</Button>
            </div> */}
        </EmptyContent>
        {/* <Button
            variant="link"
            asChild
            className="text-muted-foreground"
            size="sm"
        >
            <a href="#">
            Learn More <ArrowUpRightIcon />
            </a>
        </Button> */}
    </Empty>

}