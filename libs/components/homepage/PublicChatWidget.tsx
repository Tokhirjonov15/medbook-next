import { useEffect, useMemo, useRef, useState } from "react";
import { useReactiveVar } from "@apollo/client";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { CircularProgress, IconButton, Stack } from "@mui/material";
import { useRouter } from "next/router";
import { userVar } from "@/apollo/store";
import { getJwtToken } from "@/libs/auth";
import { sweetLoginConfirmAlert } from "@/libs/sweetAlert";
import { Messages } from "@/libs/config";

type ChatSender = {
  _id: string;
  memberNick: string;
  memberType: string;
  memberImage?: string;
};

type ChatMessage = {
  event: "message";
  _id?: string;
  text: string;
  memberData: ChatSender | null;
  createdAt?: string;
};

type SocketResponse =
  | { event: "getMessages"; list: ChatMessage[] }
  | { event: "message"; _id?: string; text: string; memberData: ChatSender | null; createdAt?: string }
  | { event: "info"; totalClient?: number }
  | { event: "error"; message?: string };

const getSocketUrl = (token?: string): string => {
  const explicitWsUrl =
    process.env.NEXT_PUBLIC_API_WS ?? process.env.REACT_APP_API_WS ?? "";
  const graphqlUrl =
    process.env.NEXT_PUBLIC_API_GRAPHQL_URL ??
    process.env.REACT_APP_API_GRAPHQL_URL ??
    "http://localhost:3004/graphql";

  const baseUrl = explicitWsUrl || graphqlUrl.replace(/\/graphql\/?$/, "");
  const normalizedUrl = baseUrl.replace(/^http/, "ws");
  return token ? `${normalizedUrl}?token=${encodeURIComponent(token)}` : normalizedUrl;
};

const formatTime = (value?: string) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";

  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
  }).format(date);
};

const PublicChatWidget = () => {
  const router = useRouter();
  const user = useReactiveVar(userVar);
  const listRef = useRef<HTMLDivElement | null>(null);
  const socketRef = useRef<WebSocket | null>(null);

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(24);

  const isLoggedIn = Boolean(user?._id);
  const socketUrl = useMemo(() => getSocketUrl(getJwtToken()), [isLoggedIn]);

  useEffect(() => {
    const updateBottomOffset = () => {
      const footer = document.getElementById("footer");
      if (!footer) {
        setBottomOffset(24);
        return;
      }

      const rect = footer.getBoundingClientRect();
      const overlap = Math.max(0, window.innerHeight - rect.top);
      setBottomOffset(24 + overlap);
    };

    updateBottomOffset();
    window.addEventListener("scroll", updateBottomOffset, { passive: true });
    window.addEventListener("resize", updateBottomOffset);

    return () => {
      window.removeEventListener("scroll", updateBottomOffset);
      window.removeEventListener("resize", updateBottomOffset);
    };
  }, []);

  useEffect(() => {
    if (!isOpen) return;

    setIsConnecting(true);
    setIsConnected(false);

    const socket = new WebSocket(socketUrl);
    socketRef.current = socket;

    socket.onopen = () => {
      setIsConnecting(false);
      setIsConnected(true);
    };

    socket.onmessage = (event) => {
      try {
        const payload = JSON.parse(event.data) as SocketResponse;

        if (payload.event === "getMessages") {
          setMessages(payload.list ?? []);
          return;
        }

        if (payload.event === "message") {
          setMessages((prev) => [...prev, payload]);
          return;
        }
      } catch (error) {
        console.warn("chat message parse failed", error);
      }
    };

    socket.onclose = () => {
      setIsConnecting(false);
      setIsConnected(false);
    };

    socket.onerror = () => {
      setIsConnecting(false);
      setIsConnected(false);
    };

    return () => {
      socket.close();
      socketRef.current = null;
      setIsConnecting(false);
      setIsConnected(false);
    };
  }, [isOpen, socketUrl]);

  useEffect(() => {
    if (!isOpen || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isOpen]);

  const handleSubmit = async () => {
    const text = messageText.trim();
    if (!text) return;

    if (!isLoggedIn) {
      const shouldLogin = await sweetLoginConfirmAlert(Messages.error2);
      if (shouldLogin) router.push("/auth/login");
      return;
    }

    if (!socketRef.current || socketRef.current.readyState !== WebSocket.OPEN) return;

    socketRef.current.send(
      JSON.stringify({
        event: "message",
        data: { text },
      }),
    );

    setMessageText("");
  };

  return (
    <div className="public-chat-widget" style={{ bottom: `${bottomOffset}px` }}>
      {isOpen ? (
        <Stack className="public-chat-panel">
          <Stack className="public-chat-header" direction="row" justifyContent="space-between" alignItems="center">
            <div>
              <strong>Community Chat</strong>
              <span>{isConnected ? "Live now" : isConnecting ? "Connecting..." : "Read-only preview"}</span>
            </div>
            <IconButton onClick={() => setIsOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <div className="public-chat-messages" ref={listRef}>
            {messages.length ? (
              messages.map((message, index) => {
                const isMine = user?._id && message.memberData?._id === user._id;

                return (
                  <div
                    key={`${message._id ?? message.createdAt ?? "message"}-${index}`}
                    className={`public-chat-message ${isMine ? "mine" : ""}`.trim()}
                  >
                    <div className="public-chat-message-meta">
                      <strong>{message.memberData?.memberNick ?? "Guest"}</strong>
                      <span>{formatTime(message.createdAt)}</span>
                    </div>
                    <p>{message.text}</p>
                  </div>
                );
              })
            ) : (
              <div className="public-chat-empty">No messages yet. Start the conversation.</div>
            )}
          </div>

          <Stack className="public-chat-composer" direction="row" spacing={1}>
            <input
              value={messageText}
              onChange={(event) => setMessageText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleSubmit();
                }
              }}
              placeholder={isLoggedIn ? "Write your message..." : "Login to send a message"}
            />
            <button type="button" onClick={() => void handleSubmit()}>
              {isConnecting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <SendRoundedIcon />}
            </button>
          </Stack>
        </Stack>
      ) : null}

      <button
        type="button"
        className="public-chat-launcher"
        onClick={() => setIsOpen((prev) => !prev)}
        aria-label="Open public chat"
      >
        <ForumRoundedIcon />
        <span>Chat</span>
      </button>
    </div>
  );
};

export default PublicChatWidget;
