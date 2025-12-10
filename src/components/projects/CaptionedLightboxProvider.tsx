import { useCallback, useReducer } from "react";
import { LightboxContext, lightboxReducer } from "./lightbox";
import CaptionedLightbox from "./CaptionedLightbox";
// const CaptionedLightbox = lazy(()=>import('@/components/projects/CaptionedLightbox'));

export default function CaptionedLightboxProvider({children, onClose}: {children: React.ReactNode, onClose?: () => void}) {
    const [state, dispatch] = useReducer(lightboxReducer, {captions: [], initialSlide: 1, open: false, sources: [] });

    const onClose_ = useCallback(()=>{
        dispatch({type: 'CLOSE'});
        onClose?.();
    }, [onClose, dispatch]);

    return <LightboxContext.Provider value={{
        state, dispatch
    }}>
        {/* <Suspense> */}
        <CaptionedLightbox {...state} onClose={onClose_} />
        {/* </Suspense> */}
        {children}
    </LightboxContext.Provider>;
}


