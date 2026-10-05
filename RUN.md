# Quiet Counsel — run / tear down

## Preview (already running)
- Public: https://mil-baptist-motorola-send.trycloudflare.com
- Local: http://127.0.0.1:4173
- Server PID: see `server.pid` (node serve on 4173)
- Tunnel PID: see `tunnel.pid` (cloudflared quick tunnel)

## Restart
```bash
cd /workspace/sites/mark-alderman-tribute
npm run build
cd dist && nohup npx --yes serve -l 4173 -s . > ../server.log 2>&1 & echo $! > ../server.pid
# wait for listen, then:
nohup cloudflared tunnel --url http://127.0.0.1:4173 > ../tunnel.log 2>&1 & echo $! > ../tunnel.pid
# read URL from tunnel.log
```

## Tear down
```bash
/workspace/sites/mark-alderman-tribute/TEARDOWN.sh
```
