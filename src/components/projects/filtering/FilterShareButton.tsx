import { Button } from "@/components/ui/button";
// import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";
import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { cn } from "@/lib/utils";
import { ClipboardCheckIcon, LinkIcon/*, Share2Icon*/ } from "lucide-react";
import type React from "react";
import { useBrowserContext } from "./common/browserContext";


type FilterShareButtonProps = React.ComponentProps<typeof Button> & {


};

export default function FilterShareButton({className, ...props}: FilterShareButtonProps) {
    const [copy, isCopied] = useCopyToClipboard();
    const sync = useBrowserContext(s=>s.syncUrlToFilterState);

    // return <Tooltip>
    //     <TooltipTrigger asChild>
    return <Button title="Copy permalink to current filter combination" className={cn(className, )} {...props} onClick={()=>{
        sync();
        void copy(window.location.href);
    }}>
        {/* <Share2Icon></Share2Icon> */}
        {isCopied ? <ClipboardCheckIcon/> : <LinkIcon/>}
        Copy permalink
    </Button>;
    //     </TooltipTrigger>
    //     <TooltipContent>
    //         Share a filter
    //     </TooltipContent>
    // </Tooltip>
}