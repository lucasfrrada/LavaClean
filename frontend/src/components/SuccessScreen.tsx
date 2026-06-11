import {motion} from "motion/react";
import {CheckCircle} from "lucide-react";

type SuccessScreenProps = {
  title: string;
  message: string;
};

export default function SuccessScreen({title, message}: SuccessScreenProps) {
  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[#6B4F3E]/80 px-4 backdrop-blur-sm"
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
          className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600"
        >
          <CheckCircle size={44} />
        </motion.div>

        <h2 className="mt-6 text-2xl font-bold text-[#6B4F3E]">{title}</h2>

        <p className="mt-3 text-sm leading-relaxed text-[#9A7C5F]">{message}</p>

        <div className="mt-6 h-2 w-full overflow-hidden rounded-full bg-[#F5EEDC]">
          <motion.div
            className="h-full bg-[#6B4F3E]"
            initial={{width: "0%"}}
            animate={{width: "100%"}}
            transition={{
              duration: 2,
              ease: "linear",
            }}
          />
        </div>

        <p className="mt-3 text-xs font-semibold text-[#B8A58F]">
          Redirigiendo...
        </p>
      </motion.div>
    </motion.div>
  );
}
