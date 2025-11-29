import { Button } from "@/components/ui/button";
// import type { ExtractValueType } from "@/lib/type-utils";
import { RotateCcw/*, RotateCcwIcon, LucideRotateCcw*/ } from "lucide-react";
// import type { Key } from "react";
import type React from "react";


type ButtonProps = React.ComponentPropsWithRef<typeof Button>;
// type VariantType = ExtractValueType<ButtonProps, "variant">;
// type SizeType = ExtractValueType<ButtonProps, "size">;

export interface ResetButtonProps extends Omit<ButtonProps, "children"> {
    children?: string | undefined | null,
    // variant?: VariantType,
    // size?: SizeType
}

const ResetButton = ({children, variant = "ghost", size="default", ...props}: ResetButtonProps) => {
    const label = children || undefined;
    return <Button variant={variant} size={size} {...props} aria-label={label} title={label}
            // className="absolute -left-12 top-1/2 -translate-y-1/2 h-auto py-1 px-2 text-xs"
    >
        <RotateCcw size={2}></RotateCcw>
    </Button>
};

export default ResetButton;