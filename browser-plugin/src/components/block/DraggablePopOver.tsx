"use client"

import * as React from "react";
import { cn } from "@/lib/utils";

interface DraggablePopOverProps {
  className?: string;
  children?: React.ReactNode;
  width?: number;
  snapThreshold?: number;
  initialPosition?: { left: number; top: number } | "left" | "right";
}

export function DraggablePopOver({
  className,
  children,
  width = 320,
  snapThreshold = 100,
  initialPosition = "right",
}: DraggablePopOverProps) {
  const [position, setPosition] = React.useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = React.useState(false);
  const [isSnappedLeft, setIsSnappedLeft] = React.useState(false);
  const [isSnappedRight, setIsSnappedRight] = React.useState(false);
  const dragRef = React.useRef<{ startX: number; startY: number; startPositionX: number; startPositionY: number } | null>(null);

  React.useEffect(() => {
    const handleInitialPosition = () => {
      const screenWidth = window.innerWidth;
      const screenHeight = window.innerHeight;
      const top = Math.max(0, (screenHeight - 400) / 2);

      if (initialPosition === "left") {
        setPosition({ x: 0, y: top });
        setIsSnappedLeft(true);
        setIsSnappedRight(false);
      } else if (initialPosition === "right") {
        setPosition({ x: screenWidth - width, y: top });
        setIsSnappedLeft(false);
        setIsSnappedRight(true);
      } else {
        setPosition({ x: initialPosition.left, y: initialPosition.top });
        setIsSnappedLeft(false);
        setIsSnappedRight(false);
      }
    };

    handleInitialPosition();
    window.addEventListener("resize", handleInitialPosition);
    return () => window.removeEventListener("resize", handleInitialPosition);
  }, [width, initialPosition]);

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    setIsDragging(true);
    dragRef.current = {
      startX: e.clientX,
      startY: e.clientY,
      startPositionX: position.x,
      startPositionY: position.y,
    };
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging || !dragRef.current) return;

    const deltaX = e.clientX - dragRef.current.startX;
    const deltaY = e.clientY - dragRef.current.startY;
    const screenWidth = window.innerWidth;

    let newX = dragRef.current.startPositionX + deltaX;
    let newY = dragRef.current.startPositionY + deltaY;

    newX = Math.max(0, Math.min(screenWidth - width, newX));
    newY = Math.max(0, Math.min(window.innerHeight - 400, newY));

    setPosition({ x: newX, y: newY });
    setIsSnappedLeft(false);
    setIsSnappedRight(false);
  };

  const handleMouseUp = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const screenWidth = window.innerWidth;
    const centerX = screenWidth / 2;

    if (position.x < snapThreshold) {
      setPosition({ x: 0, y: position.y });
      setIsSnappedLeft(true);
      setIsSnappedRight(false);
    } else if (position.x > screenWidth - width - snapThreshold) {
      setPosition({ x: screenWidth - width, y: position.y });
      setIsSnappedLeft(false);
      setIsSnappedRight(true);
    } else if (position.x < centerX) {
      setPosition({ x: 0, y: position.y });
      setIsSnappedLeft(true);
      setIsSnappedRight(false);
    } else {
      setPosition({ x: screenWidth - width, y: position.y });
      setIsSnappedLeft(false);
      setIsSnappedRight(true);
    }
  };

  React.useEffect(() => {
    if (isDragging) {
      document.addEventListener("mousemove", handleMouseMove);
      document.addEventListener("mouseup", handleMouseUp);
      return () => {
        document.removeEventListener("mousemove", handleMouseMove);
        document.removeEventListener("mouseup", handleMouseUp);
      };
    }
  }, [isDragging]);

  return (
    <div
      className={cn(
        "fixed z-50 rounded-lg shadow-2xl bg-background border border-border overflow-hidden",
        isDragging && "cursor-grabbing shadow-3xl",
        !isDragging && "cursor-grab",
        className
      )}
      style={{
        width: width,
        left: position.x,
        top: position.y,
        transition: isDragging ? "none" : "left 0.3s ease-out",
      }}
      onMouseDown={handleMouseDown}
    >
      <div className="flex items-center justify-between px-4 py-3 bg-muted/50 border-b border-border">
        <div className="flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-2 h-2 rounded-full bg-destructive/80" />
            <div className="w-2 h-2 rounded-full bg-amber-500/80" />
            <div className="w-2 h-2 rounded-full bg-green-500/80" />
          </div>
          <span className="text-xs font-medium text-muted-foreground">
            知识库助手
          </span>
        </div>
        <div className="flex items-center gap-1">
          {isSnappedLeft && (
            <span className="text-xs text-muted-foreground">已吸附左侧</span>
          )}
          {isSnappedRight && (
            <span className="text-xs text-muted-foreground">已吸附右侧</span>
          )}
        </div>
      </div>
      <div className="p-4">{children}</div>
    </div>
  );
}
