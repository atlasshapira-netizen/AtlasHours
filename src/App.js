import React, { useState, useEffect, useMemo } from "react";
import { initializeApp } from "firebase/app";
import {
  getAuth,
  signInAnonymously,
  onAuthStateChanged,
  signInWithCustomToken,
} from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  deleteDoc,
  updateDoc, // Added updateDoc
  doc,
  onSnapshot,
  query,
  orderBy,
  serverTimestamp,
} from "firebase/firestore";
import {
  Clock,
  Calendar,
  Trash2,
  LogOut,
  Plus,
  ChevronDown,
  ChevronUp,
  UserCheck,
  Briefcase,
  History,
  Download,
  ArrowRight,
  Eye,
  FileSpreadsheet,
  Loader2,
  Globe,
  Edit2, // Added Edit icon
  X,
  Save,
} from "lucide-react";

// --- Firebase Configuration ---
// הערה חשובה: כשאתה מעביר את הקוד ל-CodeSandbox,
// את החלק הזה (המשתנים firebaseConfig ו-appId) תצטרך להחליף בנתונים שלך לפי המדריך.
const firebaseConfig = {
  apiKey: "AIzaSyC7_wbznTQU01GbeJYdIsrRwYeX5rn3gUE",

  authDomain: "atlas-clock.firebaseapp.com",

  projectId: "atlas-clock",

  storageBucket: "atlas-clock.firebasestorage.app",

  messagingSenderId: "77815923158",

  appId: "1:77815923158:web:5c6fb99e55b9a773226477",

  measurementId: "G-QX36JY714X",
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const appId = typeof __app_id !== "undefined" ? __app_id : "default-app-id";

// --- Translations ---
const translations = {
  he: {
    appTitle: "שעון נוכחות אטלס",
    appSubtitle: "ניהול שעות עבודה פשוט וחכם",
    loginAdminLabel: "סיסמת מנהל",
    loginEmpLabel: "קוד גישה אישי",
    loginPlaceholder: "הזן קוד...",
    loginAdminBtn: "כניסה למנהל",
    loginEmpBtn: "כניסה למערכת",
    switchAdmin: "כניסת מנהלים",
    switchEmp: "חזרה לכניסת עובדים",
    errorAdminPass: "סיסמת מנהל שגויה",
    errorEmpCode: "קוד עובד לא נמצא במערכת",
    greeting: "שלום",
    reportSubtitle: "דיווח שעות עבודה",
    reportNewShift: "דיווח משמרת חדשה",
    date: "תאריך",
    entry: "כניסה",
    exit: "יציאה",
    saveShift: "שמור משמרת",
    historyTitle: "היסטוריית דיווחים",
    shifts: "משמרות",
    hours: "שעות",
    noShifts: "טרם דווחו משמרות",
    fillAllFields: "נא למלא את כל השדות",
    shiftSaved: "המשמרת נשמרה בהצלחה!",
    adminPanel: "פאנל ניהול",
    exportExcel: "ייצא לאקסל",
    addEmployeeTitle: "הוספת עובד חדש",
    employeeNamePlaceholder: "שם העובד...",
    addBtn: "הוסף",
    employeeList: "רשימת עובדים",
    currentMonthTotal: "סך שעות לחודש הנוכחי",
    noEmployees: "אין עובדים במערכת כרגע.",
    viewBtn: "צפייה",
    accessCode: "קוד גישה",
    shiftHistory: "היסטוריית משמרות",
    monthlyTotal: 'סה"כ חודשי',
    totalDaily: 'סה"כ',
    backToList: "חזרה לרשימת העובדים",
    employeeAdded: "עובד נוסף בהצלחה! קוד הגישה הוא:",
    errorAdding: "שגיאה בהוספת עובד",
    exportTitle: "ייצוא דוח שעות לאקסל",
    chooseMonth: "בחר את החודש עבורו תרצה להפיק את הדוח:",
    cancel: "ביטול",
    downloadXlsx: "הורד קובץ XLSX",
    unknownEmployee: "עובד לא ידוע",
    totalMonthlyReport: 'סה"כ חודשי',
    empNameHeader: "שם העובד",
    confirmDelete: "האם למחוק את",
    editShift: "עריכת משמרת",
    update: "עדכן",
    shiftUpdated: "המשמרת עודכנה בהצלחה",
    errorUpdating: "שגיאה בעדכון המשמרת",
    actions: "פעולות",
  },
  en: {
    appTitle: "Atlas Attendance Clock",
    appSubtitle: "Simple and smart work hour management",
    loginAdminLabel: "Admin Password",
    loginEmpLabel: "Personal Access Code",
    loginPlaceholder: "Enter code...",
    loginAdminBtn: "Admin Login",
    loginEmpBtn: "System Login",
    switchAdmin: "Admin Access",
    switchEmp: "Back to Employee Login",
    errorAdminPass: "Wrong admin password",
    errorEmpCode: "Employee code not found",
    greeting: "Hello",
    reportSubtitle: "Work Hours Reporting",
    reportNewShift: "Log New Shift",
    date: "Date",
    entry: "Start Time",
    exit: "End Time",
    saveShift: "Save Shift",
    historyTitle: "Report History",
    shifts: "shifts",
    hours: "hours",
    noShifts: "No shifts reported yet",
    fillAllFields: "Please fill all fields",
    shiftSaved: "Shift saved successfully!",
    adminPanel: "Admin Panel",
    exportExcel: "Export to Excel",
    addEmployeeTitle: "Add New Employee",
    employeeNamePlaceholder: "Employee Name...",
    addBtn: "Add",
    employeeList: "Employee List",
    currentMonthTotal: "Total Hours (Current Month)",
    noEmployees: "No employees in the system.",
    viewBtn: "View",
    accessCode: "Access Code",
    shiftHistory: "Shift History",
    monthlyTotal: "Monthly Total",
    totalDaily: "Total",
    backToList: "Back to Employee List",
    employeeAdded: "Employee added! Access code is:",
    errorAdding: "Error adding employee",
    exportTitle: "Export Hours Report",
    chooseMonth: "Select month for report:",
    cancel: "Cancel",
    downloadXlsx: "Download XLSX",
    unknownEmployee: "Unknown Employee",
    totalMonthlyReport: "Monthly Total",
    empNameHeader: "Employee Name",
    confirmDelete: "Delete employee",
    editShift: "Edit Shift",
    update: "Update",
    shiftUpdated: "Shift updated successfully",
    errorUpdating: "Error updating shift",
    actions: "Actions",
  },
};

// --- Helper Functions ---
const formatMonth = (monthStr, lang) => {
  if (!monthStr) return "";
  const [year, month] = monthStr.split("-");
  const date = new Date(year, parseInt(month) - 1);
  return date.toLocaleDateString(lang === "he" ? "he-IL" : "en-US", {
    year: "numeric",
    month: "long",
  });
};

const formatWeekday = (dateStr, lang) => {
  return new Date(dateStr).toLocaleDateString(
    lang === "he" ? "he-IL" : "en-US",
    { weekday: "long" }
  );
};

// Function to load SheetJS library dynamically
const loadXLSXLibrary = () => {
  return new Promise((resolve, reject) => {
    if (window.XLSX) {
      resolve(window.XLSX);
      return;
    }
    const script = document.createElement("script");
    script.src =
      "https://cdnjs.cloudflare.com/ajax/libs/xlsx/0.18.5/xlsx.full.min.js";
    script.onload = () => resolve(window.XLSX);
    script.onerror = reject;
    document.body.appendChild(script);
  });
};

const exportToXLSX = async (
  shifts,
  employees,
  monthStr,
  setLoading,
  lang,
  t
) => {
  try {
    setLoading(true);
    const XLSX = await loadXLSXLibrary();

    const relevantShifts = shifts.filter((s) => s.date.startsWith(monthStr));

    const shiftsByEmp = {};
    employees.forEach((e) => {
      shiftsByEmp[e.id] = { name: e.name, shifts: [], total: 0 };
    });

    relevantShifts.forEach((shift) => {
      const empId = shift.employeeId;
      if (!shiftsByEmp[empId]) {
        shiftsByEmp[empId] = {
          name: shift.employeeName || t.unknownEmployee,
          shifts: [],
          total: 0,
        };
      }
      shiftsByEmp[empId].shifts.push(shift);
      shiftsByEmp[empId].total += parseFloat(shift.totalHours);
    });

    const wsData = [[t.empNameHeader, t.date, t.entry, t.exit, t.totalDaily]];

    Object.values(shiftsByEmp).forEach((empData) => {
      if (empData.shifts.length === 0) return;

      empData.shifts.sort((a, b) => new Date(a.date) - new Date(b.date));

      empData.shifts.forEach((shift) => {
        wsData.push([
          empData.name,
          shift.date,
          shift.startTime,
          shift.endTime,
          parseFloat(shift.totalHours),
        ]);
      });

      wsData.push([
        `${t.totalMonthlyReport} - ${empData.name}`,
        "",
        "",
        "",
        empData.total,
      ]);

      wsData.push([]);
    });

    const wb = XLSX.utils.book_new();
    const ws = XLSX.utils.aoa_to_sheet(wsData);

    ws["!cols"] = [
      { wch: 20 },
      { wch: 15 },
      { wch: 10 },
      { wch: 10 },
      { wch: 12 },
    ];

    // RTL for Hebrew, LTR for English
    if (lang === "he") {
      if (!ws["!views"]) ws["!views"] = [];
      ws["!views"].push({ rightToLeft: true });
    }

    XLSX.utils.book_append_sheet(wb, ws, `Report ${monthStr}`);
    XLSX.writeFile(wb, `Atlas_Report_${monthStr}.xlsx`);
  } catch (error) {
    console.error("Export failed:", error);
    alert(
      lang === "he" ? "שגיאה ביצירת קובץ אקסל" : "Error generating Excel file"
    );
  } finally {
    setLoading(false);
  }
};

// --- Components ---

// Shared Edit Modal
const EditShiftModal = ({ isOpen, onClose, onSave, shift, lang, t }) => {
  const [date, setDate] = useState("");
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const isRTL = lang === "he";

  useEffect(() => {
    if (shift && isOpen) {
      setDate(shift.date);
      setStartTime(shift.startTime);
      setEndTime(shift.endTime);
    }
  }, [shift, isOpen]);

  const handleSave = () => {
    if (!date || !startTime || !endTime) {
      alert(t.fillAllFields);
      return;
    }

    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    let duration = (end - start) / 1000 / 60 / 60; // in hours

    if (duration < 0) duration += 24;

    onSave(shift.id, {
      date,
      startTime,
      endTime,
      totalHours: duration.toFixed(2),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
            <Edit2 className="text-blue-600" size={20} />
            {t.editShift}
          </h3>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600"
          >
            <X size={20} />
          </button>
        </div>

        <div className="space-y-4">
          <div>
            <label className="block text-sm text-slate-600 mb-1">
              {t.date}
            </label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                {t.entry}
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                {t.exit}
              </label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <button
            onClick={handleSave}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 mt-4 flex justify-center items-center gap-2"
          >
            <Save size={18} />
            {t.update}
          </button>
        </div>
      </div>
    </div>
  );
};

// 1. Login / Landing Screen
const LoginScreen = ({ employees, onLogin, onAdminLogin, lang, setLang }) => {
  const [accessCode, setAccessCode] = useState("");
  const [isAdminMode, setIsAdminMode] = useState(false);
  const t = translations[lang];
  const isRTL = lang === "he";

  const handleLogin = () => {
    if (isAdminMode) {
      if (accessCode === "admin123") {
        onAdminLogin();
      } else {
        alert(t.errorAdminPass);
      }
    } else {
      const employee = employees.find((e) => e.code === accessCode);
      if (employee) {
        onLogin(employee);
      } else {
        alert(t.errorEmpCode);
      }
    }
  };

  const toggleLang = () => {
    setLang((prev) => (prev === "he" ? "en" : "he"));
  };

  return (
    <div
      className="flex flex-col items-center justify-center min-h-screen bg-slate-100 p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="bg-white p-8 rounded-2xl shadow-xl w-full max-w-md relative">
        <div className="flex justify-center mb-6">
          <div className="bg-blue-600 p-4 rounded-full">
            <Clock className="w-10 h-10 text-white" />
          </div>
        </div>
        <h1 className="text-3xl font-bold text-center text-slate-800 mb-2">
          {t.appTitle}
        </h1>
        <p className="text-center text-slate-500 mb-8">{t.appSubtitle}</p>

        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">
              {isAdminMode ? t.loginAdminLabel : t.loginEmpLabel}
            </label>
            <input
              type={isAdminMode ? "password" : "text"}
              value={accessCode}
              onChange={(e) => setAccessCode(e.target.value)}
              className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none text-lg text-center tracking-widest"
              placeholder={isAdminMode ? "******" : t.loginPlaceholder}
            />
          </div>

          <button
            onClick={handleLogin}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-all shadow-md active:scale-95"
          >
            {isAdminMode ? t.loginAdminBtn : t.loginEmpBtn}
          </button>

          <div className="mt-8 flex items-center justify-between">
            <button
              onClick={toggleLang}
              className="flex items-center gap-2 text-slate-500 hover:text-blue-600 transition-colors"
            >
              <Globe size={18} />
              <span className="font-bold text-sm">
                {lang === "he" ? "En" : "עב"}
              </span>
            </button>

            <button
              onClick={() => {
                setIsAdminMode(!isAdminMode);
                setAccessCode("");
              }}
              className="text-sm text-slate-500 hover:text-blue-600 underline transition-colors"
            >
              {isAdminMode ? t.switchEmp : t.switchAdmin}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// 2. Admin - Sub Component: Export Modal
const ExportModal = ({ isOpen, onClose, onExport, isLoading, lang }) => {
  const [selectedMonth, setSelectedMonth] = useState(
    new Date().toISOString().slice(0, 7)
  );
  const t = translations[lang];
  const isRTL = lang === "he";

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      dir={isRTL ? "rtl" : "ltr"}
    >
      <div className="bg-white rounded-xl shadow-2xl p-6 w-full max-w-sm">
        <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
          <FileSpreadsheet className="text-green-600" />
          {t.exportTitle}
        </h3>
        <p className="text-sm text-slate-600 mb-4">{t.chooseMonth}</p>

        <input
          type="month"
          value={selectedMonth}
          onChange={(e) => setSelectedMonth(e.target.value)}
          className="w-full p-3 border border-slate-300 rounded-lg mb-6 outline-none focus:ring-2 focus:ring-green-500"
        />

        <div className="flex gap-3">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="flex-1 py-2 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50"
          >
            {t.cancel}
          </button>
          <button
            onClick={() => onExport(selectedMonth)}
            disabled={isLoading}
            className="flex-1 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-bold flex justify-center items-center gap-2 disabled:opacity-70"
          >
            {isLoading ? (
              <Loader2 className="animate-spin" size={20} />
            ) : (
              t.downloadXlsx
            )}
          </button>
        </div>
      </div>
    </div>
  );
};

// 2. Admin - Sub Component: Employee Detail View
const AdminEmployeeDetail = ({
  employee,
  shifts,
  onBack,
  onUpdateShift,
  lang,
}) => {
  const [expandedMonths, setExpandedMonths] = useState({});
  const [editingShift, setEditingShift] = useState(null);
  const t = translations[lang];

  // Filter shifts for this employee
  const empShifts = useMemo(() => {
    return shifts
      .filter((s) => s.employeeId === employee.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date));
  }, [shifts, employee.id]);

  // Group by month
  const shiftsByMonth = useMemo(() => {
    const groups = {};
    empShifts.forEach((shift) => {
      const monthKey = shift.date.slice(0, 7);
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(shift);
    });
    return groups;
  }, [empShifts]);

  const toggleMonth = (month) => {
    setExpandedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
  };

  return (
    <div className="animate-fade-in">
      <EditShiftModal
        isOpen={!!editingShift}
        onClose={() => setEditingShift(null)}
        onSave={onUpdateShift}
        shift={editingShift}
        lang={lang}
        t={t}
      />

      <button
        onClick={onBack}
        className="mb-4 flex items-center text-slate-600 hover:text-blue-600 transition-colors font-medium"
      >
        {lang === "he" ? (
          <ArrowRight size={20} className="ml-1" />
        ) : (
          <ArrowRight size={20} className="mr-1 rotate-180" />
        )}
        {t.backToList}
      </button>

      <div className="bg-white rounded-xl shadow-sm p-6 border border-slate-200 mb-6">
        <h2 className="text-2xl font-bold text-slate-800">{employee.name}</h2>
        <p className="text-slate-500 font-mono">
          {t.accessCode}: {employee.code}
        </p>
      </div>

      <div className="space-y-4">
        <h3 className="text-lg font-bold text-slate-700">{t.shiftHistory}</h3>
        {Object.keys(shiftsByMonth).length === 0 ? (
          <div className="bg-white p-8 rounded-xl text-center text-slate-400 border border-dashed border-slate-300">
            {t.noShifts}
          </div>
        ) : (
          Object.keys(shiftsByMonth)
            .sort()
            .reverse()
            .map((monthKey) => {
              const monthShifts = shiftsByMonth[monthKey];
              const totalHours = monthShifts
                .reduce((acc, s) => acc + parseFloat(s.totalHours), 0)
                .toFixed(2);
              const isOpen = expandedMonths[monthKey];

              return (
                <div
                  key={monthKey}
                  className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                >
                  <button
                    onClick={() => toggleMonth(monthKey)}
                    className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-slate-800 text-lg">
                        {formatMonth(monthKey, lang)}
                      </span>
                      <span className="text-sm text-slate-500 bg-white px-2 py-1 rounded border border-slate-200">
                        {monthShifts.length} {t.shifts}
                      </span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="text-left rtl:text-right">
                        <span className="block text-xs text-slate-400">
                          {t.monthlyTotal}
                        </span>
                        <span className="text-lg font-bold text-blue-600">
                          {totalHours}
                        </span>
                      </div>
                      {isOpen ? (
                        <ChevronUp size={20} className="text-slate-400" />
                      ) : (
                        <ChevronDown size={20} className="text-slate-400" />
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="border-t border-slate-100">
                      <table className="w-full text-sm text-right rtl:text-right ltr:text-left">
                        <thead className="bg-slate-50 text-slate-500">
                          <tr>
                            <th className="p-3 font-medium">{t.date}</th>
                            <th className="p-3 font-medium">{t.entry}</th>
                            <th className="p-3 font-medium">{t.exit}</th>
                            <th className="p-3 font-medium">{t.totalDaily}</th>
                            <th className="p-3 font-medium">{t.actions}</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                          {monthShifts.map((shift, idx) => (
                            <tr key={idx} className="hover:bg-slate-50 group">
                              <td className="p-3 text-slate-800 font-medium">
                                {new Date(shift.date)
                                  .getDate()
                                  .toString()
                                  .padStart(2, "0")}
                                /{new Date(shift.date).getMonth() + 1}
                              </td>
                              <td className="p-3 text-slate-600">
                                {shift.startTime}
                              </td>
                              <td className="p-3 text-slate-600">
                                {shift.endTime}
                              </td>
                              <td className="p-3 font-bold text-blue-600">
                                {shift.totalHours}
                              </td>
                              <td className="p-3">
                                <button
                                  onClick={() => setEditingShift(shift)}
                                  className="text-slate-400 hover:text-blue-600 transition-colors p-1 rounded hover:bg-blue-50"
                                  title={t.editShift}
                                >
                                  <Edit2 size={16} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              );
            })
        )}
      </div>
    </div>
  );
};

// 2. Admin Dashboard (Main)
const AdminDashboard = ({
  employees,
  shifts,
  onLogout,
  onAddEmployee,
  onDeleteEmployee,
  onUpdateShift,
  lang,
}) => {
  const [newEmpName, setNewEmpName] = useState("");
  const [viewingEmployeeId, setViewingEmployeeId] = useState(null);
  const [isExportModalOpen, setIsExportModalOpen] = useState(false);
  const [isExportLoading, setIsExportLoading] = useState(false);
  const t = translations[lang];
  const isRTL = lang === "he";

  // If viewing a specific employee, find their object
  const viewingEmployee = viewingEmployeeId
    ? employees.find((e) => e.id === viewingEmployeeId)
    : null;

  const calculateMonthlyHours = (employeeId) => {
    const currentMonth = new Date().toISOString().slice(0, 7);
    const employeeShifts = shifts.filter(
      (s) => s.employeeId === employeeId && s.date.startsWith(currentMonth)
    );
    const total = employeeShifts.reduce(
      (acc, curr) => acc + (parseFloat(curr.totalHours) || 0),
      0
    );
    return total.toFixed(2);
  };

  const handleAdd = () => {
    if (!newEmpName.trim()) return;
    onAddEmployee(newEmpName);
    setNewEmpName("");
  };

  const handleExport = async (monthStr) => {
    await exportToXLSX(
      shifts,
      employees,
      monthStr,
      setIsExportLoading,
      lang,
      t
    );
    if (!isExportLoading) {
      // if not blocked by error
      setIsExportModalOpen(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-20" dir={isRTL ? "rtl" : "ltr"}>
      {/* Export Modal */}
      <ExportModal
        isOpen={isExportModalOpen}
        isLoading={isExportLoading}
        onClose={() => setIsExportModalOpen(false)}
        onExport={handleExport}
        lang={lang}
      />

      <header className="bg-slate-800 text-white p-4 shadow-md sticky top-0 z-10">
        <div className="flex justify-between items-center max-w-4xl mx-auto">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Briefcase size={20} />
            {t.adminPanel}
          </h2>
          <div className="flex items-center gap-3">
            {!viewingEmployeeId && (
              <button
                onClick={() => setIsExportModalOpen(true)}
                className="bg-green-600 hover:bg-green-700 text-white px-3 py-1.5 rounded-lg text-sm font-medium flex items-center gap-2 transition-colors"
              >
                <Download size={16} />
                <span className="hidden sm:inline">{t.exportExcel}</span>
              </button>
            )}
            <button
              onClick={onLogout}
              className="text-slate-300 hover:text-white p-2"
            >
              <LogOut size={20} />
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-4 space-y-6">
        {viewingEmployeeId && viewingEmployee ? (
          // --- Detail View ---
          <AdminEmployeeDetail
            employee={viewingEmployee}
            shifts={shifts}
            onBack={() => setViewingEmployeeId(null)}
            onUpdateShift={onUpdateShift}
            lang={lang}
          />
        ) : (
          // --- List View ---
          <>
            {/* Add Employee Section */}
            <section className="bg-white rounded-xl shadow-sm p-6 border border-slate-200">
              <h3 className="text-lg font-semibold text-slate-800 mb-4 flex items-center gap-2">
                <UserCheck size={20} className="text-blue-600" />
                {t.addEmployeeTitle}
              </h3>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={newEmpName}
                  onChange={(e) => setNewEmpName(e.target.value)}
                  placeholder={t.employeeNamePlaceholder}
                  className="flex-1 p-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                />
                <button
                  onClick={handleAdd}
                  className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 font-medium"
                >
                  <Plus size={18} />
                  {t.addBtn}
                </button>
              </div>
            </section>

            {/* Employees List */}
            <section className="bg-white rounded-xl shadow-sm overflow-hidden border border-slate-200">
              <div className="p-4 bg-slate-50 border-b border-slate-200 flex justify-between items-center">
                <h3 className="text-lg font-semibold text-slate-800">
                  {t.employeeList}
                </h3>
                <span className="text-sm text-slate-500 hidden sm:inline">
                  {t.currentMonthTotal}
                </span>
              </div>
              <div className="divide-y divide-slate-100">
                {employees.length === 0 ? (
                  <p className="p-8 text-center text-slate-400">
                    {t.noEmployees}
                  </p>
                ) : (
                  employees.map((emp) => (
                    <div
                      key={emp.id}
                      className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors group"
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => setViewingEmployeeId(emp.id)}
                      >
                        <div className="flex items-center gap-2">
                          <p className="font-bold text-slate-800 text-lg group-hover:text-blue-600 transition-colors">
                            {emp.name}
                          </p>
                          <Eye
                            size={16}
                            className="text-slate-300 opacity-0 group-hover:opacity-100 transition-opacity"
                          />
                        </div>
                        <p className="text-sm text-slate-500 font-mono bg-slate-100 inline-block px-2 py-0.5 rounded mt-1">
                          {emp.code}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-left rtl:text-right min-w-[80px]">
                          <span className="text-xl font-bold text-blue-600">
                            {calculateMonthlyHours(emp.id)}
                          </span>
                        </div>

                        <div className="flex items-center gap-2 border-r border-slate-200 pr-4 mr-2 rtl:border-r-0 rtl:border-l rtl:mr-0 rtl:ml-2 rtl:pr-0 rtl:pl-4">
                          <button
                            onClick={() => setViewingEmployeeId(emp.id)}
                            className="bg-white border border-slate-300 text-slate-600 hover:bg-slate-50 hover:text-blue-600 p-2 rounded-lg transition-colors text-sm font-medium"
                          >
                            {t.viewBtn}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              if (
                                window.confirm(
                                  `${t.confirmDelete} ${emp.name}?`
                                )
                              )
                                onDeleteEmployee(emp.id);
                            }}
                            className="text-slate-400 hover:text-red-500 p-2 rounded-full hover:bg-red-50 transition-colors"
                            title="מחק עובד"
                          >
                            <Trash2 size={20} />
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </section>
          </>
        )}
      </main>
    </div>
  );
};

// 3. Employee Dashboard
const EmployeeDashboard = ({
  employee,
  shifts,
  onLogout,
  onLogShift,
  onUpdateShift,
  lang,
}) => {
  const [date, setDate] = useState(new Date().toISOString().slice(0, 10));
  const [startTime, setStartTime] = useState("");
  const [endTime, setEndTime] = useState("");
  const [expandedMonths, setExpandedMonths] = useState({});
  const [editingShift, setEditingShift] = useState(null);
  const t = translations[lang];
  const isRTL = lang === "he";

  // Filter shifts for this employee only
  const myShifts = useMemo(() => {
    return shifts
      .filter((s) => s.employeeId === employee.id)
      .sort((a, b) => new Date(b.date) - new Date(a.date)); // Newest first
  }, [shifts, employee.id]);

  // Group shifts by month
  const shiftsByMonth = useMemo(() => {
    const groups = {};
    myShifts.forEach((shift) => {
      const monthKey = shift.date.slice(0, 7); // YYYY-MM
      if (!groups[monthKey]) groups[monthKey] = [];
      groups[monthKey].push(shift);
    });
    return groups;
  }, [myShifts]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!date || !startTime || !endTime) {
      alert(t.fillAllFields);
      return;
    }

    const start = new Date(`1970-01-01T${startTime}:00`);
    const end = new Date(`1970-01-01T${endTime}:00`);
    let duration = (end - start) / 1000 / 60 / 60; // in hours

    if (duration < 0) duration += 24; // Handle overnight shifts if needed (simple version)

    onLogShift({
      date,
      startTime,
      endTime,
      totalHours: duration.toFixed(2),
    });

    // Reset form partially
    setStartTime("");
    setEndTime("");
    alert(t.shiftSaved);
  };

  const toggleMonth = (month) => {
    setExpandedMonths((prev) => ({ ...prev, [month]: !prev[month] }));
  };

  return (
    <div className="min-h-screen bg-slate-50 pb-10" dir={isRTL ? "rtl" : "ltr"}>
      <EditShiftModal
        isOpen={!!editingShift}
        onClose={() => setEditingShift(null)}
        onSave={onUpdateShift}
        shift={editingShift}
        lang={lang}
        t={t}
      />

      <header className="bg-blue-600 text-white p-6 shadow-lg rounded-b-3xl mb-6">
        <div className="flex justify-between items-start">
          <div>
            <h1 className="text-2xl font-bold">
              {t.greeting}, {employee.name}
            </h1>
            <p className="text-blue-100 opacity-80">{t.reportSubtitle}</p>
          </div>
          <button
            onClick={onLogout}
            className="bg-blue-700 p-2 rounded-lg hover:bg-blue-800 transition-colors"
          >
            <LogOut size={20} />
          </button>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 space-y-6">
        {/* Report Card */}
        <section className="bg-white rounded-2xl shadow-sm p-6 border border-slate-100">
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Clock size={20} className="text-blue-500" />
            {t.reportNewShift}
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-slate-600 mb-1">
                {t.date}
              </label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  {t.entry}
                </label>
                <input
                  type="time"
                  value={startTime}
                  onChange={(e) => setStartTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm text-slate-600 mb-1">
                  {t.exit}
                </label>
                <input
                  type="time"
                  value={endTime}
                  onChange={(e) => setEndTime(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
            <button
              type="submit"
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-md transition-all active:scale-95 mt-2"
            >
              {t.saveShift}
            </button>
          </form>
        </section>

        {/* History Section */}
        <section>
          <h2 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2 px-2">
            <History size={20} className="text-slate-500" />
            {t.historyTitle}
          </h2>

          <div className="space-y-3">
            {Object.keys(shiftsByMonth)
              .sort()
              .reverse()
              .map((monthKey) => {
                const monthShifts = shiftsByMonth[monthKey];
                const totalMonthHours = monthShifts
                  .reduce((acc, s) => acc + parseFloat(s.totalHours), 0)
                  .toFixed(2);
                const isOpen = expandedMonths[monthKey];

                return (
                  <div
                    key={monthKey}
                    className="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden"
                  >
                    <button
                      onClick={() => toggleMonth(monthKey)}
                      className="w-full flex items-center justify-between p-4 bg-slate-50 hover:bg-slate-100 transition-colors"
                    >
                      <div className="flex flex-col items-start">
                        <span className="font-bold text-slate-700">
                          {formatMonth(monthKey, lang)}
                        </span>
                        <span className="text-xs text-slate-500">
                          {monthShifts.length} {t.shifts}
                        </span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-sm font-bold">
                          {totalMonthHours} {t.hours}
                        </span>
                        {isOpen ? (
                          <ChevronUp size={18} className="text-slate-400" />
                        ) : (
                          <ChevronDown size={18} className="text-slate-400" />
                        )}
                      </div>
                    </button>

                    {isOpen && (
                      <div className="divide-y divide-slate-100">
                        {monthShifts.map((shift, idx) => (
                          <div
                            key={idx}
                            className="p-3 flex justify-between items-center text-sm group hover:bg-slate-50"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-slate-100 p-2 rounded-lg text-slate-600 font-mono text-xs">
                                {new Date(shift.date)
                                  .getDate()
                                  .toString()
                                  .padStart(2, "0")}
                              </div>
                              <div>
                                <div className="text-slate-800 font-medium">
                                  {formatWeekday(shift.date, lang)}
                                </div>
                                <div className="text-slate-400 text-xs">
                                  {shift.startTime} - {shift.endTime}
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-3">
                              <div className="font-bold text-slate-700">
                                {shift.totalHours}
                              </div>
                              <button
                                onClick={() => setEditingShift(shift)}
                                className="text-slate-300 hover:text-blue-600 p-1 rounded-full hover:bg-blue-50 transition-colors"
                              >
                                <Edit2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                );
              })}

            {Object.keys(shiftsByMonth).length === 0 && (
              <div className="text-center p-8 text-slate-400 bg-white rounded-xl border border-dashed border-slate-300">
                {t.noShifts}
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

// --- Main App Component ---
export default function App() {
  const [user, setUser] = useState(null);
  const [employees, setEmployees] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [currentView, setCurrentView] = useState("login"); // login, admin, employee
  const [currentUserData, setCurrentUserData] = useState(null);
  const [lang, setLang] = useState("he"); // 'he' or 'en'

  // 1. Initial Auth
  useEffect(() => {
    const initAuth = async () => {
      if (typeof __initial_auth_token !== "undefined" && __initial_auth_token) {
        await signInWithCustomToken(auth, __initial_auth_token);
      } else {
        await signInAnonymously(auth);
      }
    };
    initAuth();

    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
    });
    return () => unsubscribe();
  }, []);

  // 2. Fetch Data (Employees and Shifts)
  useEffect(() => {
    if (!user) return;

    // Fetch Employees
    const empRef = collection(db, "employees");
    const unsubEmp = onSnapshot(
      empRef,
      (snapshot) => {
        const emps = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setEmployees(emps);
      },
      (err) => console.error("Error fetching employees:", err)
    );

    // Fetch All Shifts
    const shiftsRef = collection(db, "shifts");
    const shiftsQuery = query(shiftsRef, orderBy("date", "desc"));

    const unsubShifts = onSnapshot(
      shiftsQuery,
      (snapshot) => {
        const data = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setShifts(data);
      },
      (err) => console.error("Error fetching shifts:", err)
    );

    return () => {
      unsubEmp();
      unsubShifts();
    };
  }, [user]);

  // --- Actions ---

  const handleAddEmployee = async (name) => {
    if (!user) return;
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    try {
      await addDoc(collection(db, "employees"), {
        name,
        code,
        createdAt: serverTimestamp(),
      });
      alert(`${translations[lang].employeeAdded} ${code}`);
    } catch (error) {
      console.error("Error adding employee:", error);
      alert(translations[lang].errorAdding);
    }
  };

  const handleDeleteEmployee = async (id) => {
    if (!user) return;
    try {
      await deleteDoc(doc(db, "employees", id));
    } catch (error) {
      console.error("Error deleting employee:", error);
    }
  };

  const handleLogShift = async (shiftData) => {
    if (!user || !currentUserData) return;
    try {
      await addDoc(collection(db, "shifts"), {
        employeeId: currentUserData.id,
        employeeName: currentUserData.name,
        ...shiftData,
        timestamp: serverTimestamp(),
      });
    } catch (error) {
      console.error("Error logging shift:", error);
      alert(lang === "he" ? "שגיאה בשמירת הנתונים" : "Error saving data");
    }
  };

  const handleUpdateShift = async (shiftId, updatedData) => {
    if (!user) return;
    try {
      const shiftRef = doc(
        db,
        "artifacts",
        appId,
        "public",
        "data",
        "shifts",
        shiftId
      );
      await updateDoc(shiftRef, updatedData);
      alert(translations[lang].shiftUpdated);
    } catch (error) {
      console.error("Error updating shift:", error);
      alert(translations[lang].errorUpdating);
    }
  };

  // --- View Management ---

  const handleAdminLogin = () => {
    setCurrentView("admin");
  };

  const handleEmployeeLogin = (employee) => {
    setCurrentUserData(employee);
    setCurrentView("employee");
  };

  const handleLogout = () => {
    setCurrentView("login");
    setCurrentUserData(null);
  };

  if (!user)
    return (
      <div className="flex items-center justify-center h-screen">
        Loading...
      </div>
    );

  return (
    <div
      className={`font-sans text-slate-900 ${lang === "he" ? "rtl" : "ltr"}`}
    >
      {currentView === "login" && (
        <LoginScreen
          employees={employees}
          onLogin={handleEmployeeLogin}
          onAdminLogin={handleAdminLogin}
          lang={lang}
          setLang={setLang}
        />
      )}

      {currentView === "admin" && (
        <AdminDashboard
          employees={employees}
          shifts={shifts}
          onLogout={handleLogout}
          onAddEmployee={handleAddEmployee}
          onDeleteEmployee={handleDeleteEmployee}
          onUpdateShift={handleUpdateShift}
          lang={lang}
        />
      )}

      {currentView === "employee" && currentUserData && (
        <EmployeeDashboard
          employee={currentUserData}
          shifts={shifts}
          onLogout={handleLogout}
          onLogShift={handleLogShift}
          onUpdateShift={handleUpdateShift}
          lang={lang}
        />
      )}
    </div>
  );
}
