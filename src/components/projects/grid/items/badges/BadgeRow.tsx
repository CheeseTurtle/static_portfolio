import { useEffect, useMemo, useRef, useState } from "react";
import { type BadgeType, getBadgeConstructor } from "./badgeTypes";
type BadgeRowProps = React.ComponentProps<"div"> & {badgeType: BadgeType, badgeItems: Set<string>}

export const BadgeRow = ({badgeType, badgeItems, ...props}: BadgeRowProps) => {
  const BadgeConstructor = useMemo(()=>getBadgeConstructor(badgeType), [badgeType]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(badgeItems.size);

  const badgeArray = useMemo(() => Array.from(badgeItems), [badgeItems]);

  // Measure which badges fit
  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      const containerWidth = container.offsetWidth;
      let totalWidth = 0;
      let count = 0;
      const children = Array.from(container.children) as HTMLElement[];

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        totalWidth += child.offsetWidth + 4; // 4px gap
        if (totalWidth > containerWidth) break;
        count++;
      }

      setVisibleCount(count);
    };

    handleResize();
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    window.addEventListener("resize", handleResize);

    return () => {
      ro.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [badgeArray]);

  const visibleBadges = useMemo(()=> badgeArray.slice(0, visibleCount), [badgeArray, visibleCount]);
  const hiddenCount = useMemo(() => badgeArray.length - visibleCount, [badgeArray, visibleCount]);

  return (
    <div ref={containerRef} className="flex gap-1 overflow-hidden" data-slot='badge-row' data-badge-type={badgeType} {...props}>
    {
        visibleBadges.map((label, idx) => (
            <BadgeConstructor key={`${label}${idx}`}>{label}</BadgeConstructor>
        ))
    }
    {
        hiddenCount > 0 && (
          <div className="bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm">
            {visibleBadges.length > 0 ? `+${hiddenCount}` : `${hiddenCount} items`}
          </div>
        )
    }
    </div>
  );
};