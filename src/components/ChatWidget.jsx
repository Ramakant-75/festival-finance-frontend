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
import { useTheme } from '@mui/material/styles';
import axios from 'axios';

const ChatWidget = () => {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const scrollRef = useRef();
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';

  // 🔑 Load auth info
  const auth = JSON.parse(localStorage.getItem('auth') || '{}');
  const sessionId = auth?.username || 'guest_' + Date.now();

  const toggleChat = () => setOpen((prev) => !prev);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: 'user', text: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const response = await axios.post(
        'http://localhost:8085/api/assistant/ask',
        { userId: sessionId, question: input },
        {
          headers: {
            Authorization: `Bearer ${auth.token}`,
          },
        }
      );

      // Extract and parse the answer field
      const answer = response.data.answer;
      let parsedAnswer;
      try {
        parsedAnswer = typeof answer === 'string' ? JSON.parse(answer) : answer;
      } catch (err) {
        console.error('Failed to parse answer:', answer, err);
        parsedAnswer = { error: 'Invalid response format' };
      }

      const aiMsg = { sender: 'ai', text: parsedAnswer };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { sender: 'ai', text: { error: 'The assistant is offline 😴' } },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Render the answer (handles JSON array, object, or error message)
  const renderAnswer = (text) => {
    // Handle error messages
    if (text.error) {
      return <Typography variant="body2">{text.error}</Typography>;
    }

    // Handle single value (e.g., {"value": "12345.0"})
    if (text.value) {
      return <Typography variant="body2">{text.value}</Typography>;
    }

    // Handle array of objects (e.g., [{"building": "NULL", "total_donation": "27000.0"}])
    if (Array.isArray(text) && text.length > 0) {
      const keys = Object.keys(text[0]);
      return (
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                {keys.map((key) => (
                  <TableCell key={key}>
                    <Typography variant="body2" fontWeight="bold">
                      {key === 'building' && text[0][key] === 'NULL' ? 'Building' : key}
                    </Typography>
                  </TableCell>
                ))}
              </TableRow>
            </TableHead>
            <TableBody>
              {text.map((row, index) => (
                <TableRow key={index}>
                  {keys.map((key) => (
                    <TableCell key={key}>
                      <Typography variant="body2">
                        {key === 'building' && row[key] === 'NULL' ? 'Unknown' : row[key]}
                      </Typography>
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      );
    }

    // Fallback for unexpected formats
    return <Typography variant="body2">{JSON.stringify(text)}</Typography>;
  };

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
        }}
      >
        <ChatIcon />
      </IconButton>
    );
  }

  return (
    <Box
      sx={{
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
        zIndex: 9999,
      }}
    >
      {/* Header */}
      <Box
        sx={{
          p: 1,
          bgcolor: 'primary.main',
          color: 'white',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
        }}
      >
        <Typography fontWeight="bold">AI Assistant</Typography>
        <IconButton onClick={toggleChat} size="small" sx={{ color: 'white' }}>
          <CloseIcon />
        </IconButton>
      </Box>

      {/* Chat Body */}
      <Box
        sx={{
          flex: 1,
          p: 1,
          overflowY: 'auto',
          bgcolor: isDark ? 'grey.900' : 'white',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {messages.map((msg, i) => (
          <Paper
            key={i}
            sx={{
              p: 1,
              mb: 1,
              bgcolor:
                msg.sender === 'user'
                  ? isDark
                    ? 'grey.800'
                    : 'grey.200'
                  : isDark
                  ? 'primary.dark'
                  : 'blue.50',
              color: isDark ? 'grey.100' : 'black',
              alignSelf: msg.sender === 'user' ? 'flex-end' : 'flex-start',
              maxWidth: '80%',
            }}
          >
            {msg.sender === 'user' ? (
              <Typography variant="body2">{msg.text}</Typography>
            ) : (
              renderAnswer(msg.text)
            )}
          </Paper>
        ))}
        <div ref={scrollRef} />
      </Box>

      {/* Chat Input */}
      <Box
        sx={{
          p: 1,
          borderTop: '1px solid',
          borderColor: isDark ? 'grey.700' : '#ccc',
          display: 'flex',
          gap: 1,
          bgcolor: isDark ? 'grey.900' : 'white',
        }}
      >
        <TextField
          value={input}
          onChange={(e) => setInput(e.target.value)}
          fullWidth
          size="small"
          placeholder="Ask something..."
          onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
          InputProps={{
            sx: {
              bgcolor: isDark ? 'grey.800' : 'white',
              color: isDark ? 'grey.100' : 'black',
            },
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