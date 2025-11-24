import { Button } from "../ui/button";
import { ButtonGroup, ButtonGroupSeparator, ButtonGroupText } from "../ui/button-group";
import { Toaster as Sonner } from "../ui/sonner";
import { toast } from "sonner";

export default function AlertToast() {
    return <>
        {/* <Sonner toastOptions={{closeButton: true}} visibleToasts={2} closeButton duration={50} expand gap={2} hotkey={['x']} icons={{}} invert
        offset={2} mobileOffset={2} position="top-center" richColors swipeDirections={["left", "right", "top"]} theme="system"></Toaster> */}
        <Sonner 
            position="top-center"
            richColors 
        />
        {/* <ButtonGroup>
            <ButtonGroupText>
            Button group text
            </ButtonGroupText>
            <Button variant="outline" onClick={() => toast("Event has been created")}>
                Default
            </Button>
            <ButtonGroupSeparator></ButtonGroupSeparator>
            <Button
                variant="outline"
                onClick={() => toast.success("Event has been created")}
                >
                Success
            </Button>
            <Button
                variant="outline"
                onClick={() =>
                    toast.info("Be at the area 10 minutes before the event time")
                }
            >
                Info
            </Button>
            <ButtonGroupSeparator></ButtonGroupSeparator>
            <Button
                variant="outline"
                onClick={() =>
                    toast.warning("Event start time cannot be earlier than 8am")
                }
            >
                Warning
            </Button>
            <Button
                variant="outline"
                onClick={() => toast.error("Event has not been created")}
            >
                Error
            </Button>
            <Button
                variant="outline"
                onClick={() => {
                    toast.promise<{ name: string }>(
                        () =>
                            new Promise((resolve) =>
                                setTimeout(() => resolve({ name: "Event" }), 2000)
                            ),
                        {
                            loading: "Loading...",
                            success: (data) => `${data.name} has been created`,
                            error: "Error",
                        }
                    )
                }}
            >
                Promise
            </Button>
        </ButtonGroup> */}
    </>;
}