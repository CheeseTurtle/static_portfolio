import {
    Sheet,
    SheetClose,
    SheetContent,
    SheetDescription,
    SheetFooter,
    SheetHeader,
    SheetTitle,
    SheetTrigger
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { useCallback, useEffectEvent, useRef, useState, type Dispatch, type SetStateAction } from "react";
import type { ProjectData, ProjectInfo } from "../types";
import FilterForm from "./FilterForm";
import type { FilterRangeInfo } from "./common/filterTypes";
import { useFilter } from "./common/filterContext";


export type FilterSheetProps = {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    rangeInfo: FilterRangeInfo,
    projects: ProjectInfo[],
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




export default function FilterSheet(props: FilterSheetProps) {
    
    const {state, dispatch} = useFilter();

    // This is the shared reset function all TagButtons can call
    const resetAll = useEffectEvent(() => {
        // We'll notify children via a callback they register
        registeredResets.current.forEach((fn) => fn());
    });

    // Keep a registry of reset callbacks for each TagButtons
    const registeredResets = useRef<Set<() => void>>(new Set());

    const registerReset = useCallback((resetFn: () => void) => {
        registeredResets.current.add(resetFn);
        return () => {registeredResets.current.delete(resetFn);} // cleanup
    }, []);

    return <Sheet onOpenChange={
        (open) => {
            if(!open) resetAll();
        }
    }>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side='top'>
            <SheetHeader>
                <SheetTitle>Turtles</SheetTitle>
                <SheetDescription>Turtles</SheetDescription>
            </SheetHeader>

            <FilterForm state={state} dispatch={dispatch} registerReset={registerReset} {...props}></FilterForm>

            {/* <SheetFooter>
                <Button type="submit">Save changes</Button>
                <SheetClose asChild>
                    <Button variant="outline">Close</Button>
                </SheetClose>
            </SheetFooter> */}
        </SheetContent>
    </Sheet>
}   
