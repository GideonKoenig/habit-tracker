"use client";
import { useEffect, useRef, useState } from "react";
import { Responsive, type Layout } from "react-grid-layout";
import "react-grid-layout/css/styles.css";
import "react-resizable/css/styles.css";

export function TaskGrid(props: {
    layoutItems: Layout[];
    isEditing: boolean;
    onDraftChange: (layout: Layout[] | null) => void;
    children: React.ReactNode;
}) {
    const { layoutItems, isEditing, onDraftChange, children } = props;
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState<number>(1200);
    useEffect(() => {
        if (!containerRef.current) return;
        const ro = new ResizeObserver((entries) => {
            const w = entries[0]?.contentRect.width;
            if (typeof w === "number") setWidth(w);
        });
        ro.observe(containerRef.current);
        return () => ro.disconnect();
    }, []);
    return (
        <div ref={containerRef}>
            <Responsive
                className="layout"
                layouts={{ lg: layoutItems }}
                width={width}
                breakpoints={{ lg: 1200, md: 996, sm: 768, xs: 560, xxs: 0 }}
                cols={{ lg: 12, md: 10, sm: 6, xs: 4, xxs: 2 }}
                rowHeight={36}
                margin={[12, 12]}
                containerPadding={[0, 12]}
                compactType={null}
                isDraggable={isEditing}
                isResizable={isEditing}
                onLayoutChange={(layout) => {
                    if (!isEditing) return;
                    onDraftChange(layout as unknown as Layout[]);
                }}
            >
                {children}
            </Responsive>
        </div>
    );
}
