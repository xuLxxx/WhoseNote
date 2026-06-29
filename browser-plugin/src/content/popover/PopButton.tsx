import React from "react";
import './app.css';
import { Slot } from "radix-ui";

interface PopButtonProps {
  icon: string;
  onClick?: () => void;
}

export function PopButton({ icon, onClick }: PopButtonProps) {
  return (
    <Slot.Root>
      <button className="pop-button" onClick={onClick}>
        <i className={`iconfont`}>{icon}</i>
      </button>
    </Slot.Root>
  )
}