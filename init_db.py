from database import engine
from models import Base
from models.user import User
from auth import get_password_hash
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

def init_db():
    # Create all tables
    Base.metadata.create_all(bind=engine)
    print("Database tables created successfully!")

def create_default_admin():
    from sqlalchemy.orm import Session
    from database import SessionLocal
    
    db = SessionLocal()
    try:
        # Check if admin already exists
        admin = db.query(User).filter(User.email == os.getenv("DEFAULT_ADMIN_EMAIL")).first()
        if not admin:
            # Create admin user
            admin_user = User(
                nom="Admin",
                prenom="System",
                departement="Administration",
                role="admin",
                email=os.getenv("DEFAULT_ADMIN_EMAIL"),
                telephone="0000000000",
                hashed_password=get_password_hash(os.getenv("DEFAULT_ADMIN_PASSWORD")),
                is_active=True,
                is_approved=True
            )
            db.add(admin_user)
            db.commit()
            print("Default admin user created successfully!")
        else:
            print("Admin user already exists")
    except Exception as e:
        print(f"Error creating admin user: {str(e)}")
        db.rollback()
    finally:
        db.close()

if __name__ == "__main__":
    init_db()
    create_default_admin() 