import AppNavbarShell from "@/components/AppNavbarShell";
import "../globals.css";

export default function RootLayout({
    children,
}: Readonly<{
    children: React.ReactNode;
}>) {
    return (
        <div>
            <AppNavbarShell />
            <main className="flex-1">
                {children}
            </main>
        </div>
    );
}