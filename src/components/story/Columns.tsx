// import Story from "../components/story/Story.astro";
// import StorySection from "../components/story/StorySection.astro";
// import SidebarSection from "../components/story/SidebarSection.astro";
// import FloatingNav from "../components/story/FloatingNav.astro";
// import ParallaxBackdrop from "../components/story/ParallaxBackdrop.astro";
// import ParallaxWindow from "../components/story/ParallaxWindow.astro";

import Story from "./Story.astro";
import StorySection from "./StorySection.astro";
import SidebarSection from "./SidebarSection.astro";
import FloatingNav from "./FloatingNav.astro";
import ParallaxBackdrop from "./ParallaxBackdrop.astro";
import ParallaxWindow from "./ParallaxWindow.astro";

import { gsap } from "gsap";
import { GSDevTools } from "gsap/GSDevTools";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { ScrollSmoother } from "gsap/ScrollSmoother";
import { useEffect } from "preact/hooks";

import type { MarkdownInstance } from "astro";
import { Component, Fragment, toChildArray, type ComponentChildren, type RenderableProps } from "preact";


export class Columns extends Component {
    render(props?: RenderableProps<any>,
            state?: Readonly<any>,
            context?: any) {
        
        if(props.turtle) {
            
        }
        

        return <Fragment></Fragment>
    }
}

// export default function StoryAnimator({sections, children}: Props) {
//     useEffect(() => {
//         const arr = toChildArray(children);
//         const elem = arr.at(0)

//     });
// }