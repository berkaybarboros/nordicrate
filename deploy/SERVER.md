# Server runbook (Hetzner VPS)

One box runs seven pm2 apps and several Docker containers behind
nginx-proxy-manager (NPM). NordicRate is one tenant among them, so anything done
to the firewall or to Docker affects other projects too.

## Deploy

`deploy/release.sh` is the only deploy path.

- Cron runs it at minutes 5,15,25,… (`crontab -l | grep release`). TagSentry's own
  release runs at */10, so NordicRate is offset by five minutes to avoid two
  Next.js builds at once on a 3.8 GB box.
- It releases only when `origin/main` moved; `--force` rebuilds at the same commit,
  `--check` reports without changing anything.
- After the build it reloads pm2 and curls the site. On a failed install, a failed
  build or an unhealthy site it restores the previous commit **and** the previous
  `.next`, then says whether the restore brought the site back.
- `deploy/redeploy.sh` just calls `release.sh --force`.
- Log: `/var/log/nordicrate-release.log` (logrotate: weekly, 4 kept).

A push to `main` therefore ships within ten minutes without anyone's laptop.

## Firewall

Two layers, because Docker bypasses one of them.

1. **ufw** — default deny incoming; allows 22, 80, 443, plus **all traffic from
   `172.16.0.0/12` and `10.0.0.0/8`**. That last rule is not optional: NPM runs in
   Docker and proxies to pm2 apps listening on the host (nordicrate 3001,
   berkaybarboros, nbastats, nutriscan, openreply). Without it every pm2-backed
   site returns nothing while the containers keep working.
2. **`/root/firewall-rules.sh`** (systemd unit `firewall-rules.service`, after
   docker.service) — drops internet access to container ports published on
   `0.0.0.0`: **81 (NPM admin), 5432 (openreply Postgres), 5678 (n8n), 6379
   (openreply Redis)**. Docker writes its own iptables rules and ignores ufw;
   `DOCKER-USER` is the chain it leaves alone, and it must be reapplied after a
   Docker restart — the unit does that.

**Never run `ufw reset` (or `ufw disable/enable` blindly) without restarting
Docker afterwards.** `ufw reset` flushes the whole iptables ruleset including
Docker's NAT rules; containers keep running but nothing from the internet reaches
them. Recovery: `systemctl restart docker && systemctl start firewall-rules.service`.

Still open on purpose: **8082 and 8083** (hangikredi and reefeed demo containers).
NPM reaches those two through the host address, so a DOCKER-USER drop takes the
sites down. The real fix is to bind them to `127.0.0.1` in their own compose files
and let NPM proxy the container name; that belongs to those projects.

## Secrets

`/var/www/nordicrate/.env.local` holds every secret; the crontab lines for
`/api/cron/*` carry `CRON_SECRET` inline. Rotating it means changing both, then
`pm2 restart nordicrate --update-env`, then the n8n credential. Backups are written
as `.env.local.bak.<timestamp>` and `/root/crontab.bak.<timestamp>`.

## Known weaknesses (not fixed here)

- SSH still allows `PermitRootLogin yes` and `PasswordAuthentication yes`, and
  fail2ban is not installed. Key-based login works; turning passwords off is a
  one-line change plus a verification login.
- `hangikredi.berkaybarboros.com` returns 525: its NPM host listens on port 80
  only while Cloudflare is set to Full (strict). Pre-existing.
- Disk is at 82%; `deploy/scraper/node_modules` and seven `.next` builds are the
  bulk of it.
