declare module "gsap/GSDevTools" {
  declare export interface GSDevToolsVars {
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
  declare export const GSDevTools: {
    create(vars?: GSDevToolsVars): void;
    show(): void;
    hide(): void;
  };
  declare export default GSDevTools;
}

