import type {
  Certification,
  CertificationCreationRequest,
  CertificationUpdateRequest,
} from "@/generated/api";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

export const certificationsService = {
  listCertifications,
  createCertification,
  updateCertification,
  deleteCertification,
  getCertificationById,
};

async function listCertifications(): Promise<Certification[]> {
  return storageService.getAll<Certification>(STORAGE_KEYS.CERTIFICATIONS);
}

async function createCertification(
  certification: CertificationCreationRequest,
): Promise<Certification> {
  const newCertification = {
    meta: {
      id: crypto.randomUUID(),
      name: certification.meta.name,
      description: certification.meta.description,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    spec: certification.spec,
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
    meta: {
      id: existingCertification.meta.id,
      name: certification.meta.name,
      description: certification.meta.description,
      createdAt: existingCertification.meta.createdAt,
      updatedAt: new Date().toISOString(),
    },
    spec: certification.spec,
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
