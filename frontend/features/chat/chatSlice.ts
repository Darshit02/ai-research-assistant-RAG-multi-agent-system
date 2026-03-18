import { createSlice, PayloadAction } from "@reduxjs/toolkit";
import { Session, ChatMessage } from "@/shared/api/sessions";

interface ChatState {
  sessions: Session[];
  activeSessionId: string | null;
  messages: Record<string, ChatMessage[]>;
  loading: boolean;
}

const initialState: ChatState = {
  sessions: [],
  activeSessionId: null,
  messages: {},
  loading: false,
};

const chatSlice = createSlice({
  name: "chat",
  initialState,
  reducers: {
    setSessions: (state, action: PayloadAction<Session[]>) => {
      state.sessions = action.payload;
    },
    addSession: (state, action: PayloadAction<Session>) => {
      state.sessions.unshift(action.payload);
    },
    removeSession: (state, action: PayloadAction<string>) => {
      state.sessions = state.sessions.filter(
        (s) => s.session_id !== action.payload
      );
      if (state.activeSessionId === action.payload) {
        state.activeSessionId = state.sessions[0]?.session_id ?? null;
      }
      delete state.messages[action.payload];
    },
    setActiveSession: (state, action: PayloadAction<string>) => {
      state.activeSessionId = action.payload;
    },
    updateSessionTitle: (
      state,
      action: PayloadAction<{ sessionId: string; title: string }>
    ) => {
      const session = state.sessions.find(
        (s) => s.session_id === action.payload.sessionId
      );
      if (session) {
        session.title = action.payload.title;
      }
    },
    updateSessionSettings: (
      state,
      action: PayloadAction<{ sessionId: string; language?: string; model_name?: string }>
    ) => {
      const session = state.sessions.find(
        (s) => s.session_id === action.payload.sessionId
      );
      if (session) {
        if (action.payload.language) session.language = action.payload.language;
        if (action.payload.model_name) session.model_name = action.payload.model_name;
      }
    },
    setMessages: (
      state,
      action: PayloadAction<{ sessionId: string; messages: ChatMessage[] }>
    ) => {
      state.messages[action.payload.sessionId] = action.payload.messages;
    },
    appendMessage: (
      state,
      action: PayloadAction<{ sessionId: string; message: ChatMessage }>
    ) => {
      const { sessionId, message } = action.payload;
      if (!state.messages[sessionId]) state.messages[sessionId] = [];
      state.messages[sessionId].push(message);
    },
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.loading = action.payload;
    },
  },
});

export const {
  setSessions,
  addSession,
  removeSession,
  setActiveSession,
  updateSessionTitle,
  updateSessionSettings,
  setMessages,
  appendMessage,
  setLoading,
} = chatSlice.actions;
export default chatSlice.reducer;
