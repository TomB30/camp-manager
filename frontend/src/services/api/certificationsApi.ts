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

async function listCertifications(): Promise<Certification[]> {
  const response = await sdk.listCertifications({
    client: apiClient,
    path: { camp_id: getApiCampId() },
  });

  if (response.error) {
    throw new Error("Failed to fetch certifications");
  }

  return response.data?.items || [];
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
