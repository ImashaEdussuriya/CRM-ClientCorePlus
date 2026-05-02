const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });

const connectDB = require('./config/db');
const { User, Customer, Deal, Task } = require('./models');

const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || 'clientcore-plus-secret-key-2026';

// Seed data for in-memory database
const seedData = async () => {
  const userCount = await User.countDocuments();
  if (userCount === 0) {
    console.log('Seeding database with initial data...');
    
    // Create default users
    await User.create([
      { email: 'admin@clientcore.com', password: 'admin123', name: 'Admin User', role: 'admin' },
      { email: 'user@clientcore.com', password: 'user123', name: 'John Doe', role: 'user' }
    ]);
    
    // Create sample customers
    await Customer.create([
      { name: 'Acme Corporation', email: 'contact@acme.com', phone: '+1 (555) 123-4567', company: 'Acme Corporation', category: 'VIP', notes: 'Fortune 500 company' },
      { name: 'Tech Solutions Ltd', email: 'info@techsolutions.com', phone: '+1 (555) 234-5678', company: 'Tech Solutions Ltd', category: 'Customer', notes: 'Software development firm' },
      { name: 'Global Enterprises', email: 'hello@globalent.com', phone: '+1 (555) 345-6789', company: 'Global Enterprises', category: 'VIP', notes: 'International trading company' },
      { name: 'StartUp Inc', email: 'team@startup.io', phone: '+1 (555) 456-7890', company: 'StartUp Inc', category: 'Lead', notes: 'Early-stage tech startup' },
      { name: 'Innovation Labs', email: 'contact@innolabs.com', phone: '+1 (555) 567-8901', company: 'Innovation Labs', category: 'Customer', notes: 'R&D focused company' }
    ]);
    
    // Create sample deals
    await Deal.create([
      { customer: 'Acme Corporation', value: 125000, stage: 'won', contact: 'John Smith', description: 'Enterprise software license', expectedCloseDate: new Date('2025-11-15'), closedDate: new Date('2025-11-20') },
      { customer: 'Tech Solutions Ltd', value: 78500, stage: 'negotiation', contact: 'Sarah Johnson', description: 'Custom development project', expectedCloseDate: new Date('2026-01-15') },
      { customer: 'Global Enterprises', value: 89000, stage: 'won', contact: 'Maria Garcia', description: 'Global deployment package', expectedCloseDate: new Date('2025-10-20'), closedDate: new Date('2025-10-25') },
      { customer: 'StartUp Inc', value: 35000, stage: 'lead', contact: 'Emily Davis', description: 'Startup package', expectedCloseDate: new Date('2026-03-15') },
      { customer: 'Innovation Labs', value: 67500, stage: 'proposal', contact: 'Chris Wilson', description: 'R&D partnership', expectedCloseDate: new Date('2026-02-01') }
    ]);
    
    // Create sample tasks
    await Task.create([
      { title: 'Follow up with Acme', customer: 'Acme Corporation', dueDate: new Date('2026-01-10'), priority: 'high', status: 'pending', description: 'Discuss renewal terms' },
      { title: 'Send proposal to Tech Solutions', customer: 'Tech Solutions Ltd', dueDate: new Date('2026-01-08'), priority: 'high', status: 'pending', description: 'Finalize and send project proposal' },
      { title: 'Demo for StartUp Inc', customer: 'StartUp Inc', dueDate: new Date('2026-01-12'), priority: 'medium', status: 'pending', description: 'Product demonstration' },
      { title: 'Contract review', customer: 'Global Enterprises', dueDate: new Date('2026-01-15'), priority: 'low', status: 'completed', description: 'Review contract terms' }
    ]);
    
    console.log('Database seeded successfully!');
    console.log('Login credentials: admin@clientcore.com / admin123');
  }
};

// Connect to MongoDB and seed data
const initializeDB = async () => {
  await connectDB();
  await seedData();
};

// Middleware
app.use(cors());
app.use(express.json());

// Auth middleware
const authMiddleware = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ success: false, message: 'No token provided' });
  }
  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    res.status(401).json({ success: false, message: 'Invalid or expired token' });
  }
};

// ==================== AUTH ROUTES ====================

// Login endpoint
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password } = req.body;

    // Validate input
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'Email and password are required'
      });
    }

    // Find user by email
    const user = await User.findOne({ email: email.toLowerCase() });

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Check password
    const isValidPassword = await user.comparePassword(password);

    if (!isValidPassword) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    // Return success response
    res.json({
      success: true,
      message: 'Login successful',
      token,
      user: {
        id: user._id,
        email: user.email,
        name: user.name,
        role: user.role
      }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server error. Please try again.'
    });
  }
});

// Verify token endpoint
app.get('/api/auth/verify', (req, res) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({
      success: false,
      message: 'No token provided'
    });
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    res.json({
      success: true,
      user: decoded
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Invalid or expired token'
    });
  }
});

// Logout endpoint
app.post('/api/auth/logout', (req, res) => {
  res.json({
    success: true,
    message: 'Logged out successfully'
  });
});

// ==================== CUSTOMER ROUTES ====================

// Get all customers
app.get('/api/customers', authMiddleware, async (req, res) => {
  try {
    const customers = await Customer.find().sort({ createdAt: -1 });
    res.json({ success: true, data: customers });
  } catch (error) {
    console.error('Error fetching customers:', error);
    res.status(500).json({ success: false, message: 'Error fetching customers' });
  }
});

// Get single customer
app.get('/api/customers/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error fetching customer:', error);
    res.status(500).json({ success: false, message: 'Error fetching customer' });
  }
});

// Add new customer
app.post('/api/customers', authMiddleware, async (req, res) => {
  try {
    const { name, email, phone, company, category } = req.body;
    const customer = await Customer.create({
      name,
      email,
      phone,
      company,
      category: category || 'Lead',
      createdBy: req.user.id
    });
    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error creating customer:', error);
    if (error.code === 11000) {
      return res.status(400).json({ success: false, message: 'Customer with this email already exists' });
    }
    res.status(500).json({ success: false, message: 'Error creating customer' });
  }
});

// Update customer
app.put('/api/customers/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, data: customer });
  } catch (error) {
    console.error('Error updating customer:', error);
    res.status(500).json({ success: false, message: 'Error updating customer' });
  }
});

// Delete customer
app.delete('/api/customers/:id', authMiddleware, async (req, res) => {
  try {
    const customer = await Customer.findByIdAndDelete(req.params.id);
    if (!customer) {
      return res.status(404).json({ success: false, message: 'Customer not found' });
    }
    res.json({ success: true, message: 'Customer deleted successfully' });
  } catch (error) {
    console.error('Error deleting customer:', error);
    res.status(500).json({ success: false, message: 'Error deleting customer' });
  }
});

// ==================== DEAL ROUTES ====================

// Get all deals
app.get('/api/deals', authMiddleware, async (req, res) => {
  try {
    const deals = await Deal.find().sort({ createdAt: -1 });
    res.json({ success: true, data: deals });
  } catch (error) {
    console.error('Error fetching deals:', error);
    res.status(500).json({ success: false, message: 'Error fetching deals' });
  }
});

// Get single deal
app.get('/api/deals/:id', authMiddleware, async (req, res) => {
  try {
    const deal = await Deal.findById(req.params.id);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }
    res.json({ success: true, data: deal });
  } catch (error) {
    console.error('Error fetching deal:', error);
    res.status(500).json({ success: false, message: 'Error fetching deal' });
  }
});

// Create new deal
app.post('/api/deals', authMiddleware, async (req, res) => {
  try {
    const deal = await Deal.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.json({ success: true, data: deal });
  } catch (error) {
    console.error('Error creating deal:', error);
    res.status(500).json({ success: false, message: 'Error creating deal' });
  }
});

// Update deal
app.put('/api/deals/:id', authMiddleware, async (req, res) => {
  try {
    const deal = await Deal.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }
    res.json({ success: true, data: deal });
  } catch (error) {
    console.error('Error updating deal:', error);
    res.status(500).json({ success: false, message: 'Error updating deal' });
  }
});

// Delete deal
app.delete('/api/deals/:id', authMiddleware, async (req, res) => {
  try {
    const deal = await Deal.findByIdAndDelete(req.params.id);
    if (!deal) {
      return res.status(404).json({ success: false, message: 'Deal not found' });
    }
    res.json({ success: true, message: 'Deal deleted successfully' });
  } catch (error) {
    console.error('Error deleting deal:', error);
    res.status(500).json({ success: false, message: 'Error deleting deal' });
  }
});

// ==================== TASK ROUTES ====================

// Get all tasks
app.get('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const tasks = await Task.find().sort({ dueDate: 1 });
    res.json({ success: true, data: tasks });
  } catch (error) {
    console.error('Error fetching tasks:', error);
    res.status(500).json({ success: false, message: 'Error fetching tasks' });
  }
});

// Get single task
app.get('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Error fetching task:', error);
    res.status(500).json({ success: false, message: 'Error fetching task' });
  }
});

// Create new task
app.post('/api/tasks', authMiddleware, async (req, res) => {
  try {
    const task = await Task.create({
      ...req.body,
      createdBy: req.user.id
    });
    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Error creating task:', error);
    res.status(500).json({ success: false, message: 'Error creating task' });
  }
});

// Update task
app.put('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, data: task });
  } catch (error) {
    console.error('Error updating task:', error);
    res.status(500).json({ success: false, message: 'Error updating task' });
  }
});

// Delete task
app.delete('/api/tasks/:id', authMiddleware, async (req, res) => {
  try {
    const task = await Task.findByIdAndDelete(req.params.id);
    if (!task) {
      return res.status(404).json({ success: false, message: 'Task not found' });
    }
    res.json({ success: true, message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    res.status(500).json({ success: false, message: 'Error deleting task' });
  }
});

// ==================== PREDICTION/ANALYTICS ROUTES ====================

// Comprehensive Dashboard endpoint
app.get('/api/dashboard', authMiddleware, async (req, res) => {
  try {
    const [customers, deals, tasks] = await Promise.all([
      Customer.find(),
      Deal.find().sort({ createdAt: -1 }),
      Task.find().sort({ dueDate: 1 })
    ]);

    // Calculate stats
    const wonDeals = deals.filter(d => d.stage === 'won');
    const lostDeals = deals.filter(d => d.stage === 'lost');
    const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage));
    const totalRevenue = wonDeals.reduce((sum, d) => sum + d.value, 0);
    const closedDeals = wonDeals.length + lostDeals.length;
    const winRate = closedDeals > 0 ? ((wonDeals.length / closedDeals) * 100).toFixed(1) : 0;

    // ========== REAL GROWTH METRICS CALCULATION ==========
    // Compare current period (last 30 days) with previous period (30-60 days ago)
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    // Customer Growth: Compare customers created in last 30 days vs previous 30 days
    const currentPeriodCustomers = customers.filter(c => new Date(c.createdAt) >= thirtyDaysAgo);
    const previousPeriodCustomers = customers.filter(c => 
      new Date(c.createdAt) >= sixtyDaysAgo && new Date(c.createdAt) < thirtyDaysAgo
    );
    const customerGrowth = previousPeriodCustomers.length > 0 
      ? Math.round(((currentPeriodCustomers.length - previousPeriodCustomers.length) / previousPeriodCustomers.length) * 100)
      : (currentPeriodCustomers.length > 0 ? 100 : 0);

    // Deal Growth: Compare deals created in last 30 days vs previous 30 days
    const currentPeriodDeals = deals.filter(d => new Date(d.createdAt) >= thirtyDaysAgo);
    const previousPeriodDeals = deals.filter(d => 
      new Date(d.createdAt) >= sixtyDaysAgo && new Date(d.createdAt) < thirtyDaysAgo
    );
    const dealGrowth = previousPeriodDeals.length > 0 
      ? Math.round(((currentPeriodDeals.length - previousPeriodDeals.length) / previousPeriodDeals.length) * 100)
      : (currentPeriodDeals.length > 0 ? 100 : 0);

    // Win Rate Change: Compare current win rate with previous period win rate
    const currentWonDeals = wonDeals.filter(d => new Date(d.closedDate || d.updatedAt) >= thirtyDaysAgo);
    const currentLostDeals = lostDeals.filter(d => new Date(d.closedDate || d.updatedAt) >= thirtyDaysAgo);
    const currentClosedDeals = currentWonDeals.length + currentLostDeals.length;
    const currentWinRate = currentClosedDeals > 0 ? (currentWonDeals.length / currentClosedDeals) * 100 : 0;

    const previousWonDeals = wonDeals.filter(d => {
      const date = new Date(d.closedDate || d.updatedAt);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });
    const previousLostDeals = lostDeals.filter(d => {
      const date = new Date(d.closedDate || d.updatedAt);
      return date >= sixtyDaysAgo && date < thirtyDaysAgo;
    });
    const previousClosedDeals = previousWonDeals.length + previousLostDeals.length;
    const previousWinRate = previousClosedDeals > 0 ? (previousWonDeals.length / previousClosedDeals) * 100 : 0;
    const winRateChange = parseFloat((currentWinRate - previousWinRate).toFixed(1));

    // Revenue Growth: Compare won deal revenue in last 30 days vs previous 30 days
    const currentPeriodRevenue = currentWonDeals.reduce((sum, d) => sum + d.value, 0);
    const previousPeriodRevenue = previousWonDeals.reduce((sum, d) => sum + d.value, 0);
    const revenueGrowth = previousPeriodRevenue > 0 
      ? Math.round(((currentPeriodRevenue - previousPeriodRevenue) / previousPeriodRevenue) * 100)
      : (currentPeriodRevenue > 0 ? 100 : 0);

    // Pipeline summary
    const pipelineStages = ['lead', 'proposal', 'negotiation', 'won'];
    const pipelineSummary = pipelineStages.map(stage => {
      const stageDeals = deals.filter(d => d.stage === stage);
      return {
        stage,
        count: stageDeals.length,
        value: stageDeals.reduce((sum, d) => sum + d.value, 0)
      };
    });

    // Recent deals (last 5)
    const recentDeals = deals.slice(0, 5).map(deal => ({
      customer: deal.customer,
      value: deal.value,
      stage: deal.stage,
      createdAt: deal.createdAt
    }));

    // Top customers by revenue (from won deals)
    const customerRevenue = {};
    const customerDeals = {};
    wonDeals.forEach(deal => {
      customerRevenue[deal.customer] = (customerRevenue[deal.customer] || 0) + deal.value;
      customerDeals[deal.customer] = (customerDeals[deal.customer] || 0) + 1;
    });
    const topCustomers = Object.entries(customerRevenue)
      .map(([name, revenue]) => ({
        name,
        revenue,
        deals: customerDeals[name] || 0
      }))
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 4);

    // Revenue by month (last 6 months) - REAL DATA from actual deals
    const revenueByMonth = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
      const monthName = monthStart.toLocaleString('en-US', { month: 'short' });
      
      // Get won deals closed in this month
      const monthWonDeals = wonDeals.filter(d => {
        const closedDate = new Date(d.closedDate || d.createdAt);
        return closedDate >= monthStart && closedDate <= monthEnd;
      });
      
      const monthRevenue = monthWonDeals.reduce((sum, d) => sum + d.value, 0);
      revenueByMonth.push({
        month: monthName,
        revenue: monthRevenue
      });
    }

    // Upcoming tasks (pending tasks)
    const pendingTasks = tasks.filter(t => t.status === 'pending');
    const upcomingTasks = pendingTasks.slice(0, 4).map(task => ({
      title: task.title,
      customer: task.customer,
      dueDate: task.dueDate,
      priority: task.priority
    }));

    // Prediction - REAL calculation based on pipeline and historical data
    const pipelineValue = activeDeals.reduce((sum, d) => sum + d.value, 0);
    const avgDealValue = wonDeals.length > 0 ? totalRevenue / wonDeals.length : 0;
    const currentWinRateDecimal = parseFloat(winRate) / 100;
    
    // Predicted revenue = Pipeline value × win rate + deals in negotiation (higher probability)
    const negotiationDeals = deals.filter(d => d.stage === 'negotiation');
    const proposalDeals = deals.filter(d => d.stage === 'proposal');
    const leadDeals = deals.filter(d => d.stage === 'lead');
    
    // Weight by stage probability: negotiation 70%, proposal 40%, lead 20%
    const weightedPipelineValue = 
      negotiationDeals.reduce((sum, d) => sum + d.value * 0.7, 0) +
      proposalDeals.reduce((sum, d) => sum + d.value * 0.4, 0) +
      leadDeals.reduce((sum, d) => sum + d.value * 0.2, 0);
    
    const predictedRevenue = Math.round(weightedPipelineValue);
    
    // Confidence based on data quality: more historical data = higher confidence
    const dataPoints = closedDeals;
    const baseConfidence = 0.5;
    const dataBonus = Math.min(dataPoints * 0.03, 0.4); // Max 40% bonus from data
    const confidence = parseFloat((baseConfidence + dataBonus).toFixed(2));
    
    const prediction = {
      predictedRevenue,
      confidence,
      period: 'Next 30 days',
      methodology: 'Weighted pipeline analysis'
    };

    res.json({
      success: true,
      data: {
        stats: {
          totalCustomers: customers.length,
          activeDeals: activeDeals.length,
          totalDeals: deals.length,
          winRate: parseFloat(winRate),
          totalRevenue,
          pendingTasks: pendingTasks.length,
          customerGrowth,
          dealGrowth,
          winRateChange,
          revenueGrowth
        },
        pipelineSummary,
        recentDeals,
        topCustomers,
        revenueByMonth,
        upcomingTasks,
        prediction
      }
    });
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ success: false, message: 'Error fetching dashboard data' });
  }
});

// Prediction endpoint for dashboard - REAL calculation
app.get('/api/prediction', authMiddleware, async (req, res) => {
  try {
    const deals = await Deal.find();
    const wonDeals = deals.filter(d => d.stage === 'won');
    const lostDeals = deals.filter(d => d.stage === 'lost');
    const activeDeals = deals.filter(d => !['won', 'lost'].includes(d.stage));
    
    // Calculate win rate from historical data
    const closedDeals = wonDeals.length + lostDeals.length;
    const winRate = closedDeals > 0 ? wonDeals.length / closedDeals : 0.3; // Default 30% if no data
    
    // Weight deals by stage probability
    const negotiationDeals = deals.filter(d => d.stage === 'negotiation');
    const proposalDeals = deals.filter(d => d.stage === 'proposal');
    const leadDeals = deals.filter(d => d.stage === 'lead');
    
    // Stage-weighted prediction: negotiation 70%, proposal 40%, lead 20%
    const predictedRevenue = Math.round(
      negotiationDeals.reduce((sum, d) => sum + d.value * 0.7, 0) +
      proposalDeals.reduce((sum, d) => sum + d.value * 0.4, 0) +
      leadDeals.reduce((sum, d) => sum + d.value * 0.2, 0)
    );
    
    // Dynamic confidence based on historical data volume
    const baseConfidence = 0.5;
    const dataBonus = Math.min(closedDeals * 0.03, 0.4);
    const confidence = parseFloat((baseConfidence + dataBonus).toFixed(2));
    
    res.json({
      success: true,
      data: {
        predictedRevenue,
        confidence,
        period: 'Next 30 days',
        activePipeline: activeDeals.length,
        historicalWinRate: parseFloat((winRate * 100).toFixed(1))
      }
    });
  } catch (error) {
    console.error('Error fetching prediction:', error);
    res.status(500).json({ success: false, message: 'Error fetching prediction' });
  }
});

// Dashboard stats endpoint
app.get('/api/stats', authMiddleware, async (req, res) => {
  try {
    const [customerCount, dealCount, deals, taskCount] = await Promise.all([
      Customer.countDocuments(),
      Deal.countDocuments(),
      Deal.find(),
      Task.countDocuments({ status: 'pending' })
    ]);

    const wonDeals = deals.filter(d => d.stage === 'won');
    const totalRevenue = wonDeals.reduce((sum, d) => sum + d.value, 0);
    const conversionRate = deals.length > 0 ? ((wonDeals.length / deals.length) * 100).toFixed(1) : 0;

    res.json({
      success: true,
      data: {
        totalCustomers: customerCount,
        totalDeals: dealCount,
        totalRevenue,
        conversionRate,
        pendingTasks: taskCount
      }
    });
  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ success: false, message: 'Error fetching stats' });
  }
});

// Start server only after DB initialization succeeds
const startServer = async () => {
  try {
    await initializeDB();

    app.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
      console.log('');
      console.log('Test credentials:');
      console.log('  Email: admin@clientcore.com');
      console.log('  Password: admin123');
      console.log('');
      console.log('  Email: user@clientcore.com');
      console.log('  Password: user123');
    });
  } catch (error) {
    console.error('Server startup failed:', error.message);
    process.exit(1);
  }
};

startServer();