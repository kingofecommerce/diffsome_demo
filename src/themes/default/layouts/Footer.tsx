export function Footer() {
  return (
    <footer className="border-t border-border/40 bg-muted/30">
      <div className="max-w-5xl mx-auto px-4 py-6">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 bg-primary rounded-md flex items-center justify-center">
              <span className="text-primary-foreground font-bold text-xs">P</span>
            </div>
            <span className="font-medium text-foreground">Promptly</span>
          </div>
          
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} Promptly. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
