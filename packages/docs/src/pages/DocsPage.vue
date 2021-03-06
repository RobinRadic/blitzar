<template>
  <q-page class="page-docs">
    <DocPage
      :pathToChapterFiles="pathToChapterFiles"
      :chapterOrder="chapterOrder"
      :chapterOptions="chapterOptions"
      :pathsToApiCardSourceFile="pathsToApiCardSourceFile"
      @TOC="(TOC) => $emit('set-toc', TOC)"
    />
  </q-page>
</template>

<style lang="sass">
// $
.page-docs
  padding: $md
  .markdown
    +C(color, 'white')
    line-height: 1.65
    code:not(.language-js):not(.language-html)
      color: #eeeeee
      +py(3px)
      +px(6px)
      border-radius: 6px
    code:not(.language-js):not(.language-html),
    pre
      +C(background, code-space)
    ol > li
      +pb($md)
  .planetar-example-card
    +C(color, 'black')
  .planetar-api-card
    +C(background, 'white')
    .text-h4
      +C(color, blue-zodiac)
    a
      +C(color, primary)
</style>

<script lang="ts">
import { defineComponent, computed } from '@vue/composition-api'
import { DocPage } from 'planetar'
import { routeNamePageChaptersMap, chapterOptions } from '../config/pageChapters'
import { ROUTE_NAMES } from '../router/routes'

export default defineComponent({
  components: { DocPage },
  props: {
    id: { type: String },
  },
  setup(props, options) {
    const routeName = options.root.$route.name as ROUTE_NAMES
    const pathToChapterFiles = `pages/${routeName}/`
    const chapterOrder = computed((): string[] => routeNamePageChaptersMap[routeName])
    const pathsToApiCardSourceFile = computed(() =>
      routeName === ROUTE_NAMES.TABLE
        ? ['components/atoms/table/components/BlitzTable.vue']
        : routeName === ROUTE_NAMES.FORM
        ? [
            'components/atoms/form/components/BlitzForm.vue',
            'components/atoms/form/components/BlitzField.vue',
          ]
        : ['components/atoms/form/components/BlitzListForm.vue']
    )

    return { pathToChapterFiles, chapterOrder, pathsToApiCardSourceFile, chapterOptions }
  },
})
</script>
