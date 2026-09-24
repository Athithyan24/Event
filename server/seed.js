const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const mongoose = require('mongoose');

const Department = require('./models/Department');
const User = require('./models/User');
const Venue = require('./models/Venue');
const Equipment = require('./models/Equipment');
const Event = require('./models/Event');
const EquipmentAllocation = require('./models/EquipmentAllocation');
const Participant = require('./models/Participant');
const Feedback = require('./models/Feedback');
const Certificate = require('./models/Certificate');
const Timeline = require('./models/Timeline');
const Notification = require('./models/Notification');
const Announcement = require('./models/Announcement');
const ActivityLog = require('./models/ActivityLog');
const ResourceLog = require('./models/ResourceLog');

const unsplash = (id) =>
  `https://images.unsplash.com/${id}?auto=format&fit=crop&w=1200&q=80`;

async function seed() {
  await mongoose.connect(process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/aura_events');
  console.log('Seeding Aura campus...');

  await Promise.all([
    Department.deleteMany({}),
    User.deleteMany({}),
    Venue.deleteMany({}),
    Equipment.deleteMany({}),
    Event.deleteMany({}),
    EquipmentAllocation.deleteMany({}),
    Participant.deleteMany({}),
    Feedback.deleteMany({}),
    Certificate.deleteMany({}),
    Timeline.deleteMany({}),
    Notification.deleteMany({}),
    Announcement.deleteMany({}),
    ActivityLog.deleteMany({}),
    ResourceLog.deleteMany({}),
  ]);

  const depts = await Department.insertMany([
    { name: 'Computer Science', code: 'CSE', head: 'Dr. Meera Nair', color: '#1d4ed8', description: 'Computing, AI and software systems.' },
    { name: 'Information Technology', code: 'IT', head: 'Prof. Arjun Rao', color: '#0f766e', description: 'Networks, data and digital services.' },
    { name: 'Electronics', code: 'ECE', head: 'Dr. Kavya Iyer', color: '#7c3aed', description: 'Circuits, embedded and communications.' },
    { name: 'Mechanical', code: 'ME', head: 'Prof. R. Krishnan', color: '#b45309', description: 'Design, manufacturing and thermofluids.' },
    { name: 'Civil', code: 'CE', head: 'Dr. Anil Menon', color: '#365314', description: 'Structures, environment and planning.' },
    { name: 'Management Studies', code: 'MBA', head: 'Dr. Sneha Kapoor', color: '#9f1239', description: 'Leadership, strategy and operations.' },
    { name: 'Administration', code: 'ADM', head: 'Registrar Office', color: '#111111', description: 'Campus administration and coordination.' },
  ]);

  const byCode = Object.fromEntries(depts.map((d) => [d.code, d]));

  const admin = await User.create({
    name: 'Aanya Sharma',
    username: 'admin',
    email: 'admin@aura.edu',
    password: 'Aura@123',
    role: 'admin',
    department: byCode.ADM._id,
    phone: '+91 98000 11111',
  });

  const users = await User.create([
    {
      name: 'Rohan Desai',
      username: 'cse.rohan',
      email: 'cse@aura.edu',
      password: 'Aura@123',
      role: 'department',
      department: byCode.CSE._id,
    },
    {
      name: 'Nila Thomas',
      username: 'it.nila',
      email: 'it@aura.edu',
      password: 'Aura@123',
      role: 'department',
      department: byCode.IT._id,
    },
    {
      name: 'Vikram Shah',
      username: 'mba.vikram',
      email: 'mba@aura.edu',
      password: 'Aura@123',
      role: 'coordinator',
      department: byCode.MBA._id,
    },
    {
      name: 'Priya Menon',
      username: 'ece.priya',
      email: 'ece@aura.edu',
      password: 'Aura@123',
      role: 'department',
      department: byCode.ECE._id,
    },
  ]);

  const venues = await Venue.insertMany([
    {
      name: 'Main Auditorium',
      location: 'East Plaza',
      building: 'Heritage Block',
      capacity: 800,
      facilities: ['Stage', 'Lighting grid', 'Green rooms', 'AC'],
      image: unsplash('photo-1511578314322-379afb476865'),
      status: 'available',
    },
    {
      name: 'Seminar Hall A',
      location: 'Level 2',
      building: 'Academic Tower',
      capacity: 180,
      facilities: ['Projector', 'Podium', 'WiFi'],
      image: unsplash('photo-1503428593586-e225b39bddfe'),
      status: 'available',
    },
    {
      name: 'Conference Hall',
      location: 'Level 4',
      building: 'Admin Wing',
      capacity: 60,
      facilities: ['Board table', 'Video conferencing'],
      image: unsplash('photo-1431540012817-5f471eeea438'),
      status: 'available',
    },
    {
      name: 'Computer Lab 3',
      location: 'Level 1',
      building: 'CSE Block',
      capacity: 40,
      facilities: ['Workstations', 'UPS', 'Projector'],
      image: unsplash('photo-1516321318423-f06f85e504b3'),
      status: 'available',
    },
    {
      name: 'Open Ground',
      location: 'North Lawn',
      building: 'Campus Green',
      capacity: 2000,
      facilities: ['Power points', 'Stage option'],
      image: unsplash('photo-1506157786151-b8491531f357'),
      status: 'available',
    },
    {
      name: 'Meeting Room 12',
      location: 'Level 3',
      building: 'Admin Wing',
      capacity: 14,
      facilities: ['Display', 'Whiteboard'],
      image: unsplash('photo-1497366216548-37526070297c'),
      status: 'maintenance',
    },
  ]);

  const equipment = await Equipment.insertMany([
    { name: 'Projector', category: 'AV', totalQuantity: 10 },
    { name: 'Speaker System', category: 'AV', totalQuantity: 8 },
    { name: 'LED Display', category: 'AV', totalQuantity: 4 },
    { name: 'Microphone', category: 'AV', totalQuantity: 20 },
    { name: 'Laptop', category: 'Computing', totalQuantity: 15 },
    { name: 'UPS', category: 'Power', totalQuantity: 6 },
    { name: 'Extension Board', category: 'Power', totalQuantity: 25 },
    { name: 'Camera', category: 'Media', totalQuantity: 5 },
    { name: 'Podium', category: 'Stage', totalQuantity: 4 },
    { name: 'Printer', category: 'Office', totalQuantity: 3 },
    { name: 'WiFi Router', category: 'Network', totalQuantity: 8 },
  ]);

  const eq = Object.fromEntries(equipment.map((e) => [e.name, e]));
  const today = new Date();
  const day = (offset, hour = 10) => {
    const d = new Date(today);
    d.setDate(d.getDate() + offset);
    d.setHours(0, 0, 0, 0);
    return d;
  };

  const e1 = await Event.create({
    title: 'Frontier AI Guest Lecture',
    type: 'Guest Lecture',
    description: 'An industry lecture on applied machine learning for campus researchers.',
    department: byCode.CSE._id,
    organizer: users[0]._id,
    expectedAudience: 160,
    actualAudience: 0,
    date: day(3),
    startTime: '10:00',
    endTime: '12:00',
    venue: venues[1]._id,
    equipment: [
      { item: eq.Projector._id, quantity: 1 },
      { item: eq.Microphone._id, quantity: 3 },
    ],
    status: 'pending',
    budget: { planned: 25000, actual: 0, sponsorship: 5000, expenditure: 0 },
    guestSpeakers: [{ name: 'Dr. Leena Varghese', title: 'Principal Scientist, Aether Labs' }],
    coverImage: unsplash('photo-1540575467063-178a50c2df87'),
  });

  const e2 = await Event.create({
    title: 'Placement Drive — Northwind',
    type: 'Placement Drive',
    description: 'Day-one interviews for final year IT and CSE cohorts.',
    department: byCode.IT._id,
    organizer: users[1]._id,
    expectedAudience: 220,
    date: day(6),
    startTime: '09:00',
    endTime: '16:00',
    venue: venues[0]._id,
    equipment: [
      { item: eq['Laptop']._id, quantity: 8 },
      { item: eq['LED Display']._id, quantity: 2 },
    ],
    status: 'approved',
    reviewedBy: admin._id,
    reviewedAt: new Date(),
    budget: { planned: 80000, actual: 12000, sponsorship: 40000, expenditure: 12000 },
    coverImage: unsplash('photo-1551836022-d5d88e9218df'),
  });

  const e3 = await Event.create({
    title: 'Design Thinking Workshop',
    type: 'Workshop',
    description: 'A hands-on workshop for MBA students on product discovery.',
    department: byCode.MBA._id,
    organizer: users[2]._id,
    expectedAudience: 48,
    date: day(-4),
    startTime: '14:00',
    endTime: '17:00',
    venue: venues[2]._id,
    equipment: [{ item: eq['Extension Board']._id, quantity: 6 }],
    status: 'completed',
    actualAudience: 46,
    budget: { planned: 18000, actual: 16500, sponsorship: 0, expenditure: 16500 },
    coverImage: unsplash('photo-1552664730-d307ca884978'),
  });

  const e4 = await Event.create({
    title: 'Embedded Systems Lab Demo',
    type: 'Seminar',
    description: 'Live demo of student hardware prototypes.',
    department: byCode.ECE._id,
    organizer: users[3]._id,
    expectedAudience: 35,
    date: day(1),
    startTime: '11:00',
    endTime: '13:00',
    venue: venues[3]._id,
    equipment: [{ item: eq.Projector._id, quantity: 1 }],
    status: 'approved',
    coverImage: unsplash('photo-1581091226825-a6a2a5aee158'),
  });

  await EquipmentAllocation.insertMany([
    { event: e1._id, equipment: eq.Projector._id, quantity: 1, date: e1.date, startTime: e1.startTime, endTime: e1.endTime },
    { event: e1._id, equipment: eq.Microphone._id, quantity: 3, date: e1.date, startTime: e1.startTime, endTime: e1.endTime },
    { event: e2._id, equipment: eq.Laptop._id, quantity: 8, date: e2.date, startTime: e2.startTime, endTime: e2.endTime },
    { event: e2._id, equipment: eq['LED Display']._id, quantity: 2, date: e2.date, startTime: e2.startTime, endTime: e2.endTime },
    { event: e4._id, equipment: eq.Projector._id, quantity: 1, date: e4.date, startTime: e4.startTime, endTime: e4.endTime },
  ]);

  await Timeline.insertMany([
    { event: e1._id, action: 'Created', detail: 'Submitted for approval', actor: users[0]._id },
    { event: e2._id, action: 'Created', detail: 'Submitted for approval', actor: users[1]._id },
    { event: e2._id, action: 'Approved', detail: 'Resources reserved', actor: admin._id },
    { event: e3._id, action: 'Created', detail: 'Submitted for approval', actor: users[2]._id },
    { event: e3._id, action: 'Approved', detail: 'Greenlit', actor: admin._id },
    { event: e3._id, action: 'Completed', detail: 'Closure recorded', actor: users[2]._id },
  ]);

  await Participant.insertMany([
    { event: e3._id, name: 'Aditi Rao', email: 'aditi@aura.edu', attended: true, role: 'attendee', department: 'MBA' },
    { event: e3._id, name: 'Farhan Qureshi', email: 'farhan@aura.edu', attended: true, role: 'attendee', department: 'MBA' },
    { event: e3._id, name: 'Prof. Helen Cho', email: 'helen@studio.co', attended: true, role: 'speaker' },
    { event: e2._id, name: 'Campus Placement Cell', role: 'volunteer', attended: false },
  ]);

  await Feedback.insertMany([
    { event: e3._id, authorName: 'Aditi Rao', rating: 5, comment: 'Tightly facilitated. Loved the case.', suggestion: 'More time for critique.' },
    { event: e3._id, authorName: 'Farhan Qureshi', rating: 4, comment: 'Useful frameworks.', suggestion: '' },
  ]);

  await Certificate.create({
    event: e3._id,
    participantName: 'Aditi Rao',
    certificateId: 'AURA-SEED01',
  });

  await Notification.insertMany([
    {
      user: users[0]._id,
      title: 'Request received',
      message: 'Frontier AI Guest Lecture is awaiting review.',
      type: 'system',
      link: `/app/events/${e1._id}`,
    },
    {
      user: users[1]._id,
      title: 'Event approved',
      message: 'Placement Drive — Northwind is approved.',
      type: 'approval',
      link: `/app/events/${e2._id}`,
    },
    {
      user: admin._id,
      title: 'Pending approval',
      message: '1 event request is waiting in the queue.',
      type: 'approval',
      link: '/app/approvals',
    },
  ]);

  await Announcement.create({
    title: 'Auditorium blackout window',
    body: 'Main Auditorium lighting retrofit on 30 Sep, 18:00–22:00. No bookings in that window.',
    audience: 'all',
    author: admin._id,
    pinned: true,
  });

  console.log('Seed complete.');
  console.log('Admin     admin@aura.edu  / Aura@123');
  console.log('CSE user  cse@aura.edu    / Aura@123');
  console.log('IT user   it@aura.edu     / Aura@123');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});
