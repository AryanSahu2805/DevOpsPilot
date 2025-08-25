// MongoDB initialization script
db = db.getSiblingDB('devops_pilot');

// Create collections
db.createCollection('users');
db.createCollection('metrics');
db.createCollection('alerts');
db.createCollection('deployments');
db.createCollection('configurations');

// Create indexes
db.users.createIndex({ "email": 1 }, { unique: true });
db.metrics.createIndex({ "timestamp": 1, "service": 1 });
db.alerts.createIndex({ "severity": 1, "timestamp": -1 });
db.deployments.createIndex({ "status": 1, "created_at": -1 });

// Insert sample data
db.users.insertOne({
    email: "admin@devopspilot.com",
    username: "admin",
    full_name: "System Administrator",
    hashed_password: "$2b$12$EixZaYVK1fsbw1ZfbX3OXePaWxn96p36WQoeG6Lruj3vjPGga31lW",
    is_active: true,
    is_superuser: true,
    created_at: new Date(),
    roles: ["admin", "user"]
});

print("✅ DevOps Pilot database initialized successfully");
