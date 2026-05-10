# Nexus Intel Lab 🛡️

Nexus is a project I built to bridge the gap between AI and traditional threat intelligence. It’s a full-stack tool that takes an IP address, runs it through an intelligence engine, and uses AI to give you a clear "threat score" and a breakdown of why that IP might be dangerous.

### 🧠 How it Works
I wanted to move away from just basic "blocklist" checks. 
* **AI Analysis:** It uses GPT-4o-Mini to look at threat data and characterizations, providing a confidence score instead of just a "yes/no" answer.
* **Smart Middleware:** I built a custom gatekeeper in the backend. It can tell the difference between a public user and an admin, allowing for different access levels.
* **SOC-Style UI:** I used custom CSS animations to create a "radar" effect, giving it the feel of a real Security Operations Center dashboard.

### 🛠️ The Tech Behind It
* **The Core:** Node.js & Express
* **The Intelligence:** OpenAI API & OSINT concepts
* **The Guardrails:** `dotenv` for secret management and custom RBAC (Role-Based Access Control) middleware
* **The Look:** Clean HTML5 and custom CSS3 transitions

### 🔒 Security First
Since this is a security tool, I prioritized a "zero-leak" setup. 
1. **Hidden Secrets:** All API keys are managed through environment variables and strictly ignored by Git.
2. **Access Control:** The `checkAccess` layer validates every single request before it even touches the AI engine.
3. **Audit Trail:** Every scan is logged locally to `history.log` for future review.

---

### 🚀 Getting Started
1. Clone it: `git clone https://github.com/JacobGrubbs/nexus-intel-lab.git`
2. Install: `npm install`
3. Set up your `.env`: Add your `OPENAI_API_KEY` and `ADMIN_API_KEY`.
4. Fire it up: `node server.js`
