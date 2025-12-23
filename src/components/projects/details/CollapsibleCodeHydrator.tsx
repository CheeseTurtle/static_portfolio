import React from "react";

const CollapsibleCode = React.lazy(()=>import('./CollapsibleCode'));;

export default function CollapsibleCodeHydrator({projectId}: {projectId: string}) {
    console.log('HYDRATING', projectId);

    React.useLayoutEffect(()=>{
        const articles = document.querySelectorAll('article');
        console.log('ARTICLES:', articles);



    }, []);

    return null;
}
