
import express from 'express';
import cors from 'cors';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { db, initializeDatabase } from './db/index';
import { users, experiments, experimentNotes, experimentNoteAttachments, calendarEvents, experimentIdeas, ideaNotes } from './db/schema';
import { eq, and, desc, asc } from 'drizzle-orm';

const app = express();
const PORT = process.env.PORT || 3001;
const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));

// Initialize database
initializeDatabase();

// Auth middleware
const authenticateToken = (req: any, res: any, next: any) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.sendStatus(401);
  }

  jwt.verify(token, JWT_SECRET, (err: any, user: any) => {
    if (err) return res.sendStatus(403);
    req.user = user;
    next();
  });
};

// Auth routes
app.post('/api/auth/signup', async (req, res) => {
  try {
    const { email, password, firstName, lastName } = req.body;
    
    // Check if user exists
    const existingUser = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (existingUser.length > 0) {
      return res.status(400).json({ error: 'User already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const newUser = await db.insert(users).values({
      email,
      password: hashedPassword,
      firstName,
      lastName,
    }).returning();

    const token = jwt.sign({ userId: newUser[0].id, email }, JWT_SECRET);
    
    res.json({ 
      user: { 
        id: newUser[0].id, 
        email: newUser[0].email,
        user_metadata: {
          first_name: newUser[0].firstName,
          last_name: newUser[0].lastName
        }
      }, 
      session: { access_token: token }
    });
  } catch (error) {
    console.error('Signup error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signin', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Find user
    const user = await db.select().from(users).where(eq(users.email, email)).limit(1);
    if (user.length === 0) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    // Check password
    const validPassword = await bcrypt.compare(password, user[0].password);
    if (!validPassword) {
      return res.status(400).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ userId: user[0].id, email }, JWT_SECRET);
    
    res.json({ 
      user: { 
        id: user[0].id, 
        email: user[0].email,
        user_metadata: {
          first_name: user[0].firstName,
          last_name: user[0].lastName
        }
      }, 
      session: { access_token: token }
    });
  } catch (error) {
    console.error('Signin error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/auth/signout', authenticateToken, (req, res) => {
  res.json({ success: true });
});

app.get('/api/auth/user', authenticateToken, async (req, res) => {
  try {
    const user = await db.select().from(users).where(eq(users.id, req.user.userId)).limit(1);
    if (user.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ 
      user: { 
        id: user[0].id, 
        email: user[0].email,
        user_metadata: {
          first_name: user[0].firstName,
          last_name: user[0].lastName
        }
      }
    });
  } catch (error) {
    console.error('Get user error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Experiments routes
app.get('/api/experiments', authenticateToken, async (req, res) => {
  try {
    const userExperiments = await db.select().from(experiments)
      .where(eq(experiments.userId, req.user.userId))
      .orderBy(asc(experiments.displayOrder));
    
    res.json(userExperiments);
  } catch (error) {
    console.error('Get experiments error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/experiments', authenticateToken, async (req, res) => {
  try {
    const experimentData = { ...req.body, userId: req.user.userId };
    const newExperiment = await db.insert(experiments).values(experimentData).returning();
    res.json(newExperiment[0]);
  } catch (error) {
    console.error('Create experiment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.put('/api/experiments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updatedExperiment = await db.update(experiments)
      .set({ ...req.body, updatedAt: new Date().toISOString() })
      .where(and(eq(experiments.id, id), eq(experiments.userId, req.user.userId)))
      .returning();
    
    if (updatedExperiment.length === 0) {
      return res.status(404).json({ error: 'Experiment not found' });
    }
    
    res.json(updatedExperiment[0]);
  } catch (error) {
    console.error('Update experiment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.delete('/api/experiments/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await db.delete(experiments)
      .where(and(eq(experiments.id, id), eq(experiments.userId, req.user.userId)));
    
    res.json({ success: true });
  } catch (error) {
    console.error('Delete experiment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
