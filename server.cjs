var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// server.ts
var import_express = __toESM(require("express"), 1);
var import_path = __toESM(require("path"), 1);
var import_fs = __toESM(require("fs"), 1);
var import_vite = require("vite");
var import_genai = require("@google/genai");
async function startServer() {
  const app = (0, import_express.default)();
  const PORT = 3e3;
  app.use(import_express.default.json({ limit: "10mb" }));
  const ADMIN_KEY_FILE = import_path.default.join(process.cwd(), ".admin_key.json");
  let adminConfiguredApiKey = process.env.GEMINI_API_KEY || "";
  if (import_fs.default.existsSync(ADMIN_KEY_FILE)) {
    try {
      const data = JSON.parse(import_fs.default.readFileSync(ADMIN_KEY_FILE, "utf-8"));
      if (data && data.apiKey) {
        adminConfiguredApiKey = data.apiKey;
      }
    } catch (err) {
      console.error("Failed to load admin key file:", err);
    }
  }
  app.get("/api/admin/config", (req, res) => {
    return res.json({
      hasCustomKey: Boolean(adminConfiguredApiKey),
      maskedKey: adminConfiguredApiKey ? `${adminConfiguredApiKey.slice(0, 6)}...${adminConfiguredApiKey.slice(-4)}` : ""
    });
  });
  app.post("/api/admin/config", (req, res) => {
    const { apiKey } = req.body;
    if (typeof apiKey === "string") {
      adminConfiguredApiKey = apiKey.trim();
      try {
        import_fs.default.writeFileSync(ADMIN_KEY_FILE, JSON.stringify({ apiKey: adminConfiguredApiKey }));
      } catch (err) {
        console.error("Failed to write admin key file:", err);
      }
      return res.json({ success: true, message: "\u06A9\u0644\u06CC\u062F API \u0628\u0627 \u0645\u0648\u0641\u0642\u06CC\u062A \u062F\u0631 \u0633\u0631\u0648\u0631 \u0630\u062E\u06CC\u0631\u0647 \u0634\u062F \u0648 \u0628\u0631\u0627\u06CC \u062A\u0645\u0627\u0645\u06CC \u06A9\u0627\u0631\u0628\u0631\u0627\u0646 \u0641\u0639\u0627\u0644 \u06AF\u0631\u062F\u06CC\u062F." });
    }
    return res.status(400).json({ error: "\u06A9\u0644\u06CC\u062F API \u0646\u0627\u0645\u0639\u062A\u0628\u0631 \u0627\u0633\u062A." });
  });
  app.post("/api/chat", async (req, res) => {
    try {
      const apiKey = adminConfiguredApiKey || process.env.GEMINI_API_KEY;
      if (!apiKey) {
        return res.status(500).json({
          error: "\u06A9\u0644\u06CC\u062F API \u0647\u0648\u0634 \u0645\u0635\u0646\u0648\u0639\u06CC \u062A\u0648\u0633\u0637 \u0645\u062F\u06CC\u0631 \u0633\u06CC\u0633\u062A\u0645 \u062A\u0646\u0638\u06CC\u0645 \u0646\u0634\u062F\u0647 \u0627\u0633\u062A. \u0644\u0637\u0641\u0627\u064B \u0627\u0632 \u067E\u0646\u0644 \u0627\u062F\u0645\u06CC\u0646 \u06A9\u0644\u06CC\u062F API \u0631\u0627 \u0648\u0627\u0631\u062F \u0646\u0645\u0627\u06CC\u06CC\u062F."
        });
      }
      const { messages, model, systemRole, userDataContext } = req.body;
      if (!messages || !Array.isArray(messages) || messages.length === 0) {
        return res.status(400).json({ error: "\u0627\u0631\u0633\u0627\u0644 \u062A\u0627\u0631\u06CC\u062E\u0686\u0647 \u067E\u06CC\u0627\u0645\u200C\u0647\u0627 \u0627\u0644\u0632\u0627\u0645\u06CC \u0627\u0633\u062A." });
      }
      const selectedModel = model || "gemini-3.6-flash";
      const defaultSystemInstruction = `\u0634\u0645\u0627 \u062F\u0633\u062A\u06CC\u0627\u0631 \u0648 \u0645\u0631\u0628\u06CC \u0647\u0648\u0634\u0645\u0646\u062F \u062A\u0648\u0633\u0639\u0647 \u0641\u0631\u062F\u06CC\u060C \u0645\u062F\u06CC\u0631\u06CC\u062A \u0632\u0645\u0627\u0646 \u0648 \u0628\u0647\u0631\u0647\u200C\u0648\u0631\u06CC \u062F\u0631 \u0628\u0631\u0646\u0627\u0645\u0647 \xABYou Can Do it\xBB \u0647\u0633\u062A\u06CC\u062F.
\u0648\u0638\u06CC\u0641\u0647 \u0634\u0645\u0627 \u0631\u0627\u0647\u0646\u0645\u0627\u06CC\u06CC \u06A9\u0627\u0631\u0628\u0631 \u0628\u0631\u0627\u06CC \u062F\u0633\u062A\u06CC\u0627\u0628\u06CC \u0628\u0647 \u0627\u0647\u062F\u0627\u0641\u060C \u0628\u0647\u0628\u0648\u062F \u0632\u0645\u0627\u0646 \u062A\u0645\u0631\u06A9\u0632\u060C \u0633\u0627\u062E\u062A \u0639\u0627\u062F\u062A\u200C\u0647\u0627\u06CC \u0631\u0648\u0632\u0627\u0646\u0647 \u067E\u0627\u06CC\u062F\u0627\u0631 \u0648 \u0628\u0631\u0646\u0627\u0645\u0647\u200C\u0631\u06CC\u0632\u06CC \u0647\u0648\u0634\u0645\u0646\u062F \u0627\u0633\u062A.
\u067E\u0627\u0633\u062E\u200C\u0647\u0627 \u0631\u0627 \u0635\u0645\u06CC\u0645\u06CC\u060C \u0627\u0646\u06AF\u06CC\u0632\u0634\u06CC\u060C \u062F\u0642\u06CC\u0642 \u0648 \u0628\u0627 \u0641\u0631\u0645\u062A \u0645\u0631\u062A\u0628 \u0627\u0631\u0627\u0626\u0647 \u062F\u0647\u06CC\u062F.
` + (systemRole ? `\u0646\u0642\u0634 \u062A\u062E\u0635\u0635\u06CC \u0641\u0639\u0627\u0644 \u0634\u0645\u0627: ${systemRole}
` : "") + (userDataContext ? `\u0627\u0637\u0644\u0627\u0639\u0627\u062A \u0648 \u0622\u0645\u0627\u0631\u0647\u0627\u06CC \u0641\u0639\u0644\u06CC \u06A9\u0627\u0631\u0628\u0631 \u062F\u0631 \u0628\u0631\u0646\u0627\u0645\u0647:
${userDataContext}
` : "");
      const ai = new import_genai.GoogleGenAI({
        apiKey,
        httpOptions: {
          headers: {
            "User-Agent": "aistudio-build"
          }
        }
      });
      const contents = messages.map((m) => ({
        role: m.role === "user" ? "user" : "model",
        parts: [{ text: m.text }]
      }));
      const response = await ai.models.generateContent({
        model: selectedModel,
        contents,
        config: {
          systemInstruction: defaultSystemInstruction,
          temperature: 0.7
        }
      });
      const replyText = response.text || "\u067E\u0627\u0633\u062E\u06CC \u062F\u0631\u06CC\u0627\u0641\u062A \u0646\u0634\u062F.";
      return res.json({ text: replyText });
    } catch (error) {
      console.error("Gemini API Error:", error);
      return res.status(500).json({
        error: error?.message || "\u062E\u0637\u0627 \u062F\u0631 \u0628\u0631\u0642\u0631\u0627\u0631\u06CC \u0627\u0631\u062A\u0628\u0627\u0637 \u0628\u0627 \u0645\u0631\u0628\u06CC \u0647\u0648\u0634\u0645\u0646\u062F."
      });
    }
  });
  if (process.env.NODE_ENV !== "production") {
    const vite = await (0, import_vite.createServer)({
      server: { middlewareMode: true },
      appType: "spa"
    });
    app.use(vite.middlewares);
  } else {
    const distPath = import_path.default.join(process.cwd(), "dist");
    app.use(import_express.default.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(import_path.default.join(distPath, "index.html"));
    });
  }
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });
}
startServer();
//# sourceMappingURL=server.cjs.map
