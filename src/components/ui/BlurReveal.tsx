"use client";

import { motion } from "motion/react";

const transition = { duration: 1, ease: [0.25, 0.1, 0.25, 1] };
const variants = {
  hidden: { filter: "blur(10px)", transform: "translateY(20%)", opacity: 0 },
  visible: { filter: "blur(0)", transform: "translateY(0)", opacity: 1 },
};

export function BlurReveal({ children }: { children: React.ReactNode }) {
  return (
    <motion.div
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true }}
      transition={{ staggerChildren: 0.04 }}
    >
      {children}
    </motion.div>
  );
}

export function BlurRevealItem({ children }: { children: React.ReactNode }) {
  return (
    <motion.div transition={transition} variants={variants}>
      {children}
    </motion.div>
  );
}
