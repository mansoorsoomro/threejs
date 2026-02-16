import { Store } from '@/types/building';

const API_BASE_URL = process.env.NEXT_PUBLIC_BUILDING_API_BASE_URL || 'https://api.example-supplier.com/building-api';

export interface BuildingStoreResponse {
  inAllowedRegion: boolean;
  count: number;
  closestStores: Array<{
    number: number;
    name: string;
    abbr: string;
    address: {
      street: string;
      city: string;
      cityGroup: string;
      county: string | null;
      state: string;
      zip: string;
      latitude: number;
      longitude: number;
    };
    phoneNumber: string;
    type: string;
    openDate: number[];
    features: (string | null)[];
    distance: number;
    pickupAtStore: boolean;
    shipFromStore: boolean;
  }>;
}

/**
 * Transform API response to Store format
 */
const transformStore = (store: BuildingStoreResponse['closestStores'][0]): Store => {
  const addressParts = [
    store.address.street,
    store.address.city,
    store.address.state,
    store.address.zip,
  ].filter(Boolean);

  return {
    id: store.number.toString(),
    name: store.name,
    address: addressParts.join(', '),
    distance: store.distance,
    phone: store.phoneNumber,
    zipCode: store.address.zip,
  };
};

/**
 * Fetch closest stores by zip code
 * Uses Next.js rewrites to proxy the external API (no CORS issues)
 */
export const fetchStoresByZipCode = async (zipCode: string, offset: number = 1): Promise<Store[]> => {
  const url = `/data/stores.json`;

  try {
    const response = await fetch(url);

    if (!response.ok) {
      throw new Error(`Failed to fetch stores: ${response.status}`);
    }

    const data: Store[] = await response.json();

    // In static mode, we just return the mockup stores
    // Filter by zip if you want to be slightly more realistic
    return data.filter(s => s.zipCode === zipCode || !zipCode);
  } catch (error) {
    console.error('Error fetching stores:', error);
    return [];
  }
};

