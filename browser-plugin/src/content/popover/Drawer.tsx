import { Avatar, Popover } from "radix-ui";
import { MixerHorizontalIcon, Cross2Icon } from "@radix-ui/react-icons";
import "./radix-primitives.css";
import { useState } from "react";

const DropdownMenuDemo = ({ trigger }: { trigger: React.ReactNode }) => {
  const [isOpen, setIsOpen] = useState(false);
  const handleClickPopOver = (e: React.MouseEvent) => {
    e.stopPropagation();
  }
  const handleClickTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  }
  return (
    <Popover.Root open={isOpen} onOpenChange={setIsOpen}>
      <Popover.Trigger asChild onClick={handleClickTrigger}>
        <>
          {trigger}
        </>
      </Popover.Trigger>
      <Popover.Portal container={document.documentElement}>
        <Popover.Content className="PopoverContent" side="right" sideOffset={5} style={{ zIndex: 2147483637 }}>
          <div style={{ display: "flex", gap: 20 }}>
            <Avatar.Root className="AvatarRoot">
              <Avatar.Image
                className="AvatarImage"
                src="https://images.unsplash.com/photo-1492633423870-43d1cd2775eb?&w=128&h=128&dpr=2&q=80"
                alt="Colm Tuite"
              />
              <Avatar.Fallback className="AvatarFallback" delayMs={600}>
                CT
              </Avatar.Fallback>
            </Avatar.Root>
          </div>
          <Popover.Close className="PopoverClose" aria-label="Close">
            <Cross2Icon />
          </Popover.Close>
          <Popover.Arrow className="PopoverArrow" />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};

export default DropdownMenuDemo;
