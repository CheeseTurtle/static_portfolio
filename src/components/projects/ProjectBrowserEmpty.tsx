import { LucideSearchX } from "lucide-react";
import { Button } from "../ui/button";
import { Empty, EmptyContent, EmptyDescription, EmptyHeader, EmptyMedia, EmptyTitle } from "../ui/empty";



export default function ProjectBrowserEmpty() {
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
            <div className="flex gap-2">
                <Button>Create Project</Button>
                <Button variant="outline">Import Project</Button>
            </div>
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