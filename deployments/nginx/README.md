# Production Nginx

## Copy config

sudo cp deployment/nginx/gametopup.conf /etc/nginx/sites-enabled/gametopup

## Validate

sudo nginx -t

## Reload

sudo systemctl reload nginx