(ns portal.server
  (:require [express]
            [reagent.dom.server :refer [render-to-static-markup]]
            [portal.components :refer [template contact]]))

(defonce server (atom nil))

(defn respond! [component]
  (fn [req res]
    (->> (component)
         (template)
         (render-to-static-markup)
         (str "<!DOCTYPE html>\n")
         (.send res))))

(defn start! []
  (let [port 4000
        app (express)]
    (.get app "/" (respond! contact))
    (reset! server
      (.listen app port #(prn "listening on port" port)))))

(defn stop! []
  (.close @server)
  (reset! server nil))

(defn main! []
  (start!))
