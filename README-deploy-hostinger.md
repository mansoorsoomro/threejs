Deployment instructions for Hostinger

Purpose
-------
This document is a ready-to-send instruction package for your client explaining what is needed to deploy the Next.js app to Hostinger. It contains two deployment options (VPS and Shared/static), a clear checklist of information you must provide, and the config/template files included in this repo.

Checklist: information your developer needs
----------------------------------------
- Hostinger plan type: `VPS` or `Shared Hosting`
- If VPS: server IP (e.g. `123.45.67.89`) and SSH username (usually `root`)
- If Shared: FTP credentials or hPanel access to upload `public_html`
- Domain name to configure (e.g. `example.com`)
- Git repo URL (and access method: public, SSH key, or deploy token)
- Environment variables for production (list keys and values)

Files added in this repo
------------------------
- `deploy/templates/ecosystem.config.js` — PM2 ecosystem template for VPS
- `deploy/templates/nginx-myapp.conf` — Nginx reverse-proxy template
- `deploy/deploy_local_export.sh` — Build + export and zip script for shared hosting

Option A — Hostinger VPS (recommended)
--------------------------------------
What your developer will do (copy/paste commands):

1) SSH into server
```
ssh root@YOUR_SERVER_IP
```

2) Install Node, Nginx, pm2, certbot
```
apt update && apt upgrade -y
apt install -y curl git build-essential
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs nginx certbot python3-certbot-nginx
npm install -g pm2
```

3) Clone repository (or pull) into `/var/www/myapp` and install deps
```
cd /var/www
git clone GIT_REPO_URL myapp
cd myapp
npm ci
```

4) Build and start with pm2
```
npm run build
pm2 start npm --name myapp -- start
pm2 save
pm2 startup systemd
# run the printed command from pm2 startup output to enable service
```

5) Put the provided `deploy/templates/nginx-myapp.conf` file at `/etc/nginx/sites-available/myapp`, update `server_name`, enable and reload Nginx:
```
ln -s /etc/nginx/sites-available/myapp /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

6) Get SSL certificate (Certbot will update Nginx config automatically):
```
certbot --nginx -d example.com -d www.example.com
```

Notes for environment variables
- You can use `deploy/templates/ecosystem.config.js` to set `env` values for PM2.
- Alternatively create a `.env.production` file and ensure your start script reads it when building.

Option B — Hostinger Shared Hosting (static)
--------------------------------------------
Use this when you do NOT have VPS and Hostinger does not allow Node.

Limitations: server-side rendering, API routes, incremental static regen, and Next Image optimization will not work. Only use if your site can be fully statically exported.

How to produce files to upload (local):
```
# From local machine in project root:
npm ci
npm run build
npm run export # this produces `out/` folder
zip -r site-out.zip out/
```

Upload `out/` contents to Hostinger `public_html` using the hPanel File Manager or FTP. Enable SSL from hPanel.

What to send to me (or your deployer) if you want me to finish deploy
----------------------------------------------------------------------
- Hostinger plan type (VPS or Shared)
- If VPS: Server IP, SSH username, and a deploy SSH key or passwordless access
- Domain name
- Git repo URL and access (or a zip of the project)
- Environment variables for production

If you provide the above, I can complete the remote steps (installing Node, Nginx, PM2, building, starting the app, and issuing SSL) remotely.

If you prefer to do it yourself, share this document with your hosting person and give them the templates in `deploy/templates/`.

Contact
-------
If anything is unclear, tell me which hosting type you have and I will produce a single one-page deployment instruction tailored to your client (copy-paste ready).
