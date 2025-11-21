# AI Agent Prompt Tuning Tool

**Automated LLM prompt optimization with evolutionary mutation-based tuning**

This tool implements the successful methodology developed during the one-pager project prompt tuning, providing automated optimization of LLM prompts with keep/discard mutation logic.

## 🎯 What This Tool Does

1. **Simulates LLM workflows** with real API calls to Claude, Gemini, and GPT
2. **Evaluates quality** using 5-point rubric (Clarity, Conciseness, Impact, Feasibility, Completeness)
3. **Applies mutations** based on recommendations (word count enforcement, strategic framing, etc.)
4. **Keeps improvements, discards regressions** using objective scoring
5. **Stops automatically** when targets are met or diminishing returns detected

## 🚀 Quick Start

### 1. Install Dependencies

```bash
pip install -r requirements-prompt-tuning.txt
```

### 2. Set Up API Keys

Copy `.env.example` to `.env` and fill in your API keys:

```bash
cp .env.example .env
# Edit .env with your actual API keys
```

### 3. Initialize Project

```bash
python prompt_tuning_tool.py init my-project
```

This creates:
- `prompt_tuning_results_my-project/` directory
- Sample test cases file
- `.env` template (if needed)

### 4. Customize Test Cases

Edit `prompt_tuning_results_my-project/test_cases_my-project.json`:

```json
{
  "project": "my-project",
  "test_cases": [
    {
      "id": "tc001",
      "name": "High-Stakes Enterprise Project",
      "industry": "Technology",
      "project_type": "System Migration",
      "inputs": {
        "projectName": "Legacy System Migration",
        "problemDescription": "Critical system failing, impacting revenue",
        "businessContext": "Enterprise customer retention at risk"
      }
    }
  ]
}
```

### 5. Run Evolutionary Tuning

```bash
python prompt_tuning_tool.py evolve my-project
```

This will:
- Run baseline simulation
- Apply mutations one by one
- Keep improvements, discard regressions
- Generate comprehensive reports

## 📁 Project Structure

```
your-project/
├── prompts/                    # Original prompts
│   ├── phase1.md              # Initial draft prompt
│   ├── phase2.md              # Adversarial review prompt
│   └── phase3.md              # Synthesis prompt
├── prompt_tuning_results_my-project/
│   ├── test_cases_my-project.json
│   ├── simulation_results_*.json
│   ├── evaluation_report_*.md
│   ├── evolutionary_session.json
│   └── phase*_iter*.md        # Evolved prompts
└── .env                       # API keys
```

## 🔧 Commands

### Initialize New Project
```bash
python prompt_tuning_tool.py init <project_name>
```

### Check Project Status
```bash
python prompt_tuning_tool.py status <project_name>
```

### Run Simulation Only
```bash
python prompt_tuning_tool.py simulate <project_name> [--iteration N]
```

### Run Full Evolutionary Tuning
```bash
python prompt_tuning_tool.py evolve <project_name>
```

## 📊 Understanding Results

### Evolutionary Session Report
- **Baseline Score**: Starting quality score
- **Final Score**: Ending quality score after evolution
- **Total Improvement**: Net improvement achieved
- **Success Rate**: Percentage of mutations that were kept
- **Iterations**: Number of mutations tested

### Quality Scoring (1-5 scale)
- **Clarity**: Structure, readability, specific metrics
- **Conciseness**: Word count within target range (500-700)
- **Impact**: Business framing, strategic positioning, urgency
- **Feasibility**: Timeline, phases, risks, resources
- **Completeness**: Required sections, substantive content

### Mutation Logic
- **KEEP**: New score > baseline score (any improvement)
- **DISCARD**: New score ≤ baseline score (no improvement/regression)

## 🎛️ Configuration

### API Providers
- **Anthropic Claude**: `claude-3-5-sonnet-20241022`
- **Google Gemini**: `gemini-1.5-pro`
- **OpenAI GPT**: `gpt-4` (optional)

### Stopping Criteria
- Target score achieved (≥4.0) with sufficient iterations
- Stretch goal achieved (≥4.5)
- Max iterations reached (20)
- Diminishing returns detected (<0.05 improvement for 3 iterations)

### Customization
Edit `scripts/prompt_tuning_config.py` to modify:
- Scoring criteria and weights
- Word count targets
- Evolution parameters
- LLM model configurations

## 🧪 Testing

```bash
# Test individual components
python -m scripts.prompt_simulator my-project
python -m scripts.evolutionary_tuner my-project

# Test API connections
python -c "from scripts.llm_client import test_llm_connection; from scripts.prompt_tuning_config import DEFAULT_PHASE_CONFIGS; import asyncio; print(asyncio.run(test_llm_connection(DEFAULT_PHASE_CONFIGS['phase1'])))"
```

## 📈 Success Metrics

Based on one-pager project results:
- **Overall improvement**: +12% quality score
- **Phase 1 improvement**: +24% (3.56 → 4.40)
- **Phase 3 improvement**: +14% (4.16 → 4.76)
- **Word count compliance**: 90% → 100%

## 🔄 Applying to New Projects

1. **Copy your prompts** to `prompts/` directory
2. **Create test cases** representing your domain
3. **Run evolutionary tuning** with `evolve` command
4. **Deploy improved prompts** from results directory
5. **Document lessons learned** for next project

## 🛠️ Troubleshooting

### Missing API Keys
```
Error: Missing API keys: phase1: ANTHROPIC_API_KEY
```
**Solution**: Set environment variables or update `.env` file

### No Improvements Found
```
Stopping: All recommendations tested
```
**Solution**: Add more recommendations to `recommendations_*.json` or adjust mutation logic

### Rate Limiting
**Solution**: Add delays between API calls in `llm_client.py`

## 📚 Based On

This tool implements the methodology developed during the one-pager project prompt tuning, documented in:
- `prompt_tuning_results_one-pager/FINAL_REPORT.md`
- `prompt_tuning_results_one-pager/DESIGN_EVOLUTIONARY_PROMPT_TUNING.md`
- `prompt_tuning_results_one-pager/PRD_PRODUCT_REQUIREMENTS_ASSISTANT.md`

The approach achieved significant quality improvements and is now automated for reuse across projects.
