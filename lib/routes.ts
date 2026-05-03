import {
  BarChart3,
  Bot,
  CalendarCheck,
  Compass,
  Gauge,
  GraduationCap,
  Home,
  Landmark,
  LineChart,
  Megaphone,
  ShieldCheck,
} from "lucide-react";

export const publicRoutes = {
  home: "/",
  login: "/login",
  signup: "/signup",
};

export const appRoutes = {
  dashboard: "/dashboard",
  mentor: "/mentor",
  careerNavigator: "/career-navigator",
  roiCalculator: "/roi-calculator",
  admissionPredictor: "/admission-predictor",
  timeline: "/timeline",
  decisionHub: "/decision-hub",
  loanEngine: "/loan-engine",
  applicationTracker: "/application-tracker",
  growthEngine: "/growth-engine",
  profile: "/profile",
};

export const sidebarRoutes = [
  {
    title: "Dashboard",
    href: appRoutes.dashboard,
    icon: Home,
  },
  {
    title: "AI Mentor",
    href: appRoutes.mentor,
    icon: Bot,
  },
  {
    title: "Career Navigator",
    href: appRoutes.careerNavigator,
    icon: Compass,
  },
  {
    title: "ROI Calculator",
    href: appRoutes.roiCalculator,
    icon: LineChart,
  },
  {
    title: "Admission Predictor",
    href: appRoutes.admissionPredictor,
    icon: GraduationCap,
  },
  {
    title: "Timeline",
    href: appRoutes.timeline,
    icon: CalendarCheck,
  },
  {
    title: "Decision Hub",
    href: appRoutes.decisionHub,
    icon: Gauge,
  },
  {
    title: "Loan Engine",
    href: appRoutes.loanEngine,
    icon: Landmark,
  },
  {
    title: "Application Tracker",
    href: appRoutes.applicationTracker,
    icon: ShieldCheck,
  },
  {
    title: "Growth Engine",
    href: appRoutes.growthEngine,
    icon: Megaphone,
  },
  {
    title: "Analytics",
    href: "/analytics",
    icon: BarChart3,
  },
];
