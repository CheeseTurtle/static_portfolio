import React, { forwardRef } from "react";
import type { TagType } from "../FilterForm";
import TagButtons from "../common/TagButtons2";
import ResetButton from "../common/ResetButton";
import BoolSwitch from "./BoolSwitch";
import { useTagSectionStore } from "../common/stores/filterFormStoreContext";
import { shallow } from "zustand/shallow";



type TagFilterSectionProps = {
    tagType: TagType,
    // store: TagSectionStore,
};


interface TagFilterSectionHandle {
    toggleFilterStatus: (tagText: string) => void,
};



const TagFilterSection = forwardRef<TagFilterSectionHandle, TagFilterSectionProps>(({tagType}: TagFilterSectionProps, _ref) => {

    const {sectionTitle, /*colorClassName, availableTags, toggleTag,*/ setUseOr, reset} = useTagSectionStore(s=>({
        sectionTitle: s.sectionTitle, /*colorClassName: s.colorClassName, availableTags: s.availableTags,
        toggleTag: s.toggleTag,*/ setUseOr: s.setUseOr, reset: s.reset
    }), shallow);

    // const selectedTags = useStore(store, s=>s.selectedTags)
    const canReset = useTagSectionStore(s=>s.canReset);
    const useOr = useTagSectionStore(s=>s.useOr);

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
        <TagButtons/>
    </div>;
});

export default TagFilterSection;