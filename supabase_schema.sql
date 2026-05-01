-- 1. Content Table (Movies & Series)
CREATE TABLE content (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  title TEXT NOT NULL,
  description TEXT,
  poster_url TEXT,
  backdrop_url TEXT,
  video_url TEXT,
  trailer_url TEXT,
  release_date DATE,
  vote_average FLOAT DEFAULT 0,
  media_type TEXT CHECK (media_type IN ('movie', 'tv')),
  genre_ids INTEGER[],
  category TEXT,
  region TEXT,
  status TEXT,
  is_anime BOOLEAN DEFAULT FALSE,
  is_series BOOLEAN DEFAULT FALSE,
  subtitles JSONB DEFAULT '[]',
  audio_tracks JSONB DEFAULT '[]',
  episodes JSONB DEFAULT '[]', -- Added for episode grid support
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Profiles Table (Linked to auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  avatar_url TEXT,
  email TEXT,
  role TEXT DEFAULT 'user' CHECK (role IN ('admin', 'user')),
  settings JSONB DEFAULT '{
    "autoplay": true,
    "notifications": true,
    "backgroundIntensity": 50,
    "playbackSpeed": 1.0,
    "dataSaver": false,
    "accentColor": "purple"
  }',
  watch_history JSONB DEFAULT '[]',
  downloads JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Site Settings Table
CREATE TABLE site_settings (
  key TEXT PRIMARY KEY,
  value TEXT NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Creators Table (Spotlight)
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  role TEXT NOT NULL,
  image_url TEXT,
  github_url TEXT,
  linkedin_url TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Row Level Security (RLS)

-- Content: Everyone can read, only Admins can write
ALTER TABLE content ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on content"
  ON content FOR SELECT
  USING (true);

CREATE POLICY "Allow admin write access on content"
  ON content FOR ALL
  USING (
    auth.jwt() ->> 'email' = 'hassantauqeer3655@gmail.com'
  );

-- Profiles: Users can read/write their own, Admins can read all
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own profiles"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own profiles"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own profiles"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own profiles"
  ON profiles FOR DELETE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (auth.jwt() ->> 'email' = 'hassantauqeer3655@gmail.com');

-- Site Settings: Everyone can read, only Admins can write
ALTER TABLE site_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on site_settings"
  ON site_settings FOR SELECT
  USING (true);

CREATE POLICY "Allow admin write access on site_settings"
  ON site_settings FOR ALL
  USING (
    auth.jwt() ->> 'email' = 'hassantauqeer3655@gmail.com'
  );

-- Creators: Everyone can read, only Admins can write
ALTER TABLE creators ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on creators"
  ON creators FOR SELECT
  USING (true);

CREATE POLICY "Allow admin write access on creators"
  ON creators FOR ALL
  USING (
    auth.jwt() ->> 'email' = 'hassantauqeer3655@gmail.com'
  );

-- 6. Indexes for Performance
CREATE INDEX idx_content_category ON content(category);
CREATE INDEX idx_content_media_type ON content(media_type);
CREATE INDEX idx_profiles_user_id ON profiles(user_id);

-- 7. Comments Table
CREATE TABLE comments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  movie_id TEXT NOT NULL, -- Using TEXT to support both UUID and TMDB IDs if needed
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  user_name TEXT NOT NULL,
  user_avatar TEXT,
  text TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

ALTER TABLE comments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public read access on comments"
  ON comments FOR SELECT
  USING (true);

CREATE POLICY "Allow authenticated users to insert comments"
  ON comments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Allow users to delete their own comments"
  ON comments FOR DELETE
  USING (auth.uid() = user_id OR auth.jwt() ->> 'email' = 'hassantauqeer3655@gmail.com');

CREATE INDEX idx_comments_movie_id ON comments(movie_id);

-- 8. My List Table
CREATE TABLE my_list (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  movie_id TEXT NOT NULL,
  movie_data JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  UNIQUE(user_id, movie_id)
);

ALTER TABLE my_list ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own list"
  ON my_list FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert into their own list"
  ON my_list FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete from their own list"
  ON my_list FOR DELETE
  USING (auth.uid() = user_id);

CREATE INDEX idx_my_list_user_id ON my_list(user_id);
