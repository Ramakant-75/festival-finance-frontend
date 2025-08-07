import React, { useState, useEffect, useRef } from 'react';
import {
  Box, IconButton, TextField, Typography, CircularProgress, Paper
} from '@mui/material';
import ChatIcon from '@mui/icons-material/Chat';
import SendIcon from '@mui/icons-material/Send';
import CloseIcon from '@mui/icons-material/Close';
import { useTheme } from '@mui/material/styles';
import aiApi from '../api/aiApi';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();
  const sessionId = useRef('session_' + Date.now());

  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  const toggleChat = () => setOpen(prev => !prev);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await aiApi.post('/chat', { message: input }, {
        headers: { 'X-Session-Id': sessionId.current }
      });
      const aiMsg = { sender: 'ai', text: response.data.response };
      setMessages(prev => [...prev, aiMsg]);
    } catch (err) {
      setMessages(prev => [...prev, { sender: 'ai', text: 'The assistant is offline 😴' }]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
          '&:hover': { bgcolor: 'primary.dark' }
        }}
      >
        <ChatIcon />
      </IconButton>
    );
  }

  return (
    <Box sx={{
      position: 'fixed',
      bottom: 20,
      right: 20,
      width: 320,
      height: 400,
      bgcolor: isDark ? 'grey.900' : 'white',
      borderRadius: 2,
      boxShadow: 4,
      display: 'flex',
      flexDirection: 'column',
      zIndex: 9999
    }}>
      {/* Header */}
      <Box sx={{
        p: 1,
        bgcolor: 'primary.main',
        color: 'white',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <Typography fontWeight="bold">AI Assistant</Typography>
        <IconButton onClick={toggleChat} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Chat Body */}
      <Box sx={{
        flex: 1,
        p: 1,
        overflowY: 'auto',
        bgcolor: isDark ? 'grey.900' : 'white'
      }}>
        {messages.map((msg, i) => (
          <Paper
            key={i}
            sx={{
              p: 1,
              mb: 1,
              bgcolor: msg.sender === 'user'
                ? (isDark ? 'grey.800' : 'grey.200')
                : (isDark ? 'primary.dark' : 'blue.50'),
              color: isDark ? 'grey.100' : 'black',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%'
            }}
          >
            <Typography variant="body2">{msg.text}</Typography>
          </Paper>
        ))}
        <div ref={scrollRef} />
      </Box>

      {/* Chat Input */}
      <Box sx={{
        p: 1,
        borderTop: '1px solid',
        borderColor: isDark ? 'grey.700' : '#ccc',
        display: 'flex',
        gap: 1,
        bgcolor: isDark ? 'grey.900' : 'white'
      }}>
        <TextField
          value={input}
          onChange={e => setInput(e.target.value)}
          fullWidth
          size="small"
          placeholder="Ask something..."
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          InputProps={{
            sx: {
              bgcolor: isDark ? 'grey.800' : 'white',
              color: isDark ? 'grey.100' : 'black'
            }
          }}
        />
        <IconButton onClick={sendMessage} disabled={loading}>
          {loading ? <CircularProgress size={20} /> : <SendIcon />}
        </IconButton>
      </Box>
    </Box>
  );
};

export default ChatWidget;
