<template>
  <div>
    <BlitzForm :schema="schema" v-model="formData" :columnCount="4" />
    <PreviewCode comment="formData">{{ formData }}</PreviewCode>
  </div>
</template>

<style lang="sass" scoped></style>

<script>
import { BlitzForm } from 'blitzar'

const carData = [
  { year: '2015', make: 'Audi', model: 'A3', trim: '2.0' },
  { year: '2015', make: 'Audi', model: 'A3', trim: '1.8' },
  { year: '2015', make: 'Audi', model: 'A6', trim: '2.5' },
  { year: '2015', make: 'Audi', model: 'A6', trim: '3.0' },
  { year: '2015', make: 'BMW', model: 'M3', trim: 'b2.0' },
  { year: '2015', make: 'BMW', model: 'M3', trim: 'b1.8' },
  { year: '2015', make: 'BMW', model: 'M5', trim: 'b2.5' },
  { year: '2015', make: 'BMW', model: 'M5', trim: 'b3.0' },
  { year: '2016', make: 'Chevy', model: 'Impala', trim: 'c2.0' },
  { year: '2016', make: 'Chevy', model: 'Impala', trim: 'c1.8' },
  { year: '2016', make: 'Chevy', model: 'Malibu', trim: 'c2.5' },
  { year: '2016', make: 'Chevy', model: 'Malibu', trim: 'c3.0' },
  { year: '2016', make: 'Dodge', model: 'RAM', trim: 'd2.0' },
  { year: '2016', make: 'Dodge', model: 'RAM', trim: 'd1.8' },
  { year: '2016', make: 'Dodge', model: 'Challanger', trim: 'd2.5' },
  { year: '2016', make: 'Dodge', model: 'Challanger', trim: 'd3.0' },
]

const uniqueValues = (array) => ['', ...new Set(array)]

const mapForSelect = (value) => ({ component: 'option', value, slot: value })

const clearFields = (fieldIds, fieldInput) => {
  fieldIds.forEach((id) => fieldInput({ id, value: '' }))
}

const schema = [
  {
    id: 'year',
    label: 'Year',
    component: 'select',
    events: {
      // clear fields right from input to prevent invalid data
      input: (val, { fieldInput }) => clearFields(['make', 'model', 'trim'], fieldInput),
    },
    // component props:
    slot: uniqueValues(carData.map((d) => d.year)).map(mapForSelect),
  },
  {
    id: 'make',
    label: 'Make',
    component: 'select',
    evaluatedProps: ['slot'],
    events: {
      // clear fields right from input to prevent invalid data
      input: (val, { fieldInput }) => clearFields(['model', 'trim'], fieldInput),
    },
    // component props:
    slot: (val, { formData }) => {
      const { year } = formData || {}
      const result = uniqueValues(
        carData.filter((car) => car.year === year).map((d) => d.make)
      ).map(mapForSelect)
      return uniqueValues(carData.filter((car) => car.year === year).map((d) => d.make)).map(
        mapForSelect
      )
    },
  },
  {
    id: 'model',
    label: 'Model',
    component: 'select',
    evaluatedProps: ['slot'],
    events: {
      // clear fields right from input to prevent invalid data
      input: (val, { fieldInput }) => clearFields(['trim'], fieldInput),
    },
    // component props:
    slot: (val, { formData }) => {
      const { year, make } = formData || {}
      return uniqueValues(
        carData.filter((car) => car.year === year && car.make === make).map((d) => d.model)
      ).map(mapForSelect)
    },
  },
  {
    id: 'trim',
    label: 'Trim',
    component: 'select',
    evaluatedProps: ['slot'],
    // component props:
    slot: (val, { formData }) => {
      const { year, make, model } = formData || {}
      return uniqueValues(
        carData
          .filter((car) => car.year === year && car.make === make && car.model === model)
          .map((d) => d.trim)
      ).map(mapForSelect)
    },
  },
]

/**
## Dynamic "Options" of a Select-Field
 */
export default {
  components: { BlitzForm },
  data() {
    return { schema, formData: {} }
  },
}
</script>
