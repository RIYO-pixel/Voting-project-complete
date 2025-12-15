// ================================
// MongoDB Schema for Voting_project
// ================================

// Switch to database
use(Voting_project);

// ================================
// 1️⃣ election_officers Collection
// ================================
db.createCollection("election_officers", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "username", "password"],
      properties: {
        _id: {
          bsonType: "string"   // email_id as primary key
        },
        constituency_no: {
          bsonType: "string"
        },
        part_no: {
          bsonType: "string"
        },
        officer_constituency: {
          bsonType: "string"
        },
        officer_name: {
          bsonType: "string"
        },
        username: {
          bsonType: "string"
        },
        password: {
          bsonType: "string"
        }
      }
    }
  }
});



// ================================
// 2️⃣ voters Collection
// ================================
db.createCollection("voters", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["_id", "name", "age", "aadhar_no", "has_voted"],
      properties: {
        _id: {
          bsonType: "string"   // epic_no as primary key
        },
        constituency_no: {
          bsonType: "string"
        },
        part_no: {
          bsonType: "string"
        },
        name: {
          bsonType: "string"
        },
        age: {
          bsonType: "int"
        },
        aadhar_no: {
          bsonType: "string"
        },
        has_voted: {
          bsonType: "bool"
        }
      }
    }
  }
});

// Unique constraint on aadhar_no
db.voters.createIndex({ aadhar_no: 1 }, { unique: true });


// ================================
// 3️⃣ voter_face_data Collection
// ================================
db.createCollection("voter_face_data", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "epic_no", "face_data"],
      properties: {
        id: {
          bsonType: "long"   // BIGINT equivalent
        },
        epic_no: {
          bsonType: "string"
        },
        face_data: {
          bsonType: "object"   // JSON stored as object
        }
      }
    }
  }
});


// ================================
// ✅ SCHEMA CREATION COMPLETE ✅
// ================================

print("✅ Voting_project MongoDB schema created successfully!");
