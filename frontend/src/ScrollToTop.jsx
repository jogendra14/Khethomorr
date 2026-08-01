import { useEffect } from "react";
import { useLocation } from "react-router-dom";

const ScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    // In pages par scroll-to-top nahi hoga
    const excludePaths = [
      "/product/:id",
    ];

    // Check karo ki current path exclude list me hai ya nahi
    const shouldExclude = excludePaths.some(path => {
      if (path.includes(":id")) {
        // Dynamic routes ke liye (product/:id)
        const pattern = path.replace(":id", "[^/]+");
        return new RegExp(`^${pattern}$`).test(pathname);
      }
      return path === pathname;
    });

    if (!shouldExclude) {
      window.scrollTo(0, 0);
    }
  }, [pathname]);

  return null;
};

export default ScrollToTop;
