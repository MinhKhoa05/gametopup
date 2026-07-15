# Nginx Configuration

This directory contains the Nginx configuration used for the production VPS.

## Apply Configuration

```sh
sudo cp deployments/nginx/gametopup.conf /etc/nginx/sites-enabled/gametopup
```

Validate the configuration:

```sh
sudo nginx -t
```

Reload Nginx:

```sh
sudo systemctl reload nginx
```

For the complete deployment process, see `docs/deployment.md`.
