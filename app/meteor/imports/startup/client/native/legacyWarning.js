import Alert from 'react-s-alert'

export default () => {
  setTimeout(() => {
    if (window.native) {
      Alert.error('Das Programm ist veraltet und muss neu installiert werden. Bitte über den Support-Chat rechts unten melden. Danke und bitte um Entschuldigung für die Umstände!', {
        timeout: 'none',
        customFields: { icon: 'times' }
      })
    }
  }, 4000)
}
