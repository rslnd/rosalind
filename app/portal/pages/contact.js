import { ContactForm } from '../contactForm'

const Root = ({ children }) => {
  return <ContactForm
    customerName='Dr. Nike Morakis, Fachärztin für Urologie und Andrologie'
    customerEmail='praxis@urologie11.at'
    greeting='Dr. Nike Morakis'
  />
}

export default Root
