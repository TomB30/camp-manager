/**
 * Custom assertion helpers for tests
 */

import { VueWrapper } from "@vue/test-utils";
import { Store } from "pinia";
import { expect } from "vitest";

/**
 * Expect a validation error to be displayed
 */
export function expectValidationError(
  wrapper: VueWrapper,
  message: string,
): void {
  const errorElements = wrapper.findAll(".error, .q-field__messages");
  const errorTexts = errorElements.map((el) => el.text());
  expect(errorTexts.some((text) => text.includes(message))).toBe(true);
}

/**
 * Expect form data to match
 */
export function expectFormData(
  wrapper: VueWrapper,
  expectedData: Record<string, unknown>,
): void {
  for (const [name, expectedValue] of Object.entries(expectedData)) {
    const input = wrapper.find(`[name="${name}"]`);
    expect(input.exists()).toBe(true);

    const element = input.element as HTMLInputElement;
    const actualValue =
      element.type === "checkbox" ? element.checked : element.value;

    expect(actualValue).toBe(expectedValue);
  }
}

/**
 * Expect store state to match
 */
export function expectStoreState(
  store: Store,
  expectedState: Record<string, unknown>,
): void {
  for (const [key, expectedValue] of Object.entries(expectedState)) {
    expect((store.$state as Record<string, unknown>)[key]).toEqual(
      expectedValue,
    );
  }
}

/**
 * Expect element to be visible
 */
export function expectVisible(element: ReturnType<VueWrapper["find"]>): void {
  expect(element.exists()).toBe(true);
  const style = (element.element as HTMLElement).style;
  expect(style.display).not.toBe("none");
  expect(style.visibility).not.toBe("hidden");
}

/**
 * Expect element to be hidden
 */
export function expectHidden(element: ReturnType<VueWrapper["find"]>): void {
  if (!element.exists()) {
    return; // Element doesn't exist, which is fine
  }
  const style = (element.element as HTMLElement).style;
  expect(style.display === "none" || style.visibility === "hidden").toBe(true);
}

/**
 * Expect element to be disabled
 */
export function expectDisabled(element: ReturnType<VueWrapper["find"]>): void {
  expect(element.attributes("disabled")).toBeDefined();
}

/**
 * Expect element to be enabled
 */
export function expectEnabled(element: ReturnType<VueWrapper["find"]>): void {
  expect(element.attributes("disabled")).toBeUndefined();
}

/**
 * Expect store action to have been called
 */
export function expectActionCalled(
  actionSpy: { calls: unknown[][] },
  expectedArgs?: unknown[],
): void {
  expect(actionSpy.calls.length).toBeGreaterThan(0);
  if (expectedArgs) {
    expect(actionSpy.calls[0]).toEqual(expectedArgs);
  }
}

/**
 * Expect component to emit event
 */
export function expectEmitted(
  wrapper: VueWrapper,
  eventName: string,
  expectedPayload?: unknown,
): void {
  const emitted = wrapper.emitted(eventName);
  expect(emitted).toBeTruthy();
  if (expectedPayload !== undefined) {
    expect(emitted![0]).toEqual([expectedPayload]);
  }
}

/**
 * Expect text content to be present
 */
export function expectTextContent(wrapper: VueWrapper, text: string): void {
  expect(wrapper.text()).toContain(text);
}

/**
 * Expect exact text match
 */
export function expectExactText(
  element: ReturnType<VueWrapper["find"]>,
  text: string,
): void {
  expect(element.text().trim()).toBe(text);
}

/**
 * Expect multiple elements to exist
 */
export function expectElementCount(
  wrapper: VueWrapper,
  selector: string,
  count: number,
): void {
  const elements = wrapper.findAll(selector);
  expect(elements).toHaveLength(count);
}

/**
 * Expect array to contain object with properties
 */
export function expectArrayToContainObject<T extends Record<string, unknown>>(
  array: T[],
  properties: Partial<T>,
): void {
  const found = array.some((item) =>
    Object.entries(properties).every(([key, value]) => item[key] === value),
  );
  expect(found).toBe(true);
}
