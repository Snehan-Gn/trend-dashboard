import os
import sqlite3
import sys
import time
from datetime import date

from pytrends.request import TrendReq

conn = sqlite3.connect(os.path.join(os.path.dirname(__file__), "trends.db"))
cursor = conn.cursor()

cursor.execute("SELECT id, keyword FROM keywords")
keywords = cursor.fetchall()

if not keywords:
    print("No keywords found in database.")
    sys.exit(0)

pytrends = TrendReq(hl="en-US", tz=360, timeout=(10, 25))

today = date.today().isoformat()


def chunks(lst, n):
    for i in range(0, len(lst), n):
        yield lst[i : i + n]


for batch in chunks(keywords, 5):
    keyword_ids = [row[0] for row in batch]
    keyword_names = [row[1] for row in batch]

    for attempt in range(3):
        try:
            pytrends.build_payload(keyword_names, timeframe="today 3-m", geo="")
            time.sleep(2)
            data = pytrends.interest_over_time()
            break
        except Exception as e:
            if attempt < 2:
                wait = 10 * (attempt + 1)
                print(f"Attempt {attempt + 1} failed, retrying in {wait}s: {e}")
                time.sleep(wait)
            else:
                print(f"Error fetching {keyword_names}: {e}")
                data = None

    if data is None:
        continue

    try:

        if data.empty:
            print(f"No data returned for: {keyword_names}")
            continue

        latest = data.iloc[-1]

        for kid, kname in zip(keyword_ids, keyword_names):
            if kname not in latest:
                continue

            score = int(latest[kname])

            if len(data) >= 4:
                older_score = int(data.iloc[-4][kname])
                rising = 1 if score > older_score else 0
            else:
                rising = 0

            cursor.execute(
                "DELETE FROM trends WHERE keyword_id = ? AND date = ?",
                (kid, today),
            )
            cursor.execute(
                "INSERT INTO trends (keyword_id, score, rising, date) VALUES (?, ?, ?, ?)",
                (kid, score, rising, today),
            )
            print(f"{kname}: score={score}, rising={rising}")

    except Exception as e:
        print(f"Error fetching {keyword_names}: {e}")
        continue

    time.sleep(5)

conn.commit()
conn.close()
print("Done.")
