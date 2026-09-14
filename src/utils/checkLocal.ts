export function checkLocal() {
  const ALERT_KEY = "aubeHair_country_alert_shown";
  fetch("https://ipapi.co/json/")
    .then((res) => res.json())
    .then((data) => {
      if (location.href.includes("exceptJp") || (data.country_code !== "JP" && !sessionStorage.getItem(ALERT_KEY))) {
        alert("Sorry This page is Japanese only.\nPlease use  Google translate.");
        sessionStorage.setItem(ALERT_KEY, "true");
      }
    })
    .catch((error) => {
      console.error(error);
    });
}
