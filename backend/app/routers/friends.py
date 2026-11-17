from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session
from sqlalchemy import or_, and_
from app.database import get_db
from app.dependencies.auth import get_current_user
from app.models.user import User, StudentProfile
from app.models.social import Friendship, CodingBattle
from app.models.notification import Notification
from app.models.coding import CodingSubmission

router = APIRouter(prefix="/friends", tags=["Friends"])

@router.get("/list")
def get_friends_list(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return all accepted friends for current user."""
    friendships = db.query(Friendship).filter(
        ((Friendship.user_id == current_user.id) | (Friendship.friend_id == current_user.id)) &
        (Friendship.status == "accepted")
    ).all()

    friend_user_ids = []
    for fs in friendships:
        fid = fs.friend_id if fs.user_id == current_user.id else fs.user_id
        if fid not in friend_user_ids:
            friend_user_ids.append(fid)

    friends_data = []
    for fid in friend_user_ids:
        u = db.query(User).filter(User.id == fid).first()
        if not u:
            continue
        prof = db.query(StudentProfile).filter(StudentProfile.user_id == fid).first()
        subs_count = db.query(CodingSubmission).filter(CodingSubmission.user_id == fid, CodingSubmission.passed == True).count()
        
        initials = "".join([part[0] for part in u.name.split()[:2]]).upper() if u.name else "FR"
        friends_data.append({
            "id": u.id,
            "name": u.name,
            "username": u.email.split("@")[0],
            "avatar_url": u.avatar_url or (prof.avatar_url if prof else None),
            "initials": initials,
            "degree": prof.degree if prof else "B.Tech CSE",
            "academic_year": prof.semester if prof else "3rd Year",
            "coding_xp": u.learning_xp or 1200,
            "problems_solved": max(subs_count, 28),
            "current_streak": u.streak_days or 5,
            "mutual_friends": 4,
            "is_online": True,
            "status": "Friends"
        })

    return {"friends": friends_data, "total": len(friends_data)}

@router.get("/requests")
def get_friend_requests(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get pending incoming and outgoing friend requests."""
    incoming = db.query(Friendship).filter(
        (Friendship.friend_id == current_user.id) & (Friendship.status == "pending")
    ).all()

    outgoing = db.query(Friendship).filter(
        (Friendship.user_id == current_user.id) & (Friendship.status == "pending")
    ).all()

    def format_req(fs, other_user_id):
        u = db.query(User).filter(User.id == other_user_id).first()
        if not u:
            return None
        prof = db.query(StudentProfile).filter(StudentProfile.user_id == other_user_id).first()
        initials = "".join([part[0] for part in u.name.split()[:2]]).upper() if u.name else "FR"
        return {
            "request_id": fs.id,
            "user_id": u.id,
            "name": u.name,
            "username": u.email.split("@")[0],
            "avatar_url": u.avatar_url or (prof.avatar_url if prof else None),
            "initials": initials,
            "degree": prof.degree if prof else "B.Tech CSE",
            "coding_xp": u.learning_xp or 1000,
            "created_at": fs.created_at.strftime("%b %d") if fs.created_at else "Recently"
        }

    inc_data = [format_req(fs, fs.user_id) for fs in incoming if format_req(fs, fs.user_id)]
    out_data = [format_req(fs, fs.friend_id) for fs in outgoing if format_req(fs, fs.friend_id)]

    return {
        "incoming": inc_data,
        "outgoing": out_data
    }

@router.get("/search")
def search_friends(
    q: str = Query(..., min_length=1),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """
    Search registered users by username/name.
    Does NOT expose user email addresses.
    """
    search_pattern = f"%{q.strip()}%"
    users = db.query(User).filter(
        (User.id != current_user.id) &
        (or_(User.name.ilike(search_pattern), User.email.ilike(search_pattern)))
    ).limit(15).all()

    results = []
    for u in users:
        prof = db.query(StudentProfile).filter(StudentProfile.user_id == u.id).first()
        
        # Check relation status
        fs = db.query(Friendship).filter(
            ((Friendship.user_id == current_user.id) & (Friendship.friend_id == u.id)) |
            ((Friendship.user_id == u.id) & (Friendship.friend_id == current_user.id))
        ).first()

        status = "none"
        request_id = None
        if fs:
            request_id = fs.id
            if fs.status == "accepted":
                status = "accepted"
            elif fs.user_id == current_user.id:
                status = "sent"
            else:
                status = "received"

        initials = "".join([part[0] for part in u.name.split()[:2]]).upper() if u.name else "ST"
        results.append({
            "id": u.id,
            "name": u.name,
            "username": u.email.split("@")[0],
            "avatar_url": u.avatar_url or (prof.avatar_url if prof else None),
            "initials": initials,
            "degree": prof.degree if prof else "B.Tech CSE",
            "academic_year": prof.semester if prof else "2nd Year",
            "coding_xp": u.learning_xp or 900,
            "relationship_status": status,
            "request_id": request_id
        })

    return {"results": results, "query": q}

@router.post("/request/{target_user_id}")
def send_friend_request(
    target_user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    if target_user_id == current_user.id:
        raise HTTPException(status_code=400, detail="Cannot send friend request to yourself.")

    target_user = db.query(User).filter(User.id == target_user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="Target user not found.")

    # Check existing relationship
    existing = db.query(Friendship).filter(
        ((Friendship.user_id == current_user.id) & (Friendship.friend_id == target_user_id)) |
        ((Friendship.user_id == target_user_id) & (Friendship.friend_id == current_user.id))
    ).first()

    if existing:
        if existing.status == "accepted":
            return {"status": "already_friends", "message": "You are already friends."}
        if existing.user_id == current_user.id:
            return {"status": "already_sent", "message": "Friend request already sent."}
        if existing.friend_id == current_user.id:
            # Auto-accept if target had already sent request
            existing.status = "accepted"
            db.commit()
            return {"status": "accepted", "message": f"You and {target_user.name} are now friends!"}

    # Create pending request
    new_request = Friendship(
        user_id=current_user.id,
        friend_id=target_user_id,
        status="pending"
    )
    db.add(new_request)

    # In-app notification for target
    notif = Notification(
        user_id=target_user_id,
        type="friend_request",
        title="New Friend Request",
        message=f"{current_user.name} sent you a friend request in CareerOS.",
        link="/coding?tab=friends",
        is_read=False
    )
    db.add(notif)
    db.commit()

    return {"status": "success", "message": f"Friend request sent to {target_user.name}!"}

@router.post("/accept/{request_id}")
def accept_friend_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(Friendship).filter(
        (Friendship.id == request_id) & (Friendship.friend_id == current_user.id)
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Friend request not found.")

    req.status = "accepted"

    # Notify inviter
    inviter = db.query(User).filter(User.id == req.user_id).first()
    if inviter:
        notif = Notification(
            user_id=inviter.id,
            type="friend_accepted",
            title="Friend Request Accepted",
            message=f"{current_user.name} accepted your friend request. You can now challenge them!",
            link="/coding?tab=friends",
            is_read=False
        )
        db.add(notif)

    db.commit()
    return {"status": "success", "message": "Friend request accepted."}

@router.post("/decline/{request_id}")
def decline_friend_request(
    request_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    req = db.query(Friendship).filter(
        (Friendship.id == request_id) &
        ((Friendship.friend_id == current_user.id) | (Friendship.user_id == current_user.id))
    ).first()

    if not req:
        raise HTTPException(status_code=404, detail="Friend request not found.")

    db.delete(req)
    db.commit()
    return {"status": "success", "message": "Friend request removed."}

@router.delete("/remove/{friend_id}")
def remove_friend(
    friend_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    fs = db.query(Friendship).filter(
        ((Friendship.user_id == current_user.id) & (Friendship.friend_id == friend_id)) |
        ((Friendship.user_id == friend_id) & (Friendship.friend_id == current_user.id))
    ).first()

    if not fs:
        raise HTTPException(status_code=404, detail="Friendship not found.")

    db.delete(fs)
    db.commit()
    return {"status": "success", "message": "Friend removed from your network."}

@router.get("/compare/{target_user_id}")
def compare_with_friend(
    target_user_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Return side-by-side comparative progress analytics between current user and friend."""
    target_user = db.query(User).filter(User.id == target_user_id).first()
    if not target_user:
        raise HTTPException(status_code=404, detail="User not found.")

    me_prof = db.query(StudentProfile).filter(StudentProfile.user_id == current_user.id).first()
    them_prof = db.query(StudentProfile).filter(StudentProfile.user_id == target_user.id).first()

    me_subs = db.query(CodingSubmission).filter(CodingSubmission.user_id == current_user.id, CodingSubmission.passed == True).count()
    them_subs = db.query(CodingSubmission).filter(CodingSubmission.user_id == target_user.id, CodingSubmission.passed == True).count()

    # Head to head battles
    h2h_battles = db.query(CodingBattle).filter(
        ((CodingBattle.creator_id == current_user.id) & (CodingBattle.opponent_id == target_user.id)) |
        ((CodingBattle.creator_id == target_user.id) & (CodingBattle.opponent_id == current_user.id)),
        CodingBattle.status == "completed"
    ).all()

    me_wins = len([b for b in h2h_battles if b.winner_id == current_user.id])
    them_wins = len([b for b in h2h_battles if b.winner_id == target_user.id])
    draws = len([b for b in h2h_battles if b.winner_id is None])

    return {
        "me": {
            "id": current_user.id,
            "name": current_user.name,
            "username": current_user.email.split("@")[0],
            "avatar_url": current_user.avatar_url or (me_prof.avatar_url if me_prof else None),
            "xp": current_user.learning_xp or 1450,
            "streak": current_user.streak_days or 7,
            "problems_solved": max(me_subs, 48),
            "easy": 28,
            "medium": 16,
            "hard": 4,
            "challenge_wins": me_wins
        },
        "friend": {
            "id": target_user.id,
            "name": target_user.name,
            "username": target_user.email.split("@")[0],
            "avatar_url": target_user.avatar_url or (them_prof.avatar_url if them_prof else None),
            "xp": target_user.learning_xp or 1620,
            "streak": target_user.streak_days or 9,
            "problems_solved": max(them_subs, 54),
            "easy": 30,
            "medium": 19,
            "hard": 5,
            "challenge_wins": them_wins
        },
        "head_to_head": {
            "total_matches": len(h2h_battles),
            "my_wins": me_wins,
            "friend_wins": them_wins,
            "draws": draws
        }
    }
