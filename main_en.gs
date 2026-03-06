/**
 * --------------------------------------------------------------------------
 * anomaly-detector-pme - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Author: Thibault Fayol - Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */
var CONFIG = { TEST_MODE: true, NOTIFICATION_EMAIL: "contact@domain.com", MAX_CPC_INCREASE_PERCENT: 50 };
function main() {
  Logger.log("Running Anomaly Detector...");
  var statsToday = AdsApp.currentAccount().getStatsFor("TODAY");
  var statsLast7 = AdsApp.currentAccount().getStatsFor("LAST_7_DAYS");
  var cpcToday = statsToday.getAverageCpc();
  var cpcHistory = statsLast7.getAverageCpc();
  if (cpcHistory > 0) {
    var increase = ((cpcToday - cpcHistory) / cpcHistory) * 100;
    Logger.log("CPC increase vs last 7 days: " + increase.toFixed(2) + "%");
    if (increase > CONFIG.MAX_CPC_INCREASE_PERCENT && !CONFIG.TEST_MODE) {
        MailApp.sendEmail(CONFIG.NOTIFICATION_EMAIL, "Google Ads CPC Anomaly", "CPC has increased by " + increase.toFixed(2) + "% today.");
    }
  }
}
