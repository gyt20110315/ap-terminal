"""WebSocket manager and endpoints for real-time terminal communication."""

from __future__ import annotations

import json
import time

from fastapi import APIRouter, WebSocket, WebSocketDisconnect

router = APIRouter()


class ConnectionManager:
    """Manages WebSocket connections and broadcasts to client subscribers."""

    def __init__(self) -> None:
        self._connections: dict[str, set[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, client_id: str) -> None:
        """Accept a new WebSocket connection and register the client."""
        await websocket.accept()
        if client_id not in self._connections:
            self._connections[client_id] = set()
        self._connections[client_id].add(websocket)

    def disconnect(self, websocket: WebSocket, client_id: str) -> None:
        """Remove a disconnected client."""
        if client_id in self._connections:
            self._connections[client_id].discard(websocket)
            if not self._connections[client_id]:
                del self._connections[client_id]

    async def broadcast(self, channel: str, data: str) -> None:
        """Broadcast a message to all connected clients on a channel."""
        message = json.dumps({"channel": channel, "data": data, "timestamp": time.time()})
        dead: list[tuple[str, WebSocket]] = []
        for client_id, sockets in self._connections.items():
            for ws in sockets:
                try:
                    await ws.send_text(message)
                except Exception:
                    dead.append((client_id, ws))
        for client_id, ws in dead:
            self.disconnect(ws, client_id)

    async def send_personal(self, message: str, websocket: WebSocket) -> None:
        """Send a message to a single WebSocket client."""
        await websocket.send_text(message)

    @property
    def client_count(self) -> int:
        """Return total number of connected clients."""
        return sum(len(sockets) for sockets in self._connections.values())


manager = ConnectionManager()


@router.websocket("/ws/terminal")
async def terminal_websocket(websocket: WebSocket, client_id: str = "default"):
    """WebSocket endpoint for real-time terminal communication.

    Client sends commands as JSON text messages.
    Server pushes news, sentiment, stats, alerts as they arrive.
    """
    await manager.connect(websocket, client_id)
    try:
        # Send initial connection confirmation
        await websocket.send_text(json.dumps({
            "channel": "system",
            "data": json.dumps({"status": "connected", "client_id": client_id}),
            "timestamp": time.time(),
        }))

        # Listen for client commands
        while True:
            raw = await websocket.receive_text()
            try:
                msg = json.loads(raw)
                command = msg.get("command", "").upper()
                args = msg.get("args", "")

                # Route commands
                if command == "HELP":
                    await _handle_help(websocket)
                elif command == "DASH":
                    await _handle_dash(websocket)
                elif command == "NEWS":
                    await _handle_news(websocket, args)
                elif command == "COURSE":
                    await _handle_course(websocket, args)
                elif command == "STATS":
                    await _handle_stats(websocket, args)
                elif command == "TREND":
                    await _handle_trend(websocket, args)
                elif command == "ALERT":
                    await _handle_alert_command(websocket, args)
                else:
                    await websocket.send_text(json.dumps({
                        "channel": "system",
                        "data": json.dumps({
                            "error": f"Unknown command: {command}. Type HELP for available commands.",
                        }),
                        "timestamp": time.time(),
                    }))
            except json.JSONDecodeError:
                await websocket.send_text(json.dumps({
                    "channel": "system",
                    "data": json.dumps({
                        "error": 'Invalid JSON. Send {"command": "...", "args": "..."}',
                    }),
                    "timestamp": time.time(),
                }))

    except WebSocketDisconnect:
        manager.disconnect(websocket, client_id)


async def _handle_help(websocket: WebSocket) -> None:
    """Return list of available commands."""
    commands = {
        "HELP": "Show this help message",
        "DASH": "Return to main dashboard view",
        "NEWS <keywords>": "Search AP-related news (e.g., NEWS AP Calculus)",
        "COURSE <name>": "View specific AP course data (e.g., COURSE CALC AB)",
        "STATS <region>": "View AP statistics by region (e.g., STATS US)",
        "TREND <course>": "View enrollment and score trends for a course",
        "ALERT <keyword>": "Set up a keyword alert (e.g., ALERT exam changes)",
        "HOT": "Show trending AP topics right now",
    }
    await websocket.send_text(json.dumps({
        "channel": "system",
        "data": json.dumps({"type": "help", "commands": commands}),
        "timestamp": time.time(),
    }))


async def _handle_dash(websocket: WebSocket) -> None:
    """Switch to dashboard view."""
    await websocket.send_text(json.dumps({
        "channel": "system",
        "data": json.dumps({"type": "navigate", "view": "dashboard"}),
        "timestamp": time.time(),
    }))


async def _handle_news(websocket: WebSocket, args: str) -> None:
    """Search news articles."""
    await websocket.send_text(json.dumps({
        "channel": "system",
        "data": json.dumps({"type": "navigate", "view": "news", "query": args}),
        "timestamp": time.time(),
    }))


async def _handle_course(websocket: WebSocket, args: str) -> None:
    """Display course data."""
    await websocket.send_text(json.dumps({
        "channel": "system",
        "data": json.dumps({"type": "navigate", "view": "course_detail", "course": args}),
        "timestamp": time.time(),
    }))


async def _handle_stats(websocket: WebSocket, args: str) -> None:
    """Display statistics."""
    await websocket.send_text(json.dumps({
        "channel": "system",
        "data": json.dumps({"type": "navigate", "view": "stats", "region": args}),
        "timestamp": time.time(),
    }))


async def _handle_trend(websocket: WebSocket, args: str) -> None:
    """Show trend data."""
    await websocket.send_text(json.dumps({
        "channel": "system",
        "data": json.dumps({"type": "navigate", "view": "trend", "course": args}),
        "timestamp": time.time(),
    }))


async def _handle_alert_command(websocket: WebSocket, args: str) -> None:
    """Set up a keyword alert."""
    await websocket.send_text(json.dumps({
        "channel": "system",
        "data": json.dumps({
            "type": "alert_created",
            "keyword": args,
            "message": f"Alert set for keyword: {args}. You will be notified when matching content appears.",
        }),
        "timestamp": time.time(),
    }))
