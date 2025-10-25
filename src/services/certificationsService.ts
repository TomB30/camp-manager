import type {
  Certification,
  CertificationCreationRequest,
  CertificationUpdateRequest,
} from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export const certificationsService = {
  listCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  getCertificationById,
  getCertificationsWithExpiration,
};

async function listCertifications(): Promise<Certification[]> {
  return storageService.getAll<Certification>(STORAGE_KEYS.CERTIFICATIONS);
}

async function createCertification(
  certification: CertificationCreationRequest,
): Promise<Certification> {
  const newCertification = {
    ...certification,
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
  return storageService.save<Certification>(
    STORAGE_KEYS.CERTIFICATIONS,
    newCertification,
  );
}

async function updateCertification(
  id: string,
  certification: CertificationUpdateRequest,
): Promise<Certification> {
  const existingCertification = await storageService.getById<Certification>(
    STORAGE_KEYS.CERTIFICATIONS,
    id,
  );
  if (!existingCertification) {
    throw new Error(`Certification with id ${id} not found`);
  }
  const updatedCertification = {
    ...existingCertification,
    ...certification,
    updatedAt: new Date().toISOString(),
  };
  return storageService.save<Certification>(
    STORAGE_KEYS.CERTIFICATIONS,
    updatedCertification,
  );
}

async function deleteCertification(id: string): Promise<void> {
  return storageService.delete(STORAGE_KEYS.CERTIFICATIONS, id);
}

async function getCertificationById(id: string): Promise<Certification | null> {
  return storageService.getById<Certification>(STORAGE_KEYS.CERTIFICATIONS, id);
}

async function getCertificationsWithExpiration(): Promise<Certification[]> {
  const certifications = await listCertifications();
  return certifications.filter(
    (c) => c.validityPeriodMonths && c.validityPeriodMonths > 0,
  );
}
