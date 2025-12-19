import { Skeleton } from "@/components/ui/skeleton";
import { useWindowSize } from "@/hooks/useWindowSize";
import React from "react";
import { useStagger } from "./useStagger";
import { cn } from "@/lib/utils";


function* refCreationIterator<T>(n: number, existing?: Array<React.RefObject<T | null>>) {
    for(let i = 0; i < n; i++)
        yield existing?.[i] ?? React.createRef<T | null>()
}

function createRefArray<T>(n: number, existing?: Array<React.RefObject<T | null>>) {
    if(existing && existing.length === n && existing.every(x=>!!x))
        return existing;
    return Array.from(refCreationIterator(n, existing))
}


function* generateElemArray<T>(n: number, func: (index: number) => T) {
    for(let i=0; i<n; i++)
        yield func(i);
}
function createElemArray<T>(n: number, func: (index: number) => T): Array<T> {
    return Array.from(generateElemArray(n, func))
}



function getTagButtonClasses(variant?: 'default' | 'secondary' | 'destructive' | 'outline') {
    const baseClassName = "inline-flex items-center justify-center rounded-md border px-2 py-0.5 text-xs font-medium grow whitespace-nowrap shrink-0 [&>svg]:size-3 gap-1 [&>svg]:pointer-events-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive transition-[color,box-shadow] overflow-hidden"
    if(variant) {
        switch(variant) {
            case "default":
                break;
            case "secondary":
                return baseClassName + "border-transparent bg-secondary";
            case "destructive":
                return baseClassName + "border-transparent bg-destructive";
            case "outline":
                return baseClassName + "";
            default:
                break;
        }
    }
    return baseClassName + "border-transparent bg-primary"
}

function TagButtonSkeleton({className, variant}: {className?: string, variant?: 'default' | 'secondary' | 'destructive' | 'outline'}) {
    
    const className_ = getTagButtonClasses(variant);
    return <Skeleton className={cn(
        className_, 
        "h-3",
        className)}/>
}

function TagRowSkeleton({numTags, className: tagClassName}: {className?: string, numTags?: number}) {
    return numTags ? <div
        className="flex flex-row gap-1 grow overflow-clip max-w-full min-w-[30%] content-stretch justify-stretch justify-items-stretch flex-nowrap"
    >
        {
            createElemArray(numTags, (i)=><TagButtonSkeleton className={tagClassName} key={i}/>)
        }
    </div> : null;

}

const ProjectGridItemSkeleton = React.memo(({ref}: {ref: React.RefObject<HTMLDivElement | null>}) => {
    // TODO: Mix bg-card
    return <div ref={ref} className="relative rounded-xl h-min min-w-12 flex flex-col text-card-foreground py-6 shadow-sm gap-6 bg-gray-100 dark:bg-gray-900">

        <div className="@container/card-header grid auto-rows-min grid-rows[auto_auto] items-start gap-1.5 px-6 pb-2 [.border-b]:pb-6">
            <div className="flex justify-between items-baseline justify-items-stretch gap-4">
                {/* Title */}
                <Skeleton className="text-lg h-4 bg-foreground w-[70%] max-w-[70%]"/>

                {/* Year */}
                <Skeleton className="text-sm h-3 max-w-[15%] grow w-max bg-muted-foreground outline-1 outline-red-500" />
            </div>
            {/* Description */}
            <Skeleton className="text-sm bg-muted-foreground h-3"/>
        </div> 

        {/* Category */}
        <Skeleton className="absolute w-full inset-0 justify-center h-min rounded-t-xl text-sm bg-gray-900 dark:bg-gray-400"/>

        <div className="px-6 space-y-2">
            {/* Tags */}
            <div className="flex flex-col gap-2 h-max justify-stretch justify-items-stretch items-stretch">
                {/* Tag row */}
                <TagRowSkeleton numTags={3} className="bg-green-500" />
                {/* Tag row */}
                <TagRowSkeleton numTags={2} className="bg-blue-500" />
            </div>
        </div>


    </div>
})

const ITEMS_PER_COLUMN: number = 4

const ProjectGridSkeletonColumn = React.memo(({elemRefs}: {elemRefs: React.RefObject<HTMLDivElement | null>[]}) => {
    return <div className="relative flex flex-col gap-2 flex-nowrap overflow-clip min-w-max min-h-max h-full justify-start justify-items-start outline-2 outline-blue-500">
        {elemRefs.map((ref, i) =>
            <ProjectGridItemSkeleton key={i} ref={ref} />)
        }
        {/* {(new Array(ITEMS_PER_COLUMN)).map((_,i)=><ProjectGridItemSkeleton key={i}/>)} */}
    </div>
});


const ProjectGridSkeletonInner = React.memo(({numColumns}: {numColumns: number}) => {

    const columnRefs = React.useRef<React.RefObject<HTMLDivElement | null>[][]>([]);
    // columnRefs.current = (new Array(numColumns)).map((_,i)=>(
    //     createRefArray(ITEMS_PER_COLUMN, columnRefs.current?.[i])
    // ))
    columnRefs.current = createElemArray(numColumns, (i)=>createRefArray(ITEMS_PER_COLUMN, columnRefs.current?.[i]))

    useStagger<HTMLDivElement>(columnRefs.current);
    
    // const columns = (new Array(numColumns)).map((_,i)=><ProjectGridSkeletonColumn key={i} elemRefs={columnRefs.current[i]} />)
    const columns = React.useMemo(()=>createElemArray(numColumns, (i)=><ProjectGridSkeletonColumn key={i} elemRefs={columnRefs.current[i]}/>), [numColumns]);
    console.log('COLUMNS:', columns)
    return <div className="h-full min-h-screen w-full grid grid-flow-col gap-4 px-4 justify-stretch auto-cols-fr outline-1 outline-red-500">
        {columns}
    </div>
});

const ProjectGridSkeleton = React.memo(() => {
    const {width} = useWindowSize()
    
      // Determine number of columns based on viewport width
    const numColumns = React.useMemo(() => {
        if (width < 640) return 1;
        if (width < 1024) return 2;
        if (width < 1400) return 3;
        return 4;
      }, [width]);
      
    return <ProjectGridSkeletonInner numColumns={numColumns} />
});

export default ProjectGridSkeleton;
