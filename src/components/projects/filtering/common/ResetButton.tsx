import { Button } from "@/components/ui/button";
import { RotateCcw, RotateCcwIcon, LucideRotateCcw } from "lucide-react";
import type React from "react";


type ButtonProps = React.ComponentPropsWithRef<typeof Button>;

const ResetButton = (props: ButtonProps) => {
    return <Button {...props}>
        <RotateCcw></RotateCcw>
    </Button>
};

export default ResetButton;