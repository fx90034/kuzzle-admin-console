export default {
  id: 'toaster',
  bind (el, binding) {
    /* eslint no-undef: 0 */
    this.vm.$on('toast', (text, cssClass = '', duration = 5000, cb) => {
      Materialize.toast(text, duration, cssClass, cb)
    })
  }
}
