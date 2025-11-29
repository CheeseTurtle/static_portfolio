/* eslint-disable @typescript-eslint/no-unused-vars */
import {createStore, useStore, create} from "zustand";
import { subscribeWithSelector } from "zustand/middleware";
import { useStoreWithEqualityFn, createWithEqualityFn } from "zustand/traditional";
import { useShallow, shallow } from "zustand/shallow";

import { createComputed } from "zustand-computed";
import { useDebugValue, useMemo, useRef, type MouseEventHandler, type RefObject } from "react";
////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

type Store = {
  count: number
  inc: () => void
  dec: () => void
}

type ComputedStore = {
  countSq: number
}

const computed_ = createComputed((state: Store): ComputedStore => ({
  countSq: state.count ** 2,
}))

const useCStore = create<Store>()(
  computed_(
    (set, get) => ({
      count: 1,
      inc: () => set((state) => ({ count: state.count + 1 })),
      dec: () => set((state) => ({ count: state.count - 1 })),
      // get() function has access to ComputedStore
      square: () => set(() => ({ count: get().countSq })),
      root: () => set((state) => ({ count: Math.floor(Math.sqrt(state.count)) })),
    })
  )
)


///////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

interface BearProps {
    num_bears: number;
    bear_names: Set<string>;
}
interface BearActions {
    addBear: (name: string) => void;
    removeBear: (name?: string) => string

}
type BearState = BearProps & BearActions;



type BearStore = ReturnType<typeof createBearStore>;

type StoreCreator<T> = ReturnType<typeof createStore<T>>;
// type SetCreatorArgs = ConstructorParameters<typeof Set<string>>
type InitializerFn<T> = Parameters<StoreCreator<T>>[0];
type InitializerFnCreator<T,P> = (props: P) => InitializerFn<T>;


const createBearStoreInitializer: InitializerFnCreator<BearState, BearProps> = (props: BearProps) => subscribeWithSelector<BearState>((set, get, api)=>({
        ...props,
        addBear(name) {
            const names = get().bear_names;
            if(names.has(name))
                throw Error('Bear name "' + name + "' is already taken.")
            const names1 = names.add(name);
            const num_bears = get().num_bears;
            set({bear_names: names1, num_bears: num_bears + 1});
        },

        removeBear(name?: string) {
            const {bear_names, num_bears} = get();
            if(name === undefined) {
                const val = bear_names.values().next();
                name = val.value;
                if(name === undefined)
                    throw Error('There are no bears to remove.');
            } else if(!bear_names.has(name)) {
                throw Error(`There is no bear named "${name}".`);
            }
            if(!bear_names.delete(name))
                throw Error(`Deletion of bear name "${name}" failed.`);
            set({bear_names, num_bears: num_bears - 1});
            return name;
        }
}));


const createBearStore = (init_state: Partial<BearProps>) => {
    const DEFAULT_STATE: BearProps = {
        num_bears: 0, bear_names: new Set<string>()
    };
    const c = createStore<BearState>();
    const x = c(createBearStoreInitializer({...DEFAULT_STATE, ...init_state}));
    return x;
}

const useBearStore_create = create<BearState>()(createBearStoreInitializer({
    num_bears: 0,
    bear_names: new Set<string>(),
}));

function useBearStore<T>(store: BearStore, selector: (state: BearState) => T, equalityFn?: (left: T, right: T) => boolean): T {
    if(equalityFn) return useStoreWithEqualityFn(store, selector, equalityFn);
    return useStore(store, selector);
}


////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


interface ComputedBearPropsBase {
    bear_names: string[];
}
interface ComputedBearActionsBase {
    addBear: (name: string) => void;
    removeBear: (name?: string) => string

}
type ComputedBearStateBase = ComputedBearPropsBase & ComputedBearActionsBase;

interface ComputedBearProps {
    num_bears: number;
}

type ComputedBearState = ComputedBearStateBase & ComputedBearProps;

type ComputedBearStore = ReturnType<typeof createComputedBearStore>;




const isEquivalentSet =  (a: Set<string>, b: Set<string>) => a.size === b.size && [...a].every(x=>b.has(x))
const computed = (createComputed((state: ComputedBearStateBase): ComputedBearProps =>({
        num_bears: state.bear_names.length
}), {
    // keys: ['bear_names'], 
    // shouldRecompute(state, nextState) { isEquivalentSet(state.bear_names, nextState.bear_names) }, 
    // equalityFn:
}));


const createComputedBearStoreInitializer: InitializerFnCreator<ComputedBearStateBase, ComputedBearPropsBase> = (props: ComputedBearPropsBase) => (((set, get, api)=>({
        ...props,
        addBear(name) {
            const names = get().bear_names;
            if(names.includes(name))
                throw Error('ComputedBear name "' + name + "' is already taken.");
            set({bear_names: [...names, name]});
        },

        removeBear(name?: string) {
            const {bear_names} = get();
            if(name === undefined) {
                if(!bear_names.length)
                    throw Error('There are no bears to remove.');
                name = bear_names[0];
            } else if(!bear_names.includes(name)) {
                throw Error(`There is no bear named "${name}".`);
            }
            set({bear_names: bear_names.filter(x=>x!==name)});
            return name;
        }
})));


const createComputedBearStore = (init_state: Partial<ComputedBearPropsBase>) => {
    const DEFAULT_STATE: ComputedBearPropsBase = {
        bear_names: []
    };
    const c = createStore<ComputedBearState>();
    const initializer = createComputedBearStoreInitializer({...DEFAULT_STATE, ...init_state});
    const initializer2 = computed(initializer);
    const x = c(initializer2);
    return x;
}

const useComputedBearStore_create = create<ComputedBearState>()(computed(createComputedBearStoreInitializer({
    bear_names: [],
})));

function useComputedBearStore<T>(store: ComputedBearStore, selector: (state: ComputedBearState) => T, equalityFn?: (left: T, right: T) => boolean): T {
    if(equalityFn) return useStoreWithEqualityFn(store, selector, equalityFn);
    return useStore(store, selector);
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////


const useBearNames = () => [...useBearStore_create(s=>s.bear_names)];

const BearList = (props: {selectRef: RefObject<HTMLSelectElement | null>}) => {
    const bearNames = useBearNames();
    const bearNames2 = useComputedBearStore_create(s=>s.bear_names);
    // useMemo(()=>
    return <>
    <select ref={props.selectRef} size={8}>
        {
            bearNames.map(name => <option>{name}</option>)
        }
    </select><br/>
    <span>{bearNames2.join(', ')}</span>
    </>;
};

const ZustandTest = () => {
    const selectRef = useRef<HTMLSelectElement>(null);
    const inputRef = useRef<HTMLInputElement>(null);

    const removeBear = useBearStore_create(s=>s.removeBear);
    const addBear_ = useBearStore_create(s=>s.addBear);

    const removeBear2 = useComputedBearStore_create(s=>s.removeBear);
    const addBear_2 = useComputedBearStore_create(s=>s.addBear);

    const deleteBear = () => {
        const sel = selectRef.current;
        if(!sel) return;
        const index = sel.selectedIndex;
        if(index === -1) return;
        const option = sel.options[index];
        removeBear(option.value);
        removeBear2(option.value);
        // const options = sel.selectedOptions;
        // const bearNames = new Set<string>(useBearStore_create.getState().bear_names);
        // for(const option of options) {
        //     removeBear
        // }
    };

    const addBear: MouseEventHandler<HTMLButtonElement> = (evt) => {
        const input = inputRef.current;
        if(!input) return;
        // const t  = evt.currentTarget;
        const name = input.value.trim();
        if(name) {
            addBear_(name);
            addBear_2(name);
        }
        input.value = '';
    }

    const numBears = useBearStore_create(s=>s.num_bears);
    // useDebugValue(numBears, (value)=>`Number of bears: ${value}`);
    const numBearsComputed = useComputedBearStore_create(s=>s.num_bears);


    const select = selectRef.current;
    const input = inputRef.current;

    // const canDeleteBear = useMemo(()=>select && select.selectedOptions.length, [select, select?.selectedOptions.length]);
    const canDeleteBear = select && select.selectedOptions.length;
    const canAddBear = input && Boolean(input.value) && input.value.trim().length > 0
    // const canAddBear = useMemo(()=>input, [input])

    return <div id="zustand-test" className="flex-col">
        <div><label>Num bears: {numBears}</label></div>
        <div><label>Num bears (computed): {numBearsComputed}</label></div>
        <div className="flex-col">
            <BearList selectRef={selectRef}></BearList>
            <button className="hover:bg-amber-700 active:bg-amber-500 disabled:bg-gray-600 bg-amber-900" onClick={deleteBear} disabled={!canDeleteBear}>Delete bear</button>
            <div className="flex-row">
                <label>Bear name: </label><input ref={inputRef} className="border-accent-foreground bg-accent"></input>
                <button className="hover:bg-amber-700 active:bg-amber-500 disabled:bg-gray-600 bg-amber-900" onClick={addBear} disabled={!canAddBear}>Add bear</button>
            </div>
        </div>
    </div>;
}



export default ZustandTest;