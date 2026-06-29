import { Avatar, Popover } from "radix-ui";
import { Cross2Icon } from "@radix-ui/react-icons";
import "./radix-primitives.css";
import { useState, useEffect } from "react";
import React from "react";

interface UserInfo {
  id: string;
  name: string;
  avatar?: string;
}

interface DrawerProps {
  trigger: React.ReactNode;
  triggerClassName?: string;
  hidePopOver?: Function;
}

export const Drawer = ({
  trigger,
  triggerClassName,
  hidePopOver,
}: DrawerProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const handleClickPopOver = (e: React.MouseEvent) => {
    e.stopPropagation();
  };
  const handleClickTrigger = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (!open) {
      hidePopOver?.();
    }
  };

  useEffect(() => {
    const checkLoginStatus = async () => {
      try {
        setIsLoading(true);
        const response = await chrome.runtime.sendMessage({
          action: "checkLoginStatus",
        });

        if (response.success) {
          setUserInfo(response.data);
        } else {
          setUserInfo(null);
        }
      } catch (error) {
        console.error("检查登录状态失败:", error);
        setUserInfo(null);
      } finally {
        setIsLoading(false);
      }
    };

    checkLoginStatus();
  }, [isOpen]);

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <div
          className={`PopoverTrigger ${triggerClassName}`}
          onClick={handleClickTrigger}
        >
          {trigger}
        </div>
      </Popover.Trigger>
      <Popover.Portal container={document.documentElement}>
        <Popover.Content
          className="PopoverContent"
          side="right"
          sideOffset={5}
          style={{ zIndex: 2147483637 }}
        >
          <div style={{ display: "flex", gap: 20 }}>
            {isLoading ? (
              <>加载中...</>
            ) : userInfo ? (
              <>
                <Avatar.Root className="AvatarRoot">
                  {userInfo.avatar ? (
                    <Avatar.Image
                      className="AvatarImage"
                      src={userInfo.avatar}
                      alt={userInfo.name}
                    />
                  ) : null}
                  <Avatar.Fallback className="AvatarFallback" delayMs={600}>
                    {userInfo.name.charAt(0).toUpperCase()}
                  </Avatar.Fallback>
                </Avatar.Root>
                <>{userInfo.name}</>
              </>
            ) : (
              <>
                <Avatar.Root className="AvatarRoot">
                  <Avatar.Fallback className="AvatarFallback" delayMs={600}>
                    U
                  </Avatar.Fallback>
                </Avatar.Root>
                <>未登录</>
              </>
            )}
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
