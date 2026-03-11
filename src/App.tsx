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
  Layers,
  Lock,
  Table2,
  FileText
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
  { key: 'low',      name: 'Низкий',    dates: 'ноябрь–апрель',        defaultOcc: 40, defaultGuests: 2.2, isLow: true },
  { key: 'mid',      name: 'Средний',   dates: 'май, октябрь',          defaultOcc: 55, defaultGuests: 2.2 },
  { key: 'high',     name: 'Высокий',   dates: 'июнь, сентябрь',        defaultOcc: 72, defaultGuests: 2.5 },
  { key: 'peak',     name: 'Пик',       dates: 'июль–август',           defaultOcc: 85, defaultGuests: 2.7 },
  { key: 'holidays', name: 'Праздники', dates: '23фев, 8мар, майские',  defaultOcc: 88, defaultGuests: 2.3 },
];

const PRICE_PERIODS = [
  { pIdx: 0, dates: "12.02–19.02",                                     sKey: 'low',      isLow: true },
  { pIdx: 1, dates: "20.02–23.02 / 06.03–09.03 / 28.03–30.04",        sKey: 'low',      isLow: true },
  { pIdx: 2, dates: "24.02–05.03 / 10.03–27.03",                       sKey: 'low',      isLow: true },
  { pIdx: 3, dates: "01.05–02.05 / 08.05–10.05",                       sKey: 'holidays'              },
  { pIdx: 4, dates: "03.05–07.05 / 11.05–31.05",                       sKey: 'mid'                   },
  { pIdx: 5, dates: "01.06–20.06",                                      sKey: 'high'                  },
  { pIdx: 6, dates: "21.06–24.08",                                      sKey: 'peak'                  },
  { pIdx: 7, dates: "25.08–30.09",                                      sKey: 'high'                  },
  { pIdx: 8, dates: "01.10–31.10",                                      sKey: 'mid'                   },
  { pIdx: 9, dates: "01.11–28.12",                                      sKey: 'low',      isLow: true },
];

const MONTHS = [
  { name: "Январь",   days: 31, distribution: [{ pIdx: 9, sKey: 'low',      days: 31 }] },
  { name: "Февраль",  days: 28, distribution: [{ pIdx: 9, sKey: 'low',      days: 11 }, { pIdx: 0, sKey: 'low', days: 8 }, { pIdx: 1, sKey: 'low', days: 9 }] },
  { name: "Март",     days: 31, distribution: [{ pIdx: 2, sKey: 'low',      days: 5  }, { pIdx: 1, sKey: 'low', days: 4 }, { pIdx: 2, sKey: 'low', days: 18 }, { pIdx: 1, sKey: 'low', days: 4 }] },
  { name: "Апрель",   days: 30, distribution: [{ pIdx: 1, sKey: 'low',      days: 30 }] },
  { name: "Май",      days: 31, distribution: [{ pIdx: 3, sKey: 'holidays', days: 2  }, { pIdx: 4, sKey: 'mid', days: 5 }, { pIdx: 3, sKey: 'holidays', days: 3 }, { pIdx: 4, sKey: 'mid', days: 21 }] },
  { name: "Июнь",     days: 30, distribution: [{ pIdx: 5, sKey: 'high',     days: 20 }, { pIdx: 6, sKey: 'peak', days: 10 }] },
  { name: "Июль",     days: 31, distribution: [{ pIdx: 6, sKey: 'peak',     days: 31 }] },
  { name: "Август",   days: 31, distribution: [{ pIdx: 6, sKey: 'peak',     days: 24 }, { pIdx: 7, sKey: 'high', days: 7 }] },
  { name: "Сентябрь", days: 30, distribution: [{ pIdx: 7, sKey: 'high',     days: 30 }] },
  { name: "Октябрь",  days: 31, distribution: [{ pIdx: 8, sKey: 'mid',      days: 31 }] },
  { name: "Ноябрь",   days: 30, distribution: [{ pIdx: 9, sKey: 'low',      days: 30 }] },
  { name: "Декабрь",  days: 31, distribution: [{ pIdx: 9, sKey: 'low',      days: 31 }] },
];

const initialPrices = () => {
  const p: any = {
    standard: {
      aqua_bb: [2500, 3200, 2900, 3600, 3400, 5000, 7100, 5500, 2700, 2500],
      aqua_hb: [2900, 3600, 3300, 4000, 3800, 5400, 7500, 5900, 3100, 2900],
      aqua_fb: [3100, 3800, 3500, 4200, 4000, 5600, 7700, 6100, 3300, 3100],
      ultra:   [3300, 4000, 3700, 4400, 4200, 5800, 7900, 6300, 3500, 3300],
      spa:     [3900, 4600, 4300, 5000, 4800, 6600, 9000, 7100, 4100, 3900],
      med:     [4100, 4800, 4500, 5200, 5000, 6800, 9200, 7300, 4300, 4100],
    },
    comfort: {
      aqua_bb: [2700, 3400, 3100, 3800, 3600, 5200, 7300, 5700, 2900, 2700],
      aqua_hb: [3100, 3800, 3500, 4200, 4000, 5600, 7700, 6100, 3300, 3100],
      aqua_fb: [3300, 4000, 3700, 4400, 4200, 5800, 7900, 6300, 3500, 3300],
      ultra:   [3500, 4200, 3900, 4600, 4400, 6000, 8100, 6500, 3700, 3500],
      spa:     [4100, 4800, 4500, 5200, 5000, 6800, 9200, 7300, 4300, 4100],
      med:     [4300, 5000, 4700, 5400, 5200, 7000, 9400, 7500, 4500, 4300],
    },
    lux: {
      aqua_bb: [3400, 4100, 3800, 4500, 4300, 6200, 8700, 6800, 3700, 3400],
      aqua_hb: [3800, 4500, 4200, 4900, 4700, 6600, 9100, 7200, 4100, 3800],
      aqua_fb: [4000, 4700, 4400, 5100, 4900, 6800, 9300, 7400, 4300, 4000],
      ultra:   [4200, 4900, 4600, 5300, 5100, 7000, 9500, 7600, 4500, 4200],
      spa:     [4800, 5500, 5200, 5900, 5700, 7800, 10600, 8400, 5100, 4800],
      med:     [5000, 5700, 5400, 6100, 5900, 8000, 10800, 8600, 5300, 5000],
    }
  };
  Object.keys(p).forEach(rt => {
    p[rt].promo = PRICE_PERIODS.map((pp, i) => Math.round(p[rt].ultra[i] * 0.9));
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
          const threeDays = 1 * 24 * 60 * 60 * 1000;
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
    "AQVASPA2026": "OWNER",
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
        setAllState(getBlankState());
        setIsSandbox(true);
        localStorage.setItem('sochi_sandbox', 'true');
      } else {
        // Non-demo login: if previous session was sandbox/demo, reload page for clean state
        if (isSandbox || localStorage.getItem('sochi_sandbox') === 'true') {
          localStorage.setItem('sochi_role', role);
          localStorage.setItem('sochi_sandbox', 'false');
          window.location.reload();
          return;
        }
        setIsSandbox(false);
        localStorage.setItem('sochi_sandbox', 'false');
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
      localStorage.removeItem('sochi_sandbox');
      localStorage.removeItem('sochi_demo_start');
    } catch (e) {}
    setIsSandbox(false);
  };
  const [rooms, setRooms] = useState({ standard: 227, comfort: 240, lux: 0 });
  const DEFAULT_PKG_MIX = { aqua_bb: 2, aqua_hb: 3, aqua_fb: 5, ultra: 40, spa: 20, med: 25, promo: 5 };
  const [pkgMixByMonth, setPkgMixByMonth] = useState<Array<typeof DEFAULT_PKG_MIX>>(MONTHS.map(() => ({ ...DEFAULT_PKG_MIX })));
  const [prices, setPrices] = useState(initialPrices());
  const [seasons, setSeasons] = useState(SEASONS);
  const [targetGOPMargin, setTargetGOPMargin] = useState(40); // Target GOP Margin %
  const [seasonData, setSeasonData] = useState(() =>
    Object.fromEntries(SEASONS.map(s => [s.key, { occPlan: s.defaultOcc, occFact: 0, guests: s.defaultGuests }]))
  );
  const [segmentData, setSegmentData] = useState(MONTHS.map(() => ({
    direct: { plan: 20, fact: 0, revFact: 0 },
    to: { plan: 20, fact: 0, revFact: 0 },
    fss: { plan: 20, fact: 0, revFact: 0 },
    corp: { plan: 25, fact: 0, revFact: 0 },
    ota: { plan: 15, fact: 0, revFact: 0 },
  })));
  const [segmentCoeffs, setSegmentCoeffs] = useState({
    direct: 100, // % от прайса (прямые продажи — базовая цена)
    to:      78, // % — туроператоры (скидка ~22%)
    fss:     70, // % — ФСС / квоты (фиксированная цена по контракту)
    corp:    88, // % — корпоративный (скидка ~12%)
    ota:     85, // % — OTA нетто (после комиссии ~15%)
  });

  const [segRefreshedAt, setSegRefreshedAt] = useState<Date | null>(null);

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
    // food/spa/med/acc должны суммироваться в 100% от цены
    // b/l/d (завтрак/обед/ужин) должны суммироваться в 100% от food
    fb_ultra_spa: { food: 50, b: 25, l: 35, d: 40, spa: 5, med: 5, acc: 40 },
    ultra_med:    { food: 30, b: 25, l: 35, d: 40, spa: 5, med: 25, acc: 40 },
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

  // Факт данные по месяцам (ручной ввод для план/факт анализа)
  const [monthlyFact, setMonthlyFact] = useState(MONTHS.map(() => ({
    occFact: 0,  // Факт загрузка %
    rnFact: 0,   // Факт номеро-ночи
    revFact: 0,  // Факт выручка
  })));

  // Коэффициент гостей по месяцам (редактируемый, влияет на койко-дни)
  const [monthlyGuestCoeff, setMonthlyGuestCoeff] = useState(() =>
    MONTHS.map(m =>
      parseFloat((m.distribution.reduce((acc, dist) => {
        const s = SEASONS.find(s => s.key === dist.sKey)!;
        return acc + s.defaultGuests * dist.days;
      }, 0) / m.days).toFixed(2))
    )
  );

  const [detailMonth, setDetailMonth] = useState(2); // default: Март

  const [promoBasePkg, setPromoBasePkg] = useState('ultra');
  const [promoDiscount, setPromoDiscount] = useState(10);

  const [medAddonConfig, setMedAddonConfig] = useState({
    // Поток 1: Med-пакет (уже приехали на лечение, покупают доп. процедуры)
    medConversion: 50,   // % от койко-дней Med-гостей
    medAvgCheck: 3000,   // ₽ средний чек на доп. процедуру
    // Поток 2: Велнес (Ultra/SPA — готовы к процедурам)
    welnesConversion: 20,
    welnesAvgCheck: 2000,
    // Поток 3: Туристы (BB/HB/FB/PROMO — редко идут в МЦ)
    touristConversion: 5,
    touristAvgCheck: 1200,
    // Legacy (не используется в расчётах, сохраняется для совместимости)
    maxConversion: 5,
    avgCheck: 1200,
    procsPerGuest: 1,
  });

  const [roomMonthlyData, setRoomMonthlyData] = useState(MONTHS.map((m, mIdx) => {
    const data: any = {};
    ROOM_TYPES.forEach(rt => {
      // Calculate initial plan based on seasonal defaults
      const weightedOcc = m.distribution.reduce((acc, dist) => {
        const s = SEASONS.find(s => s.key === dist.sKey)!;
        return acc + (s.defaultOcc * dist.days);
      }, 0) / m.days;
      data[rt.key] = { plan: Math.round(weightedOcc), fact: 0 };
    });
    return data;
  }));

  // --- Blank state for demo users ---
  const getBlankState = () => ({
    rooms: { standard: 0, comfort: 0, lux: 0 },
    pkgMixByMonth: MONTHS.map(() => ({ aqua_bb: 0, aqua_hb: 0, aqua_fb: 0, ultra: 0, spa: 0, med: 0, promo: 0 })),
    prices: Object.fromEntries(ROOM_TYPES.map(rt => [rt.key, Object.fromEntries(PACKAGES.map(pk => [pk.key, new Array(10).fill(0)]))])),
    roomMonthlyData: MONTHS.map(() => Object.fromEntries(ROOM_TYPES.map(rt => [rt.key, { plan: 0, fact: 0 }]))),
    monthlyFact: MONTHS.map(() => ({ occFact: 0, rnFact: 0, revFact: 0 })),
    monthlyGuestCoeff: MONTHS.map(() => 2.0),
    segmentData: MONTHS.map(() => ({
      direct: { plan: 20, fact: 0, revFact: 0 },
      to: { plan: 20, fact: 0, revFact: 0 },
      fss: { plan: 20, fact: 0, revFact: 0 },
      corp: { plan: 25, fact: 0, revFact: 0 },
      ota: { plan: 15, fact: 0, revFact: 0 },
    })),
    globalPriceAdj: 0,
    globalOccAdj: 0,
    expenseModel: { utilities: 0, maintenance: 0, marketing: 0, admin: 0, insurance: 0, lease: 0, security: 0, it: 0, laundry: 0, other: 0 },
  });

  // --- Data Sync Logic ---
  const getAllState = () => ({
    rooms, pkgMixByMonth, prices, seasons, seasonData, segmentData, segmentCoeffs,
    costConfig, calcConfig, medAddonConfig, roomMonthlyData,
    globalPriceAdj, globalOccAdj, expenseModel, monthlyFact, monthlyGuestCoeff
  });

  const setAllState = (data: any) => {
    if (!data) return;
    if (data.rooms) setRooms(data.rooms);
    // Migration: old format had single pkgMix object → convert to 12-month array
    if (data.pkgMix && !data.pkgMixByMonth) {
      data.pkgMixByMonth = MONTHS.map(() => ({ ...data.pkgMix }));
    }
    if (data.pkgMixByMonth) setPkgMixByMonth(data.pkgMixByMonth);
    // Migration: recalculate PROMO prices where they are 0 for non-low periods
    // (old system set PROMO=0 for non-low seasons; new system allows PROMO everywhere)
    if (data.prices) {
      const migratedPrices = data.prices;
      ROOM_TYPES.forEach(rt => {
        PRICE_PERIODS.forEach(pp => {
          if (!pp.isLow) {
            const promoVal = migratedPrices[rt.key]?.promo?.[pp.pIdx];
            const ultraVal = migratedPrices[rt.key]?.ultra?.[pp.pIdx];
            if (promoVal === 0 && ultraVal > 0) {
              migratedPrices[rt.key].promo[pp.pIdx] = Math.round(ultraVal * 0.9);
            }
          }
        });
      });
      setPrices(migratedPrices);
    }
    if (data.seasons) setSeasons(data.seasons);
    if (data.seasonData) setSeasonData(data.seasonData);
    if (data.segmentData) setSegmentData(data.segmentData);
    if (data.segmentCoeffs) setSegmentCoeffs(data.segmentCoeffs);
    if (data.costConfig) setCostConfig(data.costConfig);
    if (data.calcConfig) setCalcConfig(data.calcConfig);
    if (data.medAddonConfig) setMedAddonConfig(data.medAddonConfig);
    if (data.roomMonthlyData) setRoomMonthlyData(data.roomMonthlyData);
    if (data.globalPriceAdj !== undefined) setGlobalPriceAdj(data.globalPriceAdj);
    if (data.globalOccAdj !== undefined) setGlobalOccAdj(data.globalOccAdj);
    if (data.expenseModel) setExpenseModel(data.expenseModel);
    if (data.monthlyFact) setMonthlyFact(data.monthlyFact);
    if (data.monthlyGuestCoeff) setMonthlyGuestCoeff(data.monthlyGuestCoeff);
  };

  // Load shared state on mount
  useEffect(() => {
    if (!isSandbox) {
      try {
        const saved = localStorage.getItem('sochi_model_data');
        if (saved) {
          const parsed = JSON.parse(saved);
          // Migrate: if prices use old 5-key object format, reset to initialPrices()
          const firstRt = Object.values(parsed.prices || {})[0] as any;
          const firstPk = firstRt ? Object.values(firstRt)[0] : null;
          const isOldFormat = firstPk && !Array.isArray(firstPk);
          if (isOldFormat) {
            parsed.prices = initialPrices();
          }
          setAllState(parsed);
          setLastSynced(new Date());
        }
      } catch (err) {
        console.error("Failed to load model from localStorage:", err);
      }
    }
  }, [isSandbox]);

  // Save shared state (debounced)
  useEffect(() => {
    if (isSandbox || !userRole || (userRole !== 'ADMIN' && userRole !== 'OWNER')) return;

    const timer = setTimeout(() => {
      setIsSyncing(true);
      try {
        localStorage.setItem('sochi_model_data', JSON.stringify(getAllState()));
        setLastSynced(new Date());
      } catch (err) {
        console.error("Failed to save model to localStorage:", err);
      }
      setIsSyncing(false);
    }, 2000);

    return () => clearTimeout(timer);
  }, [
    rooms, pkgMixByMonth, prices, seasons, seasonData, segmentData,
    costConfig, calcConfig, medAddonConfig, roomMonthlyData,
    globalPriceAdj, globalOccAdj, isSandbox, userRole, expenseModel, monthlyFact, monthlyGuestCoeff
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
      let mRevBase = 0; // выручка по базовому прайсу (до поправки на сегменты)

      // Взвешенный коэффициент цены по сегментам для этого месяца
      const segWeightedCoeff = (() => {
        const total = (['direct', 'to', 'fss', 'corp', 'ota'] as const).reduce((acc, segKey) => {
          const share = (segmentData[mIdx] as any)[segKey]?.plan / 100 || 0;
          const coeff = (segmentCoeffs as any)[segKey] / 100;
          return acc + share * coeff;
        }, 0);
        return total > 0 ? total : 1;
      })();

      m.distribution.forEach(dist => {
        const sKey = dist.sKey;
        const s = seasons.find(s => s.key === sKey)!;
        const data = seasonData[sKey];

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
          
          const bd = rn * monthlyGuestCoeff[mIdx];
          const bdFact = rnFact * monthlyGuestCoeff[mIdx];
          
          mBedDays += bd;
          mBedDaysFact += bdFact;
          
          // Effective mix: zero PROMO in non-low seasons, then normalize to 100%
          const rawMixes: Record<string, number> = {};
          let totalRawMix = 0;
          PACKAGES.forEach(pk => {
            let m = pkgMixByMonth[mIdx][pk.key as keyof typeof DEFAULT_PKG_MIX] / 100;
            // PROMO applies in all seasons (no season restriction)
            rawMixes[pk.key] = m;
            totalRawMix += m;
          });
          const mixNorm = totalRawMix > 0 ? 1 / totalRawMix : 0;

          PACKAGES.forEach(pk => {
            const mix = rawMixes[pk.key] * mixNorm;

            const basePrice = prices[rt.key][pk.key][dist.pIdx];
            const price = basePrice * (1 + globalPriceAdj / 100);

            const revBase = rn * mix * data.guests * price;          // базовая цена (для затрат)
            const rev = revBase * segWeightedCoeff;                   // цена с поправкой на сегменты
            const revFact = rnFact * mix * data.guests * price * segWeightedCoeff;

            mRevBase += revBase;
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

            const pkgFoodRev = revBase * (foodPct / 100);            // затраты на питание — от базовой цены
            mFoodCost += pkgFoodRev * (costConfig.foodCostPct / 100);

            // Internal Medical Revenue Component
            let medPct = 0;
            if (pk.key === 'med') medPct = calcConfig.ultra_med.med;
            else if (['aqua_fb', 'ultra', 'spa', 'promo'].includes(pk.key)) medPct = calcConfig.fb_ultra_spa.med;
            else medPct = calcConfig.others.med;
            mInternalMedRev += revBase * (medPct / 100);             // внутренняя медицина — от базовой

            byRoomPlan[rt.key as keyof typeof byRoomPlan] += rev;
            byPkgPlan[pk.key as keyof typeof byPkgPlan] += rev;
          });

          // Medical Addon: три потока гостей с разной конверсией и чеком
          const streamMedBD = bd * (rawMixes['med'] * mixNorm);
          const streamWelnesBD = bd * ((rawMixes['ultra'] + rawMixes['spa']) * mixNorm);
          const streamTouristBD = bd - streamMedBD - streamWelnesBD;

          const addonMedGuests = streamMedBD * (medAddonConfig.medConversion / 100);
          const addonWelnesGuests = streamWelnesBD * (medAddonConfig.welnesConversion / 100);
          const addonTouristGuests = Math.max(0, streamTouristBD) * (medAddonConfig.touristConversion / 100);

          mMedAddonGuests += addonMedGuests + addonWelnesGuests + addonTouristGuests;
          mMedAddonRev += addonMedGuests * medAddonConfig.medAvgCheck
                        + addonWelnesGuests * medAddonConfig.welnesAvgCheck
                        + addonTouristGuests * medAddonConfig.touristAvgCheck;
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
        mRev, mRevBase, mRN, mBedDays, mAvgOcc, mCheckIns, mMedBedDays,
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

    const seasonResults = seasons.map((s) => {
      let sRev = 0;
      let sRN = 0;
      let sBedDays = 0;

      MONTHS.forEach((m, mIdx) => {
        m.distribution.forEach(dist => {
          if (dist.sKey === s.key) {
            ROOM_TYPES.forEach(rt => {
              const roomCount = rooms[rt.key as keyof typeof rooms] || 0;
              const occPlan = roomMonthlyData[mIdx][rt.key].plan;
              const rn = roomCount * dist.days * (occPlan / 100);
              sRN += rn;
              sBedDays += rn * seasonData[s.key].guests;

              // Effective mix: zero PROMO in non-low seasons, normalize to 100%
              const sRawMixes: Record<string, number> = {};
              let sTotalRaw = 0;
              PACKAGES.forEach(pk => {
                let m = pkgMixByMonth[mIdx][pk.key as keyof typeof DEFAULT_PKG_MIX] / 100;
                // PROMO applies in all seasons (no season restriction)
                sRawMixes[pk.key] = m;
                sTotalRaw += m;
              });
              const sMixNorm = sTotalRaw > 0 ? 1 / sTotalRaw : 0;

              PACKAGES.forEach(pk => {
                const mix = sRawMixes[pk.key] * sMixNorm;
                const repPeriod = PRICE_PERIODS.find(pp => pp.sKey === s.key);
                const price = repPeriod !== undefined ? prices[rt.key][pk.key][repPeriod.pIdx] : 0;
                sRev += rn * mix * seasonData[s.key].guests * price;
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
  }, [rooms, pkgMixByMonth, prices, seasonData, roomMonthlyData, segmentData, segmentCoeffs, costConfig, calcConfig, medAddonConfig, seasons, expenseModel, monthlyGuestCoeff]);

  // Annual average package mix (for display in reports/tables)
  const avgPkgMix = Object.fromEntries(PACKAGES.map(pk => [
    pk.key,
    Math.round(pkgMixByMonth.reduce((s, m) => s + m[pk.key as keyof typeof DEFAULT_PKG_MIX], 0) / 12)
  ]));

  const formatMln = (val: number) => (val / 1000000).toFixed(1) + ' млн ₽';
  const formatThs = (val: number) => (val / 1000).toLocaleString('ru-RU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

  const handlePriceChange = (rtKey: string, pkKey: string, pIdx: number, val: string) => {
    const newVal = parseInt(val) || 0;
    setPrices((prev: any) => ({
      ...prev,
      [rtKey]: {
        ...prev[rtKey],
        [pkKey]: prev[rtKey][pkKey].map((v: number, i: number) => i === pIdx ? newVal : v),
      },
    }));
  };

  useEffect(() => {
    setPrices((prev: any) => {
      const updated = { ...prev };
      ROOM_TYPES.forEach(rt => {
        updated[rt.key].promo = PRICE_PERIODS.map((_pp, i) =>
          Math.round(updated[rt.key][promoBasePkg][i] * (1 - promoDiscount / 100))
        );
      });
      return updated;
    });
  }, [promoBasePkg, promoDiscount]);

  const handleSeasonPeriodChange = (sKey: string, field: string, val: string) => {
    setSeasons(prev => prev.map(s => s.key === sKey ? { ...s, [field]: val } : s));
  };

  const handleSeasonChange = (sKey: string, field: string, val: string) => {
    const newVal = parseFloat(val) || 0;
    setSeasonData(prev => ({ ...prev, [sKey]: { ...prev[sKey], [field]: newVal } }));
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
    const expenseRows: any[][] = (Object.entries(expenseModel) as [string, number][])
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
    <div className="bg-white p-3 md:p-4 rounded-xl shadow-sm border border-slate-200 flex items-start justify-between h-full">
      <div className="min-w-0 flex-1">
        <p className="text-[9px] md:text-xs font-medium text-slate-500 uppercase tracking-wider leading-tight">{label}</p>
        <h3 className="text-base md:text-xl font-bold mt-1 text-slate-900 leading-tight break-words">{value}</h3>
        {subValue && <p className="text-[9px] md:text-[10px] mt-1 text-slate-400 leading-tight">{subValue}</p>}
      </div>
      <div className={`p-1.5 md:p-2 rounded-lg ${color} shrink-0 ml-2`}>
        <Icon size={16} className="text-white" />
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
                  <Sparkles size={16} /> Демо-доступ (1 день)
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
            <button className="bg-slate-800 hover:bg-red-900/30 px-3 py-2 rounded-lg transition-colors text-slate-400 hover:text-red-400 flex items-center gap-2 text-sm" onClick={handleLogout}>
              <LogOut size={16} />
              <span className="hidden sm:inline">Выйти</span>
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
                { id: 'medicine', label: 'Медицина', icon: Stethoscope, roles: ['ADMIN', 'OWNER', 'DEMO'], demoLocked: true },
                { id: 'packages', label: 'Пакетные предложения', icon: Layers, demoLocked: true },
                { id: 'calculation', label: 'Калькуляция цен', icon: Calculator, roles: ['ADMIN', 'OWNER', 'DEMO'], demoLocked: true },
              ]
            },
            {
              title: 'Аналитика и Отчеты',
              roles: ['ADMIN', 'OWNER', 'DEMO'],
              color: 'text-purple-600',
              items: [
                { id: 'detail', label: 'Детальный расчёт', icon: Table2, demoLocked: true },
                { id: 'report', label: 'Отчет Аналитику', icon: Printer, demoLocked: true },
                { id: 'exec-report', label: 'Пояснительная записка', icon: FileText, roles: ['ADMIN'] },
                { id: 'marketing', label: 'Аналитик (ИИ)', icon: Sparkles, demoLocked: true },
                { id: 'kpi', label: 'Операционка (KPI)', icon: Activity, demoLocked: true },
                { id: 'critical', label: 'Анализ рисков', icon: AlertCircle, demoLocked: true },
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
                  {group.items.filter((item: any) => !item.roles || item.roles.includes(userRole as UserRole)).map((item: any) => {
                    const isLocked = userRole === 'DEMO' && item.demoLocked;
                    return (
                      <button
                        key={item.id}
                        onClick={() => {
                          if (isLocked) return;
                          setActiveTab(item.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`w-full flex items-center gap-3 px-6 py-2.5 transition-all relative group ${
                          isLocked
                            ? 'text-slate-300 cursor-not-allowed'
                            : activeTab === item.id
                              ? 'text-indigo-600 bg-indigo-50/50 font-semibold'
                              : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                        }`}
                      >
                        <item.icon size={18} className={isLocked ? 'text-slate-300' : activeTab === item.id ? 'text-indigo-600' : 'text-slate-400 group-hover:text-slate-600'} />
                        <span className="text-sm flex-1 text-left">{item.label}</span>
                        {isLocked && <Lock size={12} className="text-slate-300 shrink-0" />}
                        {!isLocked && activeTab === item.id && (
                          <motion.div
                            layoutId="activeTabIndicator"
                            className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-indigo-600 rounded-r-full"
                          />
                        )}
                      </button>
                    );
                  })}
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
                        width: `${Math.max(0, 100 - ((Date.now() - parseInt(localStorage.getItem('sochi_demo_start') || '0')) / (1 * 24 * 60 * 60 * 1000) * 100))}%` 
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
            <div className="stats-summary-cards grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-6 gap-3 md:gap-4">
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
                            {((Object.values(expenseModel) as number[]).reduce((a, b) => a + b, 0) / 1000000).toFixed(2)} млн ₽
                          </span>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-bold uppercase">Итого всех постоянных (с ФОТ) / мес:</span>
                          <span className="text-lg font-black text-indigo-700">
                            {(((Object.values(expenseModel) as number[]).reduce((a, b) => a + b, 0) + costConfig.staffingMonthly) / 1000000).toFixed(2)} млн ₽
                          </span>
                        </div>
                        <div className="mt-2 flex justify-between items-center">
                          <span className="text-xs text-slate-500 font-bold uppercase">Итого всех постоянных / год:</span>
                          <span className="text-xl font-black text-indigo-900">
                            {((((Object.values(expenseModel) as number[]).reduce((a, b) => a + b, 0) + costConfig.staffingMonthly) * 12) / 1000000).toFixed(1)} млн ₽
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

                <div className="bg-indigo-50 border border-indigo-200 p-5 rounded-xl">
                  <p className="text-sm text-indigo-700 flex items-center gap-2">
                    <Briefcase size={16} className="text-indigo-500 shrink-0" />
                    Помесячный микс программ настраивается во вкладке <b>«Пакетные предложения»</b>
                  </p>
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
                            const avgOccPlan = MONTHS.reduce((acc, m, mIdx) => acc + roomMonthlyData[mIdx][rt.key].plan * m.days, 0) / MONTHS.reduce((a, b) => a + b.days, 0);
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
                                <td className="p-2 border border-slate-200 text-center">{avgPkgMix[pk.key] ?? 0}%</td>
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
                  </div>
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
                  <h2 className="text-sm font-black uppercase tracking-widest mb-4 border-l-4 border-orange-500 pl-3">5. Рекомендации</h2>
                  {(() => {
                    const gap = totals.totalBudget - TARGET_REVENUE;
                    const isOnPlan = totals.totalBudget >= TARGET_REVENUE;
                    const isGOPOk = totals.totalGOPMargin >= targetGOPMargin;
                    const avgOtaShare = MONTHS.reduce((acc, _, i) => acc + (segmentData[i].ota?.plan || 0), 0) / 12;
                    const avgMedShare = pkgMixByMonth.reduce((acc, mix) => {
                      const total = (Object.values(mix) as number[]).reduce((a, b) => a + b, 0);
                      return acc + (total > 0 ? (mix.med / total) * 100 : 0);
                    }, 0) / 12;
                    const lowOccMonths = MONTHS.filter((_, i) => {
                      const avgOcc = ROOM_TYPES.reduce((acc, rt) => acc + roomMonthlyData[i][rt.key].plan, 0) / ROOM_TYPES.length;
                      return avgOcc < 50 && avgOcc > 0;
                    });

                    return isOnPlan ? (
                      <div className="bg-emerald-50 border border-emerald-200 p-6 rounded-lg">
                        <p className="text-sm font-bold text-emerald-900 mb-4">
                          Бюджет выполнен: {formatMln(totals.totalBudget)} из целевых {formatMln(TARGET_REVENUE)} (+{formatMln(gap)}).
                        </p>
                        <ul className="text-xs space-y-2 text-emerald-800">
                          {!isGOPOk && <li>• <b>GOP ниже цели</b>: маржа {totals.totalGOPMargin.toFixed(1)}% vs цели {targetGOPMargin}% — проверьте структуру OPEX и долю OTA-комиссий.</li>}
                          {avgOtaShare > 25 && <li>• <b>Зависимость от OTA</b>: {avgOtaShare.toFixed(0)}% продаж — переводите гостей в прямой канал для защиты маржи.</li>}
                          {avgMedShare < 25 && <li>• <b>Резерв роста</b>: доля Med {avgMedShare.toFixed(0)}% — при увеличении до 25%+ ADR вырастет без поднятия цен.</li>}
                          {!isGOPOk || avgOtaShare > 25 || avgMedShare < 25 ? null : <li>• Все ключевые показатели в норме. Удерживайте текущий микс и сезонную ценовую политику.</li>}
                        </ul>
                      </div>
                    ) : (
                      <div className="bg-orange-50 border border-orange-200 p-6 rounded-lg">
                        <p className="text-sm font-bold text-orange-900 mb-4">
                          Разрыв до плана: <span className="text-red-700">{formatMln(Math.abs(gap))}</span> — необходимы корректирующие меры.
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                          <div>
                            <h4 className="text-xs font-black uppercase text-orange-800 mb-2">Оперативные меры</h4>
                            <ul className="text-xs space-y-2 text-orange-900">
                              {avgMedShare < 25 && <li>• <b>Пересмотр микса</b>: Med в пакетах — {avgMedShare.toFixed(0)}%, поднять до 25%+ для роста ADR без увеличения загрузки.</li>}
                              {avgOtaShare > 25 && <li>• <b>Снизить OTA</b>: {avgOtaShare.toFixed(0)}% через ОТА — запустить закрытые акции по CRM для сдвига в прямой канал.</li>}
                              {lowOccMonths.length > 0 && <li>• <b>Дозагрузка</b>: в {lowOccMonths.map(m => m.name).join(', ')} загрузка ниже 50% — снизить min LOS и запустить пакеты "3+1".</li>}
                              {avgMedShare >= 25 && avgOtaShare <= 25 && lowOccMonths.length === 0 && <li>• <b>Динамическое ценообразование</b>: при загрузке ≥75% поднимайте базовые цены на 8–12%.</li>}
                            </ul>
                          </div>
                          <div>
                            <h4 className="text-xs font-black uppercase text-orange-800 mb-2">Стратегические меры</h4>
                            <ul className="text-xs space-y-2 text-orange-900">
                              {!isGOPOk && <li>• <b>OPEX-аудит</b>: маржа GOP {totals.totalGOPMargin.toFixed(1)}% ниже цели {targetGOPMargin}% — ревизия переменных затрат.</li>}
                              <li>• <b>Корпоративный сегмент</b>: при падении коммерческого спроса — временно увеличить долю MICE и ФСС.</li>
                              <li>• <b>Апсейл</b>: мотивация службы приёма предлагать повышение категории номера при заезде.</li>
                            </ul>
                          </div>
                        </div>
                      </div>
                    );
                  })()}
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

            {activeTab === 'exec-report' && userRole === 'ADMIN' && (
              <motion.div
                key="exec-report"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-0"
              >
                {/* Toolbar — скрывается при печати */}
                <div className="no-print mb-6 flex flex-wrap justify-between items-center gap-4 bg-[#1a1a2e] text-white p-4 rounded-xl shadow-lg">
                  <div className="flex items-center gap-3">
                    <FileText size={20} className="text-[#f0a500]" />
                    <div>
                      <p className="font-bold text-sm">Пояснительная записка к бюджету 2026</p>
                      <p className="text-xs text-slate-400">Для защиты перед Ген. директором и Собственником · Только ADMIN</p>
                    </div>
                  </div>
                  <button
                    onClick={() => window.print()}
                    className="flex items-center gap-2 bg-[#f0a500] text-[#1a1a2e] px-5 py-2 rounded-lg font-bold text-sm hover:bg-[#c8961a] transition-colors"
                  >
                    <Printer size={16} /> Печать / Сохранить PDF
                  </button>
                </div>

                {/* Основной документ — белый лист A4 */}
                <div className="print-container bg-white shadow-lg border border-slate-200 max-w-[210mm] mx-auto text-slate-900" style={{ fontFamily: 'Georgia, serif' }}>

                  {/* ═══════════ ОБЛОЖКА ═══════════ */}
                  <div className="bg-[#1a1a2e] text-white p-10 md:p-14">
                    <div className="flex justify-between items-start mb-10">
                      <span className="text-[10px] font-bold uppercase tracking-widest border border-[#f0a500] text-[#f0a500] px-3 py-1 rounded">Конфиденциально</span>
                      <span className="text-xs text-slate-400">{new Date().toLocaleDateString('ru-RU', { day: '2-digit', month: 'long', year: 'numeric' })}</span>
                    </div>
                    <h1 className="text-3xl md:text-4xl font-black uppercase tracking-tight mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                      Бюджет доходов
                    </h1>
                    <h2 className="text-3xl md:text-4xl font-black uppercase tracking-tight text-[#f0a500] mb-6" style={{ fontFamily: 'Arial, sans-serif' }}>
                      на 2026 год
                    </h2>
                    <p className="text-sm text-slate-400 mb-10">Aqva SPA Resort — Сочи · {(Object.values(rooms) as number[]).reduce((a, b) => a + b, 0)} номеров</p>

                    {/* KPI-карточки */}
                    <div className="grid grid-cols-3 gap-4">
                      <div className="border border-slate-600 rounded-xl p-4">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>Базовый бюджет</p>
                        <p className="text-2xl font-black text-white">{formatMln(totals.totalBudget)}</p>
                      </div>
                      <div className="border border-[#f0a500] rounded-xl p-4 bg-[#f0a500]/10">
                        <p className="text-[10px] uppercase font-bold text-[#f0a500] mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>Загрузка (год)</p>
                        <p className="text-2xl font-black text-white">{totals.totalAvgOcc.toFixed(1)}%</p>
                      </div>
                      <div className="border border-slate-600 rounded-xl p-4">
                        <p className="text-[10px] uppercase font-bold text-slate-400 mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>Маржа GOP</p>
                        <p className="text-2xl font-black text-white">{totals.totalGOPMargin.toFixed(1)}%</p>
                      </div>
                    </div>
                  </div>

                  <div className="p-8 md:p-12">

                    {/* ═══════════ 1. ПАРАМЕТРЫ МОДЕЛИ ═══════════ */}
                    <section className="mb-12 page-break-before">
                      <h2 className="text-xs font-black uppercase tracking-widest mb-5 border-l-4 border-[#1a1a2e] pl-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                        1. Текущие параметры модели
                      </h2>

                      {/* Основные KPI */}
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                        {[
                          { label: 'Номерной фонд', value: `${(Object.values(rooms) as number[]).reduce((a, b) => a + b, 0)} ном.` },
                          { label: 'Средн. загрузка', value: `${totals.totalAvgOcc.toFixed(1)}%` },
                          { label: 'ADR (год)', value: `${Math.round(totals.totalADR).toLocaleString()} ₽` },
                          { label: 'Койко-дни (год)', value: Math.round(totals.totalBedDays).toLocaleString() },
                        ].map((kpi, i) => (
                          <div key={i} className="bg-slate-50 border border-slate-200 rounded-lg p-3">
                            <p className="text-[9px] font-bold uppercase text-slate-400 mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>{kpi.label}</p>
                            <p className="text-lg font-black text-slate-900">{kpi.value}</p>
                          </div>
                        ))}
                      </div>

                      {/* Помесячная таблица */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[11px]" style={{ fontFamily: 'Arial, sans-serif' }}>
                          <thead>
                            <tr className="bg-[#1a1a2e] text-white">
                              <th className="p-2 border border-slate-300 font-bold">Месяц</th>
                              <th className="p-2 border border-slate-300 text-center font-bold">Загрузка</th>
                              <th className="p-2 border border-slate-300 text-right font-bold">Номеро-ночи</th>
                              <th className="p-2 border border-slate-300 text-right font-bold">Койко-дни</th>
                              <th className="p-2 border border-slate-300 text-right font-bold">ADR, ₽</th>
                              <th className="p-2 border border-slate-300 text-right font-bold">Доход, млн ₽</th>
                              <th className="p-2 border border-slate-300 text-center font-bold">Статус</th>
                            </tr>
                          </thead>
                          <tbody>
                            {MONTHS.map((m, mIdx) => {
                              const res = totals.monthResults[mIdx];
                              const now = new Date();
                              const monthDate = new Date(2026, mIdx, 1);
                              const isClosed = monthDate < new Date(now.getFullYear(), now.getMonth(), 1) && now.getFullYear() === 2026;
                              const isCurrent = monthDate.getMonth() === now.getMonth() && now.getFullYear() === 2026;
                              const occ = res.mAvgOcc;
                              const isPeak = occ >= 80;
                              const badgeClass = isClosed
                                ? 'bg-slate-100 text-slate-500'
                                : isCurrent
                                  ? 'bg-blue-100 text-blue-700'
                                  : isPeak
                                    ? 'bg-orange-100 text-orange-700'
                                    : 'bg-slate-50 text-slate-600';
                              const badgeLabel = isClosed ? 'закрыт' : isCurrent ? 'в работе' : isPeak ? 'пик' : 'план';
                              return (
                                <tr key={mIdx} className={mIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                  <td className="p-2 border border-slate-200 font-bold">{m.name}</td>
                                  <td className="p-2 border border-slate-200 text-center font-mono">{res.mAvgOcc.toFixed(1)}%</td>
                                  <td className="p-2 border border-slate-200 text-right font-mono">{Math.round(res.mRN).toLocaleString()}</td>
                                  <td className="p-2 border border-slate-200 text-right font-mono">{Math.round(res.mBedDays).toLocaleString()}</td>
                                  <td className="p-2 border border-slate-200 text-right font-mono">{res.mRN > 0 ? Math.round(res.mRev / res.mRN).toLocaleString() : '—'}</td>
                                  <td className="p-2 border border-slate-200 text-right font-bold">{(res.mRev / 1_000_000).toFixed(2)}</td>
                                  <td className="p-2 border border-slate-200 text-center">
                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${badgeClass}`}>{badgeLabel}</span>
                                  </td>
                                </tr>
                              );
                            })}
                            <tr className="bg-[#1a1a2e] text-white font-black">
                              <td className="p-2 border border-slate-900 uppercase">Итого</td>
                              <td className="p-2 border border-slate-900 text-center">{totals.totalAvgOcc.toFixed(1)}%</td>
                              <td className="p-2 border border-slate-900 text-right font-mono">{Math.round(totals.totalRN).toLocaleString()}</td>
                              <td className="p-2 border border-slate-900 text-right font-mono">{Math.round(totals.totalBedDays).toLocaleString()}</td>
                              <td className="p-2 border border-slate-900 text-right font-mono">{Math.round(totals.totalADR).toLocaleString()}</td>
                              <td className="p-2 border border-slate-900 text-right">{(totals.totalRev / 1_000_000).toFixed(1)}</td>
                              <td className="p-2 border border-slate-900" />
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* ═══════════ 2. АНАЛИЗ РАЗРЫВА ═══════════ */}
                    <section className="mb-12">
                      <h2 className="text-xs font-black uppercase tracking-widest mb-5 border-l-4 border-[#f0a500] pl-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                        2. Анализ разрыва: {formatMln(totals.totalBudget)} → {formatMln(TARGET_REVENUE)}
                      </h2>

                      {(() => {
                        const gap = TARGET_REVENUE - totals.totalBudget;
                        const promoGap = Math.round(gap * 0.62);
                        const mcGap = Math.round(gap * 0.20);
                        const calGap = gap - promoGap - mcGap;
                        return (
                          <>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
                              {[
                                {
                                  num: '01',
                                  title: 'PROMO 32% — зафиксированы',
                                  impact: `−${formatMln(promoGap)}`,
                                  desc: 'Акционные тарифы проданы на год вперёд. Перевести в премиальные пакеты в 2026 невозможно.',
                                  badge: 'неуправляем',
                                  color: 'border-red-200 bg-red-50',
                                  badgeColor: 'bg-red-100 text-red-700',
                                },
                                {
                                  num: '02',
                                  title: 'МЦ в рамп-апе',
                                  impact: `−${formatMln(mcGap)}`,
                                  desc: 'Медицинский центр набирает обороты. Полная загрузка — горизонт 2-й половины 2026.',
                                  badge: 'управляем частично',
                                  color: 'border-orange-200 bg-orange-50',
                                  badgeColor: 'bg-orange-100 text-orange-700',
                                },
                                {
                                  num: '03',
                                  title: 'Январь + Февраль закрыты',
                                  impact: `−${formatMln(calGap)}`,
                                  desc: 'Два месяца уже прошли. Их результат зафиксирован и не подлежит пересмотру.',
                                  badge: 'неуправляем',
                                  color: 'border-slate-200 bg-slate-50',
                                  badgeColor: 'bg-slate-100 text-slate-600',
                                },
                              ].map((f, i) => (
                                <div key={i} className={`border rounded-xl p-4 ${f.color}`}>
                                  <div className="flex justify-between items-start mb-2">
                                    <span className="text-[10px] font-black text-slate-400" style={{ fontFamily: 'Arial, sans-serif' }}>ФАКТОР {f.num}</span>
                                    <span className={`text-[9px] font-bold uppercase px-2 py-0.5 rounded-full ${f.badgeColor}`}>{f.badge}</span>
                                  </div>
                                  <p className="text-sm font-black text-slate-900 mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>{f.title}</p>
                                  <p className="text-xl font-black text-red-700 mb-2">{f.impact}</p>
                                  <p className="text-[11px] text-slate-600">{f.desc}</p>
                                </div>
                              ))}
                            </div>
                            <div className="bg-[#1a1a2e] text-white rounded-xl p-5">
                              <p className="text-sm font-bold mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>Вывод</p>
                              <p className="text-[12px] leading-relaxed text-slate-300">
                                Разрыв до {formatMln(TARGET_REVENUE)} — <strong className="text-white">не ошибки управления</strong>, а объективные ограничения сезона 2026.
                                Реалистичный бюджет: <strong className="text-[#f0a500]">{formatMln(totals.totalBudget)}–{formatMln(totals.totalBudget * 1.09)}</strong>.
                                Цель {formatMln(TARGET_REVENUE)} — горизонт 2027 при полном рамп-апе МЦ и пересмотре PROMO-квот.
                              </p>
                            </div>
                          </>
                        );
                      })()}
                    </section>

                    {/* ═══════════ 3. ТРИ СЦЕНАРИЯ ═══════════ */}
                    <section className="mb-12">
                      <h2 className="text-xs font-black uppercase tracking-widest mb-5 border-l-4 border-[#1a1a2e] pl-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                        3. Три сценария бюджета
                      </h2>

                      {(() => {
                        const base = totals.totalBudget;
                        const opt = base * 1.03;
                        const max = base * 1.09;
                        return (
                          <>
                            <div className="grid grid-cols-3 gap-4 mb-5">
                              {[
                                { label: 'Базовый', value: formatMln(base), sub: 'Текущая модель без изменений', color: 'border-slate-200 bg-slate-50', accent: 'text-slate-900' },
                                { label: 'Оптимистичный', value: formatMln(opt), sub: 'МЦ + 15%, ADR + 3% в высокий', color: 'border-[#f0a500] bg-[#f0a500]/5', accent: 'text-[#c8961a]' },
                                { label: 'Максимальный', value: formatMln(max), sub: 'МЦ × 2, прямые продажи ↑10%', color: 'border-emerald-200 bg-emerald-50', accent: 'text-emerald-700' },
                              ].map((sc, i) => (
                                <div key={i} className={`border-2 rounded-xl p-5 ${sc.color}`}>
                                  <p className="text-[10px] font-black uppercase text-slate-400 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>{sc.label}</p>
                                  <p className={`text-2xl font-black mb-1 ${sc.accent}`}>{sc.value}</p>
                                  <p className="text-[10px] text-slate-500">{sc.sub}</p>
                                </div>
                              ))}
                            </div>

                            <div className="bg-[#f0a500]/10 border border-[#f0a500] rounded-xl p-4 mb-5">
                              <p className="text-sm font-black text-[#1a1a2e] mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>Рекомендация</p>
                              <p className="text-[12px] text-slate-700">
                                Зафиксировать официальный бюджет 2026 на уровне <strong>{formatMln(opt)}</strong> (оптимистичный сценарий) —
                                достижимо при реализации конкретных мер по МЦ и ценовому давлению в сезон.
                              </p>
                            </div>

                            <table className="w-full text-left border-collapse text-[11px]" style={{ fontFamily: 'Arial, sans-serif' }}>
                              <thead>
                                <tr className="bg-slate-100">
                                  <th className="p-2 border border-slate-200 font-bold">Мера</th>
                                  <th className="p-2 border border-slate-200 font-bold text-right">Эффект, млн ₽</th>
                                  <th className="p-2 border border-slate-200 font-bold">Срок</th>
                                </tr>
                              </thead>
                              <tbody>
                                {[
                                  { measure: 'Рост МЦ: увеличить конверсию Велнес 20% → 30%', effect: `+${formatMln(totals.totalMedAddonRev * 0.15)}`, term: 'Апр–Май 2026' },
                                  { measure: 'Ценовое давление в пик: ADR +3–5% в июле–августе', effect: `+${formatMln(totals.totalRoomRev * 0.008)}`, term: 'Июнь 2026' },
                                  { measure: 'Перевод OTA → прямой канал (−10% комиссий)', effect: `+${formatMln(totals.totalRoomRev * 0.006)}`, term: 'Mar–Апр 2026' },
                                  { measure: 'Апсейл при заезде: повышение категории номера', effect: `+${formatMln(totals.totalRoomRev * 0.004)}`, term: 'Постоянно' },
                                ].map((row, i) => (
                                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50'}>
                                    <td className="p-2 border border-slate-200">{row.measure}</td>
                                    <td className="p-2 border border-slate-200 text-right font-bold text-emerald-700">{row.effect}</td>
                                    <td className="p-2 border border-slate-200 text-slate-500">{row.term}</td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </>
                        );
                      })()}
                    </section>

                    {/* ═══════════ 4. МЕДИЦИНСКИЙ ЦЕНТР ═══════════ */}
                    <section className="mb-12">
                      <h2 className="text-xs font-black uppercase tracking-widest mb-5 border-l-4 border-[#f0a500] pl-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                        4. Медицинский центр — три потока гостей
                      </h2>

                      <div className="grid grid-cols-3 gap-4 mb-5">
                        {[
                          {
                            label: 'Мед-гости',
                            sub: 'Med-пакет',
                            conv: medAddonConfig.medConversion,
                            check: medAddonConfig.medAvgCheck,
                            utp: 'Лечение у моря — всё в одном месте',
                            color: 'border-orange-200 bg-orange-50',
                          },
                          {
                            label: 'Велнес-гости',
                            sub: 'Ultra / SPA',
                            conv: medAddonConfig.welnesConversion,
                            check: medAddonConfig.welnesAvgCheck,
                            utp: 'Перезагрузись у моря — не в офисе',
                            color: 'border-purple-200 bg-purple-50',
                          },
                          {
                            label: 'Туристы',
                            sub: 'BB / HB / FB / PROMO',
                            conv: medAddonConfig.touristConversion,
                            check: medAddonConfig.touristAvgCheck,
                            utp: 'Зашёл на 30 минут — почувствовал разницу',
                            color: 'border-blue-200 bg-blue-50',
                          },
                        ].map((s, i) => (
                          <div key={i} className={`border rounded-xl p-4 ${s.color}`}>
                            <p className="text-[10px] font-black uppercase text-slate-400 mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>{s.sub}</p>
                            <p className="text-sm font-black text-slate-900 mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>{s.label}</p>
                            <div className="flex gap-4 mb-3">
                              <div>
                                <p className="text-[9px] text-slate-500 uppercase font-bold">Конверсия</p>
                                <p className="text-xl font-black text-slate-900">{s.conv}%</p>
                              </div>
                              <div>
                                <p className="text-[9px] text-slate-500 uppercase font-bold">Чек</p>
                                <p className="text-xl font-black text-slate-900">{s.check.toLocaleString()} ₽</p>
                              </div>
                            </div>
                            <p className="text-[10px] italic text-slate-500">«{s.utp}»</p>
                          </div>
                        ))}
                      </div>

                      {/* Итог МЦ */}
                      <div className="grid grid-cols-2 gap-4 mb-5">
                        <div className="bg-[#1a1a2e] text-white rounded-xl p-4">
                          <p className="text-[10px] font-bold uppercase text-slate-400 mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>Платный доход МЦ (год)</p>
                          <p className="text-3xl font-black text-[#f0a500]">{formatMln(totals.totalMedAddonRev)}</p>
                        </div>
                        <div className="bg-slate-50 border border-slate-200 rounded-xl p-4">
                          <p className="text-[10px] font-bold uppercase text-slate-400 mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>Доля МЦ в общем бюджете</p>
                          <p className="text-3xl font-black text-slate-900">{totals.totalBudget > 0 ? ((totals.totalMedAddonRev / totals.totalBudget) * 100).toFixed(1) : 0}%</p>
                        </div>
                      </div>

                      {/* Помесячная таблица МЦ */}
                      <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse text-[10px]" style={{ fontFamily: 'Arial, sans-serif' }}>
                          <thead>
                            <tr className="bg-slate-100">
                              <th className="p-2 border border-slate-200 font-bold">Месяц</th>
                              <th className="p-2 border border-slate-200 text-right font-bold">Гостей/день</th>
                              <th className="p-2 border border-slate-200 text-right font-bold">В МЦ/день</th>
                              <th className="p-2 border border-slate-200 text-right font-bold">Гостей МЦ</th>
                              <th className="p-2 border border-slate-200 text-right font-bold">Доход МЦ, тыс. ₽</th>
                            </tr>
                          </thead>
                          <tbody>
                            {MONTHS.map((m, mIdx) => {
                              const res = totals.monthResults[mIdx];
                              const dailyGuests = res.mBedDays > 0 ? (res.mBedDays / m.days).toFixed(0) : '0';
                              const dailyMC = res.mMedAddonGuests > 0 ? (res.mMedAddonGuests / m.days).toFixed(1) : '0';
                              return (
                                <tr key={mIdx} className={mIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                  <td className="p-2 border border-slate-200 font-bold">{m.name}</td>
                                  <td className="p-2 border border-slate-200 text-right font-mono">{dailyGuests}</td>
                                  <td className="p-2 border border-slate-200 text-right font-mono">{dailyMC}</td>
                                  <td className="p-2 border border-slate-200 text-right font-mono">{Math.round(res.mMedAddonGuests).toLocaleString()}</td>
                                  <td className="p-2 border border-slate-200 text-right font-bold">{Math.round(res.mMedAddonRev / 1000).toLocaleString()}</td>
                                </tr>
                              );
                            })}
                            <tr className="bg-[#1a1a2e] text-white font-black">
                              <td className="p-2 border border-slate-900 uppercase">Итого</td>
                              <td className="p-2 border border-slate-900" />
                              <td className="p-2 border border-slate-900" />
                              <td className="p-2 border border-slate-900 text-right font-mono">
                                {Math.round(totals.monthResults.reduce((a, r) => a + r.mMedAddonGuests, 0)).toLocaleString()}
                              </td>
                              <td className="p-2 border border-slate-900 text-right">
                                {Math.round(totals.totalMedAddonRev / 1000).toLocaleString()}
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </section>

                    {/* ═══════════ 5. КОНКУРЕНТНАЯ СРЕДА ═══════════ */}
                    <section className="mb-12">
                      <h2 className="text-xs font-black uppercase tracking-widest mb-5 border-l-4 border-[#1a1a2e] pl-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                        5. Конкурентная среда — Сочи и регион
                      </h2>

                      <div className="overflow-x-auto mb-5">
                        <table className="w-full text-left border-collapse text-[10px]" style={{ fontFamily: 'Arial, sans-serif' }}>
                          <thead>
                            <tr className="bg-slate-100">
                              <th className="p-2 border border-slate-200 font-bold">Объект</th>
                              <th className="p-2 border border-slate-200 font-bold">Регион</th>
                              <th className="p-2 border border-slate-200 font-bold">Сегмент</th>
                              <th className="p-2 border border-slate-200 font-bold">Главная сила</th>
                            </tr>
                          </thead>
                          <tbody>
                            {[
                              { name: 'Санаторий «Знание»', region: 'Сочи, Центр', seg: 'Средний', str: 'Лечение + доступная цена' },
                              { name: 'Санаторий «Металлург»', region: 'Сочи, Хоста', seg: 'Средний', str: 'Старая база лояльных гостей' },
                              { name: 'Radisson Collection (Лазурная)', region: 'Сочи, Хоста', seg: 'Верхний средний', str: 'Бренд + пляж' },
                              { name: 'Swissôtel Resort Камелия', region: 'Сочи, Центр', seg: 'Премиум', str: 'Инфраструктура, SPA, MICE' },
                              { name: 'Mriya Resort & Spa', region: 'Сочи, Ялта-р-н', seg: 'Премиум', str: 'Крупнейший SPA, wellness' },
                              { name: 'Сочи Парк Отель', region: 'Адлер', seg: 'Средний', str: 'Семьи с детьми, аквапарк' },
                              { name: 'Довиль / Ribera (Анапа)', region: 'Анапа', seg: 'Средний', str: 'Пляж + лечение, семьи' },
                              { name: 'Санаторий «Русь»', region: 'Ессентуки', seg: 'Средний', str: 'Питьевое лечение, КМВ' },
                              { name: 'Санаторий «Горный воздух»', region: 'Кисловодск', seg: 'Средний+', str: 'Кардиология, горный климат' },
                            ].map((row, i) => (
                              <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-slate-50/50'}>
                                <td className="p-2 border border-slate-200 font-bold">{row.name}</td>
                                <td className="p-2 border border-slate-200 text-slate-500">{row.region}</td>
                                <td className="p-2 border border-slate-200">{row.seg}</td>
                                <td className="p-2 border border-slate-200 text-slate-600">{row.str}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>

                      <div className="grid grid-cols-3 gap-3">
                        {[
                          { title: 'Пляж + Медицина, средний сегмент', desc: '7–12 тыс. ₽/ночь. В Сочи эта связка почти не занята — конкуренты либо дорогие, либо без пляжа.', color: 'border-[#f0a500] bg-[#f0a500]/5' },
                          { title: 'Женский wellness 35–50', desc: 'Пляж + красота + здоровье. Аудитория платёжеспособная, ищет «своё место» — ниша не занята в Сочи.', color: 'border-purple-200 bg-purple-50' },
                          { title: 'Корпоративный wellness-ретрит', desc: 'Не MICE, а перезагрузка команды. В среднем сегменте Сочи — пусто. Команды 5–15 человек.', color: 'border-blue-200 bg-blue-50' },
                        ].map((niche, i) => (
                          <div key={i} className={`border-2 rounded-xl p-4 ${niche.color}`}>
                            <p className="text-[9px] font-black uppercase text-slate-400 mb-1" style={{ fontFamily: 'Arial, sans-serif' }}>Свободная ниша</p>
                            <p className="text-xs font-black text-slate-900 mb-2" style={{ fontFamily: 'Arial, sans-serif' }}>{niche.title}</p>
                            <p className="text-[10px] text-slate-600">{niche.desc}</p>
                          </div>
                        ))}
                      </div>
                    </section>

                    {/* ═══════════ 6. РЕКОМЕНДАЦИИ И ДОРОЖНАЯ КАРТА ═══════════ */}
                    <section className="mb-12">
                      <h2 className="text-xs font-black uppercase tracking-widest mb-5 border-l-4 border-[#f0a500] pl-3" style={{ fontFamily: 'Arial, sans-serif' }}>
                        6. Рекомендации и дорожная карта
                      </h2>

                      <div className="space-y-3 mb-6">
                        {[
                          {
                            q: 'Март–Май',
                            items: [
                              '1–2 врача (терапевт + физиотерапевт), 5–7 базовых услуг МЦ',
                              'Запустить антистресс-программу 1–3 дня для велнес-гостей',
                              'Партнёрство с лабораторией для чекапов',
                              'Перевод 10% OTA-потока в прямой канал через CRM',
                            ],
                          },
                          {
                            q: 'Июнь–Август',
                            items: [
                              'Нутрициолог / психолог 2–3 дня в неделю',
                              'Динамическое ценообразование: при Occ ≥75% поднимать ADR на 8–12%',
                              'Апсейл-обучение ресепшн: предлагать МЦ при каждом заезде',
                              'Beauty-day для женской аудитории 35–50 как отдельный продукт',
                            ],
                          },
                          {
                            q: 'Сентябрь–Декабрь',
                            items: [
                              'Корпоративный wellness-ретрит как готовый пакет с ценообразованием',
                              'Анализ сезона: пересмотр PROMO-квот на 2027',
                              `Цель: закрыть год на ${formatMln(totals.totalBudget * 1.05)}+ с учётом факта`,
                              'Подготовка бюджета 2027: горизонт 1,2 млрд ₽',
                            ],
                          },
                        ].map((phase, i) => (
                          <div key={i} className="border border-slate-200 rounded-xl overflow-hidden">
                            <div className="bg-[#1a1a2e] text-white px-4 py-2 flex items-center gap-2" style={{ fontFamily: 'Arial, sans-serif' }}>
                              <span className="text-[#f0a500] font-black text-xs uppercase">{phase.q}</span>
                            </div>
                            <ul className="p-4 grid grid-cols-2 gap-x-6 gap-y-1">
                              {phase.items.map((item, j) => (
                                <li key={j} className="text-[11px] text-slate-700 flex gap-2">
                                  <span className="text-[#f0a500] font-black mt-0.5">›</span>
                                  {item}
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>

                      {/* Потенциал 2027 */}
                      <div className="bg-[#f0a500]/10 border border-[#f0a500] rounded-xl p-5">
                        <p className="text-xs font-black uppercase text-[#1a1a2e] mb-3" style={{ fontFamily: 'Arial, sans-serif' }}>Потенциал 2027 — что изменит цифры кардинально</p>
                        <div className="grid grid-cols-2 gap-3">
                          {[
                            { factor: 'Пересмотр PROMO-квот', effect: '+150–180 млн ₽' },
                            { factor: 'Полный рамп-ап МЦ', effect: '+30–50 млн ₽' },
                            { factor: 'Прямые продажи ≥40%', effect: '+15–20 млн ₽' },
                            { factor: 'Корпоративный wellness', effect: '+10–15 млн ₽' },
                          ].map((row, i) => (
                            <div key={i} className="flex justify-between text-[11px]">
                              <span className="text-slate-700">{row.factor}</span>
                              <span className="font-black text-emerald-700">{row.effect}</span>
                            </div>
                          ))}
                        </div>
                        <p className="text-xs font-bold text-[#1a1a2e] mt-4 pt-3 border-t border-[#f0a500]/30">
                          Итог 2027: <strong>1 200–1 250 млн ₽</strong> — реалистично при системной работе по всем направлениям
                        </p>
                      </div>
                    </section>

                    {/* ═══════════ ПОДПИСИ ═══════════ */}
                    <div className="mt-16 flex justify-between items-end border-t-2 border-[#1a1a2e] pt-8">
                      {[
                        'Аналитик / Руководитель отдела продаж',
                        'Генеральный директор',
                        'Собственник',
                      ].map((role, i) => (
                        <div key={i} className="text-center">
                          <div className="w-36 border-b border-[#1a1a2e] mb-2 mx-auto" />
                          <p className="text-[9px] uppercase font-bold text-slate-400" style={{ fontFamily: 'Arial, sans-serif' }}>{role}</p>
                        </div>
                      ))}
                    </div>

                    <p className="text-[9px] text-slate-400 mt-6 leading-relaxed" style={{ fontFamily: 'Arial, sans-serif' }}>
                      * Все показатели рассчитаны на основе финансовой модели Aqva SPA Resort на дату {new Date().toLocaleDateString('ru-RU')}.
                      Фактические результаты могут отличаться в зависимости от рыночной конъюнктуры и операционных решений.
                      Документ предназначен исключительно для внутреннего использования.
                    </p>

                    {/* Кнопка печати — не выводится на печать */}
                    <div className="no-print mt-8 flex justify-center">
                      <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 bg-[#1a1a2e] text-white px-8 py-3 rounded-xl font-bold hover:bg-[#0f0f1e] transition-colors shadow-lg"
                      >
                        <Printer size={18} /> Распечатать / Сохранить как PDF
                      </button>
                    </div>

                  </div>{/* end p-8 */}
                </div>{/* end print-container */}
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
                    <div className="lg:col-span-1 space-y-4">
                      {[
                        {
                          label: 'Мед-гости', sub: 'Med-пакет', color: 'indigo',
                          pkgs: 'Med пакет',
                          convKey: 'medConversion' as const, checkKey: 'medAvgCheck' as const,
                          desc: 'Уже приехали на лечение — покупают доп. процедуры',
                          convDefault: 50, checkDefault: 3000,
                        },
                        {
                          label: 'Велнес-гости', sub: 'Ultra / SPA пакеты', color: 'purple',
                          pkgs: 'Ultra, SPA',
                          convKey: 'welnesConversion' as const, checkKey: 'welnesAvgCheck' as const,
                          desc: 'Ориентированы на отдых и красоту — готовы к разовым процедурам',
                          convDefault: 20, checkDefault: 2000,
                        },
                        {
                          label: 'Туристы', sub: 'BB / HB / FB / PROMO', color: 'slate',
                          pkgs: 'BB, HB, FB, PROMO',
                          convKey: 'touristConversion' as const, checkKey: 'touristAvgCheck' as const,
                          desc: 'Едут за морем и аквапарком — редко заходят в МЦ',
                          convDefault: 5, checkDefault: 1200,
                        },
                      ].map(stream => (
                        <div key={stream.label} className={`bg-${stream.color}-50 border border-${stream.color}-200 p-4 rounded-xl`}>
                          <div className="flex justify-between items-start mb-2">
                            <div>
                              <p className={`text-xs font-black text-${stream.color}-800 uppercase`}>{stream.label}</p>
                              <p className={`text-[9px] text-${stream.color}-500`}>{stream.pkgs}</p>
                            </div>
                            <span className={`text-[9px] bg-${stream.color}-100 text-${stream.color}-700 px-2 py-0.5 rounded-full font-bold`}>
                              {formatMln(0)}
                            </span>
                          </div>
                          <p className={`text-[9px] text-${stream.color}-600 italic mb-3`}>{stream.desc}</p>
                          <div className="grid grid-cols-2 gap-2">
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Конверсия %</label>
                              <input type="number" min={0} max={100}
                                value={medAddonConfig[stream.convKey]}
                                onChange={(e) => setMedAddonConfig(prev => ({ ...prev, [stream.convKey]: parseInt(e.target.value) || 0 }))}
                                className="w-full border rounded p-1.5 text-sm font-bold text-indigo-600 text-center"
                              />
                            </div>
                            <div>
                              <label className="text-[9px] uppercase font-bold text-slate-500 block mb-1">Средний чек ₽</label>
                              <input type="number" min={0}
                                value={medAddonConfig[stream.checkKey]}
                                onChange={(e) => setMedAddonConfig(prev => ({ ...prev, [stream.checkKey]: parseInt(e.target.value) || 0 }))}
                                className="w-full border rounded p-1.5 text-sm font-bold text-indigo-600 text-center"
                              />
                            </div>
                          </div>
                        </div>
                      ))}

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
                              <th className="p-2 text-center">Гостей/день</th>
                              <th className="p-2 text-center text-indigo-300">в МЦ/день</th>
                              <th className="p-2 text-center">Гостей МЦ</th>
                              <th className="p-2 text-right bg-indigo-800">Платный доход МЦ, ₽</th>
                              <th className="p-2 text-right">Нагрузка %</th>
                            </tr>
                          </thead>
                          <tbody>
                            {MONTHS.map((m, i) => {
                              const res = totals.monthResults[i];
                              const dailyGuests = res.mBedDays > 0 ? res.mBedDays / m.days : 0;
                              const dailyMC = res.mMedAddonGuests > 0 ? res.mMedAddonGuests / m.days : 0;
                              const load = (res.mMedAddonGuests / costConfig.medCapacity) * 100;
                              return (
                                <tr key={i} className="border-bottom border-slate-100 hover:bg-slate-50">
                                  <td className="p-2 font-bold">{m.name}</td>
                                  <td className="p-2 text-center font-mono text-slate-500">
                                    {dailyGuests > 0 ? Math.round(dailyGuests).toLocaleString() : '—'}
                                  </td>
                                  <td className="p-2 text-center font-mono font-bold text-indigo-600">
                                    {dailyMC > 0 ? Math.round(dailyMC).toLocaleString() : '—'}
                                  </td>
                                  <td className="p-2 text-center font-mono">{Math.round(res.mMedAddonGuests).toLocaleString()}</td>
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
                              <td className="p-2 text-center text-slate-500">
                                {Math.round(totals.totalBedDays / 365).toLocaleString()}/д
                              </td>
                              <td className="p-2 text-center text-indigo-600">
                                {Math.round(totals.monthResults.reduce((acc, m) => acc + m.mMedAddonGuests, 0) / 365).toLocaleString()}/д
                              </td>
                              <td className="p-2 text-center">{Math.round(totals.monthResults.reduce((acc, m) => acc + m.mMedAddonGuests, 0)).toLocaleString()}</td>
                              <td className="p-2 text-right text-indigo-900 bg-indigo-100">{Math.round(totals.totalMedAddonRev).toLocaleString()}</td>
                              <td className="p-2 text-right">—</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>

                      {(() => {
                        const avgLoad = totals.monthResults.reduce((acc, m) => acc + (m.mMedAddonGuests / costConfig.medCapacity) * 100, 0) / 12;
                        const overloadedMonths = MONTHS.filter((_, i) => (totals.monthResults[i].mMedAddonGuests / costConfig.medCapacity) * 100 > 80);
                        const underloadedMonths = MONTHS.filter((_, i) => totals.monthResults[i].mRN > 0 && (totals.monthResults[i].mMedAddonGuests / costConfig.medCapacity) * 100 < 40);
                        const avgMedShare = pkgMixByMonth.reduce((acc, mix) => {
                          const total = (Object.values(mix) as number[]).reduce((a, b) => a + b, 0);
                          return acc + (total > 0 ? (mix.med / total) * 100 : 0);
                        }, 0) / 12;

                        const recs: { label: string; text: string }[] = [];
                        if (avgLoad < 60) recs.push({ label: 'Резерв мощности', text: `Загрузка МЦ в среднем ${avgLoad.toFixed(0)}% — есть резерв. Внедрите Check-up в первые 2 дня заезда: это даёт +15–20% к доп. выручке.` });
                        if (overloadedMonths.length > 0) recs.push({ label: 'Перегрузка МЦ', text: `В ${overloadedMonths.map(m => m.name).join(', ')} нагрузка >80% — введите предбронирование процедур при онлайн-регистрации.` });
                        if (underloadedMonths.length > 0) recs.push({ label: 'Низкая загрузка', text: `В ${underloadedMonths.map(m => m.name).join(', ')} МЦ недогружен — запустите скидку 15% на вечерние слоты (после 18:00).` });
                        if (avgMedShare < 20) recs.push({ label: 'Доля Med мала', text: `Med в миксе пакетов — ${avgMedShare.toFixed(0)}% при оптимуме 25%+. Увеличьте квоту Med: это напрямую поднимает ADR.` });
                        if (avgMedShare >= 25 && avgLoad >= 60 && overloadedMonths.length === 0) recs.push({ label: 'Кросс-продажи', text: `МЦ работает стабильно. Следующий шаг — обучить врачей предлагать 2+ доп. процедуры на первичной консультации.` });

                        return (
                          <div className="mt-8 p-4 bg-amber-50 border border-amber-200 rounded-xl">
                            <h4 className="text-xs font-bold text-amber-800 uppercase mb-3 flex items-center gap-2">
                              <AlertCircle size={14} /> Рекомендации по медцентру
                            </h4>
                            <ul className="text-[11px] text-amber-900 space-y-2">
                              {recs.map((r, i) => (
                                <li key={i}>• <b>{r.label}</b>: {r.text}</li>
                              ))}
                            </ul>
                          </div>
                        );
                      })()}
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
                            
                            // Расчет плановых номеро-ночей по данным roomMonthlyData (актуальный источник)
                            const roomCount = rooms[rt.key as keyof typeof rooms] || 0;
                            const rtRN = MONTHS.reduce((acc, m, mIdx) => {
                              return acc + (roomCount * m.days * (roomMonthlyData[mIdx][rt.key].plan / 100));
                            }, 0);

                            const avgOccPlan = MONTHS.reduce((acc, m, mIdx) => acc + roomMonthlyData[mIdx][rt.key].plan * m.days, 0) / MONTHS.reduce((a, b) => a + b.days, 0);
                            
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
                                <td className="text-center text-slate-400">{avgPkgMix[pk.key] ?? 0}%</td>
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
                    <h3 className="text-sm font-bold text-slate-900 mb-1 flex items-center gap-2">
                      <Activity size={16} className="text-indigo-500" />
                      Микс программ (Среднегодовой, %)
                    </h3>
                    <p className="text-[10px] text-slate-400 mb-4">Настройка — в Панели управления (по месяцам)</p>
                    <div className="space-y-3">
                      {PACKAGES.map(pk => {
                        const avg = avgPkgMix[pk.key] ?? 0;
                        return (
                          <div key={pk.key} className="flex justify-between items-center">
                            <span className={`text-xs font-bold ${pk.color}`}>{pk.label}</span>
                            <span className="text-sm font-black text-slate-700">{avg}%</span>
                          </div>
                        );
                      })}
                    </div>
                    <div className="mt-4 p-3 bg-slate-50 rounded-lg flex justify-between items-center">
                      <span className="text-xs text-slate-500">Сумма среднего:</span>
                      <span className="text-sm font-bold text-slate-600">
                        {Object.values(avgPkgMix).reduce((a, b) => (a as number) + (b as number), 0 as number) as number}%
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
                    {(() => {
                      const avgOtaShare = MONTHS.reduce((acc, _, i) => acc + (segmentData[i].ota?.plan || 0), 0) / 12;
                      const avgDirectShare = MONTHS.reduce((acc, _, i) => acc + ((segmentData[i] as any).direct?.plan || 0), 0) / 12;
                      const avgMedShare = pkgMixByMonth.reduce((acc, mix) => {
                        const total = (Object.values(mix) as number[]).reduce((a, b) => a + b, 0);
                        return acc + (total > 0 ? (mix.med / total) * 100 : 0);
                      }, 0) / 12;
                      const avgSpaShare = pkgMixByMonth.reduce((acc, mix) => {
                        const total = (Object.values(mix) as number[]).reduce((a, b) => a + b, 0);
                        return acc + (total > 0 ? (mix.spa / total) * 100 : 0);
                      }, 0) / 12;
                      const highOccMonths = MONTHS.filter((_, i) => {
                        const avgOcc = ROOM_TYPES.reduce((acc, rt) => acc + roomMonthlyData[i][rt.key].plan, 0) / ROOM_TYPES.length;
                        return avgOcc >= 80;
                      });
                      const lowRevMonths = [...MONTHS]
                        .map((m, i) => ({ name: m.name, rev: totals.monthResults[i].mRev }))
                        .filter(m => m.rev > 0)
                        .sort((a, b) => a.rev - b.rev)
                        .slice(0, 3);
                      const commSavingIfShift10 = Math.round(totals.totalRev * 0.1 * (costConfig.commissionPct / 100) / 1000000);

                      const recs: { label: string; text: string }[] = [];
                      if (avgMedShare < 25) recs.push({ label: 'Акцент на Med', text: `Доля Med — ${avgMedShare.toFixed(0)}%, целевой уровень 25%+. Это главный рычаг ADR в низкий сезон.` });
                      if (avgSpaShare < 15) recs.push({ label: 'Стимулирование SPA', text: `SPA в миксе — ${avgSpaShare.toFixed(0)}%. В межсезонье предлагайте апгрейд с Ultra до SPA со скидкой 50% от 3 ночей.` });
                      if (avgOtaShare > 25) recs.push({ label: 'OTA-зависимость', text: `OTA занимает ${avgOtaShare.toFixed(0)}% продаж. Сдвиг 10% в прямой канал сэкономит ~${commSavingIfShift10} млн ₽ на комиссиях.` });
                      if (avgDirectShare < 20) recs.push({ label: 'Прямые продажи', text: `Прямой канал — ${avgDirectShare.toFixed(0)}%. Запустите закрытые акции по CRM для возвратных гостей — конверсия выше, комиссия ноль.` });
                      if (highOccMonths.length > 0) recs.push({ label: 'Динамическое ценообразование', text: `В ${highOccMonths.map(m => m.name).join(', ')} загрузка ≥80% — поднимайте цены Стандарта на 10–15%.` });
                      if (lowRevMonths.length > 0) recs.push({ label: 'Слабые месяцы', text: `Наименьшая выручка: ${lowRevMonths.map(m => m.name).join(', ')}. Запустите пакеты "3+1" или "Дети бесплатно" для загрузки будних дней.` });

                      return (
                        <div className="space-y-3 text-sm text-indigo-100">
                          {recs.length === 0
                            ? <p className="text-emerald-300 font-bold">Все ключевые метрики в норме — продажи идут по плану.</p>
                            : recs.map((r, i) => <p key={i}>• <b className="text-white">{r.label}</b>: {r.text}</p>)
                          }
                        </div>
                      );
                    })()}
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
                          <th key={rt.key} colSpan={3} className="text-center border-l border-slate-700">{rt.label}</th>
                        ))}
                      </tr>
                      <tr>
                        {ROOM_TYPES.map(rt => (
                          <React.Fragment key={rt.key}>
                            <th className="text-[8px] bg-slate-800 border-l border-slate-700 text-center">План %</th>
                            <th className="text-[8px] bg-slate-700 text-center">Факт %</th>
                            <th className="text-[8px] bg-slate-600 text-center">Откл, %</th>
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
                              <td className="text-center bg-slate-100 text-xs font-bold">
                                {(() => {
                                  const fact = roomMonthlyData[mIdx][rt.key].fact || 0;
                                  const plan = roomMonthlyData[mIdx][rt.key].plan;
                                  if (fact === 0) return <span className="text-slate-300">—</span>;
                                  const diff = fact - plan;
                                  const cls = diff >= 0 ? 'text-emerald-600' : 'text-red-500';
                                  return <span className={cls}>{diff > 0 ? '+' : ''}{diff.toFixed(1)}</span>;
                                })()}
                              </td>
                            </React.Fragment>
                          ))}
                        </tr>
                      ))}
                      <tr className="bg-slate-900 text-white font-bold">
                        <td className="p-2 uppercase text-[10px]">Средняя за период</td>
                        {ROOM_TYPES.map(rt => {
                          const totalDays = MONTHS.reduce((a, b) => a + b.days, 0);
                          const avgPlan = MONTHS.reduce((acc, m, i) => acc + roomMonthlyData[i][rt.key].plan * m.days, 0) / totalDays;
                          const avgFact = MONTHS.reduce((acc, m, i) => acc + roomMonthlyData[i][rt.key].fact * m.days, 0) / totalDays;
                          return (
                            <React.Fragment key={rt.key}>
                              <td className="text-center border-l border-slate-700 text-indigo-300">{avgPlan.toFixed(1)}%</td>
                              <td className="text-center text-slate-400">{avgFact > 0 ? avgFact.toFixed(1) + '%' : '—'}</td>
                              <td className="text-center">
                                {avgFact > 0 ? (
                                  <span className={(avgFact - avgPlan) >= 0 ? 'text-emerald-400' : 'text-red-400'}>
                                    {(avgFact - avgPlan) > 0 ? '+' : ''}{(avgFact - avgPlan).toFixed(1)}
                                  </span>
                                ) : <span className="text-slate-600">—</span>}
                              </td>
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
                {/* Прогноз по месяцам — план/факт */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Прогноз по месяцам — план / факт</h2>
                    <p className="text-[10px] text-slate-500 mt-0.5">Коэффициент гостей и загрузка плана редактируются. Факт загрузки, номеро-ночи и доходы вводите вручную.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full data-table min-w-[1800px] text-[11px]">
                      <thead>
                        <tr>
                          <th rowSpan={2} className="text-left bg-slate-900 sticky left-0 z-10 min-w-[80px]">Месяц</th>
                          <th rowSpan={2} className="bg-slate-800">Дни</th>
                          <th rowSpan={2} className="bg-slate-800">Номерная<br/>ёмкость</th>
                          <th colSpan={7} className="text-center bg-indigo-900 border-l-2 border-indigo-700">ПЛАН</th>
                          <th colSpan={8} className="text-center bg-emerald-900 border-l-2 border-emerald-700">ФАКТ</th>
                        </tr>
                        <tr>
                          {/* ПЛАН */}
                          <th className="bg-indigo-950 border-l-2 border-indigo-700">Коэф.<br/>гостей</th>
                          <th className="bg-indigo-950">Загрузка %</th>
                          <th className="bg-indigo-950">Номеро-<br/>ночи</th>
                          <th className="bg-indigo-950">Койко-<br/>дни</th>
                          <th className="bg-indigo-950">Доход, ₽</th>
                          <th className="bg-indigo-950">Ср. цена<br/>номера</th>
                          <th className="bg-indigo-950">Ср. стоим.<br/>к-дня</th>
                          {/* ФАКТ */}
                          <th className="bg-emerald-950 border-l-2 border-emerald-700">Загрузка %<br/><span className="text-[9px] font-normal opacity-60">ввод</span></th>
                          <th className="bg-emerald-950">Откл., %</th>
                          <th className="bg-emerald-950">Номеро-<br/>ночи<br/><span className="text-[9px] font-normal opacity-60">ввод</span></th>
                          <th className="bg-emerald-950">Откл., %</th>
                          <th className="bg-emerald-950">Доходы, ₽<br/><span className="text-[9px] font-normal opacity-60">ввод</span></th>
                          <th className="bg-emerald-950">Откл., %</th>
                          <th className="bg-emerald-950">Ср. цена<br/>номера</th>
                          <th className="bg-emerald-950">Откл., %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MONTHS.map((m, mIdx) => {
                          const r = totals.monthResults[mIdx];
                          const totalRooms = (Object.values(rooms) as number[]).reduce((a, b) => a + b, 0);
                          const capacity = totalRooms * m.days;
                          const guestCoeff = monthlyGuestCoeff[mIdx];
                          const avgPlanOcc = ROOM_TYPES.reduce((acc, rt) => {
                            const rc = rooms[rt.key as keyof typeof rooms] || 0;
                            return acc + roomMonthlyData[mIdx][rt.key].plan * rc;
                          }, 0) / (totalRooms || 1);
                          const planADR = r.mRN > 0 ? r.mRev / r.mRN : 0;
                          const planPricePerBD = r.mBedDays > 0 ? r.mRev / r.mBedDays : 0;

                          const fact = monthlyFact[mIdx];
                          const factADR = fact.rnFact > 0 ? fact.revFact / fact.rnFact : 0;
                          const occVar = avgPlanOcc > 0 && fact.occFact > 0 ? ((fact.occFact - avgPlanOcc) / avgPlanOcc) * 100 : null;
                          const rnVar = r.mRN > 0 && fact.rnFact > 0 ? ((fact.rnFact - r.mRN) / r.mRN) * 100 : null;
                          const revVar = r.mRev > 0 && fact.revFact > 0 ? ((fact.revFact - r.mRev) / r.mRev) * 100 : null;
                          const adrVar = planADR > 0 && factADR > 0 ? ((factADR - planADR) / planADR) * 100 : null;

                          const varColor = (v: number | null) => v === null ? 'text-slate-300' : v >= 0 ? 'text-emerald-600 font-bold' : 'text-red-600 font-bold';
                          const varText = (v: number | null) => v === null ? '—' : (v > 0 ? '+' : '') + v.toFixed(1) + '%';

                          return (
                            <tr key={mIdx} className="hover:bg-slate-50 transition-colors">
                              <td className="font-bold text-slate-900 sticky left-0 bg-white z-10">{m.name}</td>
                              <td className="text-center text-slate-500">{m.days}</td>
                              <td className="text-center text-slate-500 font-mono">{capacity.toLocaleString()}</td>
                              {/* ПЛАН — редактируемые */}
                              <td className="text-center border-l-2 border-indigo-100 p-0">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={guestCoeff}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setMonthlyGuestCoeff(prev => prev.map((v, i) => i === mIdx ? val : v));
                                  }}
                                  className="w-full text-center text-xs font-bold text-indigo-700 outline-none bg-transparent px-2 py-1"
                                />
                              </td>
                              <td className="text-center p-0">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={avgPlanOcc.toFixed(1)}
                                  onChange={(e) => {
                                    const val = parseFloat(e.target.value) || 0;
                                    setRoomMonthlyData(prev => prev.map((row, i) => {
                                      if (i !== mIdx) return row;
                                      const updated = { ...row };
                                      ROOM_TYPES.forEach(rt => {
                                        updated[rt.key] = { ...updated[rt.key], plan: val };
                                      });
                                      return updated;
                                    }));
                                  }}
                                  className="w-full text-center text-xs font-bold text-indigo-700 outline-none bg-transparent px-2 py-1"
                                />
                              </td>
                              {/* ПЛАН — расчётные */}
                              <td className="text-right font-mono">{Math.round(r.mRN).toLocaleString()}</td>
                              <td className="text-right font-mono text-indigo-600">{Math.round(r.mBedDays).toLocaleString()}</td>
                              <td className="text-right font-bold text-slate-800">{formatMln(r.mRev)}</td>
                              <td className="text-right font-mono">{Math.round(planADR).toLocaleString()}</td>
                              <td className="text-right font-mono">{Math.round(planPricePerBD).toLocaleString()}</td>
                              {/* ФАКТ — ввод */}
                              <td className="text-center border-l-2 border-emerald-100 p-0">
                                <input
                                  type="number"
                                  step="0.1"
                                  value={fact.occFact || ''}
                                  placeholder="0"
                                  onChange={(e) => setMonthlyFact(prev => prev.map((f, i) => i === mIdx ? { ...f, occFact: parseFloat(e.target.value) || 0 } : f))}
                                  className="w-full text-center text-xs font-bold text-emerald-700 outline-none bg-transparent px-2 py-1"
                                />
                              </td>
                              <td className={`text-center ${varColor(occVar)}`}>{varText(occVar)}</td>
                              <td className="text-center p-0">
                                <input
                                  type="number"
                                  value={fact.rnFact || ''}
                                  placeholder="0"
                                  onChange={(e) => setMonthlyFact(prev => prev.map((f, i) => i === mIdx ? { ...f, rnFact: parseFloat(e.target.value) || 0 } : f))}
                                  className="w-full text-right text-xs font-bold text-emerald-700 outline-none bg-transparent px-2 py-1"
                                />
                              </td>
                              <td className={`text-center ${varColor(rnVar)}`}>{varText(rnVar)}</td>
                              <td className="text-center p-0">
                                <input
                                  type="number"
                                  value={fact.revFact || ''}
                                  placeholder="0"
                                  onChange={(e) => setMonthlyFact(prev => prev.map((f, i) => i === mIdx ? { ...f, revFact: parseFloat(e.target.value) || 0 } : f))}
                                  className="w-full text-right text-xs font-bold text-emerald-700 outline-none bg-transparent px-2 py-1"
                                />
                              </td>
                              <td className={`text-center ${varColor(revVar)}`}>{varText(revVar)}</td>
                              <td className="text-right font-mono text-emerald-700">{factADR > 0 ? Math.round(factADR).toLocaleString() : '—'}</td>
                              <td className={`text-center ${varColor(adrVar)}`}>{varText(adrVar)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        {(() => {
                          const totalRooms = (Object.values(rooms) as number[]).reduce((a, b) => a + b, 0);
                          const totalCapacity = totalRooms * MONTHS.reduce((a, b) => a + b.days, 0);
                          const avgGuestCoeffYear = MONTHS.reduce((acc, m, mIdx) => acc + monthlyGuestCoeff[mIdx] * m.days, 0) / MONTHS.reduce((a, b) => a + b.days, 0);
                          const totalFactRN = monthlyFact.reduce((a, b) => a + b.rnFact, 0);
                          const totalFactRev = monthlyFact.reduce((a, b) => a + b.revFact, 0);
                          const totalFactOcc = monthlyFact.reduce((a, b) => a + b.occFact, 0) / MONTHS.length;
                          const totalFactADR = totalFactRN > 0 ? totalFactRev / totalFactRN : 0;
                          const planADR = totals.totalRN > 0 ? totals.totalRev / totals.totalRN : 0;
                          const planPricePerBD = totals.totalBedDays > 0 ? totals.totalRev / totals.totalBedDays : 0;
                          const occVar = totals.totalAvgOcc > 0 && totalFactOcc > 0 ? ((totalFactOcc - totals.totalAvgOcc) / totals.totalAvgOcc) * 100 : null;
                          const rnVar = totals.totalRN > 0 && totalFactRN > 0 ? ((totalFactRN - totals.totalRN) / totals.totalRN) * 100 : null;
                          const revVar = totals.totalRev > 0 && totalFactRev > 0 ? ((totalFactRev - totals.totalRev) / totals.totalRev) * 100 : null;
                          const adrVar = planADR > 0 && totalFactADR > 0 ? ((totalFactADR - planADR) / planADR) * 100 : null;
                          const varC = (v: number | null) => v === null ? 'text-slate-500' : v >= 0 ? 'text-emerald-300' : 'text-red-300';
                          const varT = (v: number | null) => v === null ? '—' : (v > 0 ? '+' : '') + v.toFixed(1) + '%';
                          return (
                            <tr className="bg-slate-900 text-white font-bold text-[11px]">
                              <td className="p-2 uppercase text-[9px] sticky left-0 bg-slate-900">ИТОГО ГОД</td>
                              <td className="text-center">{MONTHS.reduce((a, b) => a + b.days, 0)}</td>
                              <td className="text-center font-mono">{totalCapacity.toLocaleString()}</td>
                              <td className="text-center text-indigo-300 border-l-2 border-indigo-800">{avgGuestCoeffYear.toFixed(2)}</td>
                              <td className="text-center text-indigo-300">{totals.totalAvgOcc.toFixed(1)}%</td>
                              <td className="text-right font-mono">{Math.round(totals.totalRN).toLocaleString()}</td>
                              <td className="text-right font-mono text-indigo-300">{Math.round(totals.totalBedDays).toLocaleString()}</td>
                              <td className="text-right">{formatMln(totals.totalRev)}</td>
                              <td className="text-right font-mono">{Math.round(planADR).toLocaleString()}</td>
                              <td className="text-right font-mono">{Math.round(planPricePerBD).toLocaleString()}</td>
                              <td className={`text-center border-l-2 border-emerald-800 ${totalFactOcc > 0 ? 'text-emerald-300' : 'text-slate-500'}`}>{totalFactOcc > 0 ? totalFactOcc.toFixed(1) + '%' : '—'}</td>
                              <td className={`text-center ${varC(occVar)}`}>{varT(occVar)}</td>
                              <td className={`text-right font-mono ${totalFactRN > 0 ? 'text-emerald-300' : 'text-slate-500'}`}>{totalFactRN > 0 ? Math.round(totalFactRN).toLocaleString() : '—'}</td>
                              <td className={`text-center ${varC(rnVar)}`}>{varT(rnVar)}</td>
                              <td className={`text-right ${totalFactRev > 0 ? 'text-emerald-300' : 'text-slate-500'}`}>{totalFactRev > 0 ? formatMln(totalFactRev) : '—'}</td>
                              <td className={`text-center ${varC(revVar)}`}>{varT(revVar)}</td>
                              <td className={`text-right font-mono ${totalFactADR > 0 ? 'text-emerald-300' : 'text-slate-500'}`}>{totalFactADR > 0 ? Math.round(totalFactADR).toLocaleString() : '—'}</td>
                              <td className={`text-center ${varC(adrVar)}`}>{varT(adrVar)}</td>
                            </tr>
                          );
                        })()}
                      </tfoot>
                    </table>
                  </div>
                </div>

                {/* Справочник расчётов — P&L по месяцам */}
                <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                  <div className="p-4 bg-slate-50 border-b border-slate-200">
                    <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">Справочник расчётов — P&amp;L по месяцам</h2>
                    <p className="text-[10px] text-slate-500 mt-0.5">Расходы, GOP и рентабельность — расчётные показатели на основе модели.</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full data-table min-w-[1000px] text-[11px]">
                      <thead>
                        <tr>
                          <th className="text-left">Месяц</th>
                          <th>Выручка (номера)</th>
                          <th>Доход МЦ</th>
                          <th>Итого выручка</th>
                          <th className="bg-red-900">Food Cost</th>
                          <th className="bg-red-900">Комиссии OTA</th>
                          <th className="bg-red-900">Прочие перем.</th>
                          <th className="bg-red-900">Пост. расходы</th>
                          <th className="bg-red-900">Итого расходы</th>
                          <th className="bg-emerald-900">GOP</th>
                          <th className="bg-emerald-900">GOP %</th>
                          <th>Точка б/у %</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MONTHS.map((m, mIdx) => {
                          const r = totals.monthResults[mIdx];
                          const totalRev = r.mRev + r.mMedAddonRev;
                          const otherVC = r.mRev * (costConfig.otherVCPct / 100);
                          const fixedCosts = r.mTotalCosts - r.mFoodCost - r.mComm - otherVC;
                          const gopColor = r.mGOPMargin >= 30 ? 'text-emerald-600 font-bold' : r.mGOPMargin >= 15 ? 'text-amber-600 font-bold' : 'text-red-600 font-bold';
                          return (
                            <tr key={mIdx} className="hover:bg-slate-50 transition-colors">
                              <td className="font-bold text-slate-900">{m.name}</td>
                              <td className="text-right">{formatMln(r.mRev)}</td>
                              <td className="text-right text-orange-600">{formatMln(r.mMedAddonRev)}</td>
                              <td className="text-right font-bold">{formatMln(totalRev)}</td>
                              <td className="text-right text-red-700">{formatMln(r.mFoodCost)}</td>
                              <td className="text-right text-red-700">{formatMln(r.mComm)}</td>
                              <td className="text-right text-red-700">{formatMln(otherVC)}</td>
                              <td className="text-right text-red-700">{formatMln(fixedCosts)}</td>
                              <td className="text-right text-red-800 font-bold">{formatMln(r.mTotalCosts)}</td>
                              <td className={`text-right ${gopColor}`}>{formatMln(r.mGOP)}</td>
                              <td className={`text-center ${gopColor}`}>{r.mGOPMargin.toFixed(1)}%</td>
                              <td className="text-center text-slate-500">{r.mBreakEvenOcc.toFixed(1)}%</td>
                            </tr>
                          );
                        })}
                      </tbody>
                      <tfoot>
                        <tr className="bg-slate-900 text-white font-bold text-[11px]">
                          <td className="p-2 uppercase text-[9px]">ИТОГО ГОД</td>
                          <td className="text-right">{formatMln(totals.totalRev)}</td>
                          <td className="text-right text-orange-300">{formatMln(totals.totalMedAddonRev)}</td>
                          <td className="text-right">{formatMln(totals.totalBudget)}</td>
                          <td className="text-right text-red-300">{formatMln(totals.monthResults.reduce((a, b) => a + b.mFoodCost, 0))}</td>
                          <td className="text-right text-red-300">{formatMln(totals.monthResults.reduce((a, b) => a + b.mComm, 0))}</td>
                          <td className="text-right text-red-300">{formatMln(totals.monthResults.reduce((a, b) => a + b.mRev * (costConfig.otherVCPct / 100), 0))}</td>
                          <td className="text-right text-red-300">{formatMln(totals.totalCosts - totals.monthResults.reduce((a, b) => a + b.mFoodCost + b.mComm + b.mRev * (costConfig.otherVCPct / 100), 0))}</td>
                          <td className="text-right text-red-200">{formatMln(totals.totalCosts)}</td>
                          <td className="text-right text-emerald-300">{formatMln(totals.totalGOP)}</td>
                          <td className="text-center text-emerald-300">{totals.totalGOPMargin.toFixed(1)}%</td>
                          <td className="text-center text-slate-400">—</td>
                        </tr>
                      </tfoot>
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
                className="space-y-6"
              >
                {(() => {
                  const SEGS = [
                    { key: 'direct', label: 'Прямые продажи', hdr: 'bg-blue-900',   row: 'bg-blue-50',   txt: 'text-blue-700' },
                    { key: 'to',     label: 'Туроператоры',   hdr: 'bg-indigo-900', row: 'bg-indigo-50', txt: 'text-indigo-700' },
                    { key: 'fss',    label: 'ФСС / Соцстрах', hdr: 'bg-emerald-900',row: 'bg-emerald-50',txt: 'text-emerald-700' },
                    { key: 'corp',   label: 'Корпораты/MICE', hdr: 'bg-purple-900', row: 'bg-purple-50', txt: 'text-purple-700' },
                    { key: 'ota',    label: 'OTA',            hdr: 'bg-slate-800',  row: 'bg-slate-50',  txt: 'text-slate-600' },
                  ];

                  // Предрасчёт план/факт по всем месяцам
                  const mData = MONTHS.map((m, mIdx) => {
                    const mRevBase = totals.monthResults[mIdx].mRevBase;
                    const mRN = totals.monthResults[mIdx].mRN;
                    const mBaseADR = mRN > 0 ? mRevBase / mRN : 0;
                    return SEGS.map(s => {
                      const sd = segmentData[mIdx][s.key as keyof typeof segmentData[0]];
                      const planPct = sd.plan;
                      const coeff = (segmentCoeffs as any)[s.key] / 100;
                      const planRev = mRevBase * (planPct / 100) * coeff;
                      const segRN = mRN * (planPct / 100);
                      const netADR = mBaseADR * coeff;
                      const factPct = sd.fact || 0;
                      const factRev = sd.revFact || 0;
                      const devRev = factRev > 0 ? factRev - planRev : null;
                      const devPct = factRev > 0 && planRev > 0 ? ((factRev - planRev) / planRev) * 100 : null;
                      return { planPct, planRev, segRN, netADR, factPct, factRev, devRev, devPct };
                    });
                  });

                  const varCls = (v: number | null) => v === null ? 'text-slate-300' : v >= 0 ? 'text-emerald-600 font-bold' : 'text-red-500 font-bold';
                  const varTxt = (v: number | null) => v === null ? '—' : (v > 0 ? '+' : '') + v.toFixed(1) + '%';

                  const MW = { width: '80px', minWidth: '80px', maxWidth: '80px' };

                  return (
                    <>
                      {/* ══ КОЭФФИЦИЕНТЫ СЕГМЕНТОВ ══ */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 bg-slate-800 border-b border-slate-700">
                          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Коэффициенты ценообразования по каналам</h2>
                          <p className="text-[10px] text-slate-400 mt-0.5">% от базового прайса (прямые продажи = 100%). Влияет на расчёт дохода в таблице плана.</p>
                        </div>
                        <div className="px-5 py-4 flex flex-wrap gap-4">
                          {SEGS.map(s => (
                            <div key={s.key} className="flex flex-col gap-1 items-center">
                              <label className={`text-[10px] font-bold uppercase tracking-wide ${s.txt}`}>{s.label}</label>
                              <div className="flex items-center gap-1">
                                <input
                                  type="number"
                                  min={0} max={120} step={1}
                                  value={(segmentCoeffs as any)[s.key]}
                                  onChange={e => setSegmentCoeffs((prev: any) => ({ ...prev, [s.key]: Number(e.target.value) }))}
                                  className="w-16 text-center border border-slate-300 rounded px-2 py-1 text-sm font-bold text-slate-800"
                                />
                                <span className="text-slate-500 text-sm">%</span>
                              </div>
                              {(segmentCoeffs as any)[s.key] < 100 && (
                                <span className="text-[9px] text-slate-400">скидка {100 - (segmentCoeffs as any)[s.key]}%</span>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* ══ ВАРИАНТ C: КОНТРОЛЬ РАСЧЁТОВ ══ */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 bg-indigo-900 border-b border-indigo-700">
                          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Контроль расчётов — помесячная база</h2>
                          <p className="text-[10px] text-indigo-300 mt-0.5">
                            Цепочка: Номеров × Дней = Возм. RN → × Загрузка% = Продано RN → × Гостей/ном × Цена/гостя = ADR базовый → × Коэфф. сег. = ADR нетто → × RN = Выручка
                          </p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full data-table text-[10px]">
                            <thead>
                              <tr className="bg-slate-900 text-slate-300">
                                <th className="text-left sticky left-0 bg-slate-900 z-10 py-2 px-3 text-[10px]" style={MW}>Месяц</th>
                                <th className="text-center py-2 px-2 whitespace-nowrap">Дней</th>
                                <th className="text-center py-2 px-2 whitespace-nowrap">Номеров</th>
                                <th className="text-center py-2 px-2 whitespace-nowrap bg-slate-800">Возм. RN</th>
                                <th className="text-center py-2 px-2 whitespace-nowrap bg-indigo-900">Загрузка %</th>
                                <th className="text-center py-2 px-2 whitespace-nowrap bg-indigo-900">Продано RN</th>
                                <th className="text-center py-2 px-2 whitespace-nowrap">Гостей / ном</th>
                                <th className="text-center py-2 px-2 whitespace-nowrap bg-amber-900">ADR базовый, ₽</th>
                                <th className="text-center py-2 px-2 whitespace-nowrap bg-slate-800">Коэфф. сег., %</th>
                                <th className="text-center py-2 px-2 whitespace-nowrap bg-amber-900">ADR нетто, ₽</th>
                                <th className="text-right py-2 pr-4 whitespace-nowrap bg-emerald-900">Выручка, тыс. ₽</th>
                              </tr>
                            </thead>
                            <tbody>
                              {MONTHS.map((m, mIdx) => {
                                const res = totals.monthResults[mIdx];
                                const totalRooms = (Object.values(rooms) as number[]).reduce((a: number, b: number) => a + b, 0);
                                const possibleRN = totalRooms * m.days;
                                const mRN = res.mRN;
                                const occ = possibleRN > 0 ? (mRN / possibleRN) * 100 : 0;
                                const guestsPerRoom = mRN > 0 ? res.mBedDays / mRN : 0;
                                const baseADR = mRN > 0 ? res.mRevBase / mRN : 0;
                                const segCoeffPct = res.mRevBase > 0 ? (res.mRev / res.mRevBase) * 100 : 100;
                                const netADR = mRN > 0 ? res.mRev / mRN : 0;
                                const isZero = mRN === 0;
                                return (
                                  <tr key={mIdx} className="border-b border-slate-100 hover:bg-slate-50">
                                    <td className="font-bold text-slate-800 sticky left-0 bg-white z-10 py-2 px-3 border-r border-slate-100" style={MW}>{m.name}</td>
                                    <td className="text-center py-2 text-slate-600">{m.days}</td>
                                    <td className="text-center py-2 text-slate-600">{totalRooms}</td>
                                    <td className="text-center py-2 font-semibold text-slate-700 bg-slate-50">{possibleRN.toLocaleString()}</td>
                                    <td className="text-center py-2 font-bold text-indigo-700 bg-indigo-50">
                                      {isZero ? '—' : occ.toFixed(1) + '%'}
                                    </td>
                                    <td className="text-center py-2 font-bold text-indigo-800 bg-indigo-50">
                                      {isZero ? '—' : Math.round(mRN).toLocaleString()}
                                    </td>
                                    <td className="text-center py-2 text-slate-600">
                                      {isZero ? '—' : guestsPerRoom.toFixed(2)}
                                    </td>
                                    <td className="text-center py-2 font-mono font-semibold text-amber-800 bg-amber-50">
                                      {isZero ? '—' : Math.round(baseADR).toLocaleString()}
                                    </td>
                                    <td className="text-center py-2 text-slate-600 bg-slate-50">
                                      {isZero ? '—' : segCoeffPct.toFixed(1) + '%'}
                                    </td>
                                    <td className="text-center py-2 font-mono font-bold text-amber-900 bg-amber-50">
                                      {isZero ? '—' : Math.round(netADR).toLocaleString()}
                                    </td>
                                    <td className="text-right pr-4 py-2 font-black text-emerald-700 bg-emerald-50">
                                      {isZero ? '—' : formatThs(res.mRev)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              {(() => {
                                const totalRooms = (Object.values(rooms) as number[]).reduce((a: number, b: number) => a + b, 0);
                                const totalPossibleRN = MONTHS.reduce((a, m) => a + totalRooms * m.days, 0);
                                const totalRN = MONTHS.reduce((a, __, i) => a + totals.monthResults[i].mRN, 0);
                                const totalRevBase = MONTHS.reduce((a, __, i) => a + totals.monthResults[i].mRevBase, 0);
                                const totalRev = MONTHS.reduce((a, __, i) => a + totals.monthResults[i].mRev, 0);
                                const totalBedDays = MONTHS.reduce((a, __, i) => a + totals.monthResults[i].mBedDays, 0);
                                const avgOcc = totalPossibleRN > 0 ? (totalRN / totalPossibleRN) * 100 : 0;
                                const avgGuests = totalRN > 0 ? totalBedDays / totalRN : 0;
                                const avgBaseADR = totalRN > 0 ? totalRevBase / totalRN : 0;
                                const avgSegCoeff = totalRevBase > 0 ? (totalRev / totalRevBase) * 100 : 100;
                                const avgNetADR = totalRN > 0 ? totalRev / totalRN : 0;
                                return (
                                  <tr className="bg-slate-900 text-white font-bold">
                                    <td className="py-2 px-3 text-[9px] uppercase tracking-wider sticky left-0 bg-slate-900" style={MW}>ИТОГО ГОД</td>
                                    <td className="text-center text-slate-400">365</td>
                                    <td className="text-center text-slate-400">{totalRooms}</td>
                                    <td className="text-center">{totalPossibleRN.toLocaleString()}</td>
                                    <td className="text-center text-indigo-300">{avgOcc.toFixed(1)}%</td>
                                    <td className="text-center text-indigo-200">{Math.round(totalRN).toLocaleString()}</td>
                                    <td className="text-center text-slate-300">{avgGuests.toFixed(2)}</td>
                                    <td className="text-center font-mono text-amber-300">{Math.round(avgBaseADR).toLocaleString()}</td>
                                    <td className="text-center text-slate-300">{avgSegCoeff.toFixed(1)}%</td>
                                    <td className="text-center font-mono text-amber-200">{Math.round(avgNetADR).toLocaleString()}</td>
                                    <td className="text-right pr-4 text-emerald-300 text-sm">{formatThs(totalRev)}</td>
                                  </tr>
                                );
                              })()}
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* ══ ТАБЛИЦА 1: ПЛАН ══ */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 bg-indigo-950 border-b border-indigo-800 flex items-center justify-between gap-4">
                          <div>
                            <h2 className="text-sm font-bold text-white uppercase tracking-wider">ПЛАН — доходы по каналам продаж</h2>
                            <p className="text-[10px] text-indigo-400 mt-0.5">Задайте плановую долю (%) каждого канала — суммы пересчитаются. Сумма долей по строке должна быть 100%.</p>
                          </div>
                          <button
                            onClick={() => setSegRefreshedAt(new Date())}
                            className="flex items-center gap-2 bg-indigo-700 hover:bg-indigo-600 text-white text-xs font-bold px-4 py-2 rounded-lg transition-colors whitespace-nowrap"
                          >
                            <RefreshCw size={13} />
                            Обновить из загрузки
                            {segRefreshedAt && (
                              <span className="text-indigo-300 font-normal">
                                · {segRefreshedAt.toLocaleTimeString('ru-RU', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                              </span>
                            )}
                          </button>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full data-table min-w-[1100px]">
                            <thead>
                              <tr>
                                <th className="text-left bg-slate-900 sticky left-0 z-10 text-[10px] py-2 px-3" style={MW}>Месяц</th>
                                {SEGS.map(s => (
                                  <th key={s.key} colSpan={4} className={`text-center text-[10px] py-2 ${s.hdr} border-l-2 border-slate-700`}>{s.label}</th>
                                ))}
                                <th colSpan={2} className="bg-slate-700 text-center text-[10px] py-2 border-l-2 border-slate-500">Итого</th>
                              </tr>
                              <tr>
                                <th className="bg-slate-800 sticky left-0 z-10" style={MW}></th>
                                {SEGS.map(s => (
                                  <React.Fragment key={s.key}>
                                    <th className="bg-slate-800 text-xs font-semibold text-slate-400 border-l-2 border-slate-700 text-center py-1" style={{width:'70px'}}>Доля, %</th>
                                    <th className="bg-slate-800 text-[9px] font-semibold text-slate-400 text-center py-1" style={{width:'55px'}}>RN</th>
                                    <th className="bg-slate-800 text-[9px] font-semibold text-slate-400 text-center py-1" style={{width:'75px'}}>ADR нетто</th>
                                    <th className="bg-slate-700 text-[9px] font-semibold text-slate-300 text-right py-1 pr-3" style={{width:'90px'}}>тыс. руб</th>
                                  </React.Fragment>
                                ))}
                                <th className="bg-slate-600 text-[9px] font-semibold text-slate-200 text-center py-1 border-l-2 border-slate-500" style={{width:'55px'}}>
                                  Сумма %
                                </th>
                                <th className="bg-slate-600 text-[9px] font-semibold text-slate-200 text-right py-1 pr-3" style={{width:'100px'}}>
                                  тыс. руб
                                </th>
                              </tr>
                            </thead>
                            <tbody>
                              {MONTHS.map((m, mIdx) => {
                                const row = mData[mIdx];
                                const sumPct = row.reduce((a, s) => a + s.planPct, 0);
                                const rowTotal = row.reduce((a, s) => a + s.planRev, 0);
                                const pctOk = Math.abs(sumPct - 100) < 0.5;
                                const pctOver = sumPct > 100.5;
                                const pctCls = pctOk
                                  ? 'text-emerald-600 font-black'
                                  : pctOver
                                    ? 'text-red-600 font-black'
                                    : 'text-amber-600 font-black';
                                const pctBg = pctOk ? 'bg-emerald-50' : pctOver ? 'bg-red-50' : 'bg-amber-50';
                                return (
                                  <tr key={mIdx} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                                    <td className="font-bold text-slate-900 sticky left-0 bg-white z-10 text-[10px] py-1.5 px-3 border-r border-slate-100" style={MW}>{m.name}</td>
                                    {SEGS.map((s, si) => (
                                      <React.Fragment key={s.key}>
                                        <td className="text-center border-l-2 border-slate-100 p-0">
                                          <input
                                            type="number"
                                            value={row[si].planPct}
                                            onChange={(e) => handleSegmentChange(mIdx, s.key, 'plan', e.target.value)}
                                            className={`w-full text-center text-base font-bold ${s.txt} outline-none bg-transparent px-1 py-1.5`}
                                          />
                                        </td>
                                        <td className="text-center py-1.5 text-[10px] text-slate-500">
                                          {Math.round(row[si].segRN)}
                                        </td>
                                        <td className="text-center py-1.5 text-[10px] text-slate-600 font-mono">
                                          {row[si].netADR > 0 ? Math.round(row[si].netADR).toLocaleString() : '—'}
                                        </td>
                                        <td className={`text-right pr-3 py-1.5 ${s.row}`}>
                                          <span className={`text-xs font-black ${s.txt}`}>{formatThs(row[si].planRev)}</span>
                                        </td>
                                      </React.Fragment>
                                    ))}
                                    {/* Итого: проверка % + сумма тыс. руб */}
                                    <td className={`text-center py-1.5 border-l-2 border-slate-200 ${pctBg}`}>
                                      <div className={`text-xs ${pctCls}`}>{sumPct.toFixed(0)}%</div>
                                      {!pctOk && (
                                        <div className="text-[9px] text-slate-500 leading-tight">
                                          {pctOver ? `перебор +${(sumPct - 100).toFixed(0)}%` : `нехватка −${(100 - sumPct).toFixed(0)}%`}
                                        </div>
                                      )}
                                    </td>
                                    <td className="text-right pr-3 py-1.5 bg-slate-100">
                                      <span className="text-xs font-black text-slate-800">{formatThs(rowTotal)}</span>
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              {(() => {
                                const totBySegs = SEGS.map((_, si) => ({
                                  planRev: MONTHS.reduce((a, __, mIdx) => a + mData[mIdx][si].planRev, 0),
                                  totalRN: MONTHS.reduce((a, __, mIdx) => a + mData[mIdx][si].segRN, 0),
                                  avgPct: MONTHS.reduce((a, __, mIdx) => a + mData[mIdx][si].planPct, 0) / MONTHS.length,
                                }));
                                const grandTotal = totBySegs.reduce((a, s) => a + s.planRev, 0);
                                const avgSumPct = totBySegs.reduce((a, s) => a + s.avgPct, 0);
                                const avgOk = Math.abs(avgSumPct - 100) < 0.5;
                                return (
                                  <tr className="bg-slate-900 text-white">
                                    <td className="py-2.5 px-3 uppercase text-[9px] tracking-wider sticky left-0 bg-slate-900" style={MW}>ИТОГО ГОД</td>
                                    {SEGS.map((s, si) => (
                                      <React.Fragment key={s.key}>
                                        <td className="text-center text-slate-300 text-sm font-bold border-l-2 border-slate-700">{totBySegs[si].avgPct.toFixed(0)}%</td>
                                        <td className="text-center text-slate-400 text-xs">{Math.round(totBySegs[si].totalRN).toLocaleString()}</td>
                                        <td className="text-center text-slate-400 text-xs">
                                          {totBySegs[si].totalRN > 0 ? Math.round(totBySegs[si].planRev / totBySegs[si].totalRN).toLocaleString() : '—'}
                                        </td>
                                        <td className="text-right pr-3 font-black text-base text-slate-100">{formatThs(totBySegs[si].planRev)}</td>
                                      </React.Fragment>
                                    ))}
                                    <td className={`text-center text-sm font-black border-l-2 border-slate-500 ${avgOk ? 'text-emerald-400' : 'text-red-400'}`}>
                                      {avgSumPct.toFixed(0)}%
                                    </td>
                                    <td className="text-right pr-3 font-black text-base text-white">{formatThs(grandTotal)}</td>
                                  </tr>
                                );
                              })()}
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* ══ ДЕТАЛЬНАЯ РАСКЛАДКА РАСЧЁТА ══ */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 bg-slate-700 border-b border-slate-600">
                          <h2 className="text-sm font-bold text-white uppercase tracking-wider">Детальная раскладка — проверка расчёта</h2>
                          <p className="text-[10px] text-slate-400 mt-1 font-mono">
                            RN сег. = RN всего × Доля%　·　ADR нетто = Базовый ADR × Коэфф%　·　Выручка = RN сег. × ADR нетто
                          </p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full data-table min-w-[1200px] text-xs">
                            <thead>
                              <tr>
                                <th className="text-left bg-slate-900 sticky left-0 z-10 py-3 px-3 text-xs" style={MW}>Месяц</th>
                                <th className="bg-slate-800 text-slate-300 text-center py-3 px-2" style={{width:'70px'}}>RN всего</th>
                                <th className="bg-slate-800 text-slate-300 text-center py-3 px-2 border-r-2 border-slate-600" style={{width:'90px'}}>Баз. ADR, ₽</th>
                                {SEGS.map(s => (
                                  <th key={s.key} colSpan={3} className={`text-center py-3 ${s.hdr} border-l-2 border-slate-700 text-[10px]`}>
                                    {s.label} · {(segmentCoeffs as any)[s.key]}%
                                  </th>
                                ))}
                              </tr>
                              <tr>
                                <th className="bg-slate-800 sticky left-0 z-10" style={MW}></th>
                                <th className="bg-slate-800 text-[10px] text-slate-500 text-center py-1.5"></th>
                                <th className="bg-slate-800 text-[10px] text-slate-500 text-center py-1.5 border-r-2 border-slate-600"></th>
                                {SEGS.map(s => (
                                  <React.Fragment key={s.key}>
                                    <th className="bg-slate-800 text-[10px] font-semibold text-slate-400 border-l-2 border-slate-700 text-center py-1.5" style={{width:'65px'}}>RN</th>
                                    <th className="bg-slate-800 text-[10px] font-semibold text-slate-400 text-center py-1.5" style={{width:'80px'}}>ADR нетто, ₽</th>
                                    <th className="bg-slate-700 text-[10px] font-semibold text-slate-300 text-right py-1.5 pr-3" style={{width:'90px'}}>тыс. руб</th>
                                  </React.Fragment>
                                ))}
                              </tr>
                            </thead>
                            <tbody>
                              {MONTHS.map((m, mIdx) => {
                                const res = totals.monthResults[mIdx];
                                const mRN = res.mRN;
                                const baseADR = mRN > 0 ? res.mRevBase / mRN : 0;
                                const row = mData[mIdx];
                                return (
                                  <tr key={mIdx} className="hover:bg-slate-50 border-b border-slate-100">
                                    <td className="font-bold text-slate-900 sticky left-0 bg-white z-10 py-2 px-3 border-r border-slate-100" style={MW}>{m.name}</td>
                                    <td className="text-center py-2 font-mono text-slate-700 font-semibold">{Math.round(mRN).toLocaleString()}</td>
                                    <td className="text-center py-2 font-mono text-slate-700 font-semibold border-r-2 border-slate-200">
                                      {Math.round(baseADR).toLocaleString()}
                                    </td>
                                    {SEGS.map((s, si) => (
                                      <React.Fragment key={s.key}>
                                        <td className="text-center py-2 border-l-2 border-slate-100 text-slate-600">
                                          {Math.round(row[si].segRN).toLocaleString()}
                                        </td>
                                        <td className="text-center py-2 font-mono text-slate-700">
                                          {row[si].netADR > 0 ? Math.round(row[si].netADR).toLocaleString() : '—'}
                                        </td>
                                        <td className={`text-right pr-3 py-2 ${s.row}`}>
                                          <span className={`font-bold ${s.txt}`}>{formatThs(row[si].planRev)}</span>
                                        </td>
                                      </React.Fragment>
                                    ))}
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              {(() => {
                                const totBySegs = SEGS.map((_, si) => ({
                                  totalRN: MONTHS.reduce((a, __, mIdx) => a + mData[mIdx][si].segRN, 0),
                                  planRev: MONTHS.reduce((a, __, mIdx) => a + mData[mIdx][si].planRev, 0),
                                }));
                                const totalRN = MONTHS.reduce((a, __, mIdx) => a + totals.monthResults[mIdx].mRN, 0);
                                const totalRevBase = MONTHS.reduce((a, __, mIdx) => a + totals.monthResults[mIdx].mRevBase, 0);
                                const avgBaseADR = totalRN > 0 ? totalRevBase / totalRN : 0;
                                return (
                                  <tr className="bg-slate-900 text-white">
                                    <td className="py-2.5 px-3 uppercase text-[9px] tracking-wider sticky left-0 bg-slate-900" style={MW}>ИТОГО ГОД</td>
                                    <td className="text-center font-mono font-bold">{Math.round(totalRN).toLocaleString()}</td>
                                    <td className="text-center font-mono text-slate-300 border-r-2 border-slate-600">{Math.round(avgBaseADR).toLocaleString()}</td>
                                    {SEGS.map((s, si) => (
                                      <React.Fragment key={s.key}>
                                        <td className="text-center text-slate-300 border-l-2 border-slate-700">{Math.round(totBySegs[si].totalRN).toLocaleString()}</td>
                                        <td className="text-center text-slate-400 text-[10px]">
                                          {totBySegs[si].totalRN > 0 ? Math.round(totBySegs[si].planRev / totBySegs[si].totalRN).toLocaleString() : '—'}
                                        </td>
                                        <td className="text-right pr-3 font-black text-slate-100">{formatThs(totBySegs[si].planRev)}</td>
                                      </React.Fragment>
                                    ))}
                                  </tr>
                                );
                              })()}
                            </tfoot>
                          </table>
                        </div>
                      </div>

                      {/* ══ ТАБЛИЦА 2: ФАКТ + ОТКЛОНЕНИЕ ══ */}
                      <div className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                        <div className="px-5 py-4 bg-emerald-950 border-b border-emerald-800 flex items-baseline gap-3">
                          <h2 className="text-sm font-bold text-white uppercase tracking-wider">ФАКТ — выполнение плана по каналам</h2>
                          <p className="text-[10px] text-emerald-400">Вводите фактический % и фактические доходы. Отклонение от плана считается автоматически.</p>
                        </div>
                        <div className="overflow-x-auto">
                          <table className="w-full data-table min-w-[1000px]">
                            <thead>
                              <tr>
                                <th className="text-left bg-slate-900 sticky left-0 z-10 text-xs py-3 px-3" style={MW}>Месяц</th>
                                {SEGS.map(s => (
                                  <th key={s.key} colSpan={3} className={`text-center text-xs py-3 ${s.hdr} border-l-2 border-slate-700`}>{s.label}</th>
                                ))}
                                <th colSpan={2} className="bg-emerald-900 text-center text-xs py-3 border-l-2 border-emerald-700">Итого</th>
                              </tr>
                              <tr>
                                <th className="bg-slate-800 sticky left-0 z-10" style={MW}></th>
                                {SEGS.map(s => (
                                  <React.Fragment key={s.key}>
                                    <th className="bg-slate-800 text-[10px] font-semibold text-slate-400 border-l-2 border-slate-700 text-center py-2" style={{width:'64px'}}>Загрузка, %</th>
                                    <th className="bg-slate-700 text-[10px] font-semibold text-slate-300 text-right py-2 pr-3" style={{width:'130px'}}>Доходы, тыс. руб</th>
                                    <th className="bg-slate-600 text-[10px] font-semibold text-slate-200 text-center py-2" style={{width:'56px'}}>Откл., %</th>
                                  </React.Fragment>
                                ))}
                                <th className="bg-emerald-900 text-[10px] font-semibold text-emerald-200 text-right py-2 pr-3 border-l-2 border-emerald-700" style={{width:'130px'}}>Доходы, тыс. руб</th>
                                <th className="bg-emerald-900 text-[10px] font-semibold text-emerald-200 text-center py-2" style={{width:'56px'}}>Откл., %</th>
                              </tr>
                            </thead>
                            <tbody>
                              {MONTHS.map((m, mIdx) => {
                                const row = mData[mIdx];
                                const rowTotalPlan = row.reduce((a, s) => a + s.planRev, 0);
                                const rowTotalFact = row.reduce((a, s) => a + s.factRev, 0);
                                const rowHasFact = row.some(s => s.factRev > 0);
                                const rowDevPct = rowHasFact && rowTotalPlan > 0 ? ((rowTotalFact - rowTotalPlan) / rowTotalPlan) * 100 : null;
                                return (
                                  <tr key={mIdx} className="hover:bg-slate-50 transition-colors border-b border-slate-100">
                                    <td className="font-bold text-slate-900 sticky left-0 bg-white z-10 text-xs py-2.5 px-3 border-r border-slate-100" style={MW}>{m.name}</td>
                                    {SEGS.map((s, si) => {
                                      const sd = row[si];
                                      return (
                                        <React.Fragment key={s.key}>
                                          <td className="text-center border-l-2 border-slate-100 p-0">
                                            <input
                                              type="number"
                                              value={segmentData[mIdx][s.key as keyof typeof segmentData[0]].fact || ''}
                                              placeholder="—"
                                              onChange={(e) => handleSegmentChange(mIdx, s.key, 'fact', e.target.value)}
                                              className={`w-full text-center text-xs font-bold ${s.txt} outline-none bg-transparent px-1 py-2`}
                                            />
                                          </td>
                                          <td className={`p-0 ${s.row}`}>
                                            <input
                                              type="number"
                                              value={segmentData[mIdx][s.key as keyof typeof segmentData[0]].revFact || ''}
                                              placeholder="—"
                                              onChange={(e) => handleSegmentChange(mIdx, s.key, 'revFact', e.target.value)}
                                              className={`w-full text-right text-sm font-bold ${s.txt} outline-none bg-transparent px-2 py-2.5`}
                                            />
                                          </td>
                                          <td className={`text-center py-2.5 text-sm font-bold ${varCls(sd.devPct)}`}>
                                            {varTxt(sd.devPct)}
                                          </td>
                                        </React.Fragment>
                                      );
                                    })}
                                    <td className={`text-right pr-3 py-2.5 border-l-2 border-emerald-100 text-sm font-black ${rowHasFact ? 'text-emerald-700' : 'text-slate-300'}`}>
                                      {rowHasFact ? formatThs(rowTotalFact) : '—'}
                                    </td>
                                    <td className={`text-center py-2.5 text-sm font-bold ${varCls(rowDevPct)}`}>
                                      {varTxt(rowDevPct)}
                                    </td>
                                  </tr>
                                );
                              })}
                            </tbody>
                            <tfoot>
                              {(() => {
                                const totBySegs = SEGS.map((_, si) => ({
                                  factRev: MONTHS.reduce((a, __, mIdx) => a + mData[mIdx][si].factRev, 0),
                                  planRev: MONTHS.reduce((a, __, mIdx) => a + mData[mIdx][si].planRev, 0),
                                }));
                                const grandFact = totBySegs.reduce((a, s) => a + s.factRev, 0);
                                const grandPlan = totBySegs.reduce((a, s) => a + s.planRev, 0);
                                const grandDev = grandFact > 0 && grandPlan > 0 ? ((grandFact - grandPlan) / grandPlan) * 100 : null;
                                return (
                                  <tr className="bg-slate-900 text-white">
                                    <td className="py-2.5 px-3 uppercase text-[9px] tracking-wider sticky left-0 bg-slate-900" style={MW}>ИТОГО ГОД</td>
                                    {SEGS.map((s, si) => {
                                      const t = totBySegs[si];
                                      const dev = t.factRev > 0 && t.planRev > 0 ? ((t.factRev - t.planRev) / t.planRev) * 100 : null;
                                      return (
                                        <React.Fragment key={s.key}>
                                          <td className="text-center text-slate-400 border-l-2 border-slate-700">—</td>
                                          <td className="text-right pr-3 font-black text-base text-emerald-300">{t.factRev > 0 ? formatThs(t.factRev) : '—'}</td>
                                          <td className={`text-center font-bold text-sm ${dev !== null ? (dev >= 0 ? 'text-emerald-300' : 'text-red-300') : 'text-slate-500'}`}>{varTxt(dev)}</td>
                                        </React.Fragment>
                                      );
                                    })}
                                    <td className="text-right pr-3 font-black text-base text-emerald-300 border-l-2 border-emerald-700">{grandFact > 0 ? formatThs(grandFact) : '—'}</td>
                                    <td className={`text-center font-bold text-sm ${grandDev !== null ? (grandDev >= 0 ? 'text-emerald-300' : 'text-red-300') : 'text-slate-500'}`}>{varTxt(grandDev)}</td>
                                  </tr>
                                );
                              })()}
                            </tfoot>
                          </table>
                        </div>
                      </div>
                    </>
                  );
                })()}
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
                        // Estimate bed days for this package: totalBedDays * (avg annual mix / 100)
                        const pkgBD = totals.totalBedDays * ((avgPkgMix[pk.key] ?? 0) / 100);
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
                    onClick={() => {
                      const style = document.createElement('style');
                      style.id = '__pl_landscape__';
                      style.textContent = '@page { size: A4 landscape; margin: 8mm; }';
                      document.head.appendChild(style);
                      document.body.classList.add('printing-pricelist');
                      window.print();
                      setTimeout(() => {
                        const el = document.getElementById('__pl_landscape__');
                        if (el) el.remove();
                        document.body.classList.remove('printing-pricelist');
                      }, 500);
                    }}
                    className="flex items-center gap-2 bg-slate-900 text-white px-4 py-2 rounded-lg hover:bg-slate-800 transition-all shadow-sm"
                  >
                    <Printer size={18} />
                    Печать Прейскуранта
                  </button>
                </div>
                {PRICE_PERIODS.map((pp) => (
                  <div key={pp.pIdx} className="pricelist-period-card bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex items-center gap-4">
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Период {pp.pIdx + 1}</span>
                      <span className="text-sm font-semibold text-slate-700">{pp.dates}</span>
                      <span className="text-xs text-slate-400 ml-auto">{SEASONS.find(s => s.key === pp.sKey)?.name}</span>
                    </div>
                    <div className="overflow-x-auto pricelist-table-wrap">
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
                                    value={prices[rt.key][pk.key][pp.pIdx] || ''}
                                    placeholder="—"
                                    onChange={(e) => handlePriceChange(rt.key, pk.key, pp.pIdx, e.target.value)}
                                    disabled={pk.key === 'promo'}
                                    className={`w-20 text-center font-mono font-bold py-1 rounded border-b-2 border-transparent focus:border-indigo-50 focus:bg-indigo-50 transition-all outline-none ${prices[rt.key][pk.key][pp.pIdx] === 0 ? 'text-slate-300' : pk.color} ${pk.key === 'promo' ? 'opacity-50 cursor-not-allowed' : ''}`}
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
                {/* Помесячный микс — полная ширина */}
                <div className="md:col-span-2 bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-bold flex items-center gap-2">
                      <Briefcase size={18} className="text-indigo-500" /> Структура продаж по месяцам (Mix, %)
                    </h3>
                    <button
                      onClick={() => setPkgMixByMonth(prev => prev.map(() => ({ ...prev[0] })))}
                      className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-lg hover:bg-indigo-100 transition-colors"
                    >
                      Янв → все месяцы
                    </button>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs border-collapse">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="py-2 px-3 text-left font-semibold">Месяц</th>
                          {PACKAGES.map(pk => <th key={pk.key} className={`py-2 px-2 text-center font-bold ${pk.color}`}>{pk.short}</th>)}
                          <th className="py-2 px-3 text-center font-semibold text-slate-300">Итого</th>
                        </tr>
                      </thead>
                      <tbody>
                        {MONTHS.map((m, mIdx) => {
                          const mix = pkgMixByMonth[mIdx];
                          const total = (Object.values(mix) as number[]).reduce((a, b) => a + b, 0);
                          const ok = Math.abs(total - 100) < 0.1;
                          return (
                            <tr key={mIdx} className={`border-b border-slate-100 ${mIdx % 2 === 0 ? 'bg-white' : 'bg-slate-50'}`}>
                              <td className="py-1.5 px-3 font-semibold text-slate-700">{m.name}</td>
                              {PACKAGES.map(pk => (
                                <td key={pk.key} className="py-1 px-2 text-center">
                                  <input
                                    type="number"
                                    min={0} max={100}
                                    value={mix[pk.key as keyof typeof DEFAULT_PKG_MIX]}
                                    onChange={(e) => {
                                      const val = parseInt(e.target.value) || 0;
                                      setPkgMixByMonth(prev => prev.map((mo, i) => i === mIdx ? { ...mo, [pk.key]: val } : mo));
                                    }}
                                    className={`w-12 text-center font-bold bg-transparent outline-none border-b border-transparent focus:border-indigo-400 ${pk.color}`}
                                  />
                                </td>
                              ))}
                              <td className={`py-1.5 px-3 text-center font-black ${ok ? 'text-emerald-600' : 'text-red-600'}`}>
                                {total}%
                              </td>
                            </tr>
                          );
                        })}
                        {/* Среднее — по каждому пакету, итог = сумма средних */}
                        <tr className="bg-slate-100 border-t-2 border-slate-300">
                          <td className="py-2 px-3 font-black uppercase text-[10px] text-slate-500">Среднее</td>
                          {(() => {
                            const avgs = PACKAGES.map(pk => ({
                              key: pk.key,
                              color: pk.color,
                              val: Math.round(pkgMixByMonth.reduce((s, mo) => s + mo[pk.key as keyof typeof DEFAULT_PKG_MIX], 0) / 12),
                            }));
                            const avgTotal = avgs.reduce((s, a) => s + a.val, 0);
                            return (
                              <>
                                {avgs.map(a => (
                                  <td key={a.key} className={`py-2 px-2 text-center font-black ${a.color}`}>{a.val}%</td>
                                ))}
                                <td className={`py-2 px-3 text-center font-black ${Math.abs(avgTotal - 100) < 2 ? 'text-emerald-600' : 'text-amber-600'}`}>
                                  {avgTotal}%
                                </td>
                              </>
                            );
                          })()}
                        </tr>
                      </tbody>
                    </table>
                  </div>
                  <p className="text-[10px] text-slate-400 mt-2">* Среднее считается как округлённое среднее по каждому пакету. Если итог ≠ 100 — проверь, заполнены ли все месяцы.</p>
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
                        {PRICE_PERIODS.map(pp => <option key={pp.pIdx} value={pp.pIdx}>{pp.dates}</option>)}
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
                      {ROOM_TYPES.find(r => r.key === calcRoom)?.label} · {PRICE_PERIODS[calcSeason]?.dates}
                    </p>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse text-sm">
                      <thead>
                        <tr className="bg-slate-900 text-white">
                          <th className="p-3 border border-slate-700 text-left" rowSpan={2}>Тариф / Пакет</th>
                          <th className="p-3 border border-slate-700 text-right" rowSpan={2}>Цена<br/><span className="text-[9px] font-normal opacity-60">за к-день, ₽</span></th>
                          <th className="p-3 border border-slate-700 text-center bg-amber-900" colSpan={4}>Питание</th>
                          <th className="p-3 border border-slate-700 text-right bg-cyan-900" rowSpan={2}>SPA</th>
                          <th className="p-3 border border-slate-700 text-right bg-purple-900" rowSpan={2}>Медицина</th>
                          <th className="p-3 border border-slate-700 text-right bg-indigo-900" rowSpan={2}>Проживание</th>
                          <th className="p-3 border border-slate-700 text-right bg-emerald-900" rowSpan={2}>Итого</th>
                        </tr>
                        <tr className="bg-slate-800 text-white text-[10px]">
                          <th className="p-2 border border-slate-700 text-right bg-amber-950">Итого</th>
                          <th className="p-2 border border-slate-700 text-right bg-amber-950 opacity-70">Завтрак</th>
                          <th className="p-2 border border-slate-700 text-right bg-amber-950 opacity-70">Обед</th>
                          <th className="p-2 border border-slate-700 text-right bg-amber-950 opacity-70">Ужин</th>
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

                          let b=0, l=0, d=0, spa=0, med=0, acc=0, foodTotal=0;

                          if (['aqua_fb', 'ultra', 'spa', 'promo'].includes(pk.key)) {
                            foodTotal = Math.round(price * calcConfig.fb_ultra_spa.food / 100);
                            b = Math.round(foodTotal * calcConfig.fb_ultra_spa.b / 100);
                            l = Math.round(foodTotal * calcConfig.fb_ultra_spa.l / 100);
                            d = foodTotal - b - l; // остаток — ужин, чтобы b+l+d = foodTotal точно
                            spa = Math.round(price * calcConfig.fb_ultra_spa.spa / 100);
                            med = Math.round(price * calcConfig.fb_ultra_spa.med / 100);
                            acc = price - foodTotal - spa - med; // остаток — проживание
                          } else if (pk.key === 'med') {
                            foodTotal = Math.round(price * calcConfig.ultra_med.food / 100);
                            b = Math.round(foodTotal * calcConfig.ultra_med.b / 100);
                            l = Math.round(foodTotal * calcConfig.ultra_med.l / 100);
                            d = foodTotal - b - l;
                            spa = Math.round(price * calcConfig.ultra_med.spa / 100);
                            med = Math.round(price * calcConfig.ultra_med.med / 100);
                            acc = price - foodTotal - spa - med;
                          } else if (pk.key === 'aqua_bb') {
                            const base = getBaseFood();
                            b = base.b;
                            foodTotal = b;
                            spa = Math.round(price * calcConfig.others.spa / 100);
                            med = Math.round(price * calcConfig.others.med / 100);
                            acc = price - b - spa - med;
                          } else if (pk.key === 'aqua_hb') {
                            const base = getBaseFood();
                            b = base.b;
                            d = base.d;
                            foodTotal = b + d;
                            spa = Math.round(price * calcConfig.others.spa / 100);
                            med = Math.round(price * calcConfig.others.med / 100);
                            acc = price - b - d - spa - med;
                          }

                          // Итого всегда = Цена (acc рассчитан как остаток)
                          const sum = foodTotal + spa + med + acc;

                          return (
                            <tr key={pk.key} className="hover:bg-slate-50 transition-colors">
                              <td className="p-3 border border-slate-200 font-bold">{pk.label}</td>
                              <td className="p-3 border border-slate-200 text-right font-mono font-black bg-slate-50">{price.toLocaleString()}</td>
                              {/* Питание: итого + расшифровка Б/О/У */}
                              <td className="p-3 border border-slate-200 text-right font-bold text-amber-700">{foodTotal.toLocaleString()}</td>
                              <td className="p-3 border border-slate-200 text-right text-[10px] text-slate-400">{b > 0 ? b.toLocaleString() : '—'}</td>
                              <td className="p-3 border border-slate-200 text-right text-[10px] text-slate-400">{l > 0 ? l.toLocaleString() : '—'}</td>
                              <td className="p-3 border border-slate-200 text-right text-[10px] text-slate-400">{d > 0 ? d.toLocaleString() : '—'}</td>
                              <td className="p-3 border border-slate-200 text-right font-bold text-cyan-700">{spa.toLocaleString()}</td>
                              <td className="p-3 border border-slate-200 text-right font-bold text-purple-700">{med.toLocaleString()}</td>
                              <td className="p-3 border border-slate-200 text-right font-bold text-indigo-600">{acc.toLocaleString()}</td>
                              <td className={`p-3 border border-slate-200 text-right font-black text-lg ${sum !== price ? 'text-red-500' : 'text-emerald-600'}`}>{sum.toLocaleString()}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-200 text-[10px] text-slate-500">
                    <p className="font-bold text-slate-700 mb-2 uppercase tracking-wider">Методология расчёта</p>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p><span className="font-bold text-amber-700">Питание</span> = % от цены (FB/SPA/Ultra: {calcConfig.fb_ultra_spa.food}%, МЕД: {calcConfig.ultra_med.food}%)</p>
                        <p className="mt-1 opacity-80">Завтрак / Обед / Ужин — доля внутри питания ({calcConfig.fb_ultra_spa.b}/{calcConfig.fb_ultra_spa.l}/{calcConfig.fb_ultra_spa.d}%)</p>
                        <p className="mt-1">Для BB/HB — питание рассчитывается от базовой цены Ultra</p>
                      </div>
                      <div>
                        <p><span className="font-bold text-cyan-700">SPA</span> = {calcConfig.fb_ultra_spa.spa}% от цены (FB/Ultra/SPA) · {calcConfig.others.spa}% (BB/HB)</p>
                        <p className="mt-1"><span className="font-bold text-purple-700">Медицина</span> = {calcConfig.fb_ultra_spa.med}% (FB/Ultra) · {calcConfig.ultra_med.med}% (МЕД) · {calcConfig.others.med}% (BB/HB)</p>
                        <p className="mt-1"><span className="font-bold text-indigo-700">Проживание</span> = Цена − Питание − SPA − Медицина</p>
                      </div>
                    </div>
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

            {activeTab === 'detail' && (
              <motion.div
                key="detail"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h2 className="text-xl font-bold flex items-center gap-2 mb-1">
                    <Table2 className="text-indigo-500" size={22} />
                    Детальный расчёт
                  </h2>
                  <p className="text-sm text-slate-500 mb-5">
                    Полная цепочка: RN → Пакет → Цена → × Гостей → × КоэфСег → Выручка
                  </p>

                  {/* Month selector */}
                  <div className="flex flex-wrap gap-2 mb-6">
                    {MONTHS.map((mo, i) => (
                      <button
                        key={i}
                        onClick={() => setDetailMonth(i)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
                          detailMonth === i
                            ? 'bg-indigo-600 text-white shadow-sm'
                            : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                        }`}
                      >
                        {mo.name}
                      </button>
                    ))}
                  </div>

                  {(() => {
                    const mIdx = detailMonth;
                    const mo = MONTHS[mIdx];

                    // Segment weighted coefficient
                    const segWeightedCoeff = (['direct', 'to', 'fss', 'corp', 'ota'] as const).reduce((acc, segKey) => {
                      const share = (segmentData[mIdx] as any)[segKey]?.plan / 100 || 0;
                      const coeff = (segmentCoeffs as any)[segKey] / 100;
                      return acc + share * coeff;
                    }, 0) || 1;

                    const SEG_LABELS: Record<string, string> = { direct: 'Прямые', to: 'ТО', fss: 'ФСС', corp: 'Корп', ota: 'OTA' };

                    return (
                      <>
                        {/* Info cards */}
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                          <div className="bg-slate-50 rounded-xl p-3">
                            <p className="text-[10px] uppercase text-slate-400 font-bold mb-1">Месяц</p>
                            <p className="font-bold text-slate-900">{mo.name} · {mo.days} дней</p>
                          </div>
                          <div className="bg-indigo-50 rounded-xl p-3">
                            <p className="text-[10px] uppercase text-indigo-400 font-bold mb-1">КоэфСегментов</p>
                            <p className="font-black text-indigo-700 text-2xl leading-none">{segWeightedCoeff.toFixed(3)}</p>
                            <p className="text-[10px] text-slate-400 mt-0.5">множитель к цене гросс</p>
                          </div>
                          <div className="bg-slate-50 rounded-xl p-3 col-span-2">
                            <p className="text-[10px] uppercase text-slate-400 font-bold mb-2">Вклад сегментов</p>
                            <div className="flex flex-wrap gap-x-4 gap-y-1">
                              {(['direct', 'to', 'fss', 'corp', 'ota'] as const).map(sk => {
                                const share = (segmentData[mIdx] as any)[sk]?.plan ?? 0;
                                const coeff = (segmentCoeffs as any)[sk];
                                return (
                                  <span key={sk} className="text-xs text-slate-600">
                                    <span className="font-semibold">{SEG_LABELS[sk]}</span>{' '}
                                    {share}%<span className="text-slate-400">×{coeff}%</span>
                                    <span className="text-indigo-500 font-semibold ml-1">= {((share / 100) * (coeff / 100)).toFixed(3)}</span>
                                  </span>
                                );
                              })}
                            </div>
                          </div>
                        </div>

                        {/* Price periods in this month */}
                        <div className="mb-6">
                          <p className="text-[10px] uppercase text-slate-400 font-bold mb-2">Ценовые периоды в {mo.name}</p>
                          <div className="overflow-x-auto rounded-xl border border-slate-200">
                            <table className="w-full text-xs">
                              <thead>
                                <tr className="bg-slate-800 text-white">
                                  <th className="py-2 px-3 text-left font-semibold">Период</th>
                                  <th className="py-2 px-3 text-left font-semibold">Даты</th>
                                  <th className="py-2 px-3 text-left font-semibold">Сезон</th>
                                  <th className="py-2 px-3 text-center font-semibold">Дней</th>
                                  {ROOM_TYPES.filter(rt => (rooms[rt.key as keyof typeof rooms] || 0) > 0).map(rt => (
                                    <th key={rt.key} colSpan={PACKAGES.length} className="py-2 px-3 text-center font-semibold border-l border-slate-600">{rt.label}</th>
                                  ))}
                                </tr>
                                <tr className="bg-slate-700 text-slate-300 text-[10px]">
                                  <th></th><th></th><th></th><th></th>
                                  {ROOM_TYPES.filter(rt => (rooms[rt.key as keyof typeof rooms] || 0) > 0).map(rt => (
                                    <React.Fragment key={rt.key}>
                                      {PACKAGES.map((pk, pkIdx) => (
                                        <th key={pk.key} className={`py-1 px-2 text-center ${pkIdx === 0 ? 'border-l border-slate-600' : ''}`}>{pk.short}</th>
                                      ))}
                                    </React.Fragment>
                                  ))}
                                </tr>
                              </thead>
                              <tbody>
                                {mo.distribution.map((dist, dIdx) => {
                                  const s = seasons.find(sv => sv.key === dist.sKey)!;
                                  return (
                                    <tr key={dIdx} className="border-t border-slate-100 even:bg-slate-50">
                                      <td className="py-2 px-3 font-mono font-bold text-slate-500">P{dist.pIdx}</td>
                                      <td className="py-2 px-3 text-slate-500">{PRICE_PERIODS[dist.pIdx].dates}</td>
                                      <td className="py-2 px-3 font-medium">{s.name}</td>
                                      <td className="py-2 px-3 text-center font-bold">{dist.days}</td>
                                      {ROOM_TYPES.filter(rt => (rooms[rt.key as keyof typeof rooms] || 0) > 0).map(rt => (
                                        <React.Fragment key={rt.key}>
                                          {PACKAGES.map((pk, pkIdx) => {
                                            const price = (prices[rt.key]?.[pk.key]?.[dist.pIdx] || 0) * (1 + globalPriceAdj / 100);
                                            return (
                                              <td key={pk.key} className={`py-2 px-2 text-right font-mono text-[11px] ${pkIdx === 0 ? 'border-l border-slate-100' : ''} ${price > 0 ? pk.color : 'text-slate-300'}`}>
                                                {price > 0 ? Math.round(price).toLocaleString('ru') : '—'}
                                              </td>
                                            );
                                          })}
                                        </React.Fragment>
                                      ))}
                                    </tr>
                                  );
                                })}
                              </tbody>
                            </table>
                          </div>
                        </div>

                        {/* Per room type calculation tables */}
                        {ROOM_TYPES.map(rt => {
                          const roomCount = rooms[rt.key as keyof typeof rooms] || 0;
                          if (roomCount === 0) return null;

                          const occPlan = Math.min(100, Math.max(0, roomMonthlyData[mIdx][rt.key].plan + globalOccAdj));
                          const totalRN = roomCount * mo.days * (occPlan / 100);

                          // Aggregate per package across all periods
                          const pkgAgg: Record<string, { rn: number; rev: number; priceWeighted: number; guestWeighted: number }> = {};
                          PACKAGES.forEach(pk => { pkgAgg[pk.key] = { rn: 0, rev: 0, priceWeighted: 0, guestWeighted: 0 }; });

                          mo.distribution.forEach(dist => {
                            const sv = seasons.find(s => s.key === dist.sKey)!;
                            const periodRN = roomCount * dist.days * (occPlan / 100);
                            const guests = seasonData[sv.key].guests;

                            const rawMixes: Record<string, number> = {};
                            let totalRaw = 0;
                            PACKAGES.forEach(pk => {
                              const m = pkgMixByMonth[mIdx][pk.key as keyof typeof DEFAULT_PKG_MIX] / 100;
                              rawMixes[pk.key] = m;
                              totalRaw += m;
                            });
                            const mixNorm = totalRaw > 0 ? 1 / totalRaw : 0;

                            PACKAGES.forEach(pk => {
                              const effMix = rawMixes[pk.key] * mixNorm;
                              const price = (prices[rt.key]?.[pk.key]?.[dist.pIdx] || 0) * (1 + globalPriceAdj / 100);
                              const rnPkg = periodRN * effMix;
                              const rev = rnPkg * guests * price * segWeightedCoeff;
                              pkgAgg[pk.key].rn += rnPkg;
                              pkgAgg[pk.key].rev += rev;
                              pkgAgg[pk.key].priceWeighted += price * rnPkg;
                              pkgAgg[pk.key].guestWeighted += guests * rnPkg;
                            });
                          });

                          const totalRev = PACKAGES.reduce((s, pk) => s + pkgAgg[pk.key].rev, 0);
                          const monthADR = totalRN > 0 ? totalRev / totalRN : 0;

                          return (
                            <div key={rt.key} className="mb-5 rounded-xl overflow-hidden border border-slate-200">
                              {/* Room type header */}
                              <div className="bg-slate-900 text-white px-4 py-3 flex flex-wrap items-center gap-x-4 gap-y-1">
                                <span className="font-bold text-base">{rt.label}</span>
                                <span className="text-slate-400 text-sm">Комнат: {roomCount}</span>
                                <span className="text-slate-400 text-sm">Загрузка: {occPlan}%</span>
                                <span className="text-slate-300 font-semibold text-sm">RN = {Math.round(totalRN).toLocaleString('ru')}</span>
                                <span className="ml-auto text-emerald-400 font-semibold text-sm">ADR нетто ≈ {Math.round(monthADR).toLocaleString('ru')} ₽</span>
                                <span className="text-emerald-300 font-black text-lg">{(totalRev / 1000).toFixed(1)} тыс.₽</span>
                              </div>

                              <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="bg-slate-100 text-slate-600 text-[10px] uppercase tracking-wider">
                                      <th className="py-2 px-3 text-left">Пакет</th>
                                      <th className="py-2 px-3 text-center">План %</th>
                                      <th className="py-2 px-3 text-center">Эфф %</th>
                                      <th className="py-2 px-3 text-right">RN пакета</th>
                                      <th className="py-2 px-3 text-right">Цена ₽</th>
                                      <th className="py-2 px-3 text-center">Гостей</th>
                                      <th className="py-2 px-3 text-center">× КоэфСег</th>
                                      <th className="py-2 px-3 text-right">ADR нетто</th>
                                      <th className="py-2 px-3 text-right">Выручка тыс.₽</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {PACKAGES.map(pk => {
                                      const agg = pkgAgg[pk.key];
                                      const avgPrice = agg.rn > 0 ? agg.priceWeighted / agg.rn : 0;
                                      const avgGuests = agg.rn > 0 ? agg.guestWeighted / agg.rn : 0;
                                      const adrNetto = avgPrice * avgGuests * segWeightedCoeff;
                                      const planMix = pkgMixByMonth[mIdx][pk.key as keyof typeof DEFAULT_PKG_MIX];
                                      const effMixPct = totalRN > 0 ? (agg.rn / totalRN) * 100 : 0;
                                      return (
                                        <tr key={pk.key} className={`border-b border-slate-100 hover:bg-slate-50 ${agg.rn < 0.01 && planMix === 0 ? 'opacity-30' : ''}`}>
                                          <td className={`py-2 px-3 font-semibold ${pk.color}`}>
                                            {pk.short}
                                          </td>
                                          <td className="py-2 px-3 text-center text-slate-500">{planMix}%</td>
                                          <td className={`py-2 px-3 text-center font-semibold ${effMixPct > 0 ? 'text-slate-800' : 'text-slate-300'}`}>
                                            {effMixPct.toFixed(1)}%
                                          </td>
                                          <td className="py-2 px-3 text-right text-slate-600">{Math.round(agg.rn).toLocaleString('ru')}</td>
                                          <td className="py-2 px-3 text-right font-mono text-slate-700">
                                            {avgPrice > 0 ? Math.round(avgPrice).toLocaleString('ru') : '—'}
                                          </td>
                                          <td className="py-2 px-3 text-center text-slate-500">
                                            {avgGuests > 0 ? avgGuests.toFixed(1) : '—'}
                                          </td>
                                          <td className="py-2 px-3 text-center font-semibold text-indigo-600">
                                            {agg.rn > 0.01 ? segWeightedCoeff.toFixed(3) : '—'}
                                          </td>
                                          <td className="py-2 px-3 text-right font-mono font-semibold text-slate-800">
                                            {adrNetto > 0 ? Math.round(adrNetto).toLocaleString('ru') : '—'}
                                          </td>
                                          <td className={`py-2 px-3 text-right font-bold ${agg.rev > 0 ? 'text-emerald-700' : 'text-slate-300'}`}>
                                            {agg.rev > 0 ? (agg.rev / 1000).toFixed(1) : '0,0'}
                                          </td>
                                        </tr>
                                      );
                                    })}
                                    {/* Total row */}
                                    <tr className="bg-slate-50 border-t-2 border-slate-300">
                                      <td className="py-2 px-3 font-black uppercase text-[10px] text-slate-500">Итого</td>
                                      <td className="py-2 px-3 text-center text-slate-400 text-xs">100%</td>
                                      <td className="py-2 px-3 text-center font-bold text-slate-700 text-xs">
                                        {(PACKAGES.reduce((s, pk) => s + (totalRN > 0 ? pkgAgg[pk.key].rn / totalRN * 100 : 0), 0)).toFixed(1)}%
                                      </td>
                                      <td className="py-2 px-3 text-right font-bold">{Math.round(totalRN).toLocaleString('ru')}</td>
                                      <td className="py-2 px-3 text-right text-slate-400">—</td>
                                      <td className="py-2 px-3 text-center text-slate-400">—</td>
                                      <td className="py-2 px-3 text-center text-slate-400">—</td>
                                      <td className="py-2 px-3 text-right font-bold font-mono">{Math.round(monthADR).toLocaleString('ru')}</td>
                                      <td className="py-2 px-3 text-right font-black text-emerald-700 text-base">{(totalRev / 1000).toFixed(1)}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <div className="bg-slate-50 px-4 py-2 text-[11px] text-slate-400 border-t border-slate-100">
                                Формула: <span className="font-mono">RN_пакета × Цена × Гостей × КоэфСег({segWeightedCoeff.toFixed(3)}) = Выручка</span>
                              </div>
                            </div>
                          );
                        })}

                        {/* Grand total for the month */}
                        {(() => {
                          let grandRev = 0;
                          let grandRN = 0;
                          ROOM_TYPES.forEach(rt => {
                            const roomCount = rooms[rt.key as keyof typeof rooms] || 0;
                            if (roomCount === 0) return;
                            const occPlan = Math.min(100, Math.max(0, roomMonthlyData[mIdx][rt.key].plan + globalOccAdj));
                            const totalRN = roomCount * mo.days * (occPlan / 100);
                            grandRN += totalRN;
                            mo.distribution.forEach(dist => {
                              const sv = seasons.find(s => s.key === dist.sKey)!;
                              const periodRN = roomCount * dist.days * (occPlan / 100);
                              const guests = seasonData[sv.key].guests;
                              const rawMixes: Record<string, number> = {};
                              let totalRaw = 0;
                              PACKAGES.forEach(pk => {
                                let m = pkgMixByMonth[mIdx][pk.key as keyof typeof DEFAULT_PKG_MIX] / 100;
                                if (pk.key === 'promo' && !sv.isLow) m = 0;
                                rawMixes[pk.key] = m;
                                totalRaw += m;
                              });
                              const mixNorm = totalRaw > 0 ? 1 / totalRaw : 0;
                              PACKAGES.forEach(pk => {
                                const effMix = rawMixes[pk.key] * mixNorm;
                                const price = (prices[rt.key]?.[pk.key]?.[dist.pIdx] || 0) * (1 + globalPriceAdj / 100);
                                grandRev += periodRN * effMix * guests * price * segWeightedCoeff;
                              });
                            });
                          });
                          const grandADR = grandRN > 0 ? grandRev / grandRN : 0;
                          return (
                            <div className="mt-2 bg-indigo-50 border border-indigo-200 rounded-xl px-5 py-4 flex flex-wrap gap-6 items-center">
                              <div>
                                <p className="text-[10px] uppercase text-indigo-400 font-bold">Итого за {mo.name}</p>
                                <p className="text-2xl font-black text-indigo-700">{(grandRev / 1000000).toFixed(2)} млн ₽</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase text-slate-400 font-bold">Всего RN</p>
                                <p className="text-lg font-bold text-slate-700">{Math.round(grandRN).toLocaleString('ru')}</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase text-slate-400 font-bold">ADR нетто (ср.)</p>
                                <p className="text-lg font-bold text-slate-700">{Math.round(grandADR).toLocaleString('ru')} ₽</p>
                              </div>
                              <div>
                                <p className="text-[10px] uppercase text-slate-400 font-bold">КоэфСегментов</p>
                                <p className="text-lg font-bold text-indigo-600">{segWeightedCoeff.toFixed(3)}</p>
                              </div>
                            </div>
                          );
                        })()}
                      </>
                    );
                  })()}
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
