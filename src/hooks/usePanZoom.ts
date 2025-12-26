import { useState, useCallback } from 'react';

export const usePanZoom = (initialZoom = 100) => {
    const [zoom, setZoom] = useState(initialZoom);
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [isDragging, setIsDragging] = useState(false);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

    const handleZoom = (delta: number) => {
        setZoom(prev => Math.min(Math.max(prev + delta, 5), 1000));
    };

    const resetNavigation = useCallback(() => {
        setZoom(100);
        setPosition({ x: 0, y: 0 });
    }, []);

    const onMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return;
        setIsDragging(true);
        setDragStart({ x: e.clientX - position.x, y: e.clientY - position.y });
    };

    const onMouseMove = (e: React.MouseEvent) => {
        if (!isDragging) return;
        setPosition({
            x: e.clientX - dragStart.x,
            y: e.clientY - dragStart.y
        });
    };

    const onMouseUp = () => {
        setIsDragging(false);
    };

    const handleWheel = (e: React.WheelEvent) => {
        if (e.ctrlKey || e.metaKey) {
            e.preventDefault();
            const delta = -e.deltaY * 0.5;
            handleZoom(delta);
        }
    };

    const fitToView = useCallback((contentW: number, contentH: number, containerW: number, containerH: number, padding = 40) => {
        if (contentW === 0 || contentH === 0 || containerW === 0 || containerH === 0) return;

        const availableW = containerW - padding * 2;
        const availableH = containerH - padding * 2;

        const scaleX = availableW / contentW;
        const scaleY = availableH / contentH;

        // Use the smaller scale to ensure it fits both dimensions
        // Cap max zoom at 100% (1.0) so small diagrams don't blow up too huge, unless user wants it?
        // User said "fits perfectly". Usually that means filling the space. 
        // Let's cap at 200% just in case, or 100%? Let's try 150%.
        const scale = Math.min(scaleX, scaleY);

        const newZoom = Math.min(Math.max(scale * 100, 5), 200);

        setZoom(newZoom);
        setPosition({ x: 0, y: 0 }); // Center it (translation is applied from center in CSS usually)
    }, []);

    return {
        zoom,
        setZoom, // Exposed for external control if needed
        position,
        isDragging,
        handleZoom,
        resetNavigation,
        onMouseDown,
        onMouseMove,
        onMouseUp,
        handleWheel,
        fitToView
    };
};
