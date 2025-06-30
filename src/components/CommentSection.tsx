import React, { useEffect, useState, forwardRef, useImperativeHandle } from 'react';
import { FaTimes } from 'react-icons/fa';
import { createClient } from '@/lib/supabase/client';

interface Comment {
  id: string;
  user_id: string;
  content: string;
  created_at: string;
  updated_at: string;
  profiles?: {
    avatar_url?: string;
    first_name?: string;
    last_name?: string;
    email?: string;
  };
}

export interface CommentSectionHandle {
  reload: () => void;
}

interface CommentSectionProps {
  mediaType: string;
  mediaId: string;
  showListOnly?: boolean;
  onCommentPosted?: () => void;
  onClose?: () => void;
  fullWidth?: boolean;
  variant?: 'modal' | 'section';
}

const CommentSection = forwardRef<CommentSectionHandle, CommentSectionProps>(
  ({ mediaType, mediaId, showListOnly = false, onCommentPosted, onClose, fullWidth = false, variant = 'section' }, ref) => {
    const [comments, setComments] = useState<Comment[]>([]);
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [submitting, setSubmitting] = useState(false);
    const [userId, setUserId] = useState<string | null>(null);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [editContent, setEditContent] = useState('');

    // ユーザーID取得（SupabaseクライアントSDKで）
    useEffect(() => {
      const fetchUser = async () => {
        const supabase = createClient();
        const { data: { user } } = await supabase.auth.getUser();
        setUserId(user?.id || null);
      };
      fetchUser();
    }, []);

    // コメント一覧取得
    const fetchComments = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch(`/api/comments?media_type=${mediaType}&media_id=${mediaId}`);
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setComments(data.comments || []);
      } catch (e: any) {
        setError(e.message);
      } finally {
        setLoading(false);
      }
    };

    useEffect(() => {
      fetchComments();
      // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [mediaType, mediaId]);

    // reloadメソッドを外部公開
    useImperativeHandle(ref, () => ({ reload: fetchComments }), [mediaType, mediaId]);

    // コメント投稿
    const handleSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      if (!content.trim()) return;
      setSubmitting(true);
      setError(null);
      try {
        const res = await fetch('/api/comments', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ media_type: mediaType, media_id: mediaId, content }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        setContent('');
        if (onCommentPosted) onCommentPosted();
      } catch (e: any) {
        setError(e.message);
      } finally {
        setSubmitting(false);
      }
    };

    // コメント削除
    const handleDelete = async (commentId: string) => {
      if (!window.confirm('本当に削除しますか？')) return;
      setError(null);
      try {
        const res = await fetch('/api/comments', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ comment_id: commentId }),
        });
        const data = await res.json();
        if (data.error) throw new Error(data.error);
        fetchComments();
      } catch (e: any) {
        setError(e.message);
      }
    };

    // 投稿フォーム（showListOnly=falseのときのみ）
    const renderForm = () => (
      <form onSubmit={handleSubmit} className="mb-4 flex flex-col">
        <textarea
          className="w-full min-w-0 rounded-lg p-2 text-white bg-gray-700 min-h-[120px]"
          rows={5}
          placeholder="コメントを入力..."
          value={content}
          onChange={e => setContent(e.target.value)}
          disabled={submitting}
        />
        <button
          type="submit"
          className="bg-white hover:bg-gray-100 text-black px-6 py-3 rounded-full font-semibold text-sm disabled:opacity-50 mt-2 self-end"
          disabled={submitting || !content.trim()}
        >
          投稿
        </button>
      </form>
    );

    // ラッパーdivのclassName分岐
    const wrapperClass = variant === 'modal'
      ? 'w-[520px] max-w-[90vw] mx-auto relative flex flex-col justify-center'
      : `relative ${fullWidth ? 'w-full' : 'max-w-2xl'} mt-8`;
    // 見出しclassName分岐
    const headingClass = showListOnly
      ? 'text-2xl font-bold mb-4 text-white'
      : 'text-2xl font-bold mb-4 text-white text-center';

    return (
      <div className={wrapperClass}>
        {/* 閉じるボタン（onCloseが渡された場合のみ） */}
        {onClose && variant === 'modal' && (
          <button
            onClick={onClose}
            className="absolute -top-8 right-0 text-gray-300 hover:text-white text-2xl font-bold z-50"
            aria-label="閉じる"
          >
            <FaTimes />
          </button>
        )}
        {/* モーダルでもタイトルは表示しない */}
        {error && <div className="text-red-500 mb-2">{error}</div>}
        {!showListOnly && renderForm()}
        {showListOnly && (loading ? (
          <div className="text-gray-400">読み込み中...</div>
        ) : comments.length === 0 ? (
          <div className="text-gray-400">まだコメントはありません。</div>
        ) : (
          <ul className="space-y-3">
            {comments.map(comment => {
              const avatarUrl = comment.profiles?.avatar_url || '/default-avatar.svg';
              let displayName = '';
              if (comment.profiles) {
                if (comment.profiles.first_name || comment.profiles.last_name) {
                  displayName = `${comment.profiles.first_name || ''} ${comment.profiles.last_name || ''}`.trim();
                } else if (comment.profiles.email) {
                  displayName = comment.profiles.email;
                } else {
                  displayName = 'Unknown';
                }
              } else {
                displayName = 'Unknown';
              }
              const isOwn = userId === comment.user_id;
              const isEditing = editingId === comment.id;
              return (
                <li key={comment.id} className="rounded-lg p-3 flex items-start gap-3">
                  <img src={avatarUrl} alt="avatar" className="w-10 h-10 rounded-full object-cover flex-shrink-0" />
                  <div className="flex-1">
                    <div className="font-semibold text-white text-sm mb-0.5">{displayName}</div>
                    {isEditing ? (
                      <form
                        onSubmit={async (e) => {
                          e.preventDefault();
                          if (!editContent.trim()) return;
                          const res = await fetch('/api/comments', {
                            method: 'PATCH',
                            headers: { 'Content-Type': 'application/json' },
                            body: JSON.stringify({ comment_id: comment.id, content: editContent }),
                          });
                          const data = await res.json();
                          if (!data.error) {
                            setEditingId(null);
                            setEditContent('');
                            fetchComments();
                          } else {
                            alert('編集に失敗しました: ' + data.error);
                          }
                        }}
                        className="flex flex-col gap-2"
                      >
                        <textarea
                          className="w-full min-w-0 rounded-lg p-2 text-white bg-gray-700 min-h-[80px]"
                          value={editContent}
                          onChange={e => setEditContent(e.target.value)}
                          autoFocus
                        />
                        <div className="flex gap-2 mt-1">
                          <button type="submit" className="bg-primary text-white px-4 py-1 rounded-lg font-semibold text-xs">保存</button>
                          <button type="button" className="bg-gray-500 text-white px-4 py-1 rounded-lg font-semibold text-xs" onClick={() => setEditingId(null)}>キャンセル</button>
                        </div>
                      </form>
                    ) : (
                      <>
                        <div className="text-white text-sm mb-1">{comment.content}</div>
                        <div className="text-xs text-gray-400">{new Date(comment.created_at).toLocaleString()}</div>
                      </>
                    )}
                  </div>
                  {isOwn && !isEditing && (
                    <div className="flex flex-col gap-2 ml-4">
                      <button
                        className="text-xs text-blue-400 hover:text-blue-600"
                        onClick={() => {
                          setEditingId(comment.id);
                          setEditContent(comment.content);
                        }}
                      >
                        編集
                      </button>
                      <button
                        className="text-xs text-red-400 hover:text-red-600"
                        onClick={() => handleDelete(comment.id)}
                      >
                        削除
                      </button>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        ))}
      </div>
    );
  }
);

export default CommentSection; 