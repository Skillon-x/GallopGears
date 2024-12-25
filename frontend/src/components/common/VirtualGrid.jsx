import React, { useRef, useEffect, useState } from 'react';
import { useInView } from 'react-intersection-observer';

const VirtualGrid = ({
    itemCount,
    itemHeight,
    columnCount,
    gap = 24,
    renderItem,
    className = ''
}) => {
    const containerRef = useRef(null);
    const [visibleRange, setVisibleRange] = useState({ start: 0, end: 20 });
    const [containerWidth, setContainerWidth] = useState(0);
    const { ref: bottomRef, inView } = useInView({
        threshold: 0,
        rootMargin: '200px'
    });

    // Calculate item width based on container width and column count
    const itemWidth = (containerWidth - (gap * (columnCount - 1))) / columnCount;

    // Calculate total rows needed
    const rowCount = Math.ceil(itemCount / columnCount);
    const totalHeight = rowCount * (itemHeight + gap) - gap;

    // Update container width on resize
    useEffect(() => {
        const updateWidth = () => {
            if (containerRef.current) {
                setContainerWidth(containerRef.current.offsetWidth);
            }
        };

        updateWidth();
        const resizeObserver = new ResizeObserver(updateWidth);
        if (containerRef.current) {
            resizeObserver.observe(containerRef.current);
        }

        return () => {
            resizeObserver.disconnect();
        };
    }, []);

    // Update visible range based on scroll position with intersection observer
    useEffect(() => {
        const handleScroll = () => {
            if (!containerRef.current) return;

            const container = containerRef.current;
            const scrollTop = window.scrollY - container.offsetTop;
            const viewportHeight = window.innerHeight;

            // Calculate visible range with buffer
            const bufferRows = inView ? 4 : 2; // Increase buffer when bottom is in view
            const rowHeight = itemHeight + gap;
            const startRow = Math.max(0, Math.floor(scrollTop / rowHeight) - bufferRows);
            const endRow = Math.min(
                rowCount,
                Math.ceil((scrollTop + viewportHeight) / rowHeight) + bufferRows
            );

            const start = startRow * columnCount;
            const end = Math.min(itemCount, endRow * columnCount);

            setVisibleRange({ start, end });
        };

        handleScroll();
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [itemCount, itemHeight, columnCount, gap, rowCount, inView]);

    // Render only visible items
    const items = [];
    for (let i = visibleRange.start; i < visibleRange.end; i++) {
        if (i >= itemCount) break;

        const row = Math.floor(i / columnCount);
        const col = i % columnCount;
        const top = row * (itemHeight + gap);
        const left = col * (itemWidth + gap);

        items.push(
            <div key={i}>
                {renderItem({
                    index: i,
                    style: {
                        position: 'absolute',
                        top,
                        left,
                        width: itemWidth,
                        height: itemHeight
                    }
                })}
            </div>
        );
    }

    return (
        <div 
            ref={containerRef}
            className={`relative ${className}`}
            style={{ height: totalHeight }}
        >
            {items}
            <div ref={bottomRef} style={{ position: 'absolute', bottom: 0, height: '1px' }} />
        </div>
    );
};

export default React.memo(VirtualGrid); 