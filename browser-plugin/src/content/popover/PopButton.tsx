import React from "react";

interface PopButtonProps {
  icon?: string;
  onClick?: () => void;
  children?: React.ReactNode;
}

export function PopButton({ icon, onClick, children }: PopButtonProps) {
  return (
    <button className="pop-button" onClick={onClick}>
      {icon && <i className={`iconfont ${icon}`}></i>}
      {children && children}
    </button>
  );
}
