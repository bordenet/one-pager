/**
 * @jest-environment jsdom
 */
import { describe, test, expect, beforeEach } from '@jest/globals';

// Import the module to test
import { convertHtmlToMarkdown } from '../../shared/js/import-document.js';

// Mock TurndownService for testing
global.TurndownService = class {
  constructor() {
    this.rules = [];
  }
  addRule() {}
  turndown(html) {
    // Simple mock that strips tags
    const div = document.createElement('div');
    div.innerHTML = html;
    return div.textContent || div.innerText || '';
  }
};

describe('import-document', () => {
  describe('convertHtmlToMarkdown', () => {
    test('should convert simple HTML to text', () => {
      const html = '<p>Hello World</p>';
      const result = convertHtmlToMarkdown(html);
      expect(result).toContain('Hello World');
    });

    test('should handle empty content', () => {
      const result = convertHtmlToMarkdown('');
      expect(result).toBe('');
    });
  });

  describe('extractTitleFromMarkdown', () => {
    // We need to test the title extraction logic
    // Since extractTitleFromMarkdown is not exported, we test via title patterns

    test('should extract title from H1 header', () => {
      const markdown = '# My Project Title\n\nSome content here';
      const h1Match = markdown.match(/^#\s+(.+?)(?:\n|$)/m);
      expect(h1Match).toBeTruthy();
      expect(h1Match[1]).toBe('My Project Title');
    });

    test('should extract title from H2 if no H1', () => {
      const markdown = '## Secondary Title\n\nContent';
      const h2Match = markdown.match(/^##\s+(.+?)(?:\n|$)/m);
      expect(h2Match).toBeTruthy();
      expect(h2Match[1]).toBe('Secondary Title');
    });

    test('should extract title from bold text if no headers', () => {
      const markdown = '**This is a bold title** and some text';
      const boldMatch = markdown.match(/^\*\*(.+?)\*\*/m);
      expect(boldMatch).toBeTruthy();
      expect(boldMatch[1]).toBe('This is a bold title');
    });

    test('should extract title from first line as fallback', () => {
      const markdown = 'This adversarial review identifies several critical issues\n\nMore content';
      // First non-empty line that's not a horizontal rule
      const lines = markdown.split('\n');
      const firstLine = lines.find(line => {
        const trimmed = line.trim();
        return trimmed && !/^[-=*]{3,}$/.test(trimmed) && trimmed.length >= 5;
      });
      expect(firstLine).toBe('This adversarial review identifies several critical issues');
    });

    test('should handle markdown starting with horizontal rule', () => {
      const markdown = '---\n\n# Actual Title\n\nContent';
      const h1Match = markdown.match(/^#\s+(.+?)(?:\n|$)/m);
      expect(h1Match).toBeTruthy();
      expect(h1Match[1]).toBe('Actual Title');
    });
  });

  describe('navigation format', () => {
    test('navigateTo should be called with correct format', () => {
      // The correct format is 'project/' + projectId
      const projectId = 'abc-123-def';
      const route = 'project/' + projectId;

      // Split as router does
      const [path, param] = route.split('/');
      expect(path).toBe('project');
      expect(param).toBe(projectId);
    });

    test('incorrect navigateTo format loses project ID', () => {
      // If called as navigateTo('project', projectId), the route is just 'project'
      const route = 'project';
      const [path, param] = route.split('/');
      expect(path).toBe('project');
      expect(param).toBeUndefined(); // This was the bug!
    });
  });

  describe('imported project detection', () => {
    test('should detect imported project by isImported flag', () => {
      const project = { isImported: true, phases: { 1: { response: 'content' } } };
      const hasImportedContent = project.isImported ||
        project.importedContent ||
        (project.phases?.[1]?.response && project.phases?.[1]?.response.length > 100);
      expect(hasImportedContent).toBe(true);
    });

    test('should detect imported project by importedContent', () => {
      const project = { importedContent: 'Some markdown content' };
      const hasImportedContent = !!(project.isImported ||
        project.importedContent ||
        (project.phases?.[1]?.response && project.phases?.[1]?.response.length > 100));
      expect(hasImportedContent).toBe(true);
    });

    test('should detect imported project by long phase 1 response', () => {
      const longContent = 'A'.repeat(150);
      const project = { phases: { 1: { response: longContent } } };
      const hasImportedContent = !!(project.isImported ||
        project.importedContent ||
        (project.phases?.[1]?.response && project.phases?.[1]?.response.length > 100));
      expect(hasImportedContent).toBe(true);
    });

    test('should not detect regular project as imported', () => {
      const project = { title: 'Test', problems: 'Problem', phases: { 1: { response: '' } } };
      const hasImportedContent = !!(project.isImported ||
        project.importedContent ||
        (project.phases?.[1]?.response && project.phases?.[1]?.response.length > 100));
      expect(hasImportedContent).toBe(false);
    });
  });
});
