import React, { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { type BadgeType, getBadgeConstructor } from "./badgeTypes";
type BadgeRowProps = React.ComponentProps<"div"> & {badgeType: BadgeType, badgeItems: Set<string>}

export const BadgeRow = React.memo(({badgeType, badgeItems, ...props}: BadgeRowProps) => {
  const BadgeConstructor = useMemo(()=>getBadgeConstructor(badgeType), [badgeType]);

  const containerRef = useRef<HTMLDivElement>(null);
  const [visibleCount, setVisibleCount] = useState(badgeItems.size);

  const badgeArray = useMemo(() => Array.from(badgeItems), [badgeItems]);

  const visibleBadges = useMemo(()=> badgeArray.slice(0, visibleCount), [badgeArray, visibleCount]);
  const hiddenCount = useMemo(() => badgeArray.length - visibleCount, [badgeArray, visibleCount]);
  
  const lastContainerWidth = useRef<number>(0);

  const hiddenCountRef = useRef<number>(0);
  const visibleCountRef = useRef<number>(0);

  useEffect(()=>{
    visibleCountRef.current = visibleCount;
  }, [visibleCount]);

  useEffect(()=>{
    hiddenCountRef.current = hiddenCount;
  }, [hiddenCount]);

  // Measure which badges fit
  useLayoutEffect(() => {
    console.log('BadgeRow layout effect begin')
    const container = containerRef.current;
    if (!container) return;

    const handleResize = () => {
      const containerWidth = container.offsetWidth;
      if(lastContainerWidth.current === containerWidth)
        return;

      const children = Array.from(container.children) as HTMLElement[];
      const maxCount = (lastContainerWidth.current >= containerWidth) ? (
        visibleCountRef.current
      ) : children.length;


      let totalWidth = 0, count = 0;
      for (let i = 0; i < maxCount; i++) {
        const child = children[i];
        totalWidth += child.offsetWidth + 4; // 4px gap
        if (totalWidth > containerWidth) break;
        count++;
      }

      if(count <= maxCount) setVisibleCount(count);
      lastContainerWidth.current = containerWidth;
    };

    handleResize();
    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    window.addEventListener("resize", handleResize);
    console.log('BadgeRow layout effect end')
    return () => {
      ro.disconnect();
      window.removeEventListener("resize", handleResize);
    };
  }, [badgeArray]);

  return (
    <div ref={containerRef} className="flex gap-1 overflow-hidden" data-slot='badge-row' data-badge-type={badgeType} {...props}>
    {
        visibleBadges.map((label, idx) => (
            <BadgeConstructor key={`${label}${idx}`}>{label}</BadgeConstructor>
        ))
    }
    {
      // TODO: Tooltip
        hiddenCount > 0 && (
          <div className="bg-gray-300 text-gray-600 dark:bg-gray-800 dark:text-gray-400 px-2 py-1 rounded text-xs">
            {visibleBadges.length > 0 ? `+${hiddenCount}` : `${hiddenCount} items`}
          </div>
        )
    }
    </div>
  );
});