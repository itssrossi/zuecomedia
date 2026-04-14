

## Plan: Add Real Estate Link to Main Navbar

Add a "Real Estate" navigation link to the Navbar component in both desktop and mobile menus.

### Changes

**File: `src/components/Navbar.tsx`**
- Add a `<Link to="/real-estate">` entry in the desktop nav (after "Contact", before "Log In")
- Add the same link in the mobile menu section (after "Contact", before "Log In")
- Style it consistently with the existing nav links (`text-white hover:text-zue-blue transition-colors`)

