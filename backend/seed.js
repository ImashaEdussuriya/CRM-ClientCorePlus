const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const connectDB = require('./config/db');
const { User, Customer, Deal, Task } = require('./models');

// Sample data - Users
const users = [
  {
    email: 'admin@clientcore.com',
    password: 'admin123',
    name: 'Admin User',
    role: 'admin'
  },
  {
    email: 'user@clientcore.com',
    password: 'user123',
    name: 'John Doe',
    role: 'user'
  },
  {
    email: 'sarah@clientcore.com',
    password: 'sarah123',
    name: 'Sarah Johnson',
    role: 'user'
  },
  {
    email: 'mike@clientcore.com',
    password: 'mike123',
    name: 'Mike Chen',
    role: 'user'
  }
];

// Sample data - Customers (expanded with more realistic data)
const customers = [
  { name: 'Acme Corporation', email: 'contact@acme.com', phone: '+1 (555) 123-4567', company: 'Acme Corporation', category: 'VIP', notes: 'Fortune 500 company, long-term partnership' },
  { name: 'Tech Solutions Ltd', email: 'info@techsolutions.com', phone: '+1 (555) 234-5678', company: 'Tech Solutions Ltd', category: 'Customer', notes: 'Software development firm' },
  { name: 'Global Enterprises', email: 'hello@globalent.com', phone: '+1 (555) 345-6789', company: 'Global Enterprises', category: 'VIP', notes: 'International trading company' },
  { name: 'StartUp Inc', email: 'team@startup.io', phone: '+1 (555) 456-7890', company: 'StartUp Inc', category: 'Lead', notes: 'Early-stage tech startup' },
  { name: 'Innovation Labs', email: 'contact@innolabs.com', phone: '+1 (555) 567-8901', company: 'Innovation Labs', category: 'Customer', notes: 'R&D focused company' },
  { name: 'Digital Dynamics', email: 'sales@digitaldyn.com', phone: '+1 (555) 678-9012', company: 'Digital Dynamics', category: 'Lead', notes: 'Digital marketing agency' },
  { name: 'Cloud Nine Systems', email: 'support@cloudnine.io', phone: '+1 (555) 789-0123', company: 'Cloud Nine Systems', category: 'Customer', notes: 'Cloud infrastructure provider' },
  { name: 'Bright Future Co', email: 'hello@brightfuture.com', phone: '+1 (555) 890-1234', company: 'Bright Future Co', category: 'Lead', notes: 'Renewable energy startup' },
  { name: 'Prime Partners', email: 'info@primepartners.com', phone: '+1 (555) 901-2345', company: 'Prime Partners', category: 'VIP', notes: 'Strategic consulting firm' },
  { name: 'NextGen Solutions', email: 'contact@nextgen.io', phone: '+1 (555) 012-3456', company: 'NextGen Solutions', category: 'Customer', notes: 'AI and ML solutions' },
  { name: 'Metro Financial', email: 'business@metrofin.com', phone: '+1 (555) 111-2222', company: 'Metro Financial', category: 'VIP', notes: 'Financial services company' },
  { name: 'HealthTech Plus', email: 'info@healthtechplus.com', phone: '+1 (555) 222-3333', company: 'HealthTech Plus', category: 'Customer', notes: 'Healthcare technology provider' },
  { name: 'EcoGreen Industries', email: 'contact@ecogreen.com', phone: '+1 (555) 333-4444', company: 'EcoGreen Industries', category: 'Lead', notes: 'Sustainable manufacturing' },
  { name: 'DataCore Analytics', email: 'sales@datacore.io', phone: '+1 (555) 444-5555', company: 'DataCore Analytics', category: 'Customer', notes: 'Big data analytics firm' },
  { name: 'SecureNet Systems', email: 'info@securenet.com', phone: '+1 (555) 555-6666', company: 'SecureNet Systems', category: 'VIP', notes: 'Cybersecurity solutions' },
  { name: 'LogiTrans Corp', email: 'logistics@logitrans.com', phone: '+1 (555) 666-7777', company: 'LogiTrans Corp', category: 'Customer', notes: 'Logistics and supply chain' },
  { name: 'MediaWave Studios', email: 'hello@mediawave.tv', phone: '+1 (555) 777-8888', company: 'MediaWave Studios', category: 'Lead', notes: 'Media production company' },
  { name: 'Quantum Computing Inc', email: 'research@quantumcomp.io', phone: '+1 (555) 888-9999', company: 'Quantum Computing Inc', category: 'Lead', notes: 'Quantum technology research' },
  { name: 'Pacific Retail Group', email: 'partnerships@pacificretail.com', phone: '+1 (555) 999-0000', company: 'Pacific Retail Group', category: 'Customer', notes: 'Retail chain management' },
  { name: 'Atlas Manufacturing', email: 'sales@atlasmfg.com', phone: '+1 (555) 123-9999', company: 'Atlas Manufacturing', category: 'VIP', notes: 'Industrial manufacturing' },
  { name: 'Stellar Communications', email: 'info@stellar-comm.com', phone: '+1 (555) 234-8888', company: 'Stellar Communications', category: 'Customer', notes: 'Telecommunications provider' },
  { name: 'Apex Legal Services', email: 'contact@apexlegal.com', phone: '+1 (555) 345-7777', company: 'Apex Legal Services', category: 'Lead', notes: 'Legal consulting firm' },
  { name: 'TrueVision Media', email: 'ads@truevision.com', phone: '+1 (555) 456-6666', company: 'TrueVision Media', category: 'Customer', notes: 'Advertising agency' },
  { name: 'Pinnacle Hotels', email: 'corporate@pinnaclehotels.com', phone: '+1 (555) 567-5555', company: 'Pinnacle Hotels', category: 'VIP', notes: 'Luxury hotel chain' },
  { name: 'Swift Delivery Co', email: 'ops@swiftdelivery.com', phone: '+1 (555) 678-4444', company: 'Swift Delivery Co', category: 'Customer', notes: 'Last-mile delivery service' }
];

// Sample data - Deals (expanded with various stages and values)
const deals = [
  // Won deals
  { customer: 'Acme Corporation', value: 125000, stage: 'won', contact: 'John Smith', description: 'Enterprise software license', expectedCloseDate: new Date('2025-11-15'), closedDate: new Date('2025-11-20') },
  { customer: 'Acme Corporation', value: 45000, stage: 'won', contact: 'John Smith', description: 'Annual support contract', expectedCloseDate: new Date('2025-12-01'), closedDate: new Date('2025-12-05') },
  { customer: 'Global Enterprises', value: 89000, stage: 'won', contact: 'Maria Garcia', description: 'Global deployment package', expectedCloseDate: new Date('2025-10-20'), closedDate: new Date('2025-10-25') },
  { customer: 'Prime Partners', value: 156000, stage: 'won', contact: 'Robert Clark', description: 'Consulting engagement', expectedCloseDate: new Date('2025-09-30'), closedDate: new Date('2025-10-02') },
  { customer: 'Innovation Labs', value: 67500, stage: 'won', contact: 'Chris Wilson', description: 'R&D partnership', expectedCloseDate: new Date('2025-11-01'), closedDate: new Date('2025-11-08') },
  { customer: 'Metro Financial', value: 234000, stage: 'won', contact: 'James Lee', description: 'Financial platform integration', expectedCloseDate: new Date('2025-08-15'), closedDate: new Date('2025-08-20') },
  { customer: 'SecureNet Systems', value: 178000, stage: 'won', contact: 'Amanda Foster', description: 'Security suite deployment', expectedCloseDate: new Date('2025-12-10'), closedDate: new Date('2025-12-15') },
  { customer: 'Atlas Manufacturing', value: 95000, stage: 'won', contact: 'Tom Bradley', description: 'Manufacturing automation', expectedCloseDate: new Date('2025-07-20'), closedDate: new Date('2025-07-28') },
  { customer: 'Pinnacle Hotels', value: 112000, stage: 'won', contact: 'Diana Price', description: 'Hotel management system', expectedCloseDate: new Date('2025-11-25'), closedDate: new Date('2025-11-30') },
  
  // Negotiation deals
  { customer: 'Tech Solutions Ltd', value: 78500, stage: 'negotiation', contact: 'Sarah Johnson', description: 'Custom development project', expectedCloseDate: new Date('2026-01-15') },
  { customer: 'Cloud Nine Systems', value: 145000, stage: 'negotiation', contact: 'David Lee', description: 'Cloud migration services', expectedCloseDate: new Date('2026-01-20') },
  { customer: 'HealthTech Plus', value: 89000, stage: 'negotiation', contact: 'Dr. Emily White', description: 'Healthcare platform license', expectedCloseDate: new Date('2026-01-25') },
  { customer: 'DataCore Analytics', value: 67000, stage: 'negotiation', contact: 'Kevin Zhang', description: 'Analytics dashboard', expectedCloseDate: new Date('2026-02-01') },
  
  // Proposal deals
  { customer: 'Stellar Communications', value: 156000, stage: 'proposal', contact: 'Lisa Chen', description: 'Network infrastructure upgrade', expectedCloseDate: new Date('2026-02-15') },
  { customer: 'LogiTrans Corp', value: 92000, stage: 'proposal', contact: 'Mark Thompson', description: 'Supply chain optimization', expectedCloseDate: new Date('2026-02-20') },
  { customer: 'TrueVision Media', value: 48000, stage: 'proposal', contact: 'Rachel Adams', description: 'Marketing automation', expectedCloseDate: new Date('2026-02-28') },
  { customer: 'Pacific Retail Group', value: 134000, stage: 'proposal', contact: 'Steve Martinez', description: 'Retail POS system', expectedCloseDate: new Date('2026-03-01') },
  { customer: 'Swift Delivery Co', value: 56000, stage: 'proposal', contact: 'Nancy Wilson', description: 'Route optimization software', expectedCloseDate: new Date('2026-03-10') },
  
  // Lead deals
  { customer: 'StartUp Inc', value: 35000, stage: 'lead', contact: 'Emily Davis', description: 'Startup package', expectedCloseDate: new Date('2026-03-15') },
  { customer: 'Digital Dynamics', value: 42000, stage: 'lead', contact: 'Lisa Anderson', description: 'Digital transformation', expectedCloseDate: new Date('2026-03-20') },
  { customer: 'Bright Future Co', value: 28000, stage: 'lead', contact: 'Amy Taylor', description: 'Sustainability platform', expectedCloseDate: new Date('2026-04-01') },
  { customer: 'EcoGreen Industries', value: 75000, stage: 'lead', contact: 'Peter Green', description: 'Environmental monitoring', expectedCloseDate: new Date('2026-04-15') },
  { customer: 'MediaWave Studios', value: 58000, stage: 'lead', contact: 'Jennifer Stone', description: 'Content management system', expectedCloseDate: new Date('2026-04-20') },
  { customer: 'Quantum Computing Inc', value: 195000, stage: 'lead', contact: 'Dr. Alex Kumar', description: 'Quantum research tools', expectedCloseDate: new Date('2026-05-01') },
  { customer: 'Apex Legal Services', value: 44000, stage: 'lead', contact: 'Michelle Law', description: 'Legal case management', expectedCloseDate: new Date('2026-05-15') },
  
  // Lost deals (for realistic metrics)
  { customer: 'NextGen Solutions', value: 87000, stage: 'lost', contact: 'Jennifer White', description: 'AI platform - went with competitor', expectedCloseDate: new Date('2025-12-01'), closedDate: new Date('2025-12-10') },
  { customer: 'Tech Solutions Ltd', value: 32000, stage: 'lost', contact: 'Mike Brown', description: 'Budget constraints', expectedCloseDate: new Date('2025-11-15'), closedDate: new Date('2025-11-20') }
];

// Sample data - Tasks (expanded with various priorities and statuses)
const tasks = [
  // High priority tasks
  { title: 'Finalize Tech Solutions contract', customer: 'Tech Solutions Ltd', dueDate: new Date('2026-01-05'), priority: 'high', status: 'pending', description: 'Review and finalize contract terms for custom development project' },
  { title: 'Follow up with Cloud Nine', customer: 'Cloud Nine Systems', dueDate: new Date('2026-01-06'), priority: 'high', status: 'pending', description: 'Discuss pricing for cloud migration services' },
  { title: 'Demo for HealthTech Plus', customer: 'HealthTech Plus', dueDate: new Date('2026-01-08'), priority: 'high', status: 'pending', description: 'Prepare and conduct product demonstration' },
  { title: 'Proposal review with Stellar', customer: 'Stellar Communications', dueDate: new Date('2026-01-10'), priority: 'high', status: 'pending', description: 'Review network upgrade proposal' },
  
  // Medium priority tasks
  { title: 'Send quote to LogiTrans', customer: 'LogiTrans Corp', dueDate: new Date('2026-01-07'), priority: 'medium', status: 'pending', description: 'Prepare and send pricing quote for supply chain optimization' },
  { title: 'Schedule call with DataCore', customer: 'DataCore Analytics', dueDate: new Date('2026-01-09'), priority: 'medium', status: 'pending', description: 'Discuss analytics dashboard requirements' },
  { title: 'Update proposal for Pacific Retail', customer: 'Pacific Retail Group', dueDate: new Date('2026-01-12'), priority: 'medium', status: 'pending', description: 'Revise POS system proposal based on feedback' },
  { title: 'Introduction call with EcoGreen', customer: 'EcoGreen Industries', dueDate: new Date('2026-01-14'), priority: 'medium', status: 'pending', description: 'Initial discovery call for environmental monitoring needs' },
  { title: 'TrueVision requirements gathering', customer: 'TrueVision Media', dueDate: new Date('2026-01-15'), priority: 'medium', status: 'pending', description: 'Gather detailed requirements for marketing automation' },
  
  // Low priority tasks
  { title: 'Send thank you email to Acme', customer: 'Acme Corporation', dueDate: new Date('2025-12-28'), priority: 'low', status: 'completed', description: 'Thank you for continued partnership' },
  { title: 'Update CRM records for Metro', customer: 'Metro Financial', dueDate: new Date('2025-12-30'), priority: 'low', status: 'completed', description: 'Update contact information and deal history' },
  { title: 'Research Quantum Computing needs', customer: 'Quantum Computing Inc', dueDate: new Date('2026-01-16'), priority: 'low', status: 'pending', description: 'Research their specific quantum research requirements' },
  { title: 'Connect with Apex Legal team', customer: 'Apex Legal Services', dueDate: new Date('2026-01-18'), priority: 'low', status: 'pending', description: 'LinkedIn connection and introduction' },
  { title: 'Prepare case study from Pinnacle', customer: 'Pinnacle Hotels', dueDate: new Date('2026-01-20'), priority: 'low', status: 'pending', description: 'Create success story case study' },
  { title: 'Quarterly review prep for Prime', customer: 'Prime Partners', dueDate: new Date('2026-01-25'), priority: 'low', status: 'pending', description: 'Prepare materials for quarterly business review' },
  
  // Completed tasks (for realistic tracking)
  { title: 'Contract signed with SecureNet', customer: 'SecureNet Systems', dueDate: new Date('2025-12-14'), priority: 'high', status: 'completed', description: 'Security suite contract finalization' },
  { title: 'Kickoff meeting with Pinnacle', customer: 'Pinnacle Hotels', dueDate: new Date('2025-11-28'), priority: 'medium', status: 'completed', description: 'Project kickoff for hotel management system' },
  { title: 'Demo completed for Atlas', customer: 'Atlas Manufacturing', dueDate: new Date('2025-07-15'), priority: 'high', status: 'completed', description: 'Manufacturing automation demo' },
  { title: 'Proposal sent to Innovation Labs', customer: 'Innovation Labs', dueDate: new Date('2025-10-25'), priority: 'medium', status: 'completed', description: 'R&D partnership proposal' }
];

const seedDatabase = async () => {
  try {
    // Connect to database
    await connectDB();
    console.log('\n🌱 Starting database seed...\n');

    // Clear existing data
    await User.deleteMany({});
    await Customer.deleteMany({});
    await Deal.deleteMany({});
    await Task.deleteMany({});
    console.log('✓ Cleared existing data');

    // Create users
    const createdUsers = await User.create(users);
    console.log(`✓ Created ${createdUsers.length} users`);

    // Create customers
    const createdCustomers = await Customer.create(customers);
    console.log(`✓ Created ${createdCustomers.length} customers`);

    // Create deals
    const createdDeals = await Deal.create(deals);
    console.log(`✓ Created ${createdDeals.length} deals`);

    // Create tasks
    const createdTasks = await Task.create(tasks);
    console.log(`✓ Created ${createdTasks.length} tasks`);

    console.log('\n✅ Database seeded successfully!\n');
    console.log('Test credentials:');
    console.log('  Email: admin@clientcore.com');
    console.log('  Password: admin123\n');
    console.log('  Email: user@clientcore.com');
    console.log('  Password: user123\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
};

seedDatabase();