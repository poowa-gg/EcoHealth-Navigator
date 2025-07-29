const express = require('express');
const cors = require('cors');
const axios = require('axios');
const { Server } = require('socket.io');
const http = require('http');
const path = require('path');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, '../client')));

// Mock user data
const users = new Map();
const communities = new Map();

// Serve the main client page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, '../client/index.html'));
});

// AI Health Recommendation Engine
class HealthRecommendationEngine {
  static generateRecommendations(environmentalData, userProfile) {
    const recommendations = [];
    
    // Air Quality Recommendations
    if (environmentalData.aqi > 100) {
      recommendations.push({
        type: 'air_quality',
        severity: 'high',
        message: 'Air quality is unhealthy. Consider indoor activities and wear a mask outdoors.',
        action: 'Stay indoors during peak pollution hours (6-10 AM, 6-9 PM)'
      });
    } else if (environmentalData.aqi > 50) {
      recommendations.push({
        type: 'air_quality',
        severity: 'moderate',
        message: 'Air quality is moderate. Sensitive individuals should limit outdoor activities.',
        action: 'Consider shorter outdoor workouts and check air quality before exercising'
      });
    }

    // UV Index Recommendations
    if (environmentalData.uvIndex > 7) {
      recommendations.push({
        type: 'uv_protection',
        severity: 'high',
        message: 'Very high UV index. Use SPF 30+ sunscreen and seek shade.',
        action: 'Avoid outdoor activities between 10 AM - 4 PM'
      });
    }

    // Pollen Recommendations
    if (environmentalData.pollenCount > 50 && userProfile.allergies?.includes('pollen')) {
      recommendations.push({
        type: 'allergy',
        severity: 'moderate',
        message: 'High pollen count detected. Consider taking allergy medication.',
        action: 'Keep windows closed and shower after being outdoors'
      });
    }

    // Exercise Recommendations
    const exerciseScore = this.calculateExerciseScore(environmentalData);
    recommendations.push({
      type: 'exercise',
      severity: exerciseScore > 70 ? 'low' : 'moderate',
      message: `Exercise conditions are ${exerciseScore > 70 ? 'good' : 'fair'}`,
      action: exerciseScore > 70 ? 'Great day for outdoor activities!' : 'Consider indoor exercise or shorter outdoor sessions'
    });

    return recommendations;
  }

  static calculateExerciseScore(data) {
    let score = 100;
    score -= Math.max(0, (data.aqi - 50) * 0.5);
    score -= Math.max(0, (data.uvIndex - 5) * 5);
    score -= Math.max(0, (data.temperature - 85) * 2);
    score += Math.min(20, data.humidity < 60 ? 10 : 0);
    return Math.max(0, Math.min(100, score));
  }
}

// Community Challenge System
class CommunityEngine {
  static createChallenge(communityId, challengeData) {
    if (!communities.has(communityId)) {
      communities.set(communityId, {
        id: communityId,
        members: [],
        challenges: [],
        stats: { totalPoints: 0, environmentalImpact: 0 }
      });
    }

    const challenge = {
      id: Date.now().toString(),
      ...challengeData,
      participants: [],
      progress: 0,
      createdAt: new Date()
    };

    communities.get(communityId).challenges.push(challenge);
    return challenge;
  }

  static joinChallenge(userId, communityId, challengeId) {
    const community = communities.get(communityId);
    if (!community) return null;

    const challenge = community.challenges.find(c => c.id === challengeId);
    if (!challenge) return null;

    if (!challenge.participants.includes(userId)) {
      challenge.participants.push(userId);
    }

    return challenge;
  }
}

// Mock environmental data (in real app, this would come from IoT sensors + APIs)
function generateMockEnvironmentalData(location) {
  return {
    location,
    timestamp: new Date(),
    aqi: Math.floor(Math.random() * 150) + 20,
    temperature: Math.floor(Math.random() * 40) + 60,
    humidity: Math.floor(Math.random() * 60) + 30,
    uvIndex: Math.floor(Math.random() * 10) + 1,
    pollenCount: Math.floor(Math.random() * 100),
    windSpeed: Math.floor(Math.random() * 20) + 5,
    visibility: Math.floor(Math.random() * 10) + 1
  };
}

// API Routes
app.get('/api/health-recommendations/:userId', async (req, res) => {
  try {
    const userId = req.params.userId;
    const location = req.query.location || 'default';
    
    // Get user profile (mock data)
    const userProfile = users.get(userId) || {
      id: userId,
      allergies: ['pollen'],
      healthConditions: [],
      activityLevel: 'moderate'
    };

    // Get environmental data
    const environmentalData = generateMockEnvironmentalData(location);
    
    // Generate AI recommendations
    const recommendations = HealthRecommendationEngine.generateRecommendations(
      environmentalData, 
      userProfile
    );

    res.json({
      success: true,
      data: {
        environmentalData,
        recommendations,
        userProfile: { id: userId, activityLevel: userProfile.activityLevel }
      }
    });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});

app.get('/api/community/:communityId/challenges', (req, res) => {
  const communityId = req.params.communityId;
  const community = communities.get(communityId);
  
  if (!community) {
    // Create default community with sample challenges
    const newCommunity = {
      id: communityId,
      name: 'Green Valley Neighborhood',
      members: [],
      challenges: [
        {
          id: '1',
          title: 'Clean Air Week Challenge',
          description: 'Walk or bike instead of driving for one week',
          type: 'transportation',
          goal: 100,
          progress: 67,
          participants: ['user1', 'user2', 'user3'],
          reward: 'Community air purifier fund',
          endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        },
        {
          id: '2',
          title: 'Neighborhood Tree Planting',
          description: 'Plant 50 trees in our community',
          type: 'environmental',
          goal: 50,
          progress: 32,
          participants: ['user1', 'user4', 'user5'],
          reward: 'Improved air quality for all',
          endDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
        }
      ],
      stats: { totalPoints: 1250, environmentalImpact: 85 }
    };
    communities.set(communityId, newCommunity);
  }

  res.json({
    success: true,
    data: communities.get(communityId)
  });
});

app.post('/api/community/:communityId/join-challenge', (req, res) => {
  const { communityId } = req.params;
  const { userId, challengeId } = req.body;

  const challenge = CommunityEngine.joinChallenge(userId, communityId, challengeId);
  
  if (challenge) {
    // Emit real-time update
    io.to(communityId).emit('challengeUpdate', challenge);
    res.json({ success: true, data: challenge });
  } else {
    res.status(404).json({ success: false, error: 'Challenge not found' });
  }
});

app.get('/api/environmental-data/:location', (req, res) => {
  const location = req.params.location;
  const data = generateMockEnvironmentalData(location);
  
  res.json({
    success: true,
    data
  });
});

// Socket.IO for real-time updates
io.on('connection', (socket) => {
  console.log('User connected:', socket.id);

  socket.on('joinCommunity', (communityId) => {
    socket.join(communityId);
    console.log(`User ${socket.id} joined community ${communityId}`);
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });
});

// Simulate real-time environmental updates
setInterval(() => {
  const locations = ['downtown', 'suburbs', 'industrial'];
  locations.forEach(location => {
    const data = generateMockEnvironmentalData(location);
    io.emit('environmentalUpdate', { location, data });
  });
}, 30000); // Every 30 seconds

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`🌱 EcoHealth Navigator Server running on port ${PORT}`);
  console.log(`🚀 Ready to serve health recommendations and community challenges!`);
});