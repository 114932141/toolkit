import React, { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import { 
  getFirestore, collection, getDocs, doc, updateDoc, 
  addDoc, deleteDoc, onSnapshot, query, orderBy, setDoc 
} from 'firebase/firestore';
import { 
  getAuth, signInAnonymously, onAuthStateChanged, 
  signInWithCustomToken 
} from 'firebase/auth';
import { 
  Plane, Hotel, MapPin, BookOpen, Users, 
  HelpCircle, Settings, LogIn, LogOut, 
  ChevronDown, ChevronUp, Edit2, Save, X, 
  Calendar, DollarSign, Phone, FileText,
  Briefcase, Camera, Plus, Trash2, Tag,
  ClipboardList, Clock, GraduationCap, Target
} from 'lucide-react';

// --- Firebase Initialization ---
const firebaseConfig = JSON.parse(__firebase_config);
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== 'undefined' ? __app_id : 'default-app-id';

// --- Global Styles & Constants ---
// 強制字體大小規範：最小字體提升至 13px
const fontStyles = {
  base: 'text-[15px] leading-relaxed',
  sm: 'text-[13px] leading-snug',
  h1: 'text-[28px] md:text-[36px] font-bold',
  h2: 'text-[24px] font-bold',
  h3: 'text-[20px] font-bold',
  h4: 'text-[16px] font-bold'
};

const THEME = {
  primary: 'bg-teal-500',
  primaryHover: 'hover:bg-teal-600',
  secondary: 'bg-orange-400',
  accent: 'bg-yellow-300',
  bg: 'bg-amber-50', // 暖色背景
  card: 'bg-white rounded-2xl shadow-lg border-b-4 border-orange-200',
  textMain: 'text-slate-700',
  textLight: 'text-slate-500'
};

// --- Components ---

// 1. Navigation (Lively Style)
const Navigation = ({ activeTab, setActiveTab, isAdmin, handleLogout }) => {
  const navItems = [
    { id: 'home', label: '旅程首頁', icon: <MapPin size={18} /> },
    { id: 'itinerary', label: '精彩行程', icon: <Camera size={18} /> },
    { id: 'info', label: '費用須知', icon: <DollarSign size={18} /> },
    { id: 'academic', label: '學術任務', icon: <BookOpen size={18} /> },
    { id: 'qa', label: '問答集', icon: <HelpCircle size={18} /> },
    { id: 'team', label: '找團隊', icon: <Users size={18} /> },
  ];

  return (
    <nav className="bg-white/90 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-orange-100">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center text-white font-bold">
              JP
            </div>
            <span className="font-bold text-teal-700 tracking-wide text-[16px] hidden md:block">
              2026 政大EMBA 東京行
            </span>
          </div>
          <div className="flex space-x-1 overflow-x-auto no-scrollbar py-2">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                className={`px-3 py-2 rounded-full text-[14px] font-medium flex items-center gap-1 whitespace-nowrap transition-all duration-300
                  ${activeTab === item.id 
                    ? 'bg-teal-500 text-white shadow-md transform scale-105' 
                    : 'text-slate-500 hover:bg-orange-50 hover:text-orange-500'}`}
              >
                {item.icon}
                <span className="hidden sm:inline">{item.label}</span>
              </button>
            ))}
            {isAdmin ? (
              <button onClick={handleLogout} className="px-3 py-2 rounded-full text-[14px] text-red-400 hover:bg-red-50">
                <LogOut size={18} />
              </button>
            ) : (
              <button onClick={() => setActiveTab('admin')} className={`px-3 py-2 rounded-full ${activeTab === 'admin' ? 'text-teal-600' : 'text-slate-400'}`}>
                <Settings size={18} />
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

// 2. Hero Section
const Hero = () => (
  <div className="relative h-[400px] md:h-[500px] rounded-b-[40px] overflow-hidden shadow-xl mx-2 md:mx-4 mt-2">
    <div className="absolute inset-0">
      <img 
        src="https://images.unsplash.com/photo-1503899036084-c55cdd92da26?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80" 
        alt="Tokyo Vibes" 
        className="w-full h-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-teal-900/80 via-transparent to-transparent"></div>
    </div>
    <div className="relative max-w-7xl mx-auto px-6 h-full flex flex-col justify-end pb-16 text-center md:text-left">
      <span className="inline-block bg-yellow-400 text-teal-900 px-4 py-1 rounded-full font-bold text-[14px] mb-4 w-fit mx-auto md:mx-0 shadow-lg animate-bounce">
        Lion, Enriching Life!
      </span>
      <h1 className="text-4xl md:text-6xl font-extrabold text-white mb-2 drop-shadow-md">
        重塑日本競爭力
      </h1>
      <p className="text-xl md:text-2xl text-orange-100 font-medium mb-6">
        資本、人才與產業的數位轉型及永續革新
      </p>
      <div className="flex flex-col md:flex-row gap-4 justify-center md:justify-start">
        <div className="bg-white/20 backdrop-blur-sm px-6 py-2 rounded-full text-white text-[14px] flex items-center border border-white/30">
          <Calendar className="mr-2 w-4 h-4" /> 2026/05/13 - 05/17
        </div>
      </div>
    </div>
  </div>
);

// 3. Info Cards
const InfoSection = () => {
  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      {/* 航班資訊 */}
      <div className={`${THEME.card} mb-12 overflow-hidden`}>
        <div className="bg-orange-400 px-6 py-3 flex items-center justify-between">
          <h3 className={`${fontStyles.h3} text-white flex items-center`}>
            <Plane className="mr-2" /> 航班資訊 (CI 華航)
          </h3>
          <span className="bg-white/20 text-white px-2 py-1 rounded text-[13px]">團去團回</span>
        </div>
        <div className="p-6 md:p-8">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-8 relative">
              {/* 去程 */}
              <div className="flex flex-col items-center p-4 bg-orange-50 rounded-xl border border-orange-100">
                 <div className="w-full flex justify-between items-center mb-4 border-b border-orange-200 pb-2">
                    <span className="text-[14px] font-bold text-orange-600">去程 5/13 (三)</span>
                    <span className="text-[13px] bg-orange-200 text-orange-800 px-2 py-0.5 rounded">CI100</span>
                 </div>
                 <div className="flex items-center justify-between w-full">
                    <div className="text-center">
                       <div className="text-2xl font-bold text-slate-700">08:55</div>
                       <div className="text-[13px] text-slate-500">桃園 T2</div>
                    </div>
                    <div className="flex-1 px-2 flex flex-col items-center">
                       <Plane className="text-orange-300 w-5 h-5 transform rotate-90 mb-1" />
                       <div className="w-full h-0.5 bg-orange-200"></div>
                       <span className="text-[13px] text-orange-400 mt-1">3h 20m</span>
                    </div>
                    <div className="text-center">
                       <div className="text-2xl font-bold text-slate-700">13:15</div>
                       <div className="text-[13px] text-slate-500">成田 T2</div>
                    </div>
                 </div>
              </div>

              {/* 回程 */}
              <div className="flex flex-col items-center p-4 bg-teal-50 rounded-xl border border-teal-100">
                 <div className="w-full flex justify-between items-center mb-4 border-b border-teal-200 pb-2">
                    <span className="text-[14px] font-bold text-teal-600">回程 5/17 (日)</span>
                    <span className="text-[13px] bg-teal-200 text-teal-800 px-2 py-0.5 rounded">CI105</span>
                 </div>
                 <div className="flex items-center justify-between w-full">
                    <div className="text-center">
                       <div className="text-2xl font-bold text-slate-700">17:55</div>
                       <div className="text-[13px] text-slate-500">成田 T2</div>
                    </div>
                    <div className="flex-1 px-2 flex flex-col items-center">
                       <Plane className="text-teal-300 w-5 h-5 transform rotate-90 mb-1" />
                       <div className="w-full h-0.5 bg-teal-200"></div>
                       <span className="text-[13px] text-teal-400 mt-1">3h 40m</span>
                    </div>
                    <div className="text-center">
                       <div className="text-2xl font-bold text-slate-700">20:35</div>
                       <div className="text-[13px] text-slate-500">桃園 T2</div>
                    </div>
                 </div>
              </div>
           </div>
        </div>
      </div>

      {/* 住宿資訊 */}
      <h2 className={`${fontStyles.h2} text-teal-800 mb-6 flex items-center`}>
        <Hotel className="mr-3 text-orange-500" /> 精選住宿
      </h2>
      <div className="grid md:grid-cols-2 gap-6">
        {/* Hotel 1 */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col hover:shadow-xl transition-shadow duration-300">
          <div className="h-48 relative group">
            <img src="https://images.unsplash.com/photo-1551882547-ff40c63fe5fa?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Tokyo Dome Hotel" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute top-4 left-4 bg-orange-500 text-white text-[13px] font-bold px-3 py-1 rounded-full">
              第 1 晚
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <h4 className={`${fontStyles.h3} text-slate-800 mb-1`}>東京巨蛋飯店</h4>
            <p className="text-[13px] text-slate-400 mb-4">Tokyo Dome Hotel</p>
            <div className="space-y-2 mb-4 flex-1">
              <div className="flex items-start text-[13px] text-slate-600">
                <MapPin className="w-4 h-4 mr-2 text-teal-500 flex-shrink-0" />
                <span>東京都文京区後楽1-3-61</span>
              </div>
              <div className="flex items-center text-[13px] text-slate-600">
                <Phone className="w-4 h-4 mr-2 text-teal-500 flex-shrink-0" />
                <span>+81 3-5805-2111</span>
              </div>
            </div>
            <div className="pt-4 border-t border-dashed border-gray-200">
              <span className="text-[13px] bg-gray-100 text-gray-600 px-2 py-1 rounded">絕佳夜景</span>
              <span className="text-[13px] bg-gray-100 text-gray-600 px-2 py-1 rounded ml-2">交通便利</span>
            </div>
          </div>
        </div>

        {/* Hotel 2 */}
        <div className="bg-white rounded-2xl shadow-md overflow-hidden border border-gray-100 flex flex-col hover:shadow-xl transition-shadow duration-300">
          <div className="h-48 relative group">
            <img src="https://images.unsplash.com/photo-1561501900-3701fa6a0864?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&q=80" alt="Tokyo Marriott" className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" />
            <div className="absolute top-4 left-4 bg-teal-500 text-white text-[13px] font-bold px-3 py-1 rounded-full">
              第 2-4 晚 (連泊)
            </div>
            <div className="absolute top-4 right-4 bg-yellow-400 text-teal-900 text-[13px] font-bold px-3 py-1 rounded-full shadow-lg">
              ★ 特別升等
            </div>
          </div>
          <div className="p-6 flex-1 flex flex-col">
            <h4 className={`${fontStyles.h3} text-slate-800 mb-1`}>東京萬豪酒店</h4>
            <p className="text-[13px] text-slate-400 mb-4">Tokyo Marriott Hotel</p>
            <div className="space-y-2 mb-4 flex-1">
              <div className="flex items-start text-[13px] text-slate-600">
                <MapPin className="w-4 h-4 mr-2 text-teal-500 flex-shrink-0" />
                <span>東京都品川区北品川4-7-36</span>
              </div>
              <div className="flex items-center text-[13px] text-slate-600">
                <Phone className="w-4 h-4 mr-2 text-teal-500 flex-shrink-0" />
                <span>+81 3-5488-3911</span>
              </div>
            </div>
            <div className="pt-4 border-t border-dashed border-gray-200">
              <span className="text-[13px] bg-gray-100 text-gray-600 px-2 py-1 rounded">御殿山花園</span>
              <span className="text-[13px] bg-gray-100 text-gray-600 px-2 py-1 rounded ml-2">寬敞客房</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// 4. Itinerary Section
const ItinerarySection = ({ isAdmin, user }) => {
  const [itinerary, setItinerary] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [editData, setEditData] = useState({});

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'itinerary_v2'), orderBy('order'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setItinerary(data);
      if (data.length === 0) seedItineraryV2();
    });
    return () => unsubscribe();
  }, [user]);

  const seedItineraryV2 = async () => {
    const initialData = [
      { 
        order: 1, date: '5/13 (三)', title: '啟程與文化體驗', 
        events: [
          { type: 'transport', content: '桃園機場 → 成田機場' },
          { type: 'attraction', content: '成田山新勝寺 (表參道散策)' },
          { type: 'meal', content: '晚餐：和牛霜降肉壽喜燒' }
        ],
        hotel: '東京巨蛋飯店'
      },
      { 
        order: 2, date: '5/14 (四)', title: '學術與金融巡禮', 
        events: [
          { type: 'visit', content: '09:30 早稻田大學見學' },
          { type: 'meal', content: '午餐：叙叙苑燒肉套餐' },
          { type: 'visit', content: '14:00 東京證交所' },
          { type: 'attraction', content: '日本橋日枝神社' },
          { type: 'meal', content: '晚餐：瓢斗銘柄豚涮涮鍋' }
        ],
        hotel: '東京萬豪酒店'
      },
      { 
        order: 3, date: '5/15 (五)', title: '公共治理與永續', 
        events: [
          { type: 'visit', content: '10:00 東京都下水道局見學 (芝浦再生中心)' },
          { type: 'visit', content: '15:00 國會參議院見學' },
          { type: 'attraction', content: '麻布台之丘' },
           { type: 'meal', content: '晚餐：居酒屋料理' }
        ],
        hotel: '東京萬豪酒店'
      },
       { 
        order: 4, date: '5/16 (六)', title: '企業創新與古都', 
        events: [
          { type: 'visit', content: '橫濱資生堂全球創新中心 S/PARK' },
          { type: 'attraction', content: '高德院 (鎌倉青銅大佛)' },
          { type: 'attraction', content: '鶴岡八幡宮 & 小町通' },
          { type: 'meal', content: '晚餐：螃蟹道樂晚宴包廂 (酒水暢飲)' }
        ],
        hotel: '東京萬豪酒店'
      },
      { 
        order: 5, date: '5/17 (日)', title: '江戶風情與返程', 
        events: [
          { type: 'attraction', content: '小江戶川越 (藏造老街、時光鐘)' },
          { type: 'attraction', content: '川越冰川神社 (體驗釣鯛魚籤)' },
          { type: 'meal', content: '午餐：川越鰻魚飯御膳' },
          { type: 'transport', content: '成田機場 → 桃園機場' }
        ],
        hotel: '溫暖的家'
      },
    ];
    
    for (const item of initialData) {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'itinerary_v2'), item);
    }
  };

  const handleUpdate = async (id) => {
    await updateDoc(doc(db, 'artifacts', appId, 'public', 'data', 'itinerary_v2', id), editData);
    setEditingId(null);
  };

  const handleEventChange = (index, field, value) => {
    const newEvents = [...editData.events];
    newEvents[index] = { ...newEvents[index], [field]: value };
    setEditData({ ...editData, events: newEvents });
  };

  const addEvent = () => {
    setEditData({ ...editData, events: [...editData.events, { type: 'attraction', content: '' }] });
  };

  const removeEvent = (index) => {
    const newEvents = editData.events.filter((_, i) => i !== index);
    setEditData({ ...editData, events: newEvents });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className={`${fontStyles.h2} text-teal-800 mb-8 flex items-center`}>
        <Camera className="mr-3 text-orange-500" /> 精彩行程安排
      </h2>
      <div className="space-y-8">
        {itinerary.map((day) => (
          <div key={day.id} className="bg-white rounded-3xl shadow-sm border border-slate-100 overflow-hidden relative">
            <div className="absolute top-0 left-0 w-2 h-full bg-gradient-to-b from-teal-400 to-teal-600"></div>
            
            {editingId === day.id ? (
              <div className="p-6 bg-teal-50 space-y-4">
                <div className="flex gap-4">
                   <input className="border p-2 rounded w-1/3 text-[14px]" value={editData.date} onChange={e => setEditData({...editData, date: e.target.value})} />
                   <input className="border p-2 rounded w-2/3 text-[14px]" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <p className="text-[14px] font-bold text-teal-800">行程細項設定：</p>
                  {editData.events.map((ev, idx) => (
                    <div key={idx} className="flex gap-2 items-center">
                      <select 
                        className="border p-2 rounded text-[14px]"
                        value={ev.type}
                        onChange={e => handleEventChange(idx, 'type', e.target.value)}
                      >
                        <option value="visit">參訪 (藍)</option>
                        <option value="attraction">景點 (橘)</option>
                        <option value="meal">餐食 (綠)</option>
                        <option value="transport">交通 (灰)</option>
                      </select>
                      <input 
                        className="border p-2 rounded flex-1 text-[14px]"
                        value={ev.content}
                        onChange={e => handleEventChange(idx, 'content', e.target.value)}
                      />
                      <button onClick={() => removeEvent(idx)} className="text-red-500"><Trash2 size={16}/></button>
                    </div>
                  ))}
                  <button onClick={addEvent} className="text-teal-600 text-[14px] flex items-center mt-2"><Plus size={14} className="mr-1"/> 新增項目</button>
                </div>
                 <input className="border p-2 rounded w-full text-[14px]" placeholder="住宿" value={editData.hotel} onChange={e => setEditData({...editData, hotel: e.target.value})} />
                
                <div className="flex gap-2 mt-4">
                  <button onClick={() => handleUpdate(day.id)} className="bg-teal-600 text-white px-4 py-2 rounded-lg text-[14px]">儲存</button>
                  <button onClick={() => setEditingId(null)} className="bg-gray-300 text-white px-4 py-2 rounded-lg text-[14px]">取消</button>
                </div>
              </div>
            ) : (
              <div className="p-6 pl-8">
                <div className="flex justify-between items-start mb-6">
                  <div className="flex flex-col md:flex-row md:items-baseline gap-2">
                    <span className="text-teal-600 font-extrabold text-[14px] uppercase tracking-wider bg-teal-50 px-3 py-1 rounded-full w-fit">
                      DAY {day.order}
                    </span>
                    <h3 className={`${fontStyles.h2} text-slate-800`}>
                      <span className="mr-3 text-slate-500 text-[18px] font-medium">{day.date}</span>
                      {day.title}
                    </h3>
                  </div>
                  {isAdmin && (
                    <button onClick={() => { setEditingId(day.id); setEditData(day); }} className="text-slate-300 hover:text-teal-500">
                      <Edit2 size={18} />
                    </button>
                  )}
                </div>

                <div className="space-y-3 mb-6 relative">
                   {/* Timeline Line */}
                   <div className="absolute left-[-18px] top-2 bottom-2 w-0.5 bg-slate-100"></div>

                  {day.events?.map((event, idx) => {
                    let badgeColor = "bg-gray-100 text-gray-500";
                    let badgeText = "交通";
                    let icon = null;

                    if (event.type === 'visit') {
                      badgeColor = "bg-blue-100 text-blue-700 border border-blue-200";
                      badgeText = "參訪";
                      icon = <Briefcase size={12} className="mr-1" />;
                    } else if (event.type === 'attraction') {
                      badgeColor = "bg-orange-100 text-orange-700 border border-orange-200";
                      badgeText = "景點";
                      icon = <Camera size={12} className="mr-1" />;
                    } else if (event.type === 'meal') {
                      badgeColor = "bg-emerald-50 text-emerald-600";
                      badgeText = "餐食";
                    }

                    return (
                      <div key={idx} className="flex items-start relative">
                        <div className={`absolute left-[-22px] top-2 w-2.5 h-2.5 rounded-full border-2 border-white ${event.type === 'visit' ? 'bg-blue-400' : event.type === 'attraction' ? 'bg-orange-400' : 'bg-slate-300'}`}></div>
                        <div className={`flex-shrink-0 w-20 flex justify-end mr-3 mt-0.5`}>
                          {(event.type === 'visit' || event.type === 'attraction') && (
                            <span className={`text-[13px] font-bold px-2 py-0.5 rounded-full flex items-center ${badgeColor}`}>
                              {icon}{badgeText}
                            </span>
                          )}
                        </div>
                        <p className={`${fontStyles.base} text-slate-700 py-0.5 ${event.type === 'visit' ? 'font-bold' : ''}`}>
                          {event.content}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div className="flex items-center text-[13px] text-slate-500 bg-slate-50 p-3 rounded-xl w-fit">
                   <Hotel size={14} className="mr-2 text-teal-500"/> 
                   <span className="font-bold mr-2 text-slate-700">住宿:</span> 
                   {day.hotel}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
      <p className="text-center text-slate-400 text-[13px] mt-8 italic bg-white/50 p-2 rounded-lg">
        ★ 行程可能因當地交通或預約狀況進行微調，請以當日領隊宣佈為準。
      </p>
    </div>
  );
};

// 5. Team Section (Updated with Inline Delete State)
const TeamSection = ({ isAdmin, user }) => {
  const [contacts, setContacts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const [newContact, setNewContact] = useState({ name: '', role: '', phone: '', email: '', task: '' });
  const [deletingId, setDeletingId] = useState(null);

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'team_contacts_v2'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setContacts(data);
      if (data.length === 0) seedContactsV2();
    });
    return () => unsubscribe();
  }, [user]);

  const seedContactsV2 = async () => {
    const seeds = [
      { name: '林采欣 (Linda)', role: '雄獅旅遊 專案窗口', phone: '(02) 8793-9000 #1691', email: 'lindalin@liontravel.com', type: 'agency', task: '行程總籌、機票住宿' },
      { name: '愛喻', role: '總召', phone: '', email: '', type: 'student', task: '活動總籌與決策' },
      { name: '淑卿、幸慧', role: '副總召', phone: '', email: '', type: 'student', task: '協助總召、進度控管' },
      { name: '對外組 (3,4,5家)', role: '活動公關', phone: '', email: '', type: 'student', task: '活動規劃、企業聯繫、旅行社窗口' },
      { name: '對內組 (1,2,6家)', role: '行政庶務', phone: '', email: '', type: 'student', task: '行政對接、學校聯繫、證件收集' }
    ];
    for (const s of seeds) await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'team_contacts_v2'), s);
  };

  const addContact = async () => {
    if(!newContact.name) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'team_contacts_v2'), { ...newContact, type: 'student' });
    setIsAdding(false);
    setNewContact({ name: '', role: '', phone: '', email: '', task: '' });
  };

  const confirmDelete = async (id, e) => {
    if(e) e.stopPropagation();
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'team_contacts_v2', id));
    setDeletingId(null);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <h2 className={`${fontStyles.h2} text-teal-800 mb-8 flex items-center`}>
        <Users className="mr-3 text-orange-500" /> 籌備團隊與聯絡
      </h2>
      
      <div className="grid md:grid-cols-2 gap-6">
        {contacts.map((contact) => (
          <div key={contact.id} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 relative group hover:shadow-md transition">
             {isAdmin && (
               deletingId === contact.id ? (
                 <div className="absolute top-2 right-2 flex gap-1 z-20 bg-white/95 p-1 rounded-lg shadow-sm border border-gray-100">
                   <button 
                     onClick={(e) => confirmDelete(contact.id, e)} 
                     className="bg-red-500 text-white text-[12px] px-3 py-1 rounded hover:bg-red-600 transition"
                   >
                     確認
                   </button>
                   <button 
                     onClick={(e) => { e.stopPropagation(); setDeletingId(null); }} 
                     className="bg-gray-300 text-white text-[12px] px-3 py-1 rounded hover:bg-gray-400 transition"
                   >
                     取消
                   </button>
                 </div>
               ) : (
                 <button 
                   onClick={(e) => { e.stopPropagation(); setDeletingId(contact.id); }} 
                   className="absolute top-2 right-2 bg-red-50 text-red-400 p-2 rounded-full hover:bg-red-100 transition z-10 hover:text-red-500"
                   title="刪除聯絡人"
                 >
                   <Trash2 size={16} />
                 </button>
               )
             )}
             <div className="flex items-center mb-3">
               <div className={`w-12 h-12 rounded-full flex items-center justify-center mr-3 font-bold text-xl flex-shrink-0
                 ${contact.type === 'agency' ? 'bg-orange-100 text-orange-600' : 'bg-teal-100 text-teal-600'}`}>
                 {contact.name[0]}
               </div>
               <div>
                 <h4 className={`${fontStyles.h4} text-slate-800`}>{contact.name}</h4>
                 <p className="text-[13px] text-slate-500 font-medium">{contact.role}</p>
               </div>
             </div>

             {/* Task Section */}
             {contact.task && (
               <div className="mb-3 bg-amber-50 px-3 py-2 rounded-lg border border-amber-100">
                 <div className="flex items-start text-[13px] text-amber-800">
                    <ClipboardList size={14} className="mr-2 mt-0.5 flex-shrink-0"/>
                    <span className="font-bold mr-1">任務：</span>
                    <span>{contact.task}</span>
                 </div>
               </div>
             )}

             <div className="space-y-1 pl-1">
                {contact.phone && <div className="flex items-center text-[13px] text-slate-600"><Phone size={14} className="mr-2 opacity-50"/> {contact.phone}</div>}
                {contact.email && <div className="flex items-center text-[13px] text-slate-600"><FileText size={14} className="mr-2 opacity-50"/> {contact.email}</div>}
             </div>
          </div>
        ))}
        
        {isAdmin && (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-2xl flex flex-col items-center justify-center p-6 text-gray-400 hover:bg-white hover:border-teal-400 transition cursor-pointer"
             onClick={() => setIsAdding(true)}
          >
             {!isAdding ? (
               <>
                 <Plus size={32} className="mb-2"/>
                 <span className="text-[14px]">新增聯絡人</span>
               </>
             ) : (
               <div className="w-full space-y-3" onClick={(e) => e.stopPropagation()}>
                 <h4 className="text-teal-700 font-bold text-[14px] mb-2">新增團隊成員</h4>
                 <input className="w-full p-2 text-[14px] border rounded" placeholder="姓名 (必填)" value={newContact.name} onChange={e => setNewContact({...newContact, name: e.target.value})} />
                 <input className="w-full p-2 text-[14px] border rounded" placeholder="職稱/角色" value={newContact.role} onChange={e => setNewContact({...newContact, role: e.target.value})} />
                 <input className="w-full p-2 text-[14px] border rounded" placeholder="負責任務" value={newContact.task} onChange={e => setNewContact({...newContact, task: e.target.value})} />
                 <input className="w-full p-2 text-[14px] border rounded" placeholder="電話 (選填)" value={newContact.phone} onChange={e => setNewContact({...newContact, phone: e.target.value})} />
                 <div className="flex gap-2 pt-2">
                   <button onClick={addContact} className="flex-1 bg-teal-500 text-white py-1.5 rounded text-[14px]">確認</button>
                   <button onClick={() => setIsAdding(false)} className="flex-1 bg-gray-300 text-white py-1.5 rounded text-[14px]">取消</button>
                 </div>
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

// 6. QA Section with Categories (Updated with Inline Delete State)
const QASection = ({ isAdmin, user }) => {
  const [qaList, setQaList] = useState([]);
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [openIndex, setOpenIndex] = useState(null);
  
  // Edit State
  const [newQ, setNewQ] = useState({ q: '', a: '', category: '一般' });
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const categories = ['一般', '住宿', '交通', '學術', '費用'];

  useEffect(() => {
    if (!user) return;
    const q = query(collection(db, 'artifacts', appId, 'public', 'data', 'qa_v2'), orderBy('timestamp', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setQaList(data);
      if(data.length === 0) seedQA_V2();
    }, (error) => console.error("QA Error:", error));
    return () => unsubscribe();
  }, [user]);

  const seedQA_V2 = async () => {
    const questions = [
      { category: '交通', question: '我可以自行購買機票嗎？', answer: '可以。自行購票可扣團費 NT$18,000，但需自行前往第一個參訪點與團隊會合。' },
      { category: '住宿', question: '住宿可以安排單人房嗎？', answer: '可以。全程單人房需加價 NT$16,000。' },
      { category: '費用', question: '如果報名後需要取消怎麼辦？', answer: '依照旅遊契約書規定辦理。如未達成行率取消，收取退票費$5000；3月初後飯店不退費。' },
      { category: '學術', question: '課程學分如何計算？', answer: '本課程為「高階主管投資與理財」，屬於群修二，2學分。需全程參與才能獲得學分。' }
    ];
    for (const q of questions) {
      await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'qa_v2'), { ...q, timestamp: Date.now() });
    }
  };

  const handleAdd = async () => {
    if (!newQ.q || !newQ.a) return;
    await addDoc(collection(db, 'artifacts', appId, 'public', 'data', 'qa_v2'), {
      question: newQ.q, answer: newQ.a, category: newQ.category, timestamp: Date.now()
    });
    setNewQ({ q: '', a: '', category: '一般' });
  };

  const confirmDelete = async (id, e) => {
    if(e) e.stopPropagation();
    await deleteDoc(doc(db, 'artifacts', appId, 'public', 'data', 'qa_v2', id));
    setDeletingId(null);
  };

  const filteredList = categoryFilter === 'all' ? qaList : qaList.filter(item => item.category === categoryFilter);

  return (
    <div className="max-w-3xl mx-auto px-4 py-8">
      <h2 className={`${fontStyles.h2} text-teal-800 mb-8 flex items-center`}>
        <HelpCircle className="mr-3 text-orange-500" /> 旅遊問答集
      </h2>

      {/* Categories Tabs */}
      <div className="flex flex-wrap gap-2 mb-6">
        <button 
          onClick={() => setCategoryFilter('all')}
          className={`px-4 py-1.5 rounded-full text-[14px] font-medium transition-all
            ${categoryFilter === 'all' ? 'bg-orange-500 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-orange-50'}`}
        >
          全部
        </button>
        {categories.map(cat => (
          <button 
            key={cat}
            onClick={() => setCategoryFilter(cat)}
            className={`px-4 py-1.5 rounded-full text-[14px] font-medium transition-all
            ${categoryFilter === cat ? 'bg-teal-500 text-white shadow-md' : 'bg-white text-slate-500 border border-slate-200 hover:bg-teal-50'}`}
          >
            {cat}
          </button>
        ))}
      </div>
      
      {isAdmin && (
        <div className="bg-white p-6 rounded-2xl mb-8 border-2 border-dashed border-teal-200">
          <h4 className="font-bold text-teal-700 mb-4 flex items-center text-[16px]"><Plus size={16} className="mr-2"/>新增 Q&A</h4>
          <div className="flex gap-2 mb-2">
            <select 
              className="p-2 border rounded text-[14px] bg-gray-50" 
              value={newQ.category}
              onChange={e => setNewQ({...newQ, category: e.target.value})}
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
            <input 
              className="flex-1 p-2 border rounded text-[14px]" 
              placeholder="輸入問題..." 
              value={newQ.q} 
              onChange={e => setNewQ({...newQ, q: e.target.value})}
            />
          </div>
          <textarea 
            className="w-full p-2 mb-2 border rounded text-[14px] h-20" 
            placeholder="輸入回答..." 
            value={newQ.a} 
            onChange={e => setNewQ({...newQ, a: e.target.value})}
          />
          <button onClick={handleAdd} className="bg-teal-500 text-white px-6 py-2 rounded-full hover:bg-teal-600 transition text-[14px] font-bold shadow-md">
            發布
          </button>
        </div>
      )}

      <div className="space-y-4">
        {filteredList.map((item, index) => (
          <div key={item.id} className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition">
            <button 
              onClick={() => setOpenIndex(openIndex === index ? null : index)}
              className="w-full px-6 py-4 text-left flex justify-between items-center"
            >
              <div className="flex items-center gap-3">
                 <span className="text-[13px] bg-gray-100 text-gray-500 px-2 py-0.5 rounded flex-shrink-0">
                    {item.category || '一般'}
                 </span>
                 <span className={`${fontStyles.base} font-bold text-slate-700`}>{item.question}</span>
              </div>
              {openIndex === index ? <ChevronUp className="text-orange-400 flex-shrink-0"/> : <ChevronDown className="text-slate-300 flex-shrink-0"/>}
            </button>
            {openIndex === index && (
              <div className="px-6 py-4 bg-orange-50/50 border-t border-orange-100 text-slate-600 text-[14px]">
                {item.answer}
                {isAdmin && (
                   <div className="mt-2 text-right">
                     {deletingId === item.id ? (
                        <div className="inline-flex gap-2">
                           <span className="text-[13px] text-red-500 font-bold self-center">確定刪除?</span>
                           <button onClick={(e) => confirmDelete(item.id, e)} className="text-white bg-red-500 px-3 py-1 rounded text-[12px]">是</button>
                           <button onClick={(e) => { e.stopPropagation(); setDeletingId(null); }} className="text-gray-600 bg-gray-200 px-3 py-1 rounded text-[12px]">否</button>
                        </div>
                     ) : (
                        <button 
                          onClick={(e) => { e.stopPropagation(); setDeletingId(item.id); }} 
                          className="text-red-400 text-[13px] hover:underline"
                        >
                          刪除此題
                        </button>
                     )}
                   </div>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

// 7. Cost Section
const CostSection = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
    <h2 className={`${fontStyles.h2} text-teal-800 mb-8 flex items-center`}>
      <DollarSign className="mr-3 text-orange-500" /> 費用與行政
    </h2>
    <div className="bg-white rounded-3xl shadow-lg overflow-hidden mb-8 border-t-8 border-orange-400">
      <div className="p-8 text-center bg-orange-50">
        <p className="text-[14px] text-slate-500 mb-2">每人團費 (35人成團)</p>
        <div className="text-5xl font-extrabold text-slate-800 mb-2 tracking-tight">NT$ 63,500</div>
        <span className="inline-block bg-white text-orange-600 px-4 py-1 rounded-full text-[14px] font-bold shadow-sm border border-orange-100">
          訂金 NT$ 15,000
        </span>
      </div>
      <div className="p-8 bg-white">
        <div className="grid md:grid-cols-2 gap-10">
          <div>
            <h4 className={`${fontStyles.h4} text-teal-700 mb-4 pb-2 border-b border-teal-100`}>費用包含</h4>
            <ul className="space-y-3 text-[14px] text-slate-600">
              {['機票 (華航團體經濟艙)', '住宿 (二人一室)', '餐食 (行程表列)', '交通 (全程45人座大巴)', '門票 & 保險', '司機領隊小費'].map(i => (
                <li key={i} className="flex items-center"><span className="w-5 h-5 bg-teal-100 rounded-full flex items-center justify-center text-teal-600 text-[10px] mr-3">✓</span>{i}</li>
              ))}
            </ul>
          </div>
          <div>
            <h4 className={`${fontStyles.h4} text-orange-600 mb-4 pb-2 border-b border-orange-100`}>加價/減免選項</h4>
            <ul className="space-y-3 text-[14px] text-slate-600">
               <li className="flex items-center bg-blue-50 p-2 rounded-lg"><span className="font-bold text-blue-600 mr-2">★</span> 單人房加價: +NT$ 16,000</li>
               <li className="flex items-center bg-orange-50 p-2 rounded-lg"><span className="font-bold text-orange-600 mr-2">★</span> 機票自理扣除: -NT$ 18,000</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  </div>
);

// 8. Academic Section (Detailed Syllabus)
const AcademicSection = () => (
  <div className="max-w-4xl mx-auto px-4 py-8">
     <h2 className={`${fontStyles.h2} text-teal-800 mb-8 flex items-center`}>
      <BookOpen className="mr-3 text-orange-500" /> 學術任務與課綱
    </h2>
    <div className="bg-white p-8 rounded-3xl shadow-sm border border-slate-100">
      
      {/* Course Header */}
      <div className="bg-gradient-to-r from-teal-500 to-teal-600 text-white p-6 rounded-2xl mb-8 shadow-md relative overflow-hidden">
        <div className="relative z-10">
           <div className="flex items-center gap-2 mb-2">
             <GraduationCap className="text-yellow-300"/>
             <span className="text-yellow-100 font-bold text-[14px]">114學年第二學期 | 932252-001</span>
           </div>
           <h3 className={`${fontStyles.h1} mb-2 leading-tight`}>高階主管投資與理財</h3>
           <p className="opacity-90 text-[16px] font-medium">境外參訪 (日本東京) | 2 學分 | 群修二 </p>
           <p className="mt-2 inline-block bg-white/20 px-3 py-1 rounded text-[14px]">授課教師：陳鴻毅 教授</p>
        </div>
        <BookOpen className="absolute right-[-20px] bottom-[-20px] w-48 h-48 opacity-10 rotate-12"/>
      </div>

      {/* Class Schedule */}
      <h4 className="text-[18px] font-bold text-teal-800 mb-4 flex items-center">
        <Clock className="mr-2" /> 課程時間表
      </h4>
      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <div className="bg-slate-50 p-5 rounded-xl text-center border border-slate-200">
          <div className="font-bold text-slate-500 mb-1 text-[13px]">行前課程</div>
          <div className="text-[20px] font-bold text-slate-800 mb-1">5/11 (一)</div>
          <div className="text-[14px] text-slate-600">18:30 - 22:30</div>
        </div>
        <div className="bg-orange-50 p-5 rounded-xl text-center border-2 border-orange-200 transform md:-translate-y-2 shadow-lg">
           <div className="font-bold text-orange-600 mb-1 text-[13px] uppercase tracking-wider">參訪期間</div>
          <div className="text-[20px] font-bold text-orange-700">5/13 - 5/17</div>
          <div className="text-[14px] text-orange-600">日本東京</div>
        </div>
        <div className="bg-slate-50 p-5 rounded-xl text-center border border-slate-200">
          <div className="font-bold text-slate-500 mb-1 text-[13px]">回程課程</div>
          <div className="text-[20px] font-bold text-slate-800 mb-1">5/25 (一)</div>
          <div className="text-[14px] text-slate-600">18:30 - 22:30</div>
        </div>
      </div>

      {/* Learning Goals */}
      <div className="grid md:grid-cols-2 gap-8 mb-8">
         <div>
            <h4 className="text-[18px] font-bold text-teal-800 mb-4 flex items-center">
              <Target className="mr-2" /> 課程目標
            </h4>
            <ul className="space-y-3">
               {[
                 '理論與實務深度連結：觀察學術創新如何轉化為企業決策。',
                 '領先全球的成功模式：理解日本公共治理、永續理念與創新工藝。',
                 '培養全球化經營視野：在跨文化脈絡中建構策略思維。'
               ].map((goal, idx) => (
                 <li key={idx} className="flex items-start text-[14px] text-slate-700 leading-relaxed bg-teal-50/50 p-3 rounded-lg">
                   <div className="w-6 h-6 rounded-full bg-teal-100 text-teal-600 flex items-center justify-center text-[12px] font-bold mr-3 flex-shrink-0">{idx+1}</div>
                   {goal}
                 </li>
               ))}
            </ul>
         </div>
         <div>
            <h4 className="text-[18px] font-bold text-teal-800 mb-4 flex items-center">
              <ClipboardList className="mr-2" /> 評分標準
            </h4>
            <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-slate-700">出席與參訪參與</span>
                <span className="text-[18px] font-bold text-orange-500">60%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-orange-500 h-2 rounded-full" style={{width: '60%'}}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-slate-700">課程參與討論</span>
                <span className="text-[18px] font-bold text-teal-500">20%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-teal-500 h-2 rounded-full" style={{width: '20%'}}></div>
              </div>

              <div className="flex items-center justify-between">
                <span className="text-[15px] font-bold text-slate-700">期末報告</span>
                <span className="text-[18px] font-bold text-blue-500">20%</span>
              </div>
              <div className="w-full bg-gray-100 rounded-full h-2">
                <div className="bg-blue-500 h-2 rounded-full" style={{width: '20%'}}></div>
              </div>
            </div>
         </div>
      </div>

      {/* Visits Detail */}
      <h4 className="text-[18px] font-bold text-teal-800 mb-4">重點參訪機構與學習成效</h4>
      <div className="space-y-4">
        {[
          { title: '早稻田商學院', desc: '認識教學特色與產學合作模式，討論管理理論之實務應用。', tag: '學術交流' },
          { title: '東京證券交易所', desc: '認識市場制度與核心功能，討論公司治理與資本效率。', tag: '金融' },
          { title: '東京都下水道局 (芝浦再生中心)', desc: '認識業務功能與水資源循環，討論公共治理與永續管理。', tag: '環保 ESG' },
          { title: '日本國會參議院', desc: '認識制度架構與立法職能，討論政策環境對企業之影響。', tag: '政治經濟' },
          { title: '橫濱資生堂全球創新中心 S/PARK', desc: '認識研發創新與品牌策略，討論創新管理與競爭優勢。', tag: '創新' },
        ].map((visit, i) => (
          <div key={i} className="flex flex-col md:flex-row md:items-center bg-gray-50 p-4 rounded-xl border-l-4 border-teal-400">
             <div className="md:w-1/4 mb-2 md:mb-0">
               <span className="inline-block bg-teal-100 text-teal-700 text-[13px] px-2 py-1 rounded font-bold mb-1">{visit.tag}</span>
               <h5 className="text-[16px] font-bold text-slate-800">{visit.title}</h5>
             </div>
             <div className="md:w-3/4 pl-0 md:pl-4 border-t md:border-t-0 md:border-l border-gray-200 pt-2 md:pt-0">
               <p className="text-[14px] text-slate-600">{visit.desc}</p>
             </div>
          </div>
        ))}
      </div>

       <div className="mt-8 bg-red-50 p-4 rounded-xl border border-red-100 flex items-start">
         <span className="text-red-500 mr-3 text-xl">⚠️</span>
         <div>
            <p className="text-red-700 text-[15px] font-bold">重要提醒</p>
            <p className="text-red-600 text-[14px]">境外參訪行程，所有修課學生務必「全程參與」。若有缺席，將視為課程不及格。</p>
         </div>
      </div>
    </div>
  </div>
);

// Admin Login
const AdminLogin = ({ onLogin }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (username === 'admin' && password === 'Aa123456#') {
      onLogin();
    } else {
      setError('帳號或密碼錯誤');
    }
  };

  return (
    <div className="min-h-[60vh] flex items-center justify-center bg-orange-50/50 px-4">
      <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-md border border-orange-100">
        <h2 className={`${fontStyles.h2} text-center text-teal-800 mb-6`}>團隊登入</h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <input 
            type="text" placeholder="帳號"
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-[14px]"
            value={username} onChange={(e) => setUsername(e.target.value)}
          />
          <input 
            type="password" placeholder="密碼"
            className="w-full p-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-teal-500 outline-none text-[14px]"
            value={password} onChange={(e) => setPassword(e.target.value)}
          />
          {error && <p className="text-red-500 text-[13px]">{error}</p>}
          <button type="submit" className="w-full bg-teal-500 text-white py-3 rounded-xl font-bold hover:bg-teal-600 transition shadow-lg">
            登入管理系統
          </button>
        </form>
      </div>
    </div>
  );
};

// --- Main App ---
const App = () => {
  const [activeTab, setActiveTab] = useState('home');
  const [user, setUser] = useState(null);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== 'undefined' && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();
    onAuthStateChanged(auth, (u) => setUser(u));
  }, []);

  const handleAdminLogin = () => {
    setIsAdmin(true);
    setActiveTab('itinerary');
  };

  const handleLogout = () => {
    setIsAdmin(false);
    setActiveTab('home');
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'home':
        return (
          <>
            <Hero />
            <InfoSection />
          </>
        );
      case 'itinerary': return <ItinerarySection isAdmin={isAdmin} user={user} />;
      case 'info': return <CostSection />;
      case 'academic': return <AcademicSection />;
      case 'team': return <TeamSection isAdmin={isAdmin} user={user} />;
      case 'qa': return <QASection isAdmin={isAdmin} user={user} />;
      case 'admin':
        return isAdmin ? (
          <div className="text-center py-20">
            <h2 className="text-2xl font-bold mb-4 text-teal-800">歡迎回到管理後台</h2>
            <p className="text-slate-500 text-[14px]">請透過下方選單直接編輯內容，所有變更將即時發布。</p>
          </div>
        ) : <AdminLogin onLogin={handleAdminLogin} />;
      default: return <Hero />;
    }
  };

  return (
    <div className={`min-h-screen ${THEME.bg} font-sans text-slate-700 selection:bg-orange-200`}>
      <Navigation 
        activeTab={activeTab} 
        setActiveTab={setActiveTab} 
        isAdmin={isAdmin}
        handleLogout={handleLogout}
      />
      <main className="pb-12">
        {renderContent()}
      </main>
      <footer className="bg-white border-t border-orange-100 py-8 text-center text-[13px] text-slate-400">
        <div className="max-w-7xl mx-auto px-4">
          <p>NCCU EMBA Tokyo Trip 2026</p>
          <p className="mt-1">Designed for Global Finance Group</p>
        </div>
      </footer>
    </div>
  );
};

export default App;