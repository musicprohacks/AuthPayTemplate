#!/usr/bin/env python3
"""Starts the dev server + Stripe CLI webhook forwarding, then prints
step-by-step instructions for testing payments locally. No flags needed —
run it from inside webapp/:

    python3 test.py
"""

import re
import subprocess
import threading

WEBHOOK_PATH = "/api/webhooks/stripe"

dev_process = subprocess.Popen(
    ["npm", "run", "dev"],
    stdout=subprocess.PIPE,
    stderr=subprocess.STDOUT,
    text=True,
    bufsize=1,
)

stripe_process = None
url_opened = False


def find_env_var(name):
    """Look for NAME=value in .env.local (run from webapp/)."""
    try:
        with open(".env.local") as f:
            for line in f:
                if line.startswith(f"{name}="):
                    value = line.strip().split("=", 1)[1]
                    if value:
                        return value
    except FileNotFoundError:
        pass
    return None


def stream_stripe_output(proc):
    for line in proc.stdout:
        print(f"[stripe] {line}", end="")


def print_testing_instructions(url):
    key = find_env_var("DEV_BYPASS_KEY")
    print("\n" + "=" * 60)
    print("Ready to test payments")
    print("=" * 60)
    print(f"1. Open {url} (already opened in Chrome).")
    print("2. Sign in without email:")
    print("   Sign in -> scroll down -> \"Dev bypass (skip email)\"")
    print("   Enter any email, e.g. test@example.com")
    if key:
        print(f"   Paste this key: {key}")
    else:
        print("   Paste the key from .env.local -> DEV_BYPASS_KEY")
    print("   Click \"Sign in instantly\" -> 20 free credits.")
    print("3. Click any Buy / Subscribe button, then in Stripe Checkout use:")
    print("   Card:   4242 4242 4242 4242")
    print("   Expiry: any future date (e.g. 12/34)")
    print("   CVC:    any 3 digits (e.g. 123)")
    print("   ZIP:    any 5 digits")
    print("4. Pay -> balance updates within a couple seconds via the")
    print("   Stripe CLI forwarding events to your webhook endpoint below.")
    print("5. Repeat with a different email for a clean slate any time.")
    print("=" * 60 + "\n")


try:
    for line in dev_process.stdout:
        print(line, end="")

        match = re.search(r"(https?://localhost:\d+)", line)

        if match and not url_opened:
            url = match.group(1)
            print(f"\nOpening {url} in Chrome...\n")

            subprocess.run(["open", "-a", "Google Chrome", url])

            url_opened = True

            port = url.rsplit(":", 1)[1]
            forward_to = f"localhost:{port}{WEBHOOK_PATH}"
            print(f"Starting Stripe CLI, forwarding to {forward_to}...\n")

            stripe_cmd = ["stripe", "listen", "--forward-to", forward_to]
            api_key = find_env_var("STRIPE_SECRET_KEY")
            if api_key:
                stripe_cmd += ["--api-key", api_key]
            else:
                print(
                    "Warning: STRIPE_SECRET_KEY not found in .env.local — "
                    "`stripe listen` may prompt for auth.\n"
                )

            stripe_process = subprocess.Popen(
                stripe_cmd,
                stdout=subprocess.PIPE,
                stderr=subprocess.STDOUT,
                text=True,
                bufsize=1,
            )
            threading.Thread(
                target=stream_stripe_output, args=(stripe_process,), daemon=True
            ).start()

            print_testing_instructions(url)

except KeyboardInterrupt:
    print("\nStopping development server...")
    dev_process.terminate()
    dev_process.wait()
    if stripe_process:
        print("Stopping Stripe CLI...")
        stripe_process.terminate()
        stripe_process.wait()
