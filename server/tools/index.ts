import type { Tool } from '../../client/src/lib/types';
import { analyticsService } from '../lib/analytics';
import { checkToolPermission } from '../middleware/auth';
import { getAllTools, findTool, registerTool } from './loader';
import { fileSystemTool } from './fileSystem';
import { systemControlTool } from './systemControl';
import { computerControlTool } from './computerControl';

// Initialize tools array
const tools: Tool[] = [];

// Register tools
function initializeTools() {
  try {
    registerTool(fileSystemTool);
    registerTool(systemControlTool);
    registerTool(computerControlTool);
    
    // Update tools array with registered tools
    const registeredTools = getAllTools();
    tools.length = 0; // Clear existing array
    tools.push(...registeredTools);
  } catch (error) {
    console.error('Failed to register tools:', error);
  }
}

// Initialize tools before export
initializeTools();

// Export initialized tools
export { tools };

export async function executeToolCall(name: string, args: Record<string, any>, userRole: string = 'user') {
  const tool = tools.find(t => t.name === name);
  if (!tool || !tool.enabled) {
    throw new Error(`Tool "${name}" not found or disabled`);
  }

  // Check execution permission
  const hasPermission = await checkToolPermission(name, userRole, 'canExecute');
  if (!hasPermission) {
    throw new Error(`Unauthorized: You don't have permission to execute this tool`);
  }

  const startTime = Date.now();
  let toolCall;

  try {
    if (!tool.execute) {
      throw new Error(`Tool "${name}" does not have an execute function`);
    }
    
    // Create toolCall object first to track the execution
    toolCall = {
      id: crypto.randomUUID(),
      name,
      args,
      status: 'pending' as const
    };

    const result = await tool.execute(args);
    
    // Update toolCall with success status and result
    toolCall = {
      ...toolCall,
      status: 'success' as const,
      result
    };
    
    return result;
  } catch (error) {
    toolCall = {
      id: crypto.randomUUID(),
      name,
      args,
      status: 'error' as const,
      result: error instanceof Error ? error.message : 'Unknown error occurred'
    };
    throw error;
  } finally {
    if (toolCall) {
      try {
        await analyticsService.trackToolExecution(toolCall, startTime);
      } catch (analyticsError) {
        console.error('Failed to track tool execution:', analyticsError);
        // Don't throw here to avoid affecting the main execution flow
      }
    }
  }
}

async function seedToolExecutions() {
  const operations = [
    { name: 'fileSystem', args: { operation: 'list', path: '.' } },
    { name: 'systemControl', args: { command: 'ps' } },
    // Error cases
    { name: 'fileSystem', args: { operation: 'read', path: '/nonexistent' } },
    { name: 'systemControl', args: { command: 'invalid' } }
  ];

  console.log('Seeding tool executions...');
  for (const op of operations) {
    try {
      console.log(`Executing ${op.name} with args:`, op.args);
      await executeToolCall(op.name, op.args);
    } catch (error) {
      console.error(`Error executing ${op.name}:`, error);
      // Continue with next operation even if this one fails
    }
  }
  console.log('Tool execution seeding completed');
}

// Export is already done at the top of the file

// Export the seeding function instead of running it immediately
export { seedToolExecutions };