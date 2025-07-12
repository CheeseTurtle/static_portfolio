"use client"

import * as React from "react"
import { Drawer as DrawerPrimitive } from "vaul"
import * as OriginalDrawer from "../ui/drawer"

import { cn } from "@/lib/utils"

// import {useState} from "preact/hooks"
import {useState} from "react";
import { fixPreactRef } from "./util/fixPreactRef"

function Drawer({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Root>) {
  return <DrawerPrimitive.Root data-slot="drawer" {...props} />
}

function DrawerTrigger({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Trigger>) {
  return <DrawerPrimitive.Trigger data-slot="drawer-trigger" {...props} />
}

function DrawerPortal({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Portal>) {
  return <DrawerPrimitive.Portal data-slot="drawer-portal" {...props} />
}

function DrawerClose({
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Close>) {
  return <DrawerPrimitive.Close data-slot="drawer-close" {...props} />
}

// function DrawerOverlay({
//   className,
//   ...props
// }: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
//   return (
//     <DrawerPrimitive.Overlay
//       data-slot="drawer-overlay"
//       className={cn(
//         "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
//         className
//       )}
//       {...props}
//     />
//   )
// }



// // Wrap DrawerOverlay with ref fix
// function DrawerOverlay(props: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
//   const [el, setEl] = useState<HTMLElement | null>(null);
//   return <OriginalDrawer.DrawerOverlay {...props} ref={fixPreactRef(setEl)} />;
// };

function DrawerOverlay({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Overlay>) {
  return (
    <DrawerPrimitive.Overlay
      data-slot="drawer-overlay"
      className={cn(
        "data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 fixed inset-0 z-50 bg-black/50",
        className
      )}
      {...props}
    />
  )
}

// // Wrap DrawerContent with ref fix
// function DrawerContent(props: React.ComponentProps<typeof DrawerPrimitive.Content>) {
//   const [el, setEl] = useState<HTMLElement | null>(null);
//   return <OriginalDrawer.DrawerContent {...props} ref={fixPreactRef(setEl)} />;
// };

function DrawerContent({
  className,
  children,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Content>) {
  return (
    <DrawerPortal data-slot="drawer-portal">
      <DrawerOverlay />
      <DrawerPrimitive.Content
        data-slot="drawer-content"
        className={cn(
          "group/drawer-content bg-background fixed z-50 flex h-auto flex-col",
          "data-[vaul-drawer-direction=top]:inset-x-0 data-[vaul-drawer-direction=top]:top-0 data-[vaul-drawer-direction=top]:mb-24 data-[vaul-drawer-direction=top]:max-h-[80vh] data-[vaul-drawer-direction=top]:rounded-b-lg data-[vaul-drawer-direction=top]:border-b",
          "data-[vaul-drawer-direction=bottom]:inset-x-0 data-[vaul-drawer-direction=bottom]:bottom-0 data-[vaul-drawer-direction=bottom]:mt-24 data-[vaul-drawer-direction=bottom]:max-h-[80vh] data-[vaul-drawer-direction=bottom]:rounded-t-lg data-[vaul-drawer-direction=bottom]:border-t",
          "data-[vaul-drawer-direction=right]:inset-y-0 data-[vaul-drawer-direction=right]:right-0 data-[vaul-drawer-direction=right]:w-3/4 data-[vaul-drawer-direction=right]:border-l data-[vaul-drawer-direction=right]:sm:max-w-sm",
          "data-[vaul-drawer-direction=left]:inset-y-0 data-[vaul-drawer-direction=left]:left-0 data-[vaul-drawer-direction=left]:w-3/4 data-[vaul-drawer-direction=left]:border-r data-[vaul-drawer-direction=left]:sm:max-w-sm",
          className
        )}
        {...props}
      >
        <div className="bg-muted mx-auto mt-4 hidden h-2 w-[100px] shrink-0 rounded-full group-data-[vaul-drawer-direction=bottom]/drawer-content:block" />
        {children}
      </DrawerPrimitive.Content>
    </DrawerPortal>
  )
}

function DrawerHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-header"
      className={cn(
        "flex flex-col gap-0.5 p-4 group-data-[vaul-drawer-direction=bottom]/drawer-content:text-center group-data-[vaul-drawer-direction=top]/drawer-content:text-center md:gap-1.5 md:text-left",
        className
      )}
      {...props}
    />
  )
}

function DrawerFooter({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="drawer-footer"
      className={cn("mt-auto flex flex-col gap-2 p-4", className)}
      {...props}
    />
  )
}

function DrawerTitle({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Title>) {
  return (
    <DrawerPrimitive.Title
      data-slot="drawer-title"
      className={cn("text-foreground font-semibold", className)}
      {...props}
    />
  )
}

function DrawerDescription({
  className,
  ...props
}: React.ComponentProps<typeof DrawerPrimitive.Description>) {
  return (
    <DrawerPrimitive.Description
      data-slot="drawer-description"
      className={cn("text-muted-foreground text-sm", className)}
      {...props}
    />
  )
}

export {
  Drawer,
  DrawerPortal,
  DrawerOverlay,
  DrawerTrigger,
  DrawerClose,
  DrawerContent,
  DrawerHeader,
  DrawerFooter,
  DrawerTitle,
  DrawerDescription,
}







// // components/ui/SafeDrawer.tsx
// import * as OriginalDrawer from '@/components/ui/drawer'; // adjust path as needed
// import { fixPreactRef } from './util/fixPreactRef'; // see step 2
// import { useState } from 'preact/hooks';
// import type { Drawer as DrawerPrimitive } from "vaul"

// export function Drawer(props: React.ComponentProps<typeof DrawerPrimitive.Root>) {
//   return <OriginalDrawer.Drawer {...props} />;
// }

// Drawer.Trigger = OriginalDrawer.DrawerTrigger;

// Drawer.Close = OriginalDrawer.DrawerClose;

// Drawer.Title = OriginalDrawer.DrawerTitle;
// Drawer.Description = OriginalDrawer.DrawerDescription;
// Drawer.Header = OriginalDrawer.DrawerHeader;
// Drawer.Footer = OriginalDrawer.DrawerFooter;

// // Wrap DrawerContent with ref fix
// Drawer.Content = function SafeDrawerContent(props: React.ComponentProps<typeof DrawerPrimitive.Content>) {
//   const [el, setEl] = useState<HTMLElement | null>(null);
//   return <OriginalDrawer.DrawerContent {...props} ref={fixPreactRef(setEl)} />;
// };

// export const {
// //   Root,
// //   NestedRoot,
// //   DrawerOverlay,
//   DrawerTrigger,
//   DrawerPortal,
// //   Handle,
//   DrawerClose,
//   DrawerTitle,
//   DrawerDescription,
//   DrawerHeader,
//   DrawerFooter
//   // ...any other exports
// } = OriginalDrawer;

// export const DrawerContent = Drawer.Content;
