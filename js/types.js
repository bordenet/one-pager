/**
 * Type Definitions for One-Pager Assistant
 *
 * This file contains JSDoc type definitions used across the application.
 * Import types using: @type {import('./types.js').TypeName}
 */

// ============================================================================
// Project Types
// ============================================================================

/**
 * @typedef {1 | 2 | 3} PhaseNumber
 */

/**
 * @typedef {Object} PhaseData
 * @property {string} prompt - The prompt used for this phase
 * @property {string} response - The AI response for this phase
 * @property {boolean} completed - Whether this phase is complete
 */

/**
 * @typedef {Object} OnePagerFormData
 * @property {string} projectName - Project name
 * @property {string} problemStatement - Problem statement
 * @property {string} [costOfDoingNothing] - Cost of inaction
 * @property {string} [proposedSolution] - Proposed solution
 * @property {string} [keyGoals] - Key goals
 * @property {string} [scopeInScope] - In scope items
 * @property {string} [scopeOutOfScope] - Out of scope items
 * @property {string} [successMetrics] - Success metrics
 * @property {string} [keyStakeholders] - Key stakeholders
 * @property {string} [timelineEstimate] - Timeline estimate
 * @property {string} [context] - Additional context
 */

/**
 * @typedef {Object} Project
 * @property {string} id - Unique identifier (UUID)
 * @property {string} title - Project title
 * @property {string} problems - Problem statement
 * @property {string} context - Additional context
 * @property {PhaseNumber} phase - Current phase number (1-3)
 * @property {string} createdAt - ISO timestamp of creation
 * @property {string} updatedAt - ISO timestamp of last update
 * @property {Object.<string, PhaseData>} phases - Phase data by phase number
 * @property {OnePagerFormData} formData - Form data for prompt generation
 * @property {string} [name] - Legacy: Project name
 * @property {string} [description] - Legacy: Problem description
 * @property {number} [currentPhase] - Legacy: Current phase
 * @property {number} [created] - Legacy: Creation timestamp
 * @property {number} [modified] - Legacy: Modification timestamp
 */

/**
 * @typedef {Object} ProjectFormData
 * @property {string} title - Project title
 * @property {string} problemStatement - Problem statement
 * @property {string} context - Additional context
 * @property {string} [costOfDoingNothing] - Cost of inaction
 * @property {string} [proposedSolution] - Proposed solution
 * @property {string} [keyGoals] - Key goals
 * @property {string} [scopeInScope] - In scope items
 * @property {string} [scopeOutOfScope] - Out of scope items
 * @property {string} [successMetrics] - Success metrics
 * @property {string} [keyStakeholders] - Key stakeholders
 * @property {string} [timelineEstimate] - Timeline estimate
 */

// ============================================================================
// Workflow Types
// ============================================================================

/**
 * @typedef {Object} PhaseConfig
 * @property {number} number - Phase number (1, 2, or 3)
 * @property {string} name - Display name for the phase
 * @property {string} aiModel - AI model to use
 * @property {string} aiUrl - URL to the AI interface
 * @property {string} promptFile - Path to the prompt template file
 * @property {string} description - Description of what this phase does
 * @property {string} icon - Emoji icon for the phase
 * @property {string} color - Color theme for the phase
 */

/**
 * @typedef {Object} WorkflowConfig
 * @property {number} phaseCount - Total number of phases
 * @property {PhaseConfig[]} phases - Array of phase configurations
 */

// ============================================================================
// Storage Types
// ============================================================================

/**
 * @typedef {Object} StorageEstimate
 * @property {number} [quota] - Total quota in bytes
 * @property {number} [usage] - Current usage in bytes
 */

/**
 * @typedef {Object} Setting
 * @property {string} key - Setting key
 * @property {*} value - Setting value
 */

// ============================================================================
// UI Types
// ============================================================================

/**
 * @typedef {'success' | 'error' | 'warning' | 'info'} ToastType
 */

/**
 * @typedef {Object} RouteInfo
 * @property {string} name - Route name ('home', 'new-project', 'project')
 * @property {string} [id] - Project ID for project routes
 */

// ============================================================================
// Attachment Types
// ============================================================================

/**
 * @typedef {Object} Attachment
 * @property {string} id - Unique identifier (UUID)
 * @property {string} proposalId - ID of the parent proposal
 * @property {string} filename - Original filename
 * @property {string} content - Extracted text content
 * @property {number} size - File size in bytes
 * @property {string} createdAt - ISO timestamp of creation
 */

/**
 * @typedef {Object} ProjectBackup
 * @property {string} version - Backup format version
 * @property {string} exportedAt - ISO timestamp of export
 * @property {number} projectCount - Number of projects in backup
 * @property {Project[]} projects - Array of projects
 */

// Export empty object to make this a module
export {};
