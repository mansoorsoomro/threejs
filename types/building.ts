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
  gradeBoard: '2x6' | '2x8' | '2x10' | '2x6-centermatch' | '2x6-fusion-centermatch';
  girtType: 'flat' | 'bookshelf' | 'double';
  girtSize: '2x4' | '2x6';
  centermatchRows?: {
    sidewallA: number;
    sidewallB: number;
    endwallC: number;
    endwallD: number;
  };
  wallColor: string;
  interiorWallLiner?: string;
  interiorWallLinerColor?: string;
  roofCondensation?: string;
  ceilingInsulation?: string;
  ceilingLiner?: string;
  ceilingLinerColor?: string;
  ridgeOptions?: string;

  // Wainscot
  trimColor: string;
  roofColor: string;
  soffitColor?: string;
  endWallOverhang: '0' | '1' | '2';
  sidewallOverhang: '0' | '1' | '2';
  postFoundation?: 'Post Embedded' | 'Secured to Concrete';
  postEmbedmentDepth?: '4 ft' | '6 ft';
  footingSize?: string;
  fasciaSize?: '4' | '6' | '8';
  fastenerLocation?: 'Wall & Roof' | 'Wall Only' | 'Roof Only';
  miniPrintOption?: 'Standard' | 'Premium';
  openings: Opening[];
  openWalls?: {
    isOpen: boolean;
    sideWallA: boolean;
    sideWallB: boolean;
    endWallC: boolean;
    endWallD: boolean;
    removeEveryOtherPost: boolean;
  };
  gableAccent?: boolean;
  gableAccentColor?: string;
  gableAccentEndWallC?: boolean;
  gableAccentEndWallD?: boolean;
  wainscot?: boolean;
  wainscotColor?: string;
  wainscotHeight?: string;
  wainscotSideWallA?: boolean;
  wainscotSideWallB?: boolean;
  wainscotEndWallC?: boolean;
  wainscotEndWallD?: boolean;
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

