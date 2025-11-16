"use client";

import { useEffect } from "react";

export default function ServiceWorkerRegistration() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((registration) => {
            console.log("Service Worker enregistré:", registration.scope);
          })
          .catch((error) => {
            console.log("Échec enregistrement Service Worker:", error);
          });
      });
    }
  }, []);

  return null;
}
