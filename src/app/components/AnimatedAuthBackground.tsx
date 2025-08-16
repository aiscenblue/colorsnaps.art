import React, { useState, useEffect } from 'react';
import Image from 'next/image';

export const AnimatedAuthBackground = React.memo(function AnimatedAuthBackground() {
    const backgroundItems = [
        { type: 'img', value: 'https://images.unsplash.com/photo-1536566482680-fca31930a0bd' },
        { type: 'palette', value: ['#004a77', '#005a8d', '#006ba3', '#007cb9', '#008dcf'] },
        { type: 'img', value: 'https://images.unsplash.com/photo-1506905925346-21bda4d32df4' },
        { type: 'palette', value: ['#8ecae6', '#219ebc', '#023047', '#ffb703', '#fb8500'] },
        { type: 'img', value: 'https://images.unsplash.com/photo-1559128010-4c1ad8e1b2bf' },
        { type: 'palette', value: ['#003049', '#d62828', '#f77f00', '#fcbf49', '#eae2b7'] },
    ];
    const [grid, setGrid] = useState(() => Array(16).fill(null).map((_, i) => ({ id: i, item: backgroundItems[i % backgroundItems.length], isVisible: false })));
    const [hasMounted, setHasMounted] = useState(false);

    useEffect(() => {
        setHasMounted(true);
    }, []);

    useEffect(() => {
        if (!hasMounted) return;

        setGrid(currentGrid => {
            return currentGrid.map(cell => ({ ...cell, isVisible: Math.random() > 0.6 }));
        });

        const timer = setInterval(() => {
            setGrid(currentGrid => {
                const newGrid = [...currentGrid];
                const hiddenIndices = newGrid.map((c, i) => !c.isVisible ? i : -1).filter(i => i !== -1);
                const visibleIndices = newGrid.map((c, i) => c.isVisible ? i : -1).filter(i => i !== -1);
                if (hiddenIndices.length > 0) newGrid[hiddenIndices[Math.floor(Math.random() * hiddenIndices.length)]].isVisible = true;
                if (visibleIndices.length > 1) newGrid[visibleIndices[Math.floor(Math.random() * visibleIndices.length)]].isVisible = false;
                return newGrid;
            });
        }, 2000);

        return () => clearInterval(timer);
    }, [hasMounted]);
    return (
        <div className="absolute inset-0 z-0 grid grid-cols-4 grid-rows-4 gap-4 p-4 overflow-hidden">
            {grid.map(cell => (
                <div key={cell.id} className={`rounded-lg transition-opacity duration-1000 ${cell.isVisible ? 'opacity-40' : 'opacity-0'}`}>
                    {cell.item.type === 'img' ? (
                      <Image
                        src={cell.item.value as string}
                        alt=""
                        layout="fill"
                        objectFit="cover"
                        className="rounded-lg border-2 border-primary"
                        onError={(e) => {
                          e.currentTarget.style.display = 'none'; // Hide the broken image
                          if (e.currentTarget.parentElement) {
                            e.currentTarget.parentElement.style.backgroundColor = 'var(--secondary-text)'; // Set background color
                          }
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex rounded-lg border-2 border-primary overflow-hidden">
                        {Array.isArray(cell.item.value) && cell.item.value.map(color => <div key={color} style={{ backgroundColor: color }} className="flex-1" />)}
                      </div>
                    )}
                </div>
            ))}
        </div>
    );
});
