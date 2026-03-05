/**
 * --------------------------------------------------------------------------
 * anomaly-detector-pme - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Auteur : Thibault Fayol - Consultant SEA PME
 * Site web : https://thibaultfayol.com
 * Licence : MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  TEST_MODE: true, // Mettre fales pour prod
  EMAIL: "contact@votredomaine.com",
  IMPRESSIONS_DROP_THRESHOLD: 0.5, // Alert if impressions < 50% of avg
  CPC_SPIKE_THRESHOLD: 1.5 // Alert if CPC > 150% of avg
};
function main() {
  var statsToday = AdsApp.currentAccount().getStatsFor("TODAY");
  var statsLast7Days = AdsApp.currentAccount().getStatsFor("LAST_7_DAYS");
  
  var avgImps = statsLast7Days.getImpressions() / 7;
  var avgCpc = statsLast7Days.getAverageCpc();
  
  var todayImps = statsToday.getImpressions();
  var todayCpc = statsToday.getAverageCpc();
  
  var alerts = [];
  if (avgImps > 100 && todayImps < (avgImps * CONFIG.IMPRESSIONS_DROP_THRESHOLD)) {
      alerts.push("Chute d'impressions ! Aujourd'hui : " + todayImps + " vs Avg: " + avgImps.toFixed(0));
  }
  if (avgCpc > 0 && todayCpc > (avgCpc * CONFIG.CPC_SPIKE_THRESHOLD)) {
      alerts.push("Hausse du CPC ! Aujourd'hui : €" + todayCpc.toFixed(2) + " vs Avg: $" + avgCpc.toFixed(2));
  }
  
  if (alerts.length > 0) {
      Logger.log("Anomalies détectées :\n" + alerts.join("\n"));
      if (!CONFIG.TEST_MODE && CONFIG.EMAIL !== "contact@yourdomain.com") {
          MailApp.sendEmail(CONFIG.EMAIL, "🚨 Google Ads Anomaly Alert", alerts.join("\n\n"));
      } else {
          Logger.log("[TEST] Email would be sent.");
      }
  } else {
      Logger.log("Métriques du compte stables.");
  }
}