export default {
  id: 'm-select',
  update(el) {
    let $options = $('option[value=' + el.value + ']', $(el))
    $options.attr('selected', 'selected')
  },
  bind(el) {
    /* eslint no-undef: 0 */
    let $el = $(el)
    setTimeout(() => {
      $el.material_select()
      $el.on('change', () => {
        this.set(el.value)
      })
    }, 0)
  }
}
