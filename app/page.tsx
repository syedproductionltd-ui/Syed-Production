import HomeSections from '@/components/home/HomeSections';
import RevealObserver from '@/components/RevealObserver';
import SiteFooter from '@/components/SiteFooter';

export default function HomePage() {
  return (
    <>
      <RevealObserver />
      <HomeSections />
      <SiteFooter isHome />
    </>
  );
}