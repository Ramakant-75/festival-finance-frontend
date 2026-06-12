import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  IconButton,
  TextField,
  Typography,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import MinimizeIcon from '@mui/icons-material/Minimize';
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

const AI_ASSISTANT_URL = 'http://localhost:8085';

// ── Persistence helpers — keep chat alive across page navigations ─────────────
const STORAGE_KEYS = {
  open:      'chatOpen',
  minimized: 'chatMinimized',
  messages:  'chatMessages',
  input:     'chatInput',
};

const loadState = (key, fallback) => {
  try {
    const saved = localStorage.getItem(key);
    return saved !== null ? JSON.parse(saved) : fallback;
  } catch {
    return fallback;
  }
};

const saveState = (key, value) => {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {}
};

// ── Welcome message constant — shown only when there are no messages yet ──────
const WELCOME = {
  sender: 'ai',
  text: '🙏 Jai Ganesh! Ask me anything about our festival finances — donations by building, expense breakdown, payment status, and more! You can ask multiple questions in one go too.',
  isWelcome: true,   // flag so we never persist this to localStorage
};

const ChatWidget = () => {
  // ── State — all initialised from localStorage so they survive page changes ──
  const [open,      setOpen]      = useState(() => loadState(STORAGE_KEYS.open,      false));
  const [minimized, setMinimized] = useState(() => loadState(STORAGE_KEYS.minimized, false));
  const [messages,  setMessages]  = useState(() => loadState(STORAGE_KEYS.messages,  []));
  const [input,     setInput]     = useState(() => loadState(STORAGE_KEYS.input,     ''));
  const [loading,   setLoading]   = useState(false);

  const scrollRef   = useRef();
  const theme       = useTheme();
  const isDark      = theme.palette.mode === 'dark';

  const authString  = localStorage.getItem('auth') || '{}';
  const auth        = JSON.parse(authString);
  const sessionId   = auth?.username || 'guest';

  // ── Persist every state change to localStorage ────────────────────────────
  useEffect(() => { saveState(STORAGE_KEYS.open,      open);      }, [open]);
  useEffect(() => { saveState(STORAGE_KEYS.minimized, minimized); }, [minimized]);
  useEffect(() => { saveState(STORAGE_KEYS.input,     input);     }, [input]);

  // Save messages — but exclude the transient welcome message
  useEffect(() => {
    const toSave = messages.filter(m => !m.isWelcome);
    saveState(STORAGE_KEYS.messages, toSave);
  }, [messages]);

  // ── Reset on logout ───────────────────────────────────────────────────────
  useEffect(() => {
    if (!auth?.token || !auth?.username) {
      const t = setTimeout(() => {
        setOpen(false);
        setMinimized(false);
        setMessages([]);
        setInput('');
        Object.values(STORAGE_KEYS).forEach(k => localStorage.removeItem(k));
      }, 100);
      return () => clearTimeout(t);
    }
  }, [authString]);

  // ── Auto-scroll on new messages ───────────────────────────────────────────
  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loading]);

  const toggleChat     = () => setOpen(prev => !prev);
  const toggleMinimize = () => setMinimized(prev => !prev);

  // ── Send message — includes full conversation history for context chaining ─
  const sendMessage = async () => {
    const question = input.trim();
    if (!question || loading) return;

    const userMsg = { sender: 'user', text: question };
    const updatedMessages = [...messages.filter(m => !m.isWelcome), userMsg];

    setMessages(updatedMessages);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        `${AI_ASSISTANT_URL}/api/assistant/ask`,
        {
          userId:   sessionId,
          question: question,
          // Send last 10 messages as context (5 turns) — agent uses this for chaining
          history: updatedMessages.slice(-10).map(m => ({
            sender: m.sender,
            text:   typeof m.text === 'object' ? JSON.stringify(m.text) : m.text,
          })),
        },
        { headers: { 'Content-Type': 'application/json' } }
      );

      const answer = response.data.answer;
      let parsedAnswer;
      if (typeof answer === 'string') {
        try   { parsedAnswer = JSON.parse(answer); }
        catch { parsedAnswer = answer.replace(/📊 /, ''); }
      } else {
        parsedAnswer = answer;
      }

      setMessages(prev => [...prev, { sender: 'ai', text: parsedAnswer }]);

    } catch (err) {
      const detail = err?.response?.data?.detail || null;
      setMessages(prev => [
        ...prev,
        {
          sender: 'ai',
          text: detail
            ? { value: `Error: ${detail}` }
            : { value: 'The assistant is offline 😴 — make sure the Python server is running on port 8085.' },
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // ── Render an AI answer — handles string, { value }, and table arrays ──────
  const renderAnswer = (text) => {
    if (!text) return null;

    if (text.error) {
      return <Typography variant="body2" color="error">{text.error}</Typography>;
    }

    if (typeof text === 'string') {
      return (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {text}
        </Typography>
      );
    }

    if (text.value) {
      return (
        <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
          {text.value}
        </Typography>
      );
    }

    if (Array.isArray(text) && text.length > 0) {
      const keys = Object.keys(text[0]);
      return (
        <TableContainer sx={{ maxWidth: '100%', overflowX: 'auto' }}>
          <Table size="small">
            <TableHead>
              <TableRow>
                {keys.map(key => (
                  <TableCell key={key} sx={{ fontWeight: 'bold', fontSize: 11, padding: '4px 8px' }}>
                    {key}
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {text.map((row, i) => (
                <TableRow key={i}>
                  {keys.map(key => (
                    <TableCell key={key} sx={{ fontSize: 11, padding: '4px 8px' }}>
                      {row[key] !== null && row[key] !== undefined ? String(row[key]) : '—'}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    return (
      <Typography variant="body2" sx={{ whiteSpace: 'pre-wrap' }}>
        {JSON.stringify(text, null, 2)}
      </Typography>
    );
  };

  // ── What to display — real messages, with welcome prepended if chat is empty
  const displayMessages = messages.length === 0
    ? [WELCOME]
    : messages;

  // ── Collapsed button ──────────────────────────────────────────────────────
  if (!open) {
    return (
      <IconButton
        onClick={toggleChat}
        sx={{
          position: 'fixed',
          bottom: 20,
          right: 20,
          bgcolor: 'primary.main',
          color: 'white',
          '&:hover': { bgcolor: 'primary.dark' },
          zIndex: 9999,
        }}
      >
        <ChatIcon />
      </IconButton>
    );
  }

  // ── Chat panel ────────────────────────────────────────────────────────────
  return (
    <Box
      sx={{
        position: 'fixed',
        bottom: 20,
        right: 20,
        width: 340,
        height: minimized ? 50 : 460,
        bgcolor: isDark ? 'grey.900' : 'white',
        borderRadius: 2,
        boxShadow: 4,
        display: 'flex',
        flexDirection: 'column',
        zIndex: 9999,
        transition: 'height 0.3s ease',
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1,
          bgcolor: 'primary.main',
          color: 'white',
          borderRadius: minimized ? 2 : '8px 8px 0 0',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexShrink: 0,
        }}
      >
        <Box>
          <Typography fontWeight="bold" fontSize={14}>🙏 Festival Finance AI</Typography>
          {!minimized && (
            <Typography fontSize={10} sx={{ opacity: 0.8 }}>
              Powered by Llama3 · Ask about donations &amp; expenses
            </Typography>
          )}
        </Box>
        <Box>
          <IconButton onClick={toggleMinimize} size="small" sx={{ color: 'white', mr: 0.5 }}>
            <MinimizeIcon fontSize="small" />
          </IconButton>
          <IconButton onClick={toggleChat} size="small" sx={{ color: 'white' }}>
            <CloseIcon fontSize="small" />
          </IconButton>
        </Box>
      </Box>

      {/* Chat body */}
      {!minimized && (
        <Box
          sx={{
            flex: 1,
            p: 1,
            overflowY: 'auto',
            bgcolor: isDark ? 'grey.900' : '#f9f9f9',
            display: 'flex',
            flexDirection: 'column',
            gap: 1,
          }}
        >
          {displayMessages.map((msg, i) => (
            <Paper
              key={i}
              elevation={0}
              sx={{
                p: 1.5,
                bgcolor: msg.sender === 'user'
                  ? isDark ? 'grey.700' : '#e3f2fd'
                  : isDark ? 'grey.800' : 'white',
                border: '1px solid',
                borderColor: isDark ? 'grey.600' : '#e0e0e0',
                alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
                maxWidth: '90%',
                borderRadius: msg.sender === 'user'
                  ? '12px 12px 2px 12px'
                  : '12px 12px 12px 2px',
              }}
            >
              {msg.sender === 'user'
                ? <Typography variant="body2">{msg.text}</Typography>
                : renderAnswer(msg.text)
              }
            </Paper>
          ))}

          {loading && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, pl: 1 }}>
              <CircularProgress size={14} />
              <Typography variant="caption" color="text.secondary">
                Thinking...
              </Typography>
            </Box>
          )}

          <div ref={scrollRef} />
        </Box>
      )}

      {/* Input */}
      {!minimized && (
        <Box
          sx={{
            p: 1,
            borderTop: '1px solid',
            borderColor: isDark ? 'grey.700' : '#e0e0e0',
            display: 'flex',
            gap: 1,
            bgcolor: isDark ? 'grey.900' : 'white',
            borderRadius: '0 0 8px 8px',
            flexShrink: 0,
          }}
        >
          <TextField
            value={input}
            onChange={e => setInput(e.target.value)}
            fullWidth
            size="small"
            placeholder="e.g. Total donations from D-3 and how many via UPI?"
            onKeyDown={e => e.key === 'Enter' && !loading && sendMessage()}
            disabled={loading}
            InputProps={{
              sx: {
                bgcolor: isDark ? 'grey.800' : 'white',
                color:   isDark ? 'grey.100' : 'black',
                fontSize: 13,
              },
            }}
          />
          <IconButton
            onClick={sendMessage}
            disabled={loading || !input.trim()}
            color="primary"
            size="small"
          >
            {loading
              ? <CircularProgress size={18} />
              : <SendIcon fontSize="small" />
            }
          </IconButton>
        </Box>
      )}
    </Box>
  );
};

export default ChatWidget;
