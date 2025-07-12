
import { Button } from "../ui/button";

import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from "./SafeDrawer";
// } from "@/components/ui/drawer";
// import { useMediaQuery } from "usehooks-ts";

export default function StoryDrawer() {

    return <Drawer>
        <DrawerTrigger>Open</DrawerTrigger>
        <DrawerContent>
            <DrawerHeader><DrawerTitle>Turtles</DrawerTitle></DrawerHeader>
        </DrawerContent>
    </Drawer>
}   


    //  {/* <DrawerHeader>
    //             <DrawerTitle>Are you absolutely sure?</DrawerTitle>
    //             <DrawerDescription>This action cannot be undone.</DrawerDescription>
    //         </DrawerHeader>
    //         <DrawerFooter>
    //             {/* <Button>Submit</Button> */}
    //             <DrawerClose asChild>
    //                 {/* Cancel */}
    //                 <Button variant="outline">Cancel</Button>
    //             </DrawerClose>
    //         </DrawerFooter> */}