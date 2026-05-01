import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, User, ThumbsUp, MessageCircle, Clock, MoreVertical, Trash2 } from 'lucide-react';
import { supabaseService } from '../services/supabaseService';
import { MovieComment } from '../types';
import { useAuth } from '../context/AuthContext';
import { formatDistanceToNow } from 'date-fns';

interface CommentsProps {
  movieId: string;
}

export default function Comments({ movieId }: CommentsProps) {
  const { userData } = useAuth();
  const [comments, setComments] = useState<MovieComment[]>([]);
  const [newComment, setNewComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadComments();
  }, [movieId]);

  const loadComments = async () => {
    setIsLoading(true);
    try {
      const data = await supabaseService.getComments(movieId);
      setComments(data as MovieComment[]);
    } catch (err) {
      console.error('Failed to load comments:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isSubmitting) return;

    setIsSubmitting(true);
    try {
      const commentData: Partial<MovieComment> = {
        movie_id: movieId,
        user_id: userData?.uid || 'anonymous',
        user_name: userData?.profiles?.[0]?.name || 'Anonymous User',
        user_avatar: userData?.profiles?.[0]?.avatar || '',
        text: newComment.trim(),
        created_at: new Date().toISOString(),
        likes: 0
      };

      const savedComment = await supabaseService.addComment(commentData);
      setComments(prev => [savedComment as MovieComment, ...prev]);
      setNewComment('');
    } catch (err) {
      console.error('Failed to post comment:', err);
      alert('Failed to post comment. Make sure you are logged in or try again later.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleLike = async (commentId: string, currentLikes: number) => {
    try {
      await supabaseService.toggleCommentLike(commentId, currentLikes);
      setComments(prev => prev.map(c => 
        c.id === commentId ? { ...c, likes: (c.likes || 0) + 1 } : c
      ));
    } catch (err) {
      console.error('Failed to like comment:', err);
    }
  };

  return (
    <div className="w-full mt-12 bg-black/40 backdrop-blur-xl border border-white/5 rounded-3xl overflow-hidden">
      <div className="p-6 md:p-8">
        <div className="flex items-center space-x-3 mb-8">
          <MessageCircle className="h-6 w-6 text-primary-purple" />
          <h2 className="text-xl font-black uppercase tracking-[0.2em] text-white">Discussion</h2>
          <span className="px-2 py-0.5 bg-white/10 rounded-full text-[10px] font-bold text-gray-400">
            {comments.length} Comments
          </span>
        </div>

        {/* Comment Input */}
        <form onSubmit={handleSubmit} className="relative mb-12">
          <div className="flex items-start space-x-4">
            <div className="h-10 w-10 rounded-full bg-primary-purple/20 border border-primary-purple/30 flex items-center justify-center flex-shrink-0">
              {userData?.profiles?.[0]?.avatar ? (
                <img src={userData.profiles[0].avatar} alt="Me" className="h-full w-full rounded-full object-cover" />
              ) : (
                <User className="h-5 w-5 text-primary-purple" />
              )}
            </div>
            <div className="flex-1 space-y-3">
              <textarea
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Share your thoughts about this movie..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-primary-purple/50 transition-all min-h-[100px] resize-none"
              />
              <div className="flex justify-end">
                <motion.button
                  type="submit"
                  disabled={!newComment.trim() || isSubmitting}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="flex items-center space-x-2 px-6 py-2 bg-primary-purple text-white rounded-full font-black text-xs uppercase tracking-widest disabled:opacity-50 disabled:cursor-not-allowed hover:shadow-[0_0_20px_rgba(153,69,255,0.4)] transition-all"
                >
                  {isSubmitting ? <Clock className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                  <span>Post Comment</span>
                </motion.button>
              </div>
            </div>
          </div>
        </form>

        {/* Comments List */}
        <div className="space-y-8">
          <AnimatePresence initial={false}>
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-4">
                <Clock className="h-8 w-8 text-white/20 animate-spin" />
                <p className="text-gray-500 text-xs font-bold uppercase tracking-widest">Loading conversations...</p>
              </div>
            ) : comments.length > 0 ? (
              comments.map((comment) => (
                <motion.div
                  key={comment.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="flex space-x-4 group"
                >
                  <div className="h-10 w-10 rounded-full bg-white/5 border border-white/10 flex items-center justify-center flex-shrink-0">
                    {comment.user_avatar ? (
                      <img src={comment.user_avatar} alt={comment.user_name} className="h-full w-full rounded-full object-cover" />
                    ) : (
                      <User className="h-5 w-5 text-white/30" />
                    )}
                  </div>
                  <div className="flex-1 space-y-1">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <span className="text-sm font-black text-white">{comment.user_name}</span>
                        <span className="text-[10px] font-bold text-gray-500">
                          {formatDistanceToNow(new Date(comment.created_at), { addSuffix: true })}
                        </span>
                      </div>
                      <button className="opacity-0 group-hover:opacity-100 transition-opacity p-1 hover:bg-white/5 rounded">
                        <MoreVertical className="h-4 w-4 text-gray-500" />
                      </button>
                    </div>
                    <p className="text-sm text-gray-300 leading-relaxed max-w-3xl">
                      {comment.text}
                    </p>
                    <div className="flex items-center space-x-4 pt-2">
                      <button 
                        onClick={() => handleLike(comment.id, comment.likes || 0)}
                        className="flex items-center space-x-1 text-[10px] font-black uppercase text-gray-500 hover:text-primary-purple transition-colors"
                      >
                        <ThumbsUp className="h-3 w-3" />
                        <span>{comment.likes || 0}</span>
                      </button>
                      <button className="text-[10px] font-black uppercase text-gray-500 hover:text-white transition-colors">
                        Reply
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))
            ) : (
              <div className="flex flex-col items-center justify-center py-20 text-center space-y-4">
                <div className="h-16 w-16 rounded-full bg-white/5 flex items-center justify-center">
                  <MessageCircle className="h-8 w-8 text-white/10" />
                </div>
                <div>
                  <h3 className="text-white font-black uppercase tracking-widest mb-1">No comments yet</h3>
                  <p className="text-gray-500 text-xs font-medium">Be the first to share what you think!</p>
                </div>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}
