// Pricing configuration - editable by admin
export interface PricingConfig {
  basePricePerSqFt: number;
  trussSpacing: {
    '4': number;
    '6': number;
    '8': number;
  };
  floorFinish: {
    'dirt-gravel': number;
    'concrete': number;
  };
  thickenedEdgeSlab: number; // per linear foot
  postConstructionSlab: number; // per sqft
  sidewallPosts: {
    '4x6': number; // per post
    '6x6': number; // per post
    'columns': number; // per post
  };
  clearHeight: {
    '8': number; // multiplier
    '10': number;
    '12': number;
    '14': number;
    '16': number;
    '18': number;
    '20': number;
  };
  girtType: {
    '2x4': number; // per linear foot
    '2x6': number; // per linear foot
  };
  gradeBoard: {
    '2x6': number; // per linear foot
    '2x8': number; // per linear foot
  };
  overhang: {
    '0': number;
    '1': number; // per linear foot
    '2': number; // per linear foot
  };
  sitePreparation: number; // flat fee
}

// Default pricing - can be updated via admin panel
export const defaultPricing: PricingConfig = {
  basePricePerSqFt: 15,
  trussSpacing: {
    '4': 1.0,
    '6': 0.95,
    '8': 0.90,
  },
  floorFinish: {
    'dirt-gravel': 0,
    'concrete': 3.5,
  },
  thickenedEdgeSlab: 12,
  postConstructionSlab: 4.5,
  sidewallPosts: {
    '4x6': 45,
    '6x6': 65,
    'columns': 120,
  },
  clearHeight: {
    '8': 1.0,
    '10': 1.15,
    '12': 1.30,
    '14': 1.45,
    '16': 1.60,
    '18': 1.75,
    '20': 1.90,
  },
  girtType: {
    '2x4': 2.5,
    '2x6': 3.5,
  },
  gradeBoard: {
    '2x6': 3.0,
    '2x8': 4.0,
  },
  overhang: {
    '0': 0,
    '1': 8,
    '2': 15,
  },
  sitePreparation: 500,
};

// Load pricing from localStorage or use default
export function getPricing(): PricingConfig {
  if (typeof window !== 'undefined') {
    const stored = localStorage.getItem('pricing-config');
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        return defaultPricing;
      }
    }
  }
  return defaultPricing;
}

// Save pricing to localStorage
export function savePricing(pricing: PricingConfig): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('pricing-config', JSON.stringify(pricing));
  }
}

// Calculate total price based on building specifications
export interface BuildingSpecs {
  width: number;
  length: number;
  trussSpacing: '4' | '6' | '8' | '9';
  floorFinish: 'dirt-gravel' | 'concrete';
  thickenedEdgeSlab: boolean;
  postConstructionSlab: boolean;
  sidewallPosts: '4x6' | '6x6' | 'columns';
  clearHeight: '8' | '10' | '12' | '14' | '16' | '18' | '20';
  girtType: '2x4' | '2x6';
  gradeBoard: '2x6' | '2x8';
  endWallOverhang: '0' | '1' | '2';
  sidewallOverhang: '0' | '1' | '2';
  sitePreparation: boolean;
  openings: Array<{ id: string; x: number; y: number; width: number; height: number; price: number }>;
}

export function calculatePrice(specs: BuildingSpecs): number {
  const pricing = getPricing();
  const sqft = specs.width * specs.length;
  const perimeter = (specs.width + specs.length) * 2;
  
  let total = 0;
  
  // Base price
  total += sqft * pricing.basePricePerSqFt;
  
  // Truss spacing multiplier
  total *= pricing.trussSpacing[specs.trussSpacing];
  
  // Floor finish
  total += sqft * pricing.floorFinish[specs.floorFinish];
  
  // Thickened edge slab
  if (specs.thickenedEdgeSlab) {
    total += perimeter * pricing.thickenedEdgeSlab;
  }
  
  // Post construction slab
  if (specs.postConstructionSlab) {
    total += sqft * pricing.postConstructionSlab;
  }
  
  // Sidewall posts (estimate based on spacing)
  const postSpacing = 8; // feet between posts
  const numPosts = Math.ceil(perimeter / postSpacing);
  total += numPosts * pricing.sidewallPosts[specs.sidewallPosts];
  
  // Clear height multiplier
  total *= pricing.clearHeight[specs.clearHeight];
  
  // Girt type
  total += perimeter * pricing.girtType[specs.girtType];
  
  // Grade board
  total += perimeter * pricing.gradeBoard[specs.gradeBoard];
  
  // Overhangs
  total += specs.width * 2 * pricing.overhang[specs.endWallOverhang];
  total += specs.length * 2 * pricing.overhang[specs.sidewallOverhang];
  
  // Site preparation
  if (specs.sitePreparation) {
    total += pricing.sitePreparation;
  }
  
  // Openings (windows and doors)
  if (specs.openings && specs.openings.length > 0) {
    specs.openings.forEach(opening => {
      total += opening.price;
    });
  }
  
  return Math.round(total);
}

