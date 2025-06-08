from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from models.user import User
from pathlib import Path

# Configuration de la base de données
data_dir = Path("/tmp/data")
SQLALCHEMY_DATABASE_URL = f"sqlite:///{data_dir}/platform.db"

engine = create_engine(SQLALCHEMY_DATABASE_URL)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

def check_admin():
    db = SessionLocal()
    try:
        # Rechercher l'admin
        admin = db.query(User).filter(User.role == "admin").first()
        if admin:
            print(f"Admin trouvé :")
            print(f"- Email : {admin.email}")
            print(f"- Nom : {admin.nom}")
            print(f"- Prénom : {admin.prenom}")
            print(f"- Département : {admin.departement}")
            print(f"- Actif : {admin.is_active}")
            print(f"- Approuvé : {admin.is_approved}")
        else:
            print("Aucun admin trouvé dans la base de données")
    finally:
        db.close()

if __name__ == "__main__":
    check_admin() 