import type { PropsWithChildren } from "react";
import parseDate from "./../util/parseDate";



export interface StoryTimelineProps extends PropsWithChildren {
    sections: SectionMDXInstance[],
    storySections: Record<string,HTMLElement>,
};

import { useLayoutEffect } from "react";
import type {Milestone, SectionMDXInstance} from "./../util/types/types";
const SVG_NS = 'http://www.w3.org/2000/svg';

export default function StoryTimeline({sections, storySections, }: StoryTimelineProps) {
    useLayoutEffect(()=> {
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
        svgRoot.appendChild(svgPath);
        // storyMain.appendChild(svgRoot);
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
    });
}