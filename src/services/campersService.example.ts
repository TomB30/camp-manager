/**
 * Example: Using the auto-generated API client
 *
 * This shows how to use the generated types and functions.
 * Delete this file once you understand how it works.
 */

import {
  listCampers,
  createCamper,
  getCamperById,
  updateCamperById,
  deleteCamperById,
  type Camper,
  type CamperCreationRequest,
  type CamperUpdateRequest,
} from "@/generated/api";

/**
 * ✨ IMPORTANT: Configure the base URL first!
 *
 * Option 1: Set it once at app startup
 * ```typescript
 * // In src/main.ts or src/services/apiConfig.ts
 * import { client } from '@/generated/api/client.gen';
 * client.setConfig({
 *   baseUrl: import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api'
 * });
 * ```
 *
 * Option 2: Pass it to each call
 * ```typescript
 * const { data } = await getCampers({
 *   baseUrl: 'http://localhost:3000/api'
 * });
 * ```
 */

// Example service wrapping the generated functions
export const campersServiceExample = {
  /**
   * List all campers
   *
   * What you get:
   * - Fully typed response (Camper[])
   * - Automatic request handling
   * - Error responses typed
   */
  async listCampers(): Promise<Camper[]> {
    const { data, error } = await listCampers();

    if (error) {
      console.error("Error fetching campers:", error);
      throw new Error("Failed to fetch campers");
    }

    return data || [];
  },

  /**
   * Create a new camper
   *
   * What you get:
   * - TypeScript validates your request body at compile time
   * - Autocomplete for all fields
   * - Return type is automatically Camper
   */
  async createCamper(request: CamperCreationRequest): Promise<Camper> {
    const { data, error } = await createCamper({
      body: request,
      // ^^ TypeScript knows exactly what fields are required!
      // Try typing "body: {" and see the autocomplete 🎉
    });

    if (error) {
      throw new Error("Failed to create camper");
    }

    return data!;
  },

  /**
   * Get a single camper by ID
   *
   * What you get:
   * - Path parameters are typed
   * - TypeScript ensures you pass { path: { id: string } }
   */
  async getCamperById(id: string): Promise<Camper | null> {
    const { data, error } = await getCamperById({
      path: { id },
      // ^^ TypeScript knows this endpoint needs an 'id' parameter
    });

    if (error) {
      // You could check error.status === 404 here
      return null;
    }

    return data || null;
  },

  /**
   * Update a camper
   *
   * What you get:
   * - Both path params AND body are typed
   * - Can't mix them up!
   */
  async updateCamper(
    id: string,
    request: CamperUpdateRequest,
  ): Promise<Camper> {
    const { data, error } = await updateCamperById({
      path: { id },
      body: request,
    });

    if (error) {
      throw new Error("Failed to update camper");
    }

    return data!;
  },

  /**
   * Delete a camper
   */
  async deleteCamper(id: string): Promise<void> {
    const { error } = await deleteCamperById({
      path: { id },
    });

    if (error) {
      throw new Error("Failed to delete camper");
    }
  },
};

/**
 * 🎯 Direct Usage Example (without wrapping)
 */
export async function directUsageExample() {
  // Just import and use directly!
  const { data: campers } = await listCampers();
  console.log(campers); // Type: Camper[] | undefined

  // Create a camper with full type safety
  const { data: newCamper } = await createCamper({
    body: {
      meta: {
        name: "Alice Johnson",
        description: "First-time camper",
      },
      spec: {
        age: 10,
        gender: "female",
        sessionId: "session-123",
        familyGroupId: "family-456",
      },
    },
  });

  console.log(newCamper); // Type: Camper | undefined
}

/**
 * 🚀 What You DON'T Need to Do Anymore:
 *
 * ❌ No more: type Camper = components["schemas"]["Camper"]
 * ✅ Just: import { type Camper } from '@/generated/api'
 *
 * ❌ No more: manually writing fetch() calls
 * ✅ Just: await getCampers()
 *
 * ❌ No more: guessing request/response types
 * ✅ Everything is automatically typed from your OpenAPI spec!
 *
 * ❌ No more: manual type validation
 * ✅ TypeScript catches errors at compile time!
 */

/**
 * 🔄 To regenerate after updating your OpenAPI spec:
 *
 * npm run generate-client
 *
 * That's it! All types and functions update automatically.
 */
