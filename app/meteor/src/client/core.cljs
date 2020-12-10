(ns client.core
  (:require [reagent.core :refer [reactify-component]]))

(js/console.log "Hello from client.core 🦄")


(defn ^:export widg [{:keys [title children]}]
  [:div [:h2 "Yaay" title] [:p "how even?" children]])

(defn ^:export reactify []
  (reactify-component widg))
