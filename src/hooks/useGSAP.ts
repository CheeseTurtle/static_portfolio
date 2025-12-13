import {gsap as GSAP} from 'gsap';
import React from 'react';



type GSAPContextState = {
    gsap: typeof GSAP | undefined,
    
}
const GSAPContext = React.createContext({gsap: undefined})