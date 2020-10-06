(ns portal.components)

(def stylesheet "
  * {
    box-sizing: border-box;
  }
  body {
    font-family: Roboto, Helvetica, Arial, sans-serif;
    font-weight: 400;
    font-style: normal;
    padding: 40px;
    max-width: 700px;
    letter-spacing: -0.04px;
    line-height: 1.5;
    color: #222222;      
  }
  .label {
    display: block;
  }
  .textfield {
    background: #eeeeee;
    border-radius: 4px;
    border: 2px solid #D0d0d0;
    font-size: 19px;
    margin-bottom: 16px;
    padding: 10px;
    max-width: 100%;
    width: 400px;
  }
  .button {
    background: #1D61A7;
    border-radius: 4px;
    border: 0;
    border-bottom: 2px solid #1D4687;
    outline: 0;
    font-size: 19px;
    margin-bottom: 16px;
    padding: 18px;
    color: #ffffff;
    max-width: 100%;
    width: 400px;
  }
")

(defn template [child]
  [:html
   [:head
    [:meta {:charset "utf-8"}]
    [:meta {:name "viewport"
            :content "width=device-width, initial-scale=1.0"}]
    [:style stylesheet]]
   [:body
    [:div#app
     child]]])

(defn required []
  [:span {:style {:display "inline-block"
                  :padding-left 3
                  :padding-right 3
                  :color "#777"}} "*"])

(defn input [name label props]
  [:div
   [:label.label {:for name}
    [:span label (when (:required props) [required])]]
   [:input.textfield (into {:name name :id name} props)]])

(defn checkbox [name label props]
  [:<>
   [:label.label {:for name}
    [:input (into {:type "checkbox" :name name :id name} props)]
    label]])

(defn radio [name value label props]
  [:div
   [:input (into {:id value :type :radio :name name} props)]
   [:label {:for value} label]])

(defn section [& children]
  [:div
   {:style {:padding-top 16}}
   (into [:<>] children)])

(defn contact []
  [:div
   [:h2 "Sehr geehrte Patientin, sehr geehrter Patient!"]
   [:p "Wir bitten Sie um Vervollständigung des Kontaktformulars. Nach Erhalt werden wir uns schnellstmöglich telefonisch mit Ihnen in Verbindung zu setzen, um Ihr Anliegen zu besprechen bzw. einen Termin zu vereinbaren."]
   [:form {:method "post"}
    [:label {:for "gender"} "Anrede"][:br]
    [:select.textfield {:id "gender" :name "gender"}
     [:option {:value "Female" :selected true} "Frau"]
     [:option {:value "Male"} "Herr"]
     [:option {:value "other"} "-"]]

    [input "titlePrepend" "Titel"]
    [input "firstName" "Vorname" {:required true}]
    [input "lastName" "Nachname" {:required true}]
    [input "birthdate" "Geburtsdatum" {:required true :placeholder "tt.mm.jjjj"}]
    [input "telephone" "Telefonnummer" {:required true}]
    [input "email" "E-Mail-Adresse"]

    [section
     [:label {:for "existingPatient"} [:span "Sind Sie bereits Patient bei uns?" [required]]]
     [radio "existingPatient" "true" "Ja" {:required true}]
     [radio "existingPatient" "false" "Nein" {:required true}]]

    [section
     [:label "Ich benötige:"][:br]
     [checkbox "prescription" "Rezept"]
     [checkbox "referral" "Überweisung"]
     [checkbox "appointment" "Termin"]]

    [section
     [checkbox "privacy" "* Ich stimme zu, dass meine ausgefüllten persönlichen Daten: Anrede, Titel, Vorname, Nachname, Geburtsdatum, Telefonnummer und E-Mail-Adresse von Dr. Sabine Schwarz & Partner Fachärzte für Haut- und Geschlechtskrankheiten GmbH, sowie deren Datenverarbeitern (Fixpoint Systems GmbH, Hetzner Online GmbH (Hosting)) zum Zwecke der Beantwortung des ausgefüllten Kontaktformulars verarbeitet werden. Diese Zustimmung kann jederzeit ohne Angabe von Gründen per Mail an Datenschutz@hautzentrum-wien.at widerrufen werden." {:required true}]]

    [section
     [:p "Ich und mein Team freuen uns, Sie bei uns begrüßen zu dürfen!" [:br] "Wir sind für Sie da!"]

     [:p [:i "Ihre Dr. Sabine Schwarz"]]

     [:input.button {:type :submit :value "Senden"}]

     [:p [required] "Pflichtfelder"]]]])

(defn contact-success []
  [:div
   [:h2 "Vielen Dank!"]
   [:p "Wir haben Ihre Anfrage erhalten und werden Sie so rasch wie möglich kontaktieren."]
   [section
    [:p "Ich und mein Team freuen uns, Sie bei uns begrüßen zu dürfen!" [:br] "Wir sind für Sie da!"]
    [:p [:i "Ihre Dr. Sabine Schwarz"]]]])
