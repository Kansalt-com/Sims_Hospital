#!/usr/bin/env bash
set -euo pipefail

cp /var/www/sims-hospital/deployment/nginx/k3s-subdomains.conf /etc/nginx/sites-available/k3s-hms
ln -sf /etc/nginx/sites-available/k3s-hms /etc/nginx/sites-enabled/k3s-hms
nginx -t
systemctl reload nginx
