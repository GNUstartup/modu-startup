import { useState, useEffect } from 'react';
import { Bell, ChevronDown, ChevronUp, RefreshCw } from 'lucide-react';
import { apiGetNotices } from '../../api';
import type { Notice } from '../../api';

const STORAGE_KEY = 'readNoticeIds';

export function getReadIds(): Set<number> {
    try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (!raw) return new Set();
        return new Set(JSON.parse(raw) as number[]);
    } catch { return new Set(); }
}

function addReadId(id: number) {
    const ids = getReadIds();
    ids.add(id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]));
    window.dispatchEvent(new CustomEvent('noticeRead'));
}

export function checkHasUnread(notices: Notice[]): boolean {
    const read = getReadIds();
    return notices.some(n => n.id != null && !read.has(n.id));
}

export default function NoticeBoard() {
    const [notices, setNotices] = useState<Notice[]>([]);
    const [expanded, setExpanded] = useState<number | null>(null);
    const [loading, setLoading] = useState(true);
    const [readIds, setReadIds] = useState<Set<number>>(getReadIds());

    useEffect(() => {
        apiGetNotices()
            .then(setNotices)
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    const formatDate = (d?: string) => {
        if (!d) return '';
        try {
            const dt = new Date(d);
            if (isNaN(dt.getTime())) return d;
            return `${dt.getFullYear()}.${String(dt.getMonth() + 1).padStart(2, '0')}.${String(dt.getDate()).padStart(2, '0')}`;
        } catch { return ''; }
    };

    const handleToggle = (id: number) => {
        if (expanded !== id) {
            addReadId(id);
            setReadIds(getReadIds());
        }
        setExpanded(prev => prev === id ? null : id);
    };

    return (
        <div className="min-h-screen bg-neutral-50 py-10 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-3xl mx-auto space-y-6">
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-neutral-200">
                    <h1 className="text-2xl font-bold text-neutral-900 flex items-center">
                        <Bell className="w-6 h-6 mr-2 text-amber-500" /> 공지사항
                    </h1>
                </div>

                {loading ? (
                    <div className="flex justify-center py-16">
                        <RefreshCw className="w-8 h-8 text-indigo-400 animate-spin" />
                    </div>
                ) : notices.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-neutral-200 p-12 text-center">
                        <Bell className="mx-auto w-10 h-10 text-neutral-300 mb-3" />
                        <p className="text-neutral-400 text-sm">등록된 공지사항이 없습니다.</p>
                    </div>
                ) : (
                    <div className="bg-white rounded-2xl border border-neutral-200 divide-y divide-neutral-100 overflow-hidden shadow-sm">
                        {notices.map(n => {
                            const isRead = n.id != null && readIds.has(n.id);
                            const isOpen = expanded === n.id;
                            return (
                                <div key={n.id}>
                                    <button
                                        onClick={() => n.id != null && handleToggle(n.id)}
                                        className="w-full px-6 py-4 flex items-center justify-between text-left hover:bg-neutral-50 transition-colors"
                                    >
                                        <div className="flex items-center gap-3 min-w-0">
                                            {!isRead && (
                                                <span className="flex-shrink-0 w-2 h-2 rounded-full bg-red-500" />
                                            )}
                                            <span className={`font-semibold text-sm truncate ${isRead ? 'text-neutral-600' : 'text-neutral-900'}`}>
                                                {n.제목}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0 ml-4">
                                            <span className="text-xs text-neutral-400">{formatDate(n.작성일시)}</span>
                                            {isOpen
                                                ? <ChevronUp className="w-4 h-4 text-neutral-400" />
                                                : <ChevronDown className="w-4 h-4 text-neutral-400" />
                                            }
                                        </div>
                                    </button>
                                    {isOpen && (
                                        <div className="px-6 pb-5 bg-amber-50/30 border-t border-amber-100">
                                            <p className="pt-4 text-sm text-neutral-700 leading-relaxed whitespace-pre-wrap">{n.내용}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
