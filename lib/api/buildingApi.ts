/**
 * API service for building-related endpoints
 */

export interface SceneQuestion {
  serviceId: number;
  formId: number;
  tabId: number;
  groupId: number;
  questionId: number;
}

export interface Opening {
  id: number;
  typeId: number | null;
  sizeId: number;
  colorId: number | null;
  glassId: number | null;
  insulationId: number | null;
}

export interface Loadings {
  topChordLiveLoad: number;
  topChordDeadLoad: number;
  bottomChordLiveLoad: number;
  bottomChordDeadLoad: number;
  groundSnowLoad: number;
  windLoad: number;
}

/**
 * Fetch scene questions
 */
export const fetchSceneQuestions = async (): Promise<SceneQuestion[]> => {
  const url = `/api/menards/getSceneQuestions.do`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch scene questions: ${response.status} ${response.statusText}`);
    }

    const data: SceneQuestion[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching scene questions:', error);
    throw error;
  }
};

/**
 * Fetch openings
 */
export const fetchOpenings = async (): Promise<Opening[]> => {
  const url = `/api/menards/getOpenings.do`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch openings: ${response.status} ${response.statusText}`);
    }

    const data: Opening[] = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching openings:', error);
    throw error;
  }
};

/**
 * Fetch loadings by zip code
 */
export const fetchLoadings = async (zipCode: string): Promise<Loadings> => {
  if (zipCode.length !== 5) {
    throw new Error('Zip code must be 5 digits');
  }

  const url = `/api/menards/getLoadings.do?zipCode=${zipCode}`;

  try {
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Accept': 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch loadings: ${response.status} ${response.statusText}`);
    }

    const data: Loadings = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching loadings:', error);
    throw error;
  }
};

