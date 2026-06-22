import {motion} from "motion/react";
import {CheckCircle} from "lucide-react";

type SuccessScreenProps = {
  title: string;
  message: string;
};

export default function SuccessScreen({title, message}: SuccessScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#1D4ED8]/80 px-4 backdrop-blur-sm"
      initial={{opacity: 0}}
      animate={{opacity: 1}}
      exit={{opacity: 0}}
    >
      <motion.div
        initial={{scale: 0.85, opacity: 0, y: 20}}
        animate={{scale: 1, opacity: 1, y: 0}}
        transition={{
          duration: 0.35,
          ease: "easeOut",
        }}
        className="w-full max-w-md rounded-3xl bg-white p-8 text-center shadow-2xl"
      >
        <motion.div
          initial={{scale: 0}}
          animate={{scale: 1}}
          transition={{
            delay: 0.15,
            type: "spring",
            stiffness: 180,
            damping: 12,
          }}
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-blue-100 text-blue-600"
        >
          <CheckCircle size={44} />
        </motion.div>

        <h2 className="mt-6 text-2xl font-bold text-[#111827]">{title}</h2>

        <p className="mt-3 text-sm leading-relaxed text-[#64748B]">{message}</p>

        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#DBEAFE]">
          <motion.div
            className="h-full bg-[#1D4ED8]"
            initial={{width: "0%"}}
            animate={{width: "100%"}}
            transition={{
              duration: 2,
              ease: "linear",
            }}
          />
        </div>

        <p className="mt-3 text-xs font-semibold text-[#94A3B8]">
          Redirigiendo...
        </p>
      </motion.div>
    </motion.div>
  );
}
