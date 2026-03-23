/**
 * --------------------------------------------------------------------------
 * Anomaly Detector PME — Script Google Ads pour PME
 * --------------------------------------------------------------------------
 * Detecte les anomalies au niveau du compte : chutes d impressions,
 * pics de CPC et surcharges de cout via requetes GAQL.
 *
 * Auteur :  Thibault Fayol — Consultant SEA PME
 * Site :    https://thibaultfayol.com
 * Licence : MIT
 * --------------------------------------------------------------------------
 */

var CONFIG = {
  // -- General --
  TEST_MODE: true,
  EMAIL: 'contact@votredomaine.com',

  // -- Seuils --
  IMPRESSIONS_DROP_THRESHOLD: 0.5,
  CPC_SPIKE_THRESHOLD: 1.5,
  COST_SPIKE_THRESHOLD: 1.5,

  // -- Periode --
  COMPARISON_DAYS: 7
};

function main() {
  try {
    var tz = AdsApp.currentAccount().getTimeZone();
    var today = Utilities.formatDate(new Date(), tz, 'yyyy-MM-dd');
    Logger.log('Anomaly Detector — execution du ' + today);

    var endDate = new Date();
    var startDate = new Date();
    startDate.setDate(startDate.getDate() - CONFIG.COMPARISON_DAYS);
    var startStr = Utilities.formatDate(startDate, tz, 'yyyy-MM-dd');
    var endStr = Utilities.formatDate(endDate, tz, 'yyyy-MM-dd');

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

    if (avgImps > 100 && todayImps < (avgImps * CONFIG.IMPRESSIONS_DROP_THRESHOLD)) {
      alerts.push('CHUTE IMPRESSIONS : Aujourd\'hui ' + todayImps + ' vs moy. ' + avgImps.toFixed(0)
        + ' (' + (avgImps > 0 ? ((todayImps / avgImps) * 100).toFixed(0) : '0') + '% du normal)');
    }

    if (avgCpc > 0 && todayCpc > (avgCpc * CONFIG.CPC_SPIKE_THRESHOLD)) {
      alerts.push('PIC CPC : Aujourd\'hui ' + todayCpc.toFixed(2) + ' EUR vs moy. ' + avgCpc.toFixed(2) + ' EUR'
        + ' (' + ((todayCpc / avgCpc) * 100).toFixed(0) + '% du normal)');
    }

    if (avgCost > 0 && todayCost > (avgCost * CONFIG.COST_SPIKE_THRESHOLD)) {
      alerts.push('PIC COUT : Aujourd\'hui ' + todayCost.toFixed(2) + ' EUR vs moy. ' + avgCost.toFixed(2) + ' EUR'
        + ' (' + ((todayCost / avgCost) * 100).toFixed(0) + '% du normal)');
    }

    if (alerts.length > 0) {
      var subject = 'Alerte Anomalie Google Ads — ' + alerts.length + ' probleme(s)';
      var body = 'Date : ' + today + '\n'
        + 'Compte : ' + AdsApp.currentAccount().getName() + '\n\n'
        + alerts.join('\n\n') + '\n\n'
        + '--- Reference (' + CONFIG.COMPARISON_DAYS + ' jours) ---\n'
        + 'Moy. impressions/jour : ' + avgImps.toFixed(0) + '\n'
        + 'Moy. CPC : ' + avgCpc.toFixed(2) + ' EUR\n'
        + 'Moy. cout/jour : ' + avgCost.toFixed(2) + ' EUR';

      Logger.log(subject + '\n' + body);

      if (!CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@votredomaine.com') {
        MailApp.sendEmail(CONFIG.EMAIL, subject, body);
      } else {
        Logger.log('[MODE TEST] Email aurait ete envoye.');
      }
    } else {
      Logger.log('Toutes les metriques sont dans la normale.');
    }

  } catch (e) {
    Logger.log('ERREUR FATALE : ' + e.message);
    if (!CONFIG.TEST_MODE && CONFIG.EMAIL !== 'contact@votredomaine.com') {
      MailApp.sendEmail(CONFIG.EMAIL, 'Anomaly Detector — Erreur', e.message);
    }
  }
}
