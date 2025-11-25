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
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [width, setWidth] = useState<number>(1200);

    useEffect(() => {
        if (!containerRef.current) return;
        const observer = new ResizeObserver((entries) => {
            const entry = entries[0];
            const width = entry?.contentRect.width;
            if (width !== undefined) setWidth(width);
        });
        observer.observe(containerRef.current);
        return () => observer.disconnect();
    }, []);

    return (
        <div ref={containerRef}>
            <Responsive
                className="layout"
                layouts={{ lg: props.layoutItems }}
                width={width}
                breakpoints={{ lg: 1024, md: 768, sm: 640 }}
                cols={{ lg: 20, md: 16, sm: 10 }}
                rowHeight={36}
                margin={[12, 12]}
                containerPadding={[0, 12]}
                compactType="vertical"
                preventCollision={false}
                isDraggable={props.isEditing}
                isResizable={props.isEditing}
                onLayoutChange={(layout) => {
                    if (!props.isEditing) return;
                    props.onDraftChange(layout);
                }}
            >
                {props.children}
            </Responsive>
        </div>
    );
}
