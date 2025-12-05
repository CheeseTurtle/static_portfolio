import { lazy, Suspense, useCallback, useReducer } from "react";
import { LightboxContext, lightboxReducer } from "./lightbox";

const CaptionedLightbox = lazy(()=>import('@/components/projects/CaptionedLightbox'));

export default function CaptionedLightboxProvider({children, onClose, openRef}: {children: React.ReactNode, onClose?: () => void, openRef: React.RefObject<boolean>}) {
    const [state, dispatch] = useReducer(lightboxReducer, {captions: [], initialSlide: 1, open: false, sources: [] });

    const onClose_ = useCallback(()=>{
        dispatch({type: 'CLOSE'});
        onClose?.();
    }, [onClose, dispatch]);

    return <LightboxContext.Provider value={{
        state, dispatch
    }}>
        <Suspense>
            <CaptionedLightbox {...state} openRef={openRef} onClose={onClose_} />
        </Suspense>
        {children}
    </LightboxContext.Provider>;
}


