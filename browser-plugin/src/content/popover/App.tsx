import { useState, useRef, useCallback, cloneElement } from 'react';
import './app.css';
import { PopButton } from './PopButton';
import Drawer from './Drawer';
import { ExtensionStorage } from '@/utils/storage';
import { ExtensionSettings } from '@/types/chrome';

// 创建透明图片用于消除拖拽鬼影
const transparentImage = new Image();
transparentImage.src = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAfFcJlAAAAABlBMVEX///8AAAAAAAABJRU5ErkJggg==';

export function PopoverApp(): React.ReactNode {
  const [isDragging, setIsDragging] = useState(false);
  const [adsorption, setAdsorption] = useState<'left' | 'right'>('right');
  const [position, setPosition] = useState({ x: 0, y: 100 });
  const clonePosition = useRef({ x: 0, y: 0 });

  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<HTMLDivElement>(null);
  const cloneRef = useRef<HTMLDivElement | null>(null);
  const offsetRef = useRef({ x: 0, y: 0 });

  // 拖动开始
  const handleDragStart = useCallback((e: React.DragEvent) => {
    if (!dragRef.current) return;
    const container = containerRef.current;
    const rect = dragRef.current.getBoundingClientRect();

    // 设置透明拖拽图像，消除鬼影
    e.dataTransfer?.setDragImage(transparentImage, 0, 0);

    // 创建克隆元素作为拖拽动画对象
    const clone = dragRef.current.cloneNode(true) as HTMLDivElement;
    clone.style.position = 'absolute';
    clone.style.zIndex = '9999999';
    clone.style.width = rect.width + 'px';
    clone.style.height = rect.height + 'px';
    clone.style.opacity = '1';
    clone.style.pointerEvents = 'none';
    clone.style.left = '0px';
    clone.style.top = '0px';
    clone.style.transform = `translate3d(${rect.left}px, ${rect.top}px, 0)`;
    clone.style.transition = 'none';
    container?.appendChild(clone);
    cloneRef.current = clone;
    offsetRef.current = {
      x: e.clientX - rect.left,
      y: e.clientY - rect.top
    };
    setIsDragging(true);
  }, []);

  // 拖动进行中
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    // e.preventDefault();
    if (!cloneRef.current) return;

    const clone = cloneRef.current;
    const offset = offsetRef.current;

    // 更新克隆元素位置
    const x = ~~(e.clientX - offset.x);
    const y = ~~(e.clientY - offset.y);
    if (x < 0 || y < 0) {
      return;
    }
    clone.style.transform = `translate3d(${x}px, ${y}px, 0)`;
    clonePosition.current.x = x;
    clonePosition.current.y = y;
    console.log('clonePosition', clonePosition.current);
  }, []);

  // 拖动结束
  const handleDragEnd = useCallback((e: React.DragEvent) => {
    if (!cloneRef.current || !dragRef.current) return;
    const x = ~~(e.clientX);
    const y = ~~(e.clientY);
    const clone = cloneRef.current;
    const screenWidth = window.innerWidth;
    const rect = dragRef.current.getBoundingClientRect();
    const cloneRect = clone.getBoundingClientRect();
    const offset = offsetRef.current;
    const adsorptionRight = e.clientX > (screenWidth / 2);
    const left = x - offset.x
    const top = y - offset.y
    clone.style.transform = `translate3d(${left}px, ${top}px, 0)`;
    if (adsorptionRight) {
      setAdsorption('right');
    } else {
      setAdsorption('left');
    }

    // 添加吸附动画
    clone.animate(
      [
        { transform: `translate3d(${left}px, ${top}px, 0)` },
        { transform: `translate3d(${adsorptionRight ? screenWidth - rect.width : 0}px, ${top}px, 0)` }
      ],
      {
        duration: 150,
        easing: 'ease-in-out'
      }
    ).finished.then(() => {
      // 更新原元素位置
      setPosition({
        x: adsorptionRight ? screenWidth - rect.width : 0,
        y: top
      });
      // offsetRef.current = { x: 0, y: 0 };
      // 移除克隆元素
      containerRef.current?.removeChild(clone);
      cloneRef.current = null;
      // 显示原元素
      setIsDragging(false);
    });
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
  }, []);

  const [isSidePanelOpen, setIsSidePanelOpen] = useState(false);

  const toggleSidePanel = () => {
    const newValue = !isSidePanelOpen;
    setIsSidePanelOpen(newValue);
    chrome.runtime.sendMessage({
      action: "toggleSidePanel",
      data: newValue
    }).then(response => {
      console.log('toggleSidePanel response:', response);
    }).catch(err => {
      console.error("切换侧边栏失败", err);
    });
  };

  return (
    <div draggable ref={containerRef} className='drag-animation-container'
      style={{
        width: isDragging ? '100vw' : '0',
        height: isDragging ? '100vh' : '0',
        left: 0,
        top: 0
      }} >
      <div
        ref={dragRef}
        className='drag-animation'
        id="mount"
        draggable
        onDragStart={handleDragStart}
        onDrag={handleMouseMove}
        onDragEnd={handleDragEnd}
        onDragOver={handleDragOver}
        style={{
          top: position.y,
          left: position.x,
          transform: 'translate3d(0, 0, 0)',
          opacity: isDragging ? 0 : 1,
        }}
      >
        <PopButton icon="&#xe601;" onClick={() => toggleSidePanel()}></PopButton>
        <Drawer trigger={<PopButton icon="&#xe601;"></PopButton>} />
      </div>
    </div>
  );
}