import { useEffect, useMemo, useRef, useState } from "react";
import { useMutation, useReactiveVar } from "@apollo/client";
import ForumRoundedIcon from "@mui/icons-material/ForumRounded";
import SmartToyRoundedIcon from "@mui/icons-material/SmartToyRounded";
import CloseRoundedIcon from "@mui/icons-material/CloseRounded";
import SendRoundedIcon from "@mui/icons-material/SendRounded";
import { CircularProgress, IconButton, Stack } from "@mui/material";
import { useRouter } from "next/router";
import { ASK_AI_CHAT } from "@/apollo/user/mutation";
import { userVar } from "@/apollo/store";
import { getJwtToken } from "@/libs/auth";
import { MemberType } from "@/libs/enums/member.enum";
import { sweetErrorAlert, sweetLoginConfirmAlert } from "@/libs/sweetAlert";
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

type AiChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
};

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

  const [isCommunityOpen, setIsCommunityOpen] = useState(false);
  const [isAiOpen, setIsAiOpen] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageText, setMessageText] = useState("");
  const [aiMessages, setAiMessages] = useState<AiChatMessage[]>([
    {
      id: "welcome",
      role: "assistant",
      text: "Hello. I am MedBook AI assistant. Ask a general health question and I will help with safe guidance.",
    },
  ]);
  const [aiMessageText, setAiMessageText] = useState("");
  const [isConnecting, setIsConnecting] = useState(false);
  const [isConnected, setIsConnected] = useState(false);
  const [bottomOffset, setBottomOffset] = useState(24);
  const [askAiChat, { loading: isAiLoading }] = useMutation(ASK_AI_CHAT);

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
    if (!isCommunityOpen) return;

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
  }, [isCommunityOpen, socketUrl]);

  useEffect(() => {
    if (!isCommunityOpen || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [messages, isCommunityOpen]);

  useEffect(() => {
    if (!isAiOpen || !listRef.current) return;
    listRef.current.scrollTop = listRef.current.scrollHeight;
  }, [aiMessages, isAiOpen]);

  const handleCommunitySubmit = async () => {
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

  const ensurePatientAccess = async (): Promise<boolean> => {
    if (!isLoggedIn) {
      const shouldLogin = await sweetLoginConfirmAlert(Messages.error2);
      if (shouldLogin) router.push("/auth/login");
      return false;
    }

    if (user?.memberType !== MemberType.PATIENT) {
      await sweetErrorAlert("AI chat is available for patient accounts only.");
      return false;
    }

    return true;
  };

  const handleAiLauncher = async () => {
    const allowed = await ensurePatientAccess();
    if (!allowed) return;

    setIsCommunityOpen(false);
    setIsAiOpen((prev) => !prev);
  };

  const handleAiSubmit = async () => {
    const text = aiMessageText.trim();
    if (!text || isAiLoading) return;

    const allowed = await ensurePatientAccess();
    if (!allowed) return;

    const userMessage: AiChatMessage = {
      id: `${Date.now()}-user`,
      role: "user",
      text,
    };

    setAiMessages((prev) => [...prev, userMessage]);
    setAiMessageText("");

    try {
      const { data } = await askAiChat({
        variables: {
          input: {
            message: text,
          },
        },
      });

      const reply = data?.askAiChat?.reply?.trim?.() || "I am unable to respond right now. Please try again.";

      setAiMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant`,
          role: "assistant",
          text: reply,
        },
      ]);
    } catch (error: any) {
      const errorMessage =
        error?.graphQLErrors?.[0]?.message ??
        error?.message ??
        "AI chat is temporarily unavailable. Please try again.";

      setAiMessages((prev) => [
        ...prev,
        {
          id: `${Date.now()}-assistant-error`,
          role: "assistant",
          text: errorMessage,
        },
      ]);
    }
  };

  return (
    <div className="public-chat-widget" style={{ bottom: `${bottomOffset}px` }}>
      {isCommunityOpen ? (
        <Stack className="public-chat-panel">
          <Stack className="public-chat-header" direction="row" justifyContent="space-between" alignItems="center">
            <div>
              <strong>Community Chat</strong>
              <span>{isConnected ? "Live now" : isConnecting ? "Connecting..." : "Read-only preview"}</span>
            </div>
            <IconButton onClick={() => setIsCommunityOpen(false)}>
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
                  void handleCommunitySubmit();
                }
              }}
              placeholder={isLoggedIn ? "Write your message..." : "Login to send a message"}
            />
            <button type="button" onClick={() => void handleCommunitySubmit()}>
              {isConnecting ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <SendRoundedIcon />}
            </button>
          </Stack>
        </Stack>
      ) : null}

      {isAiOpen ? (
        <Stack className="public-chat-panel ai-chat-panel">
          <Stack className="public-chat-header ai-chat-header" direction="row" justifyContent="space-between" alignItems="center">
            <div>
              <strong>AI Chat</strong>
              <span>Private health guidance for patients</span>
            </div>
            <IconButton onClick={() => setIsAiOpen(false)}>
              <CloseRoundedIcon />
            </IconButton>
          </Stack>

          <div className="public-chat-messages ai-chat-messages" ref={listRef}>
            {aiMessages.map((message) => (
              <div
                key={message.id}
                className={`public-chat-message ai-chat-message ${message.role === "user" ? "mine" : "assistant"}`.trim()}
              >
                <div className="public-chat-message-meta">
                  <strong>{message.role === "user" ? user?.memberNick || "You" : "MedBook AI"}</strong>
                </div>
                <p>{message.text}</p>
              </div>
            ))}
          </div>

          <Stack className="public-chat-composer ai-chat-composer" direction="row" spacing={1}>
            <input
              value={aiMessageText}
              onChange={(event) => setAiMessageText(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void handleAiSubmit();
                }
              }}
              placeholder="Ask a health question..."
            />
            <button type="button" onClick={() => void handleAiSubmit()}>
              {isAiLoading ? <CircularProgress size={18} sx={{ color: "#fff" }} /> : <SendRoundedIcon />}
            </button>
          </Stack>
        </Stack>
      ) : null}

      <div className="public-chat-launchers">
        <button
          type="button"
          className="public-chat-launcher ai-launcher"
          onClick={() => void handleAiLauncher()}
          aria-label="Open AI chat"
        >
          <SmartToyRoundedIcon />
          <span>AI Chat</span>
        </button>

        <button
          type="button"
          className="public-chat-launcher"
          onClick={() => {
            setIsAiOpen(false);
            setIsCommunityOpen((prev) => !prev);
          }}
          aria-label="Open public chat"
        >
          <ForumRoundedIcon />
          <span>Chat</span>
        </button>
      </div>
    </div>
  );
};

export default PublicChatWidget;
