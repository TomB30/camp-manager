/**
 * Backend API implementation for Certifications
 */
import * as sdk from "@/generated/api/sdk.gen";
import type {
  Certification,
  CertificationCreationRequest,
  CertificationUpdateRequest,
} from "@/generated/api";
import { apiClient } from "@/config/api";
import { getApiCampId } from "@/utils/tenantContext";

export const certificationsApi = {
  listCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  getCertificationById,
};

async function listCertifications(params?: {
  limit?: number;
  offset?: number;
  search?: string;
  filterBy?: string[];
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}): Promise<{
  items: Certification[];
  total: number;
  limit: number;
  offset: number;
  next: number | null;
}> {
  const response = await sdk.listCertifications({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    query: params
      ? {
          limit: params.limit,
          offset: params.offset,
          search: params.search,
          filterBy: params.filterBy,
          sortBy: params.sortBy as any,
          sortOrder: params.sortOrder,
        }
      : undefined,
  });

  if (response.error) {
    throw new Error("Failed to fetch certifications");
  }

  return {
    items: response.data?.items || [],
    total: response.data?.total || 0,
    limit: response.data?.limit || 50,
    offset: response.data?.offset || 0,
    next: response.data?.next ?? null,
  };
}

async function createCertification(
  certification: CertificationCreationRequest,
): Promise<Certification> {
  const response = await sdk.createCertification({
    client: apiClient,
    path: { camp_id: getApiCampId() },
    body: certification,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to create certification");
  }

  return response.data;
}

async function updateCertification(
  id: string,
  certification: CertificationUpdateRequest,
): Promise<Certification> {
  const response = await sdk.updateCertificationById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
    body: certification,
  });

  if (response.error || !response.data) {
    throw new Error("Failed to update certification");
  }

  return response.data;
}

async function deleteCertification(id: string): Promise<void> {
  const response = await sdk.deleteCertificationById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    throw new Error("Failed to delete certification");
  }
}

async function getCertificationById(id: string): Promise<Certification | null> {
  const response = await sdk.getCertificationById({
    client: apiClient,
    path: { camp_id: getApiCampId(), id },
  });

  if (response.error) {
    return null;
  }

  return response.data || null;
}
