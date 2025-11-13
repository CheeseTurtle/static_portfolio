// import { useLayoutEffect } from "preact/hooks";
import {useLayoutEffect} from 'react';
import { gsap, ScrollTrigger, ScrollSmoother, ScrollToPlugin } from "gsap/all";
gsap.registerPlugin(ScrollTrigger, ScrollSmoother);



export default function ScriptElem() {

    useLayoutEffect(() => {
        console.log("Layout effect");
        const sections = gsap.utils.toArray<HTMLElement>('section');
        const padDiv = document.getElementById('section-padding')!;
        function setActiveSection(section?: Element) {
            if(!section) return;
            let foundActive = false;
            sections.forEach((s)=> {
                if(s.isSameNode(section)) {
                    s.classList.add('active');
                    s.classList.remove('pre-active','post-active');
                    foundActive = true;
                } else if(foundActive) {
                    s.classList.add('post-active');
                    s.classList.remove('active','pre-active');
                } else {
                    s.classList.add('pre-active');
                    s.classList.remove('active','post-active');
                }
                
            });
        }
        const scrollTriggers = sections.map((section) =>
            ScrollTrigger.create({
                scroller: '#wrapper',
                trigger: section,
                markers: true,
                start: 'top center',
                id: section.id,
                end: 'bottom center',
                // end: (self: ScrollTrigger)=>{
                //     if(self.trigger) {
                //         return '+=' + self.trigger.scrollHeight;
                //         // return self.trigger.scrollTop + self.trigger.scrollHeight;
                //     }
                //     return self.start;
                // },
                onEnter: (self)=>{
                    // console.log("onEnter", self.trigger?.id);
                    setActiveSection(self.trigger);
                },  
                // onLeave: (self)=>console.log("onLeave", self.trigger?.id),
                onEnterBack: (self)=>{
                    // console.log("onEnterBack", self.trigger?.id);
                    setActiveSection(self.trigger);
                },
                // onLeaveBack: (self)=>console.log("onLeaveBack", self.trigger?.id),
                // toggleActions: 'turtles',
                // toggleClass: 'active'
            })
        );

        
        let resizeHandle: NodeJS.Timeout|undefined = undefined;
        const lastSection = sections[sections.length - 1];
        const wrapper = document.getElementById("wrapper")!;

        function handleResize() {
            // Need to update #section-padding height so that the last <section>'s center can reach the middle of the screen.
            const scrollHeight = lastSection.scrollHeight;
            const wrapperHeight = wrapper.clientHeight;
            const padAmount = (
                (wrapperHeight > scrollHeight)
                ? 0.5*(wrapperHeight-scrollHeight)
                : 0
            );
            gsap.set(padDiv, {
                height: padAmount
            });
            ScrollTrigger.refresh();
        }
        function onResize() {
            clearTimeout(resizeHandle);
            resizeHandle = setTimeout(handleResize, 250);
        }
        window.addEventListener("resize", onResize);        
        handleResize();
    });

}