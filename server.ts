import express from "express";
import path from "path";
import { fileURLToPath } from "url";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import { createClient } from "@supabase/supabase-js";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Initialize Supabase Client
const supabaseUrl = process.env.VITE_SUPABASE_URL || "";
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY || "";

if (!supabaseUrl || !supabaseKey) {
  console.error("CRITICAL: Missing Supabase environment variables on server!");
} else {
  console.log("Supabase initialized on server with URL:", supabaseUrl);
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) {
    console.log("Using Service Role Key for elevated permissions.");
  } else {
    console.warn("Service Role Key missing, falling back to Anon Key (might cause permission issues).");
  }
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Admin Stats Endpoint
  app.get("/api/admin/stats", async (req, res) => {
    try {
      // Get total users from profiles
      const { count: totalUsers, error: usersError } = await supabase
        .from('profiles')
        .select('*', { count: 'exact', head: true });

      if (usersError) {
        console.error("Supabase Users Error:", usersError);
      }

      // Get total movies
      const { count: totalMovies, error: moviesError } = await supabase
        .from('content')
        .select('*', { count: 'exact', head: true });
      
      if (moviesError) {
        console.error("Supabase Movies Error:", moviesError);
      }
      
      // Get category stats
      const { data: movies, error: catError } = await supabase
        .from('content')
        .select('category');

      if (catError) {
        console.error("Supabase Category Error:", catError);
      }

      // If everything failed, then throw
      if (usersError && moviesError && catError) {
        throw new Error(`All Supabase queries failed. Check configuration. Last error: ${usersError.message}`);
      }

      const categoryStats = (movies || []).reduce((acc: any, movie: any) => {
        const cat = movie.category || 'Uncategorized';
        acc[cat] = (acc[cat] || 0) + 1;
        return acc;
      }, {});

      res.json({
        totalUsers: totalUsers || 0,
        totalMovies: totalMovies || 0,
        categoryStats,
        errors: {
          users: usersError?.message,
          movies: moviesError?.message,
          categories: catError?.message
        }
      });
    } catch (error: any) {
      console.error("Admin Stats Error:", error);
      res.status(500).json({ error: error.message });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
