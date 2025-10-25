#!/usr/bin/env bash
set -euo pipefail

python3 -m venv .venv
source .venv/bin/activate
pip install -U pip
pip install -r requirements.txt

# Load env
if [ -f .env ]; then export $(grep -v '^#' .env | xargs); fi

python app.py
