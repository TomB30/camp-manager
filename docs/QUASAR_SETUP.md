# Quasar UI Framework Setup

Quasar UI has been successfully integrated into the Camp Manager project!

## What Was Installed

- **quasar**: The main Quasar framework
- **@quasar/extras**: Icon sets and fonts
- **@quasar/vite-plugin**: Vite plugin for Quasar
- **sass**: Required for Quasar styling
- **@types/node**: Node.js type definitions for TypeScript

## Configuration Files Modified

### 1. `vite.config.ts`
- Added Quasar Vite plugin
- Configured transformAssetUrls for proper asset handling
- Added Quasar to vendor chunks for optimized builds
- Updated path resolution to use ES modules

### 2. `src/main.ts`
- Imported and registered Quasar plugin
- Added Quasar CSS imports
- Added Material Icons from @quasar/extras

### 3. `src/quasar-variables.sass`
- Created Sass variables file for customizing Quasar theme
- Default color scheme configured (can be customized)

## Using Quasar Components

You can now use any Quasar component in your Vue files:

```vue
<template>
  <div>
    <q-btn color="primary" label="Click Me" @click="handleClick" />
    
    <q-card class="my-card">
      <q-card-section>
        <div class="text-h6">Card Title</div>
      </q-card-section>
      <q-card-section>
        Card content goes here
      </q-card-section>
    </q-card>
    
    <q-input v-model="text" label="Enter text" />
    
    <q-select
      v-model="selected"
      :options="options"
      label="Select option"
    />
  </div>
</template>

<script setup lang="ts">
import { ref } from 'vue';

const text = ref('');
const selected = ref(null);
const options = ['Option 1', 'Option 2', 'Option 3'];

const handleClick = () => {
  console.log('Button clicked!');
};
</script>
```

## Available Icon Sets

Material Icons are included by default. To add more icon sets, import them in `src/main.ts`:

```typescript
// Other icon sets (uncomment as needed):
// import '@quasar/extras/material-icons-outlined/material-icons-outlined.css'
// import '@quasar/extras/material-icons-round/material-icons-round.css'
// import '@quasar/extras/material-icons-sharp/material-icons-sharp.css'
// import '@quasar/extras/fontawesome-v6/fontawesome-v6.css'
// import '@quasar/extras/ionicons-v4/ionicons-v4.css'
// import '@quasar/extras/eva-icons/eva-icons.css'
// import '@quasar/extras/themify/themify.css'
// import '@quasar/extras/line-awesome/line-awesome.css'
// import '@quasar/extras/bootstrap-icons/bootstrap-icons.css'
```

## Using Quasar Plugins

To use Quasar plugins (like Dialog, Notify, Loading, etc.), import and add them in `src/main.ts`:

```typescript
import { Quasar, Notify, Dialog, Loading } from 'quasar';

app.use(Quasar, {
  plugins: {
    Notify,
    Dialog,
    Loading,
  },
});
```

Then use them in your components:

```typescript
// Notify
import { useQuasar } from 'quasar';

const $q = useQuasar();

$q.notify({
  message: 'Success!',
  color: 'positive',
  icon: 'check',
});

// Dialog
$q.dialog({
  title: 'Confirm',
  message: 'Are you sure?',
}).onOk(() => {
  // handle ok
});

// Loading
$q.loading.show({
  message: 'Loading...',
});
```

## Customizing Theme

Edit `src/quasar-variables.sass` to customize the Quasar theme colors:

```sass
$primary   : #1976D2
$secondary : #26A69A
$accent    : #9C27B0

$dark      : #1D1D1D
$dark-page : #121212

$positive  : #21BA45
$negative  : #C10015
$info      : #31CCEC
$warning   : #F2C037
```

## Quasar CSS Utilities

Quasar provides utility classes for common styling needs:

- **Spacing**: `q-pa-md`, `q-ma-sm`, `q-px-lg`, etc.
- **Typography**: `text-h1` through `text-h6`, `text-subtitle1`, `text-body1`, etc.
- **Colors**: `text-primary`, `bg-secondary`, etc.
- **Flexbox**: `row`, `column`, `items-center`, `justify-between`, etc.

Example:
```vue
<div class="row items-center q-pa-md">
  <div class="col">
    <div class="text-h5">Title</div>
    <div class="text-subtitle2 text-grey">Subtitle</div>
  </div>
</div>
```

## Resources

- [Quasar Documentation](https://quasar.dev/docs)
- [Component Gallery](https://quasar.dev/components)
- [Style & Identity](https://quasar.dev/style)
- [Quasar Playground](https://quasar.dev/playground)

## Next Steps

1. Start using Quasar components in your existing Vue components
2. Customize the theme colors in `src/quasar-variables.sass`
3. Import additional icon sets as needed
4. Add Quasar plugins (Notify, Dialog, etc.) as your app requires them
5. Explore the Quasar component gallery for UI ideas

## Notes

- Quasar is fully tree-shakeable - only components you use will be included in the build
- The build system is optimized to split Quasar into a separate vendor chunk
- Quasar works seamlessly with your existing Vue 3 + TypeScript setup

