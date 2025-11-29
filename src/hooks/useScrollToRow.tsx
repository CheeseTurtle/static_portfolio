import { useWindowScroll } from "./use-window-scroll";

// type WSReturn = ReturnType<typeof useWindowScroll>;

function isInView(elem: Element) {
    // elem.checkVisibility();
    const rect = elem.getBoundingClientRect();
    // const window.innerWidth
    elem.scrollIntoView({block: "center", behavior: "auto", inline: "nearest"});

}


export default function useScrollToRow() {
    const [scrollState, scrollTo] = useWindowScroll();
    function scrollToRow(prevElem: Element, newElem: Element) {
        if(prevElem === newElem) return;
    }
}