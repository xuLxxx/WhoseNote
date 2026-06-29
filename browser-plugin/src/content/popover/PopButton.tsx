import React from "react";
import "./app.css";
import { Slot } from "radix-ui";

interface PopButtonProps {
  icon?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function PopButton({ icon, onClick, children }: PopButtonProps) {
  return (
    <Slot.Root>
      <button className="pop-button" onClick={onClick}>
        {icon && <i className={`iconfont`} style={{width:"100%"}}>{icon}</i>}
        {children && children}
      </button>
    </Slot.Root>
  );
}
