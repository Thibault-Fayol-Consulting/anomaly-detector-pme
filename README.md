# Anomaly Detector PME

> Google Ads Script for SMBs — Detect abnormal drops in impressions, CPC spikes, and cost surges.

## What it does

This script compares today's account-level metrics against a rolling average (last 7 days by default). It checks for three types of anomalies: impression drops, CPC spikes, and cost spikes. When any threshold is exceeded, an email alert is sent with the current values and baseline comparison.

## Setup

1. Open Google Ads > Tools > Scripts
2. Create a new script and paste the code from `main_en.gs` (or `main_fr.gs` for French)
3. Update the `CONFIG` block at the top
4. Authorize and run a preview first
5. Schedule: **Daily** (ideally in the afternoon for meaningful same-day data)

## CONFIG reference

| Parameter | Default | Description |
|-----------|---------|-------------|
| `TEST_MODE` | `true` | When true, logs alerts without sending emails |
| `EMAIL` | `contact@yourdomain.com` | Email address for anomaly alerts |
| `IMPRESSIONS_DROP_THRESHOLD` | `0.5` | Alert if today's impressions < 50% of average |
| `CPC_SPIKE_THRESHOLD` | `1.5` | Alert if today's CPC > 150% of average |
| `COST_SPIKE_THRESHOLD` | `1.5` | Alert if today's cost > 150% of daily average |
| `COMPARISON_RANGE` | `LAST_7_DAYS` | Baseline period for average calculation |
| `COMPARISON_DAYS` | `7` | Number of days in the comparison range |

## How it works

1. Fetches today's account stats and the baseline period stats
2. Calculates daily averages for impressions, CPC, and cost
3. Compares today's values against thresholds
4. Sends an email alert listing all anomalies with percentage comparisons

## Requirements

- Google Ads account
- Google Ads Scripts access

## License

MIT — Thibault Fayol Consulting
