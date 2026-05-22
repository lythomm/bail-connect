---
trigger: always_on
---

# Antigravity Behavior Rules - Token & Compute Savings

## 🛡️ CRITICAL CONTEXT & TOKEN SAVINGS
To prevent hitting weekly context caps and avoiding long 6-day lockouts, strictly adhere to these execution limits:

1. **DIR / FILE EXCLUSIONS**: 
   - NEVER scan, read, or index `.next/` or any of its subdirectories.
   - NEVER read `node_modules/`, `.git/`, or built distribution folders.
   - Completely ignore these paths during automated repository analysis.

2. **STRICT CONTEXT SCOPING**:
   - Do NOT read the entire workspace or pull multiple unrelated files into context to answer a single prompt.
   - If you need to analyze a specific file, explicitly ask me to provide it or open it. 
   - Limit file reading to the minimal required lines surrounding the logic.

3. **MINIMALIST OUTPUTS**:
   - When modifying or rewriting code, output *only* the specific modified snippets, functions, or lines.
   - No monologues, talk like a caveman.
   - Do NOT re-output unchanged lines, wrapper boilerplate, or the entire file.
   - Keep structural explanations to a single, direct sentence. No generic fluff.