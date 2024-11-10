import type { Express } from "express";
import { WebSocketServer } from 'ws';
import { handleWebSocket } from './websocket';
import { Tool } from '../client/src/lib/types';
import { fileSystemTool } from './tools/fileSystem';
import { systemControlTool } from './tools/systemControl';
import { claudeClient } from './lib/claude';

const tools: Tool[] = [fileSystemTool, systemControlTool];
let systemConfig = {
  systemMessage: "You are a helpful AI assistant with access to various system tools.",
  temperature: 0.7,
  maxTokens: 2048
};

export function registerRoutes(app: Express) {
  // Initialize WebSocket server
  const wss = new WebSocketServer({ noServer: true });
  app.get('/ws', (req, res) => {
    if (!req.upgrade) {
      res.status(426).send('Upgrade Required');
      return;
    }
    wss.handleUpgrade(req, req.socket, Buffer.alloc(0), (ws) => {
      handleWebSocket(ws);
    });
  });

  // Chat endpoints
  app.post('/api/chat', async (req, res) => {
    try {
      const { message } = req.body;
      const response = await claudeClient.sendMessage(message, systemConfig);
      res.json(response);
    } catch (error) {
      res.status(500).json({ error: 'Failed to process message' });
    }
  });

  app.get('/api/messages', (req, res) => {
    res.json(claudeClient.getMessageHistory());
  });

  // Tool management endpoints
  app.get('/api/tools', (req, res) => {
    res.json(tools);
  });

  app.patch('/api/tools/:name', (req, res) => {
    const { name } = req.params;
    const { enabled } = req.body;
    const tool = tools.find(t => t.name === name);
    
    if (!tool) {
      res.status(404).json({ error: 'Tool not found' });
      return;
    }

    tool.enabled = enabled;
    res.json(tool);
  });

  // System configuration endpoints
  app.get('/api/config', (req, res) => {
    res.json(systemConfig);
  });

  app.patch('/api/config', (req, res) => {
    systemConfig = { ...systemConfig, ...req.body };
    res.json(systemConfig);
  });
}