// Surat Municipal Corporation (SMC) Administrative Data

export interface Zone {
  id: string;
  name: string;
  code: string;
}

export interface Ward {
  id: string;
  name: string;
  zoneId: string;
  code: string;
}

export interface Area {
  id: string;
  name: string;
  wardId: string;
}

export const suratZones: Zone[] = [
  { id: 'z1', name: 'Central Zone', code: 'CZ' },
  { id: 'z2', name: 'South Zone', code: 'SZ' },
  { id: 'z3', name: 'West Zone', code: 'WZ' },
  { id: 'z4', name: 'East Zone', code: 'EZ' },
  { id: 'z5', name: 'North Zone', code: 'NZ' },
  { id: 'z6', name: 'South-West Zone', code: 'SWZ' },
  { id: 'z7', name: 'South-East Zone', code: 'SEZ' },
];

export const suratWards: Ward[] = [
  // Central Zone
  { id: 'w1', name: 'Nanpura', zoneId: 'z1', code: 'W01' },
  { id: 'w2', name: 'Gopipura', zoneId: 'z1', code: 'W02' },
  { id: 'w3', name: 'Mahidharpura', zoneId: 'z1', code: 'W03' },
  { id: 'w4', name: 'Rander', zoneId: 'z1', code: 'W04' },
  
  // South Zone
  { id: 'w5', name: 'Athwa', zoneId: 'z2', code: 'W05' },
  { id: 'w6', name: 'Udhna', zoneId: 'z2', code: 'W06' },
  { id: 'w7', name: 'Limbayat', zoneId: 'z2', code: 'W07' },
  
  // West Zone
  { id: 'w8', name: 'Adajan', zoneId: 'z3', code: 'W08' },
  { id: 'w9', name: 'Piplod', zoneId: 'z3', code: 'W09' },
  { id: 'w10', name: 'Pal', zoneId: 'z3', code: 'W10' },
  
  // East Zone
  { id: 'w11', name: 'Katargam', zoneId: 'z4', code: 'W11' },
  { id: 'w12', name: 'Varachha', zoneId: 'z4', code: 'W12' },
  { id: 'w13', name: 'Kapodra', zoneId: 'z4', code: 'W13' },
  
  // North Zone
  { id: 'w14', name: 'Pandesara', zoneId: 'z5', code: 'W14' },
  { id: 'w15', name: 'Sachin', zoneId: 'z5', code: 'W15' },
  
  // South-West Zone
  { id: 'w16', name: 'Vesu', zoneId: 'z6', code: 'W16' },
  { id: 'w17', name: 'Althan', zoneId: 'z6', code: 'W17' },
  { id: 'w18', name: 'Bhatar', zoneId: 'z6', code: 'W18' },
  
  // South-East Zone
  { id: 'w19', name: 'Dindoli', zoneId: 'z7', code: 'W19' },
  { id: 'w20', name: 'Bhestan', zoneId: 'z7', code: 'W20' },
];

export const suratAreas: Area[] = [
  // Nanpura
  { id: 'a1', name: 'Nanpura Main Road', wardId: 'w1' },
  { id: 'a2', name: 'Ring Road', wardId: 'w1' },
  { id: 'a3', name: 'Chowk Bazaar', wardId: 'w1' },
  
  // Gopipura
  { id: 'a4', name: 'Gopipura Gate', wardId: 'w2' },
  { id: 'a5', name: 'Salabatpura', wardId: 'w2' },
  
  // Athwa
  { id: 'a6', name: 'Athwa Gate', wardId: 'w5' },
  { id: 'a7', name: 'City Light', wardId: 'w5' },
  { id: 'a8', name: 'Ghod Dod Road', wardId: 'w5' },
  
  // Udhna
  { id: 'a9', name: 'Udhna Darwaja', wardId: 'w6' },
  { id: 'a10', name: 'Udhna GIDC', wardId: 'w6' },
  { id: 'a11', name: 'Bamroli Road', wardId: 'w6' },
  
  // Adajan
  { id: 'a12', name: 'Adajan Patiya', wardId: 'w8' },
  { id: 'a13', name: 'Hazira Road', wardId: 'w8' },
  { id: 'a14', name: 'Adajan Gam', wardId: 'w8' },
  
  // Piplod
  { id: 'a15', name: 'Piplod Crossroad', wardId: 'w9' },
  { id: 'a16', name: 'VIP Road', wardId: 'w9' },
  
  // Vesu
  { id: 'a17', name: 'Vesu Canal Road', wardId: 'w16' },
  { id: 'a18', name: 'Surat-Dumas Road', wardId: 'w16' },
  { id: 'a19', name: 'Vesu Circle', wardId: 'w16' },
  
  // Katargam
  { id: 'a20', name: 'Katargam Darwaja', wardId: 'w11' },
  { id: 'a21', name: 'Amroli', wardId: 'w11' },
  
  // Varachha
  { id: 'a22', name: 'Varachha Main Road', wardId: 'w12' },
  { id: 'a23', name: 'Nana Varachha', wardId: 'w12' },
  { id: 'a24', name: 'Kapodara Cross Road', wardId: 'w12' },
  
  // Rander
  { id: 'a25', name: 'Rander Road', wardId: 'w4' },
  { id: 'a26', name: 'Jahangirpura', wardId: 'w4' },
  
  // Pal
  { id: 'a27', name: 'Pal Gam', wardId: 'w10' },
  { id: 'a28', name: 'Canal Road', wardId: 'w10' },
  
  // Pandesara
  { id: 'a29', name: 'Pandesara GIDC', wardId: 'w14' },
  { id: 'a30', name: 'Ved Road', wardId: 'w14' },
];

// Helper functions
export const getWardsByZone = (zoneId: string): Ward[] => {
  return suratWards.filter((ward) => ward.zoneId === zoneId);
};

export const getAreasByWard = (wardId: string): Area[] => {
  return suratAreas.filter((area) => area.wardId === wardId);
};

export const getZoneById = (zoneId: string): Zone | undefined => {
  return suratZones.find((z) => z.id === zoneId);
};

export const getWardById = (wardId: string): Ward | undefined => {
  return suratWards.find((w) => w.id === wardId);
};

export const getAreaById = (areaId: string): Area | undefined => {
  return suratAreas.find((a) => a.id === areaId);
};

// Surat coordinates
export const SURAT_CENTER = {
  lat: 21.1702,
  lng: 72.8311,
};

export const SURAT_BOUNDS = {
  north: 21.27,
  south: 21.08,
  east: 72.95,
  west: 72.72,
};
