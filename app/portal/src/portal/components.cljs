(ns portal.components)

(defn template [child]
  [:html
   [:head
    [:meta {:charset "utf-8"}]
    [:meta {:name "viewport"
            :content "width=device-width, initial-scale=1.0"}]]
   [:body
    [:div#app
     child]]])

(defn input [name label]
  [:div
   [:label {:for name} label]
   [:input {:name name :id name}]])

(defn contact []
  [:form
   [input "firstName" "Vorname"]
   [input "lastName" "Nachname"]])
