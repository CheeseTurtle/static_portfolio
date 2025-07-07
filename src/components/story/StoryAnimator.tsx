// import Story from "../components/story/Story.astro";
// import StorySection from "../components/story/StorySection.astro";
// import SidebarSection from "../components/story/SidebarSection.astro";
// import FloatingNav from "../components/story/FloatingNav.astro";
// import ParallaxBackdrop from "../components/story/ParallaxBackdrop.astro";
// import ParallaxWindow from "../components/story/ParallaxWindow.astro";

import type Story from "./Story.astro";
import type StorySection from "./StorySection.astro";
import type SidebarSection from "./SidebarSection.astro";
import type FloatingNav from "./FloatingNav.astro";
import type ParallaxBackdrop from "./ParallaxBackdrop.astro";
import type ParallaxWindow from "./ParallaxWindow.astro";

import { gsap } from "gsap";
import { GSDevTools } from "gsap/GSDevTools";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
// import { useEffect } from "preact/hooks";
import { useCallback, useContext, useDebugValue, useEffect, useErrorBoundary, useId, useLayoutEffect, useMemo, useState } from "preact/hooks";

import type { MarkdownInstance, MDXInstance } from "astro";
import type {Node as VisitedNode} from "unist";
import type { SectionContentInstance } from "./types";
import type {ContentMarkerData, FullContentMarkerDataEntry, ContentMarkerDataEntry} from "./ContentMarker";



console.log("STORY ANIMATOR SCRIPT");

declare type ContentMarkerContentElement = (Element&{enter:()=>any, leave:()=>any});
declare type ContentMarkerElement = (HTMLSpanElement & {content: null|ContentMarkerContentElement});

gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, ScrollSmoother, GSDevTools);



type Props = {
    sections: SectionContentInstance[];
    markers: FullContentMarkerDataEntry[]
};

// export type AnimatorState = {
//     value: number
// };


export default function StoryAnimator({sections, markers}: Props) {

    useEffect(() => {
        console.log("STORY ANIMATOR COMPONENT", sections);
        
        const scroller = document.querySelector('.story')!;
        // Set up StorySidebar
        gsap.defaults({overwrite: 'auto'});

        ScrollTrigger.defaults({
            scroller: scroller
        })

        gsap.set('.story-sidebar > *', {xPercent: -50, yPercent: -50});

        const contentMarkers = gsap.utils.toArray<ContentMarkerElement>(".content-marker");
        
        const sidebar = document.querySelector('.story-sidebar')!;
        
        console.log("Content markers: ", contentMarkers);
        contentMarkers.forEach((marker, i)=>{
            console.log(marker, markers[i])
            marker.content = sidebar.querySelector(`.story-sidebar-item[data-marker-id="${markers[i][0]}"]`);
            if(marker.content === null) return;
            
            if(marker.content.classList.contains('sidebar-image')) {
                gsap.set(marker.content, {transformOrigin: "center"});
                marker.content.enter = function() {
                    gsap.fromTo(marker.content as Element, {autoAlpha: 0, rotateY: -30},
                        {duration: 0.3, autoAlpha: 1, rotateY: 0});
                }
            // } else if(marker.content.classList.contains('sidebar-markdown')) {
            } else { // Element or markdown
                gsap.set(marker.content, {transformOrigin: "left center"});
                marker.content.enter = function() {
                    gsap.fromTo(marker.content as Element, {autoAlpha: 0, rotateY: 50},
                        {duration: 0.3, autoAlpha: 1, rotateY: 0});
                }
            }

            marker.content.leave = function() {
                gsap.to(marker.content as Element, {duration: 0.1, autoAlpha: 0});
            }
        });

        
        const sectionElems: HTMLElement[] = gsap.utils.toArray('.story-section');
        const starts = sectionElems.map(x=>x.offsetTop);

        let refreshTimeout: NodeJS.Timeout|undefined = undefined;
        function safeRefresh() {
            clearTimeout(refreshTimeout);
            refreshTimeout = setTimeout(() => {
                ScrollTrigger.refresh();
                // TODO: Check if last one changed?
                sectionElems.forEach((el,i)=>{
                    starts[i] = el.offsetTop;
                });
            }, 100);
        }

        let first_ = true;

        let lastContent: ContentMarkerContentElement|null = null;
        function getCurrentSection(self: ScrollTrigger, first=first_) {
            first_ = false;
            let newContent: ContentMarkerContentElement|null = null; 
            const currScroll = scroller.scrollTop; // scrollY;

            // Find current section
            for(const marker of contentMarkers) {
                // console.log(currScroll, marker.offsetTop);
                if(currScroll <= marker.offsetTop) break;
                newContent = marker.content;
            }

            if(first && !newContent && contentMarkers.length) {
                newContent = contentMarkers[0].content;
                // console.log("First!", first, newContent)
            }

            // If current section differs from last section, animate in
            if(newContent && (
                lastContent === null
                || !newContent.isSameNode(lastContent)
            )) {
                // Fade out last section
                if(lastContent) lastContent.leave();
                
                // Animate in new section
                newContent.enter();
                
                lastContent = newContent;
            }            
        }

        const headerSpace = document.querySelector('.header-space')!;
        const footer = document.querySelector('footer')!;
        const storyElem = document.querySelector('.story')!;
        const storyMain = document.querySelector('.story-main')!;
        const storySidebar = document.querySelector('.story-sidebar')!;
        const storyTitle = document.querySelector('.story-title')!;
        const header = document.querySelector('header')!;
        const storyEnd = document.querySelector('.story-sections-end')!;
        
        storyMain.addEventListener('transitionend' as keyof ElementEventMap, ((evt: Event) =>{
            if((evt as TransitionEvent).propertyName !== 'padding-right') {
                return;
            }
            safeRefresh();
        }));
        // Set up ScrollTrigger

        const ST = ScrollTrigger.create({
            trigger: storyTitle,
            start: 'bottom top',
            endTrigger: footer,
            end: 'top bottom',
           
            onUpdate: getCurrentSection, // TODO: Debounce/defer
            pin: [storySidebar, storyMain],
            pinSpacing: false,
            pinSpacer: undefined,
            // pinType: "fixed",
            // markers: true,
            id: "main",

            toggleClass: {
                targets: [storyElem],
                className: 'immersive'
            },
            onToggle: (self) => {
                // storyElem.classList.toggle('immersive', self.isActive);
                gsap.delayedCall(1, safeRefresh);
            }
        });



        const media = window.matchMedia("screen and (max-width: 60rem)");
        function checkSTState() {
            if(media.matches) ST.disable();
        }
        
        ScrollTrigger.addEventListener("refreshInit", checkSTState);

        // Set up FloatingNav scrolling 

        const links = gsap.utils.toArray<HTMLAnchorElement>("nav.floating-nav a");
        
        function setActive(link: HTMLAnchorElement) {
            links.forEach((el)=>{
                el.classList.remove("active");
            });
            link.classList.add("active");
        }

        links.forEach(((a, i, _)=>{
            const href = a.getAttribute("href")!;
            // if(href === null) throw "Anchor without href";
            const elem = document.querySelector(href)!;
            const linkST = ScrollTrigger.create({
                trigger: elem, start: "top top"
            });
            ScrollTrigger.create({
                trigger: elem,
                start: "top center",
                end: "bottom center",
                id: elem.id,
                onToggle: self=>self.isActive && setActive(a)
            });
            a.addEventListener('click', e=>{
                e.preventDefault();
                gsap.to(window, {duration: 1, scrollTo: linkST.start, overwrite: "auto"});
            });
        }));        

        // let direction = 0;
        const headerHideState = {
            deltaThreshold: 0.01*window.innerHeight,
            velocityThreshold: 0.25,
            lastDirection: 0,
            thresholdLocation: headerSpace.scrollTop + 0.5*headerSpace.scrollHeight
        };

        const hideHeader = gsap.to(header, {
            paused: true,
            yPercent: -100,
            autoAlpha: 0
        });

        const showHeader = gsap.to(header, {
            paused: true,
            yPercent: 0,
            autoAlpha: 1
        });


        const headerTimeline = gsap.timeline();
        headerTimeline.fromTo(header, 
            {yPercent: 0, autoAlpha: 1}, 
            {yPercent: -100, autoAlpha: 0}
        );
    
        // Modify header
        const headerST = ScrollTrigger.create({
            id: "header",
            onUpdate: ((self: ScrollTrigger) => {
                // console.log(self.direction, self.getVelocity(), self.progress, self.scroll());
                if(self.direction != headerHideState.lastDirection) {
                    // let activate: GSAPTween, deactivate: GSAPTween;
                    let shouldReverse = Boolean(self.direction & 0b10);
                    if(headerTimeline.reversed() != shouldReverse) {
                        headerTimeline.reversed(shouldReverse);
                    }
                    if(!headerTimeline.isActive()) {
                        headerTimeline.play()
                    }
                    headerHideState.lastDirection = self.direction; 
                    // if(deactivate.isActive())
                        
                }
            }),
        });


        let resizeTimeout: ReturnType<typeof setTimeout>|null = null;
        function onResize() {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // console.log("onResize");
                safeRefresh();
            }, 250);
        }
        window.addEventListener("resize", onResize);

        getCurrentSection(ST);

        // Cleanup
        return () => {
            window.removeEventListener('resize', onResize);
        }
    });
}




        // GSDevTools.create({
        //     css: { right: "200px" }
        // });


        // ScrollTrigger.create({
        //     id: "snap",
        //     trigger: '.story-section',
        //     start: "top top",
        //     end: "bottom bottom",
        //     markers: true,
        //     snap: {
        //         snapTo: (value) =>
        //             // Snap to nearest section index (0, 1, 2, ...)
        //             // return Math.round(value);
        //             gsap.utils.snap(starts, value),
        //         duration: 0.5,
        //         ease: "power1.inOut",
        //         delay: 0.1,
        //         inertia: true, // enables velocity-based snapping
        //         onComplete: undefined,
        //         onStart: undefined,
        //         onInterrupt: undefined,
        //         directional: false
        //     },
        //     toggleClass: 'active-section',
        //     scrub: true,
        //     invalidateOnRefresh: true
        // });

        






 // const markerDict = Object.fromEntries(
        //     markers
        // );
        
        // Alter header (ScrollTrigger)


        // sections[0].frontmatter.id
        // sections[0].getHeadings()


        // // For each section:
        // sections.map((section) => {
        //     // Set up StorySection scrolltrigger
            
        //     gsap.timeline()
        //     var x : GSAPTween
        //     var y : GSAPAnimation
        //     var z : GSAPTimeline
        //     var q : GSAPStaggerVars
        //     var w : GSAPTweenTarget
        //     var u : GSAPDistributeConfig
        //     var v : GSAPTimelineVars
        //     var t : GSAPTweenTarget
        //     var s : GSAPTweenVars
        //     var f : GSAPCallback

            

        //     // Set up parallax backdrop pinning


            
        // });

        

        // onEnter: self=>console.log('onEnter', elem.id, elem, self),
                // onEnterBack: self=>console.log('onEnterBack', elem.id, elem, self),
                // onLeave: self=>console.log('onLeave', elem.id, elem, self),
                // onLeaveBack: self=>console.log('onLeaveBack', elem.id, elem, self),

                            // if(elem === null) throw "Cannot find element"
            // const attr = a.attributes.getNamedItem('data-nav-slug');
            // if(attr !== null && attr.value !== elem.id) {
            //     elem.id = attr.value;
            //     a.href = '#' + attr.value;
            // }

           // console.log(marker, marker.content)
            // const cont = markers[i][1][2];
            // if (typeof cont === 'string') {
            //     if(markers[i][1][3]) { // Content

            //     } else { // Image

            //     }
            // } else { // Element

            // }
            // console.log(marker.dataset, marker.attributes);
            // console.log(marker.content?.attributes);


// // startAt: {},
// onStart: undefined,
// // onStartParams: [],
// onReverseComplete: undefined,
// // onReverseCompleteParams: undefined,
// onComplete: undefined,
// // onCompleteParams: undefined,
// onRepeat: undefined,
// onUpdate: undefined,
// onInterrupt: undefined,


// // attr: {},
// // counterIncrement: {},
// // counterReset: {},
// // lazy: true,
// // id: "test",
// // keyframes: {},
// // inertia: 0,
// // direction: undefined,
// // delay: 0,
// // overwrite: "auto",
// // morphSVG: {},
// // motionPath: {},
// // scrollTo: {},
// // scrollTrigger: {}


// onRefresh: ()=>{
            //     console.log("On refresh")
            // },
            // onRefreshInit: () =>console.log("OnRefreshInit"),
            // invalidateOnRefresh: true,
            // anticipatePin: 0.1








 // endTrigger: footer,

            // end: 'bottom bottom',
            
            // end: () => `+=${document.querySelector(".story-sections")!.scrollHeight}`,
            // markers: true,
            // onEnter: (self)=>{
            //     gsap.to(storyMain, {
            //         duration: 0.4,
            //         padding: 0,
            //         background: 'black'
            //     });
            //     // self.refresh();
            //     // ScrollTrigger.refresh();
            //     safeRefresh();
            // },
            // onEnterBack: (self) => {
                
            // },
            // onLeave: (self)=>{
            //     console.log("Leave");
            //     gsap.to(storyMain, {
            //         duration: 0.4,
            //         padding: '0 calc(min(8rem,5vw))',
            //         background: 'none'
            //     });
            //     safeRefresh();
            // },
            // onLeaveBack: (self)=>{
            // },



// const ST2 = ScrollTrigger.create({
        //     trigger: '.header-space',
        //     onEnter: ()=>console.log("ENTER"),
        //     onLeave: ()=>console.log("ONLEAVE")
        // });







    // const [state, setState] = useState<AnimatorState>({value: 0});

    // const increment = useCallback(()=>{
    //     setState({value: state.value + 1} as AnimatorState)
    // }, [state])


    
    // const first = useRef(second)
    
    // useMemo(() => first, [second])

    // const [state, dispatch] = useReducer(first, second, third)

    // useImperativeHandle(
    //     first,
    //     () => {
    //     second
    //     },
    //     [third],
    // )

    // useLayoutEffect(() => {
    //     first
    
    //     return () => {
    //     second
    //     };
    // }, [third])
    

    // useDebugValue(value)

    // useErrorBoundary()
