// src/components/PageTransition.jsx
import React from "react";
import { motion } from "framer-motion";

const variants = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } },
  exit: { opacity: 0, y: -30, transition: { duration: 0.4, ease: "easeIn" } },
};

const PageTransition = ({ children }) => {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      style={{ height: "100%", width: "100%" }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
