#!/bin/bash
# Re-runs process_data.py whenever campus-related exports grow.
echo "Watching for completed campus downloads..."
PREV_COUNT=0
while true; do
  PUBLIC_COUNT=$(ls data/raw/campus_*.csv 2>/dev/null | wc -l | tr -d ' ')
  TYPE_COUNT=$(ls data/raw/type_campus_*.csv 2>/dev/null | wc -l | tr -d ' ')
  COUNT=$((PUBLIC_COUNT + TYPE_COUNT))
  CAMPUSES=$(ls data/raw/campus_*.csv data/raw/type_campus_*.csv 2>/dev/null | sed -E 's/.*(campus_|type_campus_[^_]+_)//' | sed 's/_year_.*//' | sort -u | tr '\n' ' ')
  YEARS_PER_CAMPUS=$(ls data/raw/year_*.csv 2>/dev/null | wc -l | tr -d ' ')
  if [ -z "$YEARS_PER_CAMPUS" ] || [ "$YEARS_PER_CAMPUS" -eq 0 ]; then
    YEARS_PER_CAMPUS=1
  fi

  if [ "$COUNT" != "$PREV_COUNT" ]; then
    echo "[$(date '+%H:%M:%S')] $COUNT campus files ($PUBLIC_COUNT public, $TYPE_COUNT type-campus) | campuses: $CAMPUSES"
    # Regenerate if we have a multiple of the known year count.
    if [ $((COUNT % YEARS_PER_CAMPUS)) -eq 0 ] && [ "$COUNT" -gt "0" ]; then
      echo "  → Running process_data.py..."
      python3 process_data.py 2>&1 | tail -5
    fi
    PREV_COUNT=$COUNT
  fi
  sleep 10
done
