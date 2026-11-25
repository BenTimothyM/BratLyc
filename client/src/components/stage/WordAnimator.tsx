import { motion } from 'framer-motion';

/** Reveals each word of a line in sequence, ~80ms apart (capped at 1.4s). */
export function WordAnimator({ text }: { text: string }) {
  const words = text.split(/\s+/);
  return (
    <span>
      {words.map((word, i) => (
        <motion.span
          key={i}
          className="mr-[0.25em] inline-block"
          initial={{ opacity: 0, y: '0.25em' }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: Math.min(i * 0.08, 1.4), duration: 0.5, ease: 'easeOut' }}
        >
          {word}
        </motion.span>
      ))}
    </span>
  );
}
