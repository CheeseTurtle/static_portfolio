import React from "react";



// function deplistToArray(deps: React.DependencyList) {
// }

const useReportingMemo: typeof React.useMemo = (factory, deps)=>{
    const prevDeps = React.useRef<Array<any>>(Array.from(deps.values()));
    React.useEffect(()=>{
        console.log('Deps changed:', deps);
        deps.forEach((val, i)=>{
            // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
            const old = prevDeps.current[i];
            if(old!==val) console.log(i, old, val);
        })
        prevDeps.current = Array.from(deps.values())
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [...deps])
    // eslint-disable-next-line react-hooks/exhaustive-deps
    return React.useMemo(factory, deps);
}


export default useReportingMemo;