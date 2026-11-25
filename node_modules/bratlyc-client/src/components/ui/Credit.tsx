interface Props {
  visible: boolean;
}

const link = 'underline underline-offset-2 hover:opacity-100';

export function Credit({ visible }: Props) {
  return (
    <div
      className="fixed bottom-3 left-3 z-10 max-w-[60vw] text-[11px] leading-relaxed opacity-70 transition-opacity duration-500"
      style={{ opacity: visible ? 0.7 : 0, pointerEvents: visible ? 'auto' : 'none' }}
    >
      <p>
        Created by{' '}
        <a href="https://nneb.is-a.dev/" target="_blank" rel="noopener noreferrer" className={link}>
          Ben Timothy
        </a>
      </p>
      <p>
        <a href="https://github.com/BenTimothyM" target="_blank" rel="noopener noreferrer" className={link}>
          GitHub
        </a>
        {' · '}
        <a href="https://github.com/BenTimothyM/bratlyc" target="_blank" rel="noopener noreferrer" className={link}>
          Open source (MIT)
        </a>
      </p>
    </div>
  );
}