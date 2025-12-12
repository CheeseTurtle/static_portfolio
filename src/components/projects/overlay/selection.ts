export function selectElementText(element: HTMLElement) {
    const selection = window.getSelection();
    if(!selection) return;
    const range = document.createRange();
    range.selectNodeContents(element); // Selects all content within the element
    selection.removeAllRanges(); // Clear any existing selections
    selection.addRange(range); // Add the new range to the selection
}

export function selectElementsText(elements: HTMLElement[]) {
    const selection = window.getSelection();
    if(!selection) return;
    selection.removeAllRanges(); // Clear any existing selections
    for(const element of elements) {
        const range = document.createRange();
        range.selectNodeContents(element); // Selects all content within the element
        selection.addRange(range); // Add the new range to the selection
    }
}

export function hasAnySelection(element?: NodeListOf<HTMLElement> | HTMLElement | HTMLElement[]) {
    const selection = window.getSelection();
    if(!selection) return false;
    if(!element) return false;
    if(element instanceof NodeList)
        element = Array.from(element);
    if(Array.isArray(element)) {
        if(!element.length) return false;
        return element.some(x=>selection.containsNode(x, true));
    } else {
        return selection.containsNode(element, true);
    }
}

export function isFullySelected(element?: NodeListOf<HTMLElement> | HTMLElement | HTMLElement[]) {
    const selection = window.getSelection();
    if(!selection) return false;
    if(!element) return true;
    if(element instanceof NodeList)
        element = Array.from(element);
    if(Array.isArray(element)) {
        if(!element.length) return true;
        return element.every(x=>selection.containsNode(x, false));
    } else {
        return selection.containsNode(element, false);
    }
}



function findTextNodes(node: Node | ChildNode) {
    if(node instanceof Text)
        return [node];
    if(!node.childNodes.length) return;
    // if(node instanceof HTMLElement && !node.children.length)
    //     return Array.from(node.childNodes);
    const result: Text[] = Array.from(node.childNodes.values()).flatMap(child=>{
        const nodes = findTextNodes(child);
        return (nodes?.length ? nodes : []);
    });
    if(result.length) return result;
}

function checkSingleElementSelection(selection: Selection | null, element: HTMLElement, textOnly?: boolean) {
    if(!selection) return [false, false];

    if(!textOnly) return [selection.containsNode(element, true), selection.containsNode(element, false)]

    const textNodes = findTextNodes(element);
    if(!textNodes) return [undefined, undefined];
    
    let allSelected = true, anySelected = false;
    for(const node of textNodes) {
        allSelected &&= selection.containsNode(node, false);
        anySelected ||= selection.containsNode(node, true);
        if(anySelected && !allSelected)
            break;
    }
    return [anySelected, allSelected];
}

export function checkSelection(element?: NodeListOf<HTMLElement> | HTMLElement | HTMLElement[], textOnly?: boolean) {
    console.log('Checking selection:', element, textOnly)
    if(!element) return [undefined, undefined];
    
    if(element instanceof Element)
        return checkSingleElementSelection(window.getSelection(), element, textOnly);
    
    if(!element.length) return [undefined, undefined];
    
    const selection = window.getSelection()
    console.log('Selection:', selection);
    if(!selection) return [false, false];

    let allSelected = true, anySelected = false;
    for(const elem of element) {
        const [any, all] = checkSingleElementSelection(selection, elem, textOnly);
        console.log('any/all for element:', elem, any, all);
        if(all === undefined || any === undefined)
            continue;
        anySelected ||= any;
        allSelected &&= all;
        if(anySelected && !allSelected)
            break;
    }
    return [anySelected, allSelected];
}


export function clearSelection() {
    const selection = window.getSelection();
    if(selection) {
        selection.removeAllRanges();
        selection.empty();
    }

}

export function selectPartialText(element: Text, startIndex: number, endIndex: number) {
    const selection = window.getSelection();
    if(!selection) return;
    const range = document.createRange();

    // Set the start and end of the range based on the element's text content
    range.setStart(element, startIndex);
    range.setEnd(element, endIndex);

    selection.removeAllRanges();
    selection.addRange(range);
}