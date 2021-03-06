<template>
  <div class="Autocomplete">
    <input
      type="text"
      v-model="search"
      :class="inputClass"
      :placeholder="placeholder"
      @input="onInput"
      @change="(evt) => changeResult(evt.target.value)"
      @focus="onInput"
      @keydown.down="onArrowDown"
      @keydown.up="onArrowUp"
      @keydown.enter.prevent="onEnter"
    />

    <ul class="Autocomplete-results" v-show="isOpen">
      <li
        v-for="(result, i) in results"
        class="Autocomplete-result"
        :key="result"
        :class="{ 'is-active': i === selectionCursor }"
        @click="setResult(result)"
      >
        {{ result }}
      </li>
    </ul>

  </div>
</template>

<script>
export default {
  name: 'autocomplete',
  props: {
    item: {
      type: String,
      required: false,
      default: ''
    },
    items: {
      type: Array,
      required: false,
      default: []
    },
    inputClass: {
      type: String,
      required: false,
      default: ''
    },
    placeholder: {
      type: String,
      required: false,
      default: ''
    }
  },
  data() {
    return {
      search: '',
      results: [],
      isOpen: false,
      selectionCursor: -1
    }
  },
  methods: {
    onInput() {
      if (this.results.length > 0) {
        this.isOpen = true
      }
      this.filterResults()
    },
    filterResults() {
      this.results = this.items.filter(
        item => item.toLowerCase().indexOf(this.search.toLowerCase()) > -1
      )
    },
    setResult(result) {
      this.isOpen = false
      this.search = result
      this.$emit('autocomplete::change', result)
    },
    changeResult(result) {
      this.$emit('autocomplete::change', result)
    },
    onArrowDown() {
      if (this.selectionCursor + 1 < this.results.length) {
        this.selectionCursor = this.selectionCursor + 1
      }
    },
    onArrowUp() {
      if (this.selectionCursor > 0) {
        this.selectionCursor = this.selectionCursor - 1
      }
    },
    onEnter() {
      this.setResult(this.results[this.selectionCursor])
      this.selectionCursor = -1
    },
    handleClickOutside(evt) {
      if (!this.$el.contains(evt.target)) {
        this.isOpen = false
        this.selectionCursor = -1
      }
    }
  },
  mounted() {
    document.addEventListener('click', this.handleClickOutside)
  },
  destroyed() {
    document.removeEventListener('click', this.handleClickOutside)
  }
}
</script>

<style scoped lang="scss">
.Autocomplete-results {
  padding: 0;
  margin: 0;
  border: 1px solid $dropdown-border-color;
  height: 120px;
  overflow: auto;
}

.Autocomplete-result.is-active {
  background-color: $blue-color;
  color: white;
}

.Autocomplete-result {
  list-style: none;
  text-align: left;
  padding: 4px 2px;
  cursor: pointer;
}

.Autocomplete-result:hover {
  background-color: $blue-color;
  color: white;
}
</style>
