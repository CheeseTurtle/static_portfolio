// import { Tooltip } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
// import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import React, { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { /*ClipboardCopyIcon,*/ CopyCheckIcon, CopyIcon, FunnelIcon } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import type { ShowToastFn } from "@/components/projects/filtering/common/filterTypes";
// import { useMediaQuery } from "@/hooks/use-media-query";


// type PopoverTooltipProps = React.ComponentProps<typeof Tooltip> & {
// };

// export default function popoverTooltip(props: PopoverTooltipProps) {
//     return <Tooltip {...props}></Tooltip>
// }

interface ShareCardProps extends React.ComponentProps<typeof HoverCard> {
    triggerProps?: React.ComponentProps<typeof HoverCardTrigger>,
    contentProps?: React.ComponentProps<typeof HoverCardContent>,
    copy: ReturnType<typeof useCopyToClipboard>[0],
    isCopied: ReturnType<typeof useCopyToClipboard>[1],
    showToast: ShowToastFn,
    openProjectId: string,
    URLtoCopy: React.RefObject<string>,

    urlChanged: boolean,
    setURLChanged: React.Dispatch<React.SetStateAction<boolean>>,

    
    includeFilters: boolean,
    setIncludeFilters: React.Dispatch<React.SetStateAction<boolean>>,

    doCopy: () => void,
}


function getURLToCopy(includeFilters: boolean, openProjectId: string) {
    if(includeFilters) return window.location.host + window.location.pathname + window.location.search;
    const params = new URLSearchParams({project: openProjectId});
    return window.location.host + window.location.pathname +  '?' + params.toString()
}


type ShareButtonProps = React.ComponentProps<typeof Button> & {
    hovercardProps?: React.ComponentProps<typeof HoverCard>,
    triggerProps?: React.ComponentProps<typeof HoverCardTrigger>,
    contentProps?: React.ComponentProps<typeof HoverCardContent>,
    // copy: ReturnType<typeof useCopyToClipboard>[0],
    // isCopied: ReturnType<typeof useCopyToClipboard>[1],
    showToast: ShowToastFn,
    openProjectId: string,
};

export function ShareButton({showToast, openProjectId, hovercardProps, triggerProps, contentProps, ...props}: ShareButtonProps) {
    const [copy, isCopied] = useCopyToClipboard(); // No delay

    const [includeFilters, setIncludeFilters] = useState<boolean>(false);

    // const URLToCopy = useMemo(()=>getURLToCopy(includeFilters, openProjectId), [includeFilters, openProjectId]);
    const URLtoCopy = useRef<string>(getURLToCopy(includeFilters, openProjectId));

    const [urlChanged, setURLChanged] = useState<boolean>(false);

    const doCopy = useCallback(()=>{
        void copy(URLtoCopy.current).then(()=>{
            setURLChanged(false);
            showToast('Copied to clipboard.');
            // setTimeout(()=>{
            //     setURLChanged(true);
            // }, 1000);
        }).catch((reason)=>{
            showToast(`Failed to copy to clipboard! (reason: ${reason})`);
        });
    }, [showToast, copy]);



    return <ShareCard {...hovercardProps} {...{copy, isCopied, showToast, openProjectId, triggerProps, contentProps, URLtoCopy, urlChanged, setURLChanged, includeFilters, setIncludeFilters, doCopy}}>
        <Button {...props} onClick={doCopy}>
            <span>
                {isCopied && !urlChanged ? <CopyCheckIcon/> : <CopyIcon/>}
            </span>
            {isCopied && !urlChanged ? <>Copied to clipboard!</> : <>Copy link</>}
        </Button>
    </ShareCard>;
};

function anyFiltersActive(): boolean {
    const params = new URLSearchParams(window.location.search.slice(1));
    return (params.size > (params.has('project') ? 1 : 0));
}

function ShareCard({children, contentProps, triggerProps, copy, isCopied, showToast, openProjectId, doCopy, URLtoCopy, urlChanged, setURLChanged, includeFilters, setIncludeFilters, ...props}: ShareCardProps) {

    const buttonRef = useRef<HTMLButtonElement>(null);
    const toggleRef = useRef<HTMLButtonElement>(null);

    const handleURLParamsChange = useEffectEvent((includeFilters: boolean, openProjectId: string) => {
        const newURL = getURLToCopy(includeFilters, openProjectId);
        if(newURL === URLtoCopy.current) return false;
        URLtoCopy.current = newURL;
        return true;
    });

    const setURLChanged_ = useEffectEvent(setURLChanged);

    useEffect(()=>{
        if(handleURLParamsChange(includeFilters, openProjectId)) {
            setURLChanged_(true);
        }
    }, [includeFilters, openProjectId]);

    // const [isCopied, setIsCopied] = useState<boolean>(false);

    const anyFilters = anyFiltersActive();

    return <HoverCard {...props}>
        <HoverCardTrigger {...triggerProps} asChild>{children}</HoverCardTrigger>
        <HoverCardContent {...contentProps} className="w-max">
            <ButtonGroup>
                <Button onClick={doCopy} ref={buttonRef}>
                    {(isCopied && !urlChanged) ? <CopyCheckIcon/> : <CopyIcon/>}
                </Button>
                <InputGroup className="w-max">
                    <InputGroupAddon align="inline-start" className="w-min">
                        <InputGroupText>{window.location.protocol + '//'}</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput readOnly value={URLtoCopy.current}/>
                    <InputGroupAddon align="inline-end">
                        <InputGroupButton
                            ref={toggleRef}
                            disabled={!anyFilters}
                            onClick={() => setIncludeFilters(!includeFilters)}
                            size="icon-xs"
                        >
                            <FunnelIcon
                            data-include-filters={includeFilters}
                            className="data-[favorite=true]:fill-blue-600 data-[favorite=true]:stroke-blue-600"
                            />
                        </InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
            </ButtonGroup>
        </HoverCardContent>
    </HoverCard>
}


