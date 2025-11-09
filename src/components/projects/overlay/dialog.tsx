import { Button } from "@/components/ui/button";
import {Dialog, DialogClose, DialogContent, DialogDescription, DialogHeader, DialogFooter, DialogPortal, DialogTitle, DialogTrigger, DialogOverlay} from "@/components/ui/dialog";
import { useState, type Dispatch, type ReactElement, type SetStateAction } from "react";


export type ProjectDialogProps = {
    open: boolean,
    setOpen: Dispatch<SetStateAction<boolean>>,
    onOpenChange: Dispatch<SetStateAction<boolean>>
}


const ProjectDialog = ({open, setOpen, onOpenChange}: ProjectDialogProps) => {
    // const [open, setOpen] = useState(false);

    // Open programmatically
    // const openDialog = () => setOpen(true);

    return <>
        {/* <DialogTrigger asChild> */}
        {/* <Button variant="outline" onClick={() => setOpen(true)}>Open Dialog</Button> */}
        {/* </DialogTrigger> */}
        <Dialog open={open} onOpenChange={onOpenChange} modal>
            <DialogPortal container={document.getElementById('modal-root')}>
                <DialogContent className="sm:max-w-[425px]">
                    {/* <DialogClose asChild>
                        <Button>Turtle</Button>
                    </DialogClose> */}
                    {/* <DialogHeader>
                        <DialogTitle></DialogTitle>
                        <DialogDescription></DialogDescription>
                    </DialogHeader> */}

                    <div>
                        Turtles turtles turtles
                    </div>

                    {/* <DialogFooter>
                        <Button onClick={() => setOpen(false)}>Close</Button>
                    </DialogFooter> */}
                </DialogContent>
            </DialogPortal>
        </Dialog>
    </>
}

export default ProjectDialog;