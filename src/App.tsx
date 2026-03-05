import React, { useState, useMemo, useEffect } from 'react';
import { 
  TrendingUp, 
  Users, 
  Calendar, 
  CreditCard, 
  LayoutDashboard, 
  Target, 
  AlertCircle,
  Printer,
  RefreshCw,
  Activity,
  Percent,
  Sparkles,
  Loader2,
  Calculator,
  LogOut,
  Settings,
  Sliders,
  DollarSign,
  Briefcase,
  Download,
  BookOpen,
  Tag,
  Home,
  BarChart3,
  PieChart,
  Stethoscope,
  Layers
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { GoogleGenAI, Type } from "@google/genai";
import * as XLSX from 'xlsx';

// --- Constants & Types ---

const TARGET_REVENUE = 1200000000; 
const MAX_REVENUE = 1250000000;

const ROOM_TYPES = [
  { key: 'standard', label: 'Стандарты' },
  { key: 'comfort', label: 'Комфорт' },
  { key: 'lux', label: 'Люкс' },
];

const PACKAGES = [
  { key: 'aqua_bb', label: 'Аква тур BB', short: 'BB', color: 'text-blue-400', bg: 'bg-blue-50', maxShare: 5, alos: 3 },
  { key: 'aqua_hb', label: 'Аква тур HB', short: 'HB', color: 'text-blue-500', bg: 'bg-blue-50', maxShare: 5, alos: 4 },
  { key: 'aqua_fb', label: 'Аква тур FB', short: 'FB', color: 'text-blue-600', bg: 'bg-blue-50', maxShare: 10, alos: 5 },
  { key: 'ultra', label: 'Ультра (FB+Аква+Аним)', short: 'Ultra', color: 'text-indigo-600', bg: 'bg-indigo-50', alos: 7 },
  { key: 'spa', label: 'Ультра + СПА', short: 'SPA', color: 'text-purple-600', bg: 'bg-purple-50', alos: 7 },
  { key: 'med', label: 'Ультра с лечением', short: 'Med', color: 'text-orange-600', bg: 'bg-orange-50', alos: 12 },
  { key: 'promo', label: 'Акции, ПРОМО', short: 'ПРОМО', color: 'text-red-600', bg: 'bg-red-50', maxShare: 5, restricted: true, alos: 5 },
];

const SEASONS = [
  { name: "Период 1", dates: "12.02–19.02", days: 8, defaultOcc: 45, defaultGuests: 2.2, isLow: true },
  { name: "Период 2", dates: "20.02–23.02 / 06.03–09.03 / 28.03–30.04", days: 42, defaultOcc: 42, defaultGuests: 2.2, isLow: true },
  { name: "Период 3", dates: "24.02–05.03 / 10.03–27.03", days: 28, defaultOcc: 40, defaultGuests: 2.2, isLow: true },
  { name: "Период 4", dates: "01.05–02.05 / 08.05–10.05", days: 5, defaultOcc: 65, defaultGuests: 2.2, isMid: true },
  { name: "Период 5", dates: "03.05–07.05 / 11.05–31.05", days: 26, defaultOcc: 55, defaultGuests: 2.2, isMid: true },
  { name: "Период 6", dates: "01.06–20.06", days: 20, defaultOcc: 70, defaultGuests: 2.2 },
  { name: "Период 7", dates: "21.06–24.08", days: 65, defaultOcc: 85, defaultGuests: 2.7 },
  { name: "Период 8", dates: "25.08–30.09", days: 37, defaultOcc: 72, defaultGuests: 2.5 },
  { name: "Период 9", dates: "01.10–31.10", days: 31, defaultOcc: 52, defaultGuests: 2.1, isMid: true },
  { name: "Период 10", dates: "01.11–28.12", days: 58, defaultOcc: 38, defaultGuests: 2.2, isLow: true },
];

const MONTHS = [
  { name: "Январь", days: 31, distribution: [{ sIdx: 9, days: 31 }] },
  { name: "Февраль", days: 28, distribution: [{ sIdx: 9, days: 11 }, { sIdx: 0, days: 8 }, { sIdx: 1, days: 9 }] },
  { name: "Март", days: 31, distribution: [{ sIdx: 2, days: 5 }, { sIdx: 1, days: 4 }, { sIdx: 2, days: 18 }, { sIdx: 1, days: 4 }] },
  { name: "Апрель", days: 30, distribution: [{ sIdx: 1, days: 30 }] },
  { name: "Май", days: 31, distribution: [{ sIdx: 3, days: 2 }, { sIdx: 4, days: 5 }, { sIdx: 3, days: 3 }, { sIdx: 4, days: 21 }] },
  { name: "Июнь", days: 30, distribution: [{ sIdx: 5, days: 20 }, { sIdx: 6, days: 10 }] },
  { name: "Июль", days: 31, distribution: [{ sIdx: 6, days: 31 }] },
  { name: "Август", days: 31, distribution: [{ sIdx: 6, days: 24 }, { sIdx: 7, days: 7 }] },
  { name: "Сентябрь", days: 30, distribution: [{ sIdx: 7, days: 30 }] },
  { name: "Октябрь", days: 31, distribution: [{ sIdx: 8, days: 31 }] },
  { name: "Ноябрь", days: 30, distribution: [{ sIdx: 9, days: 30 }] },
  { name: "Декабрь", days: 31, distribution: [{ sIdx: 9, days: 31 }] },
];

const initialPrices = () => {
  const p: any = {
    standard: {
      aqua_bb: SEASONS.map((_, i) => [2500, 3200, 2900, 3600, 3400, 5000, 7100, 5500, 2700, 2500][i]),
      aqua_hb: SEASONS.map((_, i) => [2900, 3600, 3300, 4000, 3800, 5400, 7500, 5900, 3100, 2900][i]),
      aqua_fb: SEASONS.map((_, i) => [3100, 3800, 3500, 4200, 4000, 5600, 7700, 6100, 3300, 3100][i]),
      ultra: [3300, 4000, 3700, 4400, 4200, 5800, 7900, 6300, 3500, 3300],
      spa: [3900, 4600, 4300, 5000, 4800, 6600, 9000, 7100, 4100, 3900],
      med: [4100, 4800, 4500, 5200, 5000, 6800, 9200, 7300, 4300, 4100],
    },
    comfort: {
      aqua_bb: SEASONS.map((_, i) => [2700, 3400, 3100, 3800, 3600, 5200, 7300, 5700, 2900, 2700][i]),
      aqua_hb: SEASONS.map((_, i) => [3100, 3800, 3500, 4200, 4000, 5600, 7700, 6100, 3300, 3100][i]),
      aqua_fb: SEASONS.map((_, i) => [3300, 4000, 3700, 4400, 4200, 5800, 7900, 6300, 3500, 3300][i]),
      ultra: [3500, 4200, 3900, 4600, 4400, 6000, 8100, 6500, 3700, 3500],
      spa: [4100, 4800, 4500, 5200, 5000, 6800, 9200, 7300, 4300, 4100],
      med: [4300, 5000, 4700, 5400, 5200, 7000, 9400, 7500, 4500, 4300],
    },
    lux: {
      aqua_bb: SEASONS.map((_, i) => [3400, 4100, 3800, 4500, 4300, 6200, 8700, 6800, 3700, 3400][i]),
      aqua_hb: SEASONS.map((_, i) => [3800, 4500, 4200, 4900, 4700, 6600, 9100, 7200, 4100, 3800][i]),
      aqua_fb: SEASONS.map((_, i) => [4000, 4700, 4400, 5100, 4900, 6800, 9300, 7400, 4300, 4000][i]),
      ultra: [4200, 4900, 4600, 5300, 5100, 7000, 9500, 7600, 4500, 4200],
      spa: [4800, 5500, 5200, 5900, 5700, 7800, 10600, 8400, 5100, 4800],
      med: [5000, 5700, 5400, 6100, 5900, 8000, 10800, 8600, 5300, 5000],
    }
  };
  
  // Initialize promo based on ultra (default)
  Object.keys(p).forEach(rt => {
    p[rt].promo = p[rt].ultra.map((u: number, i: number) => SEASONS[i].isLow ? Math.round(u * 0.9) : 0);
  });
  
  return p;
};

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isAdmin, setIsAdmin] = useState(true); // Simulated admin role
  const [globalPriceAdj, setGlobalPriceAdj] = useState(0); // % adjustment
  const [globalOccAdj, setGlobalOccAdj] = useState(0); // % adjustment
  
  // --- Shared State & Sandbox Mode ---
  const [isSandbox, setIsSandbox] = useState(() => {
    try {
      return localStorage.getItem('sochi_sandbox') === 'true';
    } catch (e) {
      return false;
    }
  });
  const [isSyncing, setIsSyncing] = useState(false);
  const [lastSynced, setLastSynced] = useState<Date | null>(null);

  // --- Access Control Logic ---
  type UserRole = 'ADMIN' | 'STAFF' | 'OWNER' | 'DEMO';
  const [userRole, setUserRole] = useState<UserRole | null>(() => {
    try {
      const savedRole = localStorage.getItem('sochi_role') as UserRole;
      // Check demo expiration
      if (savedRole === 'DEMO') {
        const start = localStorage.getItem('sochi_demo_start');
        if (start) {
          const startTime = parseInt(start);
          const now = Date.now();
          const threeDays = 3 * 24 * 60 * 60 * 1000;
          if (now - startTime > threeDays) {
            localStorage.removeItem('sochi_role');
            return null;
          }
        }
      }
      return savedRole;
    } catch (e) {
      return null;
    }
  });

  const ROLE_KEYS: Record<string, UserRole> = {
    "ADMIN2026": "ADMIN",
    "STAFF2026": "STAFF",
    "OWNER2026": "OWNER",
    "ANALYST2026": "OWNER",
    "DEMO2026": "DEMO",
    "АДМИН2026": "ADMIN",
    "ПЕРСОНАЛ2026": "STAFF",
    "АНАЛИТИК2026": "OWNER",
    "БОСС2026": "OWNER",
    "ДЕМО2026": "DEMO"
  };

  const [accessKey, setAccessKey] = useState('');
  const [showError, setShowError] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogin = (e: React.FormEvent, forceRole?: UserRole) => {
    if (e) e.preventDefault();
    
    let role = forceRole;
    if (!role) {
      const inputKey = accessKey.trim().toUpperCase();
      role = ROLE_KEYS[inputKey];
    }

    if (role) {
      setUserRole(role);
      setIsAdmin(role === 'ADMIN');
      setShowError(false);
      
      if (role === 'DEMO') {
        if (!localStorage.getItem('sochi_demo_start')) {
          localStorage.setItem('sochi_demo_start', Date.now().toString());
        }
        setIsSandbox(true);
        localStorage.setItem('sochi_sandbox', 'true');
      }

      try {
        localStorage.setItem('sochi_role', role);
      } catch (e) {}
      
      // Set default tab based on role
      if (role === 'STAFF') setActiveTab('pricelist');
      else if (role === 'OWNER' || role === 'DEMO') setActiveTab('dashboard');
      else setActiveTab('dashboard');
    } else {
      setShowError(true);
    }
  };

  const handleLogout = () => {
    setUserRole(null);
    try {
      localStorage.removeItem('sochi_role');
    } catch (e) {}
  };
  const [rooms, setRooms] = useState({ standard: 227, comfort: 240, lux: 0 });
  const [pkgMix, setPkgMix] = useState({ aqua_bb: 2, aqua_hb: 3, aqua_fb: 5, ultra: 40, spa: 20, med: 25, promo: 5 });
  const [prices, setPrices] = useState(initialPrices());
  const [seasons, setSeasons] = useState(SEASONS);
  const [targetGOPMargin, setTargetGOPMargin] = useState(40); // Target GOP Margin %
  const [seasonData, setSeasonData] = useState(SEASONS.map(s => ({ 
    occPlan: s.defaultOcc, 
    occFact: 0, 
    guests: s.defaultGuests 
  })));
  const [segmentData, setSegmentData] = useState(MONTHS.map(() => ({
    direct: { plan: 20, fact: 0, revFact: 0 },
    to: { plan: 20, fact: 0, revFact: 0 },
    fss: { plan: 20, fact: 0, revFact: 0 },
    corp: { plan: 25, fact: 0, revFact: 0 },
    ota: { plan: 15, fact: 0, revFact: 0 },
  })));

  const [roomFact, setRoomFact] = useState({
    standard: { occ: 0, rev: 0 },
    comfort: { occ: 0, rev: 0 },
    lux: { occ: 0, rev: 0 }
  });

  const [pkgFact, setPkgFact] = useState({
    aqua_bb: { share: 0, rev: 0 },
    aqua_hb: { share: 0, rev: 0 },
    aqua_fb: { share: 0, rev: 0 },
    ultra: { share: 0, rev: 0 },
    spa: { share: 0, rev: 0 },
    med: { share: 0, rev: 0 },
    promo: { share: 0, rev: 0 }
  });

  const [promoProposals, setPromoProposals] = useState('');
  const [competitorAnalysis, setCompetitorAnalysis] = useState('');
  const [competitorList, setCompetitorList] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);

  const [calcConfig, setCalcConfig] = useState({
    fb_ultra_spa: { food: 50, b: 35, l: 35, d: 40, spa: 5, med: 5, acc: 40 },
    ultra_med: { food: 30, b: 35, l: 35, d: 40, spa: 5, med: 25, acc: 40 },
    others: { spa: 5, med: 5 }
  });

  const [calcSeason, setCalcSeason] = useState(0);
  const [calcRoom, setCalcRoom] = useState('standard');

  const [costConfig, setCostConfig] = useState({
    foodCostPct: 30, // % от выручки за питание
    staffingMonthly: 15000000, // Фикс. ФОТ в месяц
    commissionPct: 15, // Средняя комиссия OTA
    otherVCPct: 10, // Прочие переменные (прачка, свет и т.д.)
    medCapacity: 4500, // Макс. чел-дней в Медцентре в месяц
  });

  // Расширенная модель постоянных расходов (₽/мес) — цифры вносятся вручную
  const [expenseModel, setExpenseModel] = useState({
    utilities: 0,        // Коммунальные услуги (электро, вода, газ, тепло)
    maintenance: 0,      // Содержание и текущий ремонт
    marketing: 0,        // Маркетинг и реклама
    admin: 0,            // Административные и офисные расходы
    insurance: 0,        // Страхование имущества и ответственности
    lease: 0,            // Аренда / лизинг оборудования
    security: 0,         // Охрана и безопасность
    it: 0,               // IT, ПО, телекоммуникации
    laundry: 0,          // Прачечная и химчистка (если внешняя)
    other: 0,            // Прочие постоянные расходы
  });

  const [promoBasePkg, setPromoBasePkg] = useState('ultra');
  const [promoDiscount, setPromoDiscount] = useState(10);

  const [medAddonConfig, setMedAddonConfig] = useState({
    maxConversion: 5, // Максимальный % от числа проживающих Гостей
    avgCheck: 500, // Средний чек в рублях
    procsPerGuest: 1, // Среднее кол-во процедур на 1 гостя
  });

  const [roomMonthlyData, setRoomMonthlyData] = useState(MONTHS.map((m, mIdx) => {
    const data: any = {};
    ROOM_TYPES.forEach(rt => {
      // Calculate initial plan based on seasonal defaults
      const weightedOcc = m.distribution.reduce((acc, dist) => {
        return acc + (SEASONS[dist.sIdx].defaultOcc * dist.days);
      }, 0) / m.days;
      data[rt.key] = { plan: Math.round(weightedOcc), fact: 0 };
    });
    return data;
  }));

  // --- Data Sync Logic ---
  const getAllState = () => ({
    rooms, pkgMix, prices, seasons, seasonData, segmentData,
    costConfig, calcConfig, medAddonConfig, roomMonthlyData,
    globalPriceAdj, globalOccAdj, expenseModel
  });

  const setAllState = (data: any) => {
    if (!data) return;
    if (data.rooms) setRooms(data.rooms);
    if (data.pkgMix) setPkgMix(data.pkgMix);
    if (data.prices) setPrices(data.prices);
    if (data.seasons) setSeasons(data.seasons);
    if (data.seasonData) setSeasonData(data.seasonData);
    if (data.segmentData) setSegmentData(data.segmentData);
    if (data.costConfig) setCostConfig(data.costConfig);
    if (data.calcConfig) setCalcConfig(data.calcConfig);
    if (data.medAddonConfig) setMedAddonConfig(data.medAddonConfig);
    if (data.roomMonthlyData) setRoomMonthlyData(data.roomMonthlyData);
    if (data.globalPriceAdj !== undefined) setGlobalPriceAdj(data.globalPriceAdj);
    if (data.globalOccAdj !== undefined) setGlobalOccAdj(data.globalOccAdj);
    if (data.expenseModel) setExpenseModel(data.expenseModel);
  };

  // Load shared state on mount
  useEffect(() => {
    if (!isSandbox) {
      fetch('/api/model')
        .then(res => res.json())
        .then(data => {
          if (data) {
            setAllState(data);
            setLastSynced(new Date());
          }
        })
        .catch(err => console.error("Failed to fetch shared model:", err));
    }
  }, [isSandbox]);

  // Save shared state (debounced)
  useEffect(() => {
    if (isSandbox || !userRole || (userRole !== 'ADMIN' && userRole !== 'OWNER')) return;

    const timer = setTimeout(() => {
      setIsSyncing(true);
      fetch('/api/model', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(getAllState())
      })
      .then(() => {
        setLastSynced(new Date());
        setIsSyncing(false);
      })
      .catch(err => {
        console.error("Failed to save shared model:", err);
        setIsSyncing(false);
      });
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    rooms, pkgMix, prices, seasons, seasonData, segmentData,
    costConfig, calcConfig, medAddonConfig, roomMonthlyData,
    globalPriceAdj, globalOccAdj, isSandbox, userRole, expenseModel
  ]);

  const toggleSandbox = () => {
    const next = !isSandbox;
    setIsSandbox(next);
    localStorage.setItem('sochi_sandbox', String(next));
    if (!next) {
      // Refresh from server when switching back to shared
      window.location.reload();
    }
  };

  const MED_ASSORTMENT = [
    { name: 'Диагностика и Чек-апы', share: 15, avgPrice: 5500, icon: '🔬' },
    { name: 'Бальнео и Гидротерапия', share: 25, avgPrice: 1800, icon: '💧' },
    { name: 'Грязелечение (Пелоидотерапия)', share: 20, avgPrice: 2200, icon: '🌿' },
    { name: 'Аппаратная физиотерапия', share: 20, avgPrice: 1200, icon: '⚡' },
    { name: 'Массаж и реабилитация', share: 20, avgPrice: 3800, icon: '👐' },
  ];

  const handleAIAnalysis = async () => {
    setIsAnalyzing(true);
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const competitorsPrompt = competitorList 
        ? `Сфокусируйся на следующих конкурентах: ${competitorList}.` 
        : `Выбери топ-5 актуальных конкурентов (отелей 4-5* и крупных санаториев) в Сочи самостоятельно.`;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Проведи глубокий анализ текущих акций и цен конкурентов в Сочи на сезон 2026. 
        ${competitorsPrompt}
        Сравни их предложения с нашим отелем (категории: Стандарт, Комфорт, Люкс; пакеты: Аква, Ультра, СПА, Медикал). 
        Найди конкретные цифры по ценам (если доступны) и условия их текущих акций (раннее бронирование, длительное проживание, кешбэк и т.д.).
        На основе анализа предложи 3-5 конкретных промо-акций для повышения нашей загрузки, учитывая их слабые места или наши преимущества. 
        Ответ дай строго в формате JSON с полями "analysis" (подробный текст анализа конкурентов с названиями и фишками) и "proposals" (текст ваших предложений).`,
        config: {
          tools: [{ googleSearch: {} }],
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              analysis: { type: Type.STRING, description: "Текст анализа конкурентов" },
              proposals: { type: Type.STRING, description: "Текст предложений по акциям" }
            },
            required: ["analysis", "proposals"]
          }
        }
      });

      const data = JSON.parse(response.text || '{}');
      if (data.analysis) setCompetitorAnalysis(data.analysis);
      if (data.proposals) setPromoProposals(data.proposals);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      alert("Не удалось провести авто-анализ. Проверьте подключение или попробуйте позже.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const totals = useMemo(() => {
    let totalRev = 0;
    let totalRN = 0;
    let totalBedDays = 0;
    const byRoomPlan = { standard: 0, comfort: 0, lux: 0 };
    const byPkgPlan = { aqua_bb: 0, aqua_hb: 0, aqua_fb: 0, ultra: 0, spa: 0, med: 0, promo: 0 };

    const monthResults = MONTHS.map((m, mIdx) => {
      let mRev = 0;
      let mRN = 0;
      let mBedDays = 0;
      let mCheckIns = 0;
      let mMedBedDays = 0;
      
      let mRevFact = 0;
      let mRNFact = 0;
      let mBedDaysFact = 0;
      let mCheckInsFact = 0;
      let mMedBedDaysFact = 0;
      let mInternalMedRev = 0;
      let mMedAddonRev = 0;
      let mMedAddonGuests = 0;
      
      let mFoodCost = 0;
      
      m.distribution.forEach(dist => {
        const sIdx = dist.sIdx;
        const s = seasons[sIdx];
        const data = seasonData[sIdx];

        // Medical Addon calculation (Algorithm: max 5% conversion, 500 rub check)
        const convRate = medAddonConfig.maxConversion;
        
        ROOM_TYPES.forEach(rt => {
          const roomCount = rooms[rt.key as keyof typeof rooms] || 0;
          const occPlanBase = roomMonthlyData[mIdx][rt.key].plan;
          const occPlan = Math.min(100, Math.max(0, occPlanBase + globalOccAdj));
          const occFact = roomMonthlyData[mIdx][rt.key].fact || 0;
          
          const rn = roomCount * dist.days * (occPlan / 100);
          const rnFact = roomCount * dist.days * (occFact / 100);
          
          mRN += rn;
          mRNFact += rnFact;
          
          const bd = rn * data.guests;
          const bdFact = rnFact * data.guests;
          
          mBedDays += bd;
          mBedDaysFact += bdFact;
          
          PACKAGES.forEach(pk => {
            let mix = pkgMix[pk.key as keyof typeof pkgMix] / 100;
            if (pk.key === 'promo' && !s.isLow) mix = 0;

            const basePrice = prices[rt.key][pk.key][sIdx];
            const price = basePrice * (1 + globalPriceAdj / 100);
            
            const rev = rn * mix * data.guests * price;
            const revFact = rnFact * mix * data.guests * price;
            
            mRev += rev;
            mRevFact += revFact;
            
            const pkgBD = bd * mix;
            const pkgBDFact = bdFact * mix;
            
            mCheckIns += pkgBD / (pk.alos || 1);
            mCheckInsFact += pkgBDFact / (pk.alos || 1);
            
            if (pk.key === 'med') {
              mMedBedDays += pkgBD;
              mMedBedDaysFact += pkgBDFact;
            }

            // --- Precise Food Cost Calculation ---
            let foodPct = 0;
            if (['spa', 'ultra'].includes(pk.key)) foodPct = calcConfig.fb_ultra_spa.food;
            else if (pk.key === 'med') foodPct = calcConfig.ultra_med.food;
            else if (pk.key === 'aqua_fb') foodPct = 50; // Default for FB
            else if (pk.key === 'aqua_hb') foodPct = 35; // Default for HB
            else if (pk.key === 'aqua_bb') foodPct = 20; // Default for BB

            const pkgFoodRev = rev * (foodPct / 100);
            mFoodCost += pkgFoodRev * (costConfig.foodCostPct / 100);

            // Internal Medical Revenue Component
            let medPct = 0;
            if (pk.key === 'med') medPct = calcConfig.ultra_med.med;
            else if (['aqua_fb', 'ultra', 'spa', 'promo'].includes(pk.key)) medPct = calcConfig.fb_ultra_spa.med;
            else medPct = calcConfig.others.med;
            mInternalMedRev += rev * (medPct / 100);

            byRoomPlan[rt.key as keyof typeof byRoomPlan] += rev;
            byPkgPlan[pk.key as keyof typeof byPkgPlan] += rev;
          });

          // Medical Addon: calculated ONCE per room type per period (not per package)
          // Applies to all guests regardless of package type
          const addonGuests = bd * (convRate / 100);
          mMedAddonGuests += addonGuests;
          mMedAddonRev += addonGuests * medAddonConfig.avgCheck;
        });
      });

      const totalPossibleRN = (Object.values(rooms) as number[]).reduce((a: number, b: number) => a + b, 0) * m.days;
      const mAvgOcc = (mRN / totalPossibleRN) * 100;
      const mAvgOccFact = (mRNFact / totalPossibleRN) * 100;

      totalRev += mRev;
      totalRN += mRN;
      totalBedDays += mBedDays;

      // Use segment fact revenue if available
      const mSegFactRev = (Object.values(segmentData[mIdx]) as any[]).reduce((acc: number, seg: any) => acc + (seg.revFact || 0), 0);
      const mFinalRevFact = mSegFactRev > 0 ? mSegFactRev : mRevFact;
      const mForecastRev = mFinalRevFact > 0 ? mFinalRevFact : mRev;

      // --- Dynamic Cost & GOP Calculation ---
      const mTotalRevForGOP = mRev + mMedAddonRev;
      
      // 1. Food Cost (already calculated precisely in loop)
      
      // 2. Commissions (only on OTA segment share)
      const mComm = mRev * (segmentData[mIdx].ota.plan / 100) * (costConfig.commissionPct / 100);
      
      // 3. Other Variable Costs
      const mOtherVC = mRev * (costConfig.otherVCPct / 100);
      
      // 4. Fixed Costs (ФОТ + расширенная модель расходов)
      const mExpenseModel = Object.values(expenseModel).reduce((a: number, b: number) => a + b, 0);
      const mFixed = costConfig.staffingMonthly + mExpenseModel;

      const mTotalCosts = mFoodCost + mComm + mOtherVC + mFixed;
      const mGOP = mTotalRevForGOP - mTotalCosts;
      const mGOPMargin = mTotalRevForGOP > 0 ? (mGOP / mTotalRevForGOP) * 100 : 0;

      // --- Key Performance Indicators (KPIs) ---
      const mADR = mRN > 0 ? mRev / mRN : 0;
      const mRevPAR = totalPossibleRN > 0 ? mRev / totalPossibleRN : 0;
      const mTRevPAR = totalPossibleRN > 0 ? mTotalRevForGOP / totalPossibleRN : 0;
      
      // Break-even Occupancy (approximate)
      const mVarCostPerRN = mRN > 0 ? (mFoodCost + mComm + mOtherVC) / mRN : 0;
      const mBreakEvenOcc = (mADR - mVarCostPerRN) > 0 ? (mFixed / (mADR - mVarCostPerRN)) / totalPossibleRN * 100 : 0;

      // --- Medical Addons (already calculated in distribution loop) ---
      const mMedAddonProcs = mMedAddonGuests * medAddonConfig.procsPerGuest;

      return { 
        mRev, mRN, mBedDays, mAvgOcc, mCheckIns, mMedBedDays,
        mRevFact: mFinalRevFact, mRNFact, mBedDaysFact, mAvgOccFact, mCheckInsFact, mMedBedDaysFact,
        mForecastRev,
        mGOP, mTotalCosts, mGOPMargin, mFoodCost, mComm,
        mMedAddonRev, mMedAddonGuests, mMedAddonProcs,
        mInternalMedRev,
        mADR, mRevPAR, mTRevPAR, mBreakEvenOcc
      };
    });

    const totalForecastRev = monthResults.reduce((acc, m) => acc + m.mForecastRev, 0);
    const totalMedAddonRev = monthResults.reduce((acc, m) => acc + m.mMedAddonRev, 0);
    const totalInternalMedRev = monthResults.reduce((acc, m) => acc + m.mInternalMedRev, 0);
    const totalRoomRev = totalRev; // Full revenue from room sales (includes packages)
    const totalBudget = totalRoomRev + totalMedAddonRev; // Total = Rooms + Paid Medical Addons
    const totalFullMedRev = totalInternalMedRev + totalMedAddonRev; // For informational purposes only

    const totalGOP = monthResults.reduce((acc, m) => acc + m.mGOP, 0);
    const totalCosts = monthResults.reduce((acc, m) => acc + m.mTotalCosts, 0);
    const totalGOPMargin = totalBudget > 0 ? (totalGOP / totalBudget) * 100 : 0;

    const totalPossibleRNYear = (Object.values(rooms) as number[]).reduce((a: number, b: number) => a + b, 0) * MONTHS.reduce((a: number, b: any) => a + b.days, 0);
    const totalADR = totalRN > 0 ? totalRev / totalRN : 0;
    const totalRevPAR = totalPossibleRNYear > 0 ? totalRev / totalPossibleRNYear : 0;
    const totalTRevPAR = totalPossibleRNYear > 0 ? totalBudget / totalPossibleRNYear : 0;

    const totalAvgOcc = (totalRN / totalPossibleRNYear) * 100;

    const seasonResults = seasons.map((_, sIdx) => {
      let sRev = 0;
      let sRN = 0;
      let sBedDays = 0;
      
      // We need to sum up contributions to this season across all months
      MONTHS.forEach((m, mIdx) => {
        m.distribution.forEach(dist => {
          if (dist.sIdx === sIdx) {
            ROOM_TYPES.forEach(rt => {
              const roomCount = rooms[rt.key as keyof typeof rooms] || 0;
              const occPlan = roomMonthlyData[mIdx][rt.key].plan;
              const rn = roomCount * dist.days * (occPlan / 100);
              sRN += rn;
              sBedDays += rn * seasonData[sIdx].guests;
              
              PACKAGES.forEach(pk => {
                let mix = pkgMix[pk.key as keyof typeof pkgMix] / 100;
                if (pk.key === 'promo' && !seasons[sIdx].isLow) mix = 0;
                const price = prices[rt.key][pk.key][sIdx];
                sRev += rn * mix * seasonData[sIdx].guests * price;
              });
            });
          }
        });
      });
      return { sRev, sRN, sBedDays };
    });

    return { 
      totalRev, totalRN, totalBedDays, monthResults, seasonResults, 
      byRoomPlan, byPkgPlan, totalForecastRev, totalAvgOcc,
      totalGOP, totalCosts, totalGOPMargin, totalMedAddonRev,
      totalInternalMedRev, totalFullMedRev, totalRoomRev, totalBudget,
      totalADR, totalRevPAR, totalTRevPAR
    };
  }, [rooms, pkgMix, prices, seasonData, roomMonthlyData, segmentData, costConfig, calcConfig, medAddonConfig, seasons, expenseModel]);

  const formatMln = (val: number) => (val / 1000000).toFixed(1) + ' млн ₽';

  const handlePriceChange = (rtKey: string, pkKey: string, sIdx: number, val: string) => {
    const newVal = parseInt(val) || 0;
    setPrices(prev => {
      const updated = {
        ...prev,
        [rtKey]: {
          ...prev[rtKey],
          [pkKey]: prev[rtKey][pkKey].map((p: number, i: number) => i === sIdx ? newVal : p)
        }
      };
      
      // If the changed package is the base for promo, update promo too
      if (pkKey === promoBasePkg) {
        updated[rtKey].promo = updated[rtKey][promoBasePkg].map((basePrice: number, i: number) => 
          seasons[i].isLow ? Math.round(basePrice * (1 - promoDiscount / 100)) : 0
        );
      }
      
      return updated;
    });
  };

  useEffect(() => {
    setPrices(prev => {
      const updated = { ...prev };
      ROOM_TYPES.forEach(rt => {
        updated[rt.key].promo = updated[rt.key][promoBasePkg].map((basePrice: number, i: number) => 
          seasons[i].isLow ? Math.round(basePrice * (1 - promoDiscount / 100)) : 0
        );
      });
      return updated;
    });
  }, [promoBasePkg, promoDiscount]);

  const handleSeasonPeriodChange = (idx: number, field: string, val: any) => {
    setSeasons(prev => prev.map((s, i) => i === idx ? { ...s, [field]: field === 'days' ? (parseInt(val) || 0) : val } : s));
  };

  const handleSeasonChange = (idx: number, field: string, val: string) => {
    const newVal = parseFloat(val) || 0;
    setSeasonData(prev => prev.map((s, i) => i === idx ? { ...s, [field]: newVal } : s));
  };

  const handleSegmentChange = (mIdx: number, segKey: string, field: 'plan' | 'fact' | 'revFact', val: string) => {
    const newVal = parseFloat(val) || 0;
    setSegmentData(prev => prev.map((m, i) => i === mIdx ? {
      ...m,
      [segKey]: { ...m[segKey as keyof typeof m], [field]: newVal }
    } : m));
  };

  const handleRoomFactChange = (key: string, field: 'occ' | 'rev', val: string) => {
    const newVal = parseFloat(val) || 0;
    setRoomFact(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof roomFact], [field]: newVal } }));
  };

  const handleRoomMonthlyChange = (mIdx: number, rtKey: string, field: 'plan' | 'fact', val: string) => {
    const newVal = parseFloat(val) || 0;
    setRoomMonthlyData(prev => prev.map((m, i) => i === mIdx ? {
      ...m,
      [rtKey]: { ...m[rtKey as keyof typeof m], [field]: newVal }
    } : m));
  };

  const handlePkgFactChange = (key: string, field: 'share' | 'rev', val: string) => {
    const newVal = parseFloat(val) || 0;
    setPkgFact(prev => ({ ...prev, [key]: { ...prev[key as keyof typeof pkgFact], [field]: newVal } }));
  };

  const generateFinanceReportXLSX = () => {
    const wb = XLSX.utils.book_new();
    
    const monthNames = ["Январь", "Февраль", "Март", "Апрель", "Май", "Июнь", "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь"];
    const header = ["Показатель", ...monthNames, "ИТОГО"];
    
    const rows: any[][] = [header];
    
    const totalRooms = (Object.values(rooms) as number[]).reduce((a, b) => a + b, 0);
    
    const row1: any[] = ["1. Количество номеров"];
    const row2: any[] = ["2. Количество дней месяца"];
    const row3: any[] = ["3. Номеро-ночи - 100%"];
    const row4: any[] = ["4. Загрузка, %"];
    const row5: any[] = ["5. Коэффициент подселения"];
    const row6: any[] = ["6. Койко-дни - план"];
    const row7: any[] = ["7. Номеро-ночи - план"];
    const rowADR: any[] = ["8. ADR (Средняя цена номера)"];
    const rowRevPAR: any[] = ["9. RevPAR (Доход на номер)"];
    
    const getMonthData = (mName: string) => {
      const idx = MONTHS.findIndex(m => m.name === mName);
      if (idx === -1) return null;
      return totals.monthResults[idx];
    };

    const getMonthDays = (mName: string) => {
      const idx = MONTHS.findIndex(m => m.name === mName);
      if (idx === -1) {
        if (mName === "Январь") return 31;
        if (mName === "Февраль") return 28;
        return 0;
      }
      return MONTHS[idx].days;
    };

    monthNames.forEach(mName => {
      const mData = getMonthData(mName);
      const days = getMonthDays(mName);
      const possibleRN = totalRooms * days;
      
      row1.push(totalRooms);
      row2.push(days);
      row3.push(possibleRN);
      
      if (mData) {
        row4.push(mData.mAvgOcc.toFixed(1));
        const guestCoeff = mData.mRN > 0 ? mData.mBedDays / mData.mRN : 0;
        row5.push(guestCoeff.toFixed(2));
        row6.push(Math.round(mData.mBedDays));
        row7.push(Math.round(mData.mRN));
        rowADR.push(Math.round(mData.mADR));
        rowRevPAR.push(Math.round(mData.mRevPAR));
      } else {
        row4.push("0");
        row5.push("0");
        row6.push(0);
        row7.push(0);
        rowADR.push(0);
        rowRevPAR.push(0);
      }
    });
    
    row1.push(totalRooms);
    row2.push(MONTHS.reduce((a, b) => a + b.days, 0));
    row3.push(totals.totalPossibleRNYear || 0);
    row4.push(totals.totalAvgOcc.toFixed(1));
    row5.push(totals.totalRN > 0 ? (totals.totalBedDays / totals.totalRN).toFixed(2) : "0");
    row6.push(Math.round(totals.totalBedDays));
    row7.push(Math.round(totals.totalRN));
    rowADR.push(Math.round(totals.totalADR));
    rowRevPAR.push(Math.round(totals.totalRevPAR));
    
    rows.push(row1, row2, row3, row4, row5, row6, row7, rowADR, rowRevPAR);
    
    const segments = [
      { key: 'direct', label: 'Частный рынок (прямые продажи)' },
      { key: 'to', label: 'Туроператоры' },
      { key: 'fss', label: 'Соцстрах / ФСС' },
      { key: 'corp', label: 'Корпоративный сегмент' },
      { key: 'ota', label: 'OTA (Online Travel Agencies)' }
    ];
    
    segments.forEach((seg, sIdx) => {
      rows.push([]); 
      rows.push([`Раздел ${sIdx + 2}: ${seg.label}`]);
      
      const sRow8: any[] = ["8. Загрузка, %"];
      const sRow9: any[] = ["9. Номеро-ночи"];
      const sRow10: any[] = ["10. Койко-дни"];
      const sRow11: any[] = ["11. Средняя цена к-дня, руб."];
      const sRow12: any[] = ["12. Средняя цена номера, руб."];
      const sRow12a: any[] = ["12a. Net ADR (за вычетом комиссий)"];
      const sRow13: any[] = ["13. Доход по сегменту, руб."];
      
      let totalSegRev = 0;
      let totalSegRN = 0;
      let totalSegBD = 0;
      let totalSegComm = 0;

      monthNames.forEach((mName) => {
        const mIdx = MONTHS.findIndex(m => m.name === mName);
        const mData = mIdx !== -1 ? totals.monthResults[mIdx] : null;
        const sData = mIdx !== -1 ? segmentData[mIdx][seg.key as keyof typeof segmentData[0]] : null;
        
        if (mData && sData) {
          const share = sData.plan / 100;
          const segRev = mData.mRev * share;
          const segRN = mData.mRN * share;
          const segBD = mData.mBedDays * share;
          const segComm = seg.key === 'ota' ? segRev * (costConfig.commissionPct / 100) : 0;
          
          sRow8.push(sData.plan);
          sRow9.push(Math.round(segRN));
          sRow10.push(Math.round(segBD));
          sRow11.push(segBD > 0 ? Math.round(segRev / segBD) : 0);
          sRow12.push(segRN > 0 ? Math.round(segRev / segRN) : 0);
          sRow12a.push(segRN > 0 ? Math.round((segRev - segComm) / segRN) : 0);
          sRow13.push(Math.round(segRev));
          
          totalSegRev += segRev;
          totalSegRN += segRN;
          totalSegBD += segBD;
          totalSegComm += segComm;
        } else {
          sRow8.push(0);
          sRow9.push(0);
          sRow10.push(0);
          sRow11.push(0);
          sRow12.push(0);
          sRow12a.push(0);
          sRow13.push(0);
        }
      });
      
      const avgShare = totals.totalRN > 0 ? (totalSegRN / totals.totalRN * 100) : 0;
      sRow8.push(avgShare.toFixed(1));
      sRow9.push(Math.round(totalSegRN));
      sRow10.push(Math.round(totalSegBD));
      sRow11.push(totalSegBD > 0 ? Math.round(totalSegRev / totalSegBD) : 0);
      sRow12.push(totalSegRN > 0 ? Math.round(totalSegRev / totalSegRN) : 0);
      sRow12a.push(totalSegRN > 0 ? Math.round((totalSegRev - totalSegComm) / totalSegRN) : 0);
      sRow13.push(Math.round(totalSegRev));
      
      rows.push(sRow8, sRow9, sRow10, sRow11, sRow12, sRow12a, sRow13);
    });
    
    // --- Summary Section at the bottom ---
    rows.push([]);
    rows.push(["ИТОГОВЫЕ ПОКАЗАТЕЛИ ЗА ГОД"]);
    
    const summaryRow1: any[] = ["Общий доход (Rooms + Medicine)", ...monthNames.map(mName => {
      const idx = MONTHS.findIndex(m => m.name === mName);
      return idx !== -1 ? Math.round(totals.monthResults[idx].mRev + totals.monthResults[idx].mMedAddonRev) : 0;
    }), Math.round(totals.totalBudget)];

    const summaryRow1a: any[] = ["- в т.ч. Доход от проживания", ...monthNames.map(mName => {
      const idx = MONTHS.findIndex(m => m.name === mName);
      return idx !== -1 ? Math.round(totals.monthResults[idx].mRev) : 0;
    }), Math.round(totals.totalRoomRev)];

    const summaryRow1b: any[] = ["- в т.ч. Доп. доход Медицина", ...monthNames.map(mName => {
      const idx = MONTHS.findIndex(m => m.name === mName);
      return idx !== -1 ? Math.round(totals.monthResults[idx].mMedAddonRev) : 0;
    }), Math.round(totals.totalMedAddonRev)];
    
    const summaryRow2: any[] = ["Операционные расходы (OPEX)", ...monthNames.map(mName => {
      const idx = MONTHS.findIndex(m => m.name === mName);
      return idx !== -1 ? Math.round(totals.monthResults[idx].mTotalCosts) : 0;
    }), Math.round(totals.totalCosts)];
    
    const summaryRow2a: any[] = ["- в т.ч. Питание (Cost of Food)", ...monthNames.map(mName => {
      const idx = MONTHS.findIndex(m => m.name === mName);
      return idx !== -1 ? Math.round(totals.monthResults[idx].mFoodCost) : 0;
    }), Math.round(totals.monthResults.reduce((a, b) => a + b.mFoodCost, 0))];

    const summaryRow2b: any[] = ["- в т.ч. Комиссии OTA", ...monthNames.map(mName => {
      const idx = MONTHS.findIndex(m => m.name === mName);
      return idx !== -1 ? Math.round(totals.monthResults[idx].mComm) : 0;
    }), Math.round(totals.monthResults.reduce((a, b) => a + b.mComm, 0))];

    const summaryRow2c: any[] = ["- в т.ч. ФОТ (фикс.)", ...monthNames.map(() => Math.round(costConfig.staffingMonthly)), Math.round(costConfig.staffingMonthly * 12)];

    const expenseLabels: Record<string, string> = {
      utilities: 'Коммунальные услуги', maintenance: 'Содержание и ремонт',
      marketing: 'Маркетинг и реклама', admin: 'Административные расходы',
      insurance: 'Страхование', lease: 'Аренда / лизинг',
      security: 'Охрана и безопасность', it: 'IT и телекоммуникации',
      laundry: 'Прачечная (внешняя)', other: 'Прочие постоянные',
    };
    const expenseRows: any[][] = Object.entries(expenseModel)
      .filter(([, v]) => v > 0)
      .map(([k, v]) => [`- в т.ч. ${expenseLabels[k] || k}`, ...monthNames.map(() => Math.round(v)), Math.round(v * 12)]);

    const summaryRow3: any[] = ["Валовая операционная прибыль (GOP)", ...monthNames.map(mName => {
      const idx = MONTHS.findIndex(m => m.name === mName);
      return idx !== -1 ? Math.round(totals.monthResults[idx].mGOP) : 0;
    }), Math.round(totals.totalGOP)];
    
    const summaryRow4: any[] = ["Рентабельность GOP, %", ...monthNames.map(mName => {
      const idx = MONTHS.findIndex(m => m.name === mName);
      return idx !== -1 ? totals.monthResults[idx].mGOPMargin.toFixed(1) : 0;
    }), totals.totalGOPMargin.toFixed(1)];

    const summaryRow5: any[] = ["TRevPAR (Полный доход на номер)", ...monthNames.map(mName => {
      const idx = MONTHS.findIndex(m => m.name === mName);
      return idx !== -1 ? Math.round(totals.monthResults[idx].mTRevPAR) : 0;
    }), Math.round(totals.totalTRevPAR)];

    const summaryRow6: any[] = ["Точка безубыточности (загрузка, %)", ...monthNames.map(mName => {
      const idx = MONTHS.findIndex(m => m.name === mName);
      return idx !== -1 ? totals.monthResults[idx].mBreakEvenOcc.toFixed(1) : 0;
    }), (totals.monthResults.reduce((a, b) => a + b.mBreakEvenOcc, 0) / 12).toFixed(1)];

    rows.push(summaryRow1, summaryRow1a, summaryRow1b, summaryRow2, summaryRow2a, summaryRow2b, summaryRow2c, ...expenseRows, summaryRow3, summaryRow4, summaryRow5, summaryRow6);
    
    const ws = XLSX.utils.aoa_to_sheet(rows);
    XLSX.utils.book_append_sheet(wb, ws, "Финансовый отчет");
    XLSX.writeFile(wb, "Hotel_Sochi_Finance_Report_2026.xlsx");
  };

  const StatCard = ({ label, value, subValue, icon: Icon, color }: any) => (
    <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between h-full">
      <div className="min-w-0 flex-1">
        <p className="text-[10px] md:text-xs font-medium text-slate-500 uppercase tracking-wider truncate">{label}</p>
        <h3 className="text-lg md:text-2xl font-bold mt-1 text-slate-900 truncate">{value}</h3>
        {subValue && <p className="text-[10px] mt-1 text-slate-400 line-clamp-2">{subValue}</p>}
      </div>
      <div className={`p-2 rounded-lg ${color} shrink-0 ml-3`}>
        <Icon size={18} className="text-white md:w-5 md:h-5" />
      </div>
    </div>
  );

  if (!userRole) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center p-4">
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="max-w-md w-full bg-white rounded-2xl shadow-2xl overflow-hidden"
        >
          <div className="p-8">
            <div className="flex justify-center mb-6">
              <div className="bg-indigo-600 p-4 rounded-2xl shadow-lg shadow-indigo-200">
                <TrendingUp size={32} className="text-white" />
              </div>
            </div>
            <h2 className="text-2xl font-bold text-center text-slate-900 mb-2">Авторизация</h2>
            <p className="text-slate-500 text-center text-sm mb-8">Введите ваш персональный код доступа для входа в систему</p>
            
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1.5 ml-1">Код доступа</label>
                <input 
                  type="password"
                  value={accessKey}
                  onChange={(e) => setAccessKey(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full px-4 py-3 rounded-xl border ${showError ? 'border-red-300 bg-red-50' : 'border-slate-200 focus:border-indigo-500'} outline-none transition-all text-center text-lg tracking-widest font-mono`}
                  autoFocus
                />
                {showError && (
                  <p className="text-red-500 text-xs mt-2 text-center font-medium flex items-center justify-center gap-1">
                    <AlertCircle size={14} /> Неверный код доступа
                  </p>
                )}
              </div>
              <button 
                type="submit"
                className="w-full bg-slate-900 hover:bg-slate-800 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-slate-200 flex items-center justify-center gap-2 group"
              >
                Войти в систему
                <TrendingUp size={18} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </form>

            <div className="mt-8 pt-8 border-t border-slate-100 space-y-4">
              <p className="text-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">Или попробуйте демо-версию</p>
              <div className="grid grid-cols-1 gap-3">
                <button 
                  onClick={(e) => handleLogin(e as any, 'DEMO')}
                  className="w-full bg-indigo-50 hover:bg-indigo-100 text-indigo-600 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-indigo-100"
                >
                  <Sparkles size={16} /> Демо-доступ (3 дня)
                </button>
                <button 
                  onClick={() => {
                    setIsSandbox(true);
                    localStorage.setItem('sochi_sandbox', 'true');
                    handleLogin(null as any, 'STAFF');
                  }}
                  className="w-full bg-slate-50 hover:bg-slate-100 text-slate-600 font-bold py-3 rounded-xl transition-all flex items-center justify-center gap-2 text-sm border border-slate-100"
                >
                  <Briefcase size={16} /> Автономный пилот (Sandbox)
                </button>
              </div>
            </div>
          </div>
          <div className="bg-slate-50 p-4 border-t border-slate-100 text-center">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest">Hotel Sochi 2026 · Financial Intelligence</p>
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50">
      <header className="bg-slate-900 text-white p-3 md:p-4 flex items-center justify-between sticky top-0 z-50 shadow-lg">
        <div className="flex items-center gap-2 md:gap-3">
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 hover:bg-slate-800 rounded-lg transition-colors"
          >
            <Layers size={20} />
          </button>
          <div className="bg-indigo-500 p-1.5 md:p-2 rounded-lg shrink-0">
            <TrendingUp size={20} className="md:w-6 md:h-6" />
          </div>
          <div className="min-w-0">
            <h1 className="text-sm md:text-lg font-bold leading-none truncate">Финмодель 2026</h1>
            <div className="flex items-center gap-2 mt-1">
              <p className="text-[8px] md:text-[10px] text-slate-400 uppercase tracking-widest truncate">Сочи · 467 номеров</p>
              {isSandbox && (
                <span className="bg-amber-500/20 text-amber-400 text-[8px] px-1.5 py-0.5 rounded border border-amber-500/30 font-bold uppercase">Sandbox</span>
              )}
              {userRole === 'DEMO' && (
                <span className="bg-indigo-500/20 text-indigo-400 text-[8px] px-1.5 py-0.5 rounded border border-indigo-500/30 font-bold uppercase">Demo</span>
              )}
            </div>
          </div>
        </div>
        <div className="flex items-center gap-2 md:gap-4">
          <div className="text-right hidden lg:block">
            <p className="text-[10px] text-slate-400 uppercase">Общий бюджет</p>
            <p className={`text-lg font-bold ${totals.totalBudget >= TARGET_REVENUE && totals.totalBudget <= MAX_REVENUE ? 'text-emerald-400' : 'text-orange-400'}`}>
              {formatMln(totals.totalBudget)}
            </p>
          </div>
          
          <div className="flex items-center gap-1 md:gap-2">
            {isSyncing && <Loader2 size={16} className="animate-spin text-indigo-400" />}
            <button className="bg-slate-800 hover:bg-slate-700 p-2 rounded-lg transition-colors hidden sm:block" onClick={() => window.print()}>
              <Printer size={18} />
            </button>
            <button className="bg-slate-800 hover:bg-red-900/30 p-2 rounded-lg transition-colors text-slate-400 hover:text-red-400" onClick={handleLogout} title="Выйти">
              <LogOut size={18} />
            </button>
          </div>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden relative">
        {/* Mobile Menu Overlay */}
        <AnimatePresence>
          {isMobileMenuOpen && (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsMobileMenuOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 md:hidden"
            />
          )}
        </AnimatePresence>

        <nav className={`
          fixed md:relative inset-y-0 left-0 w-64 bg-white border-r border-slate-200 flex flex-col py-6 no-print overflow-y-auto z-50 transition-transform duration-300 ease-in-out
          ${isMobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="px-6 mb-6 md:hidden flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Навигация</span>
            <button onClick={() => setIsMobileMenuOpen(false)} className="p-1 hover:bg-slate-100 rounded">
              <LogOut size={16} className="rotate-180" />
            </button>
          </div>

          {[
            {
              title: 'Администрирование',
              roles: ['ADMIN'],
              color: 'text-indigo-600',
              items: [
                { id: 'admin', label: 'Панель управления', icon: Settings },
              ]
            },
            {
              title: 'Продажи и Ресурсы',
              roles: ['ADMIN', 'STAFF', 'OWNER', 'DEMO'],
              color: 'text-emerald-600',
              items: [
                { id: 'pricelist', label: 'Прейскурант', icon: Tag },
                { id: 'settings', label: 'Номерной фонд', icon: Home },
                { id: 'roomOcc', label: 'Загрузка', icon: BarChart3 },
                { id: 'periods', label: 'Сезоны и Периоды', icon: Calendar },
                { id: 'segments', label: 'Сегментация', icon: Users },
              ]
            },
            {
              title: 'Продукт и Модель',
              roles: ['ADMIN', 'STAFF', 'OWNER', 'DEMO'],
              color: 'text-blue-600',
              items: [
                { id: 'dashboard', label: 'Сводная панель', icon: LayoutDashboard, roles: ['ADMIN', 'OWNER', 'DEMO'] },
                { id: 'medicine', label: 'Медицина', icon: Stethoscope, roles: ['ADMIN', 'OWNER', 'DEMO'] },
                { id: 'packages', label: 'Пакетные предложения', icon: Layers },
                { id: 'calculation', label: 'Калькуляция цен', icon: Calculator, roles: ['ADMIN', 'OWNER', 'DEMO'] },
              ]
            },
            {
              title: 'Аналитика и Отчеты',
              roles: ['ADMIN', 'OWNER', 'DEMO'],
              color: 'text-purple-600',
              items: [
                { id: 'report', label: 'Отчет Аналитику', icon: Printer },
                { id: 'marketing', label: 'Аналитик (ИИ)', icon: Sparkles },
                { id: 'kpi', label: 'Операционка (KPI)', icon: Activity },
                { id: 'critical', label: 'Анализ рисков', icon: AlertCircle },
              ]
            },
            {
              title: 'Поддержка',
              roles: ['ADMIN', 'STAFF', 'OWNER', 'DEMO'],
              color: 'text-slate-400',
              items: [
                { id: 'instructions', label: 'Инструкция', icon: BookOpen },
              ]
            }
          ].map((group, gIdx) => {
            const isGroupVisible = group.roles.includes(userRole as UserRole);
            if (!isGroupVisible) return null;

            return (
              <div key={gIdx} className="mb-8">
                <div className="px-6 mb-3 flex items-center gap-2">
                  <div className={`w-1 h-3 rounded-full ${group.color.replace('text-', 'bg-')}`} />
                  <p className={`text-[10px] font-bold uppercase tracking-widest ${group.color}`}>{group.title}</p>
                </div>
                <div className="space-y-1">
                  {group.items.filter(item => !item.roles || item.roles.includes(userRole as UserRole)).map((item) => (
                    <button
                      key={item.id}
                      onClick={() => {
                        setActiveTab(item.id);
                        setIsMobileMenuOpen(false);
                      }}
                      className={`w-full flex items-center gap-3 px-6 py-2.5 transition-all relative group ${
                        activeTab === item.id 
                        ? 'text-indigo-600 bg-indigo-50/50 font-semibold' 
                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                      }`}
                    >
                      <item.icon size={18} className={`${activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'}`} />
                      <span className="text-sm">{item.label}</span>
                      {activeTab === item.id && (
                        <motion.div 
                          layoutId="activeTabIndicator" 
                          className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r-full" 
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            );
          })}

          <div className="mt-auto px-4 pt-4 border-t border-slate-100">
            <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Режим работы</span>
                  <span className={`text-[11px] font-bold ${isSandbox ? 'text-amber-600' : 'text-indigo-600'}`}>
                    {isSandbox ? 'Sandbox (Автоном)' : 'Shared (Общий)'}
                  </span>
                </div>
                <button 
                  onClick={toggleSandbox}
                  className={`w-10 h-5 rounded-full transition-all relative flex items-center ${isSandbox ? 'bg-amber-500' : 'bg-indigo-500'}`}
                >
                  <motion.div 
                    animate={{ x: isSandbox ? 20 : 2 }}
                    className="w-4 h-4 bg-white rounded-full shadow-sm"
                  />
                </button>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                <div className="flex flex-col">
                  <span className="text-[9px] font-bold text-slate-400 uppercase tracking-tighter">Ваша роль</span>
                  <span className="text-[11px] font-bold text-slate-700">
                    {userRole === 'ADMIN' ? 'Администратор' : userRole === 'OWNER' ? 'Аналитик' : userRole === 'DEMO' ? 'Демо-пользователь' : 'Персонал'}
                  </span>
                </div>
                {userRole === 'ADMIN' && (
                  <button 
                    onClick={() => setIsAdmin(!isAdmin)}
                    className={`w-8 h-4 rounded-full transition-all relative flex items-center ${isAdmin ? 'bg-emerald-500' : 'bg-slate-300'}`}
                  >
                    <motion.div 
                      animate={{ x: isAdmin ? 16 : 2 }}
                      className="w-3 h-3 bg-white rounded-full shadow-sm"
                    />
                  </button>
                )}
              </div>
              
              {userRole === 'DEMO' && (
                <div className="pt-2 border-t border-slate-200">
                  <p className="text-[9px] text-slate-400 uppercase font-bold mb-1">Истекает через</p>
                  <div className="w-full bg-slate-200 h-1 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: '100%' }}
                      animate={{ 
                        width: `${Math.max(0, 100 - ((Date.now() - parseInt(localStorage.getItem('sochi_demo_start') || '0')) / (3 * 24 * 60 * 60 * 1000) * 100))}%` 
                      }}
                      className="bg-indigo-500 h-full"
                    />
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <main className="flex-1 min-w-0 overflow-y-auto p-3 md:p-8 space-y-6 md:space-y-8">
          
          {userRole !== 'STAFF' && (
            <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-6 gap-3 md:gap-4">
              <StatCard 
                label="Общий Бюджет" 
                value={formatMln(totals.totalBudget)} 
                subValue={`Номера: ${formatMln(totals.totalRoomRev)} + МЦ: ${formatMln(totals.totalMedAddonRev)}`}
                icon={TrendingUp}
                color="bg-slate-900"
              />
              <StatCard 
                label="Доход отеля" 
                value={formatMln(totals.totalRoomRev)} 
                subValue="Включая мед. пакеты"
                icon={LayoutDashboard}
                color="bg-indigo-500"
              />
              <StatCard 
                label="Доход МЦ" 
                value={formatMln(totals.totalMedAddonRev)} 
                subValue="Доп. услуги (Add-ons)"
                icon={Activity}
                color="bg-orange-500"
              />
              <StatCard 
                label="GOP (Прибыль)" 
                value={formatMln(totals.totalGOP)} 
                subValue={`Маржа: ${totals.totalGOPMargin.toFixed(1)}%`}
                icon={Target}
                color="bg-emerald-600"
              />
              <StatCard 
                label="Номеро-ночи" 
                value={Math.round(totals.totalRN).toLocaleString()} 
                subValue="План на период"
                icon={Calendar}
                color="bg-blue-500"
              />
              <StatCard 
                label="Койко-дни" 
                value={Math.round(totals.totalBedDays).toLocaleString()} 
                subValue="Гости × Ночи"
                icon={Users}
                color="bg-purple-500"
              />
            </div>
          )}

          <AnimatePresence mode="wait">
            {activeTab === 'admin' && userRole === 'ADMIN' && (
              <motion.div 
                key="admin"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-8">
                    <div>
                      <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
                        <Settings className="text-indigo-600" /> Панель управления параметрами
                      </h2>
                      <p className="text-sm text-slate-500 mt-1">Централизованная настройка всех рычагов финансовой модели</p>
                    </div>
                    <button 
                      onClick={() => {
                        setGlobalPriceAdj(0);
                        setGlobalOccAdj(0);
                        setCostConfig({
                          foodCostPct: 30,
                          staffingMonthly: 15000000,
                          commissionPct: 15,
                          otherVCPct: 10,
                          medCapacity: 4500,
                        });
                      }}
                      className="text-xs font-bold text-indigo-600 hover:text-indigo-700 flex items-center gap-1 bg-indigo-50 px-3 py-2 rounded-lg transition-colors"
                    >
                      <RefreshCw size={14} /> Сбросить всё
                    </button>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Глобальные рычаги */}
                    <div className="space-y-8">
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-100">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                          <Sliders size={16} /> Глобальные рычаги (Stress Test)
                        </h3>
                        
                        <div className="space-y-8">
                          <div className="space-y-4">
                            <div className="flex justify-between items-end">
                              <label className="text-sm font-bold text-slate-700">Корректировка цен (ADR)</label>
                              <span className={`text-lg font-black ${globalPriceAdj > 0 ? 'text-emerald-600' : globalPriceAdj < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                {globalPriceAdj > 0 ? '+' : ''}{globalPriceAdj}%
                              </span>
                            </div>
                            <input 
                              type="range" min="-20" max="50" step="1" 
                              value={globalPriceAdj} 
                              onChange={(e) => setGlobalPriceAdj(parseInt(e.target.value))}
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                              <span>-20% (Демпинг)</span>
                              <span>0% (База)</span>
                              <span>+50% (Пик спроса)</span>
                            </div>
                          </div>

                          <div className="space-y-4">
                            <div className="flex justify-between items-end">
                              <label className="text-sm font-bold text-slate-700">Корректировка загрузки (Occ)</label>
                              <span className={`text-lg font-black ${globalOccAdj > 0 ? 'text-emerald-600' : globalOccAdj < 0 ? 'text-red-600' : 'text-slate-400'}`}>
                                {globalOccAdj > 0 ? '+' : ''}{globalOccAdj}%
                              </span>
                            </div>
                            <input 
                              type="range" min="-20" max="20" step="1" 
                              value={globalOccAdj} 
                              onChange={(e) => setGlobalOccAdj(parseInt(e.target.value))}
                              className="w-full h-2 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                            />
                            <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase">
                              <span>-20% (Кризис)</span>
                              <span>0% (План)</span>
                              <span>+20% (Аншлаг)</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                          <DollarSign size={16} /> Операционные расходы (OPEX)
                        </h3>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Food Cost % (от выручки еды)</label>
                            <div className="flex items-center gap-3">
                              <input 
                                type="number" 
                                value={costConfig.foodCostPct} 
                                onChange={(e) => setCostConfig(prev => ({ ...prev, foodCostPct: parseInt(e.target.value) || 0 }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                              <Percent size={14} className="text-slate-300" />
                            </div>
                          </div>
                          <div className="space-y-2">
                            <label className="text-[10px] uppercase font-bold text-slate-500">Комиссия OTA % (средняя)</label>
                            <div className="flex items-center gap-3">
                              <input 
                                type="number" 
                                value={costConfig.commissionPct} 
                                onChange={(e) => setCostConfig(prev => ({ ...prev, commissionPct: parseInt(e.target.value) || 0 }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                              <Percent size={14} className="text-slate-300" />
                            </div>
                          </div>
                          <div className="space-y-2 col-span-2">
                            <label className="text-[10px] uppercase font-bold text-slate-500">ФОТ (Фиксированный, млн ₽ / мес)</label>
                            <div className="flex items-center gap-3">
                              <input 
                                type="number" 
                                value={costConfig.staffingMonthly / 1000000} 
                                onChange={(e) => setCostConfig(prev => ({ ...prev, staffingMonthly: (parseFloat(e.target.value) || 0) * 1000000 }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-indigo-600 focus:ring-2 focus:ring-indigo-500 outline-none"
                              />
                              <span className="text-xs font-bold text-slate-300">₽</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Расширенная модель расходов */}
                      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                        <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-2 flex items-center gap-2">
                          <DollarSign size={16} /> Модель постоянных расходов (₽ / мес)
                        </h3>
                        <p className="text-[10px] text-slate-400 mb-6">Вносите фактические или плановые суммы. 0 = статья не учитывается в P&L.</p>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          {([
                            { key: 'utilities', label: 'Коммунальные услуги', hint: 'Электро, вода, газ, тепло' },
                            { key: 'maintenance', label: 'Содержание и ремонт', hint: 'Текущий ремонт, эксплуатация' },
                            { key: 'marketing', label: 'Маркетинг и реклама', hint: 'Продвижение, реклама, PR' },
                            { key: 'admin', label: 'Административные расходы', hint: 'Офис, канцелярия, юрист, бухгалтерия' },
                            { key: 'insurance', label: 'Страхование', hint: 'Имущество, ответственность' },
                            { key: 'lease', label: 'Аренда / лизинг', hint: 'Оборудование, спецтехника' },
                            { key: 'security', label: 'Охрана и безопасность', hint: 'ЧОП, видеонаблюдение' },
                            { key: 'it', label: 'IT и телекоммуникации', hint: 'ПО, интернет, телефония, PMS' },
                            { key: 'laundry', label: 'Прачечная (внешняя)', hint: 'Если аутсорсинг' },
                            { key: 'other', label: 'Прочие постоянные', hint: 'Иные фиксированные затраты' },
                          ] as { key: keyof typeof expenseModel; label: string; hint: string }[]).map(({ key, label, hint }) => (
                            <div key={key} className="space-y-1">
                              <label className="text-[10px] uppercase font-bold text-slate-500">{label}</label>
                              <p className="text-[9px] text-slate-400">{hint}</p>
                              <input
                                type="number"
                                step="100000"
                                value={expenseModel[key] || ''}
                                placeholder="0"
                                onChange={(e) => setExpenseModel(prev => ({ ...prev, [key]: parseFloat(e.target.value) || 0 }))}
                                className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 font-bold text-slate-700 focus:ring-2 focus:ring-indigo-500 outline-none text-sm"
                              />
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-slate-100 flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-bold uppercase">Итого постоянных (без ФОТ) / мес:</span>
                          <span className="text-lg font-black text-slate-900">
                            {(Object.values(expenseModel).reduce((a, b) => a + b, 0) / 1000000).toFixed(2)} млн ₽
                          </span>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-bold uppercase">Итого всех постоянных (с ФОТ) / мес:</span>
                          <span className="text-lg font-black text-indigo-700">
                            {((Object.values(expenseModel).reduce((a, b) => a + b, 0) + costConfig.staffingMonthly) / 1000000).toFixed(2)} млн ₽
                          </span>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-bold uppercase">Итого всех постоянных / год:</span>
                          <span className="text-xl font-black text-indigo-900">
                            {(((Object.values(expenseModel).reduce((a, b) => a + b, 0) + costConfig.staffingMonthly) * 12) / 1000000).toFixed(1)} млн ₽
                          </span>
                        </div>
                      </div>

                      {/* Управление прибылью */}
                      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 text-white shadow-xl">
                        <h3 className="text-sm font-black uppercase tracking-widest text-indigo-400 mb-6 flex items-center gap-2">
                          <Target size={16} /> Управление прибылью (Target Profit)
                        </h3>
                        
                        <div className="space-y-6">
                          <div className="space-y-4">
                            <div className="flex justify-between items-end">
                              <label className="text-sm font-bold text-slate-300">Целевая маржа GOP %</label>
                              <span className="text-2xl font-black text-emerald-400">
                                {targetGOPMargin}%
                              </span>
                            </div>
                            <input 
                              type="range" min="10" max="60" step="1" 
                              value={targetGOPMargin} 
                              onChange={(e) => setTargetGOPMargin(parseInt(e.target.value))}
                              className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                            />
                            <div className="flex justify-between text-[10px] text-slate-500 font-bold uppercase">
                              <span>10% (Минимум)</span>
                              <span>40% (Норма)</span>
                              <span>60% (Максимум)</span>
                            </div>
                          </div>

                          <div className="p-4 bg-slate-800/50 rounded-lg border border-slate-700 space-y-4">
                            <div className="flex items-center gap-2 text-xs font-bold text-slate-400 uppercase tracking-wider">
                              <Sparkles size={14} className="text-indigo-400" /> Рекомендации модели
                            </div>
                            
                            {Math.abs(totals.totalGOPMargin - targetGOPMargin) < 0.5 ? (
                              <div className="text-emerald-400 text-sm font-bold flex items-center gap-2">
                                <Activity size={16} /> Цель достигнута! Текущая маржа: {totals.totalGOPMargin.toFixed(1)}%
                              </div>
                            ) : (
                              <div className="space-y-3">
                                <p className="text-xs text-slate-300">
                                  Текущая маржа: <span className="font-bold text-white">{totals.totalGOPMargin.toFixed(1)}%</span>. 
                                  Разрыв: <span className={`font-bold ${totals.totalGOPMargin < targetGOPMargin ? 'text-red-400' : 'text-emerald-400'}`}>
                                    {(totals.totalGOPMargin - targetGOPMargin).toFixed(1)}%
                                  </span>
                                </p>
                                
                                <div className="space-y-2">
                                  <p className="text-[11px] text-slate-400 leading-relaxed">
                                    Для достижения {targetGOPMargin}% прибыли рекомендуется:
                                  </p>
                                  <ul className="text-xs space-y-2">
                                    <li className="flex items-center gap-2">
                                      <div className="w-1 h-1 rounded-full bg-indigo-400" />
                                      <span>Изменить ADR на <b className="text-white">{((targetGOPMargin - totals.totalGOPMargin) * 1.2).toFixed(1)}%</b></span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <div className="w-1 h-1 rounded-full bg-blue-400" />
                                      <span>ИЛИ Изменить загрузку на <b className="text-white">{((targetGOPMargin - totals.totalGOPMargin) * 1.5).toFixed(1)}%</b></span>
                                    </li>
                                    <li className="flex items-center gap-2">
                                      <div className="w-1 h-1 rounded-full bg-orange-400" />
                                      <span>ИЛИ Снизить OPEX на <b className="text-white">{((targetGOPMargin - totals.totalGOPMargin) * 0.8).toFixed(1)}%</b></span>
                                    </li>
                                  </ul>
                                </div>

                                <div className="flex gap-2 pt-2">
                                  <button 
                                    onClick={() => setGlobalPriceAdj(prev => Math.round(prev + (targetGOPMargin - totals.totalGOPMargin) * 1.2))}
                                    className="flex-1 bg-indigo-600 hover:bg-indigo-500 text-white text-[10px] font-bold py-2 rounded transition-colors"
                                  >
                                    Применить к ADR
                                  </button>
                                  <button 
                                    onClick={() => setGlobalOccAdj(prev => Math.round(prev + (targetGOPMargin - totals.totalGOPMargin) * 1.5))}
                                    className="flex-1 bg-blue-600 hover:bg-blue-500 text-white text-[10px] font-bold py-2 rounded transition-colors"
                                  >
                                    Применить к Occ
                                  </button>
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Аналитика эффекта */}
                    <div className="space-y-6">
                      <div className="bg-indigo-900 text-white p-8 rounded-2xl shadow-xl relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-4 opacity-10">
                          <Target size={120} />
                        </div>
                        <h3 className="text-indigo-300 text-[10px] uppercase font-black tracking-[0.2em] mb-4">Текущий прогноз прибыли</h3>
                        <div className="flex items-end gap-3 mb-2">
                          <span className="text-5xl font-black">{formatMln(totals.totalGOP)}</span>
                          <span className="text-indigo-300 text-sm font-bold mb-2">GOP (Год)</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="flex flex-col">
                            <span className="text-indigo-400 text-[10px] uppercase font-bold">Маржинальность</span>
                            <span className="text-xl font-black">{totals.totalGOPMargin.toFixed(1)}%</span>
                          </div>
                          <div className="w-px h-8 bg-indigo-700" />
                          <div className="flex flex-col">
                            <span className="text-indigo-400 text-[10px] uppercase font-bold">Выручка (Бюджет)</span>
                            <span className="text-xl font-black">{formatMln(totals.totalBudget)}</span>
                          </div>
                        </div>

                        <div className="mt-8 pt-6 border-t border-indigo-800 flex flex-col gap-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-indigo-400">Точка безубыточности (Occ)</span>
                            <span className="font-bold">{((costConfig.staffingMonthly * 12) / (totals.totalRev / totals.totalAvgOcc)).toFixed(1)}%</span>
                          </div>
                          <div className="w-full h-1.5 bg-indigo-950 rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-emerald-400" 
                              style={{ width: `${Math.min(100, (totals.totalAvgOcc / 80) * 100)}%` }} 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-5 rounded-xl border border-slate-200">
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">ADR (Средняя цена)</p>
                          <h4 className="text-xl font-black text-slate-900">
                            {Math.round(totals.totalRev / (totals.totalRN || 1)).toLocaleString()} ₽
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1">С учетом корректировки</p>
                        </div>
                        <div className="bg-white p-5 rounded-xl border border-slate-200">
                          <p className="text-[10px] uppercase font-bold text-slate-400 mb-2">RevPAR</p>
                          <h4 className="text-xl font-black text-slate-900">
                            {Math.round(totals.totalRev / (467 * 304)).toLocaleString()} ₽
                          </h4>
                          <p className="text-[10px] text-slate-400 mt-1">На доступный номер</p>
                        </div>
                      </div>

                      <div className="bg-amber-50 border border-amber-100 p-6 rounded-xl">
                        <h4 className="text-xs font-bold text-amber-800 uppercase mb-3 flex items-center gap-2">
                          <AlertCircle size={14} /> Влияние на прибыль
                        </h4>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-amber-900/70">Изменение цены на 1% дает:</span>
                            <span className="font-bold text-amber-900">~{formatMln(totals.totalRev * 0.01)} прибыли</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-amber-900/70">Изменение загрузки на 1% дает:</span>
                            <span className="font-bold text-amber-900">~{formatMln(totals.totalRev / totals.totalAvgOcc)} прибыли</span>
                          </div>
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-amber-900/70">Снижение ФОТ на 1 млн дает:</span>
                            <span className="font-bold text-emerald-600">+12 млн прибыли / год</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Быстрая настройка микса */}
                <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-2">
                    <Briefcase size={16} /> Структура продаж (Mix)
                  </h3>
                  <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-4">
                    {PACKAGES.map(pk => (
                      <div key={pk.key} className={`p-4 rounded-xl border ${pk.bg} border-transparent hover:border-slate-200 transition-all`}>
                        <p className={`text-[9px] font-black uppercase mb-2 ${pk.color}`}>{pk.short}</p>
                        <div className="flex items-center gap-1">
                          <input 
                            type="number" 
                            value={pkgMix[pk.key as keyof typeof pkgMix]}
                            onChange={(e) => setPkgMix(prev => ({ ...prev, [pk.key]: parseInt(e.target.value) || 0 }))}
                            className="w-full bg-transparent text-xl font-black outline-none"
                          />
                          <span className="text-xs font-bold opacity-30">%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                    <div className="flex items-center gap-2">
                      <div className={`w-3 h-3 rounded-full ${(Object.values(pkgMix) as number[]).reduce((a, b) => a + b, 0) === 100 ? 'bg-emerald-500' : 'bg-red-500'}`} />
                      <span className="text-xs font-bold text-slate-500 uppercase">Контрольная сумма микса:</span>
                    </div>
                    <span className={`text-xl font-black ${(Object.values(pkgMix) as number[]).reduce((a, b) => a + b, 0) === 100 ? 'text-emerald-600' : 'text-red-600'}`}>
                      {(Object.values(pkgMix) as number[]).reduce((a, b) => a + b, 0)}%
                    </span>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'report' && (
              <motion.div 
                key="report"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="print-container bg-white p-8 md:p-12 shadow-lg border border-slate-200 max-w-[210mm] mx-auto text-slate-900"
              >
                <div className="flex justify-between items-start border-b-2 border-slate-900 pb-6 mb-8">
                  <div>
                    <h1 className="text-2xl font-black uppercase tracking-tighter">Сводный отчет по финансовой модели</h1>
                    <p className="text-sm text-slate-500 font-bold uppercase tracking-widest mt-1">Отель Сочи · Сезон 2026</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Дата отчета</p>
                    <p className="text-sm font-bold">{new Date().toLocaleDateString('ru-RU')}</p>
                  </div>
                </div>

                <section className="mb-10">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-l-4 border-slate-900 pl-3">1. Основные финансовые показатели (Бюджет 2026)</h2>
                  <div className="grid grid-cols-3 gap-4 mb-6">
                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Общий доход (Бюджет)</p>
                      <p className="text-xl font-black text-slate-900">{formatMln(totals.totalBudget)}</p>
                      <p className="text-[9px] text-slate-500 mt-1">Номера: {formatMln(totals.totalRoomRev)} + МЦ: {formatMln(totals.totalMedAddonRev)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Доход номерного фонда</p>
                      <p className="text-xl font-black text-indigo-600">{formatMln(totals.totalRoomRev)}</p>
                    </div>
                    <div className="bg-slate-50 p-4 rounded border border-slate-200">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-1">Доход МЦ (Платный)</p>
                      <p className="text-xl font-black text-orange-600">{formatMln(totals.totalMedAddonRev)}</p>
                    </div>
                  </div>
                  <div className="mb-4 grid grid-cols-2 gap-4">
                    <div className="bg-slate-50 p-3 rounded border border-slate-200">
                      <p className="text-[10px] uppercase text-slate-500 font-bold">Итого План (Год)</p>
                      <p className="text-xl font-black text-slate-900">{(totals.totalRev / 1000000).toFixed(2)} млн</p>
                    </div>
                    <div className="bg-indigo-50 p-3 rounded border border-indigo-200">
                      <p className="text-[10px] uppercase text-indigo-500 font-bold">Прогноз LBE (Факт + План)</p>
                      <p className="text-xl font-black text-indigo-700">{(totals.totalForecastRev / 1000000).toFixed(2)} млн</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto -mx-4 px-4 md:mx-0 md:px-0">
                    <table className="w-full text-left border-collapse min-w-[600px]">
                    <thead>
                      <tr className="bg-slate-100">
                        <th className="p-2 border border-slate-300 text-[10px] uppercase font-bold">Месяц</th>
                        <th className="p-2 border border-slate-300 text-[10px] uppercase font-bold text-center">Загр. %</th>
                        <th className="p-2 border border-slate-300 text-[10px] uppercase font-bold text-right">Номеро-ночи</th>
                        <th className="p-2 border border-slate-300 text-[10px] uppercase font-bold text-right">Койко-дни</th>
                        <th className="p-2 border border-slate-300 text-[10px] uppercase font-bold text-right">План, млн ₽</th>
                        <th className="p-2 border border-slate-300 text-[10px] uppercase font-bold text-right bg-indigo-50">Прогноз LBE, млн</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MONTHS.map((m, mIdx) => {
                        const res = totals.monthResults[mIdx];
                        return (
                          <tr key={mIdx}>
                            <td className="p-2 border border-slate-300 font-bold">{m.name}</td>
                            <td className="p-2 border border-slate-300 text-center font-mono">{res.mAvgOcc.toFixed(1)}%</td>
                            <td className="p-2 border border-slate-300 text-right font-mono">{Math.round(res.mRN).toLocaleString()}</td>
                            <td className="p-2 border border-slate-300 text-right font-mono">{Math.round(res.mBedDays).toLocaleString()}</td>
                            <td className="p-2 border border-slate-300 text-right font-bold">{(res.mRev / 1000000).toFixed(2)}</td>
                            <td className="p-2 border border-slate-300 text-right font-bold bg-indigo-50 text-indigo-700">{(res.mForecastRev / 1000000).toFixed(2)}</td>
                          </tr>
                        );
                      })}
                      <tr className="bg-slate-900 text-white">
                        <td className="p-2 border border-slate-900 font-black uppercase">Итого</td>
                        <td className="p-2 border border-slate-900 text-center font-bold">{totals.totalAvgOcc.toFixed(1)}%</td>
                        <td className="p-2 border border-slate-900 text-right font-mono">{Math.round(totals.totalRN).toLocaleString()}</td>
                        <td className="p-2 border border-slate-900 text-right font-mono">{Math.round(totals.totalBedDays).toLocaleString()}</td>
                        <td className="p-2 border border-slate-900 text-right font-black">{(totals.totalRev / 1000000).toFixed(1)} млн</td>
                        <td className="p-2 border border-slate-900 text-right font-black text-indigo-300">{(totals.totalForecastRev / 1000000).toFixed(1)} млн</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </section>

                <section className="mb-10">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-l-4 border-indigo-600 pl-3">2. Детализация План / Факт</h2>
                  
                  <div className="space-y-8">
                    {/* По категориям */}
                    <div>
                      <h3 className="text-[10px] font-bold uppercase text-slate-400 mb-2">2.1. По категориям номеров</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[11px] min-w-[600px]">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="p-2 border border-slate-200 uppercase font-bold">Категория</th>
                            <th className="p-2 border border-slate-200 text-center uppercase font-bold">Загр. План %</th>
                            <th className="p-2 border border-slate-200 text-center uppercase font-bold">Загр. Факт %</th>
                            <th className="p-2 border border-slate-200 text-right uppercase font-bold">Доход План, млн</th>
                            <th className="p-2 border border-slate-200 text-right uppercase font-bold">Доход Факт, млн</th>
                            <th className="p-2 border border-slate-200 text-center uppercase font-bold">Откл. %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ROOM_TYPES.map(rt => {
                            const planRev = totals.byRoomPlan[rt.key as keyof typeof totals.byRoomPlan];
                            const fact = roomFact[rt.key as keyof typeof roomFact];
                            const avgOccPlan = SEASONS.reduce((acc, s, i) => acc + (seasonData[i].occPlan * s.days), 0) / SEASONS.reduce((acc, s) => acc + s.days, 0);
                            const variance = planRev > 0 ? ((fact.rev - planRev) / planRev) * 100 : 0;
                            return (
                              <tr key={rt.key}>
                                <td className="p-2 border border-slate-200 font-bold">{rt.label}</td>
                                <td className="p-2 border border-slate-200 text-center">{avgOccPlan.toFixed(1)}%</td>
                                <td className="p-2 border border-slate-200 text-center font-bold text-indigo-600">{fact.occ > 0 ? fact.occ + '%' : '—'}</td>
                                <td className="p-2 border border-slate-200 text-right">{(planRev / 1000000).toFixed(2)}</td>
                                <td className="p-2 border border-slate-200 text-right font-bold text-emerald-600">{fact.rev > 0 ? (fact.rev / 1000000).toFixed(2) : '—'}</td>
                                <td className={`p-2 border border-slate-200 text-center font-bold ${variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {fact.rev > 0 ? (variance > 0 ? '+' : '') + variance.toFixed(1) + '%' : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* По пакетам */}
                    <div>
                      <h3 className="text-[10px] font-bold uppercase text-slate-400 mb-2">2.2. По пакетам услуг</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[11px] min-w-[600px]">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="p-2 border border-slate-200 uppercase font-bold">Пакет</th>
                            <th className="p-2 border border-slate-200 text-center uppercase font-bold">Доля План %</th>
                            <th className="p-2 border border-slate-200 text-center uppercase font-bold">Доля Факт %</th>
                            <th className="p-2 border border-slate-200 text-right uppercase font-bold">Доход План, млн</th>
                            <th className="p-2 border border-slate-200 text-right uppercase font-bold">Доход Факт, млн</th>
                            <th className="p-2 border border-slate-200 text-center uppercase font-bold">Откл. %</th>
                          </tr>
                        </thead>
                        <tbody>
                          {PACKAGES.map(pk => {
                            const planRev = totals.byPkgPlan[pk.key as keyof typeof totals.byPkgPlan];
                            const fact = pkgFact[pk.key as keyof typeof pkgFact];
                            const variance = planRev > 0 ? ((fact.rev - planRev) / planRev) * 100 : 0;
                            return (
                              <tr key={pk.key}>
                                <td className="p-2 border border-slate-200 font-bold">{pk.short}</td>
                                <td className="p-2 border border-slate-200 text-center">{pkgMix[pk.key as keyof typeof pkgMix]}%</td>
                                <td className="p-2 border border-slate-200 text-center font-bold text-indigo-600">{fact.share > 0 ? fact.share + '%' : '—'}</td>
                                <td className="p-2 border border-slate-200 text-right">{(planRev / 1000000).toFixed(2)}</td>
                                <td className="p-2 border border-slate-200 text-right font-bold text-emerald-600">{fact.rev > 0 ? (fact.rev / 1000000).toFixed(2) : '—'}</td>
                                <td className={`p-2 border border-slate-200 text-center font-bold ${variance >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                                  {fact.rev > 0 ? (variance > 0 ? '+' : '') + variance.toFixed(1) + '%' : '—'}
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>

                    {/* По сегментам */}
                    <div>
                      <h3 className="text-[10px] font-bold uppercase text-slate-400 mb-2">2.3. По сегментам продаж (Среднее за период)</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[11px] min-w-[600px]">
                        <thead>
                          <tr className="bg-slate-50">
                            <th className="p-2 border border-slate-200 uppercase font-bold">Сегмент</th>
                            <th className="p-2 border border-slate-200 text-center uppercase font-bold">Доля План %</th>
                            <th className="p-2 border border-slate-200 text-center uppercase font-bold">Доля Факт %</th>
                            <th className="p-2 border border-slate-200 text-right uppercase font-bold">Доход Факт, млн</th>
                          </tr>
                        </thead>
                        <tbody>
                          {[
                            { key: 'direct', label: 'Прямые' },
                            { key: 'to', label: 'Туроператоры' },
                            { key: 'fss', label: 'ФСС' },
                            { key: 'corp', label: 'Корпораты' },
                            { key: 'ota', label: 'OTA' }
                          ].map(seg => {
                            const avgPlan = segmentData.reduce((acc, m) => acc + (m[seg.key as keyof typeof m] as any).plan, 0) / MONTHS.length;
                            const avgFact = segmentData.reduce((acc, m) => acc + (m[seg.key as keyof typeof m] as any).fact, 0) / MONTHS.length;
                            const totalRevFact = segmentData.reduce((acc, m) => acc + (m[seg.key as keyof typeof m] as any).revFact, 0);
                            return (
                              <tr key={seg.key}>
                                <td className="p-2 border border-slate-200 font-bold">{seg.label}</td>
                                <td className="p-2 border border-slate-200 text-center">{avgPlan.toFixed(1)}%</td>
                                <td className="p-2 border border-slate-200 text-center font-bold text-indigo-600">{avgFact > 0 ? avgFact.toFixed(1) + '%' : '—'}</td>
                                <td className="p-2 border border-slate-200 text-right font-bold text-emerald-600">{totalRevFact > 0 ? (totalRevFact / 1000000).toFixed(2) : '—'}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </section>

                <section className="mb-10">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-l-4 border-indigo-600 pl-3">3. Пояснительная записка</h2>
                  <div className="text-sm leading-relaxed text-slate-700 space-y-4">
                    <p>
                      Данная финансовая модель разработана для обеспечения реалистичного прогноза доходности Отеля Сочи на период март-декабрь 2026 года. 
                      Целевой показатель выручки установлен в диапазоне <b>1.2 – 1.25 млрд рублей</b>.
                    </p>
                    <p>
                      <b>Ключевые допущения:</b>
                      <ul className="list-disc ml-5 mt-2 space-y-1">
                        <li>Средняя загрузка в высокий сезон (июнь-август) принята на уровне 82% при коэффициенте гостей 2.7.</li>
                        <li>Доля медицинских программ (Ultra + Medical) составляет 25%, что является основным драйвером дохода в межсезонье.</li>
                        <li>Введены ограничения на низкомаржинальные продукты: "Аква туры" ограничены 10%, "ПРОМО" — 5% (только в низкий сезон).</li>
                      </ul>
                    </p>
                  </div>
                </section>

                <section className="mb-10 page-break-before">
                  <div className="flex items-center justify-between mb-4 border-l-4 border-blue-600 pl-3">
                    <h2 className="text-sm font-black uppercase tracking-widest">4. Аналитика и Предложения ИИ</h2>
                    <div className="flex items-center gap-4 no-print">
                      <div className="flex flex-col items-end">
                        <input 
                          type="text" 
                          placeholder="Указать конкурентов (через запятую)..." 
                          value={competitorList}
                          onChange={(e) => setCompetitorList(e.target.value)}
                          className="text-[10px] border-b border-slate-200 outline-none focus:border-indigo-500 w-48 text-right bg-transparent"
                        />
                        <span className="text-[8px] text-slate-400 mt-1">Оставьте пустым для авто-подбора</span>
                      </div>
                      <button 
                        onClick={handleAIAnalysis}
                        disabled={isAnalyzing}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm"
                      >
                        {isAnalyzing ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : (
                          <Sparkles size={14} />
                        )}
                        {isAnalyzing ? 'Анализирую...' : 'Запустить AI-анализ'}
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-white border border-slate-200 p-4 rounded-lg">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">Предложения по ПРОМО-акциям</h4>
                      <textarea 
                        value={promoProposals}
                        onChange={(e) => setPromoProposals(e.target.value)}
                        placeholder="Введите ваши идеи по акциям..."
                        className="w-full h-32 text-xs p-2 border border-slate-100 rounded outline-none focus:border-indigo-500 no-print"
                      />
                      <div className="hidden print:block text-xs text-slate-700 whitespace-pre-wrap">
                        {promoProposals || 'Предложения не заполнены'}
                      </div>
                    </div>
                    <div className="bg-white border border-slate-200 p-4 rounded-lg">
                      <h4 className="text-[10px] font-black uppercase text-slate-400 mb-2">Анализ конкурентов (Отели и Санатории)</h4>
                      <textarea 
                        value={competitorAnalysis}
                        onChange={(e) => setCompetitorAnalysis(e.target.value)}
                        placeholder="Анализ акций конкурентов на текущую дату..."
                        className="w-full h-32 text-xs p-2 border border-slate-100 rounded outline-none focus:border-indigo-500 no-print"
                      />
                      <div className="hidden print:block text-xs text-slate-700 whitespace-pre-wrap">
                        {competitorAnalysis || 'Анализ не заполнен'}
                      </div>
                    </div>
                  </div>
                </section>

                <section className="mb-10">
                  <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-l-4 border-orange-500 pl-3">5. Рекомендации при снижении дохода</h2>
                  <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
                    <p className="text-sm font-bold text-orange-900 mb-4">В случае отклонения факта от плана более чем на 10%, рекомендуются следующие меры:</p>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <h4 className="text-xs font-black uppercase text-orange-800 mb-2">Оперативные меры</h4>
                        <ul className="text-xs space-y-2 text-orange-900">
                          <li>• <b>Пересмотр микса</b>: Увеличение квот на пакеты Medical и SPA за счет сокращения базовых Аква-туров.</li>
                          <li>• <b>Стимулирование прямых продаж</b>: Внедрение закрытых акций для лояльных гостей (база CRM) для экономии на комиссиях OTA.</li>
                          <li>• <b>Динамическое управление</b>: Снижение минимального срока проживания (LOS) для дозагрузки "окон" в графике.</li>
                        </ul>
                      </div>
                      <div>
                        <h4 className="text-xs font-black uppercase text-orange-800 mb-2">Стратегические меры</h4>
                        <ul className="text-xs space-y-2 text-orange-900">
                          <li>• <b>Работа с сегментами</b>: При падении коммерческого спроса — временное увеличение доли корпоративных групп (MICE) или ФСС.</li>
                          <li>• <b>Апсейл (Upsell)</b>: Мотивация службы приема на предложение повышения категории номера при заезде.</li>
                          <li>• <b>Пакетные предложения</b>: Формирование спецпредложений "3+1" или "Дети бесплатно" для стимуляции спроса в будние дни.</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </section>

                <div className="mt-20 flex justify-between items-end border-t border-slate-200 pt-8">
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-900 mb-2"></div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Аналитик / Ген. Директор</p>
                  </div>
                  <div className="text-center">
                    <div className="w-40 border-b border-slate-900 mb-2"></div>
                    <p className="text-[10px] uppercase font-bold text-slate-400">Финансовая служба</p>
                  </div>
                </div>

                <div className="mt-8 no-print flex justify-center gap-4">
                  <button 
                    onClick={() => window.print()}
                    className="bg-slate-900 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-slate-800 transition-colors shadow-lg"
                  >
                    <Printer size={18} /> Распечатать отчет (A4)
                  </button>
                  <button 
                    onClick={generateFinanceReportXLSX}
                    className="bg-emerald-600 text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 hover:bg-emerald-700 transition-colors shadow-lg"
                  >
                    <Download size={18} /> Скачать XLSX для финслужбы
                  </button>
                </div>
              </motion.div>
            )}

            {activeTab === 'medicine' && (
              <motion.div 
                key="medicine"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-indigo-600">
                    <Activity /> План реализации дополнительных медицинских услуг
                  </h2>

                  <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
                    <div className="bg-indigo-900 text-white p-5 rounded-xl">
                      <p className="text-[10px] uppercase font-bold text-indigo-300 mb-1">Платные услуги МЦ</p>
                      <h3 className="text-2xl font-black">{formatMln(totals.totalMedAddonRev)}</h3>
                      <p className="text-[10px] mt-1 opacity-70">Доп. доход к бюджету</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Мед. пакеты (условно)</p>
                      <h3 className="text-2xl font-black text-slate-400">{formatMln(totals.totalInternalMedRev)}</h3>
                      <p className="text-[10px] mt-1 text-slate-500">Входит в тариф отеля</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Средний чек доп.</p>
                      <h3 className="text-2xl font-black">{medAddonConfig.avgCheck.toLocaleString()} ₽</h3>
                      <p className="text-[10px] mt-1 text-slate-500">На 1 платного гостя</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Конверсия (ср.)</p>
                      <h3 className="text-2xl font-black">
                        {Math.round(totals.monthResults.reduce((acc, m) => acc + m.mMedAddonGuests, 0) / totals.totalBedDays * 100)}%
                      </h3>
                      <p className="text-[10px] mt-1 text-slate-500">От общего кол-ва гостей</p>
                    </div>
                    <div className="bg-white p-5 rounded-xl border border-slate-200">
                      <p className="text-[10px] uppercase font-bold text-slate-400 mb-1">Всего процедур</p>
                      <h3 className="text-2xl font-black">{Math.round(totals.monthResults.reduce((acc, m) => acc + m.mMedAddonProcs, 0)).toLocaleString()}</h3>
                      <p className="text-[10px] mt-1 text-slate-500">Дополнительных за год</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-1 space-y-6">
                      <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                        <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Калькулятор плана</h3>
                        <div className="space-y-4">
                          <div className="space-y-3">
                            <label className="text-[10px] uppercase font-bold text-slate-500 block">Алгоритм: Макс. % от проживающих</label>
                            <div className="flex items-center gap-2">
                              <input 
                                type="number" 
                                value={medAddonConfig.maxConversion} 
                                onChange={(e) => setMedAddonConfig(prev => ({ ...prev, maxConversion: parseInt(e.target.value) || 0 }))} 
                                className="w-20 border rounded p-2 text-sm font-bold text-indigo-600" 
                              />
                              <span className="text-sm font-bold text-slate-400">%</span>
                            </div>
                            <p className="text-[9px] text-slate-400 italic">Согласно заданному алгоритму: макс. 5% от числа проживающих Гостей.</p>
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Средний чек (₽)</label>
                            <input 
                              type="number" 
                              value={medAddonConfig.avgCheck} 
                              onChange={(e) => setMedAddonConfig(prev => ({ ...prev, avgCheck: parseInt(e.target.value) || 0 }))} 
                              className="w-full border rounded p-2 font-bold text-indigo-600" 
                            />
                          </div>
                          <div>
                            <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Процедур на гостя (шт)</label>
                            <input 
                              type="number" 
                              step="0.1"
                              value={medAddonConfig.procsPerGuest} 
                              onChange={(e) => setMedAddonConfig(prev => ({ ...prev, procsPerGuest: parseFloat(e.target.value) || 0 }))} 
                              className="w-full border rounded p-2 font-bold text-indigo-600" 
                            />
                          </div>
                        </div>
                      </div>

                      <div className="bg-indigo-50 p-6 rounded-xl border border-indigo-100">
                        <h3 className="text-sm font-bold text-indigo-800 mb-4 uppercase">Ассортимент для плана</h3>
                        <div className="space-y-3">
                          {MED_ASSORTMENT.map((item, i) => (
                            <div key={i} className="flex items-center justify-between text-xs">
                              <div className="flex items-center gap-2">
                                <span>{item.icon}</span>
                                <span className="text-slate-700">{item.name}</span>
                              </div>
                              <div className="text-right">
                                <div className="font-bold text-indigo-700">{item.share}%</div>
                                <div className="text-[9px] text-slate-400">~{Math.round(totals.totalMedAddonRev * (item.share / 100) / 1000000 * 10) / 10} млн ₽</div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <div className="mt-4 pt-4 border-t border-indigo-200 text-[10px] text-indigo-600 italic">
                          * Распределение выручки по категориям для достижения целевого среднего чека.
                        </div>
                      </div>
                    </div>

                    <div className="lg:col-span-2">
                      <h3 className="text-sm font-bold text-slate-800 mb-4 uppercase tracking-wider">Помесячный план Медцентра (Доп. услуги)</h3>
                      <div className="overflow-x-auto">
                        <table className="w-full text-[11px] border-collapse">
                          <thead>
                            <tr className="bg-slate-900 text-white">
                              <th className="p-2 text-left">Месяц</th>
                              <th className="p-2 text-center">Гостей (доп)</th>
                              <th className="p-2 text-center">Процедур</th>
                              <th className="p-2 text-right">Доп. услуги, ₽</th>
                              <th className="p-2 text-right bg-indigo-800">Платный доход МЦ, ₽</th>
                              <th className="p-2 text-right">Нагрузка %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {MONTHS.map((m, i) => {
                              const res = totals.monthResults[i];
                              const load = (res.mMedAddonGuests / costConfig.medCapacity) * 100;
                              return (
                                <tr key={i} className="border-bottom border-slate-100 hover:bg-slate-50">
                                  <td className="p-2 font-bold">{m.name}</td>
                                  <td className="p-2 text-center font-mono">{Math.round(res.mMedAddonGuests).toLocaleString()}</td>
                                  <td className="p-2 text-center font-mono">{Math.round(res.mMedAddonProcs).toLocaleString()}</td>
                                  <td className="p-2 text-right font-bold text-slate-600">{Math.round(res.mMedAddonRev).toLocaleString()}</td>
                                  <td className="p-2 text-right font-black text-indigo-700 bg-indigo-50/50">{Math.round(res.mMedAddonRev).toLocaleString()}</td>
                                  <td className="p-2 text-right">
                                    <div className="flex items-center justify-end gap-2">
                                      <div className="w-12 h-1.5 bg-slate-200 rounded-full overflow-hidden">
                                        <div className={`h-full ${load > 80 ? 'bg-red-500' : 'bg-indigo-500'}`} style={{ width: `${Math.min(load, 100)}%` }} />
                                      </div>
                                      <span className="font-mono">{load.toFixed(0)}%</span>
                                    </div>
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="bg-slate-100 font-black">
                              <td className="p-2">ИТОГО</td>
                              <td className="p-2 text-center">{Math.round(totals.monthResults.reduce((acc, m) => acc + m.mMedAddonGuests, 0)).toLocaleString()}</td>
                              <td className="p-2 text-center">{Math.round(totals.monthResults.reduce((acc, m) => acc + m.mMedAddonProcs, 0)).toLocaleString()}</td>
                              <td className="p-2 text-right text-slate-600">{Math.round(totals.totalMedAddonRev).toLocaleString()}</td>
                              <td className="p-2 text-right text-indigo-900 bg-indigo-100">{Math.round(totals.totalMedAddonRev).toLocaleString()}</td>
                              <td className="p-2 text-right">—</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                        <h4 className="text-xs font-bold text-amber-800 uppercase mb-2 flex items-center gap-2">
                          <AlertCircle size={14} /> Рекомендации по выполнению плана
                        </h4>
                        <ul className="text-[11px] text-amber-900 space-y-1">
                          <li>• <b>Внедрение "Check-up"</b>: Продажа комплексных диагностических программ в первые 2 дня заезда.</li>
                          <li>• <b>Кросс-продажи</b>: Обучение врачей на первичных консультациях предлагать минимум 2 дополнительные платные процедуры.</li>
                          <li>• <b>Вечерний прайс</b>: Скидка 15% на процедуры после 18:00 для выравнивания нагрузки кабинетов.</li>
                          <li>• <b>Абонементы</b>: При покупке курса из 5 процедур — 6-я в подарок (увеличивает LTV гостя).</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'critical' && (
              <motion.div 
                key="critical"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2 text-red-600">
                    <AlertCircle /> Критический анализ и оценка рисков
                  </h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                    <div className="bg-slate-900 text-white p-6 rounded-xl">
                      <p className="text-xs uppercase font-bold text-slate-400 mb-1">GOP (Операционная прибыль)</p>
                      <h3 className="text-3xl font-black">{formatMln(totals.totalGOP)}</h3>
                      <p className="text-xs mt-2 text-emerald-400">Маржинальность: {totals.totalGOPMargin.toFixed(1)}%</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                      <p className="text-xs uppercase font-bold text-slate-400 mb-1">Точка безубыточности (Occ %)</p>
                      <h3 className="text-3xl font-black">
                        {((costConfig.staffingMonthly * 12) / (totals.totalRev / totals.totalAvgOcc)).toFixed(1)}%
                      </h3>
                      <p className="text-xs mt-2 text-slate-500">Средняя загрузка для покрытия ФОТ</p>
                    </div>
                    <div className="bg-white p-6 rounded-xl border border-slate-200">
                      <p className="text-xs uppercase font-bold text-slate-400 mb-1">Риск Медцентра</p>
                      <h3 className={`text-3xl font-black ${totals.monthResults.some(m => m.mMedBedDays > costConfig.medCapacity) ? 'text-red-500' : 'text-emerald-500'}`}>
                        {totals.monthResults.some(m => m.mMedBedDays > costConfig.medCapacity) ? 'ВЫСОКИЙ' : 'НИЗКИЙ'}
                      </h3>
                      <p className="text-xs mt-2 text-slate-500">Превышение лимита в {totals.monthResults.filter(m => m.mMedBedDays > costConfig.medCapacity).length} мес.</p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                    <div className="space-y-6">
                      <h3 className="font-bold text-slate-800 border-b pb-2">Настройка расходной части (OPEX)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Food Cost % (от еды)</label>
                          <input type="number" value={costConfig.foodCostPct} onChange={(e) => setCostConfig(prev => ({ ...prev, foodCostPct: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 font-bold" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">ФОТ (мес, млн ₽)</label>
                          <input type="number" value={costConfig.staffingMonthly / 1000000} onChange={(e) => setCostConfig(prev => ({ ...prev, staffingMonthly: (parseFloat(e.target.value) || 0) * 1000000 }))} className="w-full border rounded p-2 font-bold" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Комиссия OTA %</label>
                          <input type="number" value={costConfig.commissionPct} onChange={(e) => setCostConfig(prev => ({ ...prev, commissionPct: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 font-bold" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Прочие VC % (от выручки)</label>
                          <input type="number" value={costConfig.otherVCPct} onChange={(e) => setCostConfig(prev => ({ ...prev, otherVCPct: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 font-bold" />
                        </div>
                        <div className="col-span-2">
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Лимит Медцентра (чел-дней/мес)</label>
                          <input type="number" value={costConfig.medCapacity} onChange={(e) => setCostConfig(prev => ({ ...prev, medCapacity: parseInt(e.target.value) || 0 }))} className="w-full border rounded p-2 font-bold" />
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 p-6 rounded-xl border border-slate-200">
                      <h3 className="font-bold text-slate-800 mb-4">Критические замечания (Аудит модели)</h3>
                      <div className="space-y-4 text-sm text-slate-600">
                        <div className="flex gap-3">
                          <AlertCircle className="text-red-500 shrink-0" size={18} />
                          <p><b>Зависимость от OTA</b>: При доле OTA в 15% и комиссии {costConfig.commissionPct}%, прямые продажи должны быть приоритетом. Снижение доли OTA на 5% даст экономию в <b>{formatMln(totals.totalRev * 0.05 * (costConfig.commissionPct/100))}</b>.</p>
                        </div>
                        <div className="flex gap-3">
                          <AlertCircle className="text-orange-500 shrink-0" size={18} />
                          <p><b>Узкое место Медцентра</b>: В пиковые месяцы нагрузка составляет {Math.max(...totals.monthResults.map(m => m.mMedBedDays)).toFixed(0)} чел-дней. При лимите {costConfig.medCapacity} это приведет к очередям и негативу. Необходимо квотирование пакетов Med.</p>
                        </div>
                        <div className="flex gap-3">
                          <AlertCircle className="text-indigo-500 shrink-0" size={18} />
                          <p><b>ADR в низкий сезон</b>: ADR падает до {Math.round(Math.min(...totals.monthResults.map(m => m.mRev / (m.mRN || 1)))).toLocaleString()} ₽. Это близко к себестоимости. Рекомендуется внедрение динамического ценообразования с минимальным порогом (Floor Price).</p>
                        </div>
                        <div className="flex gap-3">
                          <AlertCircle className="text-slate-500 shrink-0" size={18} />
                          <p><b>ФОТ и Сезонность</b>: Постоянный ФОТ в {formatMln(costConfig.staffingMonthly)} создает риски в марте/ноябре. Рекомендуется перевести часть персонала на сдельную оплату или сезонные контракты.</p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold text-slate-800 mb-6">Помесячный финансовый результат (P&L Simulation)</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-100">
                          <th className="p-2 border border-slate-200 text-left">Показатель</th>
                          {MONTHS.map(m => <th key={m.name} className="p-2 border border-slate-200 text-center">{m.name}</th>)}
                          <th className="p-2 border border-slate-200 text-right bg-slate-200">ИТОГО</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr className="bg-slate-900 text-white font-bold">
                          <td className="p-2 border border-slate-800">ОБЩИЙ БЮДЖЕТ (Отель + Платный МЦ), млн</td>
                          {totals.monthResults.map((m, i) => <td key={i} className="p-2 border border-slate-800 text-center">{( (m.mRev + m.mMedAddonRev) / 1000000).toFixed(1)}</td>)}
                          <td className="p-2 border border-slate-800 text-right bg-slate-800">{(totals.totalBudget/1000000).toFixed(1)}</td>
                        </tr>
                        <tr>
                          <td className="p-2 border border-slate-200 font-bold">Доход номерного фонда, млн</td>
                          {totals.monthResults.map((m, i) => <td key={i} className="p-2 border border-slate-200 text-center">{(m.mRev/1000000).toFixed(1)}</td>)}
                          <td className="p-2 border border-slate-200 text-right font-bold bg-slate-50">{(totals.totalRev/1000000).toFixed(1)}</td>
                        </tr>
                        <tr>
                          <td className="p-2 border border-slate-200 font-bold text-orange-600">МедЦентр (Доп. услуги), млн</td>
                          {totals.monthResults.map((m, i) => <td key={i} className="p-2 border border-slate-200 text-center text-orange-500">{(m.mMedAddonRev/1000000).toFixed(1)}</td>)}
                          <td className="p-2 border border-slate-200 text-right font-bold bg-slate-50 text-orange-600">{(totals.totalMedAddonRev/1000000).toFixed(1)}</td>
                        </tr>
                        <tr>
                          <td className="p-2 border border-slate-200 text-red-600">Расходы (OPEX), млн</td>
                          {totals.monthResults.map((m, i) => <td key={i} className="p-2 border border-slate-200 text-center text-red-500">{(m.mTotalCosts/1000000).toFixed(1)}</td>)}
                          <td className="p-2 border border-slate-200 text-right text-red-600 bg-slate-50">{(totals.totalCosts/1000000).toFixed(1)}</td>
                        </tr>
                        <tr className="bg-emerald-50 font-bold">
                          <td className="p-2 border border-slate-200 text-emerald-700">GOP, млн</td>
                          {totals.monthResults.map((m, i) => <td key={i} className="p-2 border border-slate-200 text-center text-emerald-600">{(m.mGOP/1000000).toFixed(1)}</td>)}
                          <td className="p-2 border border-slate-200 text-right text-emerald-700 bg-emerald-100">{(totals.totalGOP/1000000).toFixed(1)}</td>
                        </tr>
                        <tr>
                          <td className="p-2 border border-slate-200">GOP Margin %</td>
                          {totals.monthResults.map((m, i) => <td key={i} className="p-2 border border-slate-200 text-center">{m.mGOPMargin.toFixed(0)}%</td>)}
                          <td className="p-2 border border-slate-200 text-right font-bold bg-slate-50">{totals.totalGOPMargin.toFixed(0)}%</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'instructions' && (
            <div className="space-y-8 max-w-4xl mx-auto">
              <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                <div className="flex items-center space-x-3 mb-6">
                  <div className="p-3 bg-indigo-100 rounded-xl text-indigo-600">
                    <BookOpen size={24} />
                  </div>
                  <h2 className="text-2xl font-bold text-slate-900">Руководство по управлению финмоделью</h2>
                </div>

                <div className="space-y-8">
                  <section>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                      <span className="w-8 h-8 bg-indigo-600 text-white rounded-full flex items-center justify-center text-sm mr-3">1</span>
                      Алгоритм настройки (Input)
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 ml-11">
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h4 className="font-bold text-sm text-indigo-600 mb-2 uppercase">Шаг 1: Ресурсы</h4>
                        <p className="text-sm text-slate-600">Во вкладке <b>«Настройки»</b> установите количество номеров. Модель пересчитает потенциальную емкость (Room Nights) автоматически.</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h4 className="font-bold text-sm text-indigo-600 mb-2 uppercase">Шаг 2: Тарифы</h4>
                        <p className="text-sm text-slate-600">Во вкладке <b>«Цены»</b> задайте стоимость для каждого сезона. Используйте <i>Глобальную корректировку</i> для быстрой симуляции инфляции.</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h4 className="font-bold text-sm text-indigo-600 mb-2 uppercase">Шаг 3: Микс пакетов</h4>
                        <p className="text-sm text-slate-600">На <b>Дашборде</b> настройте доли пакетов (BB, Ultra, Med). Это критически влияет на Food Cost и выручку медцентра.</p>
                      </div>
                      <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
                        <h4 className="font-bold text-sm text-indigo-600 mb-2 uppercase">Шаг 4: Сегментация</h4>
                        <p className="text-sm text-slate-600">Во вкладке <b>«Сегменты»</b> распределите продажи по каналам. Помните: OTA несет комиссионную нагрузку (настраивается в расходах).</p>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                      <span className="w-8 h-8 bg-emerald-600 text-white rounded-full flex items-center justify-center text-sm mr-3">2</span>
                      Алгоритм проверки (Verification)
                    </h3>
                    <div className="ml-11 space-y-4">
                      <div className="flex items-start space-x-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <AlertCircle className="text-emerald-600 mt-1" size={20} />
                        <div>
                          <p className="font-bold text-emerald-900">Проверка на «Перегруз»</p>
                          <p className="text-sm text-emerald-700">Следите за индикатором <b>Medical Capacity</b>. Если спрос на лечение выше мощности центра, модель выдаст предупреждение. В этом случае нужно повышать цену на пакет Medical.</p>
                        </div>
                      </div>
                      <div className="flex items-start space-x-3 p-4 bg-emerald-50 rounded-xl border border-emerald-100">
                        <Target className="text-emerald-600 mt-1" size={20} />
                        <div>
                          <p className="font-bold text-emerald-900">Сверка с Целью (1.2 млрд)</p>
                          <p className="text-sm text-emerald-700">На главном дашборде шкала прогресса показывает отклонение от годового плана. Если вы не добираете выручку, используйте AI-анализ для поиска идей по акциям.</p>
                        </div>
                      </div>
                    </div>
                  </section>

                  <section>
                    <h3 className="text-lg font-bold text-slate-900 mb-3 flex items-center">
                      <span className="w-8 h-8 bg-amber-600 text-white rounded-full flex items-center justify-center text-sm mr-3">3</span>
                      Ключевые метрики (KPI)
                    </h3>
                    <div className="ml-11 overflow-hidden border border-slate-200 rounded-xl">
                      <table className="w-full text-sm text-left">
                        <thead className="bg-slate-50 text-slate-500 uppercase text-xs">
                          <tr>
                            <th className="px-4 py-2">Метрика</th>
                            <th className="px-4 py-2">Что значит</th>
                            <th className="px-4 py-2">Норма</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-200">
                          <tr>
                            <td className="px-4 py-3 font-bold">Net ADR</td>
                            <td className="px-4 py-3 text-slate-600">Цена за вычетом комиссий OTA</td>
                            <td className="px-4 py-3 text-emerald-600 font-medium">{'>'} 4500 руб.</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-bold">Break-even Occ</td>
                            <td className="px-4 py-3 text-slate-600">Загрузка для выхода в ноль</td>
                            <td className="px-4 py-3 text-amber-600 font-medium">35% - 45%</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-bold">GOP Margin</td>
                            <td className="px-4 py-3 text-slate-600">Операционная рентабельность</td>
                            <td className="px-4 py-3 text-emerald-600 font-medium">{'>'} 40%</td>
                          </tr>
                          <tr>
                            <td className="px-4 py-3 font-bold">TRevPAR</td>
                            <td className="px-4 py-3 text-slate-600">Весь доход на 1 номер в день</td>
                            <td className="px-4 py-3 text-indigo-600 font-medium">Максимизация</td>
                          </tr>
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>

                <div className="mt-8 pt-8 border-t border-slate-100 flex justify-center">
                  <button 
                    onClick={() => setActiveTab('dashboard')}
                    className="flex items-center space-x-2 bg-indigo-600 text-white px-6 py-3 rounded-xl font-bold hover:bg-indigo-700 transition-colors"
                  >
                    <span>Перейти к моделированию</span>
                    <TrendingUp size={20} />
                  </button>
                </div>
              </div>
            </div>
          )}
          {activeTab === 'dashboard' && (
              <motion.div 
                key="dashboard"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }} 
                className="space-y-6"
              >
                {/* Revenue Split Summary */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="text-sm font-bold text-slate-900 mb-6 flex items-center gap-2 uppercase tracking-wider">
                    <TrendingUp size={16} className="text-indigo-600" /> Структура общего бюджета (Прогноз 2026)
                  </h3>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="space-y-4">
                      <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                        <span className="text-xs text-slate-500 font-medium">Доход номерного фонда</span>
                        <span className="text-sm font-black text-indigo-600">{formatMln(totals.totalRoomRev)}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-slate-100 pb-2 pl-4">
                        <span className="text-[10px] text-slate-400 font-medium italic">в т.ч. мед. пакеты (условно)</span>
                        <span className="text-xs font-bold text-slate-400">{formatMln(totals.totalInternalMedRev)}</span>
                      </div>
                      <div className="flex justify-between items-end border-b border-slate-100 pb-2">
                        <span className="text-xs text-slate-500 font-medium">Доход МЦ (Платные услуги)</span>
                        <span className="text-sm font-black text-orange-600">{formatMln(totals.totalMedAddonRev)}</span>
                      </div>
                      <div className="flex justify-between items-end pt-2">
                        <span className="text-xs font-bold text-slate-900 uppercase">ИТОГО БЮДЖЕТ</span>
                        <span className="text-lg font-black text-slate-900">{formatMln(totals.totalBudget)}</span>
                      </div>
                    </div>
                    
                    <div className="md:col-span-2 flex items-center gap-4">
                      <div className="flex-1 h-12 bg-slate-100 rounded-xl overflow-hidden flex shadow-inner">
                        <div 
                          className="h-full bg-indigo-500 relative group" 
                          style={{ width: `${(totals.totalRoomRev / totals.totalBudget) * 100}%` }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            Отель {((totals.totalRoomRev / totals.totalBudget) * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div 
                          className="h-full bg-slate-400 relative group" 
                          style={{ width: `${(totals.totalInternalMedRev / totals.totalBudget) * 100}%` }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            Мед. Пакет {((totals.totalInternalMedRev / totals.totalBudget) * 100).toFixed(0)}%
                          </div>
                        </div>
                        <div 
                          className="h-full bg-orange-500 relative group" 
                          style={{ width: `${(totals.totalMedAddonRev / totals.totalBudget) * 100}%` }}
                        >
                          <div className="absolute inset-0 flex items-center justify-center text-[10px] text-white font-bold opacity-0 group-hover:opacity-100 transition-opacity">
                            Мед. Доп {((totals.totalMedAddonRev / totals.totalBudget) * 100).toFixed(0)}%
                          </div>
                        </div>
                      </div>
                      <div className="text-[10px] text-slate-400 uppercase font-bold leading-tight">
                        Распределение <br/> доходов
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* План/Факт по категориям */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <RefreshCw size={16} className="text-indigo-500" />
                      План/Факт по категориям номеров
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-100 text-[10px] text-slate-400 uppercase">
                            <th className="text-left py-2">Категория</th>
                            <th className="text-center">Загр. План % <br/><span className="lowercase font-normal">(средняя)</span></th>
                            <th className="text-center">Загр. Факт %</th>
                            <th className="text-right">Номеро-ночи <br/><span className="lowercase font-normal">(план)</span></th>
                            <th className="text-right">Доход План</th>
                            <th className="text-right">Доход Факт</th>
                          </tr>
                        </thead>
                        <tbody>
                          {ROOM_TYPES.map(rt => {
                            const planRev = totals.byRoomPlan[rt.key as keyof typeof totals.byRoomPlan];
                            const fact = roomFact[rt.key as keyof typeof roomFact];
                            
                            // Расчет плановых номеро-ночей для конкретной категории
                            const rtRN = seasons.reduce((acc, s, i) => {
                               const roomCount = rooms[rt.key as keyof typeof rooms] || 0;
                               return acc + (roomCount * s.days * (seasonData[i].occPlan / 100));
                            }, 0);

                            const avgOccPlan = seasons.reduce((acc, s, i) => acc + (seasonData[i].occPlan * s.days), 0) / seasons.reduce((acc, s) => acc + s.days, 0);
                            
                            return (
                              <tr key={rt.key} className="border-b border-slate-50">
                                <td className="py-2 font-bold">{rt.label}</td>
                                <td className="text-center text-slate-500 font-medium">{avgOccPlan.toFixed(1)}%</td>
                                <td className="text-center">
                                  <input type="number" value={fact.occ || ''} placeholder="0" onChange={(e) => handleRoomFactChange(rt.key, 'occ', e.target.value)} className="w-12 text-center border-b border-slate-200 outline-none focus:border-indigo-500" />
                                </td>
                                <td className="text-right font-mono text-slate-400">{Math.round(rtRN).toLocaleString()}</td>
                                <td className="text-right font-mono">{formatMln(planRev)}</td>
                                <td className="text-right">
                                  <input type="number" value={fact.rev || ''} placeholder="0" onChange={(e) => handleRoomFactChange(rt.key, 'rev', e.target.value)} className="w-20 text-right border-b border-slate-200 outline-none focus:border-indigo-500 font-bold text-indigo-600" />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  {/* План/Факт по пакетам */}
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Activity size={16} className="text-indigo-500" />
                      План/Факт по пакетам
                    </h3>
                    <div className="overflow-x-auto">
                      <table className="w-full text-xs">
                        <thead>
                          <tr className="border-b border-slate-100">
                            <th className="text-left py-2">Пакет</th>
                            <th className="text-center">Доля План %</th>
                            <th className="text-center">Доля Факт %</th>
                            <th className="text-right">Доход План</th>
                            <th className="text-right">Доход Факт</th>
                          </tr>
                        </thead>
                        <tbody>
                          {PACKAGES.map(pk => {
                            const planRev = totals.byPkgPlan[pk.key as keyof typeof totals.byPkgPlan];
                            const fact = pkgFact[pk.key as keyof typeof pkgFact];
                            return (
                              <tr key={pk.key} className="border-b border-slate-50">
                                <td className="py-2 font-bold">{pk.short}</td>
                                <td className="text-center text-slate-400">{pkgMix[pk.key as keyof typeof pkgMix]}%</td>
                                <td className="text-center">
                                  <input type="number" value={fact.share || ''} placeholder="0" onChange={(e) => handlePkgFactChange(pk.key, 'share', e.target.value)} className="w-12 text-center border-b border-slate-200 outline-none focus:border-indigo-500" />
                                </td>
                                <td className="text-right font-mono">{formatMln(planRev)}</td>
                                <td className="text-right">
                                  <input type="number" value={fact.rev || ''} placeholder="0" onChange={(e) => handlePkgFactChange(pk.key, 'rev', e.target.value)} className="w-20 text-right border-b border-slate-200 outline-none focus:border-indigo-500 font-bold text-indigo-600" />
                                </td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Calendar size={16} className="text-indigo-500" />
                      Доход по месяцам (План)
                    </h3>
                    <div className="space-y-3">
                      {MONTHS.map((m, i) => {
                        const rev = totals.monthResults[i].mRev;
                        const pct = (rev / totals.totalRev) * 100;
                        return (
                          <div key={i} className="group">
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-600">{m.name}</span>
                              <span className="font-bold">{formatMln(rev)}</span>
                            </div>
                            <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                              <motion.div initial={{ width: 0 }} animate={{ width: `${pct}%` }} className="h-full bg-indigo-500 rounded-full" />
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Activity size={16} className="text-indigo-500" />
                      Микс программ (План %)
                    </h3>
                    <div className="space-y-4">
                      {PACKAGES.map(pk => (
                        <div key={pk.key} className={`p-3 rounded-lg ${pk.bg} border border-transparent`}>
                          <div className="flex justify-between items-center">
                            <p className={`text-[10px] font-bold uppercase tracking-wider ${pk.color}`}>{pk.label}</p>
                            {pk.restricted && <span className="text-[8px] bg-red-100 text-red-600 px-1 rounded">Только Низкий/Межсезонье</span>}
                          </div>
                          <div className="flex items-center gap-2 mt-1">
                            <input 
                              type="number" 
                              value={pkgMix[pk.key as keyof typeof pkgMix]}
                              onChange={(e) => setPkgMix(prev => ({ ...prev, [pk.key]: parseInt(e.target.value) || 0 }))}
                              className="w-12 text-lg font-bold bg-transparent outline-none"
                            />
                            <span className="text-slate-400 font-bold">%</span>
                            {pk.maxShare && <span className="text-[10px] text-slate-400 ml-auto">Макс: {pk.maxShare}%</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                      <span className="text-xs text-slate-500">Сумма:</span>
                      <span className={`text-sm font-bold ${Object.values(pkgMix).reduce((a: number, b: number) => a + b, 0) === 100 ? 'text-emerald-600' : 'text-red-600'}`}>
                        {Object.values(pkgMix).reduce((a: number, b: number) => a + b, 0)}%
                      </span>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'marketing' && (
              <motion.div 
                key="marketing"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="bg-slate-900 text-white p-6">
                    <h2 className="text-xl font-bold flex items-center gap-2"><Sparkles className="text-indigo-400" /> Наполнение тарифов и Перечень услуг</h2>
                    <p className="text-xs text-slate-400 mt-1 uppercase tracking-widest">Детализация включенных услуг по основным пакетам</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200">
                          <th className="p-4 font-bold text-slate-900">Перечень услуг</th>
                          <th className="p-4 text-center font-bold text-indigo-600">Ультра</th>
                          <th className="p-4 text-center font-bold text-purple-600">Ультра + СПА</th>
                          <th className="p-4 text-center font-bold text-orange-600">Ультра + Мед</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        <tr>
                          <td className="p-4 font-medium">Проживание в номерах согласно категории</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="p-4 font-medium">Питание «Шведский стол» (Завтрак, Обед, Ужин)</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                        </tr>
                        <tr>
                          <td className="p-4 font-medium">Промежуточное питание (холодные закуски и напитки)</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="p-4 font-medium">Аквапарк (бассейны, термальные зоны, горки)</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                        </tr>
                        <tr>
                          <td className="p-4 font-medium">Посещение детского клуба</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="p-4 font-medium">Посещение СПА комплекса</td>
                          <td className="p-4 text-center text-xs text-slate-500">С 10:00 до 12:00</td>
                          <td className="p-4 text-center text-xs text-slate-500">По расписанию + 15% скидка</td>
                          <td className="p-4 text-center text-xs text-slate-500">от 7 ночей</td>
                        </tr>
                        <tr>
                          <td className="p-4 font-medium">Анимационные программы</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="p-4 font-medium">Спортивный комплекс (1 час в день бесплатно)</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                        </tr>
                        <tr>
                          <td className="p-4 font-medium">Оборудованный пляж</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+</td>
                        </tr>
                        <tr className="bg-slate-50/50">
                          <td className="p-4 font-medium">Базовая программа лечения</td>
                          <td className="p-4 text-center text-slate-300">—</td>
                          <td className="p-4 text-center text-slate-300">—</td>
                          <td className="p-4 text-center text-emerald-500 font-bold">+ (от 7 ночей)</td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
                    <h3 className="font-bold text-slate-900 mb-4 flex items-center gap-2"><AlertCircle size={18} className="text-indigo-500" /> Правила размещения и доп. места</h3>
                    <div className="text-xs space-y-3 text-slate-600">
                      <p className="font-bold text-slate-400 uppercase text-[9px] tracking-wider">Система размещения:</p>
                      <ul className="space-y-2">
                        <li className="flex justify-between border-b border-slate-50 pb-1">
                          <span>Основное место (от 12 лет)</span>
                          <span className="font-bold">100% (по прайсу)</span>
                        </li>
                        <li className="flex justify-between border-b border-slate-50 pb-1">
                          <span>Основное место (дети 3-12 лет)</span>
                          <span className="font-bold">80% от осн. места</span>
                        </li>
                        <li className="flex justify-between border-b border-slate-50 pb-1">
                          <span>Доп. место (взрослые)</span>
                          <span className="font-bold">80% от осн. места</span>
                        </li>
                        <li className="flex justify-between border-b border-slate-50 pb-1">
                          <span>Доп. место (дети 3-12 лет)</span>
                          <span className="font-bold">60% от осн. места</span>
                        </li>
                        <li className="flex justify-between border-b border-slate-50 pb-1">
                          <span>Одноместное размещение (коэф.)</span>
                          <span className="font-bold text-indigo-600">1.8</span>
                        </li>
                        <li className="flex justify-between border-b border-slate-50 pb-1">
                          <span>Дети до 3-х лет (без места/пит.)</span>
                          <span className="font-bold text-emerald-600">БЕСПЛАТНО</span>
                        </li>
                      </ul>
                      <div className="mt-4 p-3 bg-slate-50 rounded-lg space-y-2 italic text-[10px]">
                        <p>* Не допускается продажа основного детского места при наличии взрослого на доп. месте.</p>
                        <p>** Доп. места предоставляются после покупки двух основных мест.</p>
                        <p>*** Центр оставляет за собой право изменять перечень услуг.</p>
                      </div>
                    </div>
                  </div>

                  <div className="bg-indigo-900 text-white p-6 rounded-2xl shadow-sm">
                    <h3 className="font-bold mb-4 flex items-center gap-2"><TrendingUp size={18} className="text-indigo-400" /> Рекомендации по продажам</h3>
                    <div className="space-y-4 text-sm text-indigo-100">
                      <p>• <b>Акцент на Медикал</b>: В низкий сезон (Периоды 1, 2, 3, 10) необходимо удерживать долю пакета "Med" не ниже 30% для обеспечения ADR.</p>
                      <p>• <b>Стимулирование СПА</b>: В межсезонье предлагать апгрейд с Ultra до SPA со скидкой 50% при бронировании от 3-х ночей.</p>
                      <p>• <b>Динамическое ценообразование</b>: При достижении загрузки 80% в Периоде 7 (Высокий сезон) — повышать цены на 10-15% на категорию "Стандарт".</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'roomOcc' && (
              <motion.div 
                key="roomOcc"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="p-4 bg-slate-50 border-b border-slate-200 flex flex-wrap gap-3 justify-between items-start">
                  <div>
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">План / Факт загрузки по категориям номеров</h2>
                    <p className="text-[10px] text-slate-500 mt-1">Данные этой таблицы используются в расчёте — раздел «Сезоны и периоды» отображает те же цифры в разбивке по месяцам.</p>
                  </div>
                  <div className="text-right">
                    <p className="text-[10px] text-slate-400 uppercase font-bold">Средняя загрузка по модели</p>
                    <p className="text-lg font-black text-indigo-600">{totals.totalAvgOcc.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full data-table">
                    <thead>
                      <tr>
                        <th rowSpan={2} className="w-32">Месяц</th>
                        {ROOM_TYPES.map(rt => (
                          <th key={rt.key} colSpan={2} className="text-center border-l border-slate-700">{rt.label}</th>
                        ))}
                      </tr>
                      <tr>
                        {ROOM_TYPES.map(rt => (
                          <React.Fragment key={rt.key}>
                            <th className="text-[8px] bg-slate-800 border-l border-slate-700 text-center">План %</th>
                            <th className="text-[8px] bg-slate-700 text-center">Факт %</th>
                          </React.Fragment>
                        ))}
                      </tr>
                    </thead>
                    <tbody>
                      {MONTHS.map((m, mIdx) => (
                        <tr key={mIdx}>
                          <td className="font-bold bg-slate-50">{m.name}</td>
                          {ROOM_TYPES.map(rt => (
                            <React.Fragment key={rt.key}>
                              <td className="text-center border-l border-slate-100">
                                <input 
                                  type="number" 
                                  value={roomMonthlyData[mIdx][rt.key].plan} 
                                  onChange={(e) => handleRoomMonthlyChange(mIdx, rt.key, 'plan', e.target.value)} 
                                  className="w-12 text-center text-xs font-bold text-indigo-600 outline-none bg-transparent" 
                                />
                              </td>
                              <td className="text-center bg-slate-50">
                                <input 
                                  type="number" 
                                  value={roomMonthlyData[mIdx][rt.key].fact || ''} 
                                  placeholder="0" 
                                  onChange={(e) => handleRoomMonthlyChange(mIdx, rt.key, 'fact', e.target.value)} 
                                  className="w-12 text-center text-xs font-bold text-slate-400 outline-none bg-transparent" 
                                />
                              </td>
                            </React.Fragment>
                          ))}
                        </tr>
                      ))}
                      <tr className="bg-slate-900 text-white font-bold">
                        <td className="p-2 uppercase text-[10px]">Средняя за период</td>
                        {ROOM_TYPES.map(rt => {
                          const avgPlan = roomMonthlyData.reduce((acc, m) => acc + m[rt.key].plan, 0) / MONTHS.length;
                          const avgFact = roomMonthlyData.reduce((acc, m) => acc + m[rt.key].fact, 0) / MONTHS.length;
                          return (
                            <React.Fragment key={rt.key}>
                              <td className="text-center border-l border-slate-700 text-indigo-300">{avgPlan.toFixed(1)}%</td>
                              <td className="text-center text-slate-400">{avgFact > 0 ? avgFact.toFixed(1) + '%' : '—'}</td>
                            </React.Fragment>
                          );
                        })}
                      </tr>
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'periods' && (
              <motion.div
                key="periods"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Прогноз по месяцам */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center flex-wrap gap-2">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Прогноз по месяцам</h2>
                      <p className="text-[10px] text-slate-500 mt-0.5">Показатели пересчитаны с учётом цен прейскуранта внутри каждого месяца. Загрузка управляется в разделе «Загрузка».</p>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full data-table min-w-[900px]">
                      <thead>
                        <tr>
                          <th className="text-left">Месяц</th>
                          <th>Дней</th>
                          <th>Загрузка план %</th>
                          <th>Загрузка факт %</th>
                          <th>Номеро-ночи</th>
                          <th className="bg-indigo-900">Койко-дни</th>
                          <th>ADR, ₽</th>
                          <th>Выручка</th>
                          <th>Расходы</th>
                          <th className="bg-emerald-900">GOP</th>
                          <th>GOP %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MONTHS.map((m, mIdx) => {
                          const r = totals.monthResults[mIdx];
                          const totalRooms = (Object.values(rooms) as number[]).reduce((a, b) => a + b, 0);
                          // Weighted average occ from roomMonthlyData (same source as calculation)
                          const avgPlanOcc = ROOM_TYPES.reduce((acc, rt) => {
                            const rc = rooms[rt.key as keyof typeof rooms] || 0;
                            return acc + roomMonthlyData[mIdx][rt.key].plan * rc;
                          }, 0) / (totalRooms || 1);
                          const avgFactOcc = ROOM_TYPES.reduce((acc, rt) => {
                            const rc = rooms[rt.key as keyof typeof rooms] || 0;
                            return acc + (roomMonthlyData[mIdx][rt.key].fact || 0) * rc;
                          }, 0) / (totalRooms || 1);
                          const gopColor = r.mGOPMargin >= 30 ? 'text-emerald-600' : r.mGOPMargin >= 15 ? 'text-amber-600' : 'text-red-600';
                          return (
                            <tr key={mIdx} className="hover:bg-slate-50 transition-colors">
                              <td className="font-bold text-slate-900">{m.name}</td>
                              <td className="text-center font-mono text-slate-500">{m.days}</td>
                              <td className="text-center font-bold text-indigo-600">{avgPlanOcc.toFixed(1)}%</td>
                              <td className="text-center text-slate-400">{avgFactOcc > 0 ? avgFactOcc.toFixed(1) + '%' : '—'}</td>
                              <td className="text-right font-mono">{Math.round(r.mRN).toLocaleString()}</td>
                              <td className="text-right font-mono font-bold text-indigo-600">{Math.round(r.mBedDays).toLocaleString()}</td>
                              <td className="text-right font-mono">{Math.round(r.mADR).toLocaleString()}</td>
                              <td className="text-right font-bold text-slate-900">{formatMln(r.mRev + r.mMedAddonRev)}</td>
                              <td className="text-right text-red-700">{formatMln(r.mTotalCosts)}</td>
                              <td className={`text-right font-bold ${gopColor}`}>{formatMln(r.mGOP)}</td>
                              <td className={`text-center font-bold ${gopColor}`}>{r.mGOPMargin.toFixed(1)}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-900 text-white font-bold">
                          <td className="p-2 uppercase text-[10px]">ИТОГО ГОД</td>
                          <td className="text-center">{MONTHS.reduce((a, b) => a + b.days, 0)}</td>
                          <td className="text-center text-indigo-300">{totals.totalAvgOcc.toFixed(1)}%</td>
                          <td className="text-center text-slate-400">—</td>
                          <td className="text-right font-mono">{Math.round(totals.totalRN).toLocaleString()}</td>
                          <td className="text-right font-mono text-indigo-300">{Math.round(totals.totalBedDays).toLocaleString()}</td>
                          <td className="text-right font-mono">{Math.round(totals.totalADR).toLocaleString()}</td>
                          <td className="text-right text-white">{formatMln(totals.totalBudget)}</td>
                          <td className="text-right text-red-300">{formatMln(totals.totalCosts)}</td>
                          <td className="text-right text-emerald-300">{formatMln(totals.totalGOP)}</td>
                          <td className="text-center text-emerald-300">{totals.totalGOPMargin.toFixed(1)}%</td>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Справочник ценовых периодов прейскуранта */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Справочник ценовых периодов прейскуранта</h2>
                    <p className="text-[10px] text-slate-500 mt-0.5">Периоды определяют, какие цены из прейскуранта применяются к датам внутри каждого месяца. Изменение коэффициента гостей влияет на расчёт койко-дней.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full data-table">
                      <thead>
                        <tr>
                          <th className="text-left">Период / Даты</th>
                          <th>Дней</th>
                          <th>Низкий сезон</th>
                          <th>Коэф. гостей</th>
                          <th>Номеро-ночи (расчёт)</th>
                          <th className="bg-indigo-900">Койко-дни (расчёт)</th>
                          <th>Выручка периода</th>
                        </tr>
                      </thead>
                      <tbody>
                        {seasons.map((s, i) => {
                          const res = totals.seasonResults[i];
                          return (
                            <tr key={i} className="hover:bg-slate-50 transition-colors">
                              <td className="font-medium">
                                <input
                                  type="text"
                                  value={s.name}
                                  onChange={(e) => handleSeasonPeriodChange(i, 'name', e.target.value)}
                                  className="w-full font-bold text-slate-900 outline-none bg-transparent mb-1"
                                />
                                <input
                                  type="text"
                                  value={s.dates}
                                  onChange={(e) => handleSeasonPeriodChange(i, 'dates', e.target.value)}
                                  className="w-full text-[10px] text-slate-400 font-normal outline-none bg-transparent"
                                />
                              </td>
                              <td className="text-center font-mono">
                                <input
                                  type="number"
                                  value={s.days}
                                  onChange={(e) => handleSeasonPeriodChange(i, 'days', e.target.value)}
                                  className="w-12 text-center font-mono outline-none bg-transparent border-b border-slate-100 focus:border-indigo-300"
                                />
                              </td>
                              <td className="text-center">
                                <input
                                  type="checkbox"
                                  checked={!!s.isLow}
                                  onChange={(e) => handleSeasonPeriodChange(i, 'isLow', e.target.checked)}
                                  className="w-4 h-4 accent-indigo-600"
                                />
                              </td>
                              <td className="text-center">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={seasonData[i].guests}
                                  onChange={(e) => handleSeasonChange(i, 'guests', e.target.value)}
                                  className="w-16 input-minimal text-center"
                                />
                              </td>
                              <td className="text-right font-mono text-slate-500">{Math.round(res.sRN).toLocaleString()}</td>
                              <td className="text-right font-mono font-bold text-indigo-600">{Math.round(res.sBedDays).toLocaleString()}</td>
                              <td className="text-right font-bold text-slate-900">{formatMln(res.sRev)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'segments' && (
              <motion.div 
                key="segments"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
              >
                <div className="p-4 bg-slate-50 border-b border-slate-200">
                  <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">План / Факт по сегментам продаж</h2>
                  <p className="text-[10px] text-slate-500 mt-1">Распределение доходов по каналам продаж (в % и млн ₽)</p>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full data-table min-w-[1200px]">
                    <thead>
                      <tr>
                        <th rowSpan={2} className="w-32 bg-slate-900 sticky left-0 z-10">Месяц</th>
                        <th colSpan={4} className="text-center border-l border-slate-700 bg-blue-900">Прямые продажи</th>
                        <th colSpan={4} className="text-center border-l border-slate-700 bg-indigo-900">Туроператоры (ТО)</th>
                        <th colSpan={4} className="text-center border-l border-slate-700 bg-emerald-900">ФСС / Соцстрах</th>
                        <th colSpan={4} className="text-center border-l border-slate-700 bg-purple-900">Корпораты / MICE</th>
                        <th colSpan={4} className="text-center border-l border-slate-700 bg-slate-800">OTA (Бронирование)</th>
                      </tr>
                      <tr>
                        <th className="text-[8px] bg-slate-800 border-l border-slate-700 text-center">План %</th>
                        <th className="text-[8px] bg-slate-700 text-center">Факт %</th>
                        <th className="text-[8px] bg-slate-800 border-l border-slate-600 text-center">План ₽</th>
                        <th className="text-[8px] bg-slate-600 text-center">Факт ₽</th>
                        
                        <th className="text-[8px] bg-slate-800 border-l border-slate-700 text-center">План %</th>
                        <th className="text-[8px] bg-slate-700 text-center">Факт %</th>
                        <th className="text-[8px] bg-slate-800 border-l border-slate-600 text-center">План ₽</th>
                        <th className="text-[8px] bg-slate-600 text-center">Факт ₽</th>
                        
                        <th className="text-[8px] bg-slate-800 border-l border-slate-700 text-center">План %</th>
                        <th className="text-[8px] bg-slate-700 text-center">Факт %</th>
                        <th className="text-[8px] bg-slate-800 border-l border-slate-600 text-center">План ₽</th>
                        <th className="text-[8px] bg-slate-600 text-center">Факт ₽</th>
                        
                        <th className="text-[8px] bg-slate-800 border-l border-slate-700 text-center">План %</th>
                        <th className="text-[8px] bg-slate-700 text-center">Факт %</th>
                        <th className="text-[8px] bg-slate-800 border-l border-slate-600 text-center">План ₽</th>
                        <th className="text-[8px] bg-slate-600 text-center">Факт ₽</th>
                        
                        <th className="text-[8px] bg-slate-800 border-l border-slate-700 text-center">План %</th>
                        <th className="text-[8px] bg-slate-700 text-center">Факт %</th>
                        <th className="text-[8px] bg-slate-800 border-l border-slate-600 text-center">План ₽</th>
                        <th className="text-[8px] bg-slate-600 text-center">Факт ₽</th>
                      </tr>
                    </thead>
                    <tbody>
                      {MONTHS.map((m, mIdx) => (
                        <tr key={mIdx} className="hover:bg-slate-50 transition-colors">
                          <td className="font-bold bg-slate-50 sticky left-0 z-10 border-r border-slate-200">{m.name}</td>
                          {['direct', 'to', 'fss', 'corp', 'ota'].map(seg => {
                            const mRev = totals.monthResults[mIdx].mRev;
                            const planPct = segmentData[mIdx][seg as keyof typeof segmentData[0]].plan;
                            const planRev = mRev * (planPct / 100);
                            const fact = segmentData[mIdx][seg as keyof typeof segmentData[0]];
                            return (
                              <React.Fragment key={seg}>
                                <td className="text-center border-l border-slate-100">
                                  <input type="number" value={planPct} onChange={(e) => handleSegmentChange(mIdx, seg, 'plan', e.target.value)} className="w-10 text-center text-xs font-bold text-indigo-600 outline-none bg-transparent" />
                                </td>
                                <td className="text-center bg-slate-50">
                                  <input type="number" value={fact.fact || ''} placeholder="0" onChange={(e) => handleSegmentChange(mIdx, seg, 'fact', e.target.value)} className="w-10 text-center text-xs font-bold text-slate-400 outline-none bg-transparent" />
                                </td>
                                <td className="text-center bg-indigo-50 border-l border-slate-200">
                                  <span className="text-[9px] font-mono text-indigo-400">{(planRev / 1000000).toFixed(1)}</span>
                                </td>
                                <td className="text-center bg-emerald-50">
                                  <input type="number" value={fact.revFact || ''} placeholder="0" onChange={(e) => handleSegmentChange(mIdx, seg, 'revFact', e.target.value)} className="w-14 text-center text-[10px] font-bold text-emerald-600 outline-none bg-transparent" />
                                </td>
                              </React.Fragment>
                            );
                          })}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </motion.div>
            )}

            {activeTab === 'kpi' && (
              <motion.div 
                key="kpi"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                    <div>
                      <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Операционные KPI (План / Факт)</h2>
                      <p className="text-[10px] text-slate-500 mt-1">Детальный расчет по заездам, койко-дням и эффективности</p>
                    </div>
                    <button className="flex items-center gap-2 text-xs font-bold text-indigo-600 hover:text-indigo-700 transition-colors" onClick={() => window.print()}>
                      <Printer size={14} /> Печать отчета
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full data-table text-[11px]">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="text-left py-3 px-4">Показатель / Месяц</th>
                          {MONTHS.map(m => <th key={m.name} className="text-center">{m.name}</th>)}
                          <th className="bg-indigo-800 text-center">ИТОГО / СРЕД.</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {/* Загрузка */}
                        <tr className="bg-slate-50/50">
                          <td className="font-bold py-2 px-4">Загрузка номеров (%)</td>
                          {MONTHS.map((m, i) => (
                            <td key={i} className="text-center">
                              <div className="font-bold text-indigo-600">{totals.monthResults[i].mAvgOcc.toFixed(1)}%</div>
                              <div className="text-[9px] text-slate-400">{totals.monthResults[i].mAvgOccFact > 0 ? totals.monthResults[i].mAvgOccFact.toFixed(1) + '%' : '—'}</div>
                            </td>
                          ))}
                          <td className="text-center font-bold bg-indigo-50 text-indigo-700">{totals.totalAvgOcc.toFixed(1)}%</td>
                        </tr>
                        
                        {/* Койко-дни */}
                        <tr>
                          <td className="font-bold py-2 px-4">Койко-дни (чел-дни)</td>
                          {MONTHS.map((m, i) => (
                            <td key={i} className="text-center">
                              <div className="font-bold">{Math.round(totals.monthResults[i].mBedDays).toLocaleString()}</div>
                              <div className="text-[9px] text-slate-400">{totals.monthResults[i].mBedDaysFact > 0 ? Math.round(totals.monthResults[i].mBedDaysFact).toLocaleString() : '—'}</div>
                            </td>
                          ))}
                          <td className="text-center font-bold bg-indigo-50">{Math.round(totals.totalBedDays).toLocaleString()}</td>
                        </tr>

                        {/* Заезды */}
                        <tr className="bg-slate-50/50">
                          <td className="font-bold py-2 px-4">Кол-во заездов (чел)</td>
                          {MONTHS.map((m, i) => (
                            <td key={i} className="text-center">
                              <div className="font-bold text-emerald-600">{Math.round(totals.monthResults[i].mCheckIns).toLocaleString()}</div>
                              <div className="text-[9px] text-slate-400">{totals.monthResults[i].mCheckInsFact > 0 ? Math.round(totals.monthResults[i].mCheckInsFact).toLocaleString() : '—'}</div>
                            </td>
                          ))}
                          <td className="text-center font-bold bg-emerald-50 text-emerald-700">
                            {Math.round(totals.monthResults.reduce((acc, m) => acc + m.mCheckIns, 0)).toLocaleString()}
                          </td>
                        </tr>

                        {/* Медцентр */}
                        <tr>
                          <td className="font-bold py-2 px-4">Нагрузка Медцентра (чел-дни)</td>
                          {MONTHS.map((m, i) => (
                            <td key={i} className="text-center">
                              <div className="font-bold text-orange-600">{Math.round(totals.monthResults[i].mMedBedDays).toLocaleString()}</div>
                              <div className="text-[9px] text-slate-400">{totals.monthResults[i].mMedBedDaysFact > 0 ? Math.round(totals.monthResults[i].mMedBedDaysFact).toLocaleString() : '—'}</div>
                            </td>
                          ))}
                          <td className="text-center font-bold bg-orange-50 text-orange-700">
                            {Math.round(totals.monthResults.reduce((acc, m) => acc + m.mMedBedDays, 0)).toLocaleString()}
                          </td>
                        </tr>

                        {/* ADR */}
                        <tr className="bg-slate-50/50">
                          <td className="font-bold py-2 px-4">ADR (Цена номера, ₽)</td>
                          {MONTHS.map((m, i) => {
                            const adr = totals.monthResults[i].mRN > 0 ? totals.monthResults[i].mRev / totals.monthResults[i].mRN : 0;
                            const adrFact = totals.monthResults[i].mRNFact > 0 ? totals.monthResults[i].mRevFact / totals.monthResults[i].mRNFact : 0;
                            return (
                              <td key={i} className="text-center">
                                <div className="font-bold">{Math.round(adr).toLocaleString()}</div>
                                <div className="text-[9px] text-slate-400">{adrFact > 0 ? Math.round(adrFact).toLocaleString() : '—'}</div>
                              </td>
                            );
                          })}
                          <td className="text-center font-bold bg-indigo-50">
                            {Math.round(totals.totalRev / totals.totalRN).toLocaleString()}
                          </td>
                        </tr>

                        {/* RevPAB */}
                        <tr>
                          <td className="font-bold py-2 px-4">Цена 1 к-дня (средняя, ₽)</td>
                          {MONTHS.map((m, i) => {
                            const revpab = totals.monthResults[i].mBedDays > 0 ? totals.monthResults[i].mRev / totals.monthResults[i].mBedDays : 0;
                            const revpabFact = totals.monthResults[i].mBedDaysFact > 0 ? totals.monthResults[i].mRevFact / totals.monthResults[i].mBedDaysFact : 0;
                            return (
                              <td key={i} className="text-center">
                                <div className="font-bold text-indigo-600">{Math.round(revpab).toLocaleString()}</div>
                                <div className="text-[9px] text-slate-400">{revpabFact > 0 ? Math.round(revpabFact).toLocaleString() : '—'}</div>
                              </td>
                            );
                          })}
                          <td className="text-center font-bold bg-indigo-50 text-indigo-700">
                            {Math.round(totals.totalRev / totals.totalBedDays).toLocaleString()}
                          </td>
                        </tr>
                      </tbody>
                    </table>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Цена к-дня по пакетам (средняя)</h3>
                    <div className="space-y-3">
                      {PACKAGES.map(pk => {
                        const pkgRev = totals.byPkgPlan[pk.key as keyof typeof totals.byPkgPlan];
                        // Estimate bed days for this package: totalBedDays * (pkgMix / 100)
                        const pkgBD = totals.totalBedDays * (pkgMix[pk.key as keyof typeof pkgMix] / 100);
                        const avgPrice = pkgBD > 0 ? pkgRev / pkgBD : 0;
                        return (
                          <div key={pk.key} className="flex justify-between items-center text-sm">
                            <span className="text-slate-600">{pk.label}</span>
                            <span className="font-bold font-mono">{Math.round(avgPrice).toLocaleString()} ₽</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Средняя продолжительность (ALOS)</h3>
                    <div className="space-y-3">
                      {PACKAGES.map(pk => (
                        <div key={pk.key} className="flex justify-between items-center text-sm">
                          <span className="text-slate-600">{pk.label}</span>
                          <span className="font-bold font-mono">{pk.alos} дн.</span>
                        </div>
                      ))}
                    </div>
                  </div>
                  
                  <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 md:col-span-2">
                    <h3 className="text-xs font-bold text-slate-400 uppercase mb-4">Аналитическая справка</h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-xs leading-relaxed text-slate-600">
                      <div className="space-y-2">
                        <p>• <b>Пропускная способность</b>: Максимальное кол-во койко-дней в месяц при 100% загрузке и среднем коэф. 2.2 составляет <b>{Math.round(((Object.values(rooms) as number[]).reduce((a, b) => a + b, 0) * 30 * 2.2)).toLocaleString()}</b>.</p>
                        <p>• <b>Питание</b>: Расчет продуктов должен базироваться на показателе "Койко-дни". Пиковые нагрузки ожидаются в Июле-Августе.</p>
                      </div>
                      <div className="space-y-2">
                        <p>• <b>Медицина</b>: Пакет "Med" имеет самый высокий ALOS (12 дн), что обеспечивает стабильность загрузки лечебной базы, но требует контроля пропускной способности кабинетов.</p>
                        <p>• <b>ADR vs RevPAB</b>: Разрыв между ценой номера и ценой койко-дня сокращается при увеличении количества гостей в номере (высокий сезон).</p>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'pricelist' && (
              <motion.div 
                key="pricelist"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-8"
              >
                <div className="flex justify-between items-center no-print">
                  <h2 className="text-xl font-bold text-slate-900">Прейскурант цен 2026</h2>
                  <button 
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <Printer size={18} />
                    Печать Прейскуранта
                  </button>
                </div>
                {seasons.map((s, sIdx) => (
                  <div key={sIdx} className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                      <div className="flex items-center gap-4 flex-1">
                        <input 
                          type="text" 
                          value={s.name} 
                          onChange={(e) => handleSeasonPeriodChange(sIdx, 'name', e.target.value)}
                          className="text-sm font-bold text-slate-700 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none transition-all"
                        />
                        <input 
                          type="text" 
                          value={s.dates} 
                          onChange={(e) => handleSeasonPeriodChange(sIdx, 'dates', e.target.value)}
                          className="text-xs font-normal text-slate-400 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none transition-all"
                        />
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 uppercase font-bold">Дней:</span>
                        <input 
                          type="number" 
                          value={s.days} 
                          onChange={(e) => handleSeasonPeriodChange(sIdx, 'days', e.target.value)}
                          className="w-10 text-xs font-bold text-slate-600 bg-transparent border-b border-transparent hover:border-slate-300 focus:border-indigo-500 outline-none transition-all text-center"
                        />
                      </div>
                    </div>
                    <div className="overflow-x-auto">
                      <table className="w-full data-table">
                        <thead>
                          <tr>
                            <th className="w-48">Категория</th>
                            {PACKAGES.map(pk => (
                              <th key={pk.key} className="text-center">
                                {pk.short}
                                {pk.key === 'promo' && (
                                  <div className="text-[8px] font-normal text-slate-400 mt-1">
                                    -{promoDiscount}% от {PACKAGES.find(p => p.key === promoBasePkg)?.short}
                                  </div>
                                )}
                              </th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {ROOM_TYPES.map(rt => (
                            <tr key={rt.key}>
                              <td className="font-semibold text-slate-700">{rt.label}</td>
                              {PACKAGES.map(pk => (
                                <td key={pk.key} className="text-center">
                                  <input 
                                    type="number" 
                                    value={prices[rt.key][pk.key][sIdx] || ''}
                                    placeholder="—"
                                    onChange={(e) => handlePriceChange(rt.key, pk.key, sIdx, e.target.value)}
                                    disabled={pk.key === 'promo'}
                                    className={`w-20 text-center font-mono font-bold py-1 rounded border-b-2 border-transparent focus:border-indigo-50 focus:bg-indigo-50 transition-all outline-none ${prices[rt.key][pk.key][sIdx] === 0 ? 'text-slate-300' : pk.color} ${pk.key === 'promo' ? 'opacity-50 cursor-not-allowed' : ''}`}
                                  />
                                </td>
                              ))}
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                ))}
              </motion.div>
            )}

            {activeTab === 'packages' && (
              <motion.div 
                key="packages"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold mb-1">Управление миксом программ</h3>
                  {(() => {
                    const total = Object.values(pkgMix).reduce((a, b) => a + b, 0);
                    const diff = total - 100;
                    return (
                      <div className={`mb-4 px-3 py-2 rounded-lg text-xs font-bold flex items-center gap-2 ${Math.abs(diff) < 0.1 ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-red-50 text-red-700 border border-red-200'}`}>
                        <AlertCircle size={14} />
                        {Math.abs(diff) < 0.1 ? `Сумма миксов: 100% — корректно` : `Сумма миксов: ${total}% (должно быть 100%). Расхождение: ${diff > 0 ? '+' : ''}${diff.toFixed(0)}%`}
                      </div>
                    );
                  })()}
                  <div className="space-y-4">
                    {PACKAGES.map(pk => {
                      const isPromo = pk.key === 'promo';
                      const lowSeasonCount = seasons.filter(s => s.isLow).length;
                      const hasHighSeason = !seasons.every(s => s.isLow);
                      return (
                        <div key={pk.key} className="flex items-center justify-between">
                          <div>
                            <span className="text-sm text-slate-600">{pk.label}</span>
                            {isPromo && pkgMix.promo > 0 && hasHighSeason && (
                              <p className="text-[10px] text-amber-600 font-bold mt-0.5 flex items-center gap-1">
                                <AlertCircle size={10} /> В высокий сезон ПРОМО автоматически обнуляется в расчёте
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <input type="number" value={pkgMix[pk.key as keyof typeof pkgMix]} onChange={(e) => setPkgMix(prev => ({ ...prev, [pk.key]: parseInt(e.target.value) || 0 }))} className="w-16 text-right font-bold border rounded p-1" />
                            <span className="text-xs text-slate-400">%</span>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><Sparkles size={18} className="text-indigo-500" /> Настройка ПРОМО тарифа</h3>
                  <div className="space-y-6">
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Базовый тариф для расчета</label>
                      <select 
                        value={promoBasePkg} 
                        onChange={(e) => setPromoBasePkg(e.target.value)}
                        className="w-full border rounded-lg p-2 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        {PACKAGES.filter(p => p.key !== 'promo').map(p => (
                          <option key={p.key} value={p.key}>{p.label}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="text-xs font-bold text-slate-500 uppercase block mb-2">Размер скидки (%)</label>
                      <div className="flex items-center gap-4">
                        <input 
                          type="range" 
                          min="0" 
                          max="50" 
                          step="1" 
                          value={promoDiscount} 
                          onChange={(e) => setPromoDiscount(parseInt(e.target.value))} 
                          className="flex-1 accent-indigo-600"
                        />
                        <div className="flex items-center gap-2">
                          <input 
                            type="number" 
                            value={promoDiscount} 
                            onChange={(e) => setPromoDiscount(parseInt(e.target.value) || 0)} 
                            className="w-16 text-right font-bold border rounded p-1" 
                          />
                          <span className="text-sm font-bold text-slate-400">%</span>
                        </div>
                      </div>
                    </div>
                    <div className="p-4 bg-indigo-50 rounded-lg border border-indigo-100">
                      <p className="text-xs text-indigo-700 leading-relaxed">
                        <b>Автоматический расчет:</b> Тариф ПРОМО будет составлять <b>{100 - promoDiscount}%</b> от цены тарифа <b>{PACKAGES.find(p => p.key === promoBasePkg)?.label}</b>. 
                        Расчет применяется только для Низких сезонов.
                      </p>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-900 text-white p-6 rounded-xl shadow-sm md:col-span-2">
                  <h3 className="font-bold mb-4 flex items-center gap-2"><AlertCircle size={16} className="text-orange-400" /> Правила модели</h3>
                  <ul className="text-xs space-y-3 text-slate-300">
                    <li>• <b>Аква туры</b>: рекомендуемая доля до 10%. Включают BB/HB/FB + Акватермальный комплекс.</li>
                    <li>• <b>Акции, ПРОМО</b>: доля до 5%. Действуют только в Низкий сезон. Цена рассчитывается автоматически на базе выбранного тарифа и скидки.</li>
                    <li>• <b>Койко-дни</b>: рассчитываются как Номеро-ночи × Коэффициент гостей (в среднем 2.1 - 2.7).</li>
                    <li>• <b>Реалистичность</b>: модель настроена на доход 1.2 - 1.25 млрд. При превышении проверьте цены и загрузку.</li>
                  </ul>
                </div>
              </motion.div>
            )}

            {activeTab === 'calculation' && (
              <motion.div 
                key="calculation"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Configuration Section */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-200 no-print">
                  <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-slate-800">
                    <Calculator className="text-indigo-500" /> 
                    Настройка коэффициентов калькуляции
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* FB, Ultra, SPA */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Тарифы FB, Ultra, Ultra+SPA</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Питание %</label>
                          <input type="number" value={calcConfig.fb_ultra_spa.food} onChange={(e) => setCalcConfig(prev => ({ ...prev, fb_ultra_spa: { ...prev.fb_ultra_spa, food: parseInt(e.target.value) || 0 } }))} className="w-full border rounded p-2 font-bold" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Проживание %</label>
                          <input type="number" value={calcConfig.fb_ultra_spa.acc} onChange={(e) => setCalcConfig(prev => ({ ...prev, fb_ultra_spa: { ...prev.fb_ultra_spa, acc: parseInt(e.target.value) || 0 } }))} className="w-full border rounded p-2 font-bold" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">SPA %</label>
                          <input type="number" value={calcConfig.fb_ultra_spa.spa} onChange={(e) => setCalcConfig(prev => ({ ...prev, fb_ultra_spa: { ...prev.fb_ultra_spa, spa: parseInt(e.target.value) || 0 } }))} className="w-full border rounded p-2 font-bold" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Медицина %</label>
                          <input type="number" value={calcConfig.fb_ultra_spa.med} onChange={(e) => setCalcConfig(prev => ({ ...prev, fb_ultra_spa: { ...prev.fb_ultra_spa, med: parseInt(e.target.value) || 0 } }))} className="w-full border rounded p-2 font-bold" />
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Завтрак %</label>
                          <input type="number" value={calcConfig.fb_ultra_spa.b} onChange={(e) => setCalcConfig(prev => ({ ...prev, fb_ultra_spa: { ...prev.fb_ultra_spa, b: parseInt(e.target.value) || 0 } }))} className="w-full border rounded p-1 text-sm" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Обед %</label>
                          <input type="number" value={calcConfig.fb_ultra_spa.l} onChange={(e) => setCalcConfig(prev => ({ ...prev, fb_ultra_spa: { ...prev.fb_ultra_spa, l: parseInt(e.target.value) || 0 } }))} className="w-full border rounded p-1 text-sm" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ужин %</label>
                          <input type="number" value={calcConfig.fb_ultra_spa.d} onChange={(e) => setCalcConfig(prev => ({ ...prev, fb_ultra_spa: { ...prev.fb_ultra_spa, d: parseInt(e.target.value) || 0 } }))} className="w-full border rounded p-1 text-sm" />
                        </div>
                      </div>
                    </div>

                    {/* Ultra+MED */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Тарифы Ultra+MED</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Питание %</label>
                          <input type="number" value={calcConfig.ultra_med.food} onChange={(e) => setCalcConfig(prev => ({ ...prev, ultra_med: { ...prev.ultra_med, food: parseInt(e.target.value) || 0 } }))} className="w-full border rounded p-2 font-bold" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Проживание %</label>
                          <input type="number" value={calcConfig.ultra_med.acc} onChange={(e) => setCalcConfig(prev => ({ ...prev, ultra_med: { ...prev.ultra_med, acc: parseInt(e.target.value) || 0 } }))} className="w-full border rounded p-2 font-bold" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">SPA %</label>
                          <input type="number" value={calcConfig.ultra_med.spa} onChange={(e) => setCalcConfig(prev => ({ ...prev, ultra_med: { ...prev.ultra_med, spa: parseInt(e.target.value) || 0 } }))} className="w-full border rounded p-2 font-bold" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Медицина %</label>
                          <input type="number" value={calcConfig.ultra_med.med} onChange={(e) => setCalcConfig(prev => ({ ...prev, ultra_med: { ...prev.ultra_med, med: parseInt(e.target.value) || 0 } }))} className="w-full border rounded p-2 font-bold" />
                        </div>
                      </div>
                      <div className="pt-2 border-t border-slate-100 grid grid-cols-3 gap-2">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Завтрак %</label>
                          <input type="number" value={calcConfig.ultra_med.b} onChange={(e) => setCalcConfig(prev => ({ ...prev, ultra_med: { ...prev.ultra_med, b: parseInt(e.target.value) || 0 } }))} className="w-full border rounded p-1 text-sm" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Обед %</label>
                          <input type="number" value={calcConfig.ultra_med.l} onChange={(e) => setCalcConfig(prev => ({ ...prev, ultra_med: { ...prev.ultra_med, l: parseInt(e.target.value) || 0 } }))} className="w-full border rounded p-1 text-sm" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-400 block mb-1">Ужин %</label>
                          <input type="number" value={calcConfig.ultra_med.d} onChange={(e) => setCalcConfig(prev => ({ ...prev, ultra_med: { ...prev.ultra_med, d: parseInt(e.target.value) || 0 } }))} className="w-full border rounded p-1 text-sm" />
                        </div>
                      </div>
                    </div>

                    {/* BB / HB */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-black uppercase text-slate-400 tracking-widest">Тарифы BB / HB (Прочие)</h3>
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">SPA %</label>
                          <input type="number" value={calcConfig.others.spa} onChange={(e) => setCalcConfig(prev => ({ ...prev, others: { ...prev.others, spa: parseInt(e.target.value) || 0 } }))} className="w-full border rounded p-2 font-bold" />
                        </div>
                        <div>
                          <label className="text-[10px] uppercase font-bold text-slate-500 block mb-1">Медицина %</label>
                          <input type="number" value={calcConfig.others.med} onChange={(e) => setCalcConfig(prev => ({ ...prev, others: { ...prev.others, med: parseInt(e.target.value) || 0 } }))} className="w-full border rounded p-2 font-bold" />
                        </div>
                      </div>
                      <p className="text-[9px] text-slate-400 italic mt-2">* Питание для BB/HB рассчитывается на основе стоимости завтрака/ужина из тарифа Ultra. Остаток относится на проживание.</p>
                    </div>
                  </div>
                </div>

                {/* Calculation Table Section */}
                <div className="bg-white p-8 rounded-2xl shadow-lg border border-slate-200 print:shadow-none print:border-none">
                  <div className="flex justify-between items-center mb-8 no-print">
                    <div className="flex gap-4">
                      <select value={calcSeason} onChange={(e) => setCalcSeason(parseInt(e.target.value))} className="border rounded-lg px-3 py-2 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500">
                        {SEASONS.map((s, i) => <option key={i} value={i}>{s.name} ({s.dates})</option>)}
                      </select>
                      <select value={calcRoom} onChange={(e) => setCalcRoom(e.target.value)} className="border rounded-lg px-3 py-2 font-bold text-slate-700 outline-none focus:ring-2 focus:ring-indigo-500">
                        {ROOM_TYPES.map(rt => <option key={rt.key} value={rt.key}>{rt.label}</option>)}
                      </select>
                    </div>
                    <button onClick={() => window.print()} className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all">
                      <Printer size={18} /> Печать калькуляции
                    </button>
                  </div>

                  <div className="text-center mb-8">
                    <h1 className="text-xl font-black uppercase tracking-tight">Калькуляционная карта тарифов</h1>
                    <p className="text-sm text-slate-500 uppercase font-bold tracking-widest">
                      {ROOM_TYPES.find(r => r.key === calcRoom)?.label} · {SEASONS[calcSeason].name} ({SEASONS[calcSeason].dates})
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="p-3 border border-slate-700 text-left">Тариф</th>
                          <th className="p-3 border border-slate-700 text-right">Цена</th>
                          <th className="p-3 border border-slate-700 text-center" colSpan={3}>Питание (Б/О/У)</th>
                          <th className="p-3 border border-slate-700 text-right">SPA</th>
                          <th className="p-3 border border-slate-700 text-right">Мед.</th>
                          <th className="p-3 border border-slate-700 text-right">Прожив.</th>
                          <th className="p-3 border border-slate-700 text-right">Итого</th>
                        </tr>
                      </thead>
                      <tbody>
                        {PACKAGES.map(pk => {
                          const price = prices[calcRoom][pk.key][calcSeason];
                          if (price === 0) return null;

                          // Calculation logic
                          const getBaseFood = () => {
                            const ultraPrice = prices[calcRoom]['ultra'][calcSeason];
                            const foodTotal = ultraPrice * calcConfig.fb_ultra_spa.food / 100;
                            return {
                              b: Math.round(foodTotal * calcConfig.fb_ultra_spa.b / 100),
                              l: Math.round(foodTotal * calcConfig.fb_ultra_spa.l / 100),
                              d: Math.round(foodTotal * calcConfig.fb_ultra_spa.d / 100)
                            };
                          };

                          let b=0, l=0, d=0, spa=0, med=0, acc=0;

                          if (['aqua_fb', 'ultra', 'spa', 'promo'].includes(pk.key)) {
                            const foodTotal = price * calcConfig.fb_ultra_spa.food / 100;
                            b = Math.round(foodTotal * calcConfig.fb_ultra_spa.b / 100);
                            l = Math.round(foodTotal * calcConfig.fb_ultra_spa.l / 100);
                            d = Math.round(foodTotal * calcConfig.fb_ultra_spa.d / 100);
                            spa = Math.round(price * calcConfig.fb_ultra_spa.spa / 100);
                            med = Math.round(price * calcConfig.fb_ultra_spa.med / 100);
                            acc = Math.round(price * calcConfig.fb_ultra_spa.acc / 100);
                          } else if (pk.key === 'med') {
                            const foodTotal = price * calcConfig.ultra_med.food / 100;
                            b = Math.round(foodTotal * calcConfig.ultra_med.b / 100);
                            l = Math.round(foodTotal * calcConfig.ultra_med.l / 100);
                            d = Math.round(foodTotal * calcConfig.ultra_med.d / 100);
                            spa = Math.round(price * calcConfig.ultra_med.spa / 100);
                            med = Math.round(price * calcConfig.ultra_med.med / 100);
                            acc = Math.round(price * calcConfig.ultra_med.acc / 100);
                          } else if (pk.key === 'aqua_bb') {
                            const base = getBaseFood();
                            b = base.b;
                            spa = Math.round(price * calcConfig.others.spa / 100);
                            med = Math.round(price * calcConfig.others.med / 100);
                            acc = price - b - spa - med;
                          } else if (pk.key === 'aqua_hb') {
                            const base = getBaseFood();
                            b = base.b;
                            d = base.d;
                            spa = Math.round(price * calcConfig.others.spa / 100);
                            med = Math.round(price * calcConfig.others.med / 100);
                            acc = price - b - d - spa - med;
                          }

                          const sum = b + l + d + spa + med + acc;

                          return (
                            <tr key={pk.key} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 border border-slate-200 font-bold">{pk.label}</td>
                              <td className="p-3 border border-slate-200 text-right font-mono bg-slate-50">{price.toLocaleString()}</td>
                              <td className="p-3 border border-slate-200 text-right text-xs text-slate-500">{b.toLocaleString()}</td>
                              <td className="p-3 border border-slate-200 text-right text-xs text-slate-500">{l.toLocaleString()}</td>
                              <td className="p-3 border border-slate-200 text-right text-xs text-slate-500">{d.toLocaleString()}</td>
                              <td className="p-3 border border-slate-200 text-right">{spa.toLocaleString()}</td>
                              <td className="p-3 border border-slate-200 text-right">{med.toLocaleString()}</td>
                              <td className="p-3 border border-slate-200 text-right font-bold text-indigo-600">{acc.toLocaleString()}</td>
                              <td className={`p-3 border border-slate-200 text-right font-black ${sum !== price ? 'text-red-500' : 'text-slate-900'}`}>{sum.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-8 grid grid-cols-2 gap-8 text-[10px] uppercase font-bold text-slate-400">
                    <div>
                      <p className="mb-8">Составил: ___________________ / Финансовая служба /</p>
                      <p>Проверил: ___________________ / Коммерческий директор /</p>
                    </div>
                    <div className="text-right">
                      <p className="mb-8">Утверждаю: ___________________ / Аналитик /</p>
                      <p>Дата: {new Date().toLocaleDateString('ru-RU')}</p>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 'settings' && (
              <motion.div 
                key="settings"
                initial={{ opacity: 0, y: 10 }} 
                animate={{ opacity: 1, y: 0 }} 
                exit={{ opacity: 0, y: -10 }}
                className="max-w-2xl mx-auto space-y-6"
              >
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-200">
                  <h2 className="text-xl font-bold mb-6 flex items-center gap-2"><RefreshCw className="text-indigo-500" /> Настройка фонда</h2>
                  <div className="space-y-6">
                    {ROOM_TYPES.map(rt => (
                      <div key={rt.key} className="flex items-center justify-between p-4 bg-slate-50 rounded-xl">
                        <div><p className="font-bold text-slate-900">{rt.label}</p><p className="text-xs text-slate-500">Доступно для продажи</p></div>
                        <div className="flex items-center gap-3">
                          <input type="number" value={rooms[rt.key as keyof typeof rooms]} onChange={(e) => setRooms(prev => ({ ...prev, [rt.key]: parseInt(e.target.value) || 0 }))} className="w-24 text-right text-xl font-bold bg-white border border-slate-200 rounded-lg px-3 py-2 outline-none" />
                          <span className="text-slate-400 font-medium">ед.</span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-8 pt-6 border-t border-slate-100 flex justify-between items-center">
                    <span className="text-slate-500 font-medium">Итого:</span>
                    <span className={`text-2xl font-black ${Object.values(rooms).reduce((a: number, b: number) => a + b, 0) === 467 ? 'text-emerald-600' : 'text-orange-500'}`}>
                      {Object.values(rooms).reduce((a: number, b: number) => a + b, 0)} / 467
                    </span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>
    </div>
  );
}
