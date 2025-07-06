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
import { useEffect } from "preact/hooks";

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


export default function StoryAnimator({sections, markers}: Props) {
    useEffect(() => {
        console.log("STORY ANIMATOR COMPONENT", sections);

        // Set up StorySidebar
        gsap.defaults({overwrite: 'auto'});

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

        let lastContent: ContentMarkerContentElement|null = null;
        function getCurrentSection(self: ScrollTrigger) {
            // console.log("getCurrentSection", self);
            let newContent: ContentMarkerContentElement|null = null; 
            const currScroll = scrollY;

            // Find current section
            for(const marker of contentMarkers) {
                // console.log(currScroll, marker.offsetTop);
                if(currScroll <= marker.offsetTop) break;
                newContent = marker.content;
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
            // console.log('lastContent:', lastContent);
        }

        // const endTrigger = document.querySelector('footer')!;

        // Set up ScrollTrigger
        const ST = ScrollTrigger.create({
            trigger: '.story-main',
            endTrigger: '.story-sections-end',
            start: 'top top',
            end: 'bottom bottom',
            // end: () => `+=${document.querySelector(".story-sections")!.scrollHeight}`,
            markers: true,
            // onEnter: (self)=>console.log("ST enter", self),
            // onLeave: (self)=>console.log("ST onLeave", self),
            onUpdate: getCurrentSection, 
            pin: '.story-sidebar'
        })

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
                onToggle: self=>self.isActive && setActive(a)
            });
            a.addEventListener('click', e=>{
                e.preventDefault();
                gsap.to(window, {duration: 1, scrollTo: linkST.start, overwrite: "auto"});
            });
        }));

        let resizeTimeout: ReturnType<typeof setTimeout>|null = null;
        window.addEventListener("resize", () => {
        if (resizeTimeout) clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => ScrollTrigger.refresh(), 250);
        });


        // GSDevTools.create({
        //     css: { right: "200px" }
        // });
    });
}






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