import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText

def send_price_alert(product_title, current_price, target_price, product_url):
    """Dispatches a secure HTML/Text email alert regarding price drops."""
    sender_email = os.environ.get("ALERT_EMAIL_USER")
    sender_password = os.environ.get("ALERT_EMAIL_PASS")
    receiver_email = os.environ.get("RECEIVER_EMAIL")

    if not sender_email or not sender_password or not receiver_email:
        print("Notification skipped: Missing environmental credentials.")
        return False

    msg = MIMEMultipart()
    msg["From"] = sender_email
    msg["To"] = receiver_email
    msg["Subject"] = f"📉 Price Drop Alert: {product_title}!"

    body = f"The price for '{product_title}' has dropped to ${current_price:.2f}, beating your threshold of ${target_price:.2f}.\nLink: {product_url}"
    msg.attach(MIMEText(body, "plain"))

    try:
        with smtplib.SMTP("smtp.gmail.com", 587) as server:
            server.starttls()
            server.login(sender_email, sender_password)
            server.sendmail(sender_email, receiver_email, msg.as_string())
        print("Alert successfully sent via SMTP pipeline.")
        return True
    except Exception as e:
        print(f"SMTP Transmission Failed: {e}")
        return False
