from datetime import datetime, timezone
from typing import Any
from uuid import uuid4

from google.cloud import firestore

from app.models import JournalSummary


class FirestoreService:
    def __init__(self, project_id: str) -> None:
        self.client = firestore.Client(project=project_id)

    def _user_reference(
        self,
        uid: str,
    ) -> firestore.DocumentReference:
        return self.client.collection("users").document(uid)

    def _conversation_reference(
        self,
        uid: str,
        conversation_id: str,
    ) -> firestore.DocumentReference:
        return (
            self._user_reference(uid)
            .collection("conversations")
            .document(conversation_id)
        )

    def ensure_user_profile(
        self,
        uid: str,
        email: str | None,
        name: str | None,
    ) -> None:
        user_reference = self._user_reference(uid)

        user_reference.set(
            {
                "uid": uid,
                "email": email,
                "display_name": name,
                "last_login_at": firestore.SERVER_TIMESTAMP,
            },
            merge=True,
        )

    def create_conversation(
        self,
        uid: str,
        initial_message: str,
    ) -> str:
        conversation_id = uuid4().hex

        title_source = " ".join(initial_message.split())
        title = title_source[:60]

        conversation_reference = self._conversation_reference(
            uid,
            conversation_id,
        )

        conversation_reference.set(
            {
                "owner_uid": uid,
                "title": title or "New reflection",
                "created_at": firestore.SERVER_TIMESTAMP,
                "updated_at": firestore.SERVER_TIMESTAMP,
                "has_summary": False,
            }
        )

        return conversation_id

    def conversation_exists(
        self,
        uid: str,
        conversation_id: str,
    ) -> bool:
        snapshot = self._conversation_reference(
            uid,
            conversation_id,
        ).get()

        if not snapshot.exists:
            return False

        data = snapshot.to_dict() or {}

        return data.get("owner_uid") == uid

    def add_message(
        self,
        uid: str,
        conversation_id: str,
        role: str,
        content: str,
    ) -> None:
        conversation_reference = self._conversation_reference(
            uid,
            conversation_id,
        )

        message_reference = (
            conversation_reference
            .collection("messages")
            .document()
        )

        batch = self.client.batch()

        batch.set(
            message_reference,
            {
                "role": role,
                "content": content,
                "created_at": firestore.SERVER_TIMESTAMP,
            },
        )

        batch.update(
            conversation_reference,
            {
                "updated_at": firestore.SERVER_TIMESTAMP,
            },
        )

        batch.commit()

    def get_messages(
        self,
        uid: str,
        conversation_id: str,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        if not self.conversation_exists(uid, conversation_id):
            raise ValueError("Conversation not found.")

        messages_query = (
            self._conversation_reference(uid, conversation_id)
            .collection("messages")
            .order_by("created_at", direction=firestore.Query.DESCENDING)
            .limit(limit)
        )

        messages = [
            document.to_dict()
            for document in messages_query.stream()
        ]

        messages.reverse()

        return messages

    def save_summary(
        self,
        uid: str,
        conversation_id: str,
        summary: JournalSummary,
    ) -> None:
        if not self.conversation_exists(uid, conversation_id):
            raise ValueError("Conversation not found.")

        conversation_reference = self._conversation_reference(
            uid,
            conversation_id,
        )

        summary_reference = (
            self._user_reference(uid)
            .collection("summaries")
            .document(conversation_id)
        )

        batch = self.client.batch()

        batch.set(
            summary_reference,
            {
                "owner_uid": uid,
                "conversation_id": conversation_id,
                **summary.model_dump(),
                "created_at": firestore.SERVER_TIMESTAMP,
                "updated_at": firestore.SERVER_TIMESTAMP,
            },
            merge=True,
        )

        batch.update(
            conversation_reference,
            {
                "has_summary": True,
                "updated_at": firestore.SERVER_TIMESTAMP,
            },
        )

        batch.commit()

    def list_conversations(
        self,
        uid: str,
        limit: int = 20,
    ) -> list[dict[str, Any]]:
        query = (
            self._user_reference(uid)
            .collection("conversations")
            .order_by("updated_at", direction=firestore.Query.DESCENDING)
            .limit(limit)
        )

        results: list[dict[str, Any]] = []

        for document in query.stream():
            data = document.to_dict()

            if data.get("owner_uid") != uid:
                continue

            results.append(
                {
                    "conversation_id": document.id,
                    "title": data.get("title", "Untitled reflection"),
                    "created_at": self._datetime_to_string(
                        data.get("created_at")
                    ),
                    "updated_at": self._datetime_to_string(
                        data.get("updated_at")
                    ),
                    "has_summary": bool(
                        data.get("has_summary", False)
                    ),
                }
            )

        return results

    @staticmethod
    def _datetime_to_string(
        value: datetime | None,
    ) -> str | None:
        if value is None:
            return None

        if value.tzinfo is None:
            value = value.replace(tzinfo=timezone.utc)

        return value.isoformat()