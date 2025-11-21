# One-Pager Template

This template is based on [The One-Pager methodology](https://github.com/bordenet/Engineering_Culture/blob/main/SDLC/The_One-Pager.md).

## Template Structure

| Section | Description |
|---------|-------------|
| **Project/Feature Name** | A clear, descriptive title |
| **Problem Statement** | What specific customer or business problem are you solving? Quantify it if possible |
| **Proposed Solution** | A high-level description of how you will solve the problem. Avoid technical jargon |
| **Key Goals/Benefits** | What are the measurable outcomes? (e.g., "Reduce user onboarding time by 50%") |
| **Scope (and Out-of-Scope)** | What is explicitly included in this effort? Equally important, what is *not* included to prevent scope creep? |
| **Success Metrics** | How will you know you've succeeded? List 2-3 key performance indicators (KPIs) |
| **Key Stakeholders** | Who are the owners, approvers, and key contributors? |
| **Timeline Estimate** | A rough, high-level timeline for major milestones |

## Writing Tips

1. **Be Ruthlessly Concise**: Use bullet points and simple language. If a sentence doesn't add critical value, cut it
2. **Focus on the Why**: Start with the problem. If the "why" isn't compelling, the "what" and "how" don't matter
3. **Use Visuals Sparingly**: A simple diagram or chart can be effective, but don't clutter the page
4. **Collaborate**: Write it with key stakeholders to build early alignment
5. **Quantify**: Use specific numbers, percentages, and timeframes whenever possible
6. **Distinguish Features from Benefits**: Focus on outcomes, not just capabilities

## Common Mistakes to Avoid

### Mistake 1: The Wall of Text
**Problem**: Long, dense paragraphs that are difficult to scan  
**Fix**: Use headings, subheadings, and bullet points

### Mistake 2: The "Everything but the Kitchen Sink"
**Problem**: Trying to cram every detail onto one page  
**Fix**: Be disciplined. If it's not essential, leave it out

### Mistake 3: Vague Goals
**Problem**: Using fuzzy terms like "improve user experience"  
**Fix**: Define success with specific, measurable, time-bound goals

### Mistake 4: Confusing Features with Benefits
**Problem**: Listing what your solution *does* instead of what it *achieves*  
**Fix**: For every feature, ask "So what?" to uncover the real benefit

## Example One-Pager

```markdown
# Mobile App Performance Optimization

## Problem Statement
Our mobile app's slow load times (average 8 seconds) are causing 35% of users to abandon during onboarding. This translates to approximately 50,000 lost users per month and $2M in annual revenue impact.

## Proposed Solution
Implement a three-pronged optimization strategy: (1) lazy-load non-critical assets, (2) compress images using WebP format, and (3) cache frequently accessed data locally. These changes require no architectural rewrites and can be deployed incrementally.

## Key Goals/Benefits
- Reduce initial load time from 8s to 3s
- Decrease onboarding abandonment from 35% to 15%
- Recover estimated $1.5M in annual revenue
- Improve App Store rating from 3.2 to 4.0+

## Scope
### In Scope
- iOS and Android apps
- Onboarding flow optimization
- Image compression pipeline
- Local caching for user data

### Out of Scope
- Backend API optimization (separate initiative)
- Complete app redesign
- New features or functionality

## Success Metrics
- **Load Time**: < 3 seconds (from 8s baseline)
- **Abandonment Rate**: < 15% (from 35% baseline)
- **App Store Rating**: > 4.0 stars (from 3.2 baseline)

## Key Stakeholders
- **Owner**: Sarah Chen (Mobile Engineering Lead)
- **Approvers**: CTO, VP Product
- **Contributors**: Mobile team (4 engineers), QA team

## Timeline Estimate
- **Phase 1**: Image compression - 2 weeks
- **Phase 2**: Lazy loading - 3 weeks
- **Phase 3**: Local caching - 2 weeks
- **Launch**: 8 weeks from kickoff
```

## Customization Notes

This template can be adapted based on your needs:
- **Optional Sections**: Risks & Mitigation, Resource Requirements, Dependencies
- **Flexible Format**: Adjust section order to match your organization's preferences
- **Scalable**: Use for projects of any size, from small features to major initiatives

The key is maintaining the discipline of one page while ensuring all critical information is present.

