import { SiteHeader } from "./site-header";

export function SiteChrome({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main className="site-main">{children}</main>
    </>
  );
}
