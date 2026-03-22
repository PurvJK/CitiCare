import { useEffect, useMemo, useState } from 'react';
import { formatDistanceToNow } from 'date-fns';
import { AlertTriangle, Bell, Loader2, Megaphone, Zap } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import {
  AnnouncementItem,
  AnnouncementPriority,
  useAnnouncements,
  useCreateAnnouncement,
} from '@/hooks/useAnnouncements';
import { useDepartments } from '@/hooks/useComplaints';
import { useAreas } from '@/hooks/useLocations';
import { useToast } from '@/hooks/use-toast';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

const DEPARTMENT_ICON_MAP: Record<string, JSX.Element> = {
  water: <span aria-hidden="true">💧</span>,
  electricity: <span aria-hidden="true">⚡</span>,
  road: <span aria-hidden="true">🛣</span>,
};

function getDepartmentIcon(departmentType: string | null): JSX.Element {
  const key = (departmentType || '').toLowerCase();
  if (key.includes('water')) return DEPARTMENT_ICON_MAP.water;
  if (key.includes('electric')) return DEPARTMENT_ICON_MAP.electricity;
  if (key.includes('road')) return DEPARTMENT_ICON_MAP.road;
  return <Bell className="h-4 w-4" />;
}

function priorityBadgeVariant(priority: AnnouncementPriority) {
  if (priority === 'High') return 'destructive';
  if (priority === 'Medium') return 'warning';
  return 'secondary';
}

function AnnouncementCard({ item }: { item: AnnouncementItem }) {
  const isHigh = item.priority === 'High';

  return (
    <Card
      className={[
        'transition-all',
        isHigh ? 'border-destructive/40 bg-destructive/5 shadow-sm' : 'border-border',
      ].join(' ')}
    >
      <CardHeader className="pb-3">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <CardTitle className="text-lg text-[#06038D]">{item.title}</CardTitle>
            <p className="mt-1 text-sm text-muted-foreground">
              Announced by {item.announcedBy}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {item.departmentType && (
              <Badge variant="outline" className="gap-1">
                {getDepartmentIcon(item.departmentType)}
                <span>{item.departmentType}</span>
              </Badge>
            )}
            <Badge variant={priorityBadgeVariant(item.priority) as any}>{item.priority}</Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {isHigh && (
          <div className="rounded-md border border-destructive/30 bg-destructive/10 px-3 py-2 text-sm text-destructive">
            <div className="flex items-center gap-2 font-medium">
              <AlertTriangle className="h-4 w-4" />
              Important alert
            </div>
          </div>
        )}

        <p className="text-sm leading-relaxed text-foreground">{item.description}</p>

        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
          <span>Area: {item.area || 'City-wide'}</span>
          <span>Role: {item.role}</span>
          <span>
            {formatDistanceToNow(new Date(item.createdAt), {
              addSuffix: true,
            })}
          </span>
        </div>
      </CardContent>
    </Card>
  );
}

export function AnnouncementPanel() {
  const { user } = useAuth();
  const { toast } = useToast();

  const canCreate = user?.role === 'admin' || user?.role === 'department_head';

  const [departmentFilter, setDepartmentFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<AnnouncementPriority>('Medium');
  const [area, setArea] = useState('City-wide');

  const { data: announcements, isLoading } = useAnnouncements({
    departmentType: departmentFilter,
    priority: priorityFilter,
    area: areaFilter,
  });
  const { data: allAnnouncements } = useAnnouncements();
  const { data: allDepartments } = useDepartments();
  const { data: allAreas } = useAreas();

  const createAnnouncement = useCreateAnnouncement();

  const currentDepartmentType = useMemo(() => {
    if (user?.role !== 'department_head' || !user.department_id) return '';

    const dept = (allDepartments || []).find((d) => d.id === user.department_id);
    return (dept?.category || dept?.name || dept?.code || '').trim();
  }, [allDepartments, user?.department_id, user?.role]);

  useEffect(() => {
    if (user?.role === 'department_head' && currentDepartmentType) {
      setDepartmentFilter(currentDepartmentType);
    }
  }, [currentDepartmentType, user?.role]);

  const departmentOptions = useMemo(() => {
    if (user?.role === 'department_head' && currentDepartmentType) {
      return [currentDepartmentType];
    }

    const fromDepartments = (allDepartments || [])
      .map((d) => d.category || d.name)
      .filter((d): d is string => Boolean(d?.trim()));

    const fromAnnouncements = (announcements || [])
      .map((a) => a.departmentType)
      .filter((d): d is string => Boolean(d?.trim()));

    const merged = [...fromDepartments, ...fromAnnouncements].reduce<string[]>((acc, value) => {
      const exists = acc.some((item) => item.toLowerCase() === value.toLowerCase());
      if (!exists) acc.push(value);
      return acc;
    }, []);

    return merged.sort((a, b) => a.localeCompare(b));
  }, [announcements, allDepartments, currentDepartmentType, user?.role]);

  const areaOptions = useMemo(() => {
    const fromAnnouncements = (allAnnouncements || [])
      .map((a) => a.area)
      .filter((a): a is string => Boolean(a?.trim()));

    const merged = ['City-wide', ...fromAnnouncements].reduce<string[]>((acc, value) => {
      const exists = acc.some((item) => item.toLowerCase() === value.toLowerCase());
      if (!exists) acc.push(value);
      return acc;
    }, []);

    return merged.sort((a, b) => {
      if (a.toLowerCase() === 'city-wide') return -1;
      if (b.toLowerCase() === 'city-wide') return 1;
      return a.localeCompare(b);
    });
  }, [allAnnouncements]);

  const publishAreaOptions = useMemo(() => {
    const fromMasterAreas = (allAreas || [])
      .map((a) => a.name)
      .filter((a): a is string => Boolean(a?.trim()));

    const fromAnnouncements = (allAnnouncements || [])
      .map((a) => a.area)
      .filter((a): a is string => Boolean(a?.trim()));

    const merged = ['City-wide', ...fromMasterAreas, ...fromAnnouncements].reduce<string[]>((acc, value) => {
      const exists = acc.some((item) => item.toLowerCase() === value.toLowerCase());
      if (!exists) acc.push(value);
      return acc;
    }, []);

    return merged.sort((a, b) => {
      if (a.toLowerCase() === 'city-wide') return -1;
      if (b.toLowerCase() === 'city-wide') return 1;
      return a.localeCompare(b);
    });
  }, [allAreas, allAnnouncements]);

  const onCreate = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !description.trim()) {
      toast({
        title: 'Missing details',
        description: 'Title and description are required.',
        variant: 'destructive',
      });
      return;
    }

    try {
      await createAnnouncement.mutateAsync({
        title: title.trim(),
        description: description.trim(),
        priority,
        area: user?.role === 'admin' ? 'City-wide' : area.trim() || 'City-wide',
      });

      setTitle('');
      setDescription('');
      setPriority('Medium');
      setArea('City-wide');

      toast({
        title: 'Announcement published',
        description: 'Your announcement is now visible to users.',
      });
    } catch (error: any) {
      toast({
        title: 'Failed to publish',
        description: error?.response?.data?.error || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <section id="announcements" className="space-y-4">
      <div className="flex items-center gap-2">
        <Megaphone className="h-5 w-5 text-[#06038D]" />
        <h2 className="text-lg font-semibold text-[#06038D]">Announcements</h2>
      </div>

      {canCreate && (
        <Card className="border-[#06038D]/15">
          <CardHeader>
            <CardTitle className="text-base">Create Announcement</CardTitle>
            {user?.role === 'department_head' && (
              <p className="text-sm text-muted-foreground">
                Department type is auto-filled from your assigned department.
              </p>
            )}
          </CardHeader>
          <CardContent>
            <form className="grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onCreate}>
              {user?.role === 'department_head' && (
                <div className="space-y-2 md:col-span-2">
                  <Label htmlFor="announcement-department">Department</Label>
                  <Input
                    id="announcement-department"
                    value={currentDepartmentType || 'Assigned Department'}
                    disabled
                  />
                </div>
              )}

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="announcement-title">Title</Label>
                <Input
                  id="announcement-title"
                  placeholder="Water supply interruption in Zone 3"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                />
              </div>

              <div className="space-y-2 md:col-span-2">
                <Label htmlFor="announcement-description">Description</Label>
                <Textarea
                  id="announcement-description"
                  placeholder="Provide details of impact, timeline, and guidance for citizens."
                  rows={4}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                <Label>Priority</Label>
                <Select value={priority} onValueChange={(value) => setPriority(value as AnnouncementPriority)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select priority" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="High">High</SelectItem>
                    <SelectItem value="Medium">Medium</SelectItem>
                    <SelectItem value="Low">Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="announcement-area">Area</Label>
                {user?.role === 'admin' ? (
                  <Input
                    id="announcement-area"
                    value="City-wide"
                    disabled
                  />
                ) : (
                  <Select value={area} onValueChange={setArea}>
                    <SelectTrigger id="announcement-area">
                      <SelectValue placeholder="Select area" />
                    </SelectTrigger>
                    <SelectContent>
                      {publishAreaOptions.map((itemArea) => (
                        <SelectItem key={itemArea} value={itemArea}>
                          {itemArea}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                )}
              </div>

              <div className="md:col-span-2">
                <Button type="submit" disabled={createAnnouncement.isPending} className="bg-[#06038D] hover:bg-[#06038D]/90">
                  {createAnnouncement.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Zap className="mr-2 h-4 w-4" />
                      Publish Announcement
                    </>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
            <div className="space-y-2">
              <Label>Filter by Department</Label>
              <Select
                value={departmentFilter}
                onValueChange={setDepartmentFilter}
                disabled={user?.role === 'department_head'}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All departments" />
                </SelectTrigger>
                <SelectContent>
                  {user?.role !== 'department_head' && <SelectItem value="all">All departments</SelectItem>}
                  {departmentOptions.map((department) => (
                    <SelectItem key={department} value={department}>
                      {department}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter by Priority</Label>
              <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All priorities" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All priorities</SelectItem>
                  <SelectItem value="High">High</SelectItem>
                  <SelectItem value="Medium">Medium</SelectItem>
                  <SelectItem value="Low">Low</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Filter by Area</Label>
              <Select value={areaFilter} onValueChange={setAreaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="All areas" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All areas</SelectItem>
                  {areaOptions.map((itemArea) => (
                    <SelectItem key={itemArea} value={itemArea}>
                      {itemArea}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {isLoading ? (
        <div className="flex h-32 items-center justify-center">
          <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-3">
          {(announcements || []).map((item) => (
            <AnnouncementCard key={item.id} item={item} />
          ))}
          {(announcements || []).length === 0 && (
            <Card>
              <CardContent className="py-10 text-center text-sm text-muted-foreground">
                No announcements found for the selected filters.
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </section>
  );
}
