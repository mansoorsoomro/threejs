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
  const url = `/data/scene-questions.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch scene questions: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching scene questions:', error);
    return []; // Return empty array as fallback
  }
};

/**
 * Fetch openings
 */
export const fetchOpenings = async (): Promise<Opening[]> => {
  const url = `/data/openings.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch openings: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching openings:', error);
    return []; // Return empty array as fallback
  }
};

/**
 * Fetch loadings by zip code
 */
export const fetchLoadings = async (zipCode: string): Promise<Loadings> => {
  const url = `/data/loadings.json`;

  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`Failed to fetch loadings: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('Error fetching loadings:', error);
    // Return default loadings as fallback
    return {
      topChordLiveLoad: 20,
      topChordDeadLoad: 5,
      bottomChordLiveLoad: 0,
      bottomChordDeadLoad: 5,
      groundSnowLoad: 30,
      windLoad: 115
    };
  }
};

