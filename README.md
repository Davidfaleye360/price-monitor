# Automated E-Commerce Price Monitor

An asynchronous backend tracking script designed to extract web telemetry data, keep structural logs of product price alterations, and instantly notify end users via SMTP pipelines upon budget hit optimization.

## Features
- **DOM Engine Parsing:** Optimized string sanitization and custom agent request cycling.
- **Data Persistence:** Relational local logging format documenting cost patterns.
- **Event-Driven Messaging:** Secure environmental credential parsing driving runtime email hooks.

## Installation
```bash
pip install -r requirements.txt
export ALERT_EMAIL_USER="your_email@gmail.com"
export ALERT_EMAIL_PASS="your_app_password"
export RECEIVER_EMAIL="destination@gmail.com"
python main.py
```
