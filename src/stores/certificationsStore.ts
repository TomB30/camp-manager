import { defineStore } from "pinia";
import type {
  Certification,
  CertificationCreationRequest,
  CertificationUpdateRequest,
} from "@/types";
import { certificationsService } from "@/services";

export const useCertificationsStore = defineStore("certifications", {
  state: () => ({
    certifications: [] as Certification[],
    loading: false,
  }),

  getters: {
    getCertificationById(state): (id: string) => Certification | undefined {
      return (id: string): Certification | undefined => {
        return state.certifications.find((c) => c.meta.id === id);
      };
    },
  },

  actions: {
    async loadCertifications(): Promise<void> {
      this.loading = true;
      try {
        this.certifications = await certificationsService.listCertifications();
      } finally {
        this.loading = false;
      }
    },

    async createCertification(
      certificationRequest: CertificationCreationRequest,
    ): Promise<Certification> {
      const certification: Certification =
        await certificationsService.createCertification(certificationRequest);
      this.certifications.push(certification);
      return certification;
    },

    async updateCertification(
      id: string,
      certificationUpdate: CertificationUpdateRequest,
    ): Promise<void> {
      const certification: Certification =
        await certificationsService.updateCertification(
          id,
          certificationUpdate,
        );
      const index = this.certifications.findIndex((c) => c.meta.id === id);
      if (index >= 0) {
        this.certifications[index] = certification;
      }
    },

    async deleteCertification(id: string): Promise<void> {
      await certificationsService.deleteCertification(id);
      this.certifications = this.certifications.filter((c) => c.meta.id !== id);
    },
  },
});
