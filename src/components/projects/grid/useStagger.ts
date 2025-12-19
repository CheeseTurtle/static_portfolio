import {gsap} from 'gsap';
import {useGSAP} from '@gsap/react';
import React from 'react';

gsap.registerPlugin(useGSAP);

export type UseStaggerOptions = {

    
    /**
     * 
     *
     * @type {?number}
     */
    itemDuration?: number,
    
    /**
     * Description placeholder
     *
     * @type {?number}
     */
    itemInterval?: number,

    
    /**
     * Description placeholder
     *
     * @type {?number}
     */
    groupOverlap?: number,

    // groupSize?: number | number[],
}


// function* makeGroupSizeArrayIterator(numGroups: number, groupSizeOpt: number[]) {
//     const numGroupSizes = groupSizeOpt.length;
//     let i: number = 0;
//     let lastSize: number = 0;
//     for(i; i<Math.min(numGroups, numGroupSizes); i++) {
//         lastSize = groupSizeOpt[i];
//         yield lastSize;
//     }
//     for(i; i<numGroups; i++)
//         yield 0;
// }

// function makeGroupSizeArray(numGroups: number, memberSelectors: string[], groupSizeOpt?: number | number[]) {
//     if(undefined === groupSizeOpt)
//         return (new Array<number>(numGroups)).fill(memberSelectors.length)
//     if(typeof groupSizeOpt === 'number')
//         return (new Array<number>(numGroups)).fill(groupSizeOpt)
//     return Array.from(makeGroupSizeArrayIterator(numGroups, groupSizeOpt))
// }




export function useStagger<T extends HTMLElement = HTMLDivElement>(columns: React.RefObject<T | null>[][], {
    itemDuration = 0.5,
    itemInterval = 0.25,
    groupOverlap = 0.4,
}: UseStaggerOptions = {}) {
    const tlRef = React.useRef<GSAPTimeline | null>(null);
    // const columns: React.RefObject<React.RefObject<T>[][]> = React.useRef([]);

    useGSAP(()=>{
        const tl = tlRef.current = gsap.timeline({repeat: -1, repeatDelay: 0, repeatRefresh: false, paused: false})
        
        let offset: number = 0;
        columns.forEach((elemRefs, _columnIndex) => {
            const elems = elemRefs.map(x=>x.current).filter(x=>!!x);
            
            const groupSize = elems.length;
            const groupDuration = (
                groupSize === 1 ? itemDuration : ((groupSize - 1) * itemInterval + itemDuration)
            )
            const overlapTime = groupOverlap * groupDuration;
            const nextColumnDelay = groupDuration - overlapTime;

            tl.fromTo(elems, {
                opacity: 0,
            }, {
                opacity: 1,
                duration: itemDuration,
                ease: 'power1.out',
                stagger: {
                    each: itemInterval,
                    from: 'start',
                    yoyo: true,
                    repeat: 1,
                    repeatDelay: 0.25,
                    // yoyoEase: gsap.parseEase('power2.out'),
                },
                yoyo: false,
                repeat: 1,
                // yoyoEase: gsap.parseEase('power4.in'),
            }, 0)
            offset += nextColumnDelay;
        })

        return ()=>{
            try {
                // tl.kill();
            } finally {
                tlRef.current = null;
            }
            // tl.revert()
            // tl.clear(true)
        }
    }, {dependencies: [groupOverlap, columns.length, itemDuration, itemInterval]});

    return tlRef
}