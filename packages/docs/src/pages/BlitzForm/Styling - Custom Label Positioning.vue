<template>
  <div>
    <BlitzForm class="custom-labels-example" :schema="schema" v-model="formData" />
  </div>
</template>

<style lang="sass">
.custom-labels-example
  .blitz-field
    display: grid
    grid-template-columns: 1fr 1fr
    grid-template-areas: "component label" "sub-label sub-label"
  .blitz-field__label
    grid-area: label
  .blitz-field__sub-label
    grid-area: sub-label
  .blitz-field__component
    grid-area: component

  /** overwrite position for the title label: */
  ._title
    .blitz-field__label
      grid-column: 1 / -1
      font-weight: 600
</style>

<script>
import { BlitzForm } from 'blitzar'

const schema = [
  {
    label: 'Hero Details',
    class: '_title',
  },
  {
    id: 'name',
    component: 'input',
    label: 'Superhero name',
  },
  {
    id: 'powerOrigin',
    component: 'input',
    label: 'Power origin',
    subLabel: 'where the hero power is coming from',
  },
]

/**
## Custom Label Positioning

It's easy to overwrite the positioning of the field label, sublabel & component with some CSS!

Look at the _**style tab**_ to see how to position the _**label on the right**_ and the sub-label on the bottom.
 */
export default {
  components: { BlitzForm },
  data() {
    return {
      schema,
      formData: {
        name: 'Peace of Cake',
        powerOrigin: 'self',
      },
    }
  },
}
</script>
