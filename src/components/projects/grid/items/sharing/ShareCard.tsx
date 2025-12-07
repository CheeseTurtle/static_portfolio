// import { Tooltip } from "@/components/ui/tooltip";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "@/components/ui/hover-card";
// import * as HoverCardPrimitive from "@radix-ui/react-hover-card";
import React, { useCallback, useEffect, useEffectEvent, useRef, useState } from "react";

import { useCopyToClipboard } from "@/hooks/use-copy-to-clipboard";
import { InputGroup, InputGroupAddon, InputGroupButton, InputGroupInput, InputGroupText } from "@/components/ui/input-group";
import { /*ClipboardCopyIcon,*/ CopyCheckIcon, CopyIcon, FunnelIcon, LinkIcon } from "lucide-react";
import { ButtonGroup } from "@/components/ui/button-group";
import { Button } from "@/components/ui/button";
import type { ShowToastFn } from "@/components/projects/filtering/common/filterTypes";
import { cn } from "@/lib/utils";
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

export function ShareButton({showToast, openProjectId, hovercardProps, triggerProps, contentProps, className, ...props}: ShareButtonProps) {
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

    const buttonRef = React.useRef<HTMLButtonElement>(null);
    const divRef = React.useRef<HTMLDivElement>(null);

    const button = buttonRef.current;
    const div = divRef.current;

    useEffect(()=>{
        if(!button || !div) return;


        
        return ()=>{


        };
    }, [button, div]);

    return <ShareCard {...hovercardProps} {...{copy, isCopied, showToast, openProjectId, triggerProps, contentProps, URLtoCopy, urlChanged, setURLChanged, includeFilters, setIncludeFilters, doCopy}}>
        <div className={cn("p-0 m-0 text-sm bg-none border-none shadow-none inline-flex flex-row flex-nowrap group select-none min-w-6 w-fit h-auto overflow-visible", className)}>
            <div className="relative overflow-visible h-max w-min z-1">
                <Button ref={buttonRef} className='project-share-button text-sm w-6 h-6 px-3 pr-3 overflow-visible rounded-full not-disabled:cursor-pointer' {...props} onClick={doCopy}>
                    <span className="select-none overflow-visible pointer-events-none">
                        {isCopied && !urlChanged ? <CopyCheckIcon overflow="visible" className="overflow-visible" /> : <LinkIcon overflow="visible" className="overflow-visible"/>}
                    </span>
                </Button>
            </div>
            {/* <div ref={divRef} className="relative text-nowrap text-sm overflow-visible outline-1 outline-red-500 inset-0 ml-3.5 pr-1 select-none overflow-y-visible overflow-x-clip max-h-full h-5 my-auto align-middle text-right w-[0%] group-hover:w-full transition-all rounded-r-full"
                style={{textBoxTrim: "trim-both", textBox: "cap", lineHeight: 'calc(5*var(--spacing))', textAnchor: "end"}}> */}
            <div ref={divRef} className="relative pointer-events-none text-nowrap text-sm bg-blue-300 select-none overflow-y-visible overflow-x-clip max-h-full h-5 my-auto align-middle text-right w-[0%] group-hover:w-full transition-[width] duration-300 ease-out will-change-auto
                                        rounded-r-full
                                        ml-[calc(-3*var(--spacing))] self-end justify-self-end content-end z-0"
                style={{textBoxTrim: "trim-both", textBox: "cap", lineHeight: 'calc(5*var(--spacing))', textAnchor: "end"}}>
                <span className="ml-3.5 mr-2">{isCopied && !urlChanged ? <>Copied to clipboard!</> : <>Copy link</>}</span>
            </div>
        </div>
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
                <Button onClick={doCopy} ref={buttonRef} className="cursor-pointer" title="Copy link to clipboard">
                    {(isCopied && !urlChanged) ? <CopyCheckIcon/> : <CopyIcon/>}
                </Button>
                <InputGroup className="w-max">
                    <InputGroupAddon align="inline-start" className="w-min">
                        <InputGroupText>{window.location.protocol + '//'}</InputGroupText>
                    </InputGroupAddon>
                    <InputGroupInput readOnly value={URLtoCopy.current}/>
                    <InputGroupAddon align="inline-end" aria-disabled={!anyFilters} className="group cursor-pointer aria-disabled:cursor-not-allowed" title={anyFilters ? 'Toggle including current filter specs in the project link' : 'There are no filters currently applied'}>
                        <InputGroupButton
                            ref={toggleRef}
                            disabled={!anyFilters}
                            onClick={() => setIncludeFilters(!includeFilters)}
                            size="icon-xs"
                            className="cursor-pointer disabled:cursor-not-allowed group-hover:outline-2 group-hover:outline-red-500"
                        >
                            <FunnelIcon
                            aria-disabled={!anyFilters}
                            data-include-filters={includeFilters}
                            className="data-[include-filters=true]:fill-blue-600 data-[include-filters=false]:stroke-blue-600 aria-disabled:data-[include-filters=false]:stroke-gray-500 aria-disabled:data-[include-filters=true]:fill-gray-500  pointer-events-none"
                            />
                        </InputGroupButton>
                    </InputGroupAddon>
                </InputGroup>
            </ButtonGroup>
        </HoverCardContent>
    </HoverCard>
}


