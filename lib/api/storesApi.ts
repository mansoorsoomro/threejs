import { Store } from '@/types/building';

const API_BASE_URL = process.env.NEXT_PUBLIC_MENARDS_API_BASE_URL || 'https://external-midwest.menards.com/postframe-web';

export interface MenardsStoreResponse {
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
 * Transform Menards API response to Store format
 */
const transformStore = (store: MenardsStoreResponse['closestStores'][0]): Store => {
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
  if (zipCode.length !== 5) {
    throw new Error('Zip code must be 5 digits');
  }

  // Use Next.js rewrite proxy - calls /api/menards which rewrites to external API
  // This avoids CORS issues without needing a backend API route
  const url = `/api/menards/getClosestStores.do?storesPerPage=10&offset=${offset}&zipCode=${zipCode}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch stores: ${response.status} ${response.statusText}`);
    }

    const data: MenardsStoreResponse = await response.json();

    if (!data.closestStores || data.closestStores.length === 0) {
      return [];
    }

    return data.closestStores.map(transformStore);
  } catch (error) {
    console.error('Error fetching stores:', error);
    throw error;
  }
};

