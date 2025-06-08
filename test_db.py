from database import engine
from sqlalchemy import text

def test_connection():
    try:
        # Test de connexion
        with engine.connect() as connection:
            result = connection.execute(text("SELECT 1"))
            print("✅ Connexion à la base de données réussie!")
            return True
    except Exception as e:
        print(f"❌ Erreur de connexion à la base de données: {str(e)}")
        return False

if __name__ == "__main__":
    test_connection() 