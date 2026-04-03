#!/usr/bin/env python3
"""
Downloads Gmail attachment PDFs using Chrome's session cookies,
then saves them to ~/Downloads for the upload-docs.mjs script.
"""
import os
import sys
import requests
from pycookiecheat import chrome_cookies

DOWNLOADS = os.path.expanduser("~/Downloads")
IK = "5d9495adc1"  # Gmail initialization key from window.GLOBALS[9]

# All files to download: (msgDecimal, thHex, attid, filename)
FILES = [
    # Email 1: 19d437510eaf3626
    ("1861173367289099814", "19d437510eaf3626", "0.2",  "EPC - Sessile Close.pdf"),
    ("1861173367289099814", "19d437510eaf3626", "0.3",  "Gas Safety Certificate - Back Falkner 7.pdf"),
    ("1861173367289099814", "19d437510eaf3626", "0.4",  "Gas Safety Certificate - Back Falkner 5.pdf"),
    ("1861173367289099814", "19d437510eaf3626", "0.5",  "Flat 2, Croxteth Rd Mortgage Statement.pdf"),
    ("1861173367289099814", "19d437510eaf3626", "0.6",  "Gas Safety Certificate - Aigburth Drive.pdf"),
    ("1861173367289099814", "19d437510eaf3626", "0.7",  "Flat 4 Mortgage Offer.pdf"),
    ("1861173367289099814", "19d437510eaf3626", "0.8",  "Flat 5 Mortgage Offer.pdf"),
    ("1861173367289099814", "19d437510eaf3626", "0.9",  "Gas Safety Certificate  - Basement 15 Croxteth Road.pdf"),
    ("1861173367289099814", "19d437510eaf3626", "0.10", "EPC - Sir Thomas 11.12.pdf"),
    # Email 2: 19d4374b9695a67f
    ("1861173343799322239", "19d4374b9695a67f", "0.1",  "EPC - flat 1.pdf"),
    ("1861173343799322239", "19d4374b9695a67f", "0.2",  "EPC - flat 2.pdf"),
    ("1861173343799322239", "19d4374b9695a67f", "0.3",  "EPC - flat 4.pdf"),
    ("1861173343799322239", "19d4374b9695a67f", "0.4",  "EPC - flat 5.pdf"),
    ("1861173343799322239", "19d4374b9695a67f", "0.5",  "EPC - flat 6.pdf"),
    ("1861173343799322239", "19d4374b9695a67f", "0.6",  "EPC - Back Falkner 7.pdf"),
    ("1861173343799322239", "19d4374b9695a67f", "0.7",  "EPC - Bands 4.pdf"),
    ("1861173343799322239", "19d4374b9695a67f", "0.8",  "EPC - Cornhill 24.6.pdf"),
    ("1861173343799322239", "19d4374b9695a67f", "0.9",  "EPC - Cornhill 31.4.pdf"),
    ("1861173343799322239", "19d4374b9695a67f", "0.10", "EPC - Basement 15 Croxteth Road.pdf"),
    # Email 3: 19d437478c9d500a (thread: 19d4373b67bf7e44)
    ("1861173326452183050", "19d4373b67bf7e44", "0.1",  "EICR - flat 4.pdf"),
    ("1861173326452183050", "19d4373b67bf7e44", "0.2",  "EICR - flat 5.pdf"),
    ("1861173326452183050", "19d4373b67bf7e44", "0.3",  "EICR - flat 6.pdf"),
    ("1861173326452183050", "19d4373b67bf7e44", "0.4",  "EPC - Aigburth.pdf"),
    ("1861173326452183050", "19d4373b67bf7e44", "0.5",  "EICR - Sessile Close.pdf"),
    ("1861173326452183050", "19d4373b67bf7e44", "0.6",  "Emergency Lighting Service - 25 Bennison Drive - L19 0NS.pdf"),
    ("1861173326452183050", "19d4373b67bf7e44", "0.7",  "EPC - 174 Ellerman Road.pdf"),
    ("1861173326452183050", "19d4373b67bf7e44", "0.8",  "EPC - Back Falkner 5.pdf"),
    ("1861173326452183050", "19d4373b67bf7e44", "0.9",  "EPC - 25 Bennison Drive.pdf"),
    ("1861173326452183050", "19d4373b67bf7e44", "0.10", "EICR - Sir Thomas 11.12.pdf"),
    # Email 4: 19d4373b67bf7e44
    ("1861173274294058564", "19d4373b67bf7e44", "0.1",  "25 Bennison Road, Aigburth, Liverpool - Fire Risk Assessment 08.05.25 .pdf"),
    ("1861173274294058564", "19d4373b67bf7e44", "0.2",  "Bands 4 Mortgage Statement.pdf"),
    ("1861173274294058564", "19d4373b67bf7e44", "0.3",  "Back Falkner 5 Mortgage Statement.pdf"),
    ("1861173274294058564", "19d4373b67bf7e44", "0.5",  "174 Ellerman Rd Mortgage Statement.pdf"),
    ("1861173274294058564", "19d4373b67bf7e44", "0.6",  "Back Falkner 7 - EICR.pdf"),
    ("1861173274294058564", "19d4373b67bf7e44", "0.7",  "25 Bennison Drive Mortgage Statement.pdf"),
    ("1861173274294058564", "19d4373b67bf7e44", "0.8",  "Back Falkner 7 Mortgage Statement.pdf"),
    ("1861173274294058564", "19d4373b67bf7e44", "0.9",  "Aigburth Drive Mortgage Offer.pdf"),
    ("1861173274294058564", "19d4373b67bf7e44", "0.10", "Basement Flat 15 Croxteth AST Tenancy Agreement.pdf"),
    # Email 5: 19d43759133f5808 (thread: 19d4374b9695a67f)
    ("1861173401725392904", "19d4374b9695a67f", "0.6",  "Schedule - Property Owners Policy from RSA (2).pdf"),
    ("1861173401725392904", "19d4374b9695a67f", "0.10", "Rental Agreement for 174 Ellerman Road L3 4FE - Ref 1245244-637737821160842825.pdf"),
    # Email 6: 19d4375b1c532bb2
    ("1861173410467621810", "19d4375b1c532bb2", "0.2",  "Sir Thomas 11.12 Mortgage Statement.pdf"),
]

def main():
    # Get cookies from Chrome Profile 1 (which has the Gmail session)
    print("Loading Chrome cookies...")
    try:
        cookies = chrome_cookies(
            "https://mail.google.com",
            cookie_file=os.path.expanduser(
                "~/Library/Application Support/Google/Chrome/Profile 1/Cookies"
            ),
        )
        print(f"Got {len(cookies)} cookies")
    except Exception as e:
        print(f"Failed to load cookies: {e}")
        sys.exit(1)

    session = requests.Session()
    session.cookies.update(cookies)
    session.headers.update({
        "User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Referer": "https://mail.google.com/",
    })

    downloaded = 0
    skipped = 0
    failed = 0

    for msg, th, attid, filename in FILES:
        dest = os.path.join(DOWNLOADS, filename)
        if os.path.exists(dest):
            print(f"⏭  SKIP (exists): {filename}")
            skipped += 1
            continue

        url = f"https://mail.google.com/mail/u/0/?ui=2&ik={IK}&attid={attid}&permmsgid=msg-f:{msg}&th={th}&view=att&zw"
        try:
            r = session.get(url, timeout=60)
            if r.status_code == 200 and r.headers.get("content-type", "").startswith("application/pdf"):
                with open(dest, "wb") as f:
                    f.write(r.content)
                print(f"✅ {filename} ({len(r.content):,} bytes)")
                downloaded += 1
            else:
                print(f"❌ {filename} → HTTP {r.status_code} content-type: {r.headers.get('content-type','?')}")
                failed += 1
        except Exception as e:
            print(f"❌ {filename} → {e}")
            failed += 1

    print(f"\nDone — {downloaded} downloaded, {skipped} skipped, {failed} failed")

if __name__ == "__main__":
    main()
