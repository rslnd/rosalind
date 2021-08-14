import { ContactForm } from '../contactForm'

const isProduction = (typeof window !== 'undefined' ? (window.location.protocol === 'https:') : true)
const apiBaseUrl = isProduction ? '' : 'http://localhost:3000'

const Root = ({ children }) => {
  return <ContactForm
    customerName='Dr. Nike Morakis, Fachärztin für Urologie und Andrologie'
    customerEmail='praxis@urologie11.at'
    instructions='Um Ihren Termin zu vereinbaren, füllen Sie bitte das nachstehende Formular aus.'
    disclaimer='Wir bitten Sie höflichst, im Falle einer Verhinderung Ihren Termin rechtzeitig (mind. 24 Stunden vorher) abzusagen oder zu verschieben. Wir bitten um Ihr Verständnis, dass nicht rechtzeitig abgesagte Termine in Rechnung gestellt werden können.'
    greeting='Dr. Nike Morakis & Team'
    apiBaseUrl={apiBaseUrl}
  />
}

export default Root
