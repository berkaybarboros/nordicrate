#!/bin/bash
# NordicRate — manual redeploy.
#
# There is one deploy path now: deploy/release.sh. A cron entry runs it every ten
# minutes and it releases whatever is on main; this wrapper only forces a release
# right now (same commit included), for when you do not want to wait.
#
#   bash /var/www/nordicrate/deploy/redeploy.sh
exec /var/www/nordicrate/deploy/release.sh --force
