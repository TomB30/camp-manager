/**
 * Certifications Service
 * Handles all certification-related operations
 */

import type { Certification } from "@/types";
import { storageService } from "./storage";
import { STORAGE_KEYS } from "./storageKeys";

class CertificationsService {
  /**
   * Get all certifications
   */
  async getCertifications(): Promise<Certification[]> {
    return storageService.getAll<Certification>(STORAGE_KEYS.CERTIFICATIONS);
  }

  /**
   * Get a certification by ID
   */
  async getCertification(id: string): Promise<Certification | null> {
    return storageService.getById<Certification>(
      STORAGE_KEYS.CERTIFICATIONS,
      id,
    );
  }

  /**
   * Save a certification (create or update)
   */
  async saveCertification(
    certification: Certification,
  ): Promise<Certification> {
    const updatedCertification = {
      ...certification,
      updatedAt: new Date().toISOString(),
    };
    return storageService.save<Certification>(
      STORAGE_KEYS.CERTIFICATIONS,
      updatedCertification,
    );
  }

  /**
   * Delete a certification
   */
  async deleteCertification(id: string): Promise<void> {
    return storageService.delete(STORAGE_KEYS.CERTIFICATIONS, id);
  }

  /**
   * Get certifications that require expiration
   */
  async getCertificationsWithExpiration(): Promise<Certification[]> {
    const certifications = await this.getCertifications();
    return certifications.filter(
      (c) => c.validityPeriodMonths && c.validityPeriodMonths > 0,
    );
  }
}

export const certificationsService = new CertificationsService();
