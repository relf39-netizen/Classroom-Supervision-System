# Security Specification - ระบบนิเทศชั้นเรียนออนไลน์

## Data Invariants
1. A user profile must have a valid role (ADMIN, DIRECTOR, TEACHER).
2. An Observation must be linked to a valid Teacher and Observer.
3. Scores must be bound to an existing Observation.
4. Only Admin can manage (CRUD) teachers, academic years, and evaluation items.
5. Directors can create and edit observations.
6. Teachers can only read their own observation results.

## The "Dirty Dozen" Payloads (Denial Tests)
1. Anonymous user attempting to read users collection.
2. Teacher attempting to update their own role to ADMIN.
3. Director attempting to delete a teacher record.
4. User attempting to create an observation with a future date (if restricted).
5. User attempting to create an observation for a non-existent teacher.
6. Teacher attempting to read another teacher's observation.
7. Director attempting to edit an observation they didn't create (unless super-director).
8. Admin attempting to set a score > maxScore.
9. Attacker injecting a 2MB string as observation suggestions.
10. Attacker attempting to create a user with a spoofed UID.
11. Attacker attempting to delete an academic year during a session.
12. User attempting to write to System-Only fields.

## Role Helpers
- `isAdmin()`: `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "ADMIN"`
- `isDirector()`: `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "DIRECTOR"`
- `isTeacher()`: `get(/databases/$(database)/documents/users/$(request.auth.uid)).data.role == "TEACHER"`
