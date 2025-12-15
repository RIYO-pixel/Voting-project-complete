# Voting-project

use voting_project;

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
})


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
})

db.voters.createIndex({ aadhar_no: 1 }, { unique: true })


db.createCollection("voter_face_data", {
  validator: {
    $jsonSchema: {
      bsonType: "object",
      required: ["id", "epic_no", "face_data"],
      properties: {
        id: {
          bsonType: "long"
        },
        epic_no: {
          bsonType: "string"
        },
        face_data: {
          bsonType: "object"
        }
      }
    }
  }
})


USER CREATION

 use admin

 db.getUsers()
{ users: [], ok: 1 }
db.createUser({
...   user: "Sanket",
...   pwd: "Sanket7044",
...   roles: [
...     { role: "root", db: "admin" }
...   ]
... })
...

db.getUsers()"# Voting-project-complete" 
