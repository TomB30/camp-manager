import { defineStore } from 'pinia';
import type { Certification } from '@/types';
import { certificationsService } from '@/services';

export const useCertificationsStore = defineStore('certifications', {
  state: () => ({
    certifications: [] as Certification[],
    loading: false,
  }),

  getters: {
    getCertificationById(state): (id: string) => Certification | undefined {
      return (id: string): Certification | undefined => {
        return state.certifications.find(c => c.id === id);
      };
    },

    certificationsWithExpiration(state): Certification[] {
      return state.certifications.filter(c => c.expirationRequired);
    },
  },

  actions: {
    async loadCertifications(): Promise<void> {
      this.loading = true;
      try {
        this.certifications = await certificationsService.getCertifications();
      } finally {
        this.loading = false;
      }
    },

    async addCertification(certification: Certification): Promise<void> {
      await certificationsService.saveCertification(certification);
      this.certifications.push(certification);
    },

    async updateCertification(certification: Certification): Promise<void> {
      await certificationsService.saveCertification(certification);
      const index = this.certifications.findIndex(c => c.id === certification.id);
      if (index >= 0) {
        this.certifications[index] = certification;
      }
    },

    async deleteCertification(id: string): Promise<void> {
      await certificationsService.deleteCertification(id);
      this.certifications = this.certifications.filter(c => c.id !== id);
    },
  }
});

