import { Facebook, Twitter, Instagram, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="border-t border-border/40 bg-white">
      <div className="container py-6 flex items-center justify-between flex-col sm:flex-row gap-4">
        
        {/* Left Side: Copyright */}
        <p className="text-sm text-muted-foreground text-center sm:text-left">
          &copy; {new Date().getFullYear()} TextBehindImage. All rights reserved.
        </p>
        
        {/* Right Side: Social Media Icons */}
        <div className="flex items-center gap-4">
          <a 
            href="https://www.facebook.com/textbehindimageai/" // <-- Replace with your URL
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Facebook"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Facebook className="h-5 w-5" />
          </a>
          <a 
            href="#" // <-- Replace with your URL
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Twitter"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Twitter className="h-5 w-5" />
          </a>
          <a 
            href="#" // <-- Replace with your URL
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="Instagram"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Instagram className="h-5 w-5" />
          </a>
          <a 
            href="#" // <-- Replace with your URL
            target="_blank" 
            rel="noopener noreferrer"
            aria-label="LinkedIn"
            className="text-muted-foreground hover:text-primary transition-colors"
          >
            <Linkedin className="h-5 w-5" />
          </a>
        </div>

      </div>
    </footer>
  );
}