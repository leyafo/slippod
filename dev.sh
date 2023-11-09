#!/bin/sh
npm run dev_vite &
P1=$!
sleep 1
npm run dev_electron &
P2=$!

trap 'echo "quit"; kill $P1; exit;' INT

# Wait only for P2 to exit
wait $P2

# After P2 exits, kill P1
echo "P2 exited. Killing P1..."
kill $P1
