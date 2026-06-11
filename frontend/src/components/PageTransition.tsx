import {motion} from "motion/react";

type PageTransitionProps = {
  children: React.ReactNode;
};

export default function PageTransition({children}: PageTransitionProps) {
  return (
    <motion.div
      initial={{opacity: 0, y: 12}}
      animate={{opacity: 1, y: 0}}
      exit={{opacity: 0, y: -12}}
      transition={{
        duration: 0.3,
        ease: "easeOut",
      }}
    >
      {children}
    </motion.div>
  );
}
