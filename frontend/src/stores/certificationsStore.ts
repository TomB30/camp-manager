import { defineStore } from "pinia";
import type {
  Certification,
  CertificationCreationRequest,
  CertificationUpdateRequest,
} from "@/generated/api";
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
    async loadCertifications(params?: {
      limit?: number;
      offset?: number;
      search?: string;
      filterBy?: string[];
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    }): Promise<
      | Certification[]
      | {
          items: Certification[];
          total: number;
          limit: number;
          offset: number;
          next: number | null;
        }
    > {
      this.loading = true;
      try {
        const response = await certificationsService.listCertifications(params);
        this.certifications = Array.isArray(response)
          ? response
          : response.items;
        return response;
      } finally {
        this.loading = false;
      }
    },

    async loadCertificationsPaginated(params?: {
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
      this.loading = true;
      try {
        const response = await certificationsService.listCertifications(params);
        if (Array.isArray(response)) {
          return {
            items: response,
            total: response.length,
            limit: params?.limit || response.length,
            offset: params?.offset || 0,
            next: null,
          };
        }
        this.certifications = response.items;
        return response;
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
