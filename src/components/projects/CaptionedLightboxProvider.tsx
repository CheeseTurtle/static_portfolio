import React, { useCallback, useReducer } from "react";
import { LightboxContext, createLightboxReducer } from "./lightbox";
import CaptionedLightbox, { type CaptionedLightboxHandle } from "./CaptionedLightbox";
// const CaptionedLightbox = lazy(()=>import('@/components/projects/CaptionedLightbox'));

export default function CaptionedLightboxProvider({children, onClose}: {children: React.ReactNode, onClose?: () => void}) {

    const lightboxHandle = React.useRef<CaptionedLightboxHandle>(null);

    const reducer = createLightboxReducer(lightboxHandle);

    const [state, dispatch] = useReducer(reducer, {captions: [], initialSlide: 1, open: false, sources: [] });

    const onClose_ = useCallback(()=>{
        dispatch({type: 'CLOSE'});
        onClose?.();
    }, [onClose, dispatch]);

    return <LightboxContext.Provider value={{
        state, dispatch
    }}>
        {/* <React.Suspense> */}
        <CaptionedLightbox ref={lightboxHandle} {...state} onClose={onClose_} />
        {/* </React.Suspense> */}
        {children}
    </LightboxContext.Provider>;
}


