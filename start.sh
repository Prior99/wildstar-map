#!/bin/bash
case "$1" in
        start)
                node server/server.js > server.log &
                echo $! > server.pid
                echo "Wildstar-map-server started with pid $!"
        ;;
        stop)
                pid="$(cat server.pid)"
                kill $pid
                while [ -e "/proc/$pid" ]; do sleep 1; done
                echo "Killed Wildstar-map-server with pid $pid."
        ;;
        status)
                pid="$(cat server.pid)"
                if [ -e "/proc/$pid" ]; then echo "Server seems to be running with pid $pid";
                else echo "Server is dead.";
                fi
        ;;
esac;
