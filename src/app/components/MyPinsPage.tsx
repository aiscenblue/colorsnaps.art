import React, { useState } from 'react';
import { PinGrid } from './PinGrid';
import { PAGE_SIZE } from '@/lib/utils';
import { Pin } from '@/lib/redux';

export const MyPinsPage = ({ allPins, savedPinIds, onRemovePin, currentUserId }: { allPins: Pin[], savedPinIds: Set<string>, onRemovePin: (pinId: string) => void, currentUserId: string }) => {
    const [searchTerm, setSearchTerm] = useState('');
    const [filter, setFilter] = useState('all');
    const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);

    const filteredPins = (() => {
        const myCreated = allPins.filter(p => p.creatorId === currentUserId);
        const mySaved = allPins.filter(p => savedPinIds.has(p.id));
        let pinsToShow: Pin[] = [];
        if (filter === 'all') pinsToShow = [...myCreated, ...mySaved];
        else if (filter === 'created') pinsToShow = myCreated;
        else if (filter === 'saved') pinsToShow = mySaved;
        pinsToShow = Array.from(new Map(pinsToShow.map(p => [p.id, p])).values());
        if (searchTerm) return pinsToShow.filter(p => p.title?.toLowerCase().includes(searchTerm.toLowerCase()));
        return pinsToShow;
    })();

    return (
        <div>
            <div className="mb-6 bg-background p-4 rounded-lg flex flex-col md:flex-row gap-4 items-center border-2 border-primary">
                <input type="text" placeholder="Search my pins..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full md:w-1/2 p-3 border-2 border-primary rounded-full bg-white"/>
                <div className="flex gap-4">
                    {['all', 'created', 'saved'].map(f => <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-full font-semibold capitalize border-2 border-primary ${filter === f ? 'bg-accent text-background' : 'bg-background text-foreground'}`}>{f}</button>)}
                </div>
            </div>
            {filteredPins.length > 0 ? (
                <>
                    <PinGrid pins={filteredPins.slice(0, visibleCount)} onRemovePin={onRemovePin} />
                    {visibleCount < filteredPins.length && <div className="text-center mt-8"><button onClick={() => setVisibleCount(c => c + PAGE_SIZE)} className="bg-accent text-background font-bold py-2 px-4 rounded-full">Show More</button></div>}
                </>
            ) : <p className="text-center text-secondary mt-10">No pins found.</p>}
        </div>
    );
}
