import React, { useEffect, useState } from 'react';
import { ComplaintCard as RealComplaintCard } from '@/components/dashboard/ComplaintCard';
import { useAuth } from '@/contexts/AuthContext';
import { useQuery } from '@tanstack/react-query';
import { api } from '@/lib/api';
import { useWards } from '@/hooks/useLocations';
import { useProfile } from '@/hooks/useProfile';
export default function NearbyComplaints() {
    const { user } = useAuth();
    const [sortBy, setSortBy] = useState('upvotes');
    const [selectedWard, setSelectedWard] = useState('');
    const { data: wards = [], isLoading: wardsLoading } = useWards();
    const { data: profile } = useProfile();
    useEffect(() => {
        if (selectedWard)
            return;
        if (profile?.ward_id) {
            setSelectedWard(profile.ward_id);
            return;
        }
        if (wards.length > 0) {
            setSelectedWard(wards[0].id);
        }
    }, [profile?.ward_id, wards, selectedWard]);
    useEffect(() => {
        if (!selectedWard)
            return;
        const exists = wards.some((w) => w.id === selectedWard);
        if (!exists && wards.length > 0) {
            setSelectedWard(wards[0].id);
        }
    }, [selectedWard, wards]);
    const { data: complaints = [], isLoading: complaintsLoading, error: complaintsError, } = useQuery({
        queryKey: ['nearby-by-ward', selectedWard],
        queryFn: async () => {
            if (!selectedWard)
                return [];
            const { data } = await api.get('/complaints/by-ward', { params: { wardId: selectedWard } });
            return data;
        },
        enabled: !!selectedWard,
        staleTime: 5 * 60 * 1000,
    });
    if (!user)
        return <div className="text-sm">Please sign in to view complaints in your ward.</div>;
    // Sort list based on sortBy preference
    const sortedList = [...complaints].sort((a, b) => {
        if (sortBy === 'upvotes') {
            return (b.upvotes ?? 0) - (a.upvotes ?? 0);
        }
        else {
            return new Date(b.created_at).getTime() - new Date(a.created_at).getTime();
        }
    });
    return (<div className="space-y-4">
      <div className="space-y-3">
        <h2 className="text-2xl font-bold">Nearby Complaints</h2>
        <div>
          <label className="text-sm block mb-1">Select Ward</label>
          <select value={selectedWard} onChange={(e) => setSelectedWard(e.target.value)} className="border rounded p-2 min-w-[280px]" disabled={wardsLoading}>
            <option value="">Select ward</option>
            {wards.map((w) => (<option key={w.id} value={w.id}>
                {w.name}
              </option>))}
          </select>
        </div>
        <div className="flex gap-2 bg-muted/50 p-3 rounded-lg w-fit">
          <button onClick={() => setSortBy('upvotes')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${sortBy === 'upvotes'
            ? 'bg-primary text-primary-foreground'
            : 'bg-background text-foreground hover:bg-muted'}`}>
            🔥 Most Upvoted
          </button>
          <button onClick={() => setSortBy('recent')} className={`px-4 py-2 rounded-md text-sm font-medium transition-colors ${sortBy === 'recent'
            ? 'bg-primary text-primary-foreground'
            : 'bg-background text-foreground hover:bg-muted'}`}>
            📅 Most Recent
          </button>
        </div>
      </div>

      {wardsLoading && <p className="text-sm text-muted-foreground">Loading wards…</p>}
      {!selectedWard && !wardsLoading && (<p className="text-sm text-muted-foreground">No ward selected. Set your ward from Profile, or choose a ward above.</p>)}
      {complaintsLoading && selectedWard && (<p className="text-sm text-muted-foreground">Loading complaints…</p>)}
      {complaintsError && selectedWard && (<p className="text-sm text-red-600">
          {complaintsError?.response?.data?.error || 'Failed to load complaints for selected ward.'}
        </p>)}

      {selectedWard && !complaintsLoading && !complaintsError && (<div className="space-y-4 mt-2">
          {sortedList.length > 0 ? (sortedList.map((c) => <RealComplaintCard key={c.id} complaint={c}/>)) : (<p className="text-sm text-muted-foreground">No complaints found for selected ward.</p>)}
        </div>)}
    </div>);
}
