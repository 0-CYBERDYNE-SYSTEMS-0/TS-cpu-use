import { Tool } from '../../client/src/lib/types';
import { anthropic } from '../lib/claude';

const anthropicComputerTool: Tool = {
  name: 'computer',
  description: 'Control the Raspberry Pi using mouse, keyboard, and system commands',
  enabled: true,
  parameters: {
    action: {
      type: 'string',
      description: 'The action to perform'
    }
  },
  async execute({ action }) {
    try {
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error('ANTHROPIC_API_KEY not configured');
      }

      process.env.DISPLAY = ':0';

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 1024,
        tools: [{
          type: 'computer_20241022',
          name: 'computer',
          display_width_px: 1920,
          display_height_px: 1080,
          display_number: 0
        }],
        messages: [{
          role: 'user',
          content: action
        }]
      });

      return response.content[0]?.text || 'No response received';
    } catch (error) {
      console.error('Computer tool error:', error);
      throw error;
    }
  }
};

export { anthropicComputerTool };