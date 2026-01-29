// Pricing configuration - editable by admin
export interface PricingConfig {
  basePricePerSqFt: number;
  trussSpacing: {
    '4': number;
    '6': number;
    '8': number;
    '9': number;
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
    'flat': number;
    'bookshelf': number;
    'double': number;
  };
  gradeBoard: {
    '2x6': number;
    '2x8': number;
    '2x10': number;
    '2x6-centermatch': number;
    '2x6-fusion-centermatch': number;
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
    '9': 0.88,
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
    'flat': 2.5,
    'bookshelf': 3.5,
    'double': 4.5,
  },
  gradeBoard: {
    '2x6': 3.0,
    '2x8': 4.0,
    '2x10': 5.0,
    '2x6-centermatch': 3.5,
    '2x6-fusion-centermatch': 4.0,
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
  girtType: 'flat' | 'bookshelf' | 'double';
  gradeBoard: '2x6' | '2x8' | '2x10' | '2x6-centermatch' | '2x6-fusion-centermatch';
  centermatchRows?: {
    sidewallA: number;
    sidewallB: number;
    endwallC: number;
    endwallD: number;
  };
  endWallOverhang: '0' | '1' | '2';
  sidewallOverhang: '0' | '1' | '2';
  sitePreparation: boolean;
  openings: Array<{ id: string; x: number; y: number; width: number; height: number; price: number }>;
}

export function calculatePrice(specs: BuildingSpecs, config?: PricingConfig): number {
  const pricing = config || getPricing();

  // Safeguard against NaN or invalid dimensions
  const width = specs.width || 0;
  const length = specs.length || 0;

  const sqft = width * length;
  const perimeter = (width + length) * 2;

  let total = 0;

  // Base price
  total += sqft * (pricing.basePricePerSqFt || 0);

  // Truss spacing multiplier - default to 1 if invalid
  const trussMult = pricing.trussSpacing[specs.trussSpacing] ?? 1.0;
  total *= trussMult;

  // Floor finish
  const floorPrice = pricing.floorFinish[specs.floorFinish] ?? 0;
  total += sqft * floorPrice;

  // Thickened edge slab
  if (specs.thickenedEdgeSlab) {
    total += perimeter * (pricing.thickenedEdgeSlab || 0);
  }

  // Post construction slab
  if (specs.postConstructionSlab) {
    total += sqft * (pricing.postConstructionSlab || 0);
  }

  // Sidewall posts (estimate based on spacing)
  const postSpacing = 8; // feet between posts
  const numPosts = Math.ceil(perimeter / postSpacing);
  const postPrice = pricing.sidewallPosts[specs.sidewallPosts] ?? 0;
  total += numPosts * postPrice;

  // Clear height multiplier - default to 1.0 if not found
  const heightMult = pricing.clearHeight[specs.clearHeight] ?? 1.0;
  total *= heightMult;

  // Girt type
  const girtPrice = pricing.girtType[specs.girtType] ?? 0;
  total += perimeter * girtPrice;

  // Grade board
  const gradeBoardPrice = pricing.gradeBoard[specs.gradeBoard] ?? 0;
  total += perimeter * gradeBoardPrice;

  // Overhangs
  const endWallOverhangPrice = pricing.overhang[specs.endWallOverhang] ?? 0;
  total += width * 2 * endWallOverhangPrice;

  const sidewallOverhangPrice = pricing.overhang[specs.sidewallOverhang] ?? 0;
  total += length * 2 * sidewallOverhangPrice;

  // Site preparation
  if (specs.sitePreparation) {
    total += (pricing.sitePreparation || 0);
  }

  // Openings (windows and doors)
  if (specs.openings && specs.openings.length > 0) {
    specs.openings.forEach(opening => {
      // Ensure opening price is a number
      total += (opening.price || 0);
    });
  }

  // Final NaN check
  if (isNaN(total)) {
    return 0;
  }

  return Math.round(total);
}

