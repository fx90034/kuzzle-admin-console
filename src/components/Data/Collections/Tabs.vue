<template>
  <div class="nav">
    <ul>
      <li :class="{active: isRouteActive('DataDocumentsList')}" v-if="!$store.state.collection.isRealtimeOnly">
        <router-link :to="{name: 'DataDocumentsList', params: {index: $route.params.index, collection: $route.params.collection}}">
          Browse
        </router-link>
      </li>
      <li :class="{active: isRouteActive('DataCollectionWatch')}">
        <router-link href="#!" :to="{name: 'DataCollectionWatch', params: {index: $route.params.index, collection: $route.params.collection}}">
          Watch
        </router-link>
      </li>
      <li :class="{active: isRouteActive('DataCreateDocument')}">
        <router-link v-if="canCreateDocument($route.params.index, $route.params.collection) && !$store.state.collection.isRealtimeOnly"
          :to="{name: 'DataCreateDocument', params: {index: $route.params.index, collection: $route.params.collection}}">
          Create a document
        </router-link>
        <a v-if="!canCreateDocument($route.params.index, $route.params.collection) && !$store.state.collection.isRealtimeOnly"
           class="disabled"
           title="You are not allowed to create a document in this collection">
          Create a document
        </a>
      </li>
    </ul>
  </div>
</template>

<style rel="stylesheet/scss" lang="scss" scoped>
.nav li {
  display: inline-block;
  a {
    padding: 10px 8px;
    text-transform: uppercase;
    color: #666;
    letter-spacing: 1px;
    margin: 0 10px;

    &:hover {
      border-bottom: solid 2px #ccc;
    }

    &.disabled {
      color: #9f9f9f;
    }
  }
  &.active {
    a {
      border-bottom: solid 2px #002835;
    }
  }
}
</style>

<script>
import { canCreateDocument } from '../../../services/userAuthorization'

export default {
  name: 'CollectionTabs',
  methods: {
    isRouteActive(routeName) {
      if (Array.isArray(routeName)) {
        return routeName.indexOf(this.$route.name) >= 0
      }

      return this.$route.name === routeName
    },
    canCreateDocument
  }
}
</script>
