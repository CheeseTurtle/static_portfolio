import { gsap } from "gsap";
import { GSDevTools } from "gsap/GSDevTools";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { ScrollToPlugin } from "gsap/ScrollToPlugin";
// import { useLayoutEffect } from "preact/hooks"; 
import { useLayoutEffect } from "react";
import type { SectionContentInstance } from "./types";
import type {FullContentMarkerDataEntry} from "./ContentMarkerPreact";
import parseDate from "./util/parseDate";
// import type {Node as VisitedNode} from "unist";


// console.log("STORY ANIMATOR SCRIPT");

type ContentMarkerContentElement = (Element&{enter:()=>any, leave:()=>any});
type ContentMarkerElement = (HTMLSpanElement & {content: null|ContentMarkerContentElement, sectionElem: HTMLElement});

type StorySectionElement = (HTMLElement & {backdrop: {item: HTMLDivElement, img?: HTMLImageElement, wrapper: HTMLDivElement}});

// type MilestoneElement = (HTMLElement & {date: Date, dateString: string});

type Milestone = {
    index: number,
    sectionId: string
    date?: Date,
    dateString?: string,
    elem: HTMLElement,
    alignElem?: HTMLHeadingElement,
    isMarker: boolean,
};



gsap.registerPlugin(ScrollTrigger, ScrollToPlugin, ScrollSmoother, GSDevTools);

type Props = {
    sections: SectionContentInstance[];
    markers: FullContentMarkerDataEntry[]
};

// export type AnimatorState = {
//     value: number
// };



export default function StoryAnimator({sections, markers}: Props) {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-call
    useLayoutEffect(() => {
        console.log(markers);
        // console.log("STORY ANIMATOR COMPONENT", sections);
        const header = document.querySelector('header')!;
        const headerSpace = document.querySelector('.header-space')!;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const footer = document.querySelector('footer')!;
        const storyElem = document.querySelector('.story')!;
        const storyTitle = document.querySelector('.story-title')!;
        const storyMain = document.querySelector('.story-main')!;
        const storyEnd = document.querySelector('.story-sections-end')!;
        const storySidebar = document.querySelector('.story-sidebar')!;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const backdropElem = document.querySelector('.parallax-backdrop')!;
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const backdropWrapper = document.querySelector('.parallax-backdrop-wrapper')!;
        
        // storyElem.classList.add('immersive');

        const sectionElems: StorySectionElement[] = gsap.utils.toArray('.story-section');
        const storySections = Object.fromEntries(sectionElems.map((elem)=>{
            return [elem.dataset.sectionId as string, elem];
        }));
        const starts = sectionElems.map(x=>x.offsetTop);
        
        const contentMarkers = gsap.utils.toArray<ContentMarkerElement>(".content-marker");
        const scroller = storyElem;

        let milestoneIndex = 0;
        // let markerIndex = 0;
        const milestones: Milestone[] = sections.flatMap((section)=>{
            const thisId = section.frontmatter.id;
            const [date, dateStr] = parseDate(section.frontmatter.date);
            const ret = [{
                index: milestoneIndex,
                sectionId: thisId,
                elem: storySections[thisId],
                alignElem: findFirstChild(storySections[thisId]),
                isMarker: false,
                date: date,
                dateString: dateStr
            } as Milestone];
            milestoneIndex += 1;
            // while(markerIndex < markers.length && markers[markerIndex][1][0].frontmatter.id === thisId) {
            //     console.log(markers[markerIndex]);
            //     ret.push({
            //         index: milestoneIndex,
            //         sectionId: thisId,
            //         elem: storySections[thisId],
            //         isMarker: true,

            //     } as Milestone);
            //     markerIndex += 1;
            //     milestoneIndex += 1;
            // }
            return ret;
        });

        const SVG_NS = 'http://www.w3.org/2000/svg';

        // Generate SVG
        const oldSVGRoot = document.querySelector('svg.timeline');
        if(oldSVGRoot) oldSVGRoot.remove();
        const svgRoot: SVGSVGElement = document.createElementNS(SVG_NS, 'svg');
        svgRoot.classList.add("timeline");
        svgRoot.setAttribute("height", "100%");
        svgRoot.setAttribute("width", "15vw");
        svgRoot.setAttribute("position", "absolute");
        svgRoot.setAttribute("left", "0");
        svgRoot.setAttribute("top", "0");
        svgRoot.setAttribute("bottom", "0");
        svgRoot.setAttribute("right", "calc(100%-15vw)");
        const svgPath = document.createElementNS(SVG_NS, 'path');
        svgPath.classList.add('timeline-path', 'trace-path');
        // svgPath.setAttribute("fill", "none");
        // svgPath.setAttribute("stroke", "white");
        // svgPath.setAttribute("stroke-width", "10px");
        svgRoot.appendChild(svgPath);
        storyMain.appendChild(svgRoot);
        const svgMilestones: [Milestone, SVGLineElement, SVGTextElement, SVGCircleElement][] = milestones.map((milestone, i)=>{
            const line = document.createElementNS(SVG_NS, 'line');
            line.setAttribute("x1", "0");
            line.setAttribute("x2", "10vw");
            line.classList.add("timeline-line","line-"+i);
            svgRoot.appendChild(line);
            
            const text = document.createElementNS(SVG_NS, 'text');
            // text.setAttribute("font-size", "0.6rem");
            text.classList.add('timeline-text',"text-"+i);
            text.setAttribute("x", "5vw");
            text.textContent = (milestone.alignElem?.textContent ? milestone.alignElem.textContent : milestone.sectionId);

            const ball = document.createElementNS(SVG_NS, 'circle');
            ball.setAttribute("r", "1.5vmin");
            ball.setAttribute("cx", "5vw");
            ball.classList.add('timeline-ball', 'ball-'+i);

            svgRoot.appendChild(line); svgRoot.appendChild(text); svgRoot.appendChild(ball);
            return [milestone, line, text, ball];
        });

        function findFirstChild(elem: HTMLElement, maxDepth:number=4) {
            if(elem instanceof HTMLHeadingElement) return elem;
            if(maxDepth && elem.firstElementChild instanceof HTMLElement)
                return findFirstChild(elem.firstElementChild, maxDepth - 1);
        }
        
        function updateSVGTimeline() {
            // const width = storyElem.clientHeight;
            // const height = storyElem.clientWidth * 0.2;

            // const rootFontSize = parseFloat(getComputedStyle(document.documentElement).fontSize);
            // svgRoot.setAttribute("font-size", 1.5 * rootFontSize);

            const crect = svgRoot.getBoundingClientRect();
            // const brect = svgRoot.getBBox({clipped: true, markers: false, fill: true, stroke: true});
            const vw = window.innerWidth * 0.01;
            const fiveVW = 5.0*vw;
            const fifteenVW = 15.0*vw;

            // console.log(crect, brect);
            svgRoot.setAttribute("viewbox", `0 0 ${crect.width} ${crect.height}`);
            
            let prevPos: number|undefined = undefined;
            let toTheRight: boolean = false;
            const pathItems = [`M ${fiveVW},-${crect.top}`, ...svgMilestones.map(([milestone,line,text,ball])=>{
                const elem = milestone.elem;
                // const pos = elem.scrollTop - elem.offsetParent.scrollTop
                
                // const pos = (elem.firstElementChild instanceof HTMLHeadingElement ? (elem.firstElementChild.offsetTop + 0.5*elem.firstElementChild.offsetHeight) : elem.offsetTop); // + (elem.offsetParent?.offsetTop ?? 0);
                const alignElem = milestone.alignElem;
                const pos = (alignElem ? (alignElem.offsetTop + alignElem.offsetHeight) : elem.offsetTop);
                const posStr = `${pos}`;
                text.setAttribute("x", `${1.5*fiveVW}`);
                line.setAttribute("y1", posStr); line.setAttribute("y2", posStr);
                text.setAttribute("y", `${pos-0.5*fiveVW}`); ball.setAttribute("cy", posStr);
                if(prevPos === undefined) {
                    prevPos = pos;
                    return `T ${fiveVW} ${posStr}`;
                } 
                const qx = (toTheRight ? ''+fifteenVW : '0');
                const qy = `${0.5*(pos + prevPos)}`;
                toTheRight = !toTheRight;
                prevPos = undefined;
                return `Q ${qx} ${qy} ${fiveVW} ${posStr}`
            })];
            const pathStr = pathItems.join("\n") + `\nT ${fiveVW} ${crect.height}`;
            svgPath.setAttribute("d", pathStr);
        }

        

        

        // console.log("Content markers: ", contentMarkers);
        
        // Set up defaults
        gsap.defaults({overwrite: 'auto'});
        ScrollTrigger.defaults({
            scroller: scroller
        });


        const backdrops: Record<string,HTMLDivElement> = Object.fromEntries([...(document.querySelectorAll('.parallax-image-wrapper').values())].map(el=>{
            const wrapperElem: HTMLDivElement = el.attributes[0].ownerElement! as HTMLDivElement;
            const sectionId: string = wrapperElem.getAttribute('data-section-id')!;
            const sectionElem = storySections[sectionId];
            const itemElem = wrapperElem.querySelector('.parallax-backdrop-item')!;
            const imgElem = (itemElem.tagName === 'IMG') ? (itemElem as HTMLImageElement) : undefined;
            sectionElem.backdrop = {
                wrapper: wrapperElem,
                item: itemElem as HTMLDivElement,
                img: imgElem
            };
            return [sectionId, wrapperElem];
        }));
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const backdropElems = Object.values(backdrops);

        // console.log(backdropElem, backdrops);
        // Object.entries(backdrops).forEach(([id,cont]) => {
        //     const img: HTMLDivElement|HTMLImageElement = cont.querySelector(".parallax-backdrop-item")!;
        //     const sectionElem = storySections[id];
        //     gsap.to(img, {
        //         y: ()=>img.offsetHeight - cont.offsetHeight,
        //         ease: "none",
        //         scrollTrigger: {
        //             trigger: sectionElem,
        //             markers: true,
        //             scrub: true
        //         }    
        //     });    
        // });    
        
        gsap.set('.story-sidebar > *', {xPercent: -50, yPercent: -50});
        let lastSection: HTMLElement|undefined = undefined;
        

        function setCurrentSection(sectionElem: HTMLElement) {
            sectionElem.classList.add('active');
            if(lastSection) {
                if(lastSection.isSameNode(sectionElem)) return;
                lastSection?.classList.remove('active');
            }
            lastSection = sectionElem;
        }

        contentMarkers.forEach((marker, i)=>{
            // console.log(marker, markers[i]);
            marker.content = storySidebar.querySelector(`.story-sidebar-item[data-marker-id="${markers[i][0]}"]`);
            if(marker.content === null) return;
            const sectionId = markers[i][1][0].frontmatter.id;
            marker.sectionElem = storySections[sectionId];
            
            if(marker.content.classList.contains('sidebar-image')) {
                gsap.set(marker.content, {transformOrigin: "center"});
                marker.content.enter = function() {
                    // setCurrentSection(marker.sectionElem);
                    gsap.fromTo(marker.content as Element, 
                        {autoAlpha: 0, rotateX: -30},
                        {duration: 0.3, autoAlpha: 1, rotateX: 0});
                }
            // } else if(marker.content.classList.contains('sidebar-markdown')) {
            } else { // Element or markdown
                gsap.set(marker.content, {transformOrigin: "left center"});
                marker.content.enter = function() {
                    // setCurrentSection(marker.sectionElem);
                    gsap.fromTo(marker.content as Element, 
                        {autoAlpha: 0, rotateX: 50},
                        {duration: 0.3, autoAlpha: 1, rotateX: 0});
                }
            }

            marker.content.leave = function() {
                // marker.sectionElem.classList.remove('active');
                gsap.to(marker.content as Element, {
                    duration: 0.1, autoAlpha: 0
                });
            }
        });

        

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
        function getCurrentSection(_self: ScrollTrigger, first=first_) {
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
                // setCurrentSection(contentMarkers.sectionElem);
                
                lastContent = newContent;
            }            
        }

        
        
        const ST = ScrollTrigger.create({
            scroller: storyElem,
            trigger: storyTitle ,
            start: 'bottom top',
            endTrigger: storyEnd,
            end: 'top bottom',
            onUpdate: getCurrentSection, // TODO: Debounce/defer
            pin: storySidebar,
            pinType: "fixed",
            // markers: true,
            toggleClass: {
                targets: storySidebar,
                className: 'pinned'
            },
            id: "pin-main"
        });



        /* ********************** SECTIONS *************************** */




        let lastBackdrop: HTMLDivElement|undefined = undefined;
        let requestBackdropHandle: NodeJS.Timeout|undefined = undefined;
        function requestBackdrop(nextBackdrop: HTMLDivElement|undefined, back: boolean) {
            clearTimeout(requestBackdropHandle);
            requestBackdropHandle = setTimeout(()=>{
                if(lastBackdrop===nextBackdrop) return;
                const tl = gsap.timeline();
                if(nextBackdrop) {
                    tl.fromTo(nextBackdrop, {
                            onStart: ()=>{gsap.set(nextBackdrop, {visibility: 'visible'})},
                            onStartParams: ['visible'],
                            autoAlpha: 0,
                            translateY: (back ? '50%' : '-50%')
                        }, {
                            autoAlpha: 1,
                            translateY: 0
                        }, 0);
                }
                if(lastBackdrop) {
                    const bd = lastBackdrop;
                    tl.to(bd, {
                        translateY: (back? '-50%' : '50%'),
                        autoAlpha: 0,
                        onComplete: ()=>{gsap.set(bd, {visibility: 'hidden'})},
                    }, 0)
                }
                // console.log(lastBackdrop, nextBackdrop);
                lastBackdrop = nextBackdrop;
                tl.play();
            }, 250);
        }

        Object.entries(storySections).forEach(([sectionId,elem], i) => {
            const tl = gsap.timeline();
            // tl.addLabel('start');
            // tl.fromTo(elem, {
                
            // }, {
            //     duration: 1,
            // }, 'start');
            // const onEnter = ()=>elem.classList.add('active');
            // const onLeave = ()=>elem.classList.remove('active');

            const backdropWrapper = elem.backdrop.wrapper;
            const backdropImage = elem.backdrop.img;
            // const hasImage = elem.backdrop.img !== undefined;
            // const setVisibility = gsap.quickSetter(elem, 'visibility') as ((value: string)=>void);
            const factor = 0.15;
            if(backdropImage) {
                tl.fromTo(backdropImage, {
                    y: () => -factor*(backdropImage.offsetHeight - backdropWrapper.offsetHeight)
                }, {
                    ease: "none",
                    y: ()=> factor*(backdropImage.offsetHeight - backdropWrapper.offsetHeight)
                });
            }

            function onEnter(back: boolean = false) {
                // const oldSection = lastSection;
                setCurrentSection(elem);
                requestBackdrop(backdropWrapper, back);
            }

            ScrollTrigger.create({
                scroller: scroller,
                id: `st-${sectionId}`,
                scrub: true,
                animation: tl,
                start: ()=>'' + elem.offsetTop + ' top',
                end: ()=>('+=' + elem.scrollHeight + ' top'),
                onLeaveBack: (i ? undefined : ()=>requestBackdrop(undefined, true)),
                onEnter: ()=>onEnter(false),
                onEnterBack: ()=>onEnter(true),
                // onEnter: onEnter, onLeave: onLeave,
                // onEnterBack: onEnter, onLeaveBack: onLeave,
                // markers: i ? false : {
                //     indent: (i) * 200,
                // },
            });
        });


        /* ********************** SNAPPING ******************** */

        // ScrollTrigger.create({
        //     id: "snap",
        //     trigger: '.story-sections',
        //     start: "top top",
        //     end: "bottom bottom",
        //     markers: true,
        //     snap: {
        //         snapTo: (value) => {
        //             // Snap to nearest section index (0, 1, 2, ...)
        //             const offset = value * storyMain.scrollHeight;
        //             console.log(value, offset, starts);
        //             return gsap.utils.snap(starts, offset) / storyMain.scrollHeight;
        //         },
        //         duration: 0.5,
        //         ease: "power1.inOut",
        //         delay: 0.05,
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


        /* ***************** IMMERSION ********************* */

        // ScrollTrigger.create({
        //     id: "immerse",
        //     toggleClass: {
        //         targets: [storyElem],
        //         className: 'immersive'
        //     },
        //     onToggle: (self) => {
        //         // storyElem.classList.toggle('immersive', self.isActive);
        //         gsap.delayedCall(1, safeRefresh);
        //     }
        // })

        // storyMain.addEventListener('transitionend' as keyof ElementEventMap, ((evt: Event) =>{
        //     if((evt as TransitionEvent).propertyName !== 'padding-right') {
        //         return;
        //     }
        //     safeRefresh();
        // }));


        /* **************** SECTIONS *********************** */
        // const sectionScrollTriggers = sectionElems.map<ScrollTrigger>((el, i, _arr)=>{
        //     return ScrollTrigger.create({
        //         trigger: el,


        //     });
        // });

        // /* ************ NAVIGATION ***********/

        const links = gsap.utils.toArray<HTMLAnchorElement>("nav.floating-nav a");        
        function setActive(link: HTMLAnchorElement) {
            links.forEach((el)=>{
                el.classList.remove("active");
            });
            link.classList.add("active");
        }
        links.forEach(((a)=>{
            const href = a.getAttribute("href")!;
            // if(href === null) throw "Anchor without href";
            const elem = document.querySelector(href)!;
            const linkST = ScrollTrigger.create({
                trigger: elem, start: "top top"
            });
            // Create ScrollTrigger for content marker
            ScrollTrigger.create({
                trigger: elem,
                start: "top center",
                end: "bottom center",
                id: elem.id,
                onToggle: self=>self.isActive && setActive(a)
            });
            a.addEventListener('click', e=>{
                e.preventDefault();
                gsap.to(scroller, {duration: 1, scrollTo: linkST.start, overwrite: "auto"});
            });
        }));        


        
        
        /* ****************** BACKDROP *********************** */
        // backdropElems



        
        // /* ***************** HEADER ******************** */
        
        // let direction = 0;
        const headerHideState = {
            deltaThreshold: 0.01*window.innerHeight,
            velocityThreshold: 0.25,
            lastDirection: 0,
            thresholdLocation: headerSpace.scrollTop + 0.5*headerSpace.scrollHeight
        };
        // const hideHeader = gsap.to(header, {
        //     paused: true,
        //     yPercent: -100,
        //     autoAlpha: 0
        // });
        // const showHeader = gsap.to(header, {
        //     paused: true,
        //     yPercent: 0,
        //     autoAlpha: 1
        // });

        
        const headerTimeline = gsap.timeline();
        headerTimeline.fromTo(header, 
            {yPercent: 0, autoAlpha: 1}, 
            {yPercent: -100, autoAlpha: 0}
        );
    
        // Modify header
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const headerST = ScrollTrigger.create({
            id: "header",
            onUpdate: ((self: ScrollTrigger) => {
                // console.log(self.direction, self.getVelocity(), self.progress, self.scroll());
                if(self.direction != headerHideState.lastDirection) {
                    // let activate: GSAPTween, deactivate: GSAPTween;
                    const shouldReverse = Boolean(self.direction & 0b10);
                    if(headerTimeline.reversed() != shouldReverse) {
                        headerTimeline.reversed(shouldReverse);
                    }
                    if(!headerTimeline.isActive()) {
                        headerTimeline.play()
                    }
                    headerHideState.lastDirection = self.direction; 
                    
                }
            }),
        });
        



        /* *************** RESIZING ****************** */

        const media = window.matchMedia("screen and (max-width: 60rem)");
        function checkSTState() {
            if(media.matches) ST.disable();
        }
        ScrollTrigger.addEventListener("refreshInit", checkSTState);


        let resizeTimeout: ReturnType<typeof setTimeout>|null = null;
        function onResize() {
            if (resizeTimeout) clearTimeout(resizeTimeout);
            resizeTimeout = setTimeout(() => {
                // console.log("onResize");
                updateSVGTimeline();
                safeRefresh();
            }, 250);
        }
        window.addEventListener("resize", onResize);

        /* ***************************************************** */
        
        // ScrollTrigger.refresh();
        // const SS = ScrollSmoother.create({
        //     content: backdropElem,
        //     autoResize: true,
        //     // speed: 'auto',
        //     ignoreMobileResize: false,
        //     normalizeScroll: true,
        //     effects: true,
        //     smoothTouch: false,
        //     wrapper: backdropWrapper,
        //     smooth: 1.5,
        // });


        /* INITIALIZATION */

        ScrollTrigger.refresh();
        getCurrentSection(ST);
        updateSVGTimeline();

        // Cleanup
        return () => {
            window.removeEventListener('resize', onResize);
        }
    });
}




        // GSDevTools.create({
        //     css: { right: "200px" }
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
