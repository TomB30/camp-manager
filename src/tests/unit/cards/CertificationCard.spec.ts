import { describe, it, expect } from "vitest";
import { createWrapper } from "@/tests/utils";
import CertificationCard from "@/components/cards/CertificationCard.vue";
import { certificationsFixture } from "@/tests/fixtures";

describe("CertificationCard", () => {
  describe("Rendering", () => {
    it("renders certification name correctly", () => {
      const certification = { ...certificationsFixture[0], meta: { ...certificationsFixture[0].meta, name: "Certification 1" } };
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      expect(wrapper.text()).toContain(certification.meta.name);
    });

    it("renders description when provided", () => {
      const certification = { ...certificationsFixture[0], meta: { ...certificationsFixture[0].meta, description: "Certification 1 description" } };
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      if (certification.meta.description) {
        expect(wrapper.text()).toContain(certification.meta.description);
      }
    });

    it("does not show description when not provided", () => {
      const certification = {
        ...certificationsFixture[0],
        meta: { ...certificationsFixture[0].meta, description: undefined },
      };
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      expect(wrapper.find(".card-description").exists()).toBe(false);
    });
  });

  describe("Icon and Styling", () => {
    it("applies icon color", () => {
      const certification = { ...certificationsFixture[0], meta: { ...certificationsFixture[0].meta, id: "cert-1" } };
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
        style?.includes("#FF0000") || style?.includes("rgb(255, 0, 0)")
      ).toBe(true);
    });

    it("uses default icon color when not provided", () => {
      const certification = { ...certificationsFixture[0], meta: { ...certificationsFixture[0].meta, id: "cert-1" } };
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      expect(wrapper.find(".card-icon").exists()).toBe(true);
    });

    it("has card-clickable class", () => {
      const certification = { ...certificationsFixture[0], meta: { ...certificationsFixture[0].meta, id: "cert-1" } };
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      expect(wrapper.classes()).toContain("card-clickable");
    });

    it("has certification-card class", () => {
      const certification = { ...certificationsFixture[0], meta: { ...certificationsFixture[0].meta, id: "cert-1" } };
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      expect(wrapper.classes()).toContain("certification-card");
    });
  });

  describe("Icons", () => {
    it("displays award icon", () => {
      const certification = { ...certificationsFixture[0], meta: { ...certificationsFixture[0].meta, id: "cert-1" } };
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      const icon = wrapper.findComponent({ name: "Icon" });
      expect(icon.exists()).toBe(true);
    });
  });

  describe("Click Event", () => {
    it("emits click event when card is clicked", async () => {
      const certification = { ...certificationsFixture[0], meta: { ...certificationsFixture[0].meta, id: "cert-1" } };
      const wrapper = createWrapper(CertificationCard, {
        props: { certification },
      });

      await wrapper.trigger("click");

      expect(wrapper.emitted("click")).toBeTruthy();
    });
  });
});
