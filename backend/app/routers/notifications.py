from typing import List
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User
from app.models.notification import Notification

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("")
def get_user_notifications(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    notifs = db.query(Notification).filter(
        Notification.user_id == current_user.id
    ).order_by(Notification.id.desc()).limit(30).all()

    unread_count = len([n for n in notifs if not n.is_read])

    items = []
    for n in notifs:
        items.append({
            "id": n.id,
            "type": n.type or "general",
            "title": n.title or "Notification",
            "message": n.message,
            "link": n.link,
            "is_read": bool(n.is_read),
            "created_at": n.created_at.strftime("%b %d, %H:%M") if n.created_at else "Recently"
        })

    return {
        "notifications": items,
        "unread_count": unread_count,
        "total": len(items)
    }

@router.post("/{notification_id}/read")
def mark_notification_read(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    n = db.query(Notification).filter(
        (Notification.id == notification_id) & (Notification.user_id == current_user.id)
    ).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found.")

    n.is_read = True
    db.commit()
    return {"status": "success", "message": "Marked as read."}

@router.post("/read-all")
def mark_all_notifications_read(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    db.query(Notification).filter(
        (Notification.user_id == current_user.id) & (Notification.is_read == False)
    ).update({"is_read": True})
    db.commit()
    return {"status": "success", "message": "All notifications marked as read."}

@router.delete("/{notification_id}")
def delete_notification(
    notification_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    n = db.query(Notification).filter(
        (Notification.id == notification_id) & (Notification.user_id == current_user.id)
    ).first()
    if not n:
        raise HTTPException(status_code=404, detail="Notification not found.")

    db.delete(n)
    db.commit()
    return {"status": "success", "message": "Notification deleted."}
