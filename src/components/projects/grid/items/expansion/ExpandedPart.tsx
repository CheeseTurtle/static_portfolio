import { forwardRef } from "react";

type ExpandedPartProps = React.ComponentProps<"div"> & {}

const ExpandedPart = forwardRef<HTMLDivElement, ExpandedPartProps>(({children, ...props}: ExpandedPartProps, ref) => {
    return <div ref={ref} style={{height: 0, overflow: 'hidden', opacity: 0}} data-slot='project-item-extra' {...props}>{children}</div>;
});

export default ExpandedPart;
