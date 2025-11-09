import { BadgeRow } from "./BadgeRow";
import type { BadgeType } from "./badgeTypes";


type BadgeMap = Record<BadgeType, string[]>;

type BadgeRowsProps = React.ComponentProps<"div"> & {badgeRows: BadgeMap};

// export function isNonemptyTags(badgeRows: BadgeMap)

export const BadgeRows = ({badgeRows, ...props}: BadgeRowsProps) => {
    return <div>
        {
            (Object.keys(badgeRows) as BadgeType[]).map(badgeType => {
                const badgeItems = badgeRows[badgeType];
                if(badgeItems.length == 0) return null;
                return <BadgeRow key={badgeType} badgeType={badgeType} badgeItems={badgeItems}/>;
            })
        }
    </div>
}
