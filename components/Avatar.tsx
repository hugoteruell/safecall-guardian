import Image from 'next/image';

type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';

const sizeMap: Record<Size, number> = {
  xs: 28,
  sm: 36,
  md: 44,
  lg: 56,
  xl: 72,
  '2xl': 96,
};

const ringClassMap: Record<Size, string> = {
  xs: 'ring-1',
  sm: 'ring-1',
  md: 'ring-2',
  lg: 'ring-2',
  xl: 'ring-2',
  '2xl': 'ring-2',
};

type Props = {
  seed: string;
  size?: Size;
  ring?: boolean;
  className?: string;
};

/**
 * Illustrated portrait via DiceBear (personas style). Stable per seed.
 * Background tuned to our cream palette so avatars feel native.
 */
export default function Avatar({ seed, size = 'md', ring = false, className = '' }: Props) {
  const px = sizeMap[size];
  // Background colors picked to harmonize with the warm-intelligence palette.
  const backgroundColors = ['F2E3D2', 'F8DFD2', 'DDE9DC', 'EFE6D2'].join(',');
  const url = `https://api.dicebear.com/9.x/personas/svg?seed=${encodeURIComponent(seed)}&backgroundColor=${backgroundColors}&backgroundType=solid`;
  const ringClass = ring ? `${ringClassMap[size]} ring-cream-deep ring-offset-2 ring-offset-cream` : '';

  return (
    <Image
      src={url}
      alt={`${seed} avatar`}
      width={px}
      height={px}
      unoptimized
      className={`rounded-full bg-cream-soft ${ringClass} ${className}`}
      style={{ width: px, height: px }}
    />
  );
}
