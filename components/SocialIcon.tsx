import socialPaths from '@/lib/__social.json';

export type SocialNetwork = keyof typeof socialPaths;

export const socialNetworks = Object.keys(socialPaths) as SocialNetwork[];

export default function SocialIcon({
  network,
  size = 20,
}: {
  network: SocialNetwork;
  size?: number;
}) {
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      aria-hidden="true"
      focusable="false"
    >
      <path d={socialPaths[network]} fill="currentColor" />
    </svg>
  );
}