export const motivationalQuotes = [
  'You\'re doing great.',
  'Have a great week.',
  'Today is beautiful.',
  'Good work.'
]

export const getRandomMotivationalQuote = () => {
  return motivationalQuotes[Math.floor(Math.random() * motivationalQuotes.length)]
}

export const RandomMotivationalQuote = () => (
  <span>{getRandomMotivationalQuote()}</span>
)
