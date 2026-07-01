import { Avatar, Popover } from "radix-ui";
import { Cross2Icon } from "@radix-ui/react-icons";
import styles from "./radix-primitives.module.css";
import { useState, useEffect } from "react";
import React from "react";

interface UserInfo {
  id: string;
  username: string;
  avatar?: string;
}

interface DrawerProps {
  trigger: React.ReactNode;
  triggerClassName?: string;
  hidePopOver?: Function;
}

export const Drawer = ({ trigger, triggerClassName, hidePopOver }: DrawerProps) => {
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
  const handleLogin = () => {
    window.open(`${import.meta.env.VITE_CLIENT_API_URL}`, "_blank");
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

    if (userInfo === null) checkLoginStatus();
  }, [isOpen, userInfo]);

  return (
    <Popover.Root open={isOpen} onOpenChange={handleOpenChange}>
      <Popover.Trigger asChild>
        <div className={`${styles.PopoverTrigger} ${triggerClassName}`} onClick={handleClickTrigger}>
          {trigger}
        </div>
      </Popover.Trigger>
      <Popover.Portal container={document.documentElement}>
        <Popover.Content className={styles.PopoverContent} side="right" sideOffset={5} style={{ zIndex: 2147483637 }}>
          <header className={styles.PopoverHeader}>
            {isLoading ? (
              <>加载中...</>
            ) : userInfo ? (
              <>
                <Avatar.Root className={styles["AvatarRoot"]}>
                  {userInfo.avatar ? (
                    <Avatar.Image className={styles["AvatarImage"]} src={userInfo.avatar} alt={userInfo.username} />
                  ) : null}
                  <Avatar.Fallback className={styles["AvatarFallback"]}>WN</Avatar.Fallback>
                </Avatar.Root>
                <>{userInfo.username}</>
              </>
            ) : (
              <div
                style={{ display: "flex", alignItems: "center", gap: 4, cursor: "pointer" }}
                onClick={() => handleLogin()}>
                <Avatar.Root className={styles["AvatarRoot"]}></Avatar.Root>
                <>未登录，点击前往登录</>
              </div>
            )}
          </header>
          <Popover.Close className={styles.PopoverClose} aria-label="Close">
            <Cross2Icon />
          </Popover.Close>
          <Popover.Arrow className={styles.PopoverArrow} />
        </Popover.Content>
      </Popover.Portal>
    </Popover.Root>
  );
};
