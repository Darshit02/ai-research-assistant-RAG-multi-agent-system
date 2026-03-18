import os
import sys
from sqlalchemy.orm import Session
from dotenv import load_dotenv

# Add the parent directory to sys.path to import app modules
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.db import SessionLocal
from app.database.models.model import User

def cleanup_admins():
    load_dotenv()
    admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
    db = SessionLocal()
    try:
        # Demote everyone except the default admin
        users_to_demote = db.query(User).filter(User.email != admin_email, User.role == "admin").all()
        for u in users_to_demote:
            u.role = "user"
            print(f"Demoted {u.email} to user.")
        
        db.commit()
    except Exception as e:
        print(f"Error cleaning up admins: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    cleanup_admins()
