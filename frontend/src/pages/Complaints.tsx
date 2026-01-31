import { useState, useEffect } from 'react';
import { useComplaints } from '@/hooks/useComplaints';
import { ComplaintCard } from '@/components/dashboard/ComplaintCard';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Search, Filter, PlusCircle, Loader2 } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { complaintCategories, statusFilters } from '@/data/categories';

export default function Complaints() {
  const { user } = useAuth();
  const [searchParams] = useSearchParams();
  const searchFromUrl = searchParams.get('search') ?? '';
  const statusFromUrl = searchParams.get('status') ?? 'all';
  const [sortBy, setSortBy] = useState<'date' | 'priority' | 'area'>('date');
  const { data: complaints, isLoading, isError, error, refetch } = useComplaints(sortBy);
  const [searchQuery, setSearchQuery] = useState(searchFromUrl);
  const [statusFilter, setStatusFilter] = useState(statusFromUrl === 'all' ? 'all' : statusFromUrl);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const isDepartmentUser = user?.role === 'officer' || user?.role === 'department_head';

  useEffect(() => {
    setSearchQuery(searchFromUrl);
  }, [searchFromUrl]);

  useEffect(() => {
    setStatusFilter(statusFromUrl === 'all' ? 'all' : statusFromUrl);
  }, [statusFromUrl]);

  const filteredComplaints = (complaints || []).filter((complaint) => {
    const matchesSearch =
      complaint.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      complaint.complaint_number.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus =
      statusFilter === 'all' || complaint.status === statusFilter;
    const matchesCategory =
      categoryFilter === 'all' || complaint.category === categoryFilter;
    return matchesSearch && matchesStatus && matchesCategory;
  });

  const statusCounts = (complaints || []).reduce((acc, complaint) => {
    acc[complaint.status] = (acc[complaint.status] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="h-8 w-8 animate-spin text-accent" />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Complaints</h1>
        <div className="rounded-xl border border-destructive/50 bg-destructive/10 p-8 text-center">
          <p className="font-medium text-destructive mb-2">Failed to load complaints</p>
          <p className="text-sm text-muted-foreground mb-4">
            {(error as Error)?.message || 'Please check your connection and try again.'}
          </p>
          <Button variant="outline" onClick={() => refetch()}>
            Try again
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">
            {user?.role === 'citizen' ? 'My Complaints' : isDepartmentUser ? 'Department Complaints' : 'All Complaints'}
          </h1>
          <p className="text-muted-foreground">
            {user?.role === 'citizen'
              ? 'View and track all your submitted complaints'
              : isDepartmentUser
                ? 'View and manage complaints assigned to your department'
                : 'Manage and update complaint statuses'}
          </p>
        </div>
        {user?.role === 'citizen' && (
          <Link to="/complaints/new">
            <Button variant="accent">
              <PlusCircle className="mr-2 h-5 w-5" />
              New Complaint
            </Button>
          </Link>
        )}
      </div>

      {/* Status Summary */}
      <div className="flex flex-wrap gap-2">
        {statusFilters.slice(1).map((status) => (
          <Badge
            key={status.value}
            variant={status.value.replace('_', '-') as any}
            className="cursor-pointer"
            onClick={() =>
              setStatusFilter(statusFilter === status.value ? 'all' : status.value)
            }
          >
            {status.label}: {statusCounts[status.value] || 0}
          </Badge>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col md:flex-row gap-4 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by title or ID..."
            className="pl-10"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
        </div>
        {isDepartmentUser && (
          <Select value={sortBy} onValueChange={(v: 'date' | 'priority' | 'area') => setSortBy(v)}>
            <SelectTrigger className="w-full md:w-[160px]">
              <SelectValue placeholder="Sort by" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="date">Sort by Date</SelectItem>
              <SelectItem value="priority">Sort by Priority</SelectItem>
              <SelectItem value="area">Sort by Area</SelectItem>
            </SelectContent>
          </Select>
        )}
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            {statusFilters.map((status) => (
              <SelectItem key={status.value} value={status.value}>
                {status.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full md:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {complaintCategories.map((cat) => (
              <SelectItem key={cat.value} value={cat.value}>
                <span className="flex items-center gap-2">
                  <span>{cat.icon}</span>
                  {cat.label}
                </span>
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Complaints List */}
      <div className="space-y-4">
        {filteredComplaints.length > 0 ? (
          filteredComplaints.map((complaint, index) => (
            <div
              key={complaint.id}
              style={{ animationDelay: `${index * 50}ms` }}
              className="animate-slide-up"
            >
              <ComplaintCard complaint={complaint} />
            </div>
          ))
        ) : (
          <div className="rounded-xl border border-dashed border-border bg-card p-12 text-center">
            <Filter className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No complaints found</h3>
            <p className="text-sm text-muted-foreground mb-4">
              {complaints?.length === 0
                ? "You haven't filed any complaints yet."
                : 'Try adjusting your filters or search query.'}
            </p>
            {user?.role === 'citizen' && complaints?.length === 0 && (
              <Link to="/complaints/new">
                <Button variant="accent">
                  <PlusCircle className="mr-2 h-5 w-5" />
                  File Your First Complaint
                </Button>
              </Link>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
