import { Agent } from '../models/Agent.js';
import { User } from '../models/User.js';
import { ROLES } from '../constants/index.js';
import { msg } from '../constants/messages.js';

export async function listAgents(req, res, next) {
  try {
    const page = Number(req.query.page) || 1;
    const limit = Number(req.query.limit) || 20;
    const search = req.query.search;
    
    const query = {};
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { phone: { $regex: search, $options: 'i' } },
      ];
    }

    const [agents, total] = await Promise.all([
      Agent.find(query)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit)
        .populate('clientIntegerId'),
      Agent.countDocuments(query),
    ]);

    res.json({ success: true, data: { agents, total, page, limit } });
  } catch (err) {
    next(err);
  }
}

export async function getAgent(req, res, next) {
  try {
    const agent = await Agent.findById(req.params.id);
    
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    res.json({ success: true, data: { agent } });
  } catch (err) {
    next(err);
  }
}

export async function createAgent(req, res, next) {
  try {
    const { name, address, phone, clientIntegerId } = req.body;

    // Validate that the client exists
    const client = await User.findByIntegerId(parseInt(clientIntegerId));
    
    if (!client) {
      return res.status(404).json({ success: false, message: 'Client not found with this ID' });
    }

    if (client.role !== ROLES.CLIENT) {
      return res.status(400).json({ success: false, message: 'User is not a client' });
    }

    // Check if agent already exists for this client
    const existingAgent = await Agent.findOne({ clientIntegerId: parseInt(clientIntegerId) });
    if (existingAgent) {
      return res.status(400).json({ success: false, message: 'Agent already exists for this client' });
    }

    const agent = new Agent({
      name,
      address,
      phone,
      clientIntegerId: parseInt(clientIntegerId),
    });

    await agent.save();

    res.status(201).json({ success: true, data: { agent } });
  } catch (err) {
    next(err);
  }
}

export async function updateAgent(req, res, next) {
  try {
    const { name, address, phone, clientIntegerId } = req.body;

    // If clientIntegerId is being updated, validate it
    if (clientIntegerId) {
      const client = await User.findByIntegerId(parseInt(clientIntegerId));
      
      if (!client) {
        return res.status(404).json({ success: false, message: 'Client not found with this ID' });
      }

      if (client.role !== ROLES.CLIENT) {
        return res.status(400).json({ success: false, message: 'User is not a client' });
      }

      // Check if another agent already exists for this client
      const existingAgent = await Agent.findOne({ 
        clientIntegerId: parseInt(clientIntegerId),
        _id: { $ne: req.params.id }
      });
      if (existingAgent) {
        return res.status(400).json({ success: false, message: 'Agent already exists for this client' });
      }
    }

    const agent = await Agent.findByIdAndUpdate(
      req.params.id,
      { name, address, phone, clientIntegerId: clientIntegerId ? parseInt(clientIntegerId) : undefined },
      { new: true, runValidators: true }
    );

    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    res.json({ success: true, data: { agent } });
  } catch (err) {
    next(err);
  }
}

export async function deleteAgent(req, res, next) {
  try {
    const agent = await Agent.findByIdAndDelete(req.params.id);

    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent not found' });
    }

    res.json({ success: true, data: { agent } });
  } catch (err) {
    next(err);
  }
}
