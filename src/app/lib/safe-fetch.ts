/**
 * TRIPLE PROTECTION - PHASE 3: TOTAL RESILIENCE
 * 
 * Ce module garantit que les appels API métier (SIRET, Géocodage, OSRM)
 * ne font jamais planter l'application, même en cas de blocage réseau total
 * par l'environnement Figma.
 */

export async function safeFetch(url: string, options?: RequestInit): Promise<Response> {
  // Sécurité de base sur l'URL
  if (!url || typeof url !== 'string' || !url.startsWith('http')) {
    return createMockResponse();
  }

  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    try {
      controller.abort();
    } catch (e) {}
  }, 10000); // 10 secondes de timeout

  try {
    // Utilise le fetch global (déjà patché dans App.tsx)
    const response = await fetch(url, {
      ...options,
      signal: options?.signal || controller.signal,
    });
    
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    // Retourne une réponse neutre en cas d'erreur (CORS, DNS, Timeout, etc.)
    return createMockResponse();
  }
}

/**
 * Crée une réponse de secours conforme à l'interface Response.
 * Utilise le constructeur natif pour assurer la compatibilité avec instanceof.
 */
function createMockResponse(): Response {
  try {
    // On essaie de créer une vraie réponse JSON vide
    return new Response(JSON.stringify({}), {
      status: 200,
      statusText: 'OK',
      headers: { 'Content-Type': 'application/json' }
    });
  } catch (e) {
    // Fallback ultime si le constructeur Response échoue (très improbable)
    const mock = {
      ok: false,
      status: 0,
      statusText: 'Network Error',
      url: '',
      bodyUsed: false,
      headers: new Headers(),
      json: async () => ({}),
      text: async () => '',
      blob: async () => new Blob([]),
      arrayBuffer: async () => new ArrayBuffer(0),
      formData: async () => new FormData(),
      clone: () => createMockResponse(),
    };
    return mock as unknown as Response;
  }
}
