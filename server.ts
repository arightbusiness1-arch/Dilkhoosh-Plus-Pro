import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI } from "@google/genai";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "15mb" }));

// Server-Side Gemini Client Initialization
const getGeminiClient = () => {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured in the server environment.");
  }
  return new GoogleGenAI({
    apiKey,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });
};

const SYSTEM_INSTRUCTION = `
You are the intelligent, warm, and highly knowledgeable AI Assistant for "Dilkhoosh Plus" (দিলখুশ প্লাস / Dilkhoosh Enterprise Management Platform).
Your purpose is to answer any question about Dilkhoosh Plus, provide operational guidance, summarize real-time attendance/tasks/directives data, assist managers and admins with decision making, and guide staff members on their daily workflows.

---
### Comprehensive Knowledge Base of Dilkhoosh Plus:
1. **Core Purpose**:
   - Dilkhoosh Plus is a specialized enterprise operations platform built for staff attendance, daily task delegation, official directive broadcasts, central hub activities, and real-time performance analytics.
   - Built with high-speed local persistence and Firebase Firestore cloud synchronization.

2. **User Roles & Strict Permissions**:
   - **Admin (এডমিন / Management)**: Has complete administrative authority. Can create, edit, and delete any task; create & manage official directives; add/edit/deactivate staff profiles; view Admin Dashboard & Telemetry; access Recycle Bin; configure system settings and Admin PIN.
   - **Manager (ম্যানেজার)**: Department supervisor. Can oversee team tasks, view attendance and performance reports, mark attendance, and guide staff. Strictly forbidden from accessing the Admin Dashboard, deleting tasks, or altering system-level configurations.
   - **Staff (স্টাফ)**: Regular employees. Must check-in to start their day. Can view assigned primary & secondary tasks, check off subtasks, update task progress status (In Progress, Attempting, Partial, Complete), submit feedback, read and acknowledge directives, and view the central Hub.

3. **Modules & Features**:
   - **Dashboard (হোম)**: Real-time overview of daily attendance (Present, Late, Absent, Leave, Total Active), Task Completion %, Pinned Directives, and Daily Motivational Quotes (উদ্বুদ্ধকরণ বাণী).
   - **Attendance (হাজিরা)**: Statuses include Present, Late, Leave, Absent, Half-Day. Supports interactive clock-dial time selection, check-in/check-out time tracking, attendance notes, and date hopping.
   - **Tasks (কাজের তালিকা)**: Tasks support Dual Assignment (Primary & Secondary staff), Priority levels (Urgent, High, Normal), Categories (Production, Sales, Cash & Accounts, Logistics, Cleaning & Hygiene, Normal), Subtask checklists, and Statuses (Pending, Progress, Attempting, Partial, Complete, Failed). Admins have full Edit & Delete controls.
   - **Directives (অফিসিয়াল নির্দেশনা)**: High-priority broadcast announcements to All or specific departments/staff with checklists and acknowledgment recording ("বুঝেছি ও মেনে চলব").
   - **Central Hub (দিলখুশ হাব)**: Includes Special Instructions, Daily Reminders, Own Ideas (আইডিয়া ও উদ্ভাবনী প্রস্তাবনা), Emergency SOS & Contacts, Custom Actions, and this AI Assistant.
   - **Staff Directory (স্টাফ তালিকা)**: Complete team profiles with names in Bengali and English, department, shift (সকাল, বিকেল, সাধারণ), phone, role, and Google Account linking.
   - **Reports & PDF Export (রিপোর্ট)**: Detailed daily & monthly attendance summaries, staff task completion rankings, and print-ready PDF reports with Bengali Unicode font rendering.
   - **Data Center & Cloud**: Real-time Firebase Firestore database synchronization, JSON backup export & restore, and Recycle Bin recovery.

4. **Tone & Language**:
   - Always be polite, respectful, and helpful.
   - Default to clear, natural Bengali (বাংলা) unless the user asks in English.
   - Use bullet points, bold highlights, and clean structure for easy reading.
   - When answering questions about current data (e.g., "who is absent today?", "what tasks are pending for Rahim?"), utilize the provided real-time app state context precisely.
`;

// AI Assistant Chat Endpoint
app.post("/api/gemini/chat", async (req, res) => {
  try {
    const { prompt, conversationHistory, appStateContext } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "A valid prompt string is required." });
    }

    const ai = getGeminiClient();

    // Construct contextual payload
    let contextPrompt = prompt;
    if (appStateContext) {
      const summaryState = {
        selectedDate: appStateContext.selectedDate,
        userRole: appStateContext.role,
        currentUserId: appStateContext.currentUserId,
        staffSummary: appStateContext.staffList?.map((s: any) => ({
          id: s.id,
          name: s.name,
          role: s.role,
          department: s.department,
          isActive: s.isActive
        })),
        attendanceToday: appStateContext.attendanceRecords?.filter((r: any) => r.date === appStateContext.selectedDate),
        tasksSummary: appStateContext.tasks?.map((t: any) => ({
          id: t.id,
          title: t.title,
          status: t.status,
          priority: t.priority,
          category: t.category,
          assignedStaffId: t.assignedStaffId,
          assignedStaffId2: t.assignedStaffId2,
          dueDate: t.dueDate,
          subtasksCount: t.subtasks?.length || 0,
          subtasksCompleted: t.subtasks?.filter((st: any) => st.completed).length || 0
        })),
        directivesSummary: appStateContext.directives?.map((d: any) => ({
          id: d.id,
          title: d.title,
          priority: d.priority,
          targetDepartment: d.targetDepartment,
          isPinned: d.isPinned,
          acknowledgedCount: d.acknowledgedStaffIds?.length || 0
        })),
        hubRemindersCount: appStateContext.hubData?.reminders?.length || 0,
        hubEmergenciesCount: appStateContext.hubData?.emergencies?.length || 0,
      };

      contextPrompt = `
[CURRENT REAL-TIME APP STATE CONTEXT]:
${JSON.stringify(summaryState, null, 2)}

[USER'S QUERY]:
${prompt}
`;
    }

    // Build contents for multi-turn chat if history exists
    const contents: any[] = [];
    if (Array.isArray(conversationHistory) && conversationHistory.length > 0) {
      for (const msg of conversationHistory) {
        contents.push({
          role: msg.role === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text || msg.content }]
        });
      }
    }
    contents.push({
      role: 'user',
      parts: [{ text: contextPrompt }]
    });

    let replyText = "";

    if (process.env.GEMINI_API_KEY) {
      try {
        const ai = getGeminiClient();
        const response = await ai.models.generateContent({
          model: "gemini-2.5-flash",
          contents,
          config: {
            systemInstruction: SYSTEM_INSTRUCTION,
            temperature: 0.7,
          }
        });
        replyText = response.text || "";
      } catch (geminiErr: any) {
        console.warn("Gemini API call failed, falling back to contextual generator:", geminiErr?.message);
      }
    }

    // Contextual fallback response generator if Gemini API key not set or quota reached
    if (!replyText) {
      const lowerPrompt = prompt.toLowerCase();
      const isBn = true;
      const todayRecords = appStateContext?.attendanceRecords?.filter((r: any) => r.date === appStateContext?.selectedDate) || [];
      const staffList = appStateContext?.staffList || [];
      const tasks = appStateContext?.tasks || [];
      const directives = appStateContext?.directives || [];

      if (lowerPrompt.includes("হাজিরা") || lowerPrompt.includes("উপস্থিত") || lowerPrompt.includes("অনুপস্থিত") || lowerPrompt.includes("attendance")) {
        const presentCount = todayRecords.filter((r: any) => r.status === 'present').length;
        const lateCount = todayRecords.filter((r: any) => r.status === 'late').length;
        const leaveCount = todayRecords.filter((r: any) => r.status === 'leave').length;
        const absentCount = todayRecords.filter((r: any) => r.status === 'absent').length;
        const unmarkedCount = Math.max(0, staffList.filter((s: any) => s.isActive).length - todayRecords.length);

        replyText = `📊 **আজকের (${appStateContext?.selectedDate || 'আজ'}) হাজিরা বিবরণী:**\n\n` +
          `• মোট সক্রিয় স্টাফ: **${staffList.filter((s: any) => s.isActive).length} জন**\n` +
          `• উপস্থিত (Present): **${presentCount} জন** ✅\n` +
          `• দেরিতে উপস্থিত (Late): **${lateCount} জন** ⏰\n` +
          `• ছুটিতে (Leave): **${leaveCount} জন** 🏖️\n` +
          `• অনুপস্থিত (Absent): **${absentCount} জন** ❌\n` +
          (unmarkedCount > 0 ? `• এখনো হাজিরা দেওয়া হয়নি: **${unmarkedCount} জন** ⏳\n\n` : `\n`) +
          `হাজিরা ট্যাবে গিয়ে আরও বিস্তারিত ও সময় ট্র্যাক করতে পারেন।`;
      } else if (lowerPrompt.includes("টাস্ক") || lowerPrompt.includes("কাজ") || lowerPrompt.includes("task")) {
        const pendingTasks = tasks.filter((t: any) => t.status !== 'complete');
        const completedTasks = tasks.filter((t: any) => t.status === 'complete');
        const urgentTasks = pendingTasks.filter((t: any) => t.priority === 'urgent');

        replyText = `📋 **কাজের বর্তমান পরিসংখ্যান:**\n\n` +
          `• মোট সক্রিয় টাস্ক: **${tasks.length} টি**\n` +
          `• সম্পন্ন হয়েছে: **${completedTasks.length} টি** ✅\n` +
          `• প্রক্রিয়াধীন/বাকি: **${pendingTasks.length} টি** ⏳\n` +
          `• অতীব জরুরী (Urgent): **${urgentTasks.length} টি** 🚨\n\n` +
          (urgentTasks.length > 0 ? `**জরুরী টাস্ক তালিকা:**\n` + urgentTasks.map((t: any) => `- ${t.title}`).join('\n') : `সব কাজ সময়মতো সম্পন্ন করতে সংশ্লিষ্ট স্টাফদের অবহিত করুন।`);
      } else if (lowerPrompt.includes("ম্যানেজার") || lowerPrompt.includes("manager") || lowerPrompt.includes("এডমিন") || lowerPrompt.includes("admin") || lowerPrompt.includes("রোল") || lowerPrompt.includes("অনুমতি")) {
        replyText = `🛡️ **দিলখুশ প্লাস রোল ও পারমিশন গাইড:**\n\n` +
          `1. **এডমিন (Admin - ম্যানেজমেন্ট)**: সবকিছুর পূর্ণ কর্তৃত্ব রয়েছে। টাস্ক এডিট/ডিলিট, স্টাফ যুক্ত ও পরিচালনা, অফিশিয়াল নির্দেশনা তৈরি, রিসাইকেল বিন এবং ডাটা রিস্টোর করার ক্ষমতা রয়েছে।\n` +
          `2. **ম্যানেজার (Manager)**: শুধুমাত্র ডিপার্টমেন্ট তত্ত্বাবধান ও হাজিরা দেখতে পারে। ম্যানেজার কোনো টাস্ক ডিলিট বা এডমিন ড্যাশবোর্ড নিয়ন্ত্রণ করতে পারবে না।\n` +
          `3. **স্টাফ (Staff)**: নিজের এসাইনকৃত কাজ দেখা, সাবটাস্ক সম্পন্ন করা ও হাজিরা দেওয়া।`;
      } else if (lowerPrompt.includes("নির্দেশনা") || lowerPrompt.includes("directive")) {
        replyText = `📢 **বর্তমান অফিসিয়াল নির্দেশনা:**\n\n` +
          `• সক্রিয় নির্দেশনা সংখ্যা: **${directives.length} টি**\n` +
          directives.slice(0, 3).map((d: any, idx: number) => `${idx + 1}. **${d.title}** (${d.priority === 'urgent' ? 'জরুরী' : 'সাধারণ'})`).join('\n') +
          `\n\nনির্দেশনা ট্যাবে গিয়ে সকল স্টাফদের স্বীকৃতি (Acknowledgment) পর্যবেক্ষণ করতে পারেন।`;
      } else {
        replyText = `🤖 **দিলখুশ প্লাস এআই সহকারী:**\n\n` +
          `আমি দিলখুশ প্লাস প্ল্যাটফর্মের সমস্ত মডিউল (হাজিরা, টাস্ক, স্টাফ ডিরেক্টরি, হাব ও অফিসিয়াল নির্দেশনা) সম্পর্কে অবগত।\n\n` +
          `আপনি যেকোনো তথ্য জানতে চাইতে পারেন, যেমন:\n` +
          `• *আজকের হাজিরা ও অনুপস্থিতির তালিকা কী?*\n` +
          `• *জরুরী কী কী কাজ বাকি আছে?*\n` +
          `• *ম্যানেজার ও এডমিনের দায়িত্ব কী কী?*\n` +
          `• *স্টাফদের কাজের পারফরম্যান্স কেমন?*`;
      }
    }

    res.json({ reply: replyText });
  } catch (error: any) {
    console.error("Gemini API Error:", error);
    res.status(500).json({ 
      error: error?.message || "Internal server error during AI processing.",
      reply: "এআই প্রসেসিংয়ের সময় একটি সমস্যা হয়েছে। অনুগ্রহ করে আপনার ইন্টারনেট সংযোগ বা এপিআই কী যাচাই করুন।"
    });
  }
});

// Health check endpoint
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", app: "Dilkhoosh Plus", timestamp: new Date().toISOString() });
});

// Start Server & Integrate Vite Middleware
async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Dilkhoosh Plus Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
