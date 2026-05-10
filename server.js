const fs = require('fs');
const express = require('express');
const { analyzeIP } = require('./intelService.js');
const app = express();
const PORT = 3000;

// Home Route
app.get('/', (req, res) => {
    res.send(`
        <html>
            <head>
                <style>
                    body { 
                        font-family: 'Segoe UI', sans-serif; 
                        background-color: #0f0f0f; 
                        color: white; 
                        display: flex; 
                        flex-direction: column; 
                        align-items: center; 
                        justify-content: center; 
                        min-height: 100vh; 
                        margin: 0; 
                        overflow: hidden; 
                        position: relative; 
                    }

                    .pulse-circles {
                        position: fixed;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        z-index: 0; 
                        width: 100vw;
                        height: 100vh;
                        pointer-events: none;
                    }

                    .circle {
                        position: absolute;
                        border: 1px solid rgba(0, 123, 255, 0.2); 
                        border-radius: 50%;
                        top: 50%;
                        left: 50%;
                        transform: translate(-50%, -50%);
                        width: 500px;  
                        height: 500px;
                        
                        /* 1. Set base opacity to 0 so it doesn't "flash" on refresh */
                        opacity: 0; 
                        
                        /* 2. Changed speed from 12s to 24s (half speed) */
                        animation: pulse 24s infinite ease-out; 
                    }

                    .circle1 { animation-delay: 0s; }
                    .circle2 { animation-delay: 8s; } /* Adjusted delays for the slower speed */
                    .circle3 { animation-delay: 16s; }

                    @keyframes pulse {
                        0% { 
                            transform: translate(-50%, -50%) scale(0.2); 
                            opacity: 0; 
                        }
                        10% { 
                            /* Fades in slowly at the start of the expansion */
                            opacity: 0.3; 
                        }
                        100% { 
                            transform: translate(-50%, -50%) scale(4); 
                            opacity: 0; 
                        }
                    }

                    .container { text-align: center; max-width: 500px; position: relative; z-index: 1; }
                    .shield-icon { font-size: 50px; margin-bottom: 20px; color: #007bff; }
                    h1 { margin: 0; font-weight: 600; letter-spacing: 2px; text-transform: uppercase; }
                    p.subtitle { color: #888; margin-bottom: 30px; font-size: 14px; letter-spacing: 1px; }
                    input { padding: 14px; border-radius: 8px; border: 1px solid #333; background: rgba(26, 26, 26, 0.8); color: white; width: 100%; margin-bottom: 15px; font-size: 16px; box-sizing: border-box; backdrop-filter: blur(5px); }
                    button { padding: 14px; border-radius: 8px; border: none; background-color: #007bff; color: white; font-weight: bold; cursor: pointer; width: 100%; transition: 0.3s; }
                    button:hover { background-color: #0056b3; transform: translateY(-2px); }
                    .tags { display: flex; justify-content: center; gap: 8px; margin-top: 20px; }
                    .tag { background: rgba(34, 34, 34, 0.6); color: #aaa; padding: 5px 12px; border-radius: 20px; font-size: 11px; border: 1px solid #333; }
                    .nav-links { margin-top: 30px; font-size: 13px; }
                    .nav-links a { color: #007bff; text-decoration: none; opacity: 0.8; }
                    .status-box { margin-top: 60px; padding: 12px; border: 1px solid #222; border-radius: 6px; font-size: 11px; color: #555; background: rgba(17, 17, 17, 0.7); display: inline-block; }
                    .status-dot { height: 8px; width: 8px; background-color: #28a745; border-radius: 50%; display: inline-block; margin-right: 5px; }
                </style>
            </head>
            <body>
                <div class="pulse-circles">
                    <div class="circle circle1"></div>
                    <div class="circle circle2"></div>
                    <div class="circle circle3"></div>
                </div>
                <div class="container">
                    <div class="shield-icon">
                        <svg width="60" height="60" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
                    </div>
                    <h1>NEXUS INTEL LAB</h1>
                    <p class="subtitle">Unified Threat Analysis & Reputation Scoring</p>
                    <form action="/check" method="GET">
                        <input type="text" name="ip" placeholder="Target IP Address (e.g. 1.1.1.1)" required autofocus>
                        <button type="submit">Execute Scan</button>
                    </form>
                    <div class="tags">
                        <div class="tag">PROXY/VPN</div>
                        <div class="tag">MALWARE OSINT</div>
                        <div class="tag">GEO-REPUTATION</div>
                    </div>
                    <div class="nav-links">
                        <a href="/history">Access History Logs →</a>
                    </div>
                    <div class="status-box">
                        <span class="status-dot"></span> NODE_SERVER_ACTIVE // ENGINE: GPT-4o-MINI
                    </div>
                </div>
            </body>
        </html>
    `);
});

const checkAccess = (req, res, next) => {
    const userKey = req.headers['x-api-key'] || req.query.key;
    const adminKey = process.env.ADMIN_API_KEY;

    if (userKey === adminKey) {
        req.isProUser = true; // Flag them as a VIP
        next();
    } else {
        // Here is where we would check the "Rate Limit" for free users
        // For now, let's just let them through but log it
        req.isProUser = false;
        next();
    }
};

// Check Route
app.get('/check', checkAccess, async (req, res) => {
    const targetIp = req.query.ip;
    if (!targetIp) return res.status(400).send('<h1>Error: Missing IP</h1>');

    const aiResult = await analyzeIP(targetIp);
    const reportData = { timestamp: new Date().toISOString(), ip: targetIp, analysis: aiResult.analysis, confidence: aiResult.confidence };

    fs.appendFile('history.log', JSON.stringify(reportData) + '\n', (err) => {
        if (err) console.error(err);
    });

    res.send(`
        <html>
            <head>
                <style>
                    body { font-family: 'Segoe UI', sans-serif; background-color: #0f0f0f; color: white; display: flex; justify-content: center; padding-top: 50px; }
                    .card { background-color: #1a1a1a; border-radius: 12px; padding: 30px; box-shadow: 0 4px 15px rgba(0,0,0,0.5); max-width: 600px; border-left: 5px solid #007bff; }
                    h2 { color: #007bff; margin-top: 0; }
                    .label { font-weight: bold; color: #888; text-transform: uppercase; font-size: 12px; }
                    .data { margin-bottom: 20px; font-size: 18px; line-height: 1.6; }
                </style>
            </head>
            <body>
                <div class="card">
                    <h2>Threat Intelligence Report</h2>
                    <p class="label">Analyzed IP</p><p class="data">${targetIp}</p>
                    <p class="label">AI Assessment</p><p class="data">${aiResult.analysis}</p>
                    <p class="label">Confidence Score</p><p class="data">${(aiResult.confidence * 100).toFixed(0)}%</p>
                    <a href="/" style="color: #007bff; text-decoration: none;">← New Scan</a>
                </div>
            </body>
        </html>
    `);
});

// History Route
app.get('/history', (req, res) => {
    fs.readFile('history.log', 'utf8', (err, data) => {
        if (err) return res.send('<h1>No history found!</h1>');
        const logs = data.trim().split('\n').map(line => JSON.parse(line));
        let tableRows = logs.map(log => `<tr><td>${new Date(log.timestamp).toLocaleString()}</td><td>${log.ip}</td><td>${log.analysis}</td></tr>`).join('');
        res.send(`
            <html>
                <head><style>body { font-family: sans-serif; background-color: #0f0f0f; color: white; padding: 40px; } table { width: 100%; border-collapse: collapse; } th, td { padding: 15px; border-bottom: 1px solid #333; } th { background: #007bff; }</style></head>
                <body><h1>Scan History</h1><a href="/" style="color: #007bff;">← Back</a><table>${tableRows}</table></body>
            </html>
        `);
    });
});

app.listen(PORT, () => console.log(`Nexus Intel Lab active on http://localhost:${PORT}`));