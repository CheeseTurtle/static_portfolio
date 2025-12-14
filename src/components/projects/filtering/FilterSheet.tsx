import {
    Sheet,
    // SheetClose,
    SheetContent,
    SheetDescription,
    // SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
// import { Button } from "@/components/ui/button";
import { type RefObject } from "react";
import type { ProjectInfo } from "../types";
import FilterForm from "./FilterForm";
import type { FilterRangeInfo } from "./common/filterTypes";
import { Button } from "@/components/ui/button";
import { LucideFilter } from "lucide-react";
// import { useBrowserContext } from "./common/browserContext";


export type FilterSheetProps = {
    // open: boolean,
    // setOpen: Dispatch<SetStateAction<boolean>> | ((open: boolean) => void),
    contentRef?: RefObject<HTMLDivElement | null>,
    triggerRef?: RefObject<HTMLButtonElement | null>,
    // ref?: RefObject<ReactElement<FilterSheetProps>>,
    rangeInfo: FilterRangeInfo,
    projects: ProjectInfo[],
    resetAll: () => void,
    registeredResets: RefObject<Set<()=>void>>,
    // registerReset: (resetFn: () => void) => void,
    registerReset: (resetFn: ()=>void) => ()=>void,

    // browserStore: BrowserStore,
    // allProjects: ProjectData[],
    // // visibleProjects: ProjectData[],
    // // setVisibleProjects: Dispatch<SetStateAction<ProjectData[]>>,
    // filterSpec: FilterSpec,
    // setFilterSpec: Dispatch<SetStateAction<FilterSpec>>,
};

export type FilterSpec = {
    topic?:  string[] | undefined,
    lang?: string[] | undefined,
    skill?: string[] | undefined,
    minYear?: number | undefined,
    maxYear?: number | undefined,
    category?: string | undefined,
};




export default function FilterSheet({contentRef, triggerRef, resetAll, registeredResets, registerReset, ...props}: FilterSheetProps) {
    
    // const {state, dispatch} = useFilter();

    // const open = useBrowserContext(s=>s.sheetOpen);
    // const setOpen = useBrowserContext(s=>s.setSheetOpen);


    return <Sheet onOpenChange={
        (open) => {
            if(!open) resetAll();
        }
    }>
        <SheetTrigger ref={triggerRef} asChild>
            <Button className="absolute rounded-full bottom-4 right-4 w-12 h-12 cursor-pointer" title="Edit filter">
                <LucideFilter />
            </Button>
        </SheetTrigger>
        <SheetContent side='top' className='overflow-y-auto max-h-screen top-0 bottom-0 h-min overscroll-none xs:px-1 sm:px-2 mx:px-4 lg:px-8 2xl:px-12' ref={contentRef}>
            {/* <div className="container overscroll-auto max-h-full"> */}
            <SheetHeader>
                <SheetTitle>Turtles</SheetTitle>
                <SheetDescription>Turtles</SheetDescription>
            </SheetHeader>

            <FilterForm inSheet={true} resetAll={resetAll} registeredResets={registeredResets} registerReset={registerReset} {...props}></FilterForm>

            {/* <SheetFooter>
                <Button type="submit">Save changes</Button>
                <SheetClose asChild>
                    <Button variant="outline">Close</Button>
                </SheetClose>
            </SheetFooter> */}
            {/* </div> */}
        </SheetContent>
    </Sheet>
}   
