# Genesis Integration Guide: AI Agent Prompt Tuning Tool

**For: Genesis Repository Integration**

## 🎯 Objective

Embed the AI Agent Prompt Tuning Tool into Genesis boilerplate code so that every new project automatically includes prompt optimization capabilities.

## 📦 Files to Copy to Genesis

### Core Tool Files (Copy to `tools/prompt-tuning/`)
```
tools/prompt-tuning/
├── prompt_tuning_tool.py           # Main entry point
├── requirements-prompt-tuning.txt  # Python dependencies
├── .env.example                    # API key template
├── AI_AGENT_AUTONOMOUS_GUIDE.md   # AI agent execution guide
└── scripts/
    ├── __init__.py
    ├── prompt_tuning_config.py     # Configuration management
    ├── llm_client.py               # LLM client with AI mock mode
    ├── prompt_simulator.py         # Simulation engine
    ├── quality_evaluator.py        # Quality scoring system
    ├── evolutionary_tuner.py       # Evolution engine
    └── prompt_tuning_cli.py        # CLI interface
```

### Documentation Files (Copy to `docs/`)
```
docs/
├── PROMPT_TUNING_TOOL_README.md   # Complete user documentation
└── AI_AGENT_AUTONOMOUS_GUIDE.md   # AI agent execution guide
```

## 🔧 Genesis Bootstrapping Integration

### 1. Update Genesis Template Structure

Add to Genesis project template:
```
{project-name}/
├── prompts/                        # LLM prompt templates (NEW)
│   ├── phase1.md                  # Initial draft prompt
│   ├── phase2.md                  # Adversarial review prompt
│   └── phase3.md                  # Synthesis prompt
├── tools/
│   └── prompt-tuning/             # Prompt tuning tool (NEW)
└── .env.example                   # Include GENESIS_TOOL_URL
```

### 2. Environment Variable Configuration

Update `.env.example` template to include:
```bash
# AI Agent Prompt Tuning Tool - API Keys (Optional - tool runs in mock mode without these)
ANTHROPIC_API_KEY=your_anthropic_api_key_here
GOOGLE_API_KEY=your_google_api_key_here
OPENAI_API_KEY=your_openai_api_key_here

# Attribution URL (automatically set during Genesis bootstrapping)
GENESIS_TOOL_URL=https://github.com/bordenet/genesis/tree/main/tools/prompt-tuning
```

### 3. Package.json Scripts (for Node.js projects)

Add to `package.json` scripts section:
```json
{
  "scripts": {
    "prompt-tuning:init": "python tools/prompt-tuning/prompt_tuning_tool.py init $(basename $(pwd))",
    "prompt-tuning:evolve": "python tools/prompt-tuning/prompt_tuning_tool.py evolve $(basename $(pwd))",
    "prompt-tuning:status": "python tools/prompt-tuning/prompt_tuning_tool.py status $(basename $(pwd))"
  }
}
```

### 4. README.md Template Updates

Add section to project README template:
```markdown
## 🧠 AI Prompt Optimization

This project includes automated LLM prompt tuning capabilities:

```bash
# Initialize prompt tuning
npm run prompt-tuning:init

# Run evolutionary optimization
npm run prompt-tuning:evolve

# Check status
npm run prompt-tuning:status
```

See `docs/PROMPT_TUNING_TOOL_README.md` for complete documentation.
```

## 🤖 AI Agent Integration Points

### 1. Automatic Detection

AI agents should automatically detect prompt tuning opportunities when:
- Repository contains `prompts/` directory
- User requests "improve prompts" or "optimize LLM workflows"
- Quality issues detected in LLM outputs

### 2. Autonomous Execution

AI agents can run the tool autonomously using:
```bash
# Set mock mode for AI agent execution
export AI_AGENT_MOCK_MODE=true

# Run evolutionary tuning
python tools/prompt-tuning/prompt_tuning_tool.py evolve $(basename $(pwd))
```

### 3. Expected Outcomes

AI agents should achieve:
- +12% overall quality improvement
- +24% improvement in initial drafts
- 100% word count compliance (500-700 words)
- Business-focused strategic framing

## 🔄 Genesis Bootstrapping Process

### Step 1: Copy Tool Files
```bash
# In Genesis repository
cp -r /path/to/one-pager/scripts tools/prompt-tuning/scripts/
cp /path/to/one-pager/prompt_tuning_tool.py tools/prompt-tuning/
cp /path/to/one-pager/requirements-prompt-tuning.txt tools/prompt-tuning/
cp /path/to/one-pager/AI_AGENT_AUTONOMOUS_GUIDE.md tools/prompt-tuning/
```

### Step 2: Update Templates
- Add `prompts/` directory to project template
- Update `.env.example` with GENESIS_TOOL_URL
- Add npm scripts to `package.json` template
- Update README.md template with prompt tuning section

### Step 3: Configure Attribution URL
```bash
# Set the actual Genesis tool URL
export GENESIS_TOOL_URL="https://github.com/bordenet/genesis/tree/main/tools/prompt-tuning"
```

### Step 4: Test Integration
```bash
# Create test project from Genesis template
genesis create test-prompt-project

# Verify prompt tuning works
cd test-prompt-project
npm run prompt-tuning:init
npm run prompt-tuning:status
```

## 📋 Validation Checklist

- [ ] Tool files copied to `tools/prompt-tuning/`
- [ ] Documentation copied to `docs/`
- [ ] `.env.example` includes GENESIS_TOOL_URL
- [ ] `package.json` template includes prompt tuning scripts
- [ ] README.md template includes prompt tuning section
- [ ] `prompts/` directory added to project template
- [ ] Attribution URL configured correctly
- [ ] AI agent mock mode working
- [ ] Test project creation successful
- [ ] Prompt tuning commands working in test project

## 🎯 Success Metrics

After Genesis integration:
- **Every new project** automatically includes prompt optimization
- **AI agents** can autonomously improve prompts in any Genesis project
- **Consistent quality** across all LLM-generated content
- **Scalable methodology** applied to all future tool development

This integration transforms prompt optimization from a manual, project-specific task into an automated capability available in every Genesis-generated project.
