#!/bin/sh
npm run dev_vite &
P1=$!
sleep 1
npm run dev_electron &
P2=$!

trap ctrl_c INT
function ctrl_c() {
    echo 'quite'
    kill $P1
    kill $P2
}
wait $P1 $P2