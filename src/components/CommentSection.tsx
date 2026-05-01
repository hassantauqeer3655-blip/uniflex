import React, { useState, useEffect } from 'react';
import { Send, User, Trash2, Loader2, MessageSquare } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { useAuth } from '../context/AuthContext';
import { cn } from '../lib/utils';

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  user_avatar: string;
  text: string;
  created_at: string;
}

interface CommentSectionProps {
  movieId: string;
}

export default function CommentSection({ movieId }: CommentSectionProps) {
  const { user, userData } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!movieId) return;

    // Fetch initial comments
    const fetchComments = async () => {
      setLoading(true);
      const { data, error } = await supabase
        .from('comments')
        .select('*')
        .eq('movie_id', movieId)
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching comments:", error);
      } else {
        setComments(data || []);
      }
      setLoading(false);
    };

    fetchComments();

    // Subscribe to real-time changes
    const channel = supabase
      .channel(`comments:${movieId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'comments',
          filter: `movie_id=eq.${movieId}`
        },
        (payload) => {
          if (payload.eventType === 'INSERT') {
            setComments(prev => [payload.new as Comment, ...prev]);
          } else if (payload.eventType === 'DELETE') {
            setComments(prev => prev.filter(c => c.id !== payload.old.id));
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [movieId]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !newComment.trim() || isSubmitting) return;

    const mainProfile = userData?.profiles?.[0];

    setIsSubmitting(true);
    try {
      const { error } = await supabase
        .from('comments')
        .insert([{
          movie_id: movieId,
          user_id: user.id,
          user_name: mainProfile?.name || user.email?.split('@')[0] || 'Anonymous',
          user_avatar: mainProfile?.avatar || '',
          text: newComment.trim()
        }]);

      if (error) throw error;
      setNewComment('');
    } catch (error) {
      console.error("Error posting comment:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (commentId: string) => {
    try {
      const { error } = await supabase
        .from('comments')
        .delete()
        .eq('id', commentId);
      
      if (error) throw error;
    } catch (error) {
      console.error("Error deleting comment:", error);
    }
  };

  const isAdmin = user?.email === 'hassantauqeer3655@gmail.com';

  return (
    <div className="mt-10 space-y-8 bg-zinc-900/30 rounded-3xl p-6 md:p-8 border border-white/5">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black tracking-tighter uppercase flex items-center gap-3">
          <MessageSquare className="h-6 w-6 text-primary-purple" />
          Discussion Hub
        </h2>
        <span className="text-xs font-bold text-zinc-500 uppercase tracking-widest">
          {comments.length} Comments
        </span>
      </div>

      {user ? (
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="relative group">
            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value.slice(0, 300))}
              placeholder="Join the conversation..."
              className="w-full h-24 bg-zinc-900/50 border border-zinc-800 rounded-2xl p-4 text-white placeholder:text-zinc-600 focus:outline-none focus:border-primary-purple focus:ring-4 focus:ring-primary-purple/5 transition-all resize-none no-scrollbar"
            />
            <div className="absolute bottom-4 right-4 flex items-center gap-4">
              <span className={cn(
                "text-[10px] font-black uppercase tracking-widest transition-colors",
                newComment.length >= 280 ? "text-primary-magenta" : "text-zinc-600"
              )}>
                {newComment.length} / 300
              </span>
              <button
                type="submit"
                disabled={isSubmitting || !newComment.trim()}
                className="p-2 rounded-xl bg-primary-purple text-white hover:bg-primary-magenta disabled:opacity-50 disabled:hover:bg-primary-purple transition-all duration-300 shadow-lg shadow-primary-purple/20"
              >
                {isSubmitting ? (
                  <Loader2 className="h-5 w-5 animate-spin" />
                ) : (
                  <Send className="h-5 w-5" />
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        <div className="bg-zinc-900/50 border border-dashed border-zinc-800 rounded-2xl p-8 text-center space-y-4">
          <User className="h-10 w-10 text-zinc-700 mx-auto" />
          <p className="text-zinc-500 font-bold uppercase tracking-widest text-sm">
            Sign in to join the conversation
          </p>
        </div>
      )}

      <div className="space-y-6 max-h-[500px] overflow-y-auto no-scrollbar pr-2">
        {loading ? (
          <div className="flex justify-center py-10">
            <Loader2 className="h-8 w-8 text-primary-purple animate-spin" />
          </div>
        ) : comments.length > 0 ? (
          comments.map((comment) => (
            <div key={comment.id} className="group flex gap-4 animate-in fade-in slide-in-from-left-4 duration-500">
              <div className="flex-shrink-0">
                <div className="h-10 w-10 rounded-full overflow-hidden bg-zinc-800 border border-white/5">
                  {comment.user_avatar ? (
                    <img 
                      src={comment.user_avatar} 
                      alt={comment.user_name} 
                      className="h-full w-full object-cover"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <div className="h-full w-full flex items-center justify-center text-xs font-black text-zinc-500">
                      {comment.user_name.charAt(0)}
                    </div>
                  )}
                </div>
              </div>
              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-black text-white">{comment.user_name}</span>
                    <span className="text-[10px] font-bold text-zinc-600 uppercase">
                      {new Date(comment.created_at).toLocaleDateString()}
                    </span>
                  </div>
                  {(user?.id === comment.user_id || isAdmin) && (
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg text-zinc-600 hover:text-primary-magenta hover:bg-primary-magenta/10 transition-all"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <p className="text-zinc-400 text-sm leading-relaxed">
                  {comment.text}
                </p>
              </div>
            </div>
          ))
        ) : (
          <div className="text-center py-10">
            <p className="text-zinc-600 font-bold uppercase tracking-widest text-xs">
              No comments yet. Start the discussion!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
