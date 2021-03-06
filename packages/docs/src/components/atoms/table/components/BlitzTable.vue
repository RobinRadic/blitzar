<template>
  <QTable
    :class="`blitz-table ${qTableProps.grid ? 'blitz-table--grid' : 'blitz-table--rows'}`"
    :tableHeaderClass="qTableProps.tableHeaderClass + ` blitz-table__header`"
    v-bind="qTableProps"
    :selected.sync="cSelected"
    :pagination.sync="pagination"
    v-on="$listeners"
  >
    <template v-slot:top v-if="usesTopSlot" class="blitz-table__top">
      <slot name="above-nav-row" />
      <div class="blitz-table__nav-row">
        <slot name="top-left">
          <div class="q-table__title" v-if="title">{{ title }}</div>
        </slot>
        <slot name="top-right">
          <BlitzField
            class="blitz-table__action-button"
            v-for="(blueprint, i) in cActionButtons"
            :key="blueprint.id || i"
            v-bind="blueprint"
            v-on="blueprint.events"
          />
        </slot>
      </div>
      <slot name="above-table" />
    </template>
    <!-- Pass on all scoped slots -->
    <template
      v-for="slot in Object.keys($scopedSlots).filter((slot) => !slot.includes('top'))"
      v-slot:[slot]="scope"
    >
      <slot :name="slot" v-bind="scope" />
    </template>
    <!-- header for just the multiple selection -->
    <template v-slot:header-selection>
      <div class="_table-selection-cell" v-if="selectionMode">
        <BlitzField
          class="js-blitz-header-selection"
          v-bind="{ ...selectionComponentProps, value: allRowsAreSelected }"
          @input="setSelectionAllRows"
        />
      </div>
    </template>
    <!-- table body -->
    <template v-slot:body="rowProps">
      <BlitzForm
        :class="
          [
            'blitz-table__row',
            'blitz-row',
            rowProps.row.id ? `blitz-row__${rowProps.row.id}` : '',
            evaluate(rowClasses, rowProps),
          ].flat()
        "
        :style="evaluate(rowStyle, rowProps)"
        :formComponent="QTr"
        :schema="schemaColumns"
        :value="rowProps.row"
        :id="rowProps.row.id"
        :mode="mode"
        :key="rowProps.row.id + JSON.stringify(rowProps.row)"
        @field-input="({ id, value, origin }) => onInputCell(rowProps.row.id, id, value, origin)"
      >
        <template v-slot="blitzFormCtx">
          <QTd v-if="selectionMode" auto-width>
            <div class="_table-selection-cell">
              <BlitzField v-bind="selectionComponentProps" v-model="rowProps.selected" />
            </div>
          </QTd>
          <QTd
            v-for="colBlueprint in blitzFormCtx.schema"
            :key="colBlueprint.id"
            :props="rowProps"
            :class="['blitz-cell', evaluate(colBlueprint.cellClasses, rowProps)].flat()"
            :style="evaluate(colBlueprint.cellStyle, rowProps)"
            @click="(e) => onCellClick(e, rowProps.row, colBlueprint.id)"
            @dblclick="(e) => onCellDblclick(e, rowProps.row, colBlueprint.id)"
          >
            <!-- somehow an extra div is required otherwise buttons won't render properly -->
            <div>
              <BlitzField
                v-bind="{
                  ...colBlueprint,
                  span: undefined,
                  label: undefined,
                  subLabel: undefined,
                  component: colBlueprint.component || 'div',
                }"
                :value="blitzFormCtx.formDataFlat[colBlueprint.id]"
                @input="(val, origin) => onInputCell(rowProps.row.id, colBlueprint.id, val, origin)"
              />
            </div>
          </QTd>
        </template>
      </BlitzForm>
    </template>
    <!-- Grid item -->
    <template v-slot:item="gridItemProps">
      <slot name="item" v-bind="gridItemProps">
        <QCard
          v-if="schemaGrid"
          :class="
            [
              'blitz-table__grid-item',
              gridItemProps.selected ? 'selected' : [],
              evaluate(cardClass, gridItemProps),
            ].flat()
          "
          :style="evaluate(cardStyle, gridItemProps)"
          @click="(e) => onRowClick(e, gridItemProps.row, 'grid', gridItemProps)"
          :dark="qTableProps.dark"
          :square="qTableProps.square"
          :flat="qTableProps.flat"
          :bordered="qTableProps.bordered"
        >
          <BlitzForm
            :key="gridItemProps.row.id + JSON.stringify(gridItemProps.row)"
            :value="gridItemProps.row"
            :id="gridItemProps.row.id"
            v-bind="gridBlitzFormProps"
            @field-input="
              ({ id: colId, value, origin }) =>
                onInputCell(gridItemProps.row.id, colId, value, origin)
            "
          />
        </QCard>
      </slot>
    </template>
  </QTable>
</template>

<style lang="sass">
@import '../index.sass'

.blitz-table
  display: flex
  flex-direction: column
  ._table-top-right,
  ._table-selection-cell
    display: flex
    justify-content: center
    align-items: center
  th
    white-space: pre
  .q-table__top
    display: flex
    flex-wrap: nowrap
    flex-direction: column
    align-items: stretch
  &.q-table--grid .q-table__middle
    min-height: 0
    margin-bottom: 0
  // td:before
  //   background: none !important // todo: prevent this line from being necessary in BlitzTable

.blitz-table__nav-row
  display: grid
  justify-content: stretch
  align-content: start
  align-items: center
  grid-gap: $md
  grid-auto-flow: column
  grid-template-columns: 1fr

.blitz-table__grid-item
  margin: $sm
  padding: $md
  transition: all 200ms
  .blitz-field__sub-label
    display: none
  &.selected
    background: #efefef
    transform: scale(0.9)
</style>

<script>
import { merge } from 'merge-anything'
import { isPlainObject, isFunction } from 'is-what'
import { QTable, QTr, QTd, QCard } from 'quasar'
import { BlitzForm, BlitzField } from '@blitzar/form'
import BlitzGridListToggle from './BlitzGridListToggle'
import { schemaToQTableColumns } from '../helpers/schemaToQTableColumns.js'
import { setup } from '../helpers/setup.js'

/**
 * @typedef GridCardProps
 * @type {object}
 * @property {any} key - Row's key
 * @property {object} row - Row object
 * @property {number} rowIndex - Row's index (0 based) in the filtered and sorted table
 * @property {number} pageIndex - Row's index (0 based) in the current page of the filtered and sorted table
 * @property {object} cols - Column definitions
 * @property {object} colsMap - Column mapping (key is column name, value is column object)
 * @property {boolean} selected - (reactive prop) Is row selected? Can directly be assigned new Boolean value which changes selection state"
 * @property {boolean} expand - (reactive prop) Is row expanded? Can directly be assigned new Boolean value which changes expanded state"
 * @property {string} __trClass - Internal prop passed down to QTr (if used)
 */

setup()

/**
Here you can find all the information on the available props & events of BlitzTable.

If any of the documentation is unclear, feel free to [open an issue](https://github.com/cycraft/blitzar/issues) to ask for clarification!

BlitzTable uses Quasar's QTable under the hood. You can use any of the [QTable props](https://quasar.dev/vue-components/table#QTable-API) as well besides the ones described in the API Card below.
 */
export default {
  name: 'BlitzTable',
  inheritAttrs: false,
  components: {
    QTable,
    QTr,
    QTd,
    QCard,
    BlitzForm,
    BlitzField,
  },
  props: {
    /**
     * The schema for the columns you want to generate. (BlitzForm schema format)
     * @type {Record<string, any>[]}
     * @example [{ id: 'nameFirst', label: 'First Name', component: 'input' }, { id: 'nameLast', label: 'Last Name', component: 'input' }]
     * @category column
     */
    schemaColumns: { type: Array, required: true },
    /**
     * The schema for the grid cards you want to generate. (BlitzForm schema format)
     * @type {Record<string, any>[]}
     * @example [{ id: 'nameFirst', label: 'First Name', component: 'input' }, { id: 'nameLast', label: 'Last Name', component: 'input' }]
     * @category column
     */
    schemaGrid: { type: [Array, Object] },
    /**
     * Rows of data to display. Use `rows` instead of the QTables `data`. Renamed for clarity.
     * @type {Record<string, any>[]}
     * @example [{ nameFirst: 'Eleanor', nameLast: 'Shellstrop' }, { nameFirst: 'Chidi', nameLast: 'Anagonye' }]
     * @category model
     */
    rows: { type: Array, required: true },
    /**
     * Action buttons to add to the top right of the table. An array of objects just like a BlitzForm schema.
     *
     * There is also one preset button to toggle between grid- and list-view. This is shown by default, or can be included in the schema array as just the string 'grid' like the example below.
     * @example ['grid', { component: 'button', slot: 'log it', events: { click: console.log } }]
     * @category content
     */
    actionButtons: { type: Array, default: () => ['grid'] },
    /**
     * The BlitzForm options you want to use for the grid cards. Eg. You can pass `{ actionButtons: [] }` here to include some action buttons on each grid card.
     *
     * Please note:
     * - The `schema` for the grid cards should be set via the `schemaGrid` prop instead of passing it here as `schema`.
     * - The BlitzForm used for each grid card will automatically get the row data.
     * - See the documentation of BlitzForm for more information on the props you can set.
     * @category column
     */
    gridBlitzFormOptions: { type: Object, default: () => ({}) },
    /**
     * Custom styling to be applied to each row. Applied like so `:style="rowStyle"`
     * @example 'padding: 1em;'
     * @category style
     */
    rowStyle: { type: [Object, Array, String, Function] },
    /**
     * Custom classes to be applied to each row. Applied like so `:class="rowClasses"`
     * @example ['dark-theme']
     * @category style
     */
    rowClasses: { type: [Object, Array, String, Function] },
    /**
     * An object that represents the checkbox when the table is in "selection" mode. You can tell BlitzTable to use a custom checkbox component instead of the default.
     * Defaults to a regular HTML5 checkbox.
     * @example { component: 'MyCheckbox', class: 'table-checkbox' }
     */
    selectionComponentProps: {
      type: Object,
      default: () => ({
        component: 'input',
        type: 'checkbox',
      }),
    },
    // Inherited props used here:
    /**
     * @category inherited prop
     */
    grid: { type: Boolean, default: false },
    /**
     * @category inherited prop
     * @type {Record<string, any>[]}
     */
    selected: { type: Array, default: () => [] },
    /**
     * CSS classes to apply to the card (when in grid mode).
     * You can pass a function which will be evaluated just like an Evaluated Prop. The first param passed will be the entire row data. The second is `item` scoped slot object from a QTable.
     * @type {(rowData: Record<string, any>, gridCardProps: GridCardProps, BlitzTableContext: any) => string | Record<string, any> | (string | Record<string, any>)[]}
     * @example 'special-class'
     * @example :card-class="{ 'my-special-class': [Boolean condition] }"
     * @category inherited prop
     */
    cardClass: { type: [Function, String, Array, Object] },
    /**
     * CSS style to apply to the card (when in grid mode).
     * You can pass a function which will be evaluated just like an Evaluated Prop. The first param passed will be the entire row data. The second is `item` scoped slot object from a QTable.
     * @type {(rowData: Record<string, any>, gridCardProps: GridCardProps, BlitzTableContext: any) => string | Record<string, any> | (string | Record<string, any>)[]}
     * @example 'background-color: #fff'
     * @example :card-style="{ backgroundColor: '#fff' }"
     * @category inherited prop
     */
    cardStyle: { type: [Function, String, Array, Object] },
    /**
     * By default the rows show just the raw data without showing field components. If you set `mode: 'edit'` your entire table will show the actual (editable) component as per your schema.
     * @category content
     */
    mode: { type: String, default: 'raw' },
    // Inherited props with different defaults:
    // Modified inherited props:
    /**
     * Do not use this! Use `rows` instead of the QTables `data`. Renamed for clarity.
     * @category modified prop
     */
    data: { type: Array },
    /**
     * Do not use this! Use `schemaColumns` instead. This is the prop QTable uses to define its columns. BlitzTable uses `schemaColumns` instead.
     * @category modified prop
     */
    columns: {},
    /**
     * A title to be placed above your table.
     * @category modified prop
     */
    title: { type: String },
    /**
     * Do not use this! This is fixed to `id` in a BlitzTable and cannot be changed.
     * @category modified prop
     */
    rowKey: {},
  },
  created() {
    // some validation on creation
    const needsSchemaGrid = this.grid === true || this.actionButtons.includes('grid')
    if (needsSchemaGrid && this.schemaGrid === undefined) {
      throw new Error(
        '[BlitzTable] You need to defined a prop called "schemaGrid" if you want to use a grid layout as well!'
      )
    }
  },
  mounted() {
    const footerEl = this.$el.querySelector('.q-table__bottom')
    if (footerEl) footerEl.classList.add('blitz-table__footer')
    const topEl = this.$el.querySelector('.q-table__top')
    if (topEl) topEl.classList.add('blitz-table__top')
    const titleEl = this.$el.querySelector('.q-table__title')
    if (titleEl) titleEl.classList.add('blitz-table__title')
  },
  data() {
    const { grid, selected } = this
    const innerSelected = selected
    const gridModeEnabled = grid
    // const innerFilter = filter
    return {
      // innerFilter,
      innerSelected,
      gridModeEnabled,
      defaultPagination: {
        rowsPerPage: 10,
      },
      QTr,
    }
  },
  watch: {
    grid(newValue) {
      this.gridModeEnabled = newValue
    },
    selected(newValue) {
      this.innerSelected = newValue
    },
  },
  computed: {
    selectionMode() {
      const { qTableProps } = this
      return qTableProps.selection === 'single' || qTableProps.selection === 'multiple'
    },
    allRowsAreSelected() {
      const { rows, cSelected } = this
      return rows.length > 0 && rows.length === cSelected.length
    },
    pagination: {
      get() {
        return this.qTableProps.pagination || this.defaultPagination
      },
      set(newPagination) {
        if (this.qTableProps.pagination) {
          return this.event('update:pagination', newPagination)
        }
        this.defaultPagination = newPagination
      },
    },
    usesTopSlot() {
      const { title, cActionButtons, $scopedSlots: slot } = this
      return (
        title ||
        cActionButtons.length ||
        slot['above-table'] ||
        slot['above-nav-row'] ||
        slot['top-left'] ||
        slot['top-right']
      )
    },
    qTableProps() {
      const propsToNotPass = ['cardStyle', 'cardClass']
      const propsToPass = merge(this.$attrs, {
        // Quasar props with modified behavior:
        data: this.rows,
        columns: this.cColumns,
        rowKey: 'id',
        grid: this.gridModeEnabled,
        // Quasar props with modified defaults:
        // filter: this.$attrs.filter || this.innerFilter,
        // Quasar props just to pass:
      })
      return Object.entries(propsToPass).reduce((carry, [key, val]) => {
        if (propsToNotPass.includes(key)) return carry
        carry[key] = val
        return carry
      }, {})
    },
    gridBlitzFormProps() {
      const { gridBlitzFormOptions, schemaGrid, mode } = this
      const defaults = {
        schema: schemaGrid,
        mode,
      }
      return merge(defaults, gridBlitzFormOptions)
    },
    cSelected: {
      get() {
        return this.innerSelected
      },
      set(val) {
        // set indeterminate
        const isIndeterminate = val.length && val.length < this.rows.length
        const headerCheckbox = this.$el.querySelector('.js-blitz-header-selection input')
        if (isIndeterminate && headerCheckbox) {
          headerCheckbox.indeterminate = true
        }
        if (!isIndeterminate && headerCheckbox) {
          headerCheckbox.indeterminate = false
        }
        this.innerSelected = val
        this.event('update:selected', val)
      },
    },
    cColumns() {
      return schemaToQTableColumns(this.schemaColumns)
    },
    cActionButtons() {
      const {
        actionButtons,
        tapAdd,
        tapDuplicate,
        cSelected,
        gridModeEnabled,
        enableGrid,
        disableGrid,
        schemaGrid,
      } = this
      const blitzTableContext = this
      const defaultsGridButton = {
        component: BlitzGridListToggle,
        value: this.gridModeEnabled,
        events: { input: (newVal) => (this.gridModeEnabled = newVal) },
      }
      return actionButtons
        .map((btn) => {
          if (btn === 'grid' && schemaGrid) {
            // return // 以下の機能は未完成
            return defaultsGridButton
          }
          if (isPlainObject(btn)) {
            if (!isPlainObject(btn.events)) return btn
            const { click } = btn.events
            if (isFunction(click)) btn.events.click = (val) => click(val, blitzTableContext)
            return btn
          }
        })
        .filter((btn) => isPlainObject(btn))
        .map((blueprint) => {
          if (!blueprint.slot) return blueprint
          const slots = blueprint.slots || {}
          return { ...blueprint, slots: { ...slots, default: blueprint.slot } }
        })
    },
  },
  methods: {
    evaluate(propValue, rowProps) {
      if (!isFunction(propValue)) return propValue || ''
      return propValue(rowProps.row, rowProps, this) || ''
    },
    setSelectionAllRows(setTo) {
      if (setTo === true) {
        this.cSelected = this.rows
      } else {
        this.cSelected = []
      }
    },
    onCellDblclick(event, rowData, colId) {
      this.event('row-dblclick', event, rowData)
      this.event('cell-dblclick', event, rowData, colId)
    },
    onCellClick(event, rowData, colId) {
      this.onRowClick(event, rowData)
      this.event('cell-click', event, rowData, colId)
    },
    onRowClick(event, rowData, origin, gridItemProps) {
      const { selectionMode } = this
      if (origin === 'grid' && selectionMode) {
        gridItemProps.selected = !gridItemProps.selected
      }
      this.event('row-click', event, rowData)
    },
    onInputCell(rowId, colId, value, origin) {
      this.event('input-cell', { rowId, colId, value, origin })
    },
    /**
     * @param {'update:pagination' | 'update:selected' | 'row-click' | 'row-dblclick' | 'cell-click' | 'cell-dblclick' | 'input-cell'} eventName
     * @param {...any[]} args
     */
    event(eventName, ...args) {
      if (eventName === 'update:pagination') {
        /**
         * This makes it possible to sync the table pagination like:
         * ```html
         * <BlitzTable :pagination.sync="pagination" />
         * ```
         * See the [Quasar docs](https://quasar.dev/vue-components/table#Pagination) for the exact details on how pagination works.
         * @property {{ sortBy: 'desc' | 'asc', descending: boolean, page: number, rowsPerPage: number, rowsNumber?: number }} payload newPagination
         */
        this.$emit('update:pagination', ...args)
      }
      if (eventName === 'update:selected') {
        /**
         * This makes it possible to sync the table selection (the selected rows) like:
         * ```html
         * <BlitzTable :selected.sync="selected" selection="multiple" />
         * ```
         * See the [Quasar docs](https://quasar.dev/vue-components/table#Selection) for the exact details on how selection works.
         * @property {Record<string, any>[]} payload val
         */
        this.$emit('update:selected', ...args)
      }
      if (eventName === 'row-click') {
        /**
         * Emitted when user clicks/taps on a row.
         * @property {MouseEvent} event the mouse event that occured
         * @property {Record<string, any>} payload the rowData
         */
        this.$emit('row-click', ...args)
      }
      if (eventName === 'row-dblclick') {
        /**
         * Emitted when user quickly double clicks/taps on a row.
         * @property {MouseEvent} event the mouse event that occured
         * @property {Record<string, any>} payload the rowData
         */
        this.$emit('row-dblclick', ...args)
      }
      if (eventName === 'cell-click') {
        /**
         * Emitted when user clicks/taps on a cell.
         * @property {MouseEvent} event the mouse event that occured
         * @property {Record<string, any>} payload the rowData
         * @property {string} colId the column ID, this is what you have set as `id` in the schema
         */
        this.$emit('cell-click', ...args)
      }
      if (eventName === 'cell-dblclick') {
        /**
         * Emitted when user quickly double clicks/taps on a cell.
         * @property {MouseEvent} event the mouse event that occured
         * @property {Record<string, any>} payload the rowData
         * @property {string} colId the column ID, this is what you have set as `id` in the schema
         */
        this.$emit('cell-dblclick', ...args)
      }
      if (eventName === 'input-cell') {
        /**
         * Emitted when the user updates the cell, if rendered as editable by setting `mode: 'edit'` in the schema.
         * @property {{ rowId: string, colId: string, value: any, origin?: string }} payload
         */
        this.$emit('input-cell', ...args)
      }
    },
  },
}
</script>
