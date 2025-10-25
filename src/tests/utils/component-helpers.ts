/**
 * Component testing helper functions
 */

import { VueWrapper } from "@vue/test-utils";
import { flushPromises } from "./test-utils";

/**
 * Find element by test ID attribute
 */
export function findByTestId(
  wrapper: VueWrapper,
  testId: string,
): ReturnType<VueWrapper["find"]> {
  return wrapper.find(`[data-testid="${testId}"]`);
}

/**
 * Find all elements by test ID attribute
 */
export function findAllByTestId(
  wrapper: VueWrapper,
  testId: string,
): ReturnType<VueWrapper["findAll"]> {
  return wrapper.findAll(`[data-testid="${testId}"]`);
}

/**
 * Fill a form with data
 */
export async function fillForm(
  wrapper: VueWrapper,
  formData: Record<string, unknown>,
): Promise<void> {
  for (const [name, value] of Object.entries(formData)) {
    const input = wrapper.find(`[name="${name}"]`);
    if (input.exists()) {
      await input.setValue(value);
    }
  }
  await flushPromises();
}

/**
 * Submit a form
 */
export async function submitForm(wrapper: VueWrapper): Promise<void> {
  const form = wrapper.find("form");
  if (form.exists()) {
    await form.trigger("submit");
  } else {
    // Try to find submit button
    const submitButton = wrapper.find('button[type="submit"]');
    if (submitButton.exists()) {
      await submitButton.trigger("click");
    }
  }
  await flushPromises();
}

/**
 * Wait for a modal to close
 */
export async function waitForModalClose(
  wrapper: VueWrapper,
  timeout = 1000,
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    await flushPromises();
    if (!wrapper.exists()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error("Modal did not close within timeout");
}

/**
 * Click a button by text content
 */
export async function clickButtonByText(
  wrapper: VueWrapper,
  text: string,
): Promise<void> {
  const buttons = wrapper.findAll("button");
  for (const button of buttons) {
    if (button.text().includes(text)) {
      await button.trigger("click");
      await flushPromises();
      return;
    }
  }
  throw new Error(`Button with text "${text}" not found`);
}

/**
 * Check if element has class
 */
export function hasClass(
  wrapper: VueWrapper | ReturnType<VueWrapper["find"]>,
  className: string,
): boolean {
  return wrapper.classes().includes(className);
}

/**
 * Get all input values from a form
 */
export function getFormValues(wrapper: VueWrapper): Record<string, unknown> {
  const inputs = wrapper.findAll("input, select, textarea");
  const values: Record<string, unknown> = {};

  inputs.forEach((input) => {
    const name = input.attributes("name");
    if (name) {
      values[name] = (input.element as HTMLInputElement).value;
    }
  });

  return values;
}

/**
 * Wait for an element to appear
 */
export async function waitForElement(
  wrapper: VueWrapper,
  selector: string,
  timeout = 1000,
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    await flushPromises();
    if (wrapper.find(selector).exists()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Element "${selector}" did not appear within timeout`);
}

/**
 * Wait for an element to disappear
 */
export async function waitForElementToDisappear(
  wrapper: VueWrapper,
  selector: string,
  timeout = 1000,
): Promise<void> {
  const startTime = Date.now();
  while (Date.now() - startTime < timeout) {
    await flushPromises();
    if (!wrapper.find(selector).exists()) {
      return;
    }
    await new Promise((resolve) => setTimeout(resolve, 50));
  }
  throw new Error(`Element "${selector}" did not disappear within timeout`);
}

/**
 * Check if input is disabled
 */
export function isDisabled(input: ReturnType<VueWrapper["find"]>): boolean {
  return input.attributes("disabled") !== undefined;
}

/**
 * Check if element is visible
 */
export function isVisible(element: ReturnType<VueWrapper["find"]>): boolean {
  if (!element.exists()) return false;
  const style = (element.element as HTMLElement).style;
  return style.display !== "none" && style.visibility !== "hidden";
}
