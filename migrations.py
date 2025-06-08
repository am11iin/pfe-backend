from sqlalchemy import create_engine, text
from database import SQLALCHEMY_DATABASE_URL

def run_migration():
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # Drop the existing conference_requests table
    with engine.connect() as conn:
        conn.execute(text("DROP TABLE IF EXISTS conference_requests CASCADE"))
        conn.commit()
    
    # Create the new conference_requests table
    with engine.connect() as conn:
        conn.execute(text("""
            CREATE TABLE conference_requests (
                id SERIAL PRIMARY KEY,
                name VARCHAR NOT NULL,
                description TEXT,
                link VARCHAR,
                type VARCHAR NOT NULL,
                departement VARCHAR NOT NULL,
                date TIMESTAMP NOT NULL,
                time VARCHAR NOT NULL,
                image_path VARCHAR,
                requested_by_id INTEGER REFERENCES users(id),
                status VARCHAR NOT NULL DEFAULT 'pending',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """))
        conn.commit()

    # Add language and theme columns to users table
    with engine.connect() as conn:
        # Check if columns exist
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'users' 
            AND column_name IN ('language', 'theme')
        """))
        existing_columns = [row[0] for row in result]
        
        # Add language column if it doesn't exist
        if 'language' not in existing_columns:
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN language VARCHAR DEFAULT 'fr'
            """))
        
        # Add theme column if it doesn't exist
        if 'theme' not in existing_columns:
            conn.execute(text("""
                ALTER TABLE users 
                ADD COLUMN theme VARCHAR DEFAULT 'light'
            """))
        
        conn.commit()

    # Add new columns to courses table
    with engine.connect() as conn:
        # Check if columns exist
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'courses' 
            AND column_name IN ('domain', 'external_links', 'quiz_link')
        """))
        existing_columns = [row[0] for row in result]
        
        # Add domain column if it doesn't exist
        if 'domain' not in existing_columns:
            conn.execute(text("""
                ALTER TABLE courses 
                ADD COLUMN domain VARCHAR
            """))
        
        # Add external_links column if it doesn't exist
        if 'external_links' not in existing_columns:
            conn.execute(text("""
                ALTER TABLE courses 
                ADD COLUMN external_links TEXT
            """))
        
        # Add quiz_link column if it doesn't exist
        if 'quiz_link' not in existing_columns:
            conn.execute(text("""
                ALTER TABLE courses 
                ADD COLUMN quiz_link VARCHAR
            """))
        
        conn.commit()

    # Add file_category to course_materials table
    with engine.connect() as conn:
        # Check if column exists
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'course_materials' 
            AND column_name = 'file_category'
        """))
        existing_columns = [row[0] for row in result]
        
        # Add file_category column if it doesn't exist
        if 'file_category' not in existing_columns:
            conn.execute(text("""
                ALTER TABLE course_materials 
                ADD COLUMN file_category VARCHAR
            """))
        
        conn.commit()

if __name__ == "__main__":
    run_migration()
    print("Migration completed successfully!") 