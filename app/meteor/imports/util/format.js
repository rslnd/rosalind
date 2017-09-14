const currencyRoundedFormatter = new Intl.NumberFormat('de-AT', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
})

const currencyFormatter = new Intl.NumberFormat('de-AT', {
  style: 'currency',
  currency: 'EUR'
})

const integerFormatter = new Intl.NumberFormat('de-AT', {
  minimumFractionDigits: 0,
  maximumFractionDigits: 0
})

const floatFormatter = new Intl.NumberFormat('de-AT', { maximumFractionDigits: 1 })

export const currencyRounded = n => n && currencyRoundedFormatter.format(n)

export const currency = n => n && currencyFormatter.format(n)

export const integer = n => n && integerFormatter.format(n)

export const float = n => n && floatFormatter.format(n)

export const conditionalFloat = n => n &&
  n < 10
  ? floatFormatter.format(n)
  : integerFormatter.format(n)

export const percentage = (props) => {
  if (!props.part && !props.value) { return null }

  const value = props.value || (props.part / props.of)
  let p = conditionalFloat(100 * value)

  if (!props.plain) {
    p = p + '%'
  }

  return p
}
