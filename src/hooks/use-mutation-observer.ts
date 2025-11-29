import * as React from "react"


// type MUNode = Parameters<typeof MutationObserver['prototype']['observe']>[0];

export default function useMutationObserver(
  ref: React.RefObject<Node | HTMLElement | null>,
  callback: MutationCallback,
  options?: MutationObserverInit/* = {
    attributes: true,
    characterData: true,
    childList: true,
    subtree: true,
  }*/
) {
  const reffed = ref.current;
  React.useEffect(() => {
    if (reffed) {
      const observer = new MutationObserver(callback)
      observer.observe(reffed, options)
      return () => observer.disconnect()
    }
  }, [reffed, callback, options])
}
