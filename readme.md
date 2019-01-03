# lightshow-api

This process controls LED strips

## Build

## Operation instructions

On the Raspberry Pi, to restart after a change:

```
sudo systemctl restart lightshow-api
```
and to view the log:
```
sudo journalctl -u lightshow-api -f
```