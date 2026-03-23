/**
 * --------------------------------------------------------------------------
 * Anomaly Detector PME — Google Ads Script for SMBs
 * --------------------------------------------------------------------------
 * Detects anomalies in account-level metrics: impressions drops,
 * CPC spikes, and cost surges compared to recent averages.
 * Uses GAQL queries for performance data.
 *
 * Author:  Thibault Fayol — Consultant SEA PME
 * Website: https://thibaultfayol.com
 * License: MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  // -- General --
  TEST_MODE: true,                          // Set to false to send emails
  EMAIL: 'contact@yourdomain.com',          // Alert recipient

  // -- Thresholds --
  IMPRESSIONS_DROP_THRESHOLD: 0.5,          // Alert if today < 50% of avg
  CPC_SPIKE_THRESHOLD: 1.5,                // Alert if today CPC > 150% of avg
  COST_SPIKE_THRESHOLD: 1.5,               // Alert if today cost > 150% of avg daily

  // -- Date range --
  COMPARISON_DAYS: 7                        // Number of days for baseline average
};

function main() {
  try {
    var tz = AdsApp.currentAccount().getTimeZone();
    var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
    Logger.log('Anomaly Detector — run started ' + today);

    // Compute date range for baseline
    var endDate = new Date();
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - CONFIG.COMPARISON_DAYS);
    var startStr = Utilities.formatDate(startDate, tz, 'yyyy-MM-dd');
    var endStr = Utilities.formatDate(endDate, tz, 'yyyy-MM-dd');

    // Today's metrics via GAQL
    var todayQuery = 'SELECT metrics.impressions, metrics.clicks, metrics.cost_micros '
      + 'FROM customer '
      + 'WHERE segments.date = \'' + today + '\'';
    var todayRows = AdsApp.search(todayQuery);

    var todayImps = 0;
    var todayClicks = 0;
    var todayCostMicros = 0;
    for (var i = 0; i < todayRows.length; i++) {
      todayImps += parseInt(todayRows[i].metrics.impressions, 10) || 0;
      todayClicks += parseInt(todayRows[i].metrics.clicks, 10) || 0;
      todayCostMicros += parseInt(todayRows[i].metrics.costMicros, 10) || 0;
    }
    var todayCost = todayCostMicros / 1000000;
    var todayCpc = todayClicks > 0 ? todayCost / todayClicks : 0;

    // Baseline metrics via GAQL
    var baseQuery = 'SELECT metrics.impressions, metrics.clicks, metrics.cost_micros '
      + 'FROM customer '
      + 'WHERE segments.date BETWEEN \'' + startStr + '\' AND \'' + endStr + '\'';
    var baseRows = AdsApp.search(baseQuery);

    var baseImps = 0;
    var baseClicks = 0;
    var baseCostMicros = 0;
    for (var j = 0; j < baseRows.length; j++) {
      baseImps += parseInt(baseRows[j].metrics.impressions, 10) || 0;
      baseClicks += parseInt(baseRows[j].metrics.clicks, 10) || 0;
      baseCostMicros += parseInt(baseRows[j].metrics.costMicros, 10) || 0;
    }
    var avgImps = baseImps / CONFIG.COMPARISON_DAYS;
    var baseCost = baseCostMicros / 1000000;
    var avgCpc = baseClicks > 0 ? baseCost / baseClicks : 0;
    var avgCost = baseCost / CONFIG.COMPARISON_DAYS;

    var alerts = [];

    // Impressions drop
    if (avgImps > 100 && todayImps < (avgImps * CONFIG.IMPRESSIONS_DROP_THRESHOLD)) {
      alerts.push('IMPRESSIONS DROP: Today ' + todayImps + ' vs avg ' + avgImps.toFixed(0)
        + ' (' + (avgImps > 0 ? ((todayImps / avgImps) * 100).toFixed(0) : '0') + '% of normal)');
    }

    // CPC spike
    if (avgCpc > 0 && todayCpc > (avgCpc * CONFIG.CPC_SPIKE_THRESHOLD)) {
      alerts.push('CPC SPIKE: Today $' + todayCpc.toFixed(2) + ' vs avg $' + avgCpc.toFixed(2)
        + ' (' + ((todayCpc / avgCpc) * 100).toFixed(0) + '% of normal)');
    }

    // Cost spike
    if (avgCost > 0 && todayCost > (avgCost * CONFIG.COST_SPIKE_THRESHOLD)) {
      alerts.push('COST SPIKE: Today $' + todayCost.toFixed(2) + ' vs avg $' + avgCost.toFixed(2)
        + ' (' + ((todayCost / avgCost) * 100).toFixed(0) + '% of normal)');
    }

    if (alerts.length > 0) {
      var subject = 'Google Ads Anomaly Alert — ' + alerts.length + ' issue(s) detected';
      var body = 'Date: ' + today + '\n'
        + 'Account: ' + AdsApp.currentAccount().getName() + '\n\n'
        + alerts.join('\n\n') + '\n\n'
        + '--- Baseline (' + CONFIG.COMPARISON_DAYS + ' days) ---\n'
        + 'Avg daily impressions: ' + avgImps.toFixed(0) + '\n'
        + 'Avg CPC: $' + avgCpc.toFixed(2) + '\n'
        + 'Avg daily cost: $' + avgCost.toFixed(2);

      Logger.log(subject + '\n' + body);

      if (!CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@yourdomain.com') {
        MailApp.sendEmail(CONFIG.EMAIL, subject, body);
      } else {
        Logger.log('[TEST MODE] Email would be sent.');
      }
    } else {
      Logger.log('All metrics are within normal range.');
    }

  } catch (e) {
    Logger.log('FATAL ERROR: ' + e.message);
    if (!CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@yourdomain.com') {
      MailApp.sendEmail(CONFIG.EMAIL, 'Anomaly Detector — Error', e.message);
    }
  }
}
