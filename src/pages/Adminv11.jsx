// src/pages/Adminv1.jsx
import React, { useEffect, useMemo, useRef, useState, useCallback } from "react";
import { createPortal } from "react-dom";
import { motion, useScroll, useTransform } from "framer-motion";
import {
  Download, Search, RefreshCw, BadgeCheck, Clock3, AlertCircle,
  History as HistoryIcon, Edit3, Wifi, WifiOff, ShieldAlert, CheckCircle2,
  Copy, ChevronLeft, ChevronRight, Eye, EyeOff, Columns, Settings, TriangleAlert,
  Users, CheckSquare, Square, Wand2, ChartNoAxesGantt, Filter, SlidersHorizontal,
  Globe, MonitorSmartphone, Smartphone, Trash2, Menu, X
} from "lucide-react";
import { supabase } from "../lib/supabase";
import { LOGO_URL } from "../shared/constants";

