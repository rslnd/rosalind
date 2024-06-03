import { ContactForm } from '../contactForm'

const Root = ({ children }) => {
  return <ContactForm
    customerName='Dr. Nike Morakis, Fachärztin für Urologie und Andrologie'
    customerEmail='praxis@urologie11.at'
    instructions='Um Ihren Termin zu vereinbaren, füllen Sie bitte das nachstehende Formular aus.'
    instructionsDisclaimer={<>
      <p>
        Wenn Sie ein akutes Problem haben oder ihr Wunschtermin nicht online verfügbar sein sollte,
        bitten wir Sie um telefonische Kontaktaufnahme.
      </p>
      <p>
        Folgende Termine können NICHT online vergeben werden, sondern nur telefonisch:
      </p>
      <ul>
        <li>Blasenspiegelung (Cystoskopie)</li>
        <li>Schienenentfernung</li>
        <li>Befundbesprechung</li>
        <li>Privattermin (z.B. Vasektomiegespräch)</li>
      </ul>
    </>}
    disclaimer='Wir bitten Sie höflichst, im Falle einer Verhinderung Ihren Termin rechtzeitig (mind. 24 Stunden vorher) abzusagen oder zu verschieben. Wir bitten um Ihr Verständnis, dass nicht rechtzeitig abgesagte Termine in Rechnung gestellt werden können.'
    greeting='Dr. Nike Morakis & Team'
    confirmationInfo={(() => {
      const admissionFormLink = 'https://www.urologie11.at/wp-content/uploads/2021/08/Anmeldeformular_Uro11_16Aug_final.pdf'
      return <>
        <p><b>
          Bitte bringen Sie zu dem Termin wenn möglich das <a href={admissionFormLink} target='_blank'>ausgefüllte Anmeldeformular</a> mit.
        </b></p>
        <a
          className='button'
          href={admissionFormLink}
          target='_blank'
        >Anmeldeformular herunterladen</a>
        <br />
        <p>
          <b>
            Kommen Sie das erste Mal in unsere Ordination oder waren Sie schon länger nicht bei uns?
          </b><br />
          Erscheinen Sie bitte mit gefüllter Blase und nehmen Sie relevante Befunde und eine aktuelle Medikamentenliste mit.</p>
      </>
    })()}
    contactInfo={<>
      +43 1 877 32 79<br />
      Simmeringer Hauptstraße 40<br />
      Stiege 4, 1. Stock<br />
      A-1110 Wien<br /><br />
    </>}
    ical={{
      url: 'https://urologie11.at',
      location: 'Simmeringer Hauptstraße 40, Stiege 4 - 1. Stock, 1110 Wien',
      name: 'Urologie11',
      description: 'Urologie11 +43 1 877 32 79'
    }}
  />
}

export default Root
