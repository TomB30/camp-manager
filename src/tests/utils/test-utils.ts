/**
 * Test utilities for mounting Vue components with required plugins
 */

import { ComponentMountingOptions, mount, VueWrapper } from "@vue/test-utils";
import { createPinia, setActivePinia, Pinia } from "pinia";
import { Quasar } from "quasar";
import type { Plugin } from "vue";
import { createRouter, createMemoryHistory, Router } from "vue-router";
import type { Component } from "vue";
import BaseButton from "@/components/common/BaseButton.vue";
import BaseInput from "@/components/common/BaseInput.vue";

/**
 * Create a test instance of Pinia
 */
export function createTestingPinia(): Pinia {
  const pinia = createPinia();
  setActivePinia(pinia);
  return pinia;
}

/**
 * Create a mock router for testing
 */
export function mockRouter(): Router {
  return createRouter({
    history: createMemoryHistory(),
    routes: [
      {
        path: "/",
        name: "Dashboard",
        component: { template: "<div>Dashboard</div>" },
      },
      {
        path: "/campers",
        name: "Campers",
        component: { template: "<div>Campers</div>" },
      },
      {
        path: "/staff",
        name: "Staff",
        component: { template: "<div>Staff</div>" },
      },
      {
        path: "/calendar",
        name: "Calendar",
        component: { template: "<div>Calendar</div>" },
      },
      {
        path: "/groups",
        name: "Groups",
        component: { template: "<div>Groups</div>" },
      },
      {
        path: "/programs",
        name: "Programs",
        component: { template: "<div>Programs</div>" },
      },
      {
        path: "/settings",
        name: "Settings",
        component: { template: "<div>Settings</div>" },
      },
    ],
  });
}

interface MountOptions {
  props?: Record<string, unknown>;
  slots?: Record<string, unknown>;
  global?: {
    stubs?: Record<string, unknown>;
    mocks?: Record<string, unknown>;
    provide?: Record<string, unknown>;
  };
  pinia?: Pinia;
  router?: Router;
  shallow?: boolean;
}

/**
 * Create a wrapper for a component with all necessary plugins
 */

export function createWrapper<T extends Component>(
  component: T,
  options: MountOptions = {},
): VueWrapper {
  const pinia = options.pinia || createTestingPinia();
  const router = options.router || mockRouter();

  const globalPlugins: Plugin[] = [pinia, router, Quasar];

  // Fix for lint error due to options.props type mismatch.
  const { props, slots, shallow, ...restOptions } = options;

  const mountOptions: ComponentMountingOptions<T> = {
    ...(restOptions as Omit<typeof restOptions, "props" | "slots" | "shallow">),
    props: props as any, // Type forced to allow for flexible Record props
    slots: slots as any, // Type forced similarly
    ...(shallow !== undefined ? { shallow } : {}),
    global: {
      components: {
        BaseButton,
        BaseInput,
      },
      plugins: globalPlugins,
      stubs: {
        teleport: true,
        transition: false,
        "transition-group": false,
        // Stub Quasar dialog to always render content
        "q-dialog": {
          template: '<div class="q-dialog"><slot /></div>',
        },
        "q-card": {
          template: '<div class="q-card"><slot /></div>',
        },
        ...options.global?.stubs,
      },
      mocks: {
        $t: (key: string) => key, // Mock i18n if needed
        ...options.global?.mocks,
      },
      provide: {
        ...options.global?.provide,
      },
    },
  };

  // Fix lint error by casting to unknown first
  return mount(component, mountOptions) as unknown as VueWrapper;
}

/**
 * Wait for component to update
 */
export async function flushPromises(): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, 0));
}

/**
 * Wait for a specific amount of time
 */
export async function wait(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Trigger a native event on an element
 */
export function triggerNativeEvent(
  element: Element,
  eventType: string,
  options = {},
): void {
  const event = new Event(eventType, {
    bubbles: true,
    cancelable: true,
    ...options,
  });
  element.dispatchEvent(event);
}
