import React from "react";
import { BadgeRow } from "./BadgeRow";
import type { BadgeType } from "./badgeTypes";


type BadgeMap = Partial<Record<BadgeType, Set<string>>>;

type BadgeRowsProps = React.ComponentProps<"div"> & {badgeRows: BadgeMap | null};

export const BadgeRows = React.memo(({badgeRows, ...props}: BadgeRowsProps) => {
    return badgeRows && <>
        {
            (Object.keys(badgeRows) as BadgeType[]).map(badgeType => {
                const badgeItems = badgeRows[badgeType];
                if(!badgeItems?.size) return null;
                return <BadgeRow key={badgeType} badgeType={badgeType} badgeItems={badgeItems} {...props}/>;
            })
        }
    </>
});
