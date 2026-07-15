#!/usr/bin/env bash
# Generates varied traffic against the NestJS API for New Relic APM visibility.
# Run duration: ~5 minutes. Ctrl+C to stop early.

BASE="http://localhost:3000/api"
END=$((SECONDS + 300))
ITER=0

PRODUCT_IDS=("1" "2" "3" "999")   # 999 triggers 404
CATEGORIES=("widgets" "gadgets" "demo" "")
SLOW_DURATIONS=("500" "1000" "2000" "3000")

echo "Traffic generation started — runs for 5 minutes. Check New Relic APM in ~2 min."
echo "Press Ctrl+C to stop."
echo ""

while [ $SECONDS -lt $END ]; do
  ITER=$((ITER + 1))
  MOD=$((ITER % 20))

  # ── High-frequency: products & health (every iteration) ──────────────────
  curl -sf "$BASE/products" > /dev/null
  curl -sf "$BASE/health"   > /dev/null

  # ── Medium-frequency: filtered products & single product ─────────────────
  CAT=${CATEGORIES[$((ITER % ${#CATEGORIES[@]}))]}
  [ -n "$CAT" ] && curl -sf "$BASE/products?category=$CAT" > /dev/null
  PID=${PRODUCT_IDS[$((ITER % ${#PRODUCT_IDS[@]}))]}
  curl -sf "$BASE/products/$PID" > /dev/null   # 999 → 404, captured by NR

  # ── Orders: create one every 3 iterations ────────────────────────────────
  if [ $((ITER % 3)) -eq 0 ]; then
    PRICE=$(echo "scale=2; $((RANDOM % 150 + 10)) + 0.99" | bc)
    QTY=$(( (ITER % 3) + 1 ))
    CUSTOMER="cust-$(( (ITER % 5) + 1 ))"
    curl -sf -X POST "$BASE/orders" \
      -H "Content-Type: application/json" \
      -d "{\"customerId\":\"$CUSTOMER\",\"items\":[{\"productId\":\"$((ITER % 3 + 1))\",\"quantity\":$QTY,\"price\":$PRICE}]}" \
      > /dev/null
  fi

  # ── Simulate: slow transaction every 5 iterations ────────────────────────
  if [ $((ITER % 5)) -eq 0 ]; then
    MS=${SLOW_DURATIONS[$((ITER % ${#SLOW_DURATIONS[@]}))]}
    curl -sf "$BASE/simulate/slow?ms=$MS" > /dev/null &
  fi

  # ── Simulate: custom metric every 4 iterations ───────────────────────────
  if [ $((ITER % 4)) -eq 0 ]; then
    VAL=$(( RANDOM % 500 + 1 ))
    curl -sf "$BASE/simulate/metric?value=$VAL" > /dev/null
  fi

  # ── Simulate: handled error every 7 iterations ───────────────────────────
  if [ $((ITER % 7)) -eq 0 ]; then
    curl -sf "$BASE/simulate/error" > /dev/null
  fi

  # ── Simulate: 500 crash every 15 iterations ──────────────────────────────
  if [ $((ITER % 15)) -eq 0 ]; then
    curl -sf "$BASE/simulate/crash" > /dev/null
  fi

  # ── Simulate: load burst every 10 iterations ─────────────────────────────
  if [ $((ITER % 10)) -eq 0 ]; then
    curl -sf "$BASE/simulate/load?count=10" > /dev/null &
  fi

  REMAINING=$(( END - SECONDS ))
  printf "\r  Iteration %-4d | ~%ds remaining | open: one.newrelic.com" "$ITER" "$REMAINING"
  sleep 2
done

wait
echo ""
echo "Traffic generation complete after $ITER iterations."
