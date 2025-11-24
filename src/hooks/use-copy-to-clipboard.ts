"use client"

// https://usekit.kiron.dev/k/hooks/use-copy-to-clipboard.json

import * as React from "react"

type CopyFn = (text: string) => Promise<void>

export function useCopyToClipboard(delay = 2000): [CopyFn, boolean] {
  const [isCopied, setIsCopied] = React.useState(false)

  React.useEffect(() => {
    if (!isCopied) return

    const timer = setTimeout(() => {
      setIsCopied(false)
    }, delay)

    return () => clearTimeout(timer)
  }, [isCopied, delay])

  const copy: CopyFn = React.useCallback(async (text) => {
    if (!navigator?.clipboard) {
      throw new Error("Clipboard not supported")
    }

    if (!text) {
      throw new Error("The 'text' argument is required.")
    }

    const isPlainText = /^[\x00-\x7F]*$/.test(text)
    const isHtmlText = /<[^>]+>/.test(text)
    const isMarkdownText = /^#+\s/.test(text)

    const clipboardItem = new ClipboardItem(
      isPlainText
        ? { "text/plain": new Blob([text], { type: "text/plain" }) }
        : isHtmlText
          ? { "text/html": new Blob([text], { type: "text/html" }) }
          : isMarkdownText
            ? { "text/markdown": new Blob([text], { type: "text/markdown" }) }
            : { "text/plain": new Blob([text], { type: "text/plain" }) }
    )

    try {
      await navigator.clipboard.write([clipboardItem])
      setIsCopied(true)
    } catch (error) {
      throw new Error(error instanceof Error ? error.message : "Copy failed") // Throw error instead of returning false
    }
  }, [])

  return [copy, isCopied]
}






// import * as React from "react"

// type CopyFn = (text: string) => Promise<boolean>

// export function useCopyToClipboard(delay = 2000): [CopyFn, boolean] {
//   const [isCopied, setIsCopied] = React.useState(false)

//   React.useEffect(() => {
//     if (!isCopied) return

//     const timer = setTimeout(() => {
//       setIsCopied(false)
//     }, delay)

//     return () => clearTimeout(timer)
//   }, [isCopied, delay])

//   const copy: CopyFn = React.useCallback(async (text) => {
//     if (!navigator?.clipboard) {
//       console.warn("Clipboard not supported")
//       return false
//     }

//     try {
//       await navigator.clipboard.writeText(text)
//       setIsCopied(true)
//       return true
//     } catch (error) {
//       console.warn("Copy failed", error)
//       return false
//     }
//   }, [])

//   return [copy, isCopied]
// }


// // https://github.com/shadcn-ui/ui/blob/main/apps/v4/hooks/use-copy-to-clipboard.ts

// "use client"

// import * as React from "react"

// export function useCopyToClipboard({
//   timeout = 2000,
//   onCopy,
// }: {
//   timeout?: number
//   onCopy?: () => void
// } = {}) {
//   const [isCopied, setIsCopied] = React.useState(false)

//   const copyToClipboard = (value: string) => {
//     if (typeof window === "undefined" || !navigator.clipboard.writeText) {
//       return
//     }

//     if (!value) return

//     navigator.clipboard.writeText(value).then(() => {
//       setIsCopied(true)

//       if (onCopy) {
//         onCopy()
//       }

//       if (timeout !== 0) {
//         setTimeout(() => {
//           setIsCopied(false)
//         }, timeout)
//       }
//     }, console.error)
//   }

//   return { isCopied, copyToClipboard }
// }