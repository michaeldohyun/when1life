import React, { useState, useEffect, useMemo } from 'react';
import { 
  Plus, 
  Search, 
  Grid, 
  List, 
  Layout, 
  Folder, 
  Tag, 
  Trash2, 
  Star, 
  MoreHorizontal, 
  X, 
  ExternalLink,
  Settings,
  Menu,
  Check,
  Image as ImageIcon
} from 'lucide-react';

// --- 초기 데이터 (데모용) ---
const INITIAL_DATA = [
  {
    id: '1',
    url: 'https://react.dev',
    title: 'React - The Library for Web and Native User Interfaces',
    description: 'React를 사용하여 사용자 인터페이스를 만드세요. 컴포넌트 기반 아키텍처를 제공합니다.',
    coverImage: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?auto=format&fit=crop&q=80&w=600',
    collectionId: 'dev',
    tags: ['frontend', 'js'],
    favorite: true,
    createdAt: new Date().toISOString(),
  },
  {
    id: '2',
    url: 'https://tailwindcss.com',
    title: 'Tailwind CSS - Rapidly build modern websites',
    description: 'HTML을 떠나지 않고 현대적인 웹사이트를 빠르게 구축할 수 있는 유틸리티 퍼스트 CSS 프레임워크입니다.',
    coverImage: 'https://images.unsplash.com/photo-1587620962725-abab7fe55159?auto=format&fit=crop&q=80&w=600',
    collectionId: 'design',
    tags: ['css', 'ui'],
    favorite: false,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: '3',
    url: 'https://dribbble.com',
    title: 'Dribbble - Discover the World’s Top Designers',
    description: '디자이너를 위한 영감의 원천. 전 세계 최고의 디자인 포트폴리오를 탐색하세요.',
    coverImage: 'https://images.unsplash.com/photo-1558655146-d09347e0b7a9?auto=format&fit=crop&q=80&w=600',
    collectionId: 'inspiration',
    tags: ['design', 'art'],
    favorite: true,
    createdAt: new Date(Date.now() - 172800000).toISOString(),
  }
];

const INITIAL_COLLECTIONS = [
  { id: 'all', name: '모든 북마크', icon: Layout, type: 'system' },
  { id: 'favorites', name: '즐겨찾기', icon: Star, type: 'system' },
  { id: 'dev', name: '개발', icon: Folder, type: 'user' },
  { id: 'design', name: '디자인', icon: Folder, type: 'user' },
  { id: 'inspiration', name: '영감', icon: Folder, type: 'user' },
  { id: 'trash', name: '휴지통', icon: Trash2, type: 'system' },
];

export default function App() {
  // --- State ---
  const [bookmarks, setBookmarks] = useState(() => {
    const saved = localStorage.getItem('clipper_bookmarks');
    return saved ? JSON.parse(saved) : INITIAL_DATA;
  });
  
  const [collections, setCollections] = useState(() => {
    const saved = localStorage.getItem('clipper_collections');
    return saved ? JSON.parse(saved) : INITIAL_COLLECTIONS;
  });

  const [activeCollection, setActiveCollection] = useState('all');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
  const [searchQuery, setSearchQuery] = useState('');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [newBookmark, setNewBookmark] = useState({
    url: '', title: '', description: '', tags: '', collectionId: 'all', coverImage: ''
  });

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('clipper_bookmarks', JSON.stringify(bookmarks));
  }, [bookmarks]);

  useEffect(() => {
    localStorage.setItem('clipper_collections', JSON.stringify(collections));
  }, [collections]);

  // --- Handlers ---
  
  const handleAddBookmark = (e) => {
    e.preventDefault();
    const tagsArray = newBookmark.tags.split(',').map(t => t.trim()).filter(t => t);
    
    // 모의 이미지 생성 (랜덤)
    const mockImage = newBookmark.coverImage || `https://source.unsplash.com/random/800x600?sig=${Math.random()}`;
    
    const bookmark = {
      id: Date.now().toString(),
      url: newBookmark.url.startsWith('http') ? newBookmark.url : `https://${newBookmark.url}`,
      title: newBookmark.title || newBookmark.url,
      description: newBookmark.description,
      coverImage: newBookmark.coverImage || 'https://images.unsplash.com/photo-1614741118868-b4bc2294e6c4?auto=format&fit=crop&q=80&w=600', // 기본 이미지 fallback
      collectionId: newBookmark.collectionId === 'all' || newBookmark.collectionId === 'favorites' ? 'dev' : newBookmark.collectionId,
      tags: tagsArray,
      favorite: false,
      createdAt: new Date().toISOString(),
    };

    setBookmarks([bookmark, ...bookmarks]);
    setIsAddModalOpen(false);
    setNewBookmark({ url: '', title: '', description: '', tags: '', collectionId: 'all', coverImage: '' });
  };

  const deleteBookmark = (id) => {
    // 실제 삭제 대신 휴지통으로 이동 구현 가능하지만, 여기선 바로 삭제
    if (activeCollection === 'trash') {
        setBookmarks(bookmarks.filter(b => b.id !== id));
    } else {
        // 휴지통이 아니면 휴지통 컬렉션으로 이동 시키는 로직 등을 넣을 수 있음.
        // 여기서는 간단히 삭제로 처리
        if (confirm('이 북마크를 삭제하시겠습니까?')) {
             setBookmarks(bookmarks.filter(b => b.id !== id));
        }
    }
  };

  const toggleFavorite = (id) => {
    setBookmarks(bookmarks.map(b => 
      b.id === id ? { ...b, favorite: !b.favorite } : b
    ));
  };

  // --- Filtering Logic ---
  const filteredBookmarks = useMemo(() => {
    let filtered = bookmarks;

    // 1. 컬렉션 필터
    if (activeCollection === 'favorites') {
      filtered = filtered.filter(b => b.favorite);
    } else if (activeCollection === 'trash') {
        // 실제 구현에선 deletedAt 필드를 쓰겠지만 여기선 생략
        filtered = []; // 데모 단순화를 위해 비움 (또는 별도 상태 관리)
    } else if (activeCollection !== 'all') {
      filtered = filtered.filter(b => b.collectionId === activeCollection);
    }

    // 2. 검색어 필터
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      filtered = filtered.filter(b => 
        b.title.toLowerCase().includes(q) || 
        b.description.toLowerCase().includes(q) ||
        b.url.toLowerCase().includes(q) ||
        b.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return filtered;
  }, [bookmarks, activeCollection, searchQuery]);

  const activeCollectionName = collections.find(c => c.id === activeCollection)?.name;

  return (
    <div className="flex h-screen bg-gray-50 text-gray-900 font-sans overflow-hidden">
      
      {/* --- Sidebar --- */}
      <aside 
        className={`${isSidebarOpen ? 'w-64' : 'w-0'} transition-all duration-300 bg-white border-r border-gray-200 flex flex-col flex-shrink-0 overflow-hidden relative z-20`}
      >
        <div className="p-5 flex items-center gap-3 border-b border-gray-100">
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center text-white font-bold text-lg">
            C
          </div>
          <span className="font-bold text-xl tracking-tight text-gray-800">Clipper</span>
        </div>

        <nav className="flex-1 overflow-y-auto p-3 space-y-1">
          {collections.map((collection) => (
            <button
              key={collection.id}
              onClick={() => setActiveCollection(collection.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors
                ${activeCollection === collection.id 
                  ? 'bg-blue-50 text-blue-700' 
                  : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'}`}
            >
              <collection.icon size={18} className={activeCollection === collection.id ? 'text-blue-600' : 'text-gray-400'} />
              <span>{collection.name}</span>
              {collection.id === 'all' && (
                <span className="ml-auto text-xs text-gray-400 font-normal">{bookmarks.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-4 border-t border-gray-100">
           <div className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-100 cursor-pointer transition-colors">
             <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-purple-400 to-blue-500"></div>
             <div className="flex-1 min-w-0">
               <p className="text-sm font-medium text-gray-900 truncate">사용자</p>
               <p className="text-xs text-gray-500 truncate">Pro Plan</p>
             </div>
             <Settings size={16} className="text-gray-400" />
           </div>
        </div>
      </aside>

      {/* --- Main Content --- */}
      <main className="flex-1 flex flex-col min-w-0 h-full">
        
        {/* Top Header */}
        <header className="bg-white border-b border-gray-200 px-6 py-3 flex items-center justify-between flex-shrink-0">
          <div className="flex items-center gap-4 flex-1">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 text-gray-500 hover:bg-gray-100 rounded-lg lg:hidden"
            >
              <Menu size={20} />
            </button>
            
            <h1 className="text-lg font-bold text-gray-800 hidden md:block">
              {activeCollectionName}
            </h1>

            <div className="relative flex-1 max-w-md ml-4">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input 
                type="text"
                placeholder="검색..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>
          </div>

          <div className="flex items-center gap-2 ml-4">
            <div className="bg-gray-100 p-1 rounded-lg flex items-center gap-1">
              <button 
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'grid' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <Grid size={18} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`p-1.5 rounded-md transition-all ${viewMode === 'list' ? 'bg-white shadow-sm text-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <List size={18} />
              </button>
            </div>
            
            <button 
              onClick={() => setIsAddModalOpen(true)}
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors shadow-sm"
            >
              <Plus size={18} />
              <span className="hidden sm:inline">추가</span>
            </button>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 bg-gray-50">
          
          {filteredBookmarks.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-gray-400">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <Search size={32} className="text-gray-300" />
              </div>
              <p className="text-lg font-medium text-gray-500">북마크가 없습니다</p>
              <p className="text-sm">새로운 링크를 추가하거나 검색어를 변경해보세요.</p>
            </div>
          ) : (
            <>
              {viewMode === 'grid' ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                  {filteredBookmarks.map(bookmark => (
                    <BookmarkCard 
                      key={bookmark.id} 
                      bookmark={bookmark} 
                      onToggleFavorite={toggleFavorite}
                      onDelete={deleteBookmark}
                    />
                  ))}
                </div>
              ) : (
                <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
                   {filteredBookmarks.map(bookmark => (
                    <BookmarkListItem 
                      key={bookmark.id} 
                      bookmark={bookmark}
                      onToggleFavorite={toggleFavorite}
                      onDelete={deleteBookmark}
                    />
                  ))}
                </div>
              )}
            </>
          )}
        </div>
      </main>

      {/* --- Add Bookmark Modal --- */}
      {isAddModalOpen && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl w-full max-w-lg shadow-2xl transform transition-all scale-100">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">새 링크 추가</h2>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X size={24} />
                </button>
              </div>

              <form onSubmit={handleAddBookmark} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">URL</label>
                  <input
                    required
                    type="text"
                    placeholder="https://example.com"
                    value={newBookmark.url}
                    onChange={(e) => setNewBookmark({...newBookmark, url: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">제목</label>
                  <input
                    type="text"
                    placeholder="페이지 제목"
                    value={newBookmark.title}
                    onChange={(e) => setNewBookmark({...newBookmark, title: e.target.value})}
                    className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                  />
                </div>

                <div>
                   <label className="block text-sm font-medium text-gray-700 mb-1">설명</label>
                   <textarea 
                     rows={2}
                     placeholder="간단한 메모나 설명..."
                     value={newBookmark.description}
                     onChange={(e) => setNewBookmark({...newBookmark, description: e.target.value})}
                     className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
                   />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">컬렉션</label>
                    <select
                      value={newBookmark.collectionId}
                      onChange={(e) => setNewBookmark({...newBookmark, collectionId: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none bg-white"
                    >
                      {collections.filter(c => c.type !== 'system' || c.id === 'all').map(c => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">태그</label>
                    <input
                      type="text"
                      placeholder="쉼표로 구분"
                      value={newBookmark.tags}
                      onChange={(e) => setNewBookmark({...newBookmark, tags: e.target.value})}
                      className="w-full px-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex gap-3">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="flex-1 px-4 py-2 border border-gray-200 text-gray-600 rounded-lg hover:bg-gray-50 font-medium"
                  >
                    취소
                  </button>
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium shadow-md shadow-blue-200"
                  >
                    저장하기
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}

// --- Components ---

function BookmarkCard({ bookmark, onToggleFavorite, onDelete }) {
  const [imgError, setImgError] = useState(false);

  return (
    <div className="group bg-white rounded-xl shadow-sm hover:shadow-md border border-gray-200 overflow-hidden transition-all duration-300 flex flex-col h-[320px]">
      {/* Cover Image */}
      <div className="h-40 bg-gray-100 relative overflow-hidden flex-shrink-0">
        <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="block w-full h-full">
            {imgError ? (
                <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-50">
                    <ImageIcon size={32} className="mb-2 opacity-50" />
                    <span className="text-xs">이미지 없음</span>
                </div>
            ) : (
                <img 
                src={bookmark.coverImage} 
                alt={bookmark.title}
                onError={() => setImgError(true)}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
            )}
        </a>
        <button 
          onClick={(e) => { e.preventDefault(); onToggleFavorite(bookmark.id); }}
          className={`absolute top-2 right-2 p-2 rounded-full bg-white/90 backdrop-blur-sm shadow-sm opacity-0 group-hover:opacity-100 transition-opacity ${bookmark.favorite ? 'text-yellow-400 opacity-100' : 'text-gray-400 hover:text-yellow-400'}`}
        >
          <Star size={16} fill={bookmark.favorite ? "currentColor" : "none"} />
        </button>
      </div>

      {/* Content */}
      <div className="p-4 flex flex-col flex-1 relative">
        <div className="flex gap-2 mb-2">
            <img 
                src={`https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=32`} 
                alt="favicon" 
                className="w-4 h-4 mt-1 opacity-70"
                onError={(e) => e.target.style.display = 'none'}
            />
            <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="text-base font-semibold text-gray-800 line-clamp-2 hover:text-blue-600 leading-tight">
             {bookmark.title}
            </a>
        </div>
        
        <p className="text-sm text-gray-500 line-clamp-2 mb-3 leading-relaxed">
          {bookmark.description}
        </p>

        <div className="mt-auto flex items-center justify-between pt-2">
          <div className="flex gap-1 overflow-hidden">
            {bookmark.tags.slice(0, 3).map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 bg-gray-100 text-gray-600 text-xs rounded-full whitespace-nowrap">
                #{tag}
              </span>
            ))}
          </div>
          
          <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
             <button 
                onClick={() => onDelete(bookmark.id)}
                className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded"
             >
                <Trash2 size={14} />
             </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BookmarkListItem({ bookmark, onToggleFavorite, onDelete }) {
  const [imgError, setImgError] = useState(false);
  const domain = new URL(bookmark.url).hostname.replace('www.', '');

  return (
    <div className="group flex items-center gap-4 p-3 hover:bg-gray-50 transition-colors">
      {/* Drag Handle & Selection (Visual only) */}
      <div className="w-1 h-8 rounded-full bg-transparent group-hover:bg-blue-300 transition-colors"></div>
      
      {/* Thumbnail */}
      <div className="w-16 h-12 rounded-lg bg-gray-100 overflow-hidden flex-shrink-0 border border-gray-200">
         {imgError ? (
            <div className="w-full h-full flex items-center justify-center text-gray-300">
                <ImageIcon size={16} />
            </div>
         ) : (
            <img 
            src={bookmark.coverImage} 
            alt="" 
            onError={() => setImgError(true)}
            className="w-full h-full object-cover"
            />
         )}
      </div>

      {/* Text Info */}
      <div className="flex-1 min-w-0 grid grid-cols-12 gap-4 items-center">
        <div className="col-span-12 md:col-span-6">
            <a href={bookmark.url} target="_blank" rel="noopener noreferrer" className="block text-sm font-medium text-gray-900 truncate hover:text-blue-600 mb-0.5">
                {bookmark.title}
            </a>
            <div className="flex items-center gap-2 text-xs text-gray-500">
                 <img 
                    src={`https://www.google.com/s2/favicons?domain=${bookmark.url}&sz=16`} 
                    alt="" 
                    className="w-3 h-3 opacity-60" 
                />
                <span>{domain}</span>
            </div>
        </div>
        
        <div className="hidden md:flex col-span-4 gap-1">
             {bookmark.tags.map((tag, idx) => (
              <span key={idx} className="px-2 py-0.5 border border-gray-200 text-gray-500 text-xs rounded-md">
                {tag}
              </span>
            ))}
        </div>

        <div className="hidden md:block col-span-2 text-right text-xs text-gray-400">
            {new Date(bookmark.createdAt).toLocaleDateString()}
        </div>
      </div>

      {/* Actions */}
      <div className="flex items-center gap-1">
        <button 
            onClick={() => onToggleFavorite(bookmark.id)}
            className={`p-2 rounded-full hover:bg-gray-200 transition-colors ${bookmark.favorite ? 'text-yellow-400' : 'text-gray-300'}`}
        >
            <Star size={16} fill={bookmark.favorite ? "currentColor" : "none"} />
        </button>
        <button 
            onClick={() => onDelete(bookmark.id)}
            className="p-2 text-gray-300 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors opacity-0 group-hover:opacity-100"
        >
            <Trash2 size={16} />
        </button>
      </div>
    </div>
  );
}