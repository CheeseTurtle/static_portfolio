import React from "react";
import { BadgeRow } from "./BadgeRow";
import type { BadgeType } from "./badgeTypes";


type BadgeMap = Record<BadgeType, Set<string>>;

type BadgeRowsProps = React.ComponentProps<"div"> & {badgeRows: BadgeMap};

export const BadgeRows = React.memo(({badgeRows, ...props}: BadgeRowsProps) => {
    return <>
        {
            (Object.keys(badgeRows) as BadgeType[]).map(badgeType => {
                const badgeItems = badgeRows[badgeType];
                if(badgeItems.size === 0) return null;
                return <BadgeRow key={badgeType} badgeType={badgeType} badgeItems={badgeItems} {...props}/>;
            })
        }
    </>
});
