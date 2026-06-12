import os
import sqlite3
import sys
import time

from pytrends.request import TrendReq

DB_PATH = os.path.join(os.path.dirname(os.path.abspath(__file__)), "trends.db")
conn = sqlite3.connect(DB_PATH)
cursor = conn.cursor()

cursor.execute("SELECT id, keyword FROM keywords")
keywords = cursor.fetchall()

if not keywords:
    print("No keywords found in database.")
    sys.exit(0)

pytrends = TrendReq(hl="en-US", tz=360, timeout=(10, 25))


def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


def fetch_with_retry(keyword_names, max_attempts=4):
    delay = 10
    for attempt in range(max_attempts):
        try:
            pytrends.build_payload(keyword_names, timeframe="today 3-m", geo="")
            return pytrends.interest_over_time()
        except Exception as e:
            msg = str(e)
            if "429" in msg and attempt < max_attempts - 1:
                print(f"Rate limited, waiting {delay}s before retry {attempt + 1}/{max_attempts - 1}...")
                time.sleep(delay)
                delay *= 2
            else:
                raise


# One keyword per request: pytrends normalizes scores 0-100 relative to the
# highest-volume term in a batch, so batching keywords together would let a
# single high-volume term crush every other keyword's score toward 0.
batches = list(chunks(keywords, 1))
for i, batch in enumerate(batches):
    if i > 0:
        time.sleep(5)

    keyword_ids = [row[0] for row in batch]
    keyword_names = [row[1] for row in batch]

    try:
        data = fetch_with_retry(keyword_names)

        if data.empty:
            print(f"No data returned for: {keyword_names}")
            continue

        # Drop the isPartial flag column — it's metadata, not a keyword
        if "isPartial" in data.columns:
            data = data.drop(columns=["isPartial"])

        for kid, kname in zip(keyword_ids, keyword_names):
            if kname not in data.columns:
                continue

            series = data[kname]
            saved = 0

            for i, (date_idx, val) in enumerate(series.items()):
                score = int(val)
                date_str = date_idx.date().isoformat()
                rising = 1 if (i > 0 and score > int(series.iloc[i - 1])) else 0

                cursor.execute(
                    "INSERT OR REPLACE INTO trends (keyword_id, score, rising, date) VALUES (?, ?, ?, ?)",
                    (kid, score, rising, date_str),
                )
                saved += 1

            print(f"{kname}: {saved} data points saved")

    except Exception as e:
        print(f"Error fetching {keyword_names}: {e}")
        continue

conn.commit()
conn.close()
print("Done.")
