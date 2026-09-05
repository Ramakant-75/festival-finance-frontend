import React, { createContext, useContext, useState, useEffect } from "react";
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
} from "@mui/material";
import Confetti from "react-confetti";

const CelebrationContext = createContext();

export const CelebrationProvider = ({ children }) => {
  const [celebrate, setCelebrate] = useState(false);
  const [openDialog, setOpenDialog] = useState(false);
  const [latestMilestone, setLatestMilestone] = useState(null);
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  useEffect(() => {
    const handleResize = () => {
      setWindowSize({ width: window.innerWidth, height: window.innerHeight });
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const triggerCelebration = (milestone) => {
    setLatestMilestone(milestone);
    setOpenDialog(true);
    setCelebrate(true);
    setTimeout(() => setCelebrate(false), 4000);
  };

  // ✅ Expose triggerCelebration globally so non-React code (like ManageDonations) can use it
  useEffect(() => {
    window.triggerCelebration = triggerCelebration;
    return () => {
      delete window.triggerCelebration;
    };
  }, []);

  return (
    <CelebrationContext.Provider value={{ triggerCelebration }}>
      {children}

      {/* 🎉 Confetti */}
      {celebrate && (
        <Confetti width={windowSize.width} height={windowSize.height} />
      )}

      {/* 🎉 Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)}>
        <DialogTitle>🎉 Congratulations!</DialogTitle>
        <DialogContent>
          <Typography variant="h6">
            You’ve unlocked the <b>₹{latestMilestone?.toLocaleString()}</b> milestone!
          </Typography>
          <Typography variant="body2" color="text.secondary">
            Thanks to all our amazing donors for making this possible!
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} variant="contained">
            Awesome 🚀
          </Button>
        </DialogActions>
      </Dialog>
    </CelebrationContext.Provider>
  );
};

export const useCelebration = () => useContext(CelebrationContext);
