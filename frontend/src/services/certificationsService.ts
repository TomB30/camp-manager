/**
 * Unified Certifications Service
 * Routes to either backend API or local storage based on configuration
 */
import { isBackendEnabled } from "@/config/dataSource";
import { certificationsStorage } from "./certificationsStorage";
import { certificationsApi } from "./api/certificationsApi";
import type {
  Certification,
  CertificationCreationRequest,
  CertificationUpdateRequest,
} from "@/generated/api";

const impl = () =>
  isBackendEnabled() ? certificationsApi : certificationsStorage;

export const certificationsService = {
  listCertifications: (): Promise<Certification[]> =>
    impl().listCertifications(),
  createCertification: (
    data: CertificationCreationRequest,
  ): Promise<Certification> => impl().createCertification(data),
  updateCertification: (
    id: string,
    data: CertificationUpdateRequest,
  ): Promise<Certification> => impl().updateCertification(id, data),
  deleteCertification: (id: string): Promise<void> =>
    impl().deleteCertification(id),
  getCertificationById: (id: string): Promise<Certification | null> =>
    impl().getCertificationById(id),
};
