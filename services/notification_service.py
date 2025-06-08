from sqlalchemy.orm import Session
from models.notification import Notification
from models.user import User
from models.course import Course
from typing import List, Dict
from datetime import datetime

def create_notification(
    db: Session,
    user_id: int,
    title: str,
    message: str,
    type: str,
    course_id: int = None
) -> Notification:
    """Create a new notification"""
    notification = Notification(
        user_id=user_id,
        title=title,
        message=message,
        type=type,
        related_course_id=course_id,
        is_read=False,
        created_at=datetime.utcnow()
    )
    db.add(notification)
    db.commit()
    db.refresh(notification)
    return notification

def mark_notification_as_read(db: Session, notification_id: int, user_id: int) -> Notification:
    """Mark a specific notification as read"""
    try:
        notification = db.query(Notification).filter(
            Notification.id == notification_id,
            Notification.user_id == user_id
        ).first()
        
        if notification:
            notification.is_read = True
            db.commit()
            db.refresh(notification)
        
        return notification
    except Exception as e:
        db.rollback()
        raise e

def get_user_notifications(
    db: Session,
    user_id: int
) -> Dict:
    """Get all notifications for a user with unread count"""
    # Get all notifications
    notifications = db.query(Notification)\
        .filter(Notification.user_id == user_id)\
        .order_by(Notification.created_at.desc())\
        .all()
    
    # Count unread notifications
    unread_count = db.query(Notification)\
        .filter(
            Notification.user_id == user_id,
            Notification.is_read == False
        ).count()
    
    return {
        "notifications": notifications,
        "unread_count": unread_count
    }

# Admin notifications
def notify_new_account_request(db: Session, user: User):
    """Notify admin about new account request"""
    admin = db.query(User).filter(User.role == "admin").first()
    if admin:
        create_notification(
            db=db,
            user_id=admin.id,
            title="Nouvelle demande de compte",
            message=f"Un nouvel utilisateur ({user.nom} {user.prenom}) a demandé à créer un compte",
            type="account_request"
        )

def notify_course_request(db: Session, user: User, course_title: str):
    """Notify admin about new course request"""
    admin = db.query(User).filter(User.role == "admin").first()
    if admin:
        create_notification(
            db=db,
            user_id=admin.id,
            title="Nouvelle demande de formation",
            message=f"{user.nom} {user.prenom} a demandé l'accès au cours '{course_title}'",
            type="course_request"
        )

def notify_new_course(db: Session, course: Course):
    """Notify admin about new course"""
    admin = db.query(User).filter(User.role == "admin").first()
    if admin:
        create_notification(
            db=db,
            user_id=admin.id,
            title="Nouveau cours ajouté",
            message=f"Le cours '{course.title}' a été ajouté par {course.instructor.nom} {course.instructor.prenom}",
            type="new_course",
            course_id=course.id
        )

def notify_conference_request(db: Session, user: User, conference_name: str):
    """Notify admin about new conference request"""
    admin = db.query(User).filter(User.role == "admin").first()
    if admin:
        create_notification(
            db=db,
            user_id=admin.id,
            title="Nouvelle demande de conférence",
            message=f"{user.nom} {user.prenom} a demandé à organiser la conférence '{conference_name}'",
            type="conference_request"
        )

# Professor notifications
def notify_professor_new_course(db: Session, course: Course):
    """Notify professors in the same department about new course"""
    professors = db.query(User).filter(
        User.role == "prof",
        User.departement == course.departement
    ).all()
    
    for prof in professors:
        create_notification(
            db=db,
            user_id=prof.id,
            title="Nouveau cours dans votre département",
            message=f"Un nouveau cours '{course.title}' a été ajouté dans votre département",
            type="department_new_course",
            course_id=course.id
        )

def notify_conference_status(db: Session, user: User, conference_name: str, is_approved: bool):
    """Notify professor about conference request status"""
    status = "approuvée" if is_approved else "refusée"
    create_notification(
        db=db,
        user_id=user.id,
        title="Statut de votre demande de conférence",
        message=f"Votre demande pour la conférence '{conference_name}' a été {status}",
        type="conference_status"
    )

# User (employer) notifications
def notify_employer_new_course(db: Session, course: Course):
    """Notify employers in the same department about new course"""
    employers = db.query(User).filter(
        User.role == "employer",
        User.departement == course.departement
    ).all()
    
    for employer in employers:
        create_notification(
            db=db,
            user_id=employer.id,
            title="Nouveau cours disponible",
            message=f"Un nouveau cours '{course.title}' est disponible dans votre département",
            type="new_course_available",
            course_id=course.id
        )

def notify_course_approval(db: Session, user: User, course: Course, is_approved: bool):
    """Notify user about course approval/rejection"""
    status = "approuvé" if is_approved else "refusé"
    create_notification(
        db=db,
        user_id=user.id,
        title="Demande de cours mise à jour",
        message=f"Votre demande d'accès au cours '{course.title}' a été {status}",
        type="course_approval",
        course_id=course.id
    )

def notify_account_approval(db: Session, user: User, is_approved: bool):
    """Notify user about account approval/rejection"""
    status = "approuvé" if is_approved else "refusé"
    create_notification(
        db=db,
        user_id=user.id,
        title="Demande de compte mise à jour",
        message=f"Votre demande de compte a été {status}",
        type="account_approval"
    )

def notify_course_created(
    db: Session,
    course: Course
):
    # Notify admin
    admin = db.query(User).filter(User.role == "admin").first()
    if admin:
        create_notification(
            db=db,
            user_id=admin.id,
            title="Nouveau cours créé",
            message=f"Le cours '{course.title}' a été créé par {course.instructor.nom} {course.instructor.prenom}",
            type="course_created",
            course_id=course.id
        )

def notify_course_deleted(
    db: Session,
    course: Course
):
    # Notify admin
    admin = db.query(User).filter(User.role == "admin").first()
    if admin:
        create_notification(
            db=db,
            user_id=admin.id,
            title="Cours supprimé",
            message=f"Le cours '{course.title}' a été supprimé",
            type="course_deleted",
            course_id=course.id
        )

def notify_material_added(
    db: Session,
    course: Course,
    material
):
    # Notify admin
    admin = db.query(User).filter(User.role == "admin").first()
    if admin:
        create_notification(
            db=db,
            user_id=admin.id,
            title="Nouveau matériel ajouté",
            message=f"Un nouveau matériel a été ajouté au cours '{course.title}'",
            type="material_added",
            course_id=course.id,
            material_id=material.id
        )
    
    # Notify enrolled students
    for progress in course.progress_records:
        create_notification(
            db=db,
            user_id=progress.user_id,
            title="Nouveau matériel disponible",
            message=f"Un nouveau matériel est disponible dans le cours '{course.title}'",
            type="material_added",
            course_id=course.id,
            material_id=material.id
        )

def notify_course_progress(
    db: Session,
    user_id: int,
    course: Course,
    progress: float
):
    create_notification(
        db=db,
        user_id=user_id,
        title="Progression mise à jour",
        message=f"Votre progression dans le cours '{course.title}' est maintenant de {progress}%",
        type="progress_updated",
        course_id=course.id
    ) 