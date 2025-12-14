import React, { forwardRef } from "react";
import type { TagType } from "../FilterForm";
import TagButtons from "../common/TagButtons2";
import ResetButton from "../common/ResetButton";
import BoolSwitch from "./BoolSwitch";
import type { TagSectionStore } from "../common/stores/tagSectionStore";
import { useStore } from "zustand";



type TagFilterSectionProps = {
    tagType: TagType,
    store: TagSectionStore,
};


interface TagFilterSectionHandle {
    toggleFilterStatus: (tagText: string) => void,
};



const TagFilterSection = forwardRef<TagFilterSectionHandle, TagFilterSectionProps>(({store, tagType}: TagFilterSectionProps, _ref) => {

    const {sectionTitle, /*colorClassName, availableTags, toggleTag,*/ setUseOr, reset} = useStore(store, s=>({
        sectionTitle: s.sectionTitle, /*colorClassName: s.colorClassName, availableTags: s.availableTags,
        toggleTag: s.toggleTag,*/ setUseOr: s.setUseOr, reset: s.reset
    }));

    // const selectedTags = useStore(store, s=>s.selectedTags)
    const canReset = useStore(store, s=>s.canReset);
    const useOr = useStore(store, s=>s.useOr);

    const onClick = React.useCallback(()=>reset(), [reset]);

    return <div role="group" aria-labelledby="languages-label" className="space-y-0 mb-5" data-role='tag-filter-section' data-tag-type={tagType}>
        <div className="inline-flex items-baseline">
            <span id="languages-label" className="text-xs font-semibold" role="heading" aria-level={4}>
                {sectionTitle}
            </span>
            <ResetButton disabled={!canReset} onClick={onClick}>Reset</ResetButton>
            {/* <Toggle pressed={useOr} onPressedChange={setUseOr} className="text-xs h-[1em] m-0">
                MATCH {useOr ? 'ANY' : 'ALL'}
            </Toggle> */}
            <BoolSwitch checked={useOr} onCheckedChange={setUseOr}/>
        </div>
        <TagButtons store={store}/>
    </div>;
});

export default TagFilterSection;