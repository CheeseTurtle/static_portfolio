declare module "gsap/GSDevTools" {
  export interface GSDevToolsVars {
    container?: string|Element;
    globalSync?: boolean;
    animation?: gsap.core.Animation|string;
    
    css?: object|string;
    hideGlobalTimeline?: bool;
    id?: string;
    inTime?: number|string;
    loop?: boolean;
    keyboard?: boolean;
    paused?: boolean;
    outTime?: number|string;
    minimal?: boolean;
    persist?: boolean;
    visibility?: '"auto"';
    timeScale?: number;
  }
  export const GSDevTools: {
    create(vars?: GSDevToolsVars): void;
    show(): void;
    hide(): void;
  };
  export default GSDevTools;
}

declare interface ImageWindow {
    
    /**
     * X position of window (relative to section)
     *
     * @type {(string|number)}
     */
    x: string|number;

    
    /**
     * Y position of window (relative to section)
     *
     * @type {(string|number)}
     */
    y: string|number;

    
    /**
     * Width of window (optional)
     *
     * @type {?(string|number)}
     */
    windowWidth?: string|number;

    /**
     * Height of the window
     * 
     * @type {string|number}
     */
    windowHeight: string|number;

    /**
     * Height of the image (optional)
     * 
     * @type {?(string|number)}
     */
    imageHeight?: string|number;
    
    /**
     * Width of window (optional)
     *
     * @type {?(string|number)}
     */
    imageWidth?: string|number;

    /**
     * Path to image
     *
     * @type {string}
     */
    image: string;
}

declare interface ImageWindowArgs extends ImageWindow {
    sectionId: string;
}

declare interface StorySectionFrontmatter {
    
    /**
     * Navigation label
     *
     * @type {string}
     */
    title: string;


    /**
     * ID used for identifying this section; also used for locating related elements.
     * 
     * @type {string}
     */
    id: string;

    /**
     * Date that section corresponds to. (Used for sorting.)
     * Format: YYYY, YYYY-MM, or YYYY-MM-DD
     * 
     * @type {string}
     */
    date: string;

    backdropImage?: string;

    
    /**
     * Side content selector/element -- overrides `sideImage`. (optional)
     *
     * @type {?(string|Element)}
     */
    sideContent?: string|Element|'true';


    /** 
     * Side image filepath -- ignored when `sideContent` is given. (optional)
     * 
     * @type {?string}
     * 
    */
   sideImage?: string;
    
    /**
     * Image window(s) corresponding to section
     *
     * @type {?ImageWindow[]}
     */
    imageWindows?: ImageWindow[];
}





declare interface SidebarSectionFrontmatter {
  sectionId: string;

}

