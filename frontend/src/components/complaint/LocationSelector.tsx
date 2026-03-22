import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useZones, useWards, useAreas } from '@/hooks/useLocations';
import { MapPin, Loader2 } from 'lucide-react';

interface LocationSelectorProps {
  selectedZone: string;
  selectedWard: string;
  selectedArea: string;
  onZoneChange: (zoneId: string) => void;
  onWardChange: (wardId: string) => void;
  onAreaChange: (areaId: string) => void;
}

export function LocationSelector({
  selectedZone,
  selectedWard,
  selectedArea,
  onZoneChange,
  onWardChange,
  onAreaChange,
}: LocationSelectorProps) {
  const { data: zones, isLoading: zonesLoading } = useZones();
  const { data: wards, isLoading: wardsLoading } = useWards(selectedZone || undefined);
  const { data: areas, isLoading: areasLoading } = useAreas(selectedWard || undefined);

  const handleZoneChange = (value: string) => {
    onZoneChange(value);
    onWardChange('');
    onAreaChange('');
  };

  const handleWardChange = (value: string) => {
    onWardChange(value);
    onAreaChange('');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2 text-sm font-medium">
        <MapPin className="h-4 w-4 text-accent" />
        <span>Municipal Corporation Area</span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Zone Selection */}
        <div className="space-y-2">
          <Label htmlFor="zone">Zone *</Label>
          <Select value={selectedZone} onValueChange={handleZoneChange}>
            <SelectTrigger>
              {zonesLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SelectValue placeholder="Select Zone" />
              )}
            </SelectTrigger>
            <SelectContent>
              {zones?.map((zone) => (
                <SelectItem key={zone.id} value={zone.id}>
                  <span className="flex items-center gap-2">
                    <span className="text-xs bg-accent/10 text-accent px-1.5 py-0.5 rounded">
                      {zone.code}
                    </span>
                    {zone.name}
                  </span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Ward Selection */}
        <div className="space-y-2">
          <Label htmlFor="ward">Ward *</Label>
          <Select 
            value={selectedWard} 
            onValueChange={handleWardChange}
            disabled={!selectedZone}
          >
            <SelectTrigger>
              {wardsLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SelectValue placeholder={selectedZone ? "Select Ward" : "Select Zone first"} />
              )}
            </SelectTrigger>
            <SelectContent>
              {wards && wards.length > 0 ? (
                wards.map((ward) => (
                  <SelectItem key={ward.id} value={ward.id}>
                    <span className="flex items-center gap-2">
                      <span className="text-xs bg-secondary text-secondary-foreground px-1.5 py-0.5 rounded">
                        {ward.code}
                      </span>
                      {ward.name}
                    </span>
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No wards available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Area Selection */}
        <div className="space-y-2">
          <Label htmlFor="area">Area / Locality</Label>
          <Select 
            value={selectedArea} 
            onValueChange={onAreaChange}
            disabled={!selectedWard}
          >
            <SelectTrigger>
              {areasLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <SelectValue placeholder={selectedWard ? "Select Area (Optional)" : "Select Ward first"} />
              )}
            </SelectTrigger>
            <SelectContent>
              {areas && areas.length > 0 ? (
                areas.map((area) => (
                  <SelectItem key={area.id} value={area.id}>
                    {area.name}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="none" disabled>No areas available</SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
