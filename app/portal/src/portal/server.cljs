(ns portal.server
  (:require [express]
            [simpleddp]
            [ws]
            [clojure.walk :refer [keywordize-keys]]
            [clojure.string :refer [join]]
            [reagent.dom.server :refer [render-to-static-markup]]
            [portal.components :refer [template contact contact-success]]))

(defonce server (atom nil))

(defn- parse-bool [on?] (= on? "on"))
(defn- parse-gender [g]
  (case g
    "Female" "Female"
    "Male" "Male"
    nil))

(defn- make-note [{:keys [prescription appointment referral] :as form}]
  (->>
    [[prescription "Rezept"]
     [appointment "Termin"]
     [referral "Überweisung"]]
   (filter first)
   (map second)
   (join ", ")
   (str "Anfrage wegen ")
   (assoc form :note)))

(defn validate-contact [form]
  (-> form
      (select-keys
       [:firstName
        :lastName
        :titlePrepend
        :birthdate
        :gender
        :telephone
        :email
        :existingPatient
        :prescription
        :appointment
        :referral])
      (update :existingPatient parse-bool)
      (update :gender parse-gender)
      (update :prescription parse-bool)
      (update :appointment parse-bool)
      (update :referral parse-bool)
      (make-note)
      (dissoc :prescription :appointment :referral)))

(defn post-inbound-call [form call-meteor]
  (prn form)
  (-> (call-meteor "inboundCalls/postContactForm" form)
      (.then (fn [result] (prn result)))
      (.catch (fn [err] (prn err)))))

(defn render-page [component]
  (->> component
       (template)
       (render-to-static-markup)
       (str "<!DOCTYPE html>\n")))

(defn start! []
  (let [port 4000
        client-key js/process.env.CLIENT_KEY
        ddp-url (or js/process.env.DDP_URL "ws://localhost:3000/websocket")
        app (express)
        meteor (simpleddp. (clj->js {:endpoint ddp-url
                                     :SocketConstructor ws}))
        call-meteor (fn [name args] (.call meteor name (clj->js (into {:clientKey client-key} args))))]
    (.on meteor "ping" #(prn "meteor ping"))
    (.on meteor "pong" #(prn "meteor pong"))
    (.on meteor "ready" #(prn "meteor ready"))
    (.on meteor "nosub" #(prn "meteor nosub"))
    (.on meteor "connected" #(prn "meteor connected"))
    (.on meteor "connected" #(prn "meteor disconnected"))
    (.on meteor "error" #(prn "meteor error" %))

    (-> (call-meteor "clients/register" {:systemInfo {:portal true}})
        (.then (fn [result] (prn result)))
        (.catch (fn [err] (prn err))))

    (.use app (.urlencoded express (clj->js {:extended true})))
    (.get app "/"
          (fn [req res]
            (.redirect res "https://fxp.at")))
    (.get app "/contact"
          (fn [req res]
            (.send res (render-page (contact)))))
    (.post app "/contact"
           (fn [req res]
             (.send res (render-page (contact-success)))
             (-> (.-body req)
                 (js->clj)
                 (keywordize-keys)
                 (validate-contact)
                 (post-inbound-call call-meteor))))

    (reset! server
            (.listen app port #(prn "listening on port" port)))))

(defn stop! []
  (.close @server)
  (reset! server nil))

(defn main! []
  (start!))
