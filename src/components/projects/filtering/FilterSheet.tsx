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
import { useState, type Dispatch, type SetStateAction } from "react";
import type { ProjectData } from "../types";
import FilterForm from "./FilterForm";


export type FilterSheetProps = {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    allProjects: ProjectData[],
    // visibleProjects: ProjectData[],
    // setVisibleProjects: Dispatch<SetStateAction<ProjectData[]>>,
    filterSpec: FilterSpec,
    setFilterSpec: Dispatch<SetStateAction<FilterSpec>>,
};

export type FilterRangeInfo = {
    lang: Set<string>,
    topic: Set<string>,
    // concept: string[],
    skill: Set<string>,
    minYear: number,
    maxYear: number,
    categories: Set<string>,
    // audiences: string[],
    count: number
};

export type FilterSpec = {
    topic?:  string[] | undefined,
    lang?: string[] | undefined,
    skill?: string[] | undefined,
    minYear?: number | undefined,
    maxYear?: number | undefined,
    category?: string | undefined,
};



function collectFilterInfo(allProjects: ProjectData[]): FilterRangeInfo {
    const langs: Set<string> = new Set(), topics: Set<string> = new Set(), concepts: Set<string> = new Set(), skills: Set<string> = new Set();
    const categories: Set<string> = new Set();  //, audiences: Set<string> = new Set();
    let minYear: number | undefined;
    let maxYear: number | undefined;
    let count: number = 0;

    allProjects?.forEach((p) => {
        categories.add(p.category);
        // if(p.audience) audiences.add(p.audience);
        if(minYear === undefined || minYear > p.year) minYear = p.year;
        if(maxYear === undefined || maxYear < p.year) maxYear = p.year;
        p.tags.languages?.forEach((x)=>langs.add(x));
        p.tags.skills?.forEach((x)=>skills.add(x));
        p.tags.topics?.forEach((x)=>topics.add(x));
        count++;
    });

    if(minYear === undefined || maxYear === undefined)
        throw 'No projects, or no projects with years';

    return {
        lang: langs, topic: topics, skill: skills, minYear, maxYear, categories, count
    }
}


export default function FilterSheet(props: FilterSheetProps) {

    const filterInfo: FilterRangeInfo = collectFilterInfo(props.allProjects);

    return <Sheet>
        <SheetTrigger>Open</SheetTrigger>
        <SheetContent side='right'>
            <SheetHeader>
                <SheetTitle>Turtles</SheetTitle>
                <SheetDescription>Turtles</SheetDescription>
            </SheetHeader>

            <FilterForm filterRangeInfo={filterInfo} {...props}></FilterForm>

            <SheetFooter>
                <Button type="submit">Save changes</Button>
                <SheetClose asChild>
                    <Button variant="outline">Close</Button>
                </SheetClose>
            </SheetFooter>
        </SheetContent>
    </Sheet>
}   
