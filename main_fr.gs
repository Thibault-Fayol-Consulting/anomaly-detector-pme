/**
 * --------------------------------------------------------------------------
 * Anomaly Detector for SMBs - Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Recevez des alertes e-mail instantanées lorsque vos métriques (CPC, Impressions) chutent ou augmentent de manière anormale.
 *
 * Author: Thibault Fayol - Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  // CONFIGURATION HERE
  TEST_MODE: true, // Set to false to apply changes
  NOTIFICATION_EMAIL: "contact@yourdomain.com"
};

function main() {
  Logger.log("Début Anomaly Detector for SMBs...");
  // Core Logic Here
  
  if (CONFIG.TEST_MODE) {
    Logger.log("Mode Test activé : Aucune modification ne sera appliquée.");
  } else {
    // Apply changes
  }
  
  Logger.log("Terminé.");
}
