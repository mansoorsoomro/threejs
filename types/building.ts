export interface Store {
  id: string;
  name: string;
  address: string;
  distance: number; // in miles
  phone: string;
  zipCode: string;
}

export interface BuildingDesign {
  // Store Selection
  buildingZipCode?: string;
  selectedStore?: Store;
  
  // Client Information
  clientName: string;
  clientAddress: string;
  buildingUse: 'residential' | 'storage' | 'agricultural' | 'barndominium';
  width: number;
  length: number;
  // Truss spacing in feet
  trussSpacing: '4' | '6' | '8' | '9';
  // Optional: framing and roof configuration for more accurate 3D representation
  framingType?: 'post-frame-construction' | 'ladder-frame-construction';
  roofPitch?: '4/12' | '6/12';
  floorFinish: 'dirt-gravel' | 'concrete';
  thickenedEdgeSlab: boolean;
  postConstructionSlab: boolean;
  sitePreparation: boolean;
  sidewallPosts: '4x6' | '6x6' | 'columns';
  clearHeight: '8' | '10' | '12' | '14' | '16' | '18' | '20';
  girtType: '2x4' | '2x6';
  gradeBoard: '2x6' | '2x8';
  wallColor: string;
  trimColor: string;
  roofColor: string;
  endWallOverhang: '0' | '1' | '2';
  sidewallOverhang: '0' | '1' | '2';
  openings: Opening[];
}

export interface Opening {
  id: string;
  type: 'window' | 'door';
  x: number; // position on wall (0-100%)
  y: number; // position on wall (0-100%)
  width: number; // feet
  height: number; // feet
  name: string;
  price: number;
  wall: 'front' | 'back' | 'left' | 'right';
}

