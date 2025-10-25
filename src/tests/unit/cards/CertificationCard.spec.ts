import { describe, it, expect } from "vitest";
import { createWrapper } from "@/tests/utils";
import CertificationCard from "@/components/cards/CertificationCard.vue";
import { certificationsFixture } from "@/tests/fixtures";

describe("CertificationCard", () => {
  describe("Rendering", () => {
    it("renders certification name correctly", () => {
      const certification = certificationsFixture[0];
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      expect(wrapper.text()).toContain(certification.name);
    });

    it("renders description when provided", () => {
      const certification = certificationsFixture[0];
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      if (certification.description) {
        expect(wrapper.text()).toContain(certification.description);
      }
    });

    it("does not show description when not provided", () => {
      const certification = {
        ...certificationsFixture[0],
        description: undefined,
      };
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      expect(wrapper.find(".card-description").exists()).toBe(false);
    });
  });

  describe("Validity Period Display", () => {
    it("shows time-limited badge for certifications with validity period", () => {
      const certification = certificationsFixture[0]; // Has validity period
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      expect(wrapper.text()).toContain("Time-limited");
    });

    it("shows permanent badge for certifications without validity period", () => {
      const certification = certificationsFixture[3]; // No validity period
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      expect(wrapper.text()).toContain("Permanent");
    });

    it("displays validity period in months when present", () => {
      const certification = certificationsFixture[0];
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      if (certification.validityPeriodMonths) {
        expect(wrapper.text()).toContain(
          `${certification.validityPeriodMonths}mo`,
        );
      }
    });

    it("shows valid for months text when validity period exists", () => {
      const certification = certificationsFixture[0];
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      if (certification.validityPeriodMonths) {
        expect(wrapper.text()).toContain(
          `Valid for ${certification.validityPeriodMonths} months`,
        );
      }
    });

    it("does not show validity details for permanent certifications", () => {
      const certification = certificationsFixture[3];
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      expect(wrapper.find(".card-stats").exists()).toBe(false);
    });
  });

  describe("Badge Styling", () => {
    it("applies warning badge class for time-limited certifications", () => {
      const certification = certificationsFixture[0];
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      const badge = wrapper.find(".badge-warning");
      expect(badge.exists()).toBe(true);
    });

    it("applies success badge class for permanent certifications", () => {
      const certification = certificationsFixture[3];
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      const badge = wrapper.find(".badge-success");
      expect(badge.exists()).toBe(true);
    });
  });

  describe("Icon and Styling", () => {
    it("applies icon color", () => {
      const certification = certificationsFixture[0];
      const wrapper = createWrapper(CertificationCard, {
        props: {
          certification,
          iconColor: "#FF0000",
        },
      });

      const cardIcon = wrapper.find(".card-icon");
      const style = cardIcon.attributes("style");
      expect(style).toContain("background");
      expect(
        style?.includes("#FF0000") || style?.includes("rgb(255, 0, 0)"),
      ).toBe(true);
    });

    it("uses default icon color when not provided", () => {
      const certification = certificationsFixture[0];
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      expect(wrapper.find(".card-icon").exists()).toBe(true);
    });

    it("has card-clickable class", () => {
      const certification = certificationsFixture[0];
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      expect(wrapper.classes()).toContain("card-clickable");
    });

    it("has certification-card class", () => {
      const certification = certificationsFixture[0];
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      expect(wrapper.classes()).toContain("certification-card");
    });
  });

  describe("Icons", () => {
    it("displays award icon", () => {
      const certification = certificationsFixture[0];
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      const icon = wrapper.findComponent({ name: "Icon" });
      expect(icon.exists()).toBe(true);
    });

    it("displays clock icon for time-limited certifications", () => {
      const certification = certificationsFixture[0];
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      const icons = wrapper.findAllComponents({ name: "Icon" });
      expect(icons.length).toBeGreaterThan(1);
    });
  });

  describe("Click Event", () => {
    it("emits click event when card is clicked", async () => {
      const certification = certificationsFixture[0];
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("click")).toBeTruthy();
    });
  });

  describe("Edge Cases", () => {
    it("handles very long validity periods", () => {
      const certification = {
        ...certificationsFixture[0],
        validityPeriodMonths: 999,
      };
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      expect(wrapper.text()).toContain("999mo");
      expect(wrapper.text()).toContain("Valid for 999 months");
    });

    it("handles certification with zero validity period", () => {
      const certification = {
        ...certificationsFixture[0],
        validityPeriodMonths: 0,
      };
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      expect(wrapper.text()).toContain("Permanent");
    });
  });
});
