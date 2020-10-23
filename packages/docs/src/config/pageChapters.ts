import { ROUTE_NAMES } from '../router/routes'

export const routeNamePageChaptersMap: { [key in ROUTE_NAMES]: string[] } = {
  [ROUTE_NAMES.FORM]: [
    'Basics.md',
    'Basics - Basic Example.vue',
    'Basics - Advanced Example.vue',
    'Frameworks.md',
    'Frameworks - Quasar Framework.vue',
    'Slots.md',
    'Slots - Default.vue',
    'Slots - Label.vue',
    'Modes.vue',
    'Modes - Disable fields on view mode.vue',
    'Action Buttons.md',
    'Action Buttons - Pre-made action buttons.vue',
    'Action Buttons - Overwriting pre-made action buttons.vue',
    'Action Buttons - Custom action buttons.vue',
    'Styling.md',
    'Styling - Left labels.vue',
    'Styling - Raw form styling.vue',
    'Events.md',
    'Events - Form events.vue',
    'Events - Field events.vue',
    'Events - Update other fields on events.vue',
    'Nested Data.vue',
    'Evaluated Props.md',
    'Evaluated Props - 1.vue',
    'Evaluated Props - 2.vue',
    'Evaluated Props - 3.vue',
    'Evaluated Props - 4.vue',
    'Evaluated Props - 5.vue',
    'Computed Fields.md',
    'Computed Fields - 1.vue',
    'Computed Fields - 2.vue',
    'Computed Fields - 3.vue',
    'Validation.vue',
    'Validation - 2.vue',
    // 'Hacks.vue',
  ],
  [ROUTE_NAMES.TABLE]: [
    'Basics.vue',
    'Advanced.vue',
    'Computed Columns.vue',
    'Selection.vue',
    'Selection - Styling.vue',
    'Slots.vue',
    'Editing.md',
    'Editing - on Button Click.vue',
    'Editing - on Row Click.vue',
    'Editing - inline.vue',
    'Editing - inline on cell double-click.vue',
    'Styling.md',
    'Styling - via CSS.vue',
    'Styling - via Props.vue',
  ],
}
