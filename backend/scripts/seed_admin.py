import sys
import os
from sqlalchemy.orm import Session
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from app.database.db import SessionLocal, engine, Base
from app.database.models.model import User
from app.core.security import hash_password
from dotenv import load_dotenv

load_dotenv()

def seed_admin():
    db = SessionLocal()
    try:
        admin_email = os.getenv("ADMIN_EMAIL", "admin@example.com")
        admin_password = os.getenv("ADMIN_PASSWORD", "admin123")
        admin_user = db.query(User).filter(User.email == admin_email).first()
        
        if admin_user:
            print(f"Admin user {admin_email} already exists.")
            if admin_user.role != "admin":
                admin_user.role = "admin"
                db.commit()
                print("Updated existing user to admin role.")
            return

        new_admin = User(
            email=admin_email,
            password_hash=hash_password(admin_password),
            role="admin"
        )
        db.add(new_admin)
        db.commit()
        db.refresh(new_admin)
        print(f"Created admin user: {admin_email}")
    except Exception as e:
        print(f"Error seeding admin user: {e}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    seed_admin()
