# lightshow-api

This process controls LED strips, connected to a Raspberry Pi.

## Install
To install typescript:
```
npm install typescript @types/config @types/express
```

## Build
```
npm run build
```

## Operation instructions

On the Raspberry Pi, to restart after a change:

```
sudo systemctl restart lightshow-api
```
and to view the log:
```
sudo journalctl -u lightshow-api -f
```