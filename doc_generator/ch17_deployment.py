"""
Chapter 17: Production Deployment Configuration & Build Process
"""

def get_chapter_17():
    return """
    <section id="chapter-17" class="page-break">
        <h1>Chapter 17: Production Deployment Configuration & Build Process</h1>

        <h2>17.1 Production Deployment Topology</h2>
        <p>
            SignMate utilizes a decoupled production deployment strategy, matching specific workloads to optimized cloud infrastructure:
        </p>

        <table>
            <thead>
                <tr>
                    <th style="width: 25%;">Subsystem</th>
                    <th style="width: 25%;">Hosting Platform</th>
                    <th style="width: 25%;">Runtime Artifact</th>
                    <th style="width: 25%;">Public Address / Port</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td><strong>Web Frontend Client</strong></td>
                    <td>Vercel Global Edge Network</td>
                    <td>Static HTML5, CSS, ES6 JavaScript bundle (<code>dist/</code>)</td>
                    <td><code>https://signmate-ashy.vercel.app/</code></td>
                </tr>
                <tr>
                    <td><strong>Signaling Bus</strong></td>
                    <td>Google Firebase RTDB</td>
                    <td>Managed WebSocket Cloud Bus</td>
                    <td><code>https://signmate-a73b3-default-rtdb.firebaseio.com/</code></td>
                </tr>
                <tr>
                    <td><strong>User & Room Database</strong></td>
                    <td>Google Cloud Firestore</td>
                    <td>Managed NoSQL Cloud Database</td>
                    <td>Direct Google SDK connection (TLS 443)</td>
                </tr>
                <tr>
                    <td><strong>AI Inference Server</strong></td>
                    <td>Workstation / Cloud VPS (Python)</td>
                    <td>Python 3.12/3.13 ASGI Server (<code>uvicorn</code>)</td>
                    <td><code>http://localhost:8000</code> or Cloud Container</td>
                </tr>
            </tbody>
        </table>

        <h2>17.2 Vercel Continuous Deployment Configuration</h2>
        <p>
            Vercel is linked directly to the project's Git repository. Every code commit triggers an automated CI/CD pipeline:
        </p>
        <ul>
            <li><strong>Framework Preset:</strong> Vite (React + TypeScript)</li>
            <li><strong>Build Command:</strong> <code>npm run build</code> (executes <code>vite build</code>, running Rollup tree-shaking and minification)</li>
            <li><strong>Output Directory:</strong> <code>dist</code></li>
            <li><strong>Node Version:</strong> 20.x / 22.x LTS</li>
            <li><strong>SSL / TLS:</strong> Automatic wildcard certificate provisioning via Let's Encrypt with forced HTTPS redirection.</li>
        </ul>

        <h2>17.3 Production Environment Variables</h2>
        <p>
            Sensitive environment variables are configured in the Vercel dashboard and local <code>.env</code> files:
        </p>

        <pre><code># Firebase Cloud Services Configuration
VITE_FIREBASE_API_KEY=AIzaSyDRvd-Br6GjHDNzVy02FrwCS0VYX8YHv_c
VITE_FIREBASE_AUTH_DOMAIN=signmate-a73b3.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=signmate-a73b3
VITE_FIREBASE_STORAGE_BUCKET=signmate-a73b3.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=220476879234
VITE_FIREBASE_APP_ID=1:220476879234:web:c6751a68537f6b34b25f9b
VITE_FIREBASE_DATABASE_URL=https://signmate-a73b3-default-rtdb.firebaseio.com

# AI Inference Backend URL (Optional Override)
VITE_AI_API_BASE_URL=http://localhost:8000
</code></pre>

        <h2>17.4 Step-by-Step Local Reproduction Guide</h2>
        <p>
            To run and test the complete SignMate stack on a fresh development machine:
        </p>

        <div class="code-title">Terminal: PowerShell / Bash</div>
<pre><code># 1. Clone the project repository
git clone https://github.com/rashhiye/signmate-ai-for-inclusive-communication.git
cd signmate-ai-for-inclusive-communication

# 2. Install Node.js frontend dependencies
npm install

# 3. Start the Vite local development server
npm run dev
# -> Local web app runs at: http://localhost:5173

# 4. In a separate terminal, install Python ML dependencies
pip install fastapi uvicorn tensorflow keras pillow numpy

# 5. Start the FastAPI Deep Learning Inference Microservice
python fastapi_server.py
# -> Model server loads SignMate_stage1_best.keras and listens on: http://localhost:8000

# 6. Verify production build compilation
npm run build
npm run preview
# -> Tests the exact production bundle locally on: http://localhost:4173
</code></pre>
    </section>
    """
